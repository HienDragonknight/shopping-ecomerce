import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || "";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://fashion-backend-production-8e3b.up.railway.app/api";

const IDM_VTON_VERSION = "0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985";
const OOTDIFFUSION_VERSION = "9f8fa4956970dde99689af7488157a30aa152e23953526a605df1d77598343d7";

/**
 * POST /api/try-on
 * Multi-model virtual try-on API endpoint supporting IDM-VTON, OOTDiffusion, and OpenAI.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const personImageFile = formData.get("personImage") as File | null;
    const garmentImageFile = formData.get("garmentImage") as File | null;
    const garmentImageUrl = formData.get("garmentImageUrl") as string | null;
    const productId = formData.get("productId") as string | null;
    const productName = formData.get("productName") as string | null;
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
            originalImageUrl: garmentImageUrl,
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

    // ── Check if Spring Boot backend handles full try-on generation ───────────
    // If backend is active and has /api/try-on multipart endpoint, we can forward to it.
    // Otherwise we execute locally via Replicate or OpenAI.
    let resultUrl = "";

    if (REPLICATE_API_TOKEN && (modelType === "IDM_VTON" || modelType === "OOTDIFFUSION")) {
      resultUrl = await handleReplicateTryOn({
        personImageFile,
        garmentImageFile,
        garmentImageUrl,
        productName: productName || "Trang phục",
        category,
        modelType,
      });
    } else {
      // Fallback to OpenAI Image Edit API
      if (!OPENAI_API_KEY) {
        return NextResponse.json(
          { error: "Chưa cấu hình API Key cho AI (REPLICATE_API_TOKEN hoặc OPENAI_API_KEY)" },
          { status: 500 }
        );
      }
      resultUrl = await handleOpenAiTryOn({
        personImageFile,
        garmentImageUrl,
        productName: productName || "Trang phục",
      });
    }

    // ── Update BE record to COMPLETED ─────────────────────────────────────────
    if (historyId && authToken) {
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

// ── Helper: Ensure image URL/Path is Base64 Data URI for external AI models ────

import fs from "fs";
import path from "path";

async function ensureDataUri(urlOrPath: string | null): Promise<string> {
  if (!urlOrPath) return "";
  if (urlOrPath.startsWith("data:")) return urlOrPath;

  // 1. Local relative path (e.g. /images/products/polo.jpg)
  if (urlOrPath.startsWith("/")) {
    try {
      const localPath = path.join(process.cwd(), "public", urlOrPath);
      if (fs.existsSync(localPath)) {
        const fileBuf = fs.readFileSync(localPath);
        const ext = path.extname(localPath).toLowerCase().replace(".", "");
        const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
        return `data:${mime};base64,${fileBuf.toString("base64")}`;
      }
    } catch (err) {
      console.warn("[ensureDataUri] Error reading local file:", err);
    }
  }

  // 2. Localhost or remote URL (e.g. http://localhost:3000/... or https://...)
  try {
    let targetUrl = urlOrPath;
    if (urlOrPath.startsWith("/")) {
      targetUrl = `http://localhost:3000${urlOrPath}`;
    }

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VirtualTryOn/1.0)",
        Accept: "image/*, */*",
      },
    });

    if (res.ok) {
      const contentType = res.headers.get("content-type") || "image/jpeg";
      const arrayBuf = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuf).toString("base64");
      return `data:${contentType};base64,${base64}`;
    }
  } catch (err) {
    console.warn("[ensureDataUri] Error fetching URL:", err);
  }

  return urlOrPath;
}

function resolveCategory(cat: string): "upper_body" | "lower_body" | "dresses" {
  if (!cat) return "upper_body";
  const lower = cat.toLowerCase();
  if (
    lower.includes("dress") ||
    lower.includes("váy") ||
    lower.includes("đầm") ||
    lower.includes("áo dài")
  ) {
    return "dresses";
  }
  if (
    lower.includes("lower") ||
    lower.includes("quần") ||
    lower.includes("pant") ||
    lower.includes("skirt") ||
    lower.includes("short")
  ) {
    return "lower_body";
  }
  return "upper_body";
}

// ── Replicate API Handler ───────────────────────────────────────────────────

