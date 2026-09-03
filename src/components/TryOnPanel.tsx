"use client";

import { useState, useRef, useEffect } from "react";
import { getAccessToken } from "@/lib/auth";
import { compressImage, safeParseJson } from "@/lib/image-utils";

const BLACK = "#1A1A1A";

interface Props {
  productId: number;
  productName: string;
  productImageUrl: string | null;
}

type PanelStep = "idle" | "processing" | "result" | "error";

const TIPS = [
  "Use a full-body or upper-body photo",
  "Good lighting & clear background",
  "Face the camera directly",
  "No other people in the photo",
];

const AI_TIPS = [
  "✨ AI is analyzing your photo...",
  "🎨 Matching fabric texture & draping...",
  "👗 Fitting the garment to your body...",
  "💡 Adjusting lighting & shadows...",
  "🔍 Preserving every detail of your face...",
  "🚀 Almost done! Finalizing the result...",
];

/* ── Ripple Wave Loader ─────────────────────────────────────────── */
function RippleLoader() {
  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      {/* Ripple rings */}
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="absolute rounded-full border-2"
          style={{
            width: `${(i + 1) * 28}%`,
            height: `${(i + 1) * 28}%`,
            borderColor: BLACK,
            opacity: 1 - i * 0.2,
            animation: `ripple 2s ease-out ${i * 0.4}s infinite`,
          }}
        />
      ))}

      {/* Pulsing center orb */}
      <div
        className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at 35% 35%, #4b5563, ${BLACK})`,
          boxShadow: `0 0 24px ${BLACK}60`,
          animation: "pulse-orb 1.5s ease-in-out infinite",
        }}
      >
        {/* Clothing icon */}
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.86H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.86l.58-3.57a2 2 0 00-1.34-2.23z" />
        </svg>
      </div>

      {/* Orbiting dot */}
      <span
        className="absolute w-3 h-3 rounded-full"
        style={{
          background: BLACK,
          boxShadow: `0 0 8px ${BLACK}`,
          animation: "orbit 2s linear infinite",
          top: "50%",
          left: "50%",
          transformOrigin: "0 0",
          marginTop: "-6px",
          marginLeft: "-6px",
        }}
      />
    </div>
  );
}

/* ── Wave Bar Loader (below main) ──────────────────────────────── */
function WaveBars() {
  return (
    <div className="flex items-end gap-1 h-8">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <span
          key={i}
          className="w-1.5 rounded-full"
          style={{
            background: `linear-gradient(to top, ${BLACK}, #6b7280)`,
            animation: `wave-bar 1.2s ease-in-out ${i * 0.1}s infinite`,
            height: "100%",
          }}
        />
      ))}
    </div>
  );
}

