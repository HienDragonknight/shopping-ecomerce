import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
      </div>
    </Link>
  );
}
