"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
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

interface Category { id: number; name: string; parentId?: number | null }
interface Brand { id: number; name: string }

const getCategoryEmoji = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("quần áo") || lower.includes("áo") || lower.includes("quần")) return "👕";
  if (lower.includes("giày") || lower.includes("dép")) return "👟";
  if (lower.includes("túi")) return "👜";
  if (lower.includes("đồng hồ")) return "⌚";
  if (lower.includes("kính")) return "🕶️";
  if (lower.includes("phụ kiện")) return "🧣";
  return "📦";
};

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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" | "active" | "inactive"
  const [stockFilter, setStockFilter] = useState(""); // "" | "out" | "low" | "in"
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search — chỉ gọi API sau 350ms kể từ lần gõ cuối cùng
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Quick stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    lowStock: 0,
    outOfStock: 0
  });

  // Action loaders
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectedCategoryObj = categories.find(c => String(c.id) === String(categoryId));
  const selectedRootId = selectedCategoryObj 
    ? (selectedCategoryObj.parentId || selectedCategoryObj.id) 
    : null;

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
      if (debouncedSearch) params.search = debouncedSearch;
      if (categoryId) params.categoryId = categoryId;
      if (brandId) params.brandId = brandId;
      if (statusFilter) params.isActive = statusFilter === "active";

      // DB-native sorting
      if (sortField === "price") {
        params.sort = sortOrder === "asc" ? "price_asc" : "price_desc";
      } else if (sortField === "name") {
        params.sort = sortOrder === "asc" ? "name_asc" : "name_desc";
      } else {
        params.sort = "newest";
      }

      // Gọi song song 2 API — nhanh hơn gọi tuần tự
      const [res, statsRes] = await Promise.all([
        api.get("/admin/products", { params }),
        api.get("/admin/inventory"),
      ]);

      let loaded: Product[] = res.data.data.content || [];
      loaded = processProducts(loaded);

      // Client side filtering for stock status
      if (stockFilter) {
        loaded = loaded.filter(p => {
          const stock = p.totalStock || 0;
          if (stockFilter === "out") return stock === 0;
          if (stockFilter === "low") return stock > 0 && stock <= 10;
          if (stockFilter === "in") return stock > 10;
          return true;
        });
      }

      // If sortField is stock, sort client-side
      if (sortField === "stock") {
        loaded.sort((a, b) => {
          const valA = a.totalStock || 0;
          const valB = b.totalStock || 0;
          return sortOrder === "asc" ? valA - valB : valB - valA;
        });
      }

      setProducts(loaded);
      setTotalPages(res.data.data.totalPages || 1);
      setTotalElements(res.data.data.totalElements || 0);

      const invData = statsRes.data.data || {};
      setStats({
        total: res.data.data.totalElements || 0,
        active: loaded.filter(p => p.isActive).length,
        lowStock: invData.lowStock || 0,
        outOfStock: invData.outOfStock || 0
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, categoryId, brandId, statusFilter, stockFilter, sortField, sortOrder]);

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

      {/* Root Category Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phân loại sản phẩm</h2>
          {categoryId && (
            <button
              onClick={() => { setCategoryId(""); setPage(0); }}
              className="text-xs font-bold text-[#FCCE00] hover:text-[#E5B800] transition-colors"
            >
              Xem tất cả sản phẩm
            </button>
          )}
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => { setCategoryId(""); setPage(0); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${
              !selectedRootId
                ? "bg-[#1A1A1A] text-white shadow-md shadow-slate-900/10 scale-95"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span>📦</span>
            <span>Tất cả</span>
          </button>
          
          {categories
            .filter(c => !c.parentId)
            .map(rootCat => {
              const isActive = selectedRootId === rootCat.id;
              return (
                <button
                  key={rootCat.id}
                  onClick={() => { setCategoryId(String(rootCat.id)); setPage(0); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${
                    isActive
                      ? "bg-[#FCCE00] text-[#1A1A1A] shadow-md shadow-[#FCCE00]/10 scale-95"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{getCategoryEmoji(rootCat.name)}</span>
                  <span>{rootCat.name}</span>
                </button>
              );
            })}
        </div>

        {/* Subcategories pills */}
        {selectedRootId && (
          <div className="flex gap-1.5 overflow-x-auto pt-2 border-t border-slate-100/60 pb-1 scrollbar-none animate-in fade-in duration-200">
            <button
              onClick={() => { setCategoryId(String(selectedRootId)); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                String(categoryId) === String(selectedRootId)
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
              }`}
            >
              Tất cả {categories.find(c => c.id === selectedRootId)?.name}
            </button>
            {categories
              .filter(c => c.parentId === selectedRootId)
              .map(subCat => {
                const isSubActive = String(categoryId) === String(subCat.id);
                return (
                  <button
                    key={subCat.id}
                    onClick={() => { setCategoryId(String(subCat.id)); setPage(0); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      isSubActive
                        ? "bg-[#FCCE00]/25 text-[#735A00] border border-[#FCCE00]/40 font-black"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 border border-transparent"
                    }`}
                  >
                    {subCat.name}
                  </button>
                );
              })}
          </div>
        )}
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
                <th className="w-8 px-2 py-3.5"></th>
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
                    <td colSpan={8} className="px-4 py-4">
                      <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
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

                const uniqueColors = Array.from(new Set(p.variants?.map(v => v.color).filter(Boolean)));
                const uniqueSizes = Array.from(new Set(p.variants?.map(v => v.size).filter(Boolean)));

                const isExpanded = expandedRows.has(p.id);

                return (
                  <Fragment key={p.id}>
                    <tr className={`hover:bg-slate-50/50 transition-all ${selected.has(p.id) ? "bg-[#FFFDE7]/20" : ""}`}>
                      <td className="px-4 py-4">
                        <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)}
                          className="rounded border-slate-300 accent-[#FCCE00] w-4 h-4" />
                      </td>
                      <td className="px-2 py-4 text-center">
                        <button 
                          onClick={() => toggleRow(p.id)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
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
                            {/* Visual color and size swatches */}
                            {(uniqueColors.length > 0 || uniqueSizes.length > 0) && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                {uniqueColors.map((color, cIdx) => (
                                  <span 
                                    key={cIdx} 
                                    className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full border border-slate-200"
                                    title={`Màu: ${color}`}
                                  >
                                    {color}
                                  </span>
                                ))}
                                {uniqueSizes.map((size, sIdx) => (
                                  <span 
                                    key={sIdx} 
                                    className="text-[9px] font-bold bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200/60"
                                    title={`Cỡ: ${size}`}
                                  >
                                    {size}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {p.category ? (
                          <div className="space-y-0.5">
                            {/* Parent category if exists */}
                            {categories.find(c => c.id === p.category?.id)?.parentId ? (
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                  {categories.find(c => c.id === categories.find(sub => sub.id === p.category?.id)?.parentId)?.name}
                                </span>
                                <span className="text-slate-400 text-[10px]">→</span>
                                <span className="text-xs font-bold text-slate-700">
                                  {p.category.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-slate-700 bg-[#FCCE00]/10 text-[#735A00] px-1.5 py-0.5 rounded">
                                {p.category.name}
                              </span>
                            )}
                            <p className="text-[10px] text-slate-400 mt-0.5">{p.brand?.name || "—"}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
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
                    {isExpanded && (
                      <tr className="bg-slate-50/40">
                        <td colSpan={8} className="px-4 sm:px-12 py-3 border-t border-slate-100">
                          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-4 space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                              <Layers size={12} />
                              Chi tiết các biến thể ({p.variants?.length || 0})
                            </h4>
                            {p.variants && p.variants.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {p.variants.map((v, vIdx) => {
                                  const isLow = v.stockQty > 0 && v.stockQty <= 10;
                                  const isOut = v.stockQty === 0;
                                  let badgeColor = "border-slate-100 bg-slate-50 text-slate-600";
                                  if (isOut) badgeColor = "border-red-100 bg-red-50 text-red-700";
                                  else if (isLow) badgeColor = "border-amber-100 bg-amber-50 text-amber-700";

                                  return (
                                    <div key={v.id || vIdx} className={`border rounded-xl p-3 flex flex-col justify-between space-y-2 bg-white shadow-xs ${isOut ? 'border-red-200' : isLow ? 'border-amber-200' : 'border-slate-200'}`}>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-800">Biến thể #{vIdx + 1}</span>
                                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${badgeColor}`}>
                                          {isOut ? 'Hết hàng' : isLow ? 'Sắp hết' : 'Còn hàng'}
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                          <p className="text-slate-400 font-medium">Màu sắc</p>
                                          <p className="font-bold text-slate-700 mt-0.5">{v.color || "—"}</p>
                                        </div>
                                        <div>
                                          <p className="text-slate-400 font-medium">Kích cỡ</p>
                                          <p className="font-bold text-slate-700 mt-0.5">{v.size || "—"}</p>
                                        </div>
                                      </div>
                                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-xs text-slate-400">Số lượng:</span>
                                        <span className="text-sm font-black text-slate-800">{v.stockQty} sp</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">Sản phẩm này chưa được thiết lập biến thể.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
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
