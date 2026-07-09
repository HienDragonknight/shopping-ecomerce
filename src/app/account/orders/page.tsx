"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AccountSidebar } from "@/components/AccountSidebar";
import api from "@/lib/api";
import { getPaymentMethodLabel } from "@/lib/payment";

interface Order {
  id: number; status: string; paymentMethod: string; paymentStatus: string;
  total: number; shippingFee: number; createdAt: string;
  items: { productName: string; quantity: number; price: number; thumbnailUrl: string | null }[];
}

const STATUS_MAP: Record<string, { label: string; color: string; dot: string }> = {
  PENDING:   { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700",   dot: "bg-amber-500" },
  CONFIRMED: { label: "Đã xác nhận",  color: "bg-blue-100 text-blue-700",     dot: "bg-blue-500" },
  SHIPPING:  { label: "Đang giao",    color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  DELIVERED: { label: "Đã giao",      color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  CANCELLED: { label: "Đã hủy",       color: "bg-red-100 text-red-700",       dot: "bg-red-400" },
};

const TABS = [
  { key: "", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "CONFIRMED", label: "Đã xác nhận" },
  { key: "SHIPPING", label: "Đang giao" },
  { key: "DELIVERED", label: "Đã giao" },
  { key: "CANCELLED", label: "Đã hủy" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get("/orders", { params: { page, size: 10 } })
      .then((r) => {
        setOrders(r.data.data.content || []);
        setTotalPages(r.data.data.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = activeTab ? orders.filter((o) => o.status === activeTab) : orders;

  return (
    <div className="bg-[#F5F5F5] min-h-[calc(100vh-200px)] py-8">
      <div className="yody-container max-w-6xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4 shrink-0"><AccountSidebar /></div>
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h1 className="text-xl font-bold text-[#1A1A1A]">Đơn hàng của tôi</h1>
              </div>

              {/* Status tabs */}
              <div className="flex overflow-x-auto border-b border-slate-100 scrollbar-hide">
                {TABS.map((tab) => (
                  <button key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setPage(0); }}
                    className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === tab.key
                        ? "border-[#1A1A1A] text-[#1A1A1A]"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />)}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <p className="text-5xl mb-3">📦</p>
                    <p className="font-semibold text-base">Không có đơn hàng nào</p>
                    <Link href="/products" className="mt-4 inline-block px-6 py-2.5 bg-[#1A1A1A] text-white font-bold rounded-full text-sm">
                      Mua sắm ngay
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filtered.map((order) => {
                      const st = STATUS_MAP[order.status] || { label: order.status, color: "bg-slate-100 text-slate-700", dot: "bg-slate-400" };
                      return (
                        <div key={order.id} className="border border-slate-100 rounded-2xl hover:border-[#1A1A1A] hover:shadow-sm transition-all">
                          {/* Header */}
                          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span>#{order.id}</span>
                              <span>•</span>
                              <span>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</span>
                            </div>
                          </div>

                          {/* Items preview */}
                          <div className="flex gap-3 px-4 py-3">
                            <div className="flex gap-2 flex-1 min-w-0">
                              {order.items.slice(0, 3).map((item, i) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img key={i} src={item.thumbnailUrl || "https://placehold.co/56x56/F5F5F5/999"}
                                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100" alt="" />
                              ))}
                              {order.items.length > 3 && (
                                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                                  +{order.items.length - 3}
                                </div>
                              )}
                              <div className="flex-1 min-w-0 pl-1 pt-0.5">
                                <p className="text-sm font-medium text-[#1A1A1A] line-clamp-2 leading-snug">
                                  {order.items[0]?.productName}
                                  {order.items.length > 1 && ` và ${order.items.length - 1} sản phẩm khác`}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between px-4 pb-3 border-t border-slate-100 pt-2.5">
                            <div className="text-xs text-slate-500 space-y-0.5">
                              <p>{order.paymentMethod === "COD" ? "💵" : "🏦"} {getPaymentMethodLabel(order.paymentMethod)}
                                {" · "}
                                <span className={`font-semibold ${order.paymentStatus === "PAID" ? "text-emerald-600" : "text-slate-500"}`}>
                                  {order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                                </span>
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-[#1A1A1A]">{order.total.toLocaleString("vi-VN")}đ</span>
                              <Link href={`/account/orders/${order.id}`}
                                className="text-xs font-bold px-3 py-1.5 border border-[#1A1A1A] rounded-full hover:bg-[#1A1A1A] hover:text-white transition-colors">
                                Xem chi tiết
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button key={i} onClick={() => setPage(i)}
                        className={`w-9 h-9 rounded-full font-bold text-sm transition-colors ${
                          page === i ? "bg-[#1A1A1A] text-white" : "bg-slate-100 hover:bg-slate-200"}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
