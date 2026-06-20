import { HeroBanner } from "@/components/HeroBanner";
import { TrustBanner } from "@/components/TrustBanner";
import { CollectionTabs } from "@/components/CollectionTabs";
import { ProductSection } from "@/components/ProductSection";
import { PromoSectionBanner } from "@/components/PromoSectionBanner";
import { BlogSection } from "@/components/BlogSection";
import {
  getHomepageBanners,
  getHomepageCollections,
  getHomepageSections,
  getHomepageBlogPosts,
} from "@/lib/homepage-api";
import type { ProductSectionData } from "@/types";

export default async function Home() {
  // Fetch all homepage data in parallel from the backend
  const [banners, collections, sections, blogPosts] = await Promise.all([
    getHomepageBanners(),
    getHomepageCollections(),
    getHomepageSections(),
    getHomepageBlogPosts(),
  ]);

  // Map API product sections → component ProductSectionData shape
  const productSections: ProductSectionData[] = sections.map((s) => ({
    id: s.id,
    title: s.title,
    viewMoreLink: s.viewMoreLink,
    products: s.products.map((p) => ({
      id: String(p.id),
      name: p.name,
      slug: p.slug,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.image ?? "/images/model_office.png",
    })),
  }));

  // Section indices (order from backend: easyoffice, polo, sale, kids, sun, jeans)
  const [easyoffice, polo, sale, kids, sun, jeans] = productSections;

  return (
    <>
      <HeroBanner slides={banners} />
      <TrustBanner />
      <CollectionTabs collections={collections} />

      {/* EASY OFFICE section */}
      {easyoffice && <ProductSection section={easyoffice} />}

      {/* Polo All-in-One promo + section */}
      <PromoSectionBanner
        title={"POLO ALL-IN-ONE\nMặc đẹp — Sống chất"}
        subtitle="Bộ sưu tập áo polo đa dụng cho mọi dịp"
        href="/collection/POLO-ALL-IN-ONE"
        image="/images/promo-office.jpg"
        bgColor="#E8F4FD"
        textColor="#1A2B49"
        accentColor="#FCCE00"
      />
      {polo && <ProductSection section={polo} />}

      {/* Sale section */}
      <div className="py-4 bg-[#FFF3F3]">
        <div className="yody-container">
          <div className="rounded-2xl p-6 flex items-center gap-4" style={{ background: "linear-gradient(135deg, #E53E3E 0%, #c0392b 100%)" }}>
            <div>
              <p className="text-white font-extrabold text-2xl md:text-3xl leading-tight">Giá cũ – Giá mới</p>
              <p className="text-white/80 text-sm mt-1">Chỉ từ 49K – Thoải mái diện đồ, không lo về giá</p>
            </div>
            <div className="ml-auto flex-shrink-0">
              <span className="inline-block bg-[#FCCE00] text-[#1A1A1A] font-extrabold text-3xl md:text-4xl px-6 py-3 rounded-xl">
                -50%
              </span>
            </div>
          </div>
        </div>
      </div>
      {sale && <ProductSection section={sale} />}

      {/* Kids promo + section */}
      <PromoSectionBanner
        title={"GÓI CẢ MÙA HÈ\nVÀO TỦ ĐỒ CỦA BÉ"}
        subtitle="Thế giới của con – ưu đãi cho mẹ"
        href="/collection/kid-20"
        image="/images/promo-kids.jpg"
        bgColor="#E3F2FD"
        textColor="#1A2B49"
        accentColor="#FCCE00"
      />
      {kids && <ProductSection section={kids} />}

      {/* Sun protection section */}
      {sun && <ProductSection section={sun} />}

      {/* Jeans section */}
      {jeans && <ProductSection section={jeans} />}

      {/* Blog */}
      <BlogSection posts={blogPosts} />
    </>
  );
}
