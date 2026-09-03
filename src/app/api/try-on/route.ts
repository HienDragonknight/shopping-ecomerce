export const maxDuration = 60; // Max allowed serverless duration (seconds) for AI processing
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || "";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://fashionweb.fmate.id.vn/api";

const IDM_VTON_VERSION = "0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985";
const OOTDIFFUSION_VERSION = "9f8fa4956970dde99689af7488157a30aa152e23953526a605df1d77598343d7";

/**
 * POST /api/try-on
 * Multi-model virtual try-on API endpoint supporting IDM-VTON, OOTDiffusion, OpenAI, and Backend Proxy.
 */
export async function POST(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin || "https://fashionweb.fmate.id.vn";
    const formData = await req.formData();
    const personImageFile = formData.get("personImage") as File | null;
    const garmentImageFile = formData.get("garmentImage") as File | null;
    const garmentImageUrl = (formData.get("garmentImageUrl") as string | null) || "";
    const productId = formData.get("productId") as string | null;
    const productName = (formData.get("productName") as string | null) || "Trang phục";
    const category = (formData.get("category") as string | null) || "dresses";
    const modelType = (formData.get("modelType") as string | null) || "IDM_VTON";
    const authToken = formData.get("authToken") as string | null;

    if (!personImageFile) {
      return NextResponse.json({ error: "Thiếu ảnh cá nhân của bạn" }, { status: 400 });
    }

    // ── Save PENDING record to Spring Boot backend if auth token present ──────
    let historyId: number | null = null;
    if (authToken) {
      try {
        const beRes = await fetch(`${BACKEND_URL}/try-on/history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            productId: productId ? parseInt(productId) : null,
            productName: productName || null,
            originalImageUrl: garmentImageUrl || null,
          }),
        });
        if (beRes.ok) {
          const beData = await beRes.json();
          historyId = beData.data?.id ?? null;
        }
      } catch (e) {
        console.warn("[TryOn] Failed to save PENDING to backend:", e);
      }
    }

    let resultUrl = "";

    // ── 1. If REPLICATE_API_TOKEN is configured in Next.js, process directly ──
    if (REPLICATE_API_TOKEN && (modelType === "IDM_VTON" || modelType === "OOTDIFFUSION")) {
      try {
        resultUrl = await handleReplicateTryOn({
          personImageFile,
          garmentImageFile,
          garmentImageUrl,
          productName,
          category,
          modelType,
          origin,
        });
      } catch (localErr) {
        console.warn("[TryOn] Local Replicate processing failed, trying Backend fallback:", localErr);
        // Fallback to Backend if available
        resultUrl = await forwardToBackend({
          personImageFile,
          garmentImageFile,
          garmentImageUrl,
          productName,
          category,
          modelType,
          authToken,
        });
      }
    } else if (!REPLICATE_API_TOKEN && BACKEND_URL) {
      // ── 2. If no local Replicate token, forward multipart directly to Backend ──
      try {
        resultUrl = await forwardToBackend({
          personImageFile,
          garmentImageFile,
          garmentImageUrl,
          productName,
          category,
          modelType,
          authToken,
        });
      } catch (beErr) {
        console.warn("[TryOn] Backend forwarding failed:", beErr);
        // Fallback to OpenAI if key exists
        if (OPENAI_API_KEY) {
          resultUrl = await handleOpenAiTryOn({
            personImageFile,
            garmentImageUrl,
            productName,
            origin,
          });
        } else {
          throw new Error(
            "Chưa cấu hình API Key AI (Vui lòng thiết lập REPLICATE_API_TOKEN trên Vercel hoặc cấu hình Backend URL)"
          );
        }
      }
    } else {
      // ── 3. Fallback to OpenAI Image Edit ──
      if (!OPENAI_API_KEY) {
        return NextResponse.json(
          { error: "Chưa cấu hình API Key cho AI (REPLICATE_API_TOKEN hoặc OPENAI_API_KEY)" },
          { status: 500 }
        );
      }
      resultUrl = await handleOpenAiTryOn({
        personImageFile,
        garmentImageUrl,
        productName,
        origin,
      });
    }

    // ── Update BE record to COMPLETED ─────────────────────────────────────────
    if (historyId && authToken && resultUrl) {
      await updateBackendRecord(historyId, authToken, resultUrl, "COMPLETED", null, BACKEND_URL);
    }

    return NextResponse.json({
      resultUrl,
      historyId,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định khi ghép đồ";
    console.error("[TryOn] API error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── Helper: Download image buffer from local file, data URI, or remote URL ────

async function fetchImageBuffer(urlOrPath: string, origin: string): Promise<Buffer> {
  if (urlOrPath.startsWith("data:")) {
    const commaIdx = urlOrPath.indexOf(",");
    const base64Data = commaIdx >= 0 ? urlOrPath.substring(commaIdx + 1) : urlOrPath;
    return Buffer.from(base64Data, "base64");
  }

  // 1. Try reading local public directory if relative path
  if (urlOrPath.startsWith("/")) {
    try {
      const localPath = path.join(process.cwd(), "public", urlOrPath);
      if (fs.existsSync(localPath)) {
        return fs.readFileSync(localPath);
      }
    } catch (e) {
      console.warn("[fetchImageBuffer] Local fs read failed:", e);
    }
  }

  // 2. Fetch via HTTP(S)
  let fetchUrl = urlOrPath;
  if (urlOrPath.startsWith("/")) {
    fetchUrl = `${origin.replace(/\/$/, "")}${urlOrPath}`;
  }

  const res = await fetch(fetchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "image/*, */*",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`Không thể tải ảnh trang phục từ URL (HTTP ${res.status}): ${fetchUrl}`);
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

function resolveCategory(cat: string | null, name: string | null): "upper_body" | "lower_body" | "dresses" {
  const combined = `${cat || ""} ${name || ""}`.toLowerCase();

  if (
    combined.includes("váy liền") ||
    combined.includes("đầm") ||
    combined.includes("áo dài") ||
    combined.includes("dress") ||
    combined.includes("gown") ||
    combined.includes("jumpsuit") ||
    combined.includes("set bộ") ||
    combined.includes("bộ trang phục")
  ) {
    return "dresses";
  }

  if (
    combined.includes("áo") ||
    combined.includes("shirt") ||
    combined.includes("t-shirt") ||
    combined.includes("tee") ||
    combined.includes("polo") ||
    combined.includes("top") ||
    combined.includes("hoodie") ||
    combined.includes("jacket") ||
    combined.includes("khoác") ||
    combined.includes("sweater") ||
    combined.includes("cardigan") ||
    combined.includes("blazer") ||
    combined.includes("vest") ||
    combined.includes("bra") ||
    combined.includes("tank") ||
    combined.includes("crop") ||
    combined.includes("sơ mi") ||
    combined.includes("thun") ||
    combined.includes("len")
  ) {
    return "upper_body";
  }

  if (
    combined.includes("chân váy") ||
    combined.includes("quần") ||
    combined.includes("pant") ||
    combined.includes("jean") ||
    combined.includes("short") ||
    combined.includes("skirt") ||
    combined.includes("trouser") ||
    combined.includes("legging")
  ) {
    return "lower_body";
  }

  return "upper_body";
}

interface PreparedHuman {
  dataUri: string;
  origWidth: number;
  origHeight: number;
  padX: number;
  padY: number;
  contentWidth: number;
  contentHeight: number;
}

async function prepareHumanImage(file: File): Promise<PreparedHuman> {
  const arrayBuf = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);
  const metadata = await sharp(buffer).metadata();
  const origWidth = metadata.width || 768;
  const origHeight = metadata.height || 1024;
  const origRatio = origWidth / origHeight;
  const targetRatio = 768 / 1024; // 0.75

  let contentWidth = 768;
  let contentHeight = 1024;
  let padX = 0;
  let padY = 0;

  if (origRatio < targetRatio) {
    contentHeight = 1024;
    contentWidth = Math.max(1, Math.round(1024 * origRatio));
    padX = Math.floor((768 - contentWidth) / 2);
  } else if (origRatio > targetRatio) {
    contentWidth = 768;
    contentHeight = Math.max(1, Math.round(768 / origRatio));
    padY = Math.floor((1024 - contentHeight) / 2);
  }

  const paddedBuffer = await sharp(buffer)
    .resize(768, 1024, {
      fit: "contain",
      background: { r: 240, g: 240, b: 240, alpha: 1 },
      position: "center",
    })
    .toFormat("jpeg", { quality: 95 })
    .toBuffer();

  const dataUri = `data:image/jpeg;base64,${paddedBuffer.toString("base64")}`;

  return {
    dataUri,
    origWidth,
    origHeight,
    padX,
    padY,
    contentWidth,
    contentHeight,
  };
}

async function prepareGarmentImage(
  garmentFile: File | null,
  garmentImageUrl: string | null,
  origin: string
): Promise<string> {
  let garmentBuf: Buffer | null = null;

  if (garmentFile) {
    const arrayBuf = await garmentFile.arrayBuffer();
    garmentBuf = Buffer.from(arrayBuf);
  } else if (garmentImageUrl && garmentImageUrl.trim() !== "") {
    garmentBuf = await fetchImageBuffer(garmentImageUrl, origin);
  }

  if (!garmentBuf || garmentBuf.length === 0) {
    throw new Error("Thiếu ảnh trang phục. Vui lòng chọn hoặc tải ảnh trang phục lên.");
  }

  // Pre-process garment: Fit onto 768x1024 clean white canvas to avoid ANY stretching
  const processedBuf = await sharp(garmentBuf)
    .resize(768, 1024, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      position: "center",
    })
    .toFormat("jpeg", { quality: 98 })
    .toBuffer();

  return `data:image/jpeg;base64,${processedBuf.toString("base64")}`;
}

async function restoreOriginalAspect(
  resultUrl: string,
  humanMeta: PreparedHuman
): Promise<string> {
  try {
    const res = await fetch(resultUrl, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) return resultUrl;
    const arrayBuf = await res.arrayBuffer();
    const resultBuf = Buffer.from(arrayBuf);

    if (humanMeta.padX > 0 || humanMeta.padY > 0) {
      const cropped = await sharp(resultBuf)
        .extract({
          left: Math.max(0, humanMeta.padX),
          top: Math.max(0, humanMeta.padY),
          width: Math.min(768 - humanMeta.padX, humanMeta.contentWidth),
          height: Math.min(1024 - humanMeta.padY, humanMeta.contentHeight),
        })
        .resize(humanMeta.origWidth, humanMeta.origHeight, { fit: "fill" })
        .toFormat("jpeg", { quality: 95 })
        .toBuffer();

      return `data:image/jpeg;base64,${cropped.toString("base64")}`;
    }

    return resultUrl;
  } catch (err) {
    console.warn("[restoreOriginalAspect] Error restoring framing:", err);
    return resultUrl;
  }
}

// ── Replicate API Handler ───────────────────────────────────────────────────

async function handleReplicateTryOn({
  personImageFile,
  garmentImageFile,
  garmentImageUrl,
  productName,
  category,
  modelType,
  origin,
}: {
  personImageFile: File;
  garmentImageFile: File | null;
  garmentImageUrl: string | null;
  productName: string;
  category: string;
  modelType: string;
  origin: string;
}): Promise<string> {
  const humanMeta = await prepareHumanImage(personImageFile);
  const effectiveGarmentUrl = await prepareGarmentImage(garmentImageFile, garmentImageUrl, origin);

  const version = modelType === "OOTDIFFUSION" ? OOTDIFFUSION_VERSION : IDM_VTON_VERSION;
  const resolvedCategory = resolveCategory(category, productName);

  const cleanName = productName
    ? productName.replace(/\(.*?\)/g, "").trim()
    : "fashion garment";
  const garmentDescription = `${cleanName}, high-definition authentic garment, exact color and fabric texture, clear printed logo and branding details, sharp clean neckline and seams, realistic natural fabric folds and shadows, realistic natural human skin tone`;

  const input: Record<string, unknown> =
    modelType === "OOTDIFFUSION"
      ? {
          model_image: humanMeta.dataUri,
          garment_image: effectiveGarmentUrl,
          steps: 35,
          guidance_scale: 2.0,
          seed: Math.floor(Math.random() * 1000000),
        }
      : {
          human_img: humanMeta.dataUri,
          garm_img: effectiveGarmentUrl,
          garment_des: garmentDescription,
          category: resolvedCategory,
          crop: false,
          steps: 30,
          force_dc: resolvedCategory === "dresses",
          seed: Math.floor(Math.random() * 1000000),
        };

  const predRes = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ version, input }),
    signal: AbortSignal.timeout(20000),
  });

  if (!predRes.ok) {
    const errText = await predRes.text();
    console.error("[Replicate] Error starting prediction:", predRes.status, errText);
    throw new Error(`Replicate AI error (${predRes.status}): ${errText}`);
  }

  const predData = await predRes.json();
  const predictionId = predData.id;
  let status = predData.status;
  let resultNode = predData;

  // Poll for completion (max 100s)
  let attempts = 0;
  while (attempts < 50 && (status === "starting" || status === "processing")) {
    await new Promise((r) => setTimeout(r, 2000));
    attempts++;

    const getRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
      signal: AbortSignal.timeout(10000),
    });
    if (getRes.ok) {
      resultNode = await getRes.json();
      status = resultNode.status;
    }
  }

  if (status === "succeeded" && resultNode.output) {
    let rawResultUrl = "";
    if (Array.isArray(resultNode.output) && resultNode.output.length > 0) {
      rawResultUrl = resultNode.output[0];
    } else if (typeof resultNode.output === "string") {
      rawResultUrl = resultNode.output;
    }

    if (rawResultUrl) {
      return await restoreOriginalAspect(rawResultUrl, humanMeta);
    }
  }

  throw new Error(`AI xử lý thất bại: ${resultNode.error || status}`);
}

// ── Fallback: Forward multipart request directly to Backend ─────────────────

async function forwardToBackend({
  personImageFile,
  garmentImageFile,
  garmentImageUrl,
  productName,
  category,
  modelType,
  authToken,
}: {
  personImageFile: File;
  garmentImageFile: File | null;
  garmentImageUrl: string | null;
  productName: string;
  category: string;
  modelType: string;
  authToken: string | null;
}): Promise<string> {
  const beFormData = new FormData();
  beFormData.append("personImage", personImageFile, personImageFile.name || "person.jpg");
  if (garmentImageFile) {
    beFormData.append("garmentImage", garmentImageFile, garmentImageFile.name || "garment.jpg");
  }
  if (garmentImageUrl) {
    beFormData.append("garmentImageUrl", garmentImageUrl);
  }
  beFormData.append("productName", productName);
  beFormData.append("category", category);
  beFormData.append("modelType", modelType);

  const headers: Record<string, string> = {};
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${BACKEND_URL}/try-on`, {
    method: "POST",
    headers,
    body: beFormData,
    signal: AbortSignal.timeout(55000),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Backend try-on error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (data.data?.resultUrl) {
    return data.data.resultUrl;
  }
  if (data.resultUrl) {
    return data.resultUrl;
  }

  throw new Error("Backend không trả về kết quả ảnh thử đồ");
}

// ── OpenAI API Handler ──────────────────────────────────────────────────────

async function handleOpenAiTryOn({
  personImageFile,
  garmentImageUrl,
  productName,
  origin,
}: {
  personImageFile: File;
  garmentImageUrl: string | null;
  productName: string;
  origin: string;
}): Promise<string> {
  let garmentFile: File | null = null;
  if (garmentImageUrl && garmentImageUrl.trim() !== "") {
    try {
      const buf = await fetchImageBuffer(garmentImageUrl, origin);
      garmentFile = new File([buf], "garment.jpg", { type: "image/jpeg" });
    } catch (e) {
      console.warn("[handleOpenAiTryOn] Failed to prepare garment file:", e);
    }
  }

  const garmentDesc = productName ? `the clothing item named "${productName}"` : "the clothing item";

  const STRICT_RULES = `STRICT RULES:
Replace ONLY the clothing with the provided garment.
Do NOT modify: face, eyes, nose, lips, skin tone, hairstyle, body shape, body proportions, pose, background.
Preserve pixel-level consistency wherever clothing is not present.
Output dimensions must match input photo framing.`;

  const prompt = garmentFile
    ? `Virtual clothing replacement only. Replace ONLY the clothing on the person in the first image with the garment shown in the second image.\n${STRICT_RULES}`
    : `Virtual clothing replacement only. Replace ONLY the clothing on the person in the image with ${garmentDesc}.\n${STRICT_RULES}`;

  const openAIForm = new FormData();
  openAIForm.append("model", "dall-e-2");

  if (garmentFile) {
    openAIForm.append("image", personImageFile, "person.jpg");
    openAIForm.append("mask", garmentFile, "mask.jpg");
  } else {
    openAIForm.append("image", personImageFile, "person.jpg");
  }

  openAIForm.append("prompt", prompt);
  openAIForm.append("n", "1");
  openAIForm.append("size", "1024x1024");

  const openAIRes = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: openAIForm,
    signal: AbortSignal.timeout(30000),
  });

  if (!openAIRes.ok) {
    const errText = await openAIRes.text();
    console.error("[TryOn] OpenAI error:", openAIRes.status, errText);
    throw new Error(`OpenAI xử lý thất bại: ${errText}`);
  }

  const openAIData = await openAIRes.json();
  const b64 = openAIData.data?.[0]?.b64_json as string | undefined;
  const url = openAIData.data?.[0]?.url as string | undefined;

  if (url) return url;
  if (b64) return `data:image/png;base64,${b64}`;

  throw new Error("AI không trả về kết quả hình ảnh.");
}

// ── Helper: Update BE history record ─────────────────────────────────────────

async function updateBackendRecord(
  historyId: number,
  authToken: string,
  generatedImageUrl: string | null,
  status: "COMPLETED" | "FAILED",
  errorMessage: string | null,
  backendUrl: string
) {
  try {
    await fetch(`${backendUrl}/try-on/history/${historyId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        generatedImageUrl: generatedImageUrl || "",
        status,
        errorMessage,
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (e) {
    console.warn("[TryOn] Failed to update backend record:", e);
  }
}

