"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/types";

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

const colorOptions = [
  { name: "Xanh nhạt", value: "#D4E6F1" },
  { name: "Đen", value: "#1A1A1A" },
  { name: "Đỏ", value: "#E53E3E" },
  { name: "Xanh lá", value: "#2d6a4f" },
  { name: "Trắng", value: "#FFFFFF" },
];

function getSwatches(productId: string) {
  const hash = productId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const count = (hash % 2) + 2; // 2-3 swatches
  return colorOptions.slice(hash % 3, (hash % 3) + count);
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const swatches = getSwatches(product.id);

  // Use the first swatch as default selected if none is set
  const activeColor = selectedColor || swatches[0]?.value;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col w-full bg-white transition-all duration-300"
    >
      {/* Image container with large rounded corners like in the reference */}
      <div className="relative aspect-[3/4] bg-[#F5F5F5] rounded-3xl overflow-hidden mb-3">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://placehold.co/300x400/F5F5F5/CCCCCC?text=${encodeURIComponent(
              product.name.slice(0, 8)
            )}`;
          }}
        />

        {/* Simple discount tag on top left if original price exists */}
        {product.originalPrice && (
          <span className="absolute top-3 left-3 bg-[#E53E3E] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}
      </div>

      {/* Info: Simple & clean text right below the image */}
      <div className="flex flex-col gap-1 px-1">
        {/* Pricing: large and bold */}
        <div className="flex items-baseline gap-2">
          <span className="text-base md:text-lg font-extrabold text-[#1A1A1A]">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-slate-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Title: simple regular font */}
        <h3 className="text-xs md:text-sm text-slate-700 font-medium line-clamp-2 leading-relaxed tracking-tight group-hover:text-[#1A1A1A] transition-colors">
          {product.name}
        </h3>

        {/* Swatches: simple mini circle with gold border highlight as in reference image */}
        <div className="flex items-center gap-2 mt-1">
          {swatches.map((color) => {
            const isActive = activeColor === color.value;
            return (
              <button
                key={color.value}
                aria-label={`Màu ${color.name}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColor(color.value);
                }}
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isActive 
                    ? "border-2 border-[#1A1A1A] p-[2px]" 
                    : "border border-transparent hover:scale-105"
                }`}
              >
                <span 
                  className="w-full h-full rounded-full border border-slate-200" 
                  style={{ backgroundColor: color.value }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
