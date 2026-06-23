import { vi } from "./vi";
import { en } from "./en";
import type { Dict } from "./types";

/**
 * Returns the translation dictionary for a given locale.
 * Locale "en" returns the English dictionary.
 * Locale "vi" (or anything else) returns Vietnamese.
 */
export function getDictionary(locale: "vi" | "en"): Dict {
  return locale === "en" ? en : vi;
}

export type { Dict };
export { vi, en };
