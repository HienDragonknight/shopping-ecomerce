"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Plus, Edit2, Trash2, Copy, ToggleLeft, ToggleRight, RefreshCw } from "lucide-react";

type DiscountType = "PERCENTAGE" | "FIXED";
type CouponStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";

interface Coupon {
  id: number;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const EMPTY_FORM = {
  code: "",
  description: "",
  discountType: "PERCENTAGE" as DiscountType,
  discountValue: 10,
  minOrderValue: 0,
  maxDiscount: null as number | null,
  usageLimit: 100,
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
  isActive: true,
};

function getStatus(c: Coupon): CouponStatus {
  const now = new Date();
  if (!c.isActive) return "INACTIVE";
  if (new Date(c.endDate) < now) return "EXPIRED";
  return "ACTIVE";
}

const STATUS_STYLE: Record<CouponStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-slate-100 text-slate-500",
  EXPIRED: "bg-red-100 text-red-500",
};
const STATUS_LABEL: Record<CouponStatus, string> = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Tắt",
  EXPIRED: "Hết hạn",
};

export default function AdminPromotionsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/promotions");
      setCoupons(res.data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      description: c.description || "",
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderValue: c.minOrderValue,
      maxDiscount: c.maxDiscount,
      usageLimit: c.usageLimit,
      startDate: c.startDate,
      endDate: c.endDate,
      isActive: c.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) { alert("Nhập mã coupon!"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: Number(form.usageLimit),
      };
      if (editing) {
        const res = await api.put(`/admin/promotions/${editing.id}`, payload);
        setCoupons(prev => prev.map(c => c.id === editing.id ? res.data.data : c));
      } else {
        const res = await api.post("/admin/promotions", payload);
        setCoupons(prev => [res.data.data, ...prev]);
      }
      setShowModal(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi lưu coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa coupon này?")) return;
    await api.delete(`/admin/promotions/${id}`);
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  const toggleActive = async (id: number) => {
    const res = await api.patch(`/admin/promotions/${id}/toggle`);
    setCoupons(prev => prev.map(c => c.id === id ? res.data.data : c));
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const totalActive = coupons.filter(c => getStatus(c) === "ACTIVE").length;
  const totalUsage = coupons.reduce((s, c) => s + (c.usedCount || 0), 0);
  const totalLimit = coupons.reduce((s, c) => s + c.usageLimit, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Khuyến mãi & Coupon</h1>
          <p className="text-sm text-slate-400">{coupons.length} mã giảm giá</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchCoupons} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500">
            <RefreshCw size={15} />
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] hover:bg-[#E5B800] text-white font-bold rounded-xl text-sm transition-colors">
            <Plus size={16} /> Tạo coupon
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng coupon", value: coupons.length, color: "bg-blue-500" },
          { label: "Đang hoạt động", value: totalActive, color: "bg-emerald-500" },
          { label: "Lượt dùng", value: totalUsage.toLocaleString(), color: "bg-purple-500" },
          { label: "Tỉ lệ dùng", value: totalLimit ? `${Math.round(totalUsage / totalLimit * 100)}%` : "0%", color: "bg-amber-500" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className={`w-8 h-8 ${s.color} rounded-xl flex items-center justify-center mb-2`} />
            <p className="text-xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {["Mã coupon", "Loại giảm giá", "Điều kiện", "Sử dụng", "Thời hạn", "Trạng thái", "Thao tác"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-4">
                    <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                  </td></tr>
                ))
              ) : coupons.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <p className="text-3xl mb-2">🎟️</p>
                  <p className="text-slate-500">Chưa có coupon nào</p>
                </td></tr>
              ) : coupons.map(c => {
                const st = getStatus(c);
                const usagePct = c.usageLimit > 0 ? Math.round((c.usedCount || 0) / c.usageLimit * 100) : 0;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg text-sm">
                          {c.code}
                        </span>
                        <button onClick={() => copyCode(c.code)} className="text-slate-400 hover:text-slate-600" title="Copy">
                          {copied === c.code
                            ? <span className="text-xs text-emerald-600 font-bold">✓</span>
                            : <Copy size={13} />}
                        </button>
                      </div>
                      {c.description && <p className="text-xs text-slate-400 mt-0.5">{c.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${c.discountType === "PERCENTAGE" ? "text-blue-600" : "text-purple-600"}`}>
                        {c.discountType === "PERCENTAGE" ? `-${c.discountValue}%` : `-${Number(c.discountValue).toLocaleString("vi-VN")}đ`}
                      </span>
                      {c.maxDiscount && (
                        <p className="text-xs text-slate-400">Tối đa {Number(c.maxDiscount).toLocaleString("vi-VN")}đ</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      Đơn từ {Number(c.minOrderValue).toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-800">{c.usedCount || 0} / {c.usageLimit}</p>
                      <div className="w-20 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                        <div className={`h-full rounded-full ${usagePct >= 90 ? "bg-red-500" : usagePct >= 70 ? "bg-amber-500" : "bg-blue-500"}`}
                          style={{ width: `${Math.min(usagePct, 100)}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      <p>{c.startDate}</p>
                      <p className="text-slate-400">→ {c.endDate}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[st]}`}>
                        {STATUS_LABEL[st]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => toggleActive(c.id)} title={c.isActive ? "Tắt" : "Bật"}
                          className="text-slate-400 hover:text-blue-600 transition-colors">
                          {c.isActive
                            ? <ToggleRight size={20} className="text-emerald-500" />
                            : <ToggleLeft size={20} />}
                        </button>
                        <button onClick={() => openEdit(c)}
                          className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1.5 rounded-lg">
                          <Edit2 size={11} /> Sửa
                        </button>
                        <button onClick={() => handleDelete(c.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-2 py-1.5 rounded-lg">
                          <Trash2 size={11} /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{editing ? "Chỉnh sửa coupon" : "Tạo coupon mới"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Mã coupon *</label>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="VD: SUMMER2026"
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Mô tả</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Mô tả ngắn..."
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Loại giảm giá</label>
                  <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value as DiscountType }))}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none">
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                    <option value="FIXED">Số tiền cố định</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Giá trị {form.discountType === "PERCENTAGE" ? "(%)" : "(đ)"}
                  </label>
                  <input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: Number(e.target.value) }))}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Đơn tối thiểu (đ)</label>
                  <input type="number" value={form.minOrderValue} onChange={e => setForm(f => ({ ...f, minOrderValue: Number(e.target.value) }))}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Giảm tối đa (đ, để trống = không giới hạn)</label>
                  <input type="number" value={form.maxDiscount ?? ""}
                    onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="Không giới hạn"
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Giới hạn sử dụng</label>
                <input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: Number(e.target.value) }))}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Ngày bắt đầu</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Ngày kết thúc</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="rounded border-slate-300 accent-blue-600" />
                <span className="text-sm font-medium text-slate-700">Kích hoạt coupon ngay</span>
              </label>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setShowModal(false)}
                className="flex-1 h-11 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50">
                Hủy
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 h-11 bg-[#1A1A1A] hover:bg-[#E5B800] text-white font-bold rounded-xl disabled:opacity-60">
                {saving ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
