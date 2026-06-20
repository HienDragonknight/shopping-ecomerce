"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Search, Plus, Trash2, Edit2, Filter, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  effectivePrice: number;
  thumbnailUrl: string | null;
  isActive: boolean;
  brand: { name: string } | null;
  category: { name: string } | null;
  totalStock?: number;
}

interface Category { id: number; name: string }
interface Brand { id: number; name: string }

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Filters
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.get("/categories").then(r => setCategories(r.data.data || [])).catch(() => {});
    api.get("/brands").then(r => setBrands(r.data.data || [])).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    try {
      const params: Record<string, string | number> = { page, size: 15 };
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      if (brandId) params.brandId = brandId;
      if (statusFilter) params.isActive = statusFilter === "active" ? "true" : "false";

      const res = await api.get("/admin/products", { params });
      setProducts(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 1);
      setTotalElements(res.data.data.totalElements || 0);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId, brandId, statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const deleteProduct = async (id: number) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    await api.delete(`/admin/products/${id}`);
    fetchProducts();
  };

  const bulkDelete = async () => {
    if (!confirm(`Xóa ${selected.size} sản phẩm đã chọn?`)) return;
    await Promise.all([...selected].map(id => api.delete(`/admin/products/${id}`)));
    fetchProducts();
  };

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map(p => p.id)));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  const PAGE_SIZE = 15;
  const from = page * PAGE_SIZE + 1;
  const to = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sản phẩm</h1>
          <p className="text-sm text-slate-400">{totalElements} sản phẩm</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchProducts} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors">
            <RefreshCw size={15} />
          </button>
          <Link href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#FCCE00] hover:bg-[#E5B800] text-[#1A1A1A] font-bold rounded-xl text-sm transition-colors">
            <Plus size={16} />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên sản phẩm..."
              className="w-full h-10 pl-9 pr-4 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <button type="submit" className="h-10 px-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Tìm
          </button>
          <button type="button" onClick={() => setShowFilters(!showFilters)}
            className={`h-10 px-4 text-sm font-semibold rounded-xl border transition-colors flex items-center gap-2 ${
              showFilters ? "bg-blue-50 border-blue-200 text-blue-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}>
            <Filter size={15} />
            Bộ lọc
            {(categoryId || brandId || statusFilter) && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
          </button>
        </form>

        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-100">
            <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(0); }}
              className="h-9 px-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none">
              <option value="">Tất cả danh mục</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={brandId} onChange={e => { setBrandId(e.target.value); setPage(0); }}
              className="h-9 px-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none">
              <option value="">Tất cả thương hiệu</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
              className="h-9 px-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none">
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hiển thị</option>
              <option value="inactive">Ẩn</option>
            </select>
            <button onClick={() => { setCategoryId(""); setBrandId(""); setStatusFilter(""); setSearch(""); setPage(0); }}
              className="h-9 px-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors">
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
          <span className="text-sm font-semibold text-blue-700">Đã chọn {selected.size} sản phẩm</span>
          <button onClick={bulkDelete} className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 bg-white border border-red-200 px-3 py-1.5 rounded-lg">
            <Trash2 size={13} /> Xóa đã chọn
          </button>
          <button onClick={() => setSelected(new Set())} className="text-sm text-slate-500 hover:text-slate-700">Bỏ chọn</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={selected.size === products.length && products.length > 0}
                    onChange={toggleAll} className="rounded border-slate-300 accent-blue-600" />
                </th>
                {["Sản phẩm", "Danh mục / Thương hiệu", "Giá bán", "Trạng thái", "Thao tác"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <p className="text-4xl mb-2">📦</p>
                    <p className="font-semibold text-slate-500">Không tìm thấy sản phẩm</p>
                  </td>
                </tr>
              ) : products.map(p => (
                <tr key={p.id} className={`hover:bg-slate-50/70 transition-colors ${selected.has(p.id) ? "bg-blue-50/40" : ""}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)}
                      className="rounded border-slate-300 accent-blue-600" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.thumbnailUrl || `https://placehold.co/48x48/F8FAFC/CBD5E1?text=${encodeURIComponent(p.name[0])}`}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-slate-400 font-mono">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-700">{p.category?.name || "—"}</p>
                    <p className="text-xs text-slate-400">{p.brand?.name || "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-slate-900">{p.effectivePrice?.toLocaleString("vi-VN")}đ</p>
                    {p.salePrice && (
                      <p className="text-xs text-slate-400 line-through">{p.basePrice?.toLocaleString("vi-VN")}đ</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge type="product" value={p.isActive ? "ACTIVE" : "INACTIVE"} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/products/${p.id}/edit`}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors">
                        <Edit2 size={11} /> Sửa
                      </Link>
                      <button onClick={() => deleteProduct(p.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors">
                        <Trash2 size={11} /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-500">
            Hiển thị {from}–{to} trong {totalElements} sản phẩm
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                    page === p ? "bg-[#FCCE00] text-[#1A1A1A]" : "hover:bg-slate-100 text-slate-600"
                  }`}>
                  {p + 1}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
