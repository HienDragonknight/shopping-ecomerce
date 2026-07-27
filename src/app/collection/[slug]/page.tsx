"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types";
import { useT } from "@/hooks/useT";
import { ChevronLeft, ChevronRight, Grid2X2, Grid3X3, Layers } from "lucide-react";

interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  effectivePrice: number;
  thumbnailUrl: string | null;
  brand: { name: string } | null;
  category: { name: string; id: number; slug: string } | null;
  avgRating: number | null;
  reviewCount: number;
  variants: { id: number; size: string | null; color: string | null; stockQty: number }[];
}

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "popular", label: "Phổ biến nhất" },
  { value: "price_asc", label: "Giá: Thấp → Cao" },
  { value: "price_desc", label: "Giá: Cao → Thấp" },
];

const PAGE_SIZE = 16;

export default function CollectionDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const t = useT();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [matchedCategory, setMatchedCategory] = useState<any | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [cols, setCols] = useState<3 | 4>(4);

  // Load category hierarchy to match slug
  useEffect(() => {
    api.get("/categories")
      .then((r) => {
        const cats = r.data.data || [];
        setCategories(cats);
        const match = cats.find((c: any) => c.slug === slug);
        if (match) {
          setMatchedCategory(match);
        }
      })
      .catch(() => {});
  }, [slug]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const p: Record<string, any> = {
        page,
        size: PAGE_SIZE,
        sort,
        isCollection: true, // Only fetch collection products!
      };

      if (matchedCategory) {
        p.categoryId = matchedCategory.id;
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
  }, [page, sort, matchedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Friendly title mapping
  const collectionTitle = matchedCategory?.name 
    ? matchedCategory.name
    : slug ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Lookbook";

  return (
    <div className="min-h-screen bg-[#FCFBFA] text-slate-800 pb-24">
      {/* ── BREADCRUMBS & TOP BAR ── */}
      <div className="bg-white border-b border-slate-100 py-4">
        <div className="yody-container max-w-7xl">
          <nav className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-black transition-colors font-medium">Trang chủ</Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-black transition-colors font-medium">Bộ sưu tập</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">{collectionTitle}</span>
          </nav>
        </div>
      </div>

      {/* ── VISUAL HEADER BANNER ── */}
      <section className="bg-white border-b border-slate-100 py-16 md:py-24 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-48 h-48 bg-[#fcaf17]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-0 -translate-y-1/2 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="yody-container max-w-3xl px-4 relative z-10 space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold bg-[#fcaf17]/10 text-amber-800 border border-[#fcaf17]/20 uppercase tracking-widest">
            BST ĐỘC QUYỀN
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-none">
            {collectionTitle.toUpperCase()}
          </h1>
          <div className="w-12 h-1 bg-[#fcaf17] mx-auto rounded-full mt-3" />
          <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed pt-1">
            Khám phá các thiết kế giới hạn, chất liệu cao cấp đột phá và form dáng thời thượng nằm trong bộ sưu tập này của Vie'Co.
          </p>
        </div>
      </section>

      {/* ── STICKY CONTROL BAR ── */}
      <div className="sticky top-[64px] z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="yody-container max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Hiển thị {total} sản phẩm</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Sắp xếp:</span>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(0); }}
                className="h-9 px-3 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-black"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Grid layout switcher */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button 
                type="button"
                onClick={() => setCols(3)}
                className={`p-1.5 rounded-lg transition-all ${cols === 3 ? "bg-white text-slate-900 shadow-xs" : "text-slate-400"}`}
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => setCols(4)}
                className={`p-1.5 rounded-lg transition-all ${cols === 4 ? "bg-white text-slate-900 shadow-xs" : "text-slate-400"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── PRODUCT FEED GRID ── */}
      <div className="yody-container max-w-7xl mx-auto px-4 md:px-8 mt-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="aspect-[3/4] bg-slate-100 rounded-3xl" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl p-8 max-w-md mx-auto shadow-sm">
            <span className="text-4xl">✨</span>
            <h3 className="font-bold text-slate-800 mt-4">Chưa có sản phẩm nào</h3>
            <p className="text-xs text-slate-400 mt-2">Bộ sưu tập này đang được cập nhật sản phẩm. Vui lòng quay lại sau.</p>
            <Link href="/collections" className="inline-block mt-6 px-6 py-2.5 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-full transition-colors">
              Quay lại danh sách BST
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Grid */}
            <div className={`grid grid-cols-2 md:grid-cols-3 ${cols === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12`}>
              {products.map((item) => {
                // Map to client Product shape
                const mappedProduct: Product = {
                  id: String(item.id),
                  name: item.name,
                  price: item.effectivePrice,
                  originalPrice: item.salePrice ? item.basePrice : undefined,
                  image: item.thumbnailUrl || "https://placehold.co/400x533/F5F5F5/999?text=VieCo",
                  slug: item.slug,
                  genderTags: []
                };
                return <ProductCard key={item.id} product={mappedProduct} />;
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8 border-t border-slate-200/60">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="w-10 h-10 border border-slate-200 rounded-xl bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold transition-all border ${
                      page === i
                        ? "bg-black border-black text-white shadow-md shadow-black/10 scale-105"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="w-10 h-10 border border-slate-200 rounded-xl bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
