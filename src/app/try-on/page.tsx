"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { getAccessToken } from "@/lib/auth";
import { compressImage, safeParseJson } from "@/lib/image-utils";
import CameraCaptureModal from "@/components/try-on/CameraCaptureModal";
import QrCodeModal from "@/components/try-on/QrCodeModal";
import { RippleLoader, WaveBars, RotatingTip } from "@/components/try-on/TryOnLoaders";

const ACCENT = "#1A1A1A";

interface VariantInfo {
  id: number;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  imageUrls?: string[];
  stockQty: number;
}

interface ProductInfo {
  id: number;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  effectivePrice: number;
  category?: { name: string };
  imageUrls?: string[];
  variants?: VariantInfo[];
}

// Pre-defined sample outfits from public/images/custome/
const PRESET_OUTFITS = [
  {
    id: "outfit1",
    label: "Bộ Trang Phục 1",
    url: "/images/custome/1785493157090_6183024285053964314_6183024285053964314_5975b1d7ce238f09ace3c7b2ded94e37.jpg",
    category: "dresses",
  },
  {
    id: "outfit2",
    label: "Bộ Trang Phục 2",
    url: "/images/custome/1785493395531_6183024285053964314_6183024285053964314_d75d6731b5ee10679443168d153d4193.jpg",
    category: "dresses",
  },
];

const TIPS = [
  "Dùng ảnh toàn thân hoặc nửa thân rõ mặt",
  "Giữ khoảng cách 1.5m - 2.0m từ camera",
  "Đảm bảo đủ ánh sáng, tránh nguồn sáng chói chiếu thẳng",
  "Nhìn thẳng camera và đứng ở giữa khung hình",
];

type Step = "idle" | "processing" | "result" | "error";

function TryOnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const productId = searchParams.get("productId");

  const [step, setStep] = useState<Step>("idle");
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  
  // Product & Preset states
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<VariantInfo | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(PRESET_OUTFITS[0].id);
  const [useCustomProduct, setUseCustomProduct] = useState(false);

  const [modelType, setModelType] = useState<"IDM_VTON" | "OOTDIFFUSION" | "OPENAI">("IDM_VTON");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!productId) return;
    api.get(`/products/${productId}`)
      .then((r) => {
        const p: ProductInfo = r.data.data;
        setProduct(p);
        setUseCustomProduct(true);
        const paramColor = searchParams.get("color");
        const match = paramColor
          ? p.variants?.find((v) => v.color?.toLowerCase() === paramColor.toLowerCase())
          : null;
        setSelectedVariant(match || p.variants?.[0] || null);
      })
      .catch(() => setProduct(null));
  }, [productId, searchParams]);

  const handlePersonFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh cá nhân (JPG, PNG, WEBP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Ảnh cá nhân tối đa 10MB");
      return;
    }
    setError("");
    setPersonFile(file);
    setPersonPreview(URL.createObjectURL(file));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handlePersonFile(f);
  }, []);

  const handleTryOn = async () => {
    if (!personFile) {
      setError("Vui lòng tải lên hoặc chụp ảnh cá nhân của bạn");
      return;
    }

    setStep("processing");
    setError("");

    try {
      let garmentFile: File | null = null;
      let garmentUrl = "";
      let productName = "";
      let category = "dresses";

      if (useCustomProduct && product) {
        garmentUrl = (selectedVariant?.imageUrls && selectedVariant.imageUrls.length > 0)
          ? selectedVariant.imageUrls[0]
          : (product.thumbnailUrl || "");
        productName = selectedVariant?.color ? `${product.name} (${selectedVariant.color})` : product.name;
        category = product.category?.name || "upper_body";
      } else {
        const preset = PRESET_OUTFITS.find((p) => p.id === selectedPresetId);
        if (!preset) throw new Error("Vui lòng chọn 1 trang phục");
        garmentUrl = preset.url;
        productName = preset.label;
        category = preset.category;
      }

      // Convert image URL to File blob if using static / preset URL
      if (garmentUrl && garmentUrl.startsWith("/")) {
        try {
          const res = await fetch(garmentUrl);
          const blob = await res.blob();
          garmentFile = new File([blob], "garment.jpg", { type: blob.type || "image/jpeg" });
        } catch {
          // ignore error
        }
      }

      // Compress person image before uploading to avoid Vercel 4.5MB limits
      const compressedPersonFile = await compressImage(personFile, 1200, 0.85);

      const fd = new FormData();
      fd.append("personImage", compressedPersonFile);
      if (garmentFile) {
        fd.append("garmentImage", garmentFile);
      }
      fd.append("garmentImageUrl", garmentUrl);
      if (useCustomProduct && product) {
        fd.append("productId", String(product.id));
      }
      fd.append("productName", productName);
      fd.append("category", category);
      fd.append("modelType", modelType);

      const token = getAccessToken();
      if (token) fd.append("authToken", token);

      const res = await fetch("/api/try-on", { method: "POST", body: fd });
      const data = await safeParseJson<{
        resultUrl?: string;
        predictionId?: string;
        status?: string;
        historyId?: number;
        meta?: unknown;
        error?: string;
      }>(res);

      if (!res.ok || data.error) {
        setError(data.error || "AI xử lý thất bại. Vui lòng thử lại.");
        setStep("error");
        return;
      }

      // If backend / sync returned result directly
      if (data.resultUrl) {
        setResultUrl(data.resultUrl);
        setStep("result");
        return;
      }

      // If prediction was queued on Replicate, poll every 2s
      if (data.predictionId) {
        const metaParam = data.meta ? encodeURIComponent(JSON.stringify(data.meta)) : "";
        let pollAttempts = 0;
        const maxPolls = 60; // 120s max

        while (pollAttempts < maxPolls) {
          await new Promise((r) => setTimeout(r, 2000));
          pollAttempts++;

          const pollUrl = `/api/try-on?predictionId=${data.predictionId}&historyId=${data.historyId || ""}&authToken=${token || ""}&meta=${metaParam}`;
          const pollRes = await fetch(pollUrl);
          const pollData = await safeParseJson<{
            status?: string;
            resultUrl?: string;
            error?: string;
          }>(pollRes);

          if (pollData.status === "succeeded" && pollData.resultUrl) {
            setResultUrl(pollData.resultUrl);
            setStep("result");
            return;
          }

          if (pollData.status === "failed") {
            setError(pollData.error || "AI xử lý thất bại. Vui lòng thử lại.");
            setStep("error");
            return;
          }
        }

        setError("Quá thời gian xử lý của AI (Timeout). Vui lòng thử lại.");
        setStep("error");
        return;
      }

      setError("Không nhận được kết quả từ AI. Vui lòng thử lại.");
      setStep("error");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định khi thử đồ");
      setStep("error");
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      router.push(`/account/login?redirect=/try-on?productId=${product.id}`);
      return;
    }
    try {
      const r = await api.get(`/products/${product.slug}`);
      const variants = r.data.data.variants || [];
      const v = variants.find((x: { stockQty: number }) => x.stockQty > 0) || variants[0];
      if (v) await addItem(v.id, 1);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch {
      /* ignore */
    }
  };

  const resetAll = () => {
    setStep("idle");
    setResultUrl(null);
    setError("");
    setPersonFile(null);
    setPersonPreview(null);
    setIsQrModalOpen(false);
    setCopied(false);
  };

  const handleCopyLink = () => {
    if (!resultUrl) return;
    navigator.clipboard.writeText(resultUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isProcessing = step === "processing";
  const isDone = step === "result";

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-20 pt-6">
      {/* ── Top nav ── */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-400 hover:text-black">Home</Link>
          <span className="text-gray-300">/</span>
          {product && (
            <>
              <Link href="/products" className="text-gray-400 hover:text-black">Products</Link>
              <span className="text-gray-300">/</span>
            </>
          )}
          <span className="font-semibold text-gray-700">Virtual Try-On</span>
          <span
            className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full text-white shadow-sm"
            style={{ background: ACCENT }}
          >
            ✦ AI Try-On Studio
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Header section */}
        <div className="mb-8 text-center">
          <span
            className="inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest text-white mb-2"
            style={{ background: ACCENT }}
          >
            AI Virtual Try-On Studio
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-wider text-[#1A1A1A]">
            Phòng Thử Đồ Ảo AI
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
            Tải lên 1 ảnh của bạn và chọn 1 trang phục để AI mặc thử trực tiếp trên cơ thể bạn.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Main Dual Upload Section */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Card 1: Person Photo */}
            <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                    style={{ background: ACCENT }}
                  >
                    1
                  </span>
                  <p className="text-sm font-bold text-[#1A1A1A]">Ảnh cá nhân của bạn</p>
                </div>
                {personPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setPersonFile(null);
                      setPersonPreview(null);
                    }}
                    className="text-xs font-semibold text-gray-400 hover:text-red-500"
                  >
                    Đổi ảnh
                  </button>
                )}
              </div>

              <div
                onClick={() => !personPreview && fileRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all ${
                  personPreview ? "border-gray-200" : "cursor-pointer hover:border-black"
                }`}
                style={{ borderColor: personPreview ? "#e5e7eb" : ACCENT, minHeight: 240 }}
              >
                {personPreview ? (
                  <div className="relative flex min-h-[240px] max-h-[380px] w-full items-center justify-center bg-[#f9f9f9]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={personPreview}
                      alt="Ảnh cá nhân"
                      className="max-h-[380px] w-full object-contain"
                    />
                    <div
                      className="absolute bottom-2 left-2 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow"
                      style={{ background: ACCENT }}
                    >
                      ✓ Đã chọn ảnh
                    </div>
                  </div>
                ) : (
                  <div className="flex h-60 flex-col items-center justify-center gap-2 px-4">
                    <span className="text-4xl opacity-80">👤</span>
                    <p className="text-center text-sm font-bold text-[#1A1A1A]">Tải ảnh hoặc Chụp trực tiếp</p>
                    <p className="text-center text-xs text-gray-400">Tải tệp từ máy tính hoặc bấm Chụp từ Camera</p>
                  </div>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handlePersonFile(e.target.files[0])}
              />

              {!personPreview && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition-all hover:bg-gray-50 active:scale-[0.98]"
                    style={{ borderColor: ACCENT, color: ACCENT }}
                  >
                    <span>📤 Tải ảnh lên</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
                    style={{ background: ACCENT }}
                  >
                    <span>📸 Chụp Camera</span>
                  </button>
                </div>
              )}
            </div>

            {/* Card 2: Outfit Selection */}
            <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                    style={{ background: ACCENT }}
                  >
                    2
                  </span>
                  <p className="text-sm font-bold text-[#1A1A1A]">Chọn trang phục</p>
                </div>
                {product && (
                  <button
                    type="button"
                    onClick={() => setUseCustomProduct(!useCustomProduct)}
                    className="text-xs font-semibold underline"
                    style={{ color: ACCENT }}
                  >
                    {useCustomProduct ? "Dùng trang phục mẫu" : "Dùng sản phẩm đang xem"}
                  </button>
                )}
              </div>

              {/* Product mode vs Preset mode */}
              {useCustomProduct && product ? (
                <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-3">
                  <div className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        (selectedVariant?.imageUrls && selectedVariant.imageUrls.length > 0)
                          ? selectedVariant.imageUrls[0]
                          : (product.thumbnailUrl || "/images/placeholder.jpg")
                      }
                      alt={product.name}
                      className="h-24 w-20 object-cover rounded-lg border border-gray-200 bg-white"
                    />
                    <div className="flex flex-col justify-center gap-1 min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#1A1A1A] line-clamp-2">{product.name}</p>
                      <p className="text-xs font-black" style={{ color: ACCENT }}>
                        {product.effectivePrice.toLocaleString("vi-VN")}đ
                      </p>
                      <span className="text-[10px] text-gray-500">Danh mục: {product.category?.name || "Khác"}</span>

                      {/* Color swatches selection */}
                      {product.variants && Array.from(new Map(product.variants.filter(v => v.color).map(v => [v.color!, v])).values()).length > 0 && (
                        <div className="mt-1 pt-1 border-t border-gray-200 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-gray-500">Màu sắc:</span>
                          {Array.from(new Map(product.variants.filter(v => v.color).map(v => [v.color!, v])).values()).map((v) => {
                            const isSel = selectedVariant?.color === v.color;
                            return (
                              <button
                                key={v.color!}
                                type="button"
                                onClick={() => setSelectedVariant(v)}
                                title={v.color!}
                                className={`w-5 h-5 rounded-full border transition-all ${
                                  isSel ? "ring-2 ring-black border-white scale-110" : "border-gray-300 opacity-70 hover:opacity-100"
                                }`}
                                style={{ backgroundColor: v.colorHex || "#ccc" }}
                              />
                            );
                          })}
                          {selectedVariant?.color && (
                            <span className="text-[10px] font-semibold text-black ml-1">
                              {selectedVariant.color}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-400 -mt-1">
                    Chọn 1 trong các bộ trang phục bên dưới để AI thử mặc lên ảnh của bạn:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {PRESET_OUTFITS.map((outfit) => {
                      const isSelected = !useCustomProduct && selectedPresetId === outfit.id;
                      return (
                        <button
                          key={outfit.id}
                          type="button"
                          onClick={() => {
                            setUseCustomProduct(false);
                            setSelectedPresetId(outfit.id);
                            setError("");
                          }}
                          className="group relative overflow-hidden rounded-xl border-2 transition-all duration-200 focus:outline-none"
                          style={{
                            borderColor: isSelected ? ACCENT : "#e5e7eb",
                            boxShadow: isSelected ? `0 0 0 3px rgba(0,0,0,0.15)` : "none",
                          }}
                        >
                          <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f9f9f9]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={outfit.url}
                              alt={outfit.label}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {isSelected && (
                              <div
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ background: `rgba(0,0,0,0.2)` }}
                              >
                                <div
                                  className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow-lg text-lg"
                                  style={{ background: ACCENT }}
                                >
                                  ✓
                                </div>
                              </div>
                            )}
                          </div>
                          <div
                            className="py-2 text-center text-xs font-semibold"
                            style={{ color: isSelected ? ACCENT : "#555" }}
                          >
                            {outfit.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Model AI selection */}
              <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Chọn mô hình AI:</span>
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value as "IDM_VTON" | "OOTDIFFUSION" | "OPENAI")}
                  className="text-xs border border-gray-300 rounded-lg px-2 py-1 font-medium bg-white focus:outline-none"
                >
                  <option value="IDM_VTON">IDM-VTON (Cao cấp - Phù hợp dáng)</option>
                  <option value="OOTDIFFUSION">OOTDiffusion (Tốc độ cao)</option>
                  <option value="OPENAI">OpenAI Image Edit</option>
                </select>
              </div>
            </div>
          </div>

          {/* Requirements & Tips Banner */}
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-2 flex items-center gap-1.5">
              <span>💡</span>
              Hướng dẫn chụp & tải ảnh để AI xử lý đẹp nhất:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
              {TIPS.map((tip, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-medium text-red-600">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          {step !== "result" && (
            <button
              type="button"
              disabled={!personFile || isProcessing}
              onClick={handleTryOn}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl py-4 text-sm font-bold uppercase tracking-widest text-white shadow-md transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: personFile && !isProcessing ? ACCENT : "#ccc",
              }}
            >
              {isProcessing ? (
                <>
                  <WaveBars />
                  <span className="ml-2">AI đang xử lý ghép đồ...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">✨</span>
                  <span>Thử Đồ Ngay Với AI ✦</span>
                </>
              )}
            </button>
          )}

          {/* Loading Animation Overlay during AI Processing */}
          {isProcessing && (
            <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-gray-200 bg-white p-10 shadow-sm text-center">
              <RippleLoader />
              <div className="flex flex-col items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-black">Đang Tạo Kết Quả Thử Đồ AI</h3>
                <RotatingTip />
                <p className="text-[11px] text-gray-400 max-w-xs mt-2">
                  Quá trình này mất khoảng 15-25 giây. Vui lòng giữ nguyên màn hình.
                </p>
              </div>
            </div>
          )}

          {/* AI Result Card */}
          {isDone && resultUrl && (
            <div className="flex flex-col gap-5 rounded-2xl border bg-white p-6 shadow-md" style={{ borderColor: `rgba(0,0,0,0.15)` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎉</span>
                  <h3 className="font-serif text-xl font-bold text-black">Kết Quả Thử Đồ AI ✦</h3>
                </div>
                <button
                  type="button"
                  onClick={resetAll}
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
                >
                  🔄 Thử bộ khác
                </button>
              </div>

              <div className="relative flex min-h-[380px] max-h-[600px] w-full items-center justify-center overflow-hidden rounded-xl bg-[#111]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultUrl}
                  alt="Kết quả thử đồ AI"
                  className="max-h-[600px] w-full object-contain shadow-2xl"
                />
              </div>

              {/* QR Code Section */}
              <div
                className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border p-4 bg-gray-50"
                style={{ borderColor: `rgba(0,0,0,0.1)` }}
              >
                {/* QR Code */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div
                    className="rounded-xl p-3 bg-white shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                    style={{ borderColor: `rgba(0,0,0,0.1)` }}
                    onClick={() => setIsQrModalOpen(true)}
                    title="Bấm để phóng to QR"
                  >
                    <QRCodeSVG
                      value={resultUrl}
                      size={100}
                      fgColor={ACCENT}
                      bgColor="#ffffff"
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">Bấm để phóng to</span>
                </div>

                {/* Instructions */}
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">📲</span>
                    <p className="text-sm font-bold text-[#1A1A1A]">Tải ảnh về điện thoại qua mã QR</p>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Mở camera điện thoại → quét mã QR → ảnh mở ra trong trình duyệt → giữ ảnh để lưu về máy.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setIsQrModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl py-2 px-4 text-xs font-bold text-white shadow transition hover:opacity-90"
                      style={{ background: ACCENT }}
                    >
                      🔍 Phóng to QR
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 rounded-xl py-2 px-4 text-xs font-bold border transition hover:bg-gray-50"
                      style={{ borderColor: ACCENT, color: copied ? "#22c55e" : ACCENT }}
                    >
                      <span>{copied ? "✓" : "📋"}</span>
                      {copied ? "Đã sao chép!" : "Sao chép link"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <a
                  href={resultUrl}
                  target="_blank"
                  rel="noreferrer"
                  download="virtual-tryon.jpg"
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl py-3 px-6 text-xs font-bold uppercase tracking-widest text-white shadow transition hover:opacity-90"
                  style={{ background: ACCENT }}
                >
                  📥 Tải ảnh về máy
                </a>

                {product && (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl py-3 px-6 text-xs font-bold uppercase tracking-widest text-white shadow transition"
                    style={{ background: addedToCart ? "#22c55e" : "#1A1A1A" }}
                  >
                    {addedToCart ? "✓ Đã thêm vào giỏ!" : "🛒 Thêm sản phẩm vào giỏ"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={resetAll}
                  className="w-full sm:w-auto text-xs font-semibold text-gray-500 hover:text-black py-2"
                >
                  Thử chụp & thử đồ lại
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => {
          handlePersonFile(file);
        }}
      />

      {/* QR Code Full Screen Modal */}
      {resultUrl && (
        <QrCodeModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          resultUrl={resultUrl}
        />
      )}
    </div>
  );
}

export default function TryOnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
          <div className="text-gray-400 text-sm">Đang tải...</div>
        </div>
      }
    >
      <TryOnContent />
    </Suspense>
  );
}
