"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import api from "@/lib/api";
import { useCartStore } from "@/store/useCartStore";

function VNPaySandboxContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCartStore();
  const orderId = params.get("orderId");
  const amount = params.get("amount");
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("9704198526191432198");
  const [cardName, setCardName] = useState("NGUYEN VAN A");
  const [expiry, setExpiry] = useState("07/26");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"form" | "otp" | "processing">("form");

  const handlePay = async () => {
    setStep("otp");
    setOtp("");
  };

  const handleConfirmOtp = async () => {
    if (otp.length < 4) return;
    setStep("processing");
    setProcessing(true);

    // Simulate payment processing delay
    await new Promise((r) => setTimeout(r, 2000));

    try {
      // Mark order as CONFIRMED + PAID via admin payment update endpoint
      await api.put(`/admin/orders/${orderId}/payment`, {
        status: "CONFIRMED",
        paymentStatus: "PAID",
      });
    } catch {
      // Fallback to status update only
      try {
        await api.put(`/admin/orders/${orderId}/status`, { status: "CONFIRMED" });
      } catch { /* ignore */ }
    }

    await clearCart();
    router.push(`/checkout/success?orderId=${orderId}&payment=vnpay`);
  };


  const handleCancel = () => {
    router.push(`/checkout`);
  };

  return (
    <div className="min-h-screen bg-[#003087] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* VNPay Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-white rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="text-[#003087] font-black text-xl">VN</span>
            <span className="text-[#E31837] font-black text-xl">PAY</span>
          </div>
          <div className="text-white/70 text-xs font-medium">
            Cổng thanh toán điện tử
          </div>
        </div>

        {/* Sandbox Badge */}
        <div className="text-center mb-4">
          <span className="inline-block bg-amber-400 text-amber-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
            🛡️ Môi trường thử nghiệm (Sandbox)
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Order info banner */}
          <div className="bg-[#003087] text-white px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-white/60 font-medium">Mã đơn hàng</p>
                <p className="font-bold">#{orderId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/60 font-medium">Số tiền thanh toán</p>
                <p className="font-black text-xl text-[#1A1A1A]">
                  {Number(amount).toLocaleString("vi-VN")}₫
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {step === "form" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">
                    Số thẻ ATM/Visa
                  </label>
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full h-11 px-3 border-2 border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#003087] tracking-widest"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">
                    Tên chủ thẻ
                  </label>
                  <input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    className="w-full h-11 px-3 border-2 border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#003087] uppercase"
                    placeholder="NGUYEN VAN A"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 block">
                    Ngày hết hạn (MM/YY)
                  </label>
                  <input
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full h-11 px-3 border-2 border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#003087]"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                  <p className="font-bold mb-1">📋 Thẻ test (Sandbox)</p>
                  <p>Số thẻ: <span className="font-mono font-bold">9704198526191432198</span></p>
                  <p>Tên: <span className="font-mono font-bold">NGUYEN VAN A</span></p>
                  <p>Hết hạn: <span className="font-mono font-bold">07/26</span> — OTP: <span className="font-mono font-bold">123456</span></p>
                </div>

                <button
                  onClick={handlePay}
                  className="w-full h-12 bg-[#E31837] hover:bg-[#c01030] text-white font-bold rounded-xl transition-colors"
                >
                  Tiếp tục →
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full h-10 text-slate-500 text-sm hover:text-slate-700 transition-colors"
                >
                  Hủy giao dịch
                </button>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A1A] text-lg">Xác thực OTP</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Nhập mã OTP được gửi đến số điện thoại đăng ký thẻ
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500">
                  OTP sandbox: <span className="font-mono font-bold text-[#1A1A1A]">123456</span>
                </div>
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-10 h-12 border-2 rounded-xl flex items-center justify-center font-bold text-lg transition-colors ${
                        i < otp.length ? "border-[#003087] bg-blue-50 text-[#003087]" : "border-slate-200"
                      }`}
                    >
                      {otp[i] || ""}
                    </div>
                  ))}
                </div>
                <input
                  type="number"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  className="sr-only"
                  autoFocus
                />
                <div className="flex gap-2 flex-wrap justify-center">
                  {["1","2","3","4","5","6","7","8","9","⌫","0","OK"].map((k) => (
                    <button
                      key={k}
                      onClick={() => {
                        if (k === "⌫") setOtp((p) => p.slice(0, -1));
                        else if (k === "OK") { if (otp.length >= 4) handleConfirmOtp(); }
                        else if (otp.length < 6) setOtp((p) => p + k);
                      }}
                      className={`w-14 h-12 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                        k === "OK"
                          ? "bg-[#E31837] text-white hover:bg-[#c01030]"
                          : k === "⌫"
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-slate-100 text-[#1A1A1A] hover:bg-slate-200"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
                <button onClick={handleCancel} className="text-sm text-slate-500 hover:text-slate-700">
                  Hủy giao dịch
                </button>
              </div>
            )}

            {step === "processing" && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto">
                  <svg className="animate-spin w-16 h-16 text-[#003087]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <p className="font-bold text-[#1A1A1A] text-lg">Đang xử lý thanh toán...</p>
                <p className="text-sm text-slate-500">Vui lòng không đóng trang này</p>
              </div>
            )}
          </div>
        </div>

        {/* Security footer */}
        <div className="flex items-center justify-center gap-4 mt-4 text-white/60 text-xs">
          <span className="flex items-center gap-1">🔒 SSL Secure</span>
          <span>•</span>
          <span>Powered by VNPay</span>
          <span>•</span>
          <span>Sandbox Mode</span>
        </div>
      </div>
    </div>
  );
}

export default function VNPaySandboxPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#003087] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full" />
      </div>
    }>
      <VNPaySandboxContent />
    </Suspense>
  );
}
