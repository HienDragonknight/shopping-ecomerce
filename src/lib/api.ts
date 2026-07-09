import axios from "axios";

// In browser: use relative /api (proxied by Next.js rewrites → port 8080)
// In SSR: fall back to direct backend URL
const API_BASE =
  typeof window !== "undefined"
    ? "/api"
    : (process.env.NEXT_PUBLIC_API_URL || "https://fashion-backend-production-8e3b.up.railway.app/api");

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// Request interceptor: attach token + locale header
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Set Accept-Language from NEXT_LOCALE cookie so backend resolves bilingual fields
    const locale = document.cookie
      .split("; ")
      .find((c) => c.startsWith("NEXT_LOCALE="))
      ?.split("=")[1];
    if (locale === "en" || locale === "vi") {
      config.headers["Accept-Language"] = locale;
    } else {
      config.headers["Accept-Language"] = "vi"; // default
    }
  }
  return config;
});

// Response interceptor: refresh token on 401/403 (unauthenticated)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (typeof window !== "undefined" && (status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefresh);
          // Update auth-token cookie for middleware
          document.cookie = `auth-token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          localStorage.removeItem("auth-storage");
          document.cookie = "auth-token=; path=/; max-age=0; SameSite=Lax";
          document.cookie = "auth-storage=; path=/; max-age=0; SameSite=Lax";
          if (!window.location.pathname.startsWith("/account/login")) {
            window.location.href = `/account/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          }
        }
      } else if (status === 403 || status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("auth-storage");
        document.cookie = "auth-token=; path=/; max-age=0; SameSite=Lax";
        document.cookie = "auth-storage=; path=/; max-age=0; SameSite=Lax";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
