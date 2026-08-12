"use client";

import { useEffect, useState } from "react";

const ACCENT = "#FF2D78";

const AI_TIPS = [
  "AI đang phân tích khuôn mặt & vóc dáng của bạn...",
  "Đang nhận diện trang phục sản phẩm...",
  "Đang khớp chất liệu & độ rủ vải...",
  "Đang mặc trang phục lên cơ thể...",
  "Điều chỉnh ánh sáng & bóng đổ tự nhiên...",
  "Giữ nguyên khuôn mặt & góc chụp...",
  "Sắp hoàn thành! Đang hoàn thiện kết quả...",
];

export function RippleLoader() {
  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <style>{`
        @keyframes tryon-ripple {
          0%   { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes tryon-pulse-orb {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.12); }
        }
        @keyframes tryon-wave-bar {
          0%, 100% { transform: scaleY(0.3); }
          50%       { transform: scaleY(1); }
        }
      `}</style>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="absolute rounded-full border-2"
          style={{
            width: `${(i + 1) * 28}%`,
            height: `${(i + 1) * 28}%`,
            borderColor: ACCENT,
            opacity: 1 - i * 0.2,
            animation: `tryon-ripple 2s ease-out ${i * 0.4}s infinite`,
          }}
        />
      ))}
      <div
        className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full text-white text-2xl shadow-lg"
        style={{
          background: `radial-gradient(circle at 35% 35%, #ff6aa2, ${ACCENT})`,
          boxShadow: `0 0 24px ${ACCENT}60`,
          animation: "tryon-pulse-orb 1.5s ease-in-out infinite",
        }}
      >
        👗
      </div>
    </div>
  );
}

export function WaveBars() {
  return (
    <div className="flex h-6 items-end gap-1">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <span
          key={i}
          className="w-1.5 rounded-full bg-white"
          style={{
            animation: `tryon-wave-bar 1.2s ease-in-out ${i * 0.1}s infinite`,
            height: "100%",
          }}
        />
      ))}
    </div>
  );
}

export function RotatingTip() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % AI_TIPS.length);
        setFade(true);
      }, 300);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <p
      className="max-w-[260px] text-center text-xs font-semibold leading-relaxed transition-opacity duration-300"
      style={{ color: ACCENT, opacity: fade ? 1 : 0 }}
    >
      {AI_TIPS[idx]}
    </p>
  );
}
