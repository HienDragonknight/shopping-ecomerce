"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface Props {
  clientSecret: string;
  orderId: number;
  amountUsd: number;
  amountVnd: number;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

function CardForm({ clientSecret, orderId, amountUsd, amountVnd, onSuccess, onError }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    try {
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Card element not found");

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (error) {
        onError(error.message || "Thanh toán thất bại");
      } else if (paymentIntent?.status === "succeeded") {
        onSuccess();
      }
    } catch (e: unknown) {
      onError(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Amount info */}
      <div className="flex items-center justify-between text-sm bg-blue-50 rounded-xl px-4 py-3">
        <span className="text-slate-600">Thanh toán</span>
        <div className="text-right">
          <p className="font-bold text-[#1A1A1A]">${amountUsd} USD</p>
          <p className="text-xs text-slate-400">≈ {amountVnd.toLocaleString("vi-VN")}đ</p>
        </div>
      </div>

      {/* Card input */}
      <div className="border border-slate-200 rounded-xl px-4 py-3.5 focus-within:border-[#1A1A1A] transition-colors">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "14px",
                color: "#1A1A1A",
                fontFamily: "inherit",
                "::placeholder": { color: "#94a3b8" },
              },
              invalid: { color: "#ef4444" },
            },
          }}
        />
      </div>

      <p className="text-[10px] text-slate-400 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Thông tin thẻ được mã hóa bởi Stripe. Vie'Co không lưu trữ dữ liệu thẻ.
      </p>

      {/* Card logos */}
      <div className="flex items-center gap-2">
        {["Visa", "MC", "Amex", "JCB"].map((b) => (
          <span key={b} className="text-[10px] px-2 py-0.5 border border-slate-200 rounded text-slate-500 font-medium">
            {b}
          </span>
        ))}
      </div>

      <button
        onClick={handlePay}
        disabled={!stripe || processing}
        className="w-full h-12 bg-[#635BFF] hover:bg-[#5144e8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Đang xử lý...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Thanh toán ${amountUsd} USD
          </>
        )}
      </button>
    </div>
  );
}

export default function StripePaymentForm(props: Props) {
  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret: props.clientSecret, locale: "vi" }}
    >
      <CardForm {...props} />
    </Elements>
  );
}
