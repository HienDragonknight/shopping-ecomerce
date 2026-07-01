"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types";

interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  effectivePrice: number;
  thumbnailUrl: string | null;
  brand: { name: string } | null;
  category: { name: string } | null;
  avgRating: number | null;
  reviewCount: number;
  variants: { id: number; size: string | null; color: string | null; stockQty: number }[];
}

interface CategoryInfo { id: number; name: string; slug: string }

// ── Config cho từng slug ──────────────────────────────────────────────────────
interface SlugConfig {
  label: string;
  subtitle: string;
  hero: string;
  badge: string;
  /** gender param gửi lên BE (MALE/FEMALE/KIDS/UNISEX), undefined = không lọc */
  gender?: string;
  /** sort mặc định */
  defaultSort: string;
  /** chỉ lấy sản phẩm đang sale (discount ≥ 50%) */
  saleOnly?: boolean;
  /** tìm category trong DB theo slug này (khi cần lọc thêm theo category) */
  categorySlug?: string;
}

const SLUG_CONFIG: Record<string, SlugConfig> = {
  nam: {
    label: "Nam",
    badge: "👔 Nam",
    subtitle: "Phong cách nam tính — từ casual đến formal",
    hero: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1400&q=80&fit=crop",
    gender: "MALE",
    defaultSort: "newest",
  },
  nu: {
    label: "Nữ",
    badge: "👗 Nữ",
    subtitle: "Tinh tế, hiện đại — thời trang nữ đỉnh cao",
    hero: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1400&q=80&fit=crop",
    gender: "FEMALE",
    defaultSort: "newest",
  },
  "tre-em": {
    label: "Trẻ Em",
    badge: "🧒 Trẻ Em",
    subtitle: "Thoải mái — năng động — đáng yêu",
    hero: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=1400&q=80&fit=crop",
    gender: "KIDS",
    defaultSort: "newest",
  },
  unisex: {
    label: "Unisex",
    badge: "✦ Unisex",
    subtitle: "Phong cách không giới hạn — dành cho tất cả",
    hero: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1400&q=80&fit=crop",
    gender: "UNISEX",
    defaultSort: "newest",
  },
  "hang-moi": {
    label: "Hàng Mới",
    badge: "🆕 Mới về",
    subtitle: "Bộ sưu tập mới nhất — vừa cập bến",
    hero: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80&fit=crop",
    defaultSort: "newest",
  },
  "sale-50": {
    label: "Sale 50%",
    badge: "🔥 Sale 50%",
    subtitle: "Giảm giá đến 50% — số lượng có hạn!",
    hero: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80&fit=crop",
    defaultSort: "popular",
    saleOnly: true,
  },
};

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "popular", label: "Phổ biến" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
];

const PRICE_RANGES = [
  { label: "Tất cả", min: "", max: "" },
  { label: "Dưới 200K", min: "", max: "200000" },
  { label: "200K – 500K", min: "200000", max: "500000" },
  { label: "500K – 1.000K", min: "500000", max: "1000000" },
  { label: "Trên 1.000K", min: "1000000", max: "" },
];

