"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Search, Users, UserCheck, UserX, ChevronLeft, ChevronRight } from "lucide-react";

interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

function StarRating({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < n ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, size: 15 };
      if (search) params.search = search;
      const res = await api.get("/admin/customers", { params });
      setCustomers(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 1);
      setTotalElements(res.data.data.totalElements || 0);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const toggleStatus = async (id: number, isActive: boolean) => {
    await api.put(`/admin/customers/${id}/status`, { isActive: !isActive }).catch(() => {});
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const activeCount = customers.filter(c => c.isActive).length;
  const adminCount = customers.filter(c => c.role === "ROLE_ADMIN").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Khách hàng</h1>
          <p className="text-sm text-slate-400">{totalElements} người dùng</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tổng người dùng", value: totalElements, icon: <Users size={16} />, color: "bg-blue-500" },
          { label: "Đang hoạt động", value: activeCount, icon: <UserCheck size={16} />, color: "bg-emerald-500" },
          { label: "Admin", value: adminCount, icon: <UserX size={16} />, color: "bg-purple-500" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className={`w-8 h-8 ${s.color} rounded-xl flex items-center justify-center text-white mb-2`}>{s.icon}</div>
            <p className="text-lg font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <form onSubmit={(e) => { e.preventDefault(); setPage(0); fetchCustomers(); }} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên, email, SĐT..."
              className="w-full h-10 pl-9 pr-4 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
          </div>
          <button type="submit" className="h-10 px-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700">
            Tìm
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {["Khách hàng", "Liên hệ", "Vai trò", "Trạng thái", "Ngày đăng ký", "Thao tác"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-4">
                    <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                  </td></tr>
                ))
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <p className="text-3xl mb-2">👥</p>
                  <p className="text-slate-500">Không tìm thấy khách hàng</p>
                </td></tr>
              ) : customers.map(c => {
                const initials = c.fullName?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          c.role === "ROLE_ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{c.fullName}</p>
                          <p className="text-xs text-slate-400">ID: {c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{c.email}</p>
                      {c.phone && <p className="text-xs text-slate-400">{c.phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        c.role === "ROLE_ADMIN" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {c.role === "ROLE_ADMIN" ? "Admin" : "Khách hàng"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                      }`}>
                        {c.isActive ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/customers/${c.id}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors">
                          Chi tiết
                        </Link>
                        {c.role !== "ROLE_ADMIN" && (
                          <button onClick={() => toggleStatus(c.id, c.isActive)}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
                              c.isActive
                                ? "text-red-500 bg-red-50 hover:bg-red-100"
                                : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                            }`}>
                            {c.isActive ? "Khóa" : "Mở khóa"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-500">Trang {page + 1} / {totalPages}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
