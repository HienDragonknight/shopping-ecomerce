"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useT } from "@/hooks/useT";
import Link from "next/link";
import api from "@/lib/api";
import type { ApiBlogPost } from "@/types";

interface ExtendedBlogPost extends ApiBlogPost {
  category: string;
  categoryEn: string;
  readTime: string;
  readTimeEn: string;
  summary: string;
  summaryEn: string;
}

const LOCAL_BLOG_POSTS: ExtendedBlogPost[] = [
  {
    id: 1,
    title: "Ứng dụng AR Heritage Scan: Hồi sinh nét cổ phục Việt trong kỷ nguyên số",
    slug: "ar-heritage-scan-viet-co-phuc",
    date: "2026-06-25",
    image: "https://images.unsplash.com/photo-1621600411688-4be93cc685e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Công nghệ",
    categoryEn: "Technology",
    readTime: "5 phút đọc",
    readTimeEn: "5 min read",
    summary: "Công nghệ AR Heritage Scan giúp người trẻ ngắm nhìn và tương tác 3D chân thực với các cổ vật dệt may thời Nguyễn.",
    summaryEn: "AR Heritage Scan technology enables young generations to inspect and interact with Nguyen dynasty textiles in high fidelity."
  },
  {
    id: 2,
    title: "AI Virtual Try-On: Cách mạng hóa trải nghiệm thử đồ cá nhân hóa",
    slug: "ai-virtual-try-on-cach-mang-thoi-trang",
    date: "2026-06-20",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Công nghệ",
    categoryEn: "Technology",
    readTime: "4 phút đọc",
    readTimeEn: "4 min read",
    summary: "Thử đồ ảo bằng AI loại bỏ mọi nỗi lo về kích thước và phom dáng khi mua sắm trực tuyến tại nhà.",
    summaryEn: "AI virtual try-on removes sizing doubts when shopping for garments online from the comfort of your home."
  },
  {
    id: 3,
    title: "Chất liệu Tơ Tằm Tự Nhiên: Hành trình xanh của Vie'Co",
    slug: "chat-lieu-to-tam-hanh-trinh-xanh",
    date: "2026-06-15",
    image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Bền vững",
    categoryEn: "Sustainability",
    readTime: "6 phút đọc",
    readTimeEn: "6 min read",
    summary: "Khám phá cách thức dệt lụa tơ tằm truyền thống, giảm thiểu hóa chất và bảo vệ làng nghề Việt cổ.",
    summaryEn: "Discover the process of traditional silk weaving with reduced chemical use, protecting ancient Vietnamese craft villages."
  },
  {
    id: 4,
    title: "Phối đồ công sở mùa hè: Đơn giản nhưng đầy cuốn hút cùng BST EasyOffice",
    slug: "phoi-do-cong-so-mua-he-easyoffice",
    date: "2026-06-10",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Xu hướng",
    categoryEn: "Trends",
    readTime: "3 phút đọc",
    readTimeEn: "3 min read",
    summary: "Gợi ý những set đồ tối giản, thoáng khí giúp bạn tự tin sải bước nơi văn phòng giữa mùa hè ngột ngạt.",
    summaryEn: "Minimalist, breathable outfit combinations to keep you stylish and comfortable in the office during hot summer days."
  }
];

export default function BlogPage() {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const t = useT();

  const [posts, setPosts] = useState<ExtendedBlogPost[]>(LOCAL_BLOG_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Attempt to load posts from API backend, falling back to LOCAL_BLOG_POSTS
    setLoading(true);
    api.get("/homepage/blog-posts")
      .then(res => {
        if (res?.data?.data && res.data.data.length > 0) {
          const apiPosts = res.data.data.map((p: ApiBlogPost, idx: number) => ({
            ...p,
            category: idx % 2 === 0 ? "Xu hướng" : "Công nghệ",
            categoryEn: idx % 2 === 0 ? "Trends" : "Technology",
            readTime: "4 phút đọc",
            readTimeEn: "4 min read",
            summary: p.title,
            summaryEn: p.title
          }));
          setPosts(apiPosts);
        }
      })
      .catch(() => {
        // use local fallback
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = isEn
    ? ["All", "Technology", "Trends", "Sustainability"]
    : ["Tất cả", "Công nghệ", "Xu hướng", "Bền vững"];

  const filteredPosts = posts.filter(post => {
    if (selectedCategory === "All" || selectedCategory === "Tất cả") return true;
    return isEn
      ? post.categoryEn.toLowerCase() === selectedCategory.toLowerCase()
      : post.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white py-16 text-center space-y-4">
        <div className="yody-container max-w-3xl">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-widest">
            {isEn ? "Journal" : "Tập san Phong cách"}
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-3">
            {isEn ? "VIE'CO JOURNAL" : "VIE'CO BLOG & TIN TỨC"}
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed mt-2">
            {isEn
              ? "Your go-to hub for style inspiration, sustainable fashion stories, and next-gen retail technologies."
              : "Không gian chia sẻ cảm hứng ăn mặc, câu chuyện thời trang bền vững và những cải tiến công nghệ mới nhất."}
          </p>
        </div>
      </section>

      <div className="yody-container max-w-6xl mt-12 px-4">
        
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 border-b border-slate-200 scrollbar-none mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-slate-950 text-white shadow-md"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm font-semibold animate-pulse">
            {t.common.loading}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm font-semibold">
            {t.common.noResults}
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Featured Post Card */}
            {featuredPost && (
              <Link
                href={`/post/${featuredPost.slug}`}
                className="group grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white border border-slate-100 rounded-3xl p-6 lg:p-8 shadow-sm hover:shadow-xl transition-all duration-300 items-center"
              >
                <div className="aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.src = `https://placehold.co/800x500/F0F0F0/999?text=Featured+Blog`;
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                    {isEn ? featuredPost.categoryEn : featuredPost.category}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4 items-center text-xs text-slate-400 font-medium">
                    <span>{featuredPost.date}</span>
                    <span>•</span>
                    <span>{isEn ? featuredPost.readTimeEn : featuredPost.readTime}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight leading-snug group-hover:text-amber-500 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">
                    {isEn ? featuredPost.summaryEn : featuredPost.summary}
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-950 group-hover:underline">
                      {isEn ? "Read Article →" : "Đọc bài viết →"}
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid of other articles */}
            {gridPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
                {gridPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.slug}`}
                    className="group flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative border-b border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement;
                          t.src = `https://placehold.co/400x250/F0F0F0/999?text=Blog`;
                        }}
                      />
                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-bold text-white uppercase tracking-wider">
                        {isEn ? post.categoryEn : post.category}
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex gap-3 items-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          <span>{post.date}</span>
                          <span>•</span>
                          <span>{isEn ? post.readTimeEn : post.readTime}</span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-950 line-clamp-2 leading-snug group-hover:text-amber-500 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed font-medium">
                          {isEn ? post.summaryEn : post.summary}
                        </p>
                      </div>

                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-950 group-hover:underline">
                          {isEn ? "Read More →" : "Đọc tiếp →"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
