import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import { ProductCard } from "@/components/ProductCard";
import type { ProductSectionData } from "@/types";

interface ProductSectionProps {
  section: ProductSectionData;
}

export function ProductSection({ section }: ProductSectionProps) {
  return (
    <section className="py-8 bg-white">
      <div className="yody-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-black text-[#1A1A1A] tracking-tight uppercase">
            {section.title}
          </h2>
          <Link
            href={section.viewMoreLink}
            className="flex items-center gap-1 text-sm font-semibold text-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
          >
            Xem thêm
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