/* ── Rotating AI Tip ───────────────────────────────────────────── */
function RotatingTip() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % AI_TIPS.length);
        setFade(true);
      }, 300);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <p
      className="text-xs text-center font-medium max-w-[180px] leading-relaxed transition-opacity duration-300"
      style={{ color: BLACK, opacity: fade ? 1 : 0 }}
    >
      {AI_TIPS[idx]}
    </p>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function TryOnPanel({ productId, productName, productImageUrl }: Props) {
  const [step, setStep] = useState<PanelStep>("idle");
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Vui lòng chọn file ảnh"); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Ảnh tối đa 10MB"); return; }
    setError(""); setPersonFile(file); setPersonPreview(URL.createObjectURL(file));
  };

  const handleTryOn = async () => {
    if (!personFile) return;
    setStep("processing");
    setError("");
    try {
      let garmentFile: File | null = null;
      if (productImageUrl && !productImageUrl.startsWith("data:")) {
        try {
          const res = await fetch(productImageUrl);
          if (res.ok) {
            const blob = await res.blob();
            if (blob.size > 0) {
              garmentFile = new File([blob], "garment.jpg", { type: blob.type || "image/jpeg" });
            }
          }
        } catch (e) {
          console.warn("[TryOnPanel] Fetching productImageUrl failed, fallback to server fetch:", e);
        }
      }

      // Compress person image before uploading to avoid Vercel 4.5MB limits
      const compressedPersonFile = await compressImage(personFile, 1200, 0.85);

      const fd = new FormData();
      fd.append("personImage", compressedPersonFile);
      if (garmentFile && garmentFile.size > 0) {
        fd.append("garmentImage", garmentFile);
      }
      fd.append("garmentImageUrl", productImageUrl || "");
      fd.append("productId", String(productId));
      fd.append("productName", productName);
      fd.append("category", productName);
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
            setError(pollData.error || "AI xử lý thất bại. Vui lòng thử lại với ảnh khác.");
            setStep("error");
            return;
          }
        }

        setError("Quá thời gian xử lý của AI (Timeout). Vui lòng thử lại.");
        setStep("error");
        return;
      }

      setError("Không nhận được phản hồi từ hệ thống AI. Vui lòng thử lại.");
      setStep("error");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định khi kết nối AI");
      setStep("error");
    }
  };

  const reset = () => {
    setStep("idle"); setPersonFile(null); setPersonPreview(null);
    setResultUrl(null); setError("");
  };

  const isProcessing = step === "processing";
  const isDone = step === "result";

  return (
    <>
      {/* ── Keyframe animations injected as a style tag ── */}
      <style>{`
        @keyframes ripple {
          0%   { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes pulse-orb {
          0%, 100% { transform: scale(1);    box-shadow: 0 0 24px #1A1A1A60; }
          50%       { transform: scale(1.12); box-shadow: 0 0 40px #1A1A1A90; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg)   translateX(48px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(48px) rotate(-360deg); }
        }
        @keyframes wave-bar {
          0%, 100% { transform: scaleY(0.3); }
          50%       { transform: scaleY(1);   }
        }
        @keyframes shimmer-slide {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr] gap-6 items-start">

        {/* ── Col 1: Upload ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0"
              style={{ background: BLACK }}>1</span>
            <p className="font-bold text-sm text-[#1A1A1A]">Upload Photo</p>
          </div>

          <div
            onClick={() => !personPreview && fileRef.current?.click()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onDragOver={e => e.preventDefault()}
            className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-all
              ${personPreview ? "border-gray-200" : "cursor-pointer hover:border-black"}`}
            style={{ borderColor: personPreview ? "#e5e7eb" : BLACK, minHeight: 220 }}
          >
            {personPreview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={personPreview} alt="Ảnh của bạn" className="w-full object-contain" style={{ maxHeight: 480, background: '#f9f9f9' }} />
                <button onClick={e => { e.stopPropagation(); reset(); }}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-[11px] hover:bg-black transition-colors">✕</button>
                <div className="absolute bottom-2 left-2 text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: BLACK }}>
                  ✓ Đã chọn
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-56 gap-2 px-4">
                <svg className="w-10 h-10 opacity-60" style={{ color: BLACK }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="font-bold text-sm text-[#1A1A1A] text-center">Upload your photo</p>
                <p className="text-xs text-gray-400">JPG, PNG or WEBP · 10MB</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

          {!personPreview && (
            <button onClick={() => fileRef.current?.click()}
              className="w-full py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:bg-black/90 active:scale-[0.98] shadow-sm"
              style={{ background: BLACK }}>
              Chọn ảnh
            </button>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Tips for best results:</p>
            <div className="space-y-1.5">
              {TIPS.map((tip, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 shrink-0" style={{ color: BLACK }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Col 2: Processing / CTA ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0"
              style={{ background: isProcessing ? BLACK : "#f3f4f6", color: isProcessing ? "white" : "#9ca3af" }}>2</span>
            <p className={`font-bold text-sm ${isProcessing ? "text-[#1A1A1A]" : "text-gray-400"}`}>AI Processing</p>
          </div>

          <div
            className="border-2 rounded-xl flex flex-col items-center justify-center gap-4 py-8 px-4 transition-all duration-500"
            style={{
              minHeight: 220,
              borderColor: isProcessing ? `${BLACK}40` : "#f3f4f6",
              borderStyle: isProcessing ? "solid" : "dashed",
              background: isProcessing ? `linear-gradient(135deg, #f9fafb 0%, #fff 100%)` : "transparent",
            }}
          >
            {isProcessing ? (
              <>
                {/* Main ripple loader */}
                <RippleLoader />

                {/* Wave bars */}
                <WaveBars />

                {/* Rotating tips */}
                <RotatingTip />

                {/* Shimmer progress bar */}
                <div className="w-full max-w-[180px] h-1.5 rounded-full overflow-hidden bg-gray-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, ${BLACK} 50%, transparent 100%)`,
                      backgroundSize: "200% 100%",
                      animation: "shimmer-slide 1.5s linear infinite",
                    }}
                  />
                </div>
              </>
            ) : isDone ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: `${BLACK}15` }}>
                  <svg className="w-7 h-7" style={{ color: BLACK }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-bold text-sm text-[#1A1A1A]">Completed!</p>
                <p className="text-xs text-gray-400 text-center">Kết quả đã sẵn sàng 🎉</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 opacity-40">
                <div className="w-16 h-16 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center">
                  <span className="text-base font-black text-gray-300">AI</span>
                </div>
                <p className="text-xs text-gray-400">Waiting for photo...</p>
              </div>
            )}
          </div>

          {(step === "idle" || step === "error") && (
            <>
              {productImageUrl && (
                <div className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={productImageUrl} alt={productName} className="w-12 h-14 object-contain rounded-lg bg-white border border-gray-100 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Mẫu thử đang chọn</p>
                    <p className="text-xs font-bold text-[#1A1A1A] truncate">{productName}</p>
                  </div>
                </div>
              )}
              {error && <p className="text-xs text-red-500 text-center font-medium">{error}</p>}
              <button
                onClick={handleTryOn}
                disabled={!personFile}
                className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all hover:bg-black/90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                style={{ background: personFile ? BLACK : "#d1d5db" }}
              >
                Try On Now ✦
              </button>
              <p className="text-center text-[10px] text-gray-400">
                By using Try On, you agree to our{" "}
                <span className="underline cursor-pointer" style={{ color: BLACK }}>Terms of Service</span>
              </p>
            </>
          )}
        </div>

        {/* ── Col 3: Result ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0"
              style={{ background: isDone ? BLACK : "#f3f4f6", color: isDone ? "white" : "#9ca3af" }}>3</span>
            <p className={`font-bold text-sm ${isDone ? "text-[#1A1A1A]" : "text-gray-400"}`}>Try-On Result</p>
          </div>

          {isDone && resultUrl ? (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl overflow-hidden border border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resultUrl} alt="Kết quả thử đồ" className="w-full object-contain" style={{ background: '#f9f9f9' }} />
              </div>
              <div className="flex gap-2">
                <a href={resultUrl} download="virtual-tryon.png" target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-gray-400 hover:text-black transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </a>
                <button
                  onClick={() => { if (navigator.share) navigator.share({ url: resultUrl, title: "My Try-On Result" }).catch(() => {}); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-gray-400 hover:text-black transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                  </svg>
                  Share
                </button>
              </div>
              <button onClick={reset}
                className="w-full py-2.5 border-2 rounded-xl text-sm font-bold transition-all hover:bg-black hover:text-white"
                style={{ borderColor: BLACK, color: BLACK }}>
                Try another photo
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center" style={{ minHeight: 220 }}>
              {isProcessing ? (
                /* Mini ripple on result panel while waiting */
                <div className="flex flex-col items-center gap-3 opacity-60">
                  <div className="relative w-12 h-12">
                    {[0, 1].map(i => (
                      <span key={i} className="absolute inset-0 rounded-full border"
                        style={{ borderColor: BLACK, animation: `ripple 1.8s ease-out ${i * 0.6}s infinite` }} />
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-black" style={{ color: BLACK }}>✦</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Generating...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 opacity-30">
                  <svg className="w-14 h-14 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-gray-400">Result will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
