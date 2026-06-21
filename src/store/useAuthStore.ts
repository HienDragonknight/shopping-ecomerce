"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearTokens, setTokens, setUser } from "@/lib/auth";
import api from "@/lib/api";
import { useCartStore } from "@/store/useCartStore";

/**
 * Sync the Zustand auth-storage state to a cookie so that
 * Next.js middleware (runs server-side) can read auth state.
 */
function syncAuthCookie(user: { role: string } | null, isAuthenticated: boolean) {
  if (typeof document === "undefined") return;
  if (user && isAuthenticated) {
    const payload = JSON.stringify({ state: { user, isAuthenticated } });
    document.cookie = `auth-storage=${encodeURIComponent(payload)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    document.cookie = "auth-storage=; path=/; max-age=0; SameSite=Lax";
  }
}

interface User {
  id: number;
  email: string | null;
  phone: string | null;
  fullName: string;
  avatarUrl: string | null;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (fullName: string, email: string | null, phone: string | null, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (identifier, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post("/auth/login", { identifier, password });
          const { accessToken, refreshToken, user } = res.data.data;
          setTokens(accessToken, refreshToken);
          setUser(user);
          set({ user, isAuthenticated: true });
          syncAuthCookie(user, true);
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (fullName, email, phone, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post("/auth/register", { fullName, email, phone, password });
          const { accessToken, refreshToken, user } = res.data.data;
          setTokens(accessToken, refreshToken);
          setUser(user);
          set({ user, isAuthenticated: true });
          syncAuthCookie(user, true);
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        // Send logout request to backend in background so it doesn't block the client
        api.post("/auth/logout").catch((err) => {
          console.error("Backend logout failed:", err);
        });

        // Immediately clear client session
        clearTokens();
        syncAuthCookie(null, false);
        set({ user: null, isAuthenticated: false });
        
        // Clear cart store to prevent data leaking between sessions
        useCartStore.setState({ items: [], isOpen: false });
      },

      setUser: (user) => set({ user, isAuthenticated: true }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
