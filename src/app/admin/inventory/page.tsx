"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Package, AlertTriangle, XCircle, RefreshCw, Search } from "lucide-react";

interface VariantRow {
  productId: number;
  variantId: number;
  productName: string;
  thumbnailUrl: string | null;
  color: string | null;
  size: string | null;
  sku: string | null;
  stockQty: number;
  editingQty?: number;
}

type FilterTab = "all" | "low" | "out";

export default function AdminInventoryPage() {
  const [rows, setRows] = useState<VariantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [saving, setSaving] = useState<number | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/inventory", { params: { page: 0, size: 200 } });
      const products: any[] = res.data.data.content || [];
      const flat: VariantRow[] = products.flatMap(p =>
        (p.variants || []).map((v: any) => ({
          productId: p.id,
          variantId: v.id,
          productName: p.name,
          thumbnailUrl: p.thumbnailUrl,
          color: v.color,
          size: v.size,
          sku: v.sku,
          stockQty: v.stockQty ?? 0,
        }))
      );
      setRows(flat);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const filtered = rows.filter(r => {
    const matchSearch = !search || r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.sku?.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      tab === "all" ? true :
      tab === "low" ? r.stockQty > 0 && r.stockQty <= 10 :
      tab === "out" ? r.stockQty === 0 : true;
    return matchSearch && matchTab;
  });

  const totalSkus = rows.length;
  const lowCount = rows.filter(r => r.stockQty > 0 && r.stockQty <= 10).length;
  const outCount = rows.filter(r => r.stockQty === 0).length;
  const totalUnits = rows.reduce((s, r) => s + r.stockQty, 0);

  const startEdit = (variantId: number, currentQty: number) => {
    setRows(prev => prev.map(r => r.variantId === variantId ? { ...r, editingQty: currentQty } : r));
  };

  const cancelEdit = (variantId: number) => {
    setRows(prev => prev.map(r => r.variantId === variantId ? { ...r, editingQty: undefined } : r));
  };

  const saveStock = async (variantId: number, newQty: number) => {
    setSaving(variantId);
    try {
      await api.put(`/admin/inventory/variants/${variantId}`, { stockQty: newQty });
      setRows(prev => prev.map(r => r.variantId === variantId ? { ...r, stockQty: newQty, editingQty: undefined } : r));
    } catch {
      alert("Cập nhật thất bại");
    } finally {
      setSaving(null);
    }
  };

  const getStockStatus = (qty: number) => {
    if (qty === 0) return { label: "Hết hàng", className: "bg-red-100 text-red-600" };
    if (qty <= 10) return { label: "Sắp hết", className: "bg-amber-100 text-amber-700" };
    return { label: "Còn hàng", className: "bg-emerald-100 text-emerald-700" };
  };

  const TABS: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "Tất cả", count: totalSkus },
    { id: "low", label: "Sắp hết (≤10)", count: lowCount },
    { id: "out", label: "Hết hàng", count: outCount },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý tồn kho</h1>
          <p className="text-sm text-slate-400">{totalSkus} biến thể</p>
        </div>
        <button onClick={fetchInventory} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng SKU", value: totalSkus, icon: <Package size={16} />, color: "bg-blue-500" },
          { label: "Tổng đơn vị", value: totalUnits.toLocaleString(), icon: <Package size={16} />, color: "bg-indigo-500" },
          { label: "Sắp hết hàng", value: lowCount, icon: <AlertTriangle size={16} />, color: "bg-amber-500", urgent: lowCount > 0 },
          { label: "Hết hàng", value: outCount, icon: <XCircle size={16} />, color: "bg-red-500", urgent: outCount > 0 },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-2xl p-4 shadow-sm border ${(s as any).urgent ? "border-red-200" : "border-slate-100"}`}>
            <div className={`w-8 h-8 ${s.color} rounded-xl flex items-center justify-center text-white mb-2`}>{s.icon}</div>
            <p className="text-xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                tab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}>
              {t.label}
              {t.count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? "bg-slate-100 text-slate-600" :
                  t.id === "out" && t.count > 0 ? "bg-red-100 text-red-600" :
                  t.id === "low" && t.count > 0 ? "bg-amber-100 text-amber-700" :
                  "bg-white text-slate-500"
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên sản phẩm hoặc SKU..."
            className="w-full h-10 pl-9 pr-4 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {["Sản phẩm", "Màu / Size", "SKU", "Tồn kho", "Trạng thái", "Cập nhật"].map(h => (
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
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <p className="text-3xl mb-2">📦</p>
                  <p className="text-slate-500">Không có dữ liệu tồn kho</p>
                </td></tr>
              ) : filtered.map(r => {
                const status = getStockStatus(r.stockQty);
                const isEditing = r.editingQty !== undefined;
                return (
                  <tr key={r.variantId} className={`hover:bg-slate-50/70 transition-colors ${r.stockQty === 0 ? "bg-red-50/20" : r.stockQty <= 10 ? "bg-amber-50/20" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.thumbnailUrl || `https://placehold.co/40x40/F8FAFC/CBD5E1?text=${encodeURIComponent(r.productName[0])}`}
                          alt="" className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                        />
                        <p className="text-sm font-semibold text-slate-900 line-clamp-2 max-w-[180px]">{r.productName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {[r.color, r.size].filter(Boolean).join(" / ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-400">{r.sku || "—"}</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={r.editingQty}
                          onChange={e => setRows(prev => prev.map(p => p.variantId === r.variantId ? { ...p, editingQty: Number(e.target.value) } : p))}
                          className="w-20 h-8 px-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          min={0}
                        />
                      ) : (
                        <span className={`text-sm font-bold ${r.stockQty === 0 ? "text-red-600" : r.stockQty <= 10 ? "text-amber-600" : "text-slate-900"}`}>
                          {r.stockQty}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => saveStock(r.variantId, r.editingQty!)}
                            disabled={saving === r.variantId}
                            className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg disabled:opacity-50">
                            {saving === r.variantId ? "..." : "Lưu"}
                          </button>
                          <button onClick={() => cancelEdit(r.variantId)}
                            className="text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(r.variantId, r.stockQty)}
                          className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors">
                          Sửa số lượng
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-400">Hiển thị {filtered.length} / {rows.length} biến thể</p>
        </div>
      </div>
    </div>
  );
}
