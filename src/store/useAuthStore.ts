"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearTokens, setTokens, setUser } from "@/lib/auth";
import api from "@/lib/api";

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
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {}
        clearTokens();
        // Also clear auth-storage cookie used by middleware
        if (typeof document !== "undefined") {
          document.cookie = "auth-storage=; path=/; max-age=0; SameSite=Lax";
        }
        set({ user: null, isAuthenticated: false });
        // Clear cart store to prevent data leaking between sessions
        const { useCartStore } = await import("@/store/useCartStore");
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
