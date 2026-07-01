"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useT } from "@/hooks/useT";
import Link from "next/link";
import api from "@/lib/api";
import { collections as LOCAL_COLLECTIONS } from "@/lib/data";
import type { Collection } from "@/types";

export default function CollectionsPage() {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const t = useT();

  const [cols, setCols] = useState<Collection[]>(LOCAL_COLLECTIONS);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.get("/homepage/collections")
      .then(res => {
        if (res?.data?.data && res.data.data.length > 0) {
          setCols(res.data.data);
        }
      })
      .catch(() => {
        // Fallback to local
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white py-16 text-center space-y-4">
        <div className="yody-container max-w-3xl">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-widest">
            {isEn ? "Lookbook" : "Bộ Sưu Tập"}
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-3">
            {isEn ? "EXCLUSIVE COLLECTIONS" : "BỘ SƯU TẬP ĐỘC QUYỀN"}
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed mt-2">
            {isEn
              ? "Discover the signature seasonal lookbooks, heritage designs, and technology-driven capsules from Vie'Co."
              : "Khám phá các tập san thời trang theo mùa, thiết kế di sản và các bộ sưu tập giới hạn từ Vie'Co."}
          </p>
        </div>
      </section>

      <div className="yody-container max-w-6xl mt-12 px-4">
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm font-semibold animate-pulse">
            {t.common.loading}
          </div>
        ) : cols.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm font-semibold">
            {t.common.noResults}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cols.map((col) => (
              <Link
                key={col.id}
                href={`/collection/${col.slug}`}
                className="group relative bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1.5"
              >
                {/* Visual Image container */}
                <div className="aspect-[4/3] w-full bg-slate-100 relative overflow-hidden border-b border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={col.image || `https://placehold.co/600x450/1A1A1A/FFFFFF?text=${encodeURIComponent(col.name)}`}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.src = `https://placehold.co/600x450/1A1A1A/FFFFFF?text=${encodeURIComponent(col.name)}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Info Text */}
                <div className="p-6 flex-1 flex flex-col justify-between items-start space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                      {isEn ? "Seasonal Capsule" : "BST Giới Hạn"}
                    </span>
                    <h3 className="text-lg font-black text-slate-950 group-hover:text-amber-500 transition-colors">
                      {col.name}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-950 group-hover:underline">
                    {isEn ? "View Collection →" : "Khám phá bộ sưu tập →"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
