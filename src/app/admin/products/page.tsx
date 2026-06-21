"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  AlertTriangle,
  Layers,
  Sparkles,
  Package,
  TrendingUp,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown
} from "lucide-react";

interface ProductVariant {
  id: number;
  size: string;
  color: string;
  stockQty: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  salePrice: number | null;
  effectivePrice: number;
  thumbnailUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  brand: { id: number; name: string } | null;
  category: { id: number; name: string } | null;
  variants: ProductVariant[];
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

  // Sorting
  const [sortField, setSortField] = useState<"name" | "price" | "stock" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filters
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" | "active" | "inactive"
  const [stockFilter, setStockFilter] = useState(""); // "" | "out" | "low" | "in"
  const [showFilters, setShowFilters] = useState(false);

  // Quick stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    lowStock: 0,
    outOfStock: 0
  });

  // Action loaders
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Load static categories & brands
  useEffect(() => {
    api.get("/categories").then(r => setCategories(r.data.data || [])).catch(() => {});
    api.get("/brands").then(r => setBrands(r.data.data || [])).catch(() => {});
  }, []);

  // Compute stock sum on product object helper
  const processProducts = (content: Product[]) => {
    return content.map(p => {
      const totalStock = p.variants ? p.variants.reduce((sum, v) => sum + (v.stockQty || 0), 0) : 0;
      return { ...p, totalStock };
    });
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    try {
      const params: Record<string, any> = { page, size: 10 };
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      if (brandId) params.brandId = brandId;
      if (statusFilter) params.isActive = statusFilter === "active";

      const res = await api.get("/admin/products", { params });
      let loaded: Product[] = res.data.data.content || [];
      loaded = processProducts(loaded);

      // Client side filtering for stock status (since backend specs don't have it directly)
      if (stockFilter) {
        loaded = loaded.filter(p => {
          const stock = p.totalStock || 0;
          if (stockFilter === "out") return stock === 0;
          if (stockFilter === "low") return stock > 0 && stock <= 10;
          if (stockFilter === "in") return stock > 10;
          return true;
        });
      }

      // Client-side sorting for premium interactivity
      loaded.sort((a, b) => {
        let valA: any = a[sortField as keyof Product] ?? "";
        let valB: any = b[sortField as keyof Product] ?? "";
        
        if (sortField === "price") {
          valA = a.effectivePrice;
          valB = b.effectivePrice;
        } else if (sortField === "stock") {
          valA = a.totalStock || 0;
          valB = b.totalStock || 0;
        } else if (sortField === "name") {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      setProducts(loaded);
      setTotalPages(res.data.data.totalPages || 1);
      setTotalElements(res.data.data.totalElements || 0);

      // Compute simple stats for the KPI section
      const statsRes = await api.get("/admin/inventory");
      const invData = statsRes.data.data || {};
      setStats({
        total: res.data.data.totalElements || 0,
        active: loaded.filter(p => p.isActive).length, // approximate active
        lowStock: invData.lowStock || 0,
        outOfStock: invData.outOfStock || 0
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId, brandId, statusFilter, stockFilter, sortField, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Toggle active/inactive status instantly
  const handleToggleStatus = async (p: Product) => {
    setTogglingId(p.id);
    try {
      const payload = {
        name: p.name,
        description: p.description || "",
        basePrice: p.basePrice,
        salePrice: p.salePrice,
        thumbnailUrl: p.thumbnailUrl || "",
        isActive: !p.isActive,
        isFeatured: p.isFeatured,
        categoryId: p.category?.id || null,
        brandId: p.brand?.id || null,
        variants: p.variants || []
      };
      await api.put(`/admin/products/${p.id}`, payload);
      // Local state update for instant responsive feel
      setProducts(prev => prev.map(item => item.id === p.id ? { ...item, isActive: !p.isActive } : item));
    } catch (err) {
      alert("Không thể đổi trạng thái sản phẩm");
    } finally {
      setTogglingId(null);
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn ẩn/xóa sản phẩm này không?")) return;
    await api.delete(`/admin/products/${id}`);
    fetchProducts();
  };

  const bulkDelete = async () => {
    if (!confirm(`Bạn có chắc muốn ẩn ${selected.size} sản phẩm đã chọn?`)) return;
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

  const handleSort = (field: "name" | "price" | "stock" | "createdAt") => {
    if (sortField === field) {
      setSortOrder(o => o === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const PAGE_SIZE = 10;
  const from = page * PAGE_SIZE + 1;
  const to = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Sản phẩm</h1>
          <p className="text-xs text-slate-400">Xem, chỉnh sửa, kiểm soát tồn kho và cập nhật giá bán sản phẩm.</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button 
            onClick={fetchProducts} 
            className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-95"
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={15} />
          </button>
          <Link href="/admin/products/new"
            className="flex items-center gap-2 px-5 h-10 bg-[#FCCE00] hover:bg-[#E5B800] text-[#1A1A1A] font-bold rounded-xl text-sm transition-all shadow-sm active:scale-95">
            <Plus size={16} />
            Thêm sản phẩm mới
          </Link>
        </div>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Tổng sản phẩm",
            value: stats.total,
            icon: Package,
            color: "border-slate-100 bg-white text-slate-800",
            onClick: () => { setStockFilter(""); setStatusFilter(""); }
          },
          {
            title: "Đang hiển thị",
            value: stats.active,
            icon: Eye,
            color: "border-green-100 bg-green-50/20 text-green-700",
            onClick: () => { setStatusFilter("active"); setStockFilter(""); }
          },
          {
            title: "Sắp hết hàng",
            value: stats.lowStock,
            icon: TrendingUp,
            color: "border-amber-100 bg-amber-50/20 text-amber-700",
            onClick: () => { setStockFilter("low"); setStatusFilter(""); }
          },
          {
            title: "Đã hết hàng",
            value: stats.outOfStock,
            icon: AlertTriangle,
            color: "border-red-100 bg-red-50/20 text-red-700",
            onClick: () => { setStockFilter("out"); setStatusFilter(""); }
          }
        ].map((k, i) => (
          <div 
            key={i} 
            onClick={k.onClick}
            className={`border rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all flex items-center justify-between ${k.color}`}
          >
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">{k.title}</p>
              <p className="text-2xl font-black mt-1">{k.value}</p>
            </div>
            <span className="p-2 bg-white/80 rounded-xl shadow-xs">
              <k.icon size={18} />
            </span>
          </div>
        ))}
      </div>

      {/* Search & filters panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm theo tên, mô tả..."
              className="w-full h-10 pl-9 pr-4 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FCCE00]/30 focus:border-[#FCCE00]"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`h-10 px-4 text-sm font-semibold rounded-xl border transition-all flex items-center gap-2 ${
                showFilters ? "bg-[#FFFDE7] border-[#FCCE00] text-[#1A1A1A]" : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal size={15} />
              Bộ lọc nâng cao
              {(categoryId || brandId || statusFilter || stockFilter) && (
                <span className="w-2 h-2 bg-[#FCCE00] rounded-full" />
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Danh mục</label>
              <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(0); }}
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none">
                <option value="">Tất cả danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Thương hiệu</label>
              <select value={brandId} onChange={e => { setBrandId(e.target.value); setPage(0); }}
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none">
                <option value="">Tất cả thương hiệu</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Trạng thái</label>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none">
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang hiển thị</option>
                <option value="inactive">Đang ẩn</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Kho hàng</label>
              <select value={stockFilter} onChange={e => { setStockFilter(e.target.value); setPage(0); }}
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none">
                <option value="">Tất cả tồn kho</option>
                <option value="in">Còn hàng (&gt;10)</option>
                <option value="low">Sắp hết hàng (1–10)</option>
                <option value="out">Đã hết hàng (0)</option>
              </select>
            </div>
            <div className="sm:col-span-4 flex justify-end">
              <button 
                onClick={() => { setCategoryId(""); setBrandId(""); setStatusFilter(""); setStockFilter(""); setSearch(""); setPage(0); }}
                className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-red-50/50 border border-red-100 rounded-2xl px-4 py-3 animate-in fade-in slide-in-from-top-1">
          <span className="text-xs font-bold text-red-700">Đã chọn {selected.size} sản phẩm</span>
          <button 
            onClick={bulkDelete} 
            className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-white border border-red-200 px-3 py-1.5 rounded-xl shadow-xs"
          >
            <Trash2 size={13} /> Xóa hàng loạt
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-slate-500 hover:text-slate-700 font-semibold">Bỏ chọn</button>
        </div>
      )}

      {/* SaaS Product List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="w-10 px-4 py-3.5">
                  <input type="checkbox" checked={selected.size === products.length && products.length > 0}
                    onChange={toggleAll} className="rounded border-slate-300 accent-[#FCCE00] w-4 h-4" />
                </th>
                <th 
                  onClick={() => handleSort("name")}
                  className="px-4 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                >
                  <span className="flex items-center gap-1">
                    Sản phẩm {sortField === "name" && (sortOrder === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </span>
                </th>
                <th className="px-4 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Danh mục & Hiệu</th>
                <th 
                  onClick={() => handleSort("price")}
                  className="px-4 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                >
                  <span className="flex items-center gap-1">
                    Giá bán {sortField === "price" && (sortOrder === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </span>
                </th>
                <th 
                  onClick={() => handleSort("stock")}
                  className="px-4 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                >
                  <span className="flex items-center gap-1">
                    Tồn kho {sortField === "stock" && (sortOrder === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </span>
                </th>
                <th className="px-4 py-3.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 py-3.5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-4">
                      <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                      <Package className="text-slate-300" size={24} />
                    </div>
                    <p className="font-bold text-slate-700">Không tìm thấy sản phẩm nào</p>
                    <p className="text-xs text-slate-400 mt-0.5">Vui lòng điều chỉnh hoặc xóa bớt bộ lọc.</p>
                  </td>
                </tr>
              ) : products.map(p => {
                const stock = p.totalStock || 0;
                let stockColor = "text-green-600 bg-green-50";
                if (stock === 0) stockColor = "text-red-600 bg-red-50";
                else if (stock <= 10) stockColor = "text-amber-600 bg-amber-50";

                return (
                  <tr key={p.id} className={`hover:bg-slate-50/50 transition-all ${selected.has(p.id) ? "bg-[#FFFDE7]/20" : ""}`}>
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)}
                        className="rounded border-slate-300 accent-[#FCCE00] w-4 h-4" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.thumbnailUrl || "https://placehold.co/48x48/F5F5F5/999?text=Yody"}
                          alt={p.name}
                          className="w-11 h-11 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-blue-600 transition-colors">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">/{p.slug}</span>
                            {p.isFeatured && (
                              <span className="text-[9px] bg-red-50 text-red-600 px-1 py-0.5 rounded font-black flex items-center gap-0.5">
                                <Sparkles size={8} /> Nổi bật
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold text-slate-700">{p.category?.name || "—"}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{p.brand?.name || "—"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-black text-slate-900">{p.effectivePrice?.toLocaleString("vi-VN")}đ</p>
                      {p.salePrice && (
                        <p className="text-xs text-slate-400 line-through mt-0.5">{p.basePrice?.toLocaleString("vi-VN")}đ</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stockColor}`}>
                          {stock} sp
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({p.variants?.length || 0} biến thể)
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button 
                        disabled={togglingId === p.id}
                        onClick={() => handleToggleStatus(p)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          p.isActive 
                            ? "bg-green-50 text-green-700 hover:bg-green-100" 
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                        title={p.isActive ? "Nhấp để Ẩn sản phẩm" : "Nhấp để Hiển thị sản phẩm"}
                      >
                        {togglingId === p.id ? (
                          <span className="animate-spin rounded-full h-3 w-3 border-b border-current" />
                        ) : p.isActive ? (
                          <Eye size={12} />
                        ) : (
                          <EyeOff size={12} />
                        )}
                        {p.isActive ? "Hiển thị" : "Đang ẩn"}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/products/${p.id}/edit`}
                          className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition-colors">
                          <Edit2 size={13} />
                        </Link>
                        <button onClick={() => deleteProduct(p.id)}
                          className="w-8 h-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 flex items-center justify-center transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination control */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium">
              Hiển thị {from}–{to} trong {totalElements} sản phẩm
            </p>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))} 
                disabled={page === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed bg-white"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button 
                  key={i} 
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    page === i ? "bg-[#FCCE00] text-[#1A1A1A]" : "hover:bg-slate-100 text-slate-600 bg-white border border-slate-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                disabled={page >= totalPages - 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed bg-white"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
