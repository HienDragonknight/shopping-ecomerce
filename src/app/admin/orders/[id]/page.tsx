"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface PageProps { params: Promise<{ id: string }> }

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700" },
  CONFIRMED: { label: "Đã xác nhận",  color: "bg-blue-100 text-blue-700" },
  SHIPPING:  { label: "Đang giao",    color: "bg-purple-100 text-purple-700" },
  DELIVERED: { label: "Đã giao",      color: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Đã hủy",       color: "bg-red-100 text-red-700" },
};

export default function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    api.get(`/admin/orders/${id}`)
      .then((r) => {
        setOrder(r.data.data);
        setNewStatus(r.data.data.status);
      })
      .catch(() => {
        // Fallback: search in list
        api.get(`/admin/orders`, { params: { size: 1000 } }).then((r) => {
          const found = (r.data.data.content || []).find((o: any) => String(o.id) === id);
          if (found) { setOrder(found); setNewStatus(found.status); }
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async () => {
    if (newStatus === order.status) return;
    setUpdating(true);
    try {
      const res = await api.put(`/admin/orders/${id}/status`, { status: newStatus });
      setOrder(res.data.data);
      showToast("✅ Đã cập nhật trạng thái đơn hàng");
    } catch {
      showToast("❌ Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const handleShipGHN = async () => {
    if (!confirm("Gửi đơn hàng này sang GHN để vận chuyển?")) return;
    setShipping(true);
    try {
      const res = await api.post(`/admin/orders/${id}/ship`);
      setOrder(res.data.data);
      setNewStatus(res.data.data.status);
      showToast("🚚 Đã gửi GHN thành công! Mã vận đơn: " + res.data.data.ghnOrderCode);
    } catch {
      showToast("❌ Gửi GHN thất bại");
    } finally {
      setShipping(false);
    }
  };

  if (loading) return (
    <div className="p-8 animate-pulse space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
    </div>
  );

  if (!order) return (
    <div className="p-8 text-center text-slate-400">
      <p className="text-4xl mb-3">🔍</p>
      <p className="font-semibold">Không tìm thấy đơn hàng #{id}</p>
      <Link href="/admin/orders" className="mt-4 inline-block px-5 py-2 bg-[#FCCE00] text-[#1A1A1A] font-bold rounded-full text-sm">
        ← Quay lại
      </Link>
    </div>
  );

  const st = STATUS_MAP[order.status];

  return (
    <div className="p-6 max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1A1A1A] text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold animate-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/orders" className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
          ←
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Đơn hàng #{order.id}</h1>
          <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
        </div>
        <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${st?.color || "bg-slate-100 text-slate-700"}`}>
          {st?.label || order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ─── Left (2/3) ─── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Products */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-[#1A1A1A] mb-4">Sản phẩm đặt mua</h2>
            <div className="space-y-3">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.thumbnailUrl || "https://placehold.co/56x56/F5F5F5/999"}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-50" alt="" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[#1A1A1A]">{item.productName}</p>
                    {item.variantLabel && <p className="text-xs text-slate-400">{item.variantLabel}</p>}
                    <p className="text-xs text-slate-500 mt-0.5">x{item.quantity} × {item.price?.toLocaleString("vi-VN")}đ</p>
                  </div>
                  <span className="font-bold text-sm">{item.subtotal?.toLocaleString("vi-VN")}đ</span>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính</span><span>{order.subtotal?.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Phí vận chuyển</span><span>{order.shippingFee?.toLocaleString("vi-VN")}đ</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Giảm giá</span><span>-{order.discount?.toLocaleString("vi-VN")}đ</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-[#1A1A1A] text-base border-t pt-2">
                <span>Tổng cộng</span>
                <span className="text-lg text-[#1A1A1A]">{order.total?.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          </div>

          {/* Address & Payment */}
          <div className="bg-white rounded-2xl shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">📍 Địa chỉ giao</p>
              <p className="font-medium leading-relaxed text-[#1A1A1A]">{order.snapshotAddress}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">💳 Thanh toán</p>
              <p className="font-semibold text-[#1A1A1A]">{order.paymentMethod === "COD" ? "Tiền mặt (COD)" : "VNPay"}</p>
              <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mt-1.5 ${
                order.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
              }`}>
                {order.paymentStatus === "PAID" ? "✓ Đã thanh toán" : "⏳ Chưa thanh toán"}
              </span>
            </div>
            {order.note && (
              <div className="sm:col-span-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">📝 Ghi chú</p>
                <p className="text-slate-600 italic bg-slate-50 p-3 rounded-xl">{order.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Right (1/3) ─── */}
        <div className="space-y-5">
          {/* Update status */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-[#1A1A1A] mb-4">Cập nhật trạng thái</h2>
            <div className="space-y-2">
              {Object.entries(STATUS_MAP).map(([k, v]) => (
                <label key={k} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  newStatus === k ? `border-current ${v.color} font-semibold` : "border-slate-100 hover:border-slate-200"
                }`}>
                  <input type="radio" name="status" value={k} checked={newStatus === k}
                    onChange={() => setNewStatus(k)} className="accent-[#FCCE00]" />
                  <span className={`text-sm font-medium ${newStatus === k ? "" : "text-slate-600"}`}>{v.label}</span>
                </label>
              ))}
            </div>
            <button onClick={handleUpdateStatus} disabled={updating || newStatus === order.status}
              className="w-full mt-4 h-11 bg-[#FCCE00] hover:bg-[#E5B800] disabled:opacity-50 text-[#1A1A1A] font-bold rounded-full transition-colors">
              {updating ? "Đang cập nhật..." : "Lưu trạng thái"}
            </button>
          </div>

          {/* GHN Dispatch */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-[#1A1A1A] mb-3">🚚 Giao vận chuyển</h2>
            {order.ghnOrderCode ? (
              <div className="space-y-2">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <p className="text-xs text-emerald-600 font-bold mb-1">✅ Đã gửi GHN</p>
                  <p className="text-xs font-mono font-bold text-emerald-800">{order.ghnOrderCode}</p>
                </div>
                <a
                  href={`https://ghn.vn/pages/khach-hang?code=${order.ghnOrderCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs text-blue-600 font-semibold underline underline-offset-2"
                >
                  Theo dõi vận đơn →
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Gửi đơn hàng sang Giao Hàng Nhanh để vận chuyển. Trạng thái sẽ chuyển sang <strong>Đang giao</strong>.
                </p>
                <button
                  onClick={handleShipGHN}
                  disabled={shipping || order.status === "CANCELLED" || order.status === "DELIVERED"}
                  className="w-full h-11 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-full transition-colors flex items-center justify-center gap-2"
                >
                  {shipping ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Đang gửi...
                    </>
                  ) : "🚚 Gửi GHN"}
                </button>
              </div>
            )}
          </div>

          {/* Order meta */}
          <div className="bg-white rounded-2xl shadow-sm p-6 text-sm space-y-3">
            <h2 className="font-bold text-[#1A1A1A] mb-2">Thông tin đơn</h2>
            <div className="flex justify-between">
              <span className="text-slate-500">Mã đơn</span>
              <span className="font-mono font-bold">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tạo lúc</span>
              <span className="font-medium">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</span>
            </div>
            {order.ghnOrderCode && (
              <div className="flex justify-between">
                <span className="text-slate-500">Mã GHN</span>
                <span className="font-mono text-xs font-bold text-purple-700">{order.ghnOrderCode}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
