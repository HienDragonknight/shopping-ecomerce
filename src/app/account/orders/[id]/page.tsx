"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { AccountSidebar } from "@/components/AccountSidebar";
import api from "@/lib/api";

interface PageProps { params: Promise<{ id: string }> }

const STEPS = [
  { key: "PENDING",   label: "Chờ xác nhận", icon: "🕐" },
  { key: "CONFIRMED", label: "Đã xác nhận",  icon: "✅" },
  { key: "SHIPPING",  label: "Đang giao",    icon: "🚚" },
  { key: "DELIVERED", label: "Đã giao",      icon: "🎉" },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Chờ xác nhận", color: "text-amber-700 bg-amber-100" },
  CONFIRMED: { label: "Đã xác nhận",  color: "text-blue-700 bg-blue-100" },
  SHIPPING:  { label: "Đang giao",    color: "text-purple-700 bg-purple-100" },
  DELIVERED: { label: "Đã giao",      color: "text-emerald-700 bg-emerald-100" },
  CANCELLED: { label: "Đã hủy",       color: "text-red-700 bg-red-100" },
};

export default function OrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data.data)).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) return;
    setCancelling(true);
    try {
      const res = await api.put(`/orders/${id}/cancel`);
      setOrder(res.data.data);
    } catch (e: any) {
      alert(e.response?.data?.message || "Không thể hủy đơn hàng");
    } finally { setCancelling(false); }
  };

  const currentStepIdx = order ? STEPS.findIndex(s => s.key === order.status) : -1;
  const isCancelled = order?.status === "CANCELLED";

  return (
    <div className="bg-[#F5F5F5] min-h-screen py-8">
      <div className="yody-container max-w-6xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4 shrink-0"><AccountSidebar /></div>
          <div className="flex-1">
            {loading ? (
              <div className="bg-white rounded-2xl p-8 animate-pulse space-y-4">
                {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
              </div>
            ) : !order ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400">Không tìm thấy đơn hàng</div>
            ) : (
              <div className="space-y-4">
                {/* Header card */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h1 className="text-xl font-bold text-[#1A1A1A]">Đơn hàng #{order.id}</h1>
                      <p className="text-sm text-slate-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${STATUS_MAP[order.status]?.color || "bg-slate-100 text-slate-700"}`}>
                      {STATUS_MAP[order.status]?.label || order.status}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                {!isCancelled && (
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="font-bold text-[#1A1A1A] mb-5">Trạng thái đơn hàng</h2>
                    <div className="flex items-start">
                      {STEPS.map((step, i) => {
                        const done = i <= currentStepIdx;
                        const active = i === currentStepIdx;
                        return (
                          <div key={step.key} className="flex-1 flex flex-col items-center relative">
                            {/* Connector line */}
                            {i < STEPS.length - 1 && (
                              <div className={`absolute top-5 left-1/2 w-full h-0.5 transition-colors ${done && i < currentStepIdx ? "bg-[#1A1A1A]" : "bg-slate-200"}`} />
                            )}
                            {/* Circle */}
                            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                              active ? "border-[#1A1A1A] bg-[#FFFDE7] scale-110 shadow-md"
                              : done ? "border-[#1A1A1A] bg-[#1A1A1A]"
                              : "border-slate-200 bg-white text-slate-300"
                            }`}>
                              {done ? <span>{step.icon}</span> : <span className="text-slate-300 text-lg">○</span>}
                            </div>
                            <p className={`text-[10px] font-semibold mt-2 text-center leading-tight px-1 ${
                              active ? "text-[#1A1A1A]" : done ? "text-slate-600" : "text-slate-400"
                            }`}>
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Products */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="font-bold text-[#1A1A1A] mb-4">Sản phẩm ({order.items?.length})</h2>
                  <div className="space-y-3">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.thumbnailUrl || "https://placehold.co/64x64/F5F5F5/999"}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-50" alt="" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[#1A1A1A] line-clamp-2">{item.productName}</p>
                          {item.variantLabel && <p className="text-xs text-slate-400 mt-0.5">{item.variantLabel}</p>}
                          <p className="text-xs text-slate-500 mt-1">x{item.quantity}</p>
                        </div>
                        <span className="font-bold text-sm text-[#1A1A1A] shrink-0">
                          {item.subtotal?.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Price summary */}
                  <div className="border-t mt-4 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Tạm tính</span><span>{order.subtotal?.toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Phí vận chuyển</span><span>{order.shippingFee?.toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#1A1A1A] text-base pt-2 border-t">
                      <span>Tổng cộng</span><span className="text-lg">{order.total?.toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-white rounded-2xl shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">📍 Địa chỉ giao hàng</p>
                    <p className="font-medium text-[#1A1A1A] leading-relaxed">{order.snapshotAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">💳 Thanh toán</p>
                    <p className="font-medium text-[#1A1A1A]">
                      {order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : "VNPay"}
                    </p>
                    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mt-1.5 ${
                      order.paymentStatus === "PAID"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {order.paymentStatus === "PAID" ? "✓ Đã thanh toán" : "⏳ Chưa thanh toán"}
                    </span>
                  </div>
                  {order.note && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">📝 Ghi chú</p>
                      <p className="text-slate-600 italic">{order.note}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link href="/account/orders"
                    className="px-5 py-2.5 border border-slate-200 text-sm font-semibold rounded-full hover:bg-slate-50 transition-colors">
                    ← Quay lại
                  </Link>
                  {order.status === "PENDING" && (
                    <button onClick={handleCancel} disabled={cancelling}
                      className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-full transition-colors disabled:opacity-60">
                      {cancelling ? "Đang hủy..." : "Hủy đơn hàng"}
                    </button>
                  )}
                  <Link href="/products"
                    className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#E5B800] text-white text-sm font-bold rounded-full transition-colors ml-auto">
                    Mua thêm
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
