"use client";

import { useLocale, type Locale } from "@/context/LocaleContext";

interface LanguageSwitcherProps {
  className?: string;
}

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: "vi", label: "VI", flag: "🇻🇳" },
  { code: "en", label: "EN", flag: "🇬🇧" },
];

/**
 * Compact language switcher — renders two flag+label buttons.
 * Designed to fit inside the Header right-actions row.
 *
 * Active language is highlighted with yellow accent.
 */
export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={`flex items-center gap-0.5 bg-slate-100 rounded-full p-0.5 ${className}`}
      role="group"
      aria-label="Language selector"
    >
      {LANGUAGES.map(({ code, label, flag }) => {
        const isActive = locale === code;
        return (
          <button
            key={code}
            onClick={() => setLocale(code)}
            aria-pressed={isActive}
            aria-label={`Switch to ${code === "vi" ? "Vietnamese" : "English"}`}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-black tracking-wide transition-all duration-200 ${
              isActive
                ? "bg-[#FCCE00] text-[#1A1A1A] shadow-sm"
                : "text-slate-500 hover:text-[#1A1A1A]"
            }`}
          >
            <span className="text-sm leading-none">{flag}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
