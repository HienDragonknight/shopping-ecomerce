"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ApiCollection } from "@/types";

interface CollectionTabsProps {
  collections: ApiCollection[];
}

export function CollectionTabs({ collections }: CollectionTabsProps) {
  const [active, setActive] = useState<number | null>(
    collections.length > 0 ? collections[0].id : null
  );

  if (collections.length === 0) return null;

  return (
    <div className="bg-white border-b border-[#E5E5E5]">
      <div className="yody-container">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide py-4">
          {collections.map((col) => {
            const isActive = active === col.id;
            return (
              <Link
                key={col.id}
                href={`/collection/${col.slug}`}
                onClick={() => setActive(col.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-2 group transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FCCE00]`}
              >
                {/* Thumbnail circle */}
                <div
                  className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-200 ${
                    isActive
                      ? "border-[#FCCE00] scale-105"
                      : "border-[#E5E5E5] group-hover:border-[#FCCE00] group-hover:scale-105"
                  }`}
                >
                  <Image
                    src={col.imageUrl ?? `https://placehold.co/64x64/F5F5F5/999?text=${encodeURIComponent(col.name.slice(0, 3))}`}
                    alt={col.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.src = `https://placehold.co/64x64/F5F5F5/999?text=${encodeURIComponent(col.name.slice(0, 3))}`;
                    }}
                  />
                </div>
                {/* Label */}
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide text-center leading-tight max-w-[72px] whitespace-normal transition-colors duration-200 ${
                    isActive
                      ? "text-[#1A1A1A]"
                      : "text-[#666] group-hover:text-[#1A1A1A]"
                  }`}
                >
                  {col.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
