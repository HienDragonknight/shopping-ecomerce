"use client";

import { useMemo } from "react";
import { useLocale } from "@/context/LocaleContext";
import { getDictionary, type Dict } from "@/i18n";

/**
 * `useT` — translation hook shorthand.
 *
 * Returns the full typed dictionary for the current locale.
 *
 * Usage:
 * ```tsx
 * const t = useT();
 * <button>{t.product.addToCart}</button>
 * <p>{t.product.stockCount(5)}</p>
 * ```
 *
 * The returned object is stable across re-renders unless the locale changes.
 * Functions in the dictionary (e.g. `stockCount`) are typed and callable inline.
 */
export function useT(): Dict {
  const { locale } = useLocale();
  return useMemo(() => getDictionary(locale), [locale]);
}