async function handleReplicateTryOn({
  personImageFile,
  garmentImageFile,
  garmentImageUrl,
  productName,
  category,
  modelType,
}: {
  personImageFile: File;
  garmentImageFile: File | null;
  garmentImageUrl: string | null;
  productName: string;
  category: string;
  modelType: string;
}): Promise<string> {
  // Convert person image file to Base64 data URI for Replicate input
  const personArrayBuf = await personImageFile.arrayBuffer();
  const personBase64 = Buffer.from(personArrayBuf).toString("base64");
  const personDataUri = `data:${personImageFile.type || "image/jpeg"};base64,${personBase64}`;

  let effectiveGarmentUrl = "";

  if (garmentImageFile) {
    const garmentBuf = await garmentImageFile.arrayBuffer();
    const garmentBase64 = Buffer.from(garmentBuf).toString("base64");
    effectiveGarmentUrl = `data:${garmentImageFile.type || "image/jpeg"};base64,${garmentBase64}`;
  } else if (garmentImageUrl) {
    effectiveGarmentUrl = await ensureDataUri(garmentImageUrl);
  }

  if (!effectiveGarmentUrl) {
    throw new Error("Thiếu ảnh trang phục. Vui lòng chọn hoặc tải ảnh trang phục lên.");
  }

  const version = modelType === "OOTDIFFUSION" ? OOTDIFFUSION_VERSION : IDM_VTON_VERSION;

  const resolvedCategory = resolveCategory(category);
  const descPrefix =
    resolvedCategory === "lower_body"
      ? "Lower body garment,"
      : resolvedCategory === "dresses"
      ? "Full dress garment,"
      : "Top upper body garment,";

  const garmentDescription = `Virtual try-on: replace ONLY the clothing on the person with this exact garment: ${productName}. ${descPrefix} matching exact color, fabric pattern, texture, logo, collar, and style shown in the garment image. High resolution, realistic fit.`;

  const input: Record<string, unknown> =
    modelType === "OOTDIFFUSION"
      ? {
          model_image: personDataUri,
          garment_image: effectiveGarmentUrl,
          steps: 40,
          guidance_scale: 2.0,
          seed: 42,
        }
      : {
          human_img: personDataUri,
          garm_img: effectiveGarmentUrl,
          garment_des: garmentDescription,
          category: resolvedCategory,
          crop: true,
          steps: 40,
          seed: 42,
        };

  const predRes = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ version, input }),
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

  // Poll for completion (max 120s)
  let attempts = 0;
  while (attempts < 60 && (status === "starting" || status === "processing")) {
    await new Promise((r) => setTimeout(r, 2000));
    attempts++;

    const getRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
    });
    if (getRes.ok) {
      resultNode = await getRes.json();
      status = resultNode.status;
    }
  }

  if (status === "succeeded" && resultNode.output) {
    if (Array.isArray(resultNode.output) && resultNode.output.length > 0) {
      return resultNode.output[0];
    } else if (typeof resultNode.output === "string") {
      return resultNode.output;
    }
  }

  throw new Error(`AI xử lý thất bại: ${resultNode.error || status}`);
}

// ── OpenAI API Handler ──────────────────────────────────────────────────────

async function handleOpenAiTryOn({
  personImageFile,
  garmentImageUrl,
  productName,
}: {
  personImageFile: File;
  garmentImageUrl: string | null;
  productName: string;
}): Promise<string> {
  let garmentFile: File | null = null;
  if (garmentImageUrl && garmentImageUrl.trim() !== "") {
    try {
      const dataUri = await ensureDataUri(garmentImageUrl);
      if (dataUri.startsWith("data:")) {
        const commaIdx = dataUri.indexOf(",");
        const header = dataUri.substring(0, commaIdx);
        const base64Data = dataUri.substring(commaIdx + 1);
        const mime = header.split(";")[0].replace("data:", "") || "image/jpeg";
        const buf = Buffer.from(base64Data, "base64");
        garmentFile = new File([buf], "garment.jpg", { type: mime });
      }
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
  openAIForm.append("model", "gpt-image-1");

  if (garmentFile) {
    openAIForm.append("image[]", personImageFile, "person.jpg");
    openAIForm.append("image[]", garmentFile, "garment.jpg");
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
  });

  if (!openAIRes.ok) {
    const errText = await openAIRes.text();
    console.error("[TryOn] OpenAI error:", openAIRes.status, errText);
    throw new Error("OpenAI AI xử lý thất bại.");
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
    });
  } catch (e) {
    console.warn("[TryOn] Failed to update backend record:", e);
  }
}
