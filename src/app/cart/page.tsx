"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, fetchCart, updateItem, removeItem, totalPrice, totalItems, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-4xl">🛒</p>
        <p className="font-bold text-lg text-[#1A1A1A]">Vui lòng đăng nhập để xem giỏ hàng</p>
        <Link href="/account/login" className="px-6 py-3 bg-[#FCCE00] text-[#1A1A1A] font-bold rounded-full">
          Đăng nhập
        </Link>
      </div>
    );
  }

  // Show loading skeleton while fetching cart (prevents flash of empty state)
  if (isLoading && items.length === 0) {
    return (
      <div className="bg-[#F5F5F5] min-h-screen py-8">
        <div className="yody-container max-w-5xl">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-6" />
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 animate-pulse">
                  <div className="w-20 h-24 rounded-xl bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2 pt-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-4 bg-slate-200 rounded w-1/4 mt-2" />
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:w-72 shrink-0">
              <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse space-y-3">
                <div className="h-5 bg-slate-200 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded" />
                <div className="h-12 bg-slate-200 rounded-full mt-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-[#F5F5F5]">
        <p className="text-6xl">🛒</p>
        <p className="font-bold text-xl text-[#1A1A1A]">Giỏ hàng trống</p>
        <Link href="/products" className="px-6 py-3 bg-[#FCCE00] text-[#1A1A1A] font-bold rounded-full">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }


  return (
    <div className="bg-[#F5F5F5] min-h-screen py-8">
      <div className="yody-container max-w-5xl">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">
          Giỏ hàng ({totalItems()} sản phẩm)
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Items */}
          <div className="flex-1 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
                <Link href={`/product/${item.productSlug}`}>
                  <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={item.thumbnailUrl || "https://placehold.co/80x96/F5F5F5/999"}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.productSlug}`}>
                    <p className="font-semibold text-sm text-[#1A1A1A] line-clamp-2 hover:text-[#FCCE00] transition-colors">
                      {item.productName}
                    </p>
                  </Link>
                  {(item.size || item.color) && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {[item.color, item.size].filter(Boolean).join(" / ")}
                    </p>
                  )}
                  <p className="font-bold text-[#1A1A1A] mt-1">
                    {item.price.toLocaleString("vi-VN")}đ
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-slate-200 rounded-full h-8">
                      <button
                        onClick={() => updateItem(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-black font-bold"
                        disabled={isLoading}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stockQty || isLoading}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-black font-bold disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#1A1A1A]">
                        {item.subtotal.toLocaleString("vi-VN")}đ
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-600 text-xs font-semibold"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="font-bold text-[#1A1A1A] text-lg mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tạm tính</span>
                  <span className="font-semibold">{totalPrice().toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phí vận chuyển</span>
                  <span className="text-emerald-600 font-semibold">Tính khi checkout</span>
                </div>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-[#1A1A1A]">
                <span>Tổng cộng</span>
                <span className="text-xl">{totalPrice().toLocaleString("vi-VN")}đ</span>
              </div>
              <button
                onClick={() => router.push("/checkout")}
                className="w-full mt-4 h-12 bg-[#FCCE00] hover:bg-[#E5B800] text-[#1A1A1A] font-bold rounded-full transition-colors"
              >
                Tiến hành đặt hàng
              </button>
              <Link href="/products" className="block text-center text-sm text-slate-500 hover:text-[#1A1A1A] mt-3">
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
