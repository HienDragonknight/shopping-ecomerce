import { cookies } from "next/headers";
import { HeroBanner } from "@/components/HeroBanner";
import { TrustBanner } from "@/components/TrustBanner";
import { ProductSection } from "@/components/ProductSection";
import { BlogSection } from "@/components/BlogSection";
import {
  getHomepageBanners,
  getHomepageSections,
  getHomepageBlogPosts,
} from "@/lib/homepage-api";
import type { ProductSectionData } from "@/types";

export default async function Home() {
  // Read locale from NEXT_LOCALE cookie set by LocaleContext client component
  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value === "en" ? "en" : "vi";

  // Fetch all homepage data in parallel, forwarding locale to backend
  const [banners, sections, blogPosts] = await Promise.all([
    getHomepageBanners(lang),
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

  return (
    <>
      <HeroBanner slides={banners} />
      <TrustBanner />

      {/* Dynamic Product Sections from Database */}
      {productSections.length > 0 ? (
        productSections.map((section) => (
          <ProductSection key={section.id} section={section} />
        ))
      ) : (
        <div className="py-20 text-center bg-white">
          <p className="text-slate-400 text-sm">Chưa có sản phẩm nào được hiển thị trên trang chủ.</p>
        </div>
      )}

      {/* Blog */}
      {blogPosts && blogPosts.length > 0 && <BlogSection posts={blogPosts} />}
    </>
  );
}
