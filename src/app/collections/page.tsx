"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useT } from "@/hooks/useT";
import Link from "next/link";
import api from "@/lib/api";
import { collections as LOCAL_COLLECTIONS } from "@/lib/data";
import type { Collection, Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { Sparkles, ArrowRight, Layers } from "lucide-react";

export default function CollectionsPage() {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const t = useT();

  const [cols, setCols] = useState<Collection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [collectionProducts, setCollectionProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.get("/homepage/collections")
      .then(res => {
        if (res?.data?.data && res.data.data.length > 0) {
          const MOCK_SLUGS = [
            'dream-team-winner',
            'ao-chong-nang',
            'bst-sip-emmm',
            'ao-giu-nhiet-xtra-heat',
            'jeans-collection',
            'bst-business-casual',
            'yody-sport-nhe-tenh',
            'everyday-basics'
          ];
          const filtered = res.data.data.filter((item: any) => !MOCK_SLUGS.includes(item.slug));
          setCols(filtered);
        }
      })
      .catch(() => {
        setCols([]);
      })
      .finally(() => setLoading(false));

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

      {/* ── HERO HEADER BLOCK & LOOKBOOK CARDS GRID (Only render if collections exist) ── */}
      {(loading || cols.length > 0) && (
        <>
          <section className="bg-white border-b border-slate-100 py-16 md:py-24 text-center relative overflow-hidden">
            {/* Subtle background graphics */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-48 h-48 bg-[#fcaf17]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 right-0 -translate-y-1/2 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="yody-container max-w-3xl relative z-10 space-y-5 px-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold bg-[#fcaf17]/10 text-amber-800 border border-[#fcaf17]/20 uppercase tracking-widest animate-fade-in">
                <Sparkles size={10} className="text-amber-600 animate-pulse" />
                {isEn ? "Exclusive Editorial" : "Tập san độc quyền"}
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-none">
                {isEn ? "VIE'CO LOOKBOOKS" : "BỘ SƯU TẬP NỔI BẬT"}
              </h1>
              <div className="w-12 h-1 bg-[#fcaf17] mx-auto rounded-full mt-4" />
              <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed pt-2">
                {isEn
                  ? "Immerse yourself in our signature seasonal concepts, technical textiles, and modern premium style statements."
                  : "Khám phá các câu chuyện thời trang qua lăng kính sáng tạo, chất liệu đột phá và kiểu dáng tinh tế nhất từ Vie'Co."}
              </p>
            </div>
          </section>

          {/* ── LOOKBOOK CARDS GRID ── */}
          <div className="yody-container max-w-7xl mt-16 px-4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] rounded-3xl bg-slate-100 animate-pulse border border-slate-200/50" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {cols.map((col) => (
                  <Link
                    key={col.id}
                    href={`/collection/${col.slug}`}
                    className="group relative bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col hover:-translate-y-1.5"
                  >
                    {/* Visual Image container with 4:5 editorial aspect ratio */}
                    <div className="aspect-[4/5] w-full bg-slate-50 relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={col.image || `https://placehold.co/600x750/1A1A1A/FFFFFF?text=${encodeURIComponent(col.name)}`}
                        alt={col.name}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement;
                          t.src = `https://placehold.co/600x750/1A1A1A/FFFFFF?text=${encodeURIComponent(col.name)}`;
                        }}
                      />
                      {/* Premium gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Absolute Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-block px-3 py-1 rounded-full text-[9px] font-extrabold bg-[#fcaf17] text-black uppercase tracking-wider shadow-sm">
                          {isEn ? "LIMITED EDITION" : "BST GIỚI HẠN"}
                        </span>
                      </div>

                      {/* Absolute bottom details inside image container */}
                      <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                        <span className="text-[10px] font-bold text-[#fcaf17] tracking-widest uppercase block">
                          {isEn ? "Seasonal Look" : "Bộ sưu tập mới"}
                        </span>
                        <h3 className="text-xl md:text-2xl font-black tracking-tight line-clamp-2 leading-tight">
                          {col.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-white group-hover:text-[#fcaf17] pt-1 transition-colors">
                          <span>{isEn ? "Explore lookbook" : "Khám phá bộ sưu tập"}</span>
                          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── COLLECTION PRODUCTS FEED SECTION ── */}
      <div className={`yody-container max-w-7xl px-4 ${cols.length > 0 ? "mt-28" : "mt-8"}`}>
        {/* Section Title */}
        <div className={`pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 ${cols.length > 0 ? "border-t border-slate-100 pt-16" : "pt-4"}`}>
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
