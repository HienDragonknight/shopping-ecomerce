"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4">
      <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
        <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-black text-[#1A1A1A] mb-2">Đặt hàng thành công! 🎉</h1>
        {orderId && (
          <p className="text-slate-500 mb-1">Mã đơn hàng: <span className="font-bold text-[#1A1A1A]">#{orderId}</span></p>
        )}
        <p className="text-slate-500 text-sm max-w-sm">
          Cảm ơn bạn đã mua hàng! Chúng tôi sẽ xử lý và giao hàng sớm nhất có thể.
        </p>
      </div>
      <div className="flex gap-3">
        {orderId && (
          <Link
            href={`/account/orders/${orderId}`}
            className="px-6 py-3 bg-[#1A1A1A] text-white font-bold rounded-full text-sm"
          >
            Xem đơn hàng
          </Link>
        )}
        <Link href="/products" className="px-6 py-3 bg-[#FCCE00] text-[#1A1A1A] font-bold rounded-full text-sm">
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
