"use client";

import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateItem, removeItem, totalPrice, totalItems, isLoading } = useCartStore();
  const router = useRouter();

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity animate-in fade-in"
        onClick={closeCart}
      />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-white z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="font-bold text-[#1A1A1A] text-lg">Giỏ hàng</h2>
            {totalItems() > 0 && (
              <span className="min-w-[22px] h-[22px] bg-[#FCCE00] text-[#1A1A1A] text-xs font-black rounded-full flex items-center justify-center px-1.5">
                {totalItems()}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-[#1A1A1A]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-[#1A1A1A] text-lg">Giỏ hàng trống</p>
                <p className="text-slate-400 text-sm mt-1">Hãy thêm sản phẩm vào giỏ hàng</p>
              </div>
              <button
                onClick={() => { closeCart(); router.push("/products"); }}
                className="px-6 py-3 bg-[#FCCE00] text-[#1A1A1A] font-bold rounded-full text-sm hover:bg-[#E5B800] transition-colors"
              >
                Mua sắm ngay
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className={`flex gap-4 p-4 transition-opacity ${isLoading ? "opacity-60 pointer-events-none" : ""}`}>
                  {/* Image */}
                  <Link href={`/product/${item.productSlug}`} onClick={closeCart}>
                    <div className="w-[72px] h-[88px] rounded-xl overflow-hidden bg-slate-100 shrink-0 hover:opacity-80 transition-opacity">
                      <img
                        src={item.thumbnailUrl || "https://placehold.co/72x88/F5F5F5/999"}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.productSlug}`} onClick={closeCart}>
                      <p className="font-semibold text-sm text-[#1A1A1A] line-clamp-2 hover:text-[#FCCE00] transition-colors leading-snug">
                        {item.productName}
                      </p>
                    </Link>
                    {(item.size || item.color) && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {[item.color, item.size].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <p className="font-bold text-[#1A1A1A] text-sm mt-1">
                      {item.price.toLocaleString("vi-VN")}đ
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Qty control */}
                      <div className="flex items-center border border-slate-200 rounded-full h-8 overflow-hidden">
                        <button
                          onClick={() => updateItem(item.id, item.quantity - 1)}
                          disabled={isLoading}
                          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-black hover:bg-slate-50 font-bold text-lg leading-none transition-colors"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-sm font-bold text-[#1A1A1A]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stockQty || isLoading}
                          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-black hover:bg-slate-50 font-bold text-lg leading-none transition-colors disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#1A1A1A] text-sm">
                          {item.subtotal.toLocaleString("vi-VN")}đ
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={isLoading}
                          className="text-slate-300 hover:text-red-400 transition-colors"
                          title="Xóa"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — checkout */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-5 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm">Tạm tính ({totalItems()} sản phẩm)</span>
              <span className="font-black text-[#1A1A1A] text-lg">
                {totalPrice().toLocaleString("vi-VN")}đ
              </span>
            </div>
            <p className="text-xs text-slate-400">Phí vận chuyển sẽ được tính khi thanh toán</p>

            <button
              onClick={() => { closeCart(); router.push("/checkout"); }}
              className="w-full h-12 bg-[#FCCE00] hover:bg-[#E5B800] text-[#1A1A1A] font-bold rounded-full transition-colors text-sm"
            >
              Tiến hành đặt hàng →
            </button>
            <button
              onClick={() => { closeCart(); router.push("/cart"); }}
              className="w-full h-10 border border-slate-200 hover:border-[#1A1A1A] text-[#1A1A1A] font-semibold rounded-full transition-colors text-sm"
            >
              Xem giỏ hàng
            </button>
          </div>
        )}
      </div>
    </>
  );
}
