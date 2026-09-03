/**
 * Client-side image compression utility
 * Resizes large photos to max dimension and compresses to JPEG, reducing 5-10MB files to ~200-400KB
 * Prevents Vercel 4.5MB payload limit errors and speeds up network uploads.
 */
export async function compressImage(
  file: File,
  maxDimension = 1200,
  quality = 0.85
): Promise<File> {
  if (typeof window === "undefined" || !file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".jpg"),
            { type: "image/jpeg" }
          );
          resolve(compressedFile);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Safely parse fetch response as JSON, providing informative error if HTML or server error
 */
export async function safeParseJson<T = Record<string, unknown>>(res: Response): Promise<T> {
  const rawText = await res.text();
  try {
    return JSON.parse(rawText) as T;
  } catch {
    if (res.status === 504 || res.status === 502) {
      throw new Error("Yêu cầu quá hạn (504 Gateway Timeout). Vui lòng thử lại.");
    }
    if (res.status === 413) {
      throw new Error("Dung lượng ảnh quá lớn (413 Payload Too Large). Vui lòng chọn ảnh nhỏ hơn.");
    }
    if (rawText.includes("<!DOCTYPE") || rawText.includes("<html")) {
      throw new Error(`Lỗi máy chủ (${res.status}). Vui lòng thử lại sau giây lát.`);
    }
    throw new Error(rawText || `Lỗi máy chủ (${res.status})`);
  }
}
