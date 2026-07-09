"use client";

import { useState, useEffect, useCallback } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { GHNAddressForm, type AddressFormData } from "@/components/GHNAddressForm";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Address {
  id: number; fullName: string; phone: string; detail: string;
  ward: string; district: string; province: string;
  districtId: number; wardCode: string; provinceId: number;
  isDefault: boolean;
}

type PaymentMethod = "COD" | "PAYOS";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [note, setNote] = useState("");
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [loadingFee, setLoadingFee] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) router.push("/account/login?redirect=/checkout");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && items.length === 0) router.push("/cart");
  }, [isAuthenticated, items.length, router]);

  const fetchShippingFee = useCallback(async () => {
    setLoadingFee(true);
    setShippingFee(null);
    try {
      await new Promise((r) => setTimeout(r, 300));
      const fee = totalPrice() >= 499000 ? 0 : 30000;
      setShippingFee(fee);
    } catch {
      setShippingFee(30000);
    } finally {
      setLoadingFee(false);
    }
  }, [totalPrice]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingAddresses(true);
    api.get("/addresses").then((r) => {
      const addrs: Address[] = r.data.data || [];
      setAddresses(addrs);
      const def = addrs.find((a) => a.isDefault) || addrs[0];
      if (def) {
        setSelectedAddress(def.id);
        fetchShippingFee();
      }
    }).finally(() => setLoadingAddresses(false));
  }, [isAuthenticated, fetchShippingFee]);

  const handleAddressChange = (id: number) => {
    setSelectedAddress(id);
    fetchShippingFee();
  };

  const handleSaveAddress = async (data: AddressFormData) => {
    setSavingAddress(true);
    try {
      const cleanData = { ...data, phone: data.phone.replace(/[\s\-().]/g, "") };
      const res = await api.post("/addresses", cleanData);
      const newAddr: Address = res.data.data;
      const updatedRes = await api.get("/addresses");
      const addrs: Address[] = updatedRes.data.data || [];
      setAddresses(addrs);
      setShowAddressForm(false);
      setSelectedAddress(newAddr.id);
      fetchShippingFee();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string; errors?: Record<string, string> } } };
      const errMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).join(", ")
        : err.response?.data?.message || "Lưu địa chỉ thất bại";
      throw new Error(errMsg);
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { setError("Vui lòng chọn địa chỉ giao hàng"); return; }
    if (items.length === 0) { setError("Giỏ hàng trống"); return; }
    setSubmitting(true);
    setError("");
    try {
      const fee = shippingFee ?? 30000;
      const res = await api.post(
        "/orders",
        {
          addressId: selectedAddress,
          paymentMethod,
          note,
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        },
        { headers: { "X-Shipping-Fee": fee.toString() } }
      );
      const order = res.data.data;

      if (paymentMethod === "PAYOS") {
        const payRes = await api.post("/payments/payos/create", { orderId: order.id });
        const checkoutUrl: string = payRes.data.data.checkoutUrl;
        await clearCart();
        window.location.href = checkoutUrl;
        return;
      }

      await clearCart();
      router.push(`/checkout/success?orderId=${order.id}`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = totalPrice();
  const fee = shippingFee ?? 0;
  const total = subtotal + fee;

  if (!isAuthenticated) return null;

  const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; desc: string; icon: string }[] = [
    {
      value: "COD",
      label: "Thanh toán khi nhận hàng (COD)",
      desc: "Trả tiền mặt khi nhận hàng, an toàn và tiện lợi",
      icon: "💵",
    },
    {
      value: "PAYOS",
      label: "PayOS — Chuyển khoản QR",
      desc: "Quét mã QR VietQR, hỗ trợ 40+ ngân hàng Việt Nam",
      icon: "🏦",
    },
  ];

  return (
    <div className="bg-[#F5F5F5] min-h-screen py-8">
      <div className="yody-container max-w-5xl">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/cart" className="hover:text-[#1A1A1A] transition-colors">Giỏ hàng</Link>
          <span>›</span>
          <span className="font-semibold text-[#1A1A1A]">Thanh toán</span>
        </div>

        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Thanh toán</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1A1A1A] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white text-xs font-black flex items-center justify-center">1</span>
                  Địa chỉ giao hàng
                </h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-xs font-bold bg-[#1A1A1A] text-white px-3 py-1.5 rounded-full hover:bg-slate-700 transition-colors"
                >
                  + Thêm địa chỉ mới
                </button>
              </div>

              {showAddressForm && (
                <div className="mb-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-sm font-bold text-[#1A1A1A] mb-4">Địa chỉ mới</p>
                  <GHNAddressForm onSave={handleSaveAddress} onCancel={() => setShowAddressForm(false)} saving={savingAddress} />
                </div>
              )}

              {loadingAddresses ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-3xl mb-2">📍</p>
                  <p className="text-sm font-semibold">Bạn chưa có địa chỉ nào</p>
                  <button onClick={() => setShowAddressForm(true)} className="mt-3 text-sm font-bold text-[#1A1A1A] underline underline-offset-2">
                    Thêm địa chỉ ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
                        selectedAddress === addr.id ? "border-[#1A1A1A] bg-[#FFFDE7] shadow-sm" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input type="radio" name="address" value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => handleAddressChange(addr.id)}
                        className="mt-1 accent-[#1A1A1A]" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-[#1A1A1A]">{addr.fullName}</p>
                          <p className="text-xs text-slate-500">• {addr.phone}</p>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-[#1A1A1A] text-white px-1.5 py-0.5 rounded-full font-bold">Mặc định</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {addr.detail}, {addr.ward}, {addr.district}, {addr.province}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-[#1A1A1A] flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white text-xs font-black flex items-center justify-center">2</span>
                Phương thức thanh toán
              </h2>
              <div className="space-y-2">
                {PAYMENT_OPTIONS.map((m) => (
                  <label
                    key={m.value}
                    className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === m.value ? "border-[#1A1A1A] bg-[#FFFDE7]" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input type="radio" name="payment" value={m.value}
                      checked={paymentMethod === m.value}
                      onChange={() => { setPaymentMethod(m.value); setError(""); }}
                      className="accent-[#1A1A1A]" />
                    <span className="text-2xl">{m.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-[#1A1A1A]">{m.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-[#1A1A1A] flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white text-xs font-black flex items-center justify-center">3</span>
                Ghi chú (tùy chọn)
              </h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú thêm cho đơn hàng (ví dụ: giao buổi sáng, gọi trước khi giao...)"
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] resize-none"
              />
            </div>
          </div>

          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="font-bold text-[#1A1A1A] text-lg mb-4">
                Đơn hàng ({items.length} sản phẩm)
              </h2>

              <div className="space-y-3 mb-4 max-h-52 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.thumbnailUrl || "https://placehold.co/48x48/F5F5F5/999"} alt={item.productName} className="w-full h-full object-cover" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-slate-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs line-clamp-2 text-[#1A1A1A]">{item.productName}</p>
                      {(item.size || item.color) && (
                        <p className="text-[10px] text-slate-400">{[item.color, item.size].filter(Boolean).join(" / ")}</p>
                      )}
                    </div>
                    <span className="font-semibold text-xs shrink-0">{item.subtotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Tạm tính</span>
                  <span className="font-medium text-[#1A1A1A]">{subtotal.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Phí vận chuyển</span>
                  <span className={`font-medium ${loadingFee ? "text-slate-400" : "text-[#1A1A1A]"}`}>
                    {loadingFee ? (
                      <span className="inline-flex items-center gap-1">
                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Đang tính...
                      </span>
                    ) : shippingFee === null ? (
                      <span className="text-slate-400">Chọn địa chỉ</span>
                    ) : (
                      `${fee.toLocaleString("vi-VN")}đ`
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t mt-3 pt-3 flex justify-between font-bold text-[#1A1A1A]">
                <span>Tổng cộng</span>
                <span className="text-xl">{total.toLocaleString("vi-VN")}đ</span>
              </div>

              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={submitting || loadingFee || !selectedAddress}
                className="w-full mt-4 h-12 bg-[#1A1A1A] hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full transition-all active:scale-95"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang xử lý...
                  </span>
                ) : paymentMethod === "PAYOS" ? "🏦 Thanh toán QR PayOS" : "Đặt hàng ngay"}
              </button>

              <p className="text-[10px] text-slate-400 text-center mt-3 leading-relaxed">
                Bằng cách đặt hàng, bạn đồng ý với{" "}
                <span className="underline cursor-pointer">Điều khoản sử dụng</span> của Vie&apos;Co
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
