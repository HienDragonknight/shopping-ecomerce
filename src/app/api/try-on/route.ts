import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";

/**
 * POST /api/try-on
 *
 * Accepts multipart/form-data:
 *   - personImage: File        (customer photo)
 *   - garmentImageUrl: string  (product image URL)
 *   - productId: string
 *   - productName: string
 *   - authToken: string        (JWT — passed from client)
 *
 * Flow:
 *  1. Validate inputs
 *  2. Save PENDING record to BE (if auth token provided)
 *  3. Call OpenAI Images Edit API with both images
 *  4. Get base64 result → convert to data URL
 *  5. Update BE record to COMPLETED
 *  6. Return { resultUrl, historyId }
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const personImageFile = formData.get("personImage") as File | null;
    const garmentImageUrl = formData.get("garmentImageUrl") as string | null;
    const productId = formData.get("productId") as string | null;
    const productName = formData.get("productName") as string | null;
    const authToken = formData.get("authToken") as string | null;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!personImageFile) {
      return NextResponse.json({ error: "Thiếu ảnh của bạn" }, { status: 400 });
    }
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key chưa được cấu hình" }, { status: 500 });
    }
    // garmentImageUrl is optional — if missing or fetch fails, we use prompt-only mode

    // ── Step 1: Save PENDING record to backend ───────────────────────────────
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
            originalImageUrl: garmentImageUrl, // store garment URL as reference
          }),
        });
        if (beRes.ok) {
          const beData = await beRes.json();
          historyId = beData.data?.id ?? null;
        }
      } catch (e) {
        console.warn("[TryOn] Failed to save PENDING to backend:", e);
        // Non-fatal — continue with AI generation
      }
    }

    // ── Step 2: Fetch garment image and convert to File ──────────────────────
    let garmentFile: File | null = null;
    if (garmentImageUrl && garmentImageUrl.trim() !== "") {
      try {
        const garmentRes = await fetch(garmentImageUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; VirtualTryOn/1.0)",
            "Accept": "image/*, */*",
          },
          signal: AbortSignal.timeout(10_000),
        });

        if (!garmentRes.ok) {
          console.warn(`[TryOn] Garment fetch failed: ${garmentRes.status} — ${garmentImageUrl}`);
        } else {
          const contentType = garmentRes.headers.get("content-type") || "image/jpeg";
          if (contentType.startsWith("image/")) {
            const garmentBuffer = await garmentRes.arrayBuffer();
            garmentFile = new File([garmentBuffer], "garment.jpg", { type: contentType });
          } else {
            console.warn(`[TryOn] Non-image content-type: ${contentType}`);
          }
        }
      } catch (e) {
        console.warn(`[TryOn] Garment fetch error (fallback to prompt-only):`, e instanceof Error ? e.message : e);
      }
    }

    // ── Step 3: Call OpenAI Images Edit API ──────────────────────────────────
    const garmentDesc = productName ? `the clothing item named "${productName}"` : "the clothing item";

    const STRICT_RULES = `STRICT RULES:
Replace ONLY the clothing with the provided garment.
Do NOT modify: face, eyes, nose, lips, skin tone, hairstyle, body shape, body proportions, age, gender, pose, camera angle, lighting, shadows, image composition, crop, background, furniture, accessories.
Preserve pixel-level consistency wherever clothing is not present.
The output must appear as if the original photograph was taken while wearing the new clothing.
Do NOT regenerate the person. Do NOT beautify. Do NOT retouch. Do NOT enhance the face.
Only replace the clothing. Everything else must remain identical.
OUTPUT DIMENSIONS: The output image MUST have the exact same dimensions (width × height in pixels), aspect ratio, framing, and crop as the original input photo. Do NOT zoom in. Do NOT zoom out. Do NOT reframe. Do NOT change the canvas size. Do NOT add or remove padding. The composition must be a 1:1 pixel-perfect match of the original frame.`;

    const prompt = garmentFile
      ? `Virtual clothing replacement only. Replace ONLY the clothing on the person in the first image with the garment shown in the second image.\n${STRICT_RULES}`
      : `Virtual clothing replacement only. Replace ONLY the clothing on the person in the image with ${garmentDesc}.\n${STRICT_RULES}`;


    const openAIForm = new FormData();
    openAIForm.append("model", "gpt-image-1");

    if (garmentFile) {
      // Two images → must use array syntax image[]
      openAIForm.append("image[]", personImageFile, "person.jpg");
      openAIForm.append("image[]", garmentFile, "garment.jpg");
    } else {
      // Single image → use plain image
      openAIForm.append("image", personImageFile, "person.jpg");
    }

    openAIForm.append("prompt", prompt);
    openAIForm.append("n", "1");
    openAIForm.append("size", "1024x1024");

    const openAIRes = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: openAIForm,
    });

    if (!openAIRes.ok) {
      const errText = await openAIRes.text();
      console.error("[TryOn] OpenAI error:", openAIRes.status, errText);

      // Update BE record to FAILED if exists
      if (historyId && authToken) {
        await updateBackendRecord(historyId, authToken, null, "FAILED", errText, BACKEND_URL);
      }

      // Parse OpenAI error for user-friendly message
      let userMsg = "AI xử lý thất bại. Vui lòng thử lại.";
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error?.code === "content_policy_violation") {
          userMsg = "Ảnh không phù hợp với chính sách AI. Vui lòng dùng ảnh khác.";
        } else if (errJson.error?.code === "billing_hard_limit_reached") {
          userMsg = "Tài khoản AI đã hết hạn mức. Vui lòng liên hệ hỗ trợ.";
        }
      } catch { /* ignore */ }

      return NextResponse.json({ error: userMsg }, { status: openAIRes.status });
    }

    const openAIData = await openAIRes.json();
    const b64 = openAIData.data?.[0]?.b64_json as string | undefined;
    const resultUrl = openAIData.data?.[0]?.url as string | undefined;

    if (!b64 && !resultUrl) {
      return NextResponse.json({ error: "AI không trả về kết quả" }, { status: 500 });
    }

    // ── Step 4: Build result URL ──────────────────────────────────────────────
    // Prefer URL if available, otherwise use base64 data URI
    const finalUrl = resultUrl ?? `data:image/png;base64,${b64}`;

    // ── Step 5: Update BE record to COMPLETED ────────────────────────────────
    if (historyId && authToken) {
      await updateBackendRecord(historyId, authToken, finalUrl, "COMPLETED", null, BACKEND_URL);
    }

    return NextResponse.json({
      resultUrl: finalUrl,
      historyId,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định";
    console.error("[TryOn] Unexpected error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── Helper: Update BE history record ─────────────────────────────────────────

async function updateBackendRecord(
  historyId: number,
  authToken: string,
  generatedImageUrl: string | null,
  status: "COMPLETED" | "FAILED",
  errorMessage: string | null,
  backendUrl: string,
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
