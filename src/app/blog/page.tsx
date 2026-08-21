"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useT } from "@/hooks/useT";
import Link from "next/link";
import api from "@/lib/api";
import {
  Calendar, Clock, Search, ChevronRight,
  BookOpen, Sparkles, ArrowRight, Tag
} from "lucide-react";

interface BlogPostItem {
  id: number;
  title: string;
  titleEn?: string | null;
  slug: string;
  excerpt?: string | null;
  excerptEn?: string | null;
  content?: string | null;
  contentEn?: string | null;
  imageUrl: string;
  date: string;
  isActive: boolean;
}

const FALLBACK_POSTS: BlogPostItem[] = [
  {
    id: 1,
    title: "Ứng dụng AR Heritage Scan: Hồi sinh nét cổ phục Việt trong kỷ nguyên số",
    titleEn: "Applying AR Heritage Scan: Reviving Vietnamese Ancient Costumes in the Digital Era",
    slug: "ar-heritage-scan-viet-co-phuc",
    date: "2026-06-25",
    imageUrl: "https://images.unsplash.com/photo-1621600411688-4be93cc685e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    excerpt: "Công nghệ AR Heritage Scan giúp người trẻ ngắm nhìn và tương tác 3D chân thực với các cổ vật dệt may thời Nguyễn.",
    excerptEn: "AR Heritage Scan technology enables young generations to inspect and interact with Nguyen dynasty textiles in high fidelity.",
    isActive: true,
  },
  {
    id: 2,
    title: "AI Virtual Try-On: Cách mạng hóa trải nghiệm thử đồ cá nhân hóa",
    titleEn: "AI Virtual Try-On: Revolutionizing Personalized Fitting Experiences",
    slug: "ai-virtual-try-on-cach-mang-thoi-trang",
    date: "2026-06-20",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    excerpt: "Thử đồ ảo bằng AI loại bỏ mọi nỗi lo về kích thước và phom dáng khi mua sắm trực tuyến tại nhà.",
    excerptEn: "AI virtual try-on removes sizing doubts when shopping for garments online from the comfort of your home.",
    isActive: true,
  },
  {
    id: 3,
    title: "Chất liệu Tơ Tằm Tự Nhiên: Hành trình xanh của Vie'Co",
    titleEn: "Natural Silk Fabric: Vie'Co's Sustainable Journey",
    slug: "chat-lieu-to-tam-hanh-trinh-xanh",
    date: "2026-06-15",
    imageUrl: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    excerpt: "Khám phá cách thức dệt lụa tơ tằm truyền thống, giảm thiểu hóa chất và bảo vệ làng nghề Việt cổ.",
    excerptEn: "Discover the process of traditional silk weaving with reduced chemical use, protecting ancient Vietnamese craft villages.",
    isActive: true,
  },
  {
    id: 4,
    title: "Phối đồ công sở mùa hè: Đơn giản nhưng đầy cuốn hút cùng BST EasyOffice",
    titleEn: "Summer Office Styling: Simple Yet Captivating with EasyOffice Collection",
    slug: "phoi-do-cong-so-mua-he-easyoffice",
    date: "2026-06-10",
    imageUrl: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    excerpt: "Gợi ý những set đồ tối giản, thoáng khí giúp bạn tự tin sải bước nơi văn phòng giữa mùa hè.",
    excerptEn: "Minimalist, breathable outfit combinations to keep you stylish and comfortable in the office during hot summer days.",
    isActive: true,
  },
];