const PAGE_SIZE = 20;

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const config: SlugConfig = SLUG_CONFIG[slug] ?? {
    label: slug?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    badge: slug,
    subtitle: "Khám phá bộ sưu tập mới nhất",
    hero: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80&fit=crop",
    defaultSort: "newest",
  };

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState(config.defaultSort);
  const [priceIdx, setPriceIdx] = useState(0);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [subCategoryId, setSubCategoryId] = useState<number | null>(null);

  // Load categories list for sidebar sub-filter
  useEffect(() => {
    api.get("/categories").then((r) => {
      setCategories(r.data.data || []);
    }).catch(() => {});
  }, []);

  // Reset state when slug changes
  useEffect(() => {
    setPage(0);
    setPriceIdx(0);
    setMinPrice("");
    setMaxPrice("");
    setSubCategoryId(null);
    setSort(config.defaultSort);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const p: Record<string, string | number> = {
        page,
        size: PAGE_SIZE,
        sort,
      };

      // Gender filter
      if (config.gender) p.gender = config.gender;

      // Price range
      if (minPrice) p.minPrice = minPrice;
      if (maxPrice) p.maxPrice = maxPrice;

      // Sub-category filter from sidebar
      if (subCategoryId) p.categoryId = subCategoryId;

      // Sale 50%: filter by discount
      if (config.saleOnly) {
        p.minDiscountPercent = 50;
      }

      const res = await api.get("/products", { params: p });
      const data = res.data.data;
      setProducts(data.content || []);
      setTotal(data.totalElements || 0);
    } catch {
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, sort, minPrice, maxPrice, subCategoryId, config.gender, config.saleOnly]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function handlePriceRange(idx: number) {
    const r = PRICE_RANGES[idx];
    setPriceIdx(idx);
    setMinPrice(r.min);
    setMaxPrice(r.max);
    setPage(0);
  }

  // Convert api products → ProductCard-compatible type
  const cardProducts: Product[] = products.map((p) => ({
    id: String(p.id),
    name: p.name,
    slug: p.slug,
    price: p.effectivePrice,
    originalPrice: p.salePrice ? p.basePrice : undefined,
    image:
      p.thumbnailUrl ??
      `https://placehold.co/400x533/F5F5F5/999?text=${encodeURIComponent(p.name.slice(0, 10))}`,
  }));

  const FilterPane = ({ onClose }: { onClose?: () => void }) => (
    <div className="space-y-7">
      {/* Sort */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Sắp xếp</p>
        <div className="space-y-0.5">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => { setSort(o.value); setPage(0); onClose?.(); }}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${
                sort === o.value ? "bg-[#1A1A1A] text-white font-semibold" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Khoảng giá</p>
        <div className="space-y-0.5">
          {PRICE_RANGES.map((r, i) => (
            <button
              key={i}
              onClick={() => { handlePriceRange(i); onClose?.(); }}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${
                priceIdx === i ? "bg-[#1A1A1A] text-white font-semibold" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-categories */}
      {categories.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Danh mục</p>
          <div className="space-y-0.5">
            <button
              onClick={() => { setSubCategoryId(null); setPage(0); onClose?.(); }}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${
                subCategoryId === null ? "bg-[#1A1A1A] text-white font-semibold" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Tất cả
            </button>
            {categories.slice(0, 10).map((c) => (
              <button
                key={c.id}
                onClick={() => { setSubCategoryId(c.id); setPage(0); onClose?.(); }}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${
                  subCategoryId === c.id ? "bg-[#1A1A1A] text-white font-semibold" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <div className="relative h-[38vh] md:h-[52vh] overflow-hidden">
        <img
          src={config.hero}
          alt={config.label}
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/30 to-black/75" />

        {/* Breadcrumb */}
        <div className="absolute top-6 left-0 w-full px-4 sm:px-0">
          <div className="yody-container">
            <nav className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-widest">
              <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
              <span>/</span>
              <span className="text-white font-semibold">{config.label}</span>
            </nav>
          </div>
        </div>

        {/* Heading */}
        <div className="absolute bottom-0 left-0 w-full pb-8 px-4 sm:px-0">
          <div className="yody-container">
            <p className="text-white/50 text-[10px] uppercase tracking-[0.35em] mb-2 font-semibold">Bộ sưu tập</p>
            <h1 className="text-white text-5xl md:text-7xl font-black tracking-tight uppercase leading-none">
              {config.label}
            </h1>
            <p className="text-white/60 text-sm mt-2.5 max-w-sm">{config.subtitle}</p>
          </div>
        </div>
      </div>

      {/* ── STICKY BAR ── */}
      <div className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="yody-container">
          <div className="flex items-center justify-between h-11">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                <strong className="text-[#1A1A1A]">{loading ? "…" : total}</strong> sản phẩm
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1A1A1A] text-white">
                {config.badge}
              </span>
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              className="md:hidden flex items-center gap-1.5 text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4h18M7 12h10M11 20h2" />
              </svg>
              Lọc
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER ── */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <aside className="relative ml-auto w-72 bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <span className="text-sm font-black uppercase tracking-[0.15em]">Bộ lọc</span>
              <button onClick={() => setFilterOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <FilterPane onClose={() => setFilterOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* ── LAYOUT ── */}
      <div className="yody-container py-8 md:py-12">
        <div className="flex gap-10">

          {/* Desktop sidebar */}
          <aside className="hidden md:block w-48 shrink-0">
            <div className="sticky top-28">
              <FilterPane />
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-[3/4] bg-slate-100 rounded-3xl animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded-full w-3/4 animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded-full w-1/2 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : cardProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Không tìm thấy sản phẩm</p>
                <p className="text-xs text-slate-400">Thử thay đổi bộ lọc hoặc chọn danh mục khác</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                {cardProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-14">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-full text-slate-500 hover:border-[#1A1A1A] hover:text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${
                      page === i ? "bg-[#1A1A1A] text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-full text-slate-500 hover:border-[#1A1A1A] hover:text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
