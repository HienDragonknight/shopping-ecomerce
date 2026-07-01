"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { getAccessToken } from "@/lib/auth";

const PINK = "#FF2D78";

interface ProductInfo {
  id: number; name: string; slug: string;
  thumbnailUrl: string | null; effectivePrice: number;
  category?: { name: string };
}

type Step = "upload" | "processing" | "result" | "error";

function TryOnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const productId = searchParams.get("productId");

  const [step, setStep] = useState<Step>("upload");
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!productId) return;
    setLoadingProduct(true);
    api.get(`/products/${productId}`)
      .then(r => setProduct(r.data.data))
      .catch(() => setProduct(null))
      .finally(() => setLoadingProduct(false));
  }, [productId]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Vui lòng chọn file ảnh"); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Ảnh tối đa 10MB"); return; }
    setError(""); setPersonFile(file); setPersonPreview(URL.createObjectURL(file));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  }, []); // eslint-disable-line

  const handleTryOn = async () => {
    if (!personFile || !product) return;
    setStep("processing"); setProgress(10); setError("");
    const iv = setInterval(() => setProgress(p => Math.min(p + 8, 88)), 2500);
    try {
      const fd = new FormData();
      fd.append("personImage", personFile);
      fd.append("garmentImageUrl", product.thumbnailUrl || "");
      fd.append("productId", String(product.id));
      fd.append("productName", product.name);
      const token = getAccessToken();
      if (token) fd.append("authToken", token);

      const res = await fetch("/api/try-on", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error || "Thử đồ thất bại"); setStep("error"); return; }
      setResultUrl(data.resultUrl); setProgress(100); setStep("result");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định"); setStep("error");
    } finally { clearInterval(iv); }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) { router.push(`/account/login?redirect=/try-on?productId=${product.id}`); return; }
    try {
      const r = await api.get(`/products/${product.slug}`);
      const variants = r.data.data.variants || [];
      const v = variants.find((x: { stockQty: number }) => x.stockQty > 0) || variants[0];
      if (v) await addItem(v.id, 1);
      setAddedToCart(true); setTimeout(() => setAddedToCart(false), 2500);
    } catch { /* ignore */ }
  };

  const reset = () => {
    setStep("upload"); setResultUrl(null); setError("");
    setProgress(0); setPersonFile(null); setPersonPreview(null);
  };

  const isProcessing = step === "processing";
  const isDone = step === "result";

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* ── Top nav ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-400 hover:text-black">Home</Link>
          <span className="text-gray-300">/</span>
          {product && <><Link href="/products" className="text-gray-400 hover:text-black">Products</Link><span className="text-gray-300">/</span></>}
          <span className="font-semibold text-gray-700">Virtual Try-On</span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full text-white" style={{ background: PINK }}>
            ✦ AI Powered
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black mb-2">Virtual Try-On</h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Upload your photo and see how the outfit looks on you — powered by AI
          </p>
        </div>

        {/* ── Main 2-col layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

          {/* LEFT: Steps flow */}
          <div className="space-y-6">

            {/* Step flow visual (3 boxes like mockup bottom section) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-start">

                {/* Step 1 — Upload Photo */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 self-start">
                    <span className="w-7 h-7 rounded-full text-white text-xs font-black flex items-center justify-center" style={{ background: PINK }}>1</span>
                    <p className="font-bold text-sm text-[#1A1A1A]">Upload Photo</p>
                  </div>
                  <div
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => !personPreview && fileRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl overflow-hidden transition-all
                      ${personPreview ? "border-gray-200" : "cursor-pointer"}`}
                    style={{ borderColor: personPreview ? "#e5e7eb" : PINK, minHeight: 200 }}
                  >
                    {personPreview ? (
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={personPreview} alt="Bạn" className="w-full h-48 object-cover" />
                        <button onClick={e => { e.stopPropagation(); setPersonFile(null); setPersonPreview(null); }}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-[11px]">✕</button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 gap-2 px-4">
                        <svg className="w-10 h-10 opacity-50" style={{ color: PINK }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm font-semibold text-gray-600 text-center">Kéo thả hoặc click</p>
                        <p className="text-xs text-gray-400">JPG, PNG, WEBP · 10MB</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  {!personPreview && (
                    <button onClick={() => fileRef.current?.click()}
                      className="w-full py-2.5 text-sm font-bold text-white rounded-xl transition-all"
                      style={{ background: PINK }}>
                      Chọn ảnh
                    </button>
                  )}
                </div>

                {/* Arrow 1 */}
                <div className="hidden md:flex items-center justify-center pt-10">
                  <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                {/* Step 2 — AI Processing */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 self-start">
                    <span className="w-7 h-7 rounded-full text-xs font-black flex items-center justify-center"
                      style={{ background: isProcessing ? PINK : "#f3f4f6", color: isProcessing ? "white" : "#9ca3af" }}>2</span>
                    <p className={`font-bold text-sm ${isProcessing ? "text-[#1A1A1A]" : "text-gray-400"}`}>AI Processing</p>
                  </div>
                  <div className="w-full border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 py-8 px-4" style={{ minHeight: 200 }}>
                    {isProcessing ? (
                      <>
                        {/* Circular spinner */}
                        <div className="relative w-20 h-20">
                          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="34" fill="none" stroke="#fce7ef" strokeWidth="7" />
                            <circle cx="40" cy="40" r="34" fill="none" strokeWidth="7"
                              stroke={PINK}
                              strokeDasharray={`${2 * Math.PI * 34}`}
                              strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
                              className="transition-all duration-1000" strokeLinecap="round" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-base font-black" style={{ color: PINK }}>AI</span>
                          </div>
                        </div>
                        <p className="font-bold text-sm text-[#1A1A1A] text-center">Generating your try-on...</p>
                        <p className="text-xs text-gray-400 text-center">This may take a few seconds</p>
                      </>
                    ) : isDone ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${PINK}15` }}>
                          <svg className="w-6 h-6" style={{ color: PINK }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-sm font-bold text-[#1A1A1A]">Completed!</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <div className="w-16 h-16 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center">
                          <span className="text-base font-black text-gray-300">AI</span>
                        </div>
                        <p className="text-xs text-gray-400">Waiting...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow 2 */}
                <div className="hidden md:flex items-center justify-center pt-10">
                  <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                {/* Step 3 — Try-On Result */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 self-start">
                    <span className="w-7 h-7 rounded-full text-xs font-black flex items-center justify-center"
                      style={{ background: isDone ? PINK : "#f3f4f6", color: isDone ? "white" : "#9ca3af" }}>3</span>
                    <p className={`font-bold text-sm ${isDone ? "text-[#1A1A1A]" : "text-gray-400"}`}>Try-On Result</p>
                  </div>
                  <div className="w-full border-2 border-dashed border-gray-200 rounded-xl overflow-hidden" style={{ minHeight: 200 }}>
                    {resultUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resultUrl} alt="Kết quả" className="w-full h-48 object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-48 opacity-30">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA */}
              {(step === "upload" || step === "error") && (
                <div className="mt-6 border-t border-gray-100 pt-5">
                  {error && <p className="text-xs text-red-500 text-center mb-3 font-medium">{error}</p>}
                  <button onClick={handleTryOn} disabled={!personFile || !product}
                    className="w-full py-4 rounded-xl font-bold text-white text-base transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: PINK }}>
                    Try On Now ✦
                  </button>
                </div>
              )}
            </div>

            {/* Privacy note */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
              <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-sm font-bold text-blue-700">Your privacy is our priority</p>
                <p className="text-xs text-blue-500 mt-0.5">Your photos are used only for virtual try-on and will be deleted after 24 hours.</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Product + Result panel */}
          <div className="space-y-4">
            {/* Product card */}
            {loadingProduct ? (
              <div className="bg-white rounded-2xl border border-gray-200 h-64 animate-pulse" />
            ) : product ? (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.thumbnailUrl || "https://placehold.co/400x300/f5f5f5/999?text=No+Image"}
                  alt={product.name} className="w-full h-52 object-cover" />
                <div className="p-4">
                  <p className="font-bold text-sm text-[#1A1A1A] line-clamp-2 mb-1">{product.name}</p>
                  <p className="text-sm font-black" style={{ color: PINK }}>{product.effectivePrice.toLocaleString("vi-VN")}đ</p>
                  <div className="mt-3 flex gap-2">
                    <Link href={`/product/${product.slug}`}
                      className="flex-1 text-center py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 hover:border-gray-400 hover:text-black transition-colors">
                      Xem chi tiết
                    </Link>
                    <button onClick={() => router.push("/try-on")}
                      className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 hover:border-gray-400 hover:text-black transition-colors">
                      Đổi sản phẩm
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 p-8">
                <p className="text-sm font-semibold text-gray-400">Chưa chọn sản phẩm</p>
                <Link href="/products" className="px-5 py-2 text-white text-sm font-bold rounded-full" style={{ background: PINK }}>
                  Chọn sản phẩm
                </Link>
              </div>
            )}

            {/* Result panel */}
            {step === "result" && resultUrl && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="font-bold text-sm text-[#1A1A1A] mb-1">Result</p>
                <p className="text-xs text-gray-400 mb-3">{"Here's how it looks on you!"}</p>
                <div className="rounded-xl overflow-hidden border border-gray-100 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resultUrl} alt="Kết quả thử đồ" className="w-full object-cover max-h-64" />
                </div>
                <div className="flex gap-2 mb-3">
                  <a href={resultUrl} download="virtual-tryon.png" target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-gray-400 hover:text-black transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                  <button
                    onClick={() => { if (navigator.share) navigator.share({ url: resultUrl, title: "My Try-On" }).catch(() => {}); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-gray-400 hover:text-black transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                    </svg>
                    Share
                  </button>
                </div>
                <button onClick={handleAddToCart}
                  className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98]`}
                  style={{ background: addedToCart ? "#16a34a" : PINK }}>
                  {addedToCart ? "✓ Đã thêm vào giỏ!" : "Thêm vào giỏ hàng"}
                </button>
                <button onClick={reset} className="w-full mt-2 py-2.5 border-2 rounded-xl text-sm font-bold transition-all"
                  style={{ borderColor: PINK, color: PINK }}>
                  Try another photo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TryOnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <div className="text-gray-400 text-sm">Đang tải...</div>
      </div>
    }>
      <TryOnContent />
    </Suspense>
  );
}
