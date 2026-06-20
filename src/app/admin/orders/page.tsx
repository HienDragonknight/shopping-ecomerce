"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700" },
  CONFIRMED: { label: "Đã xác nhận",  color: "bg-blue-100 text-blue-700" },
  SHIPPING:  { label: "Đang giao",    color: "bg-purple-100 text-purple-700" },
  DELIVERED: { label: "Đã giao",      color: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Đã hủy",       color: "bg-red-100 text-red-700" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, size: 20 };
      if (status) params.status = status;
      const res = await api.get("/admin/orders", { params });
      setOrders(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 1);
      setLastRefresh(new Date());
    } finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(fetchOrders, 30000);
    return () => clearInterval(t);
  }, [fetchOrders]);

  const updateStatus = async (id: number, newStatus: string) => {
    await api.put(`/admin/orders/${id}/status`, { status: newStatus });
    fetchOrders();
  };

  // Parse customer name/phone from snapshotAddress
  const parseCustomer = (snapshot: string) => {
    if (!snapshot) return { name: "—", phone: "—" };
    const parts = snapshot.split("—");
    if (parts.length >= 2) {
      const right = parts[1].trim();
      const chunks = right.split(",").map(s => s.trim());
      return { name: chunks[0] || "—", phone: chunks[1] || "—" };
    }
    return { name: snapshot.substring(0, 20), phone: "—" };
  };

  const filtered = search
    ? orders.filter(o => {
        const { name, phone } = parseCustomer(o.snapshotAddress);
        return (
          String(o.id).includes(search) ||
          name.toLowerCase().includes(search.toLowerCase()) ||
          phone.includes(search)
        );
      })
    : orders;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Quản lý đơn hàng</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cập nhật lúc {lastRefresh.toLocaleTimeString("vi-VN")} · Tự động refresh mỗi 30s
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã, tên, SĐT..."
            className="h-10 px-3 border border-slate-200 rounded-xl bg-white text-sm w-52 focus:outline-none focus:ring-2 focus:ring-[#FCCE00]"
          />
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            className="h-10 px-3 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none">
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button onClick={fetchOrders}
            className="h-10 px-4 bg-[#FCCE00] hover:bg-[#E5B800] text-[#1A1A1A] font-bold rounded-xl text-sm transition-colors">
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {Object.entries(STATUS_MAP).map(([k, v]) => {
          const count = orders.filter(o => o.status === k).length;
          return (
            <button key={k} onClick={() => { setStatus(status === k ? "" : k); setPage(0); }}
              className={`p-3 rounded-2xl border-2 text-left transition-all ${
                status === k ? "border-[#FCCE00] bg-[#FFFDE7]" : "border-slate-100 bg-white hover:border-slate-200"
              }`}>
              <p className="text-2xl font-black text-[#1A1A1A]">{count}</p>
              <p className={`text-xs font-bold mt-0.5 px-2 py-0.5 rounded-full inline-block ${v.color}`}>{v.label}</p>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-slate-50 border-b">
              <tr>
                {["Mã đơn", "Khách hàng", "Sản phẩm", "Tổng tiền", "Thanh toán", "Trạng thái", "Ngày", "Thao tác"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-4">
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  </td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                  <p className="text-4xl mb-2">📭</p>
                  <p className="font-semibold">Không có đơn hàng nào</p>
                </td></tr>
              ) : filtered.map((o) => {
                const { name, phone } = parseCustomer(o.snapshotAddress);
                const st = STATUS_MAP[o.status];
                return (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm font-bold text-[#1A1A1A]">#{o.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-[#1A1A1A]">{name}</p>
                      <p className="text-xs text-slate-400">{phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-600 line-clamp-1 max-w-[140px]">
                        {o.items?.[0]?.productName || "—"}
                        {o.items?.length > 1 && ` +${o.items.length - 1}`}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[#1A1A1A]">
                      {o.total?.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        o.paymentStatus === "PAID"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {o.paymentStatus === "PAID" ? "Đã TT" : "Chưa TT"}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{o.paymentMethod}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                        className={`text-xs border-0 rounded-full px-2.5 py-1.5 font-bold cursor-pointer focus:outline-none ${st?.color || "bg-slate-100 text-slate-700"}`}>
                        {Object.entries(STATUS_MAP).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                      <br />
                      <span className="text-[10px]">{new Date(o.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.id}`}
                        className="text-xs font-bold text-[#1A1A1A] hover:text-[#FCCE00] underline underline-offset-2">
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={`w-9 h-9 rounded-full text-sm font-bold transition-colors ${
                  page === i ? "bg-[#FCCE00] text-[#1A1A1A]" : "bg-slate-100 hover:bg-slate-200"}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