export default function BlogPage() {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const t = useT();

  const [posts, setPosts] = useState<BlogPostItem[]>(FALLBACK_POSTS);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchBlogPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/blog", {
        params: {
          page,
          size: 9,
          search: search.trim() || undefined,
        },
      });
      const data = res?.data?.data;
      if (data && data.content && data.content.length > 0) {
        setPosts(data.content);
        setTotalPages(data.totalPages);
      } else if (!search.trim() && page === 0) {
        // Fallback to initial seed if backend is empty
        setPosts(FALLBACK_POSTS);
        setTotalPages(1);
      } else {
        setPosts([]);
        setTotalPages(0);
      }
    } catch {
      // Fallback
      if (!search.trim()) setPosts(FALLBACK_POSTS);
    } finally {
      setLoading(false);
    }
  }, [page, search, locale]);

  useEffect(() => {
    fetchBlogPosts();
  }, [fetchBlogPosts]);

  const featuredPost = posts[0];
  const gridPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-[#FCFBFA] text-slate-900 pb-28">
      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#5c0000] via-[#530000] to-[#480000] text-white py-20 md:py-28 text-center">
        <div className="yody-container relative z-10 max-w-4xl mx-auto space-y-4 px-4">
          <span className="inline-block px-3.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-red-200 border border-white/20 uppercase tracking-widest">
            {isEn ? "Vie'Co Journal" : "Tạp chí & Tin tức"}
          </span>
          <h1 className="text-3xl md:text-6xl font-black tracking-tight text-white leading-tight">
            {isEn ? "Stories of Heritage & Innovation" : "Câu Chuyện Di Sản & Đổi Mới"}
          </h1>
          <p className="text-white/85 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed font-light pt-1">
            {isEn
              ? "Explore modern Vietnamese fashion, traditional weaving craftsmanship, and next-gen retail technologies like AR and AI."
              : "Khám phá phong cách thời trang đương đại, câu chuyện gìn giữ di sản dệt may truyền thống và các công nghệ AR/AI tương tác."}
          </p>

          {/* Search bar inside hero */}
          <div className="max-w-xl mx-auto pt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type="text"
                placeholder={isEn ? "Search articles by title or keyword..." : "Tìm kiếm bài viết theo chủ đề, từ khóa..."}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="w-full h-12 pl-11 pr-4 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl text-sm text-white placeholder:text-white/60 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-400 transition-all shadow-lg"
              />
            </div>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </section>

      {/* ── MAIN CONTENT FEED ── */}
      <div className="yody-container max-w-6xl px-4 mt-12 space-y-14">
        {loading ? (
          <div className="space-y-10 animate-pulse">
            <div className="aspect-[21/9] bg-slate-200/60 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-slate-200/60 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 p-8 shadow-xs max-w-md mx-auto space-y-3">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-bold text-slate-800 text-base">
              {isEn ? "No articles found" : "Không tìm thấy bài viết"}
            </h3>
            <p className="text-xs text-slate-400">
              {isEn
                ? "Try searching with different keywords."
                : "Vui lòng thử tìm kiếm với từ khóa khác."}
            </p>
          </div>
        ) : (
          <>
            {/* ── FEATURED ARTICLE ── */}
            {featuredPost && (
              <section className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                  <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto min-h-[320px] bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featuredPost.imageUrl}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-4 left-4 bg-[#530000] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {isEn ? "Featured Article" : "Bài viết nổi bật"}
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} /> {featuredPost.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} /> 4 {isEn ? "min read" : "phút đọc"}
                        </span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight group-hover:text-[#530000] transition-colors">
                        <Link href={`/blog/${featuredPost.slug}`}>
                          {isEn && featuredPost.titleEn ? featuredPost.titleEn : featuredPost.title}
                        </Link>
                      </h2>

                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 font-light">
                        {isEn && featuredPost.excerptEn ? featuredPost.excerptEn : featuredPost.excerpt}
                      </p>
                    </div>

                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#530000] hover:translate-x-1 transition-transform w-fit"
                    >
                      <span>{isEn ? "Read full story" : "Đọc toàn bộ bài viết"}</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* ── GRID OF REMAINING ARTICLES ── */}
            {gridPosts.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {isEn ? "Latest Articles" : "Tất cả bài viết"}
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold">
                    {posts.length} {isEn ? "stories" : "bài viết"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {gridPosts.map((p) => (
                    <article
                      key={p.id}
                      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                    >
                      <Link href={`/blog/${p.slug}`} className="block relative aspect-[16/10] bg-slate-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
                            <Calendar size={12} />
                            <span>{p.date}</span>
                          </div>

                          <h4 className="text-base font-bold text-slate-900 leading-snug group-hover:text-[#530000] transition-colors line-clamp-2">
                            <Link href={`/blog/${p.slug}`}>
                              {isEn && p.titleEn ? p.titleEn : p.title}
                            </Link>
                          </h4>

                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-light">
                            {isEn && p.excerptEn ? p.excerptEn : p.excerpt}
                          </p>
                        </div>

                        <Link
                          href={`/blog/${p.slug}`}
                          className="text-xs font-bold text-[#530000] flex items-center gap-1 pt-2 w-fit hover:underline"
                        >
                          <span>{isEn ? "Read more" : "Xem chi tiết"}</span>
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* ── PAGINATION ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-10 border-t border-slate-200">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 bg-white border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all"
                >
                  {isEn ? "Previous" : "Trước"}
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      page === i
                        ? "bg-[#530000] text-white shadow-md shadow-[#530000]/20"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={page === totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 bg-white border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all"
                >
                  {isEn ? "Next" : "Sau"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
