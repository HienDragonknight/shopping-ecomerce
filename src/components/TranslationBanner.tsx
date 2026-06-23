"use client";

import { useLocale } from "@/context/LocaleContext";
import { X, Globe } from "lucide-react";
import { useEffect, useState } from "react";

export function TranslationBanner() {
  const { showTranslationBanner, dismissBanner, setLocale, locale } = useLocale();
  const [visible, setVisible] = useState(false);

  // Animate in after short delay
  useEffect(() => {
    if (showTranslationBanner) {
      const t = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [showTranslationBanner]);

  if (!showTranslationBanner) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="flex items-center gap-3 bg-[#1A1A1A] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 max-w-[92vw] w-max">
        {/* Icon */}
        <div className="w-8 h-8 rounded-full bg-[#FCCE00]/15 flex items-center justify-center shrink-0">
          <Globe size={15} className="text-[#FCCE00]" />
        </div>

        {/* Message */}
        <p className="text-sm text-white/80">
          {locale === "vi" ? (
            <>Bạn muốn xem trang bằng <span className="text-white font-semibold">Tiếng Anh</span>?</>
          ) : (
            <>Page is showing in <span className="text-[#FCCE00] font-semibold">English</span> — based on your browser</>
          )}
        </p>

        {/* Action button */}
        {locale === "vi" ? (
          <button
            onClick={() => setLocale("en")}
            className="flex items-center gap-1.5 text-xs font-bold text-[#1A1A1A] bg-[#FCCE00] hover:bg-[#E5B800] px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0"
          >
            🇬🇧 Switch to English
          </button>
        ) : (
          <button
            onClick={() => setLocale("vi")}
            className="text-xs font-semibold text-white/70 hover:text-white border border-white/20 hover:border-white/50 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0"
          >
            🇻🇳 Xem Tiếng Việt
          </button>
        )}

        {/* Dismiss */}
        <button
          onClick={dismissBanner}
          className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
          aria-label="Đóng"
        >
          <X size={13} className="text-white/40 hover:text-white/70" />
        </button>
      </div>
    </div>
  );
}
