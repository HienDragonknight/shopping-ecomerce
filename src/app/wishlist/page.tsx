"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/wishlist");
      setItems(res.data.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAuthenticated) fetchWishlist(); }, [isAuthenticated]);

  const removeFromWishlist = async (productId: number) => {
    await api.delete(`/wishlist/${productId}`);
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen py-8">
      <div className="yody-container">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Sản phẩm yêu thích</h1>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="bg-white rounded-2xl aspect-[3/4] animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center">
            <p className="text-5xl mb-4">❤️</p>
            <p className="font-bold text-lg text-[#1A1A1A]">Danh sách yêu thích trống</p>
            <Link href="/products" className="mt-4 inline-block px-6 py-3 bg-[#1A1A1A] text-white font-bold rounded-full">
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item: any) => {
              const p = item.product;
              return (
                <div key={p.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="relative aspect-[3/4]">
                    <Link href={`/product/${p.slug}`}>
                      <img src={p.thumbnailUrl || "https://placehold.co/300x400"} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(p.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow"
                    >
                      ♥
                    </button>
                  </div>
                  <div className="p-3">
                    <Link href={`/product/${p.slug}`}>
                      <p className="text-sm font-semibold line-clamp-2 hover:text-[#1A1A1A] transition-colors">{p.name}</p>
                    </Link>
                    <p className="font-bold mt-1">{p.effectivePrice?.toLocaleString("vi-VN")}đ</p>
                    {p.variants?.[0] && (
                      <button
                        onClick={() => addItem(p.variants[0].id)}
                        className="w-full mt-2 h-8 bg-[#1A1A1A] text-white text-xs font-bold rounded-full"
                      >
                        Thêm vào giỏ
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
