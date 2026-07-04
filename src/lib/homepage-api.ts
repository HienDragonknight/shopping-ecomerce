import type {
  ApiBannerSlide,
  ApiCollection,
  ApiProductSection,
  ApiBlogPost,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://fashion-backend-production-8e3b.up.railway.app/api";

/**
 * Generic fetcher — throws on HTTP error.
 * Accepts an optional `lang` ("vi" | "en") to send as Accept-Language header,
 * so the backend resolves bilingual fields (name_en, description_en, etc.)
 */
async function apiFetch<T>(path: string, lang = "vi"): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "Accept-Language": lang === "en" ? "en" : "vi",
    },
  });
  if (!res.ok) {
    throw new Error(`API ${url} returned ${res.status}`);
  }
  const json = await res.json();
  // All backend responses are wrapped: { success, data }
  return json.data as T;
}

// ─── Homepage endpoints ───────────────────────────────────────────────────────

export async function getHomepageBanners(lang = "vi"): Promise<ApiBannerSlide[]> {
  try {
    return await apiFetch<ApiBannerSlide[]>("/homepage/banners", lang);
  } catch {
    return [];
  }
}

export async function getHomepageCollections(lang = "vi"): Promise<ApiCollection[]> {
  try {
    return await apiFetch<ApiCollection[]>("/homepage/collections", lang);
  } catch {
    return [];
  }
}

export async function getHomepageSections(lang = "vi"): Promise<ApiProductSection[]> {
  try {
    return await apiFetch<ApiProductSection[]>("/homepage/sections", lang);
  } catch {
    return [];
  }
}

export async function getHomepageBlogPosts(lang = "vi"): Promise<ApiBlogPost[]> {
  try {
    return await apiFetch<ApiBlogPost[]>("/homepage/blog-posts", lang);
  } catch {
    return [];
  }
}
