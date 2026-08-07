"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import Link from "next/link";
import api from "@/lib/api";
import type { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { Layers } from "lucide-react";

export default function CollectionsPage() {
  const { locale } = useLocale();
  const isEn = locale === "en";

  const [collectionProducts, setCollectionProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  useEffect(() => {
    // Fetch products belonging to collections
    setLoadingProducts(true);
    api.get("/products", { params: { isCollection: true, page: 0, size: 8 } })
      .then(res => {
        const list = res.data.data?.content || [];
        const mapped: Product[] = list.map((item: any) => ({
          id: String(item.id),
          name: item.name,
          price: item.effectivePrice,
          originalPrice: item.salePrice ? item.basePrice : undefined,
          image: item.thumbnailUrl || "https://placehold.co/400x533/F5F5F5/999?text=VieCo",
          slug: item.slug
        }));
        setCollectionProducts(mapped);
      })
      .catch(() => { })
      .finally(() => setLoadingProducts(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FCFBFA] text-slate-800 pb-24">
      {/* ── BREADCRUMBS & TOP BAR ── */}
      <div className="bg-white border-b border-slate-100 py-4">
        <div className="yody-container max-w-7xl">
          <nav className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-black transition-colors font-medium">Trang chủ</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">{isEn ? "Collections" : "Bộ sưu tập"}</span>
          </nav>
        </div>
      </div>

      {/* ── COLLECTION PRODUCTS FEED SECTION ── */}
      <div className="yody-container max-w-7xl px-4 mt-8">
        {/* Section Title */}
        <div className="pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4">
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-bold text-[#fcaf17] uppercase tracking-widest block">
              {isEn ? "EXCLUSIVE CAPSULE PIECES" : "SẢN PHẨM PHIÊN BẢN GIỚI HẠN"}
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="text-amber-500" size={24} />
              {isEn ? "COLLECTION GALLERY" : "DANH SÁCH SẢN PHẨM BST"}
            </h2>
            <p className="text-slate-400 text-xs md:text-sm max-w-lg leading-relaxed">
              {isEn
                ? "Unique pieces available exclusively within seasonal lookbooks and digital capsules."
                : "Các thiết kế độc bản chỉ xuất hiện giới hạn trong các ấn phẩm Lookbook thời trang của Vie'Co."}
            </p>
          </div>

          {collectionProducts.length > 0 && (
            <div className="text-xs text-slate-400 font-bold shrink-0">
              Hiển thị {collectionProducts.length} sản phẩm
            </div>
          )}
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="aspect-[3/4] bg-slate-100 rounded-3xl" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : collectionProducts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl p-8 max-w-sm mx-auto">
            <span className="text-3xl text-slate-300">✨</span>
            <p className="text-slate-400 text-xs mt-3">
              {isEn ? "No collection products active yet." : "Chưa có sản phẩm BST nào được kích hoạt."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
            {collectionProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
