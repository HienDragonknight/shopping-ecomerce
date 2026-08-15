"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import { ProductCard } from "@/components/ProductCard";
import type { ProductSectionData } from "@/types";
import { useLocale } from "@/context/LocaleContext";
import { useT } from "@/hooks/useT";

interface ProductSectionProps {
  section: ProductSectionData;
}

const SECTION_TITLE_EN_MAP: Record<string, string> = {
  "QUẦN ÁO": "CLOTHING",
  "Quần áo": "Clothing",
  "GIÀY DÉP": "FOOTWEAR",
  "Giày dép": "Footwear",
  "TÚI XÁCH": "BAGS",
  "Túi xách": "Bags",
  "ĐỒNG HỒ": "WATCHES",
  "Đồng hồ": "Watches",
  "KÍNH MẮT": "EYEWEAR",
  "Kính mắt": "Eyewear",
  "PHỤ KIỆN": "ACCESSORIES",
  "Phụ kiện": "Accessories",
  "ÁO THUN": "T-SHIRTS",
  "Áo thun": "T-Shirts",
  "ÁO SƠ MI": "SHIRTS",
  "Áo sơ mi": "Shirts",
  "QUẦN JEANS": "JEANS",
  "Quần jeans": "Jeans",
  "VÁY ĐẦM": "DRESSES",
  "Váy đầm": "Dresses",
  "GIÀY SNEAKER": "SNEAKERS",
  "Giày sneaker": "Sneakers",
  "GIÀY CAO GÓT": "HIGH HEELS",
  "Giày cao gót": "High Heels",
  "DÉP": "SANDALS",
  "Dép": "Sandals",
  "HÀNG MỚI VỀ": "NEW ARRIVALS",
  "Hàng mới về": "New Arrivals",
  "SẢN PHẨM MỚI": "NEW PRODUCTS",
  "Sản phẩm mới": "New Products",
  "SẢN PHẨM NỔI BẬT": "FEATURED PRODUCTS",
  "Sản phẩm nổi bật": "Featured Products",
  "BỘ SƯU TẬP": "COLLECTIONS",
  "Bộ sưu tập": "Collections",
};

export function ProductSection({ section }: ProductSectionProps) {
  const { locale } = useLocale();
  const t = useT();

  const isEn = locale === "en";
  let displayTitle = section.title;
  if (isEn) {
    displayTitle =
      SECTION_TITLE_EN_MAP[section.title] ||
      SECTION_TITLE_EN_MAP[section.title.toUpperCase()] ||
      section.title;
  }

  return (
    <section className="py-8 bg-white">
      <div className="yody-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-black text-[#1A1A1A] tracking-tight uppercase">
            {displayTitle}
          </h2>
          <Link
            href={section.viewMoreLink}
            className="flex items-center gap-1 text-sm font-semibold text-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
          >
            {t.common.viewMore}
            <ChevronRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {section.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
