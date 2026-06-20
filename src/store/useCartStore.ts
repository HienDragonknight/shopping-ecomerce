"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api";

interface CartItem {
  id: number;
  variantId: number;
  sku: string;
  size: string | null;
  color: string | null;
  productId: number;
  productName: string;
  productSlug: string;
  thumbnailUrl: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  stockQty: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (variantId: number, quantity?: number) => Promise<void>;
  updateItem: (id: number, quantity: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,

      fetchCart: async () => {
        try {
          const res = await api.get("/cart");
          set({ items: res.data.data });
        } catch {}
      },

      addItem: async (variantId, quantity = 1) => {
        set({ isLoading: true });
        try {
          const res = await api.post("/cart", { variantId, quantity });
          await get().fetchCart();
          set({ isOpen: true });
        } finally {
          set({ isLoading: false });
        }
      },

      updateItem: async (id, quantity) => {
        set({ isLoading: true });
        try {
          if (quantity <= 0) {
            await get().removeItem(id);
            return;
          }
          await api.put(`/cart/${id}`, { quantity });
          await get().fetchCart();
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (id) => {
        set({ isLoading: true });
        try {
          await api.delete(`/cart/${id}`);
          set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        await api.delete("/cart");
        set({ items: [] });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.subtotal, 0),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
