"use client";

import { useEffect, useRef, useState } from "react";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export default function CameraCaptureModal({ isOpen, onClose, onCapture }: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // Sensor metrics
  const [lightStatus, setLightStatus] = useState<{ type: string; text: string }>({
    type: "normal",
    text: "Đang kiểm tra ánh sáng...",
  });

  // Start video stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return undefined;
    }

    let isMounted = true;

    async function startCamera() {
      try {
        setErrorMessage("");
        setHasPermission(null);
        if (streamRef.current) {
          stopCamera();
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 960 }, // 4:3 ratio
            facingMode: facingMode,
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setHasPermission(true);
      } catch {
        if (!isMounted) return;
        setHasPermission(false);
        setErrorMessage("Không thể truy cập camera. Vui lòng cấp quyền sử dụng camera trong trình duyệt.");
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen, facingMode]);

  // Real-time brightness & glare analysis
  useEffect(() => {
    if (!isOpen || !hasPermission) return undefined;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, 160, 90);
      const imgData = ctx.getImageData(0, 0, 160, 90).data;

      let totalLuminance = 0;
      let brightPixelCount = 0;
      const totalPixels = 160 * 90;

      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuminance += lum;
        if (lum > 235) {
          brightPixelCount++;
        }
      }

      const avgLum = totalLuminance / totalPixels;
      const glareRatio = brightPixelCount / totalPixels;

      if (glareRatio > 0.2 || avgLum > 205) {
        setLightStatus({
          type: "warning-glare",
          text: "⚠️ Ánh sáng quá chói! Vui lòng xoay người tránh nguồn sáng mạnh chiếu thẳng camera.",
        });
      } else if (avgLum < 45) {
        setLightStatus({
          type: "warning-dark",
          text: "⚠️ Môi trường quá tối! Vui lòng tăng ánh sáng phòng.",
        });
      } else {
        setLightStatus({
          type: "good",
          text: "✅ Khung hình & ánh sáng đạt chuẩn!",
        });
      }
    }, 350);

    return () => clearInterval(interval);
  }, [isOpen, hasPermission]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCountdown = () => {
    if (countdown !== null) return;
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return undefined;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Countdown reached 0 -> Take photo
    takeSnapshot();
    setCountdown(null);
  }, [countdown]); // eslint-disable-line

  const takeSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;

    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 960;

    const targetAspect = 3 / 4;
    let cropW = vw;
    let cropH = vh;
    let cropX = 0;
    let cropY = 0;

    if (vw / vh > targetAspect) {
      cropW = Math.round(vh * targetAspect);
      cropX = Math.round((vw - cropW) / 2);
    } else {
      cropH = Math.round(vw / targetAspect);
      cropY = Math.round((vh - cropH) / 2);
    }

    const outW = 768;
    const outH = 1024;

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(outW, 0);
      ctx.scale(-1, 1);
    }

    ctx.filter = "contrast(1.08) brightness(1.03) saturate(1.05)";
    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: "image/jpeg" });
          onCapture(file);
          onClose();
        }
      },
      "image/jpeg",
      0.96
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-[#111111] shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-black/40">
          <div className="flex items-center gap-2">
            <span className="text-xl">📸</span>
            <h3 className="font-serif text-lg font-bold text-white">Chụp Ảnh Thử Đồ AI</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            ✕
          </button>
        </div>

        {/* Camera Viewfinder Container */}
        <div className="relative flex min-h-[420px] w-full items-center justify-center bg-black overflow-hidden">
          {hasPermission === false ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center text-red-400">
              <span className="text-5xl">📷</span>
              <p className="text-sm font-medium">{errorMessage}</p>
              <button
                onClick={onClose}
                className="mt-4 rounded-full bg-white/10 px-6 py-2 text-xs font-semibold uppercase text-white hover:bg-white/20"
              >
                Đóng
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className={`h-full max-h-[540px] w-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
              />

              {/* Bounding Silhouette & Distance Guideline Overlay */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between p-6">
                <div className="rounded-full bg-black/60 px-4 py-1.5 text-xs font-medium text-amber-200 backdrop-blur-md border border-amber-500/30 shadow-lg flex items-center gap-2">
                  <span>📏</span>
                  <span>Giữ khoảng cách <b>1.5m - 2.0m</b> (Đứng lùi lại để vừa thân người)</span>
                </div>

                <div className="relative flex h-[320px] w-[210px] flex-col items-center justify-between rounded-3xl border-2 border-dashed border-white/40 bg-white/5 p-4 backdrop-blur-[1px]">
                  <div className="h-16 w-16 rounded-full border-2 border-white/60 bg-white/10" />
                  <div className="h-40 w-36 rounded-t-3xl border-2 border-white/60 bg-white/10" />
                  <span className="text-[10px] uppercase tracking-widest text-white/70">Khung Căn Chỉnh</span>
                </div>

                <div
                  className={`rounded-full px-5 py-2 text-xs font-semibold backdrop-blur-md shadow-lg transition-all duration-300 ${
                    lightStatus.type.startsWith("warning")
                      ? "bg-red-500/80 text-white border border-red-400"
                      : "bg-emerald-600/90 text-white border border-emerald-400"
                  }`}
                >
                  {lightStatus.text}
                </div>
              </div>

              {/* Countdown Big Display */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <span
                    key={countdown}
                    className="font-serif text-9xl font-extrabold text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.8)] animate-pulse"
                  >
                    {countdown}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-black/60">
          <button
            onClick={() => setFacingMode((prev) => (prev === "user" ? "environment" : "user"))}
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            disabled={countdown !== null}
          >
            <span>🔄</span>
            <span>Đổi Camera</span>
          </button>

          <button
            onClick={startCountdown}
            disabled={countdown !== null || hasPermission !== true}
            className="flex items-center gap-3 rounded-full bg-white text-black px-8 py-3 text-xs font-bold uppercase tracking-widest transition hover:bg-gray-100 hover:scale-105 disabled:opacity-50 shadow-lg"
          >
            <span>⏱️</span>
            <span>{countdown !== null ? `Đang đếm ngược (${countdown}s)...` : "Chụp Ảnh (Đếm ngược 3s)"}</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-full bg-white/10 px-5 py-2 text-xs font-semibold uppercase text-white/80 transition hover:bg-white/20"
            disabled={countdown !== null}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
