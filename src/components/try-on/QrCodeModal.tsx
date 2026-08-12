"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultUrl: string;
}

const ACCENT = "#FF2D78";

export default function QrCodeModal({ isOpen, onClose, resultUrl }: QrCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !resultUrl) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(resultUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center gap-5 rounded-3xl bg-white p-8 shadow-2xl max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-1 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl mb-1 text-2xl"
            style={{ background: `${ACCENT}15` }}
          >
            📲
          </div>
          <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">Quét để tải ảnh về máy</h3>
          <p className="text-xs text-gray-400">Mở camera điện thoại và quét mã bên dưới</p>
        </div>

        {/* Large QR */}
        <div
          className="rounded-2xl p-4 bg-white shadow-lg border-2"
          style={{ borderColor: `${ACCENT}30` }}
        >
          <QRCodeSVG
            value={resultUrl}
            size={220}
            fgColor={ACCENT}
            bgColor="#ffffff"
            level="M"
            includeMargin={false}
          />
        </div>

        {/* Steps */}
        <div className="w-full flex flex-col gap-2">
          {[
            { icon: "📸", text: "Mở camera ứng dụng hoặc điện thoại" },
            { icon: "🔍", text: "Hướng camera vào mã QR" },
            { icon: "💾", text: "Giữ ảnh để lưu trực tiếp về máy" },
          ].map(({ icon, text }, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-white text-[11px] font-black"
                style={{ background: ACCENT }}
              >
                {i + 1}
              </div>
              <span className="text-xs text-gray-600 font-medium">{icon} {text}</span>
            </div>
          ))}
        </div>

        {/* Copy link */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition hover:bg-gray-50"
          style={{ borderColor: `${ACCENT}40`, color: copied ? "#22c55e" : ACCENT }}
        >
          <span>{copied ? "✓" : "📋"}</span>
          {copied ? "Đã sao chép link!" : "Sao chép link ảnh"}
        </button>
      </div>
    </div>
  );
}
