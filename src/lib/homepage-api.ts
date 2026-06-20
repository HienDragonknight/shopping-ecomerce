import type {
  ApiBannerSlide,
  ApiCollection,
  ApiProductSection,
  ApiBlogPost,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081/api";

/**
 * Generic fetcher — throws on HTTP error.
 * Uses `no-store` so homepage is always fresh (can switch to ISR with `revalidate`).
 */
async function apiFetch<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API ${url} returned ${res.status}`);
  }
  const json = await res.json();
  // All backend responses are wrapped: { success, data }
  return json.data as T;
}

// ─── Homepage endpoints ───────────────────────────────────────────────────────

export async function getHomepageBanners(): Promise<ApiBannerSlide[]> {
  try {
    return await apiFetch<ApiBannerSlide[]>("/homepage/banners");
  } catch {
    return [];
  }
}

export async function getHomepageCollections(): Promise<ApiCollection[]> {
  try {
    return await apiFetch<ApiCollection[]>("/homepage/collections");
  } catch {
    return [];
  }
}

export async function getHomepageSections(): Promise<ApiProductSection[]> {
  try {
    return await apiFetch<ApiProductSection[]>("/homepage/sections");
  } catch {
    return [];
  }
}

export async function getHomepageBlogPosts(): Promise<ApiBlogPost[]> {
  try {
    return await apiFetch<ApiBlogPost[]>("/homepage/blog-posts");
  } catch {
    return [];
  }
}
