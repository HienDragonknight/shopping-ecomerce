import { cookies } from "next/headers";
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
  // Read locale from NEXT_LOCALE cookie set by LocaleContext client component
  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value === "en" ? "en" : "vi";

  // Fetch all homepage data in parallel, forwarding locale to backend
  const [banners, collections, sections, blogPosts] = await Promise.all([
    getHomepageBanners(lang),
    getHomepageCollections(lang),
    getHomepageSections(lang),
    getHomepageBlogPosts(lang),
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

  // Locale-aware promo banner text
  const isEn = lang === "en";

  return (
    <>
      <HeroBanner slides={banners} />
      <TrustBanner />
      <CollectionTabs collections={collections} />

      {/* EASY OFFICE section */}
      {easyoffice && <ProductSection section={easyoffice} />}

      {/* Polo All-in-One promo + section */}
      <PromoSectionBanner
        title={isEn ? "POLO ALL-IN-ONE\nWear well — Live well" : "POLO ALL-IN-ONE\nMặc đẹp — Sống chất"}
        subtitle={isEn ? "Versatile polo collection for every occasion" : "Bộ sưu tập áo polo đa dụng cho mọi dịp"}
        href="/collection/POLO-ALL-IN-ONE"
        image="/images/promo-office.jpg"
        bgColor="#E8F4FD"
        textColor="#1A2B49"
        accentColor="#1A1A1A"
      />
      {polo && <ProductSection section={polo} />}

      {/* Sale section */}
      <div className="py-4 bg-[#FFF3F3]">
        <div className="yody-container">
          <div className="rounded-2xl p-6 flex items-center gap-4" style={{ background: "linear-gradient(135deg, #E53E3E 0%, #c0392b 100%)" }}>
            <div>
              <p className="text-white font-extrabold text-2xl md:text-3xl leading-tight">
                {isEn ? "Old price – New price" : "Giá cũ – Giá mới"}
              </p>
              <p className="text-white/80 text-sm mt-1">
                {isEn ? "From only 49K – Dress comfortably, worry-free" : "Chỉ từ 49K – Thoải mái diện đồ, không lo về giá"}
              </p>
            </div>
            <div className="ml-auto flex-shrink-0">
              <span className="inline-block bg-[#1A1A1A] text-white font-extrabold text-3xl md:text-4xl px-6 py-3 rounded-xl">
                -50%
              </span>
            </div>
          </div>
        </div>
      </div>
      {sale && <ProductSection section={sale} />}

      {/* Kids promo + section */}
      <PromoSectionBanner
        title={isEn ? "PACK THE WHOLE SUMMER\nINTO KIDS' WARDROBE" : "GÓI CẢ MÙA HÈ\nVÀO TỦ ĐỒ CỦA BÉ"}
        subtitle={isEn ? "Kids' world — mom's deal" : "Thế giới của con – ưu đãi cho mẹ"}
        href="/collection/kid-20"
        image="/images/promo-kids.jpg"
        bgColor="#E3F2FD"
        textColor="#1A2B49"
        accentColor="#1A1A1A"
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
