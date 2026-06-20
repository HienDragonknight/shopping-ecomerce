export const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    // Set cookie for middleware (server-side route protection)
    document.cookie = `auth-token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }
};

export const clearTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    // Clear auth cookie
    document.cookie = "auth-token=; path=/; max-age=0; SameSite=Lax";
  }
};

export const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") return localStorage.getItem("accessToken");
  return null;
};

export const getUser = () => {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  }
  return null;
};

export const setUser = (user: object) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }
};
