"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

interface Product {
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

interface Category { id: number; name: string; slug: string }
interface Brand { id: number; name: string; slug: string }

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [brandId, setBrandId] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");

  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const PAGE_SIZE = 20;

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data.data || [])).catch(() => {});
    api.get("/brands").then((r) => setBrands(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryId, brandId, sort]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, size: PAGE_SIZE, sort };
      if (categoryId) params.categoryId = categoryId;
      if (brandId) params.brandId = brandId;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (search) {
        const res = await api.get("/products/search", { params: { q: search, page, size: PAGE_SIZE } });
        setProducts(res.data.data.content || []);
        setTotal(res.data.data.totalElements || 0);
        return;
      }
      const res = await api.get("/products", { params });
      setProducts(res.data.data.content || []);
      setTotal(res.data.data.totalElements || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const hasActiveFilter = !!(categoryId || brandId || minPrice || maxPrice);

  function FilterPanel({ onClose }: { onClose?: () => void }) {
    return (
      <div className="space-y-4">
        {/* Search */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-sm mb-3 text-[#1A1A1A]">Tìm kiếm</h3>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
              placeholder="Tên sản phẩm..."
              className="flex-1 h-9 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCCE00]"
            />
            <button
              onClick={() => { fetchProducts(); onClose?.(); }}
              className="h-9 px-3 bg-[#FCCE00] rounded-lg text-sm font-bold"
            >
              Tìm
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-sm mb-3 text-[#1A1A1A]">Danh mục</h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => { setCategoryId(null); setPage(0); onClose?.(); }}
                className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!categoryId ? "bg-[#FCCE00] font-bold" : "hover:bg-slate-50"}`}
              >
                Tất cả
              </button>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => { setCategoryId(c.id); setPage(0); onClose?.(); }}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${categoryId === c.id ? "bg-[#FCCE00] font-bold" : "hover:bg-slate-50"}`}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Brands */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-sm mb-3 text-[#1A1A1A]">Thương hiệu</h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => { setBrandId(null); setPage(0); onClose?.(); }}
                className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!brandId ? "bg-[#FCCE00] font-bold" : "hover:bg-slate-50"}`}
              >
                Tất cả
              </button>
            </li>
            {brands.map((b) => (
              <li key={b.id}>
                <button
                  onClick={() => { setBrandId(b.id); setPage(0); onClose?.(); }}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${brandId === b.id ? "bg-[#FCCE00] font-bold" : "hover:bg-slate-50"}`}
                >
                  {b.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Price */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-sm mb-3 text-[#1A1A1A]">Khoảng giá</h3>
          <div className="flex gap-2 items-center">
            <input
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Từ"
              type="number"
              className="w-full h-9 px-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            />
            <span className="text-slate-400">-</span>
            <input
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Đến"
              type="number"
              className="w-full h-9 px-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>
          <button
            onClick={() => { setPage(0); fetchProducts(); onClose?.(); }}
            className="mt-2 w-full h-9 bg-[#1A1A1A] text-white text-sm font-bold rounded-lg"
          >
            Áp dụng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5F5] min-h-screen py-6">
      <div className="yody-container">

        {/* ── Mobile top bar ── */}
        <div className="flex items-center justify-between mb-4 md:hidden">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 h-9 px-4 bg-white rounded-xl shadow-sm text-sm font-bold text-[#1A1A1A] border border-slate-200 active:scale-95 transition-transform"
          >
            {/* Filter icon */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Bộ lọc
            {hasActiveFilter && (
              <span className="w-2 h-2 rounded-full bg-[#FCCE00] inline-block" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              <span className="font-bold text-[#1A1A1A]">{total}</span> SP
            </span>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(0); }}
              className="h-9 px-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none"
            >
              <option value="newest">Mới nhất</option>
              <option value="popular">Phổ biến</option>
              <option value="price_asc">Giá ↑</option>
              <option value="price_desc">Giá ↓</option>
            </select>
          </div>
        </div>

        {/* ── Mobile filter drawer (slide down) ── */}
        {filterOpen && (
          <div className="md:hidden mb-4 animate-in slide-in-from-top-2 duration-200">
            <FilterPanel onClose={() => setFilterOpen(false)} />
            <button
              onClick={() => setFilterOpen(false)}
              className="mt-3 w-full h-10 bg-[#1A1A1A] text-white text-sm font-bold rounded-xl"
            >
              Đóng bộ lọc ✕
            </button>
          </div>
        )}

        {/* ── Desktop: sidebar + grid ── */}
        <div className="flex flex-col md:flex-row gap-6">

          {/* Desktop sidebar — hidden on mobile */}
          <aside className="hidden md:block w-64 shrink-0">
            <FilterPanel />
          </aside>

          {/* Product grid — ALWAYS visible */}
          <div className="flex-1 min-w-0">

            {/* Sort + count row (desktop only) */}
            <div className="hidden md:flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                <span className="font-bold text-[#1A1A1A]">{total}</span> sản phẩm
              </p>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(0); }}
                className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
              </select>
            </div>

            {/* Loading skeleton */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl aspect-[3/4] animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center text-slate-400">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold">Không tìm thấy sản phẩm</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {products.map((product) => {
                  const discount = product.salePrice
                    ? Math.round((1 - product.salePrice / product.basePrice) * 100)
                    : null;
                  const firstVariant = product.variants?.[0];

                  return (
                    <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <Link href={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-slate-100">
                        <img
                          src={product.thumbnailUrl || `https://placehold.co/300x400/F5F5F5/999?text=${encodeURIComponent(product.name)}`}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {discount && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            -{discount}%
                          </span>
                        )}
                      </Link>
                      <div className="p-2 md:p-3">
                        <Link href={`/product/${product.slug}`}>
                          <p className="text-xs text-slate-400 mb-0.5">{product.brand?.name || product.category?.name}</p>
                          <p className="text-xs md:text-sm font-semibold text-[#1A1A1A] line-clamp-2 mb-2 group-hover:text-[#FCCE00] transition-colors">
                            {product.name}
                          </p>
                        </Link>
                        <div className="flex items-baseline gap-1 mb-2 flex-wrap">
                          <span className="font-bold text-sm text-[#1A1A1A]">
                            {product.effectivePrice.toLocaleString("vi-VN")}đ
                          </span>
                          {product.salePrice && (
                            <span className="text-xs text-slate-400 line-through">
                              {product.basePrice.toLocaleString("vi-VN")}đ
                            </span>
                          )}
                        </div>
                        {isAuthenticated && firstVariant && (
                          <button
                            onClick={() => addItem(firstVariant.id)}
                            className="w-full h-7 md:h-8 bg-[#FCCE00] hover:bg-[#E5B800] text-[#1A1A1A] text-xs font-bold rounded-full transition-colors active:scale-95"
                          >
                            Thêm vào giỏ
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8 flex-wrap">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-9 h-9 rounded-full font-bold text-sm transition-colors ${
                      page === i ? "bg-[#FCCE00] text-[#1A1A1A]" : "bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
