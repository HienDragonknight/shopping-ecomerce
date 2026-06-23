"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";

export type Locale = "vi" | "en";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** true while the auto-detected banner should be shown */
  showTranslationBanner: boolean;
  dismissBanner: () => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "vi",
  setLocale: () => {},
  showTranslationBanner: false,
  dismissBanner: () => {},
});

const COOKIE_KEY = "NEXT_LOCALE";
const COOKIE_EXPIRES = 365; // days
const BANNER_DISMISSED_KEY = "LOCALE_BANNER_DISMISSED";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");
  const [showTranslationBanner, setShowTranslationBanner] = useState(false);

  // On first mount: read saved cookie OR show language banner on first visit
  useEffect(() => {
    const saved = Cookies.get(COOKIE_KEY) as Locale | undefined;

    if (saved === "en" || saved === "vi") {
      // User has an explicit preference — honour it, no banner
      setLocaleState(saved);
      return;
    }

    // First visit (no cookie) — detect browser language as hint
    const langs = [
      navigator.language,
      ...(navigator.languages || []),
    ].map(l => (l || "").toLowerCase());

    const isEnglish = langs.some(l => l.startsWith("en"));

    if (isEnglish) {
      // English browser → auto-switch to EN
      setLocaleState("en");
      Cookies.set(COOKIE_KEY, "en", { expires: COOKIE_EXPIRES, sameSite: "lax" });
    } else {
      // Vietnamese / other → default VI, save cookie so we don't loop
      setLocaleState("vi");
      Cookies.set(COOKIE_KEY, "vi", { expires: COOKIE_EXPIRES, sameSite: "lax" });
    }

    // Always show the banner on first visit so user can switch if needed
    const alreadyDismissed = sessionStorage.getItem(BANNER_DISMISSED_KEY);
    if (!alreadyDismissed) setShowTranslationBanner(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    Cookies.set(COOKIE_KEY, newLocale, { expires: COOKIE_EXPIRES, sameSite: "lax" });
    setShowTranslationBanner(false);
  }, []);

  const dismissBanner = useCallback(() => {
    setShowTranslationBanner(false);
    sessionStorage.setItem(BANNER_DISMISSED_KEY, "1");
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, showTranslationBanner, dismissBanner }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

/**
 * Returns the locale code stored in the NEXT_LOCALE cookie.
 * Safe to call in non-React contexts (e.g. api.ts interceptor).
 */
export function getStoredLocale(): Locale {
  if (typeof document === "undefined") return "vi"; // SSR
  const raw = Cookies.get(COOKIE_KEY);
  return raw === "en" ? "en" : "vi";
}
