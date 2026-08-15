"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useLocale } from "@/context/LocaleContext";
import { useT } from "@/hooks/useT";
import {
  Calendar, Clock, Share2, ArrowLeft,
  Copy, Check, BookOpen, ChevronRight
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface BlogPostDetail {
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
  sortOrder: number;
}

export default function BlogDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const { locale } = useLocale();
  const isEn = locale === "en";
  const t = useT();
  const router = useRouter();

  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [recentPosts, setRecentPosts] = useState<BlogPostDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Fetch article detail and recent articles
    Promise.all([
      api.get(`/blog/${slug}`).catch(() => null),
      api.get("/blog/recent").catch(() => null),
    ])
      .then(([detailRes, recentRes]) => {
        if (detailRes?.data?.data) {
          setPost(detailRes.data.data);
        }
        if (recentRes?.data?.data) {
          setRecentPosts(recentRes.data.data.filter((p: any) => p.slug !== slug));
        }
      })
      .finally(() => setLoading(false));
  }, [slug, locale]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareFacebook = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-24">
        <div className="yody-container max-w-4xl space-y-6 animate-pulse">
          <div className="h-4 bg-slate-100 rounded w-1/4" />
          <div className="h-10 bg-slate-100 rounded w-3/4" />
          <div className="aspect-[16/9] bg-slate-100 rounded-3xl" />
          <div className="space-y-3 pt-6">
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-5/6" />
            <div className="h-4 bg-slate-100 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white py-24 text-center">
        <div className="yody-container max-w-md space-y-4">
          <span className="text-4xl">📖</span>
          <h2 className="text-xl font-bold text-slate-900">
            {isEn ? "Article not found" : "Không tìm thấy bài viết"}
          </h2>
          <p className="text-xs text-slate-500">
            {isEn
              ? "The article you are looking for may have been moved or removed."
              : "Bài viết bạn đang tìm kiếm có thể đã được cập nhật hoặc không còn tồn tại."}
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#530000] text-white text-xs font-bold rounded-full transition-all hover:bg-[#3d0000]"
          >
            <ArrowLeft size={14} />
            <span>{isEn ? "Back to Blog" : "Quay lại danh sách bài viết"}</span>
          </Link>
        </div>
      </div>
    );
  }

  const title = isEn && post.titleEn ? post.titleEn : post.title;
  const content = isEn && post.contentEn ? post.contentEn : post.content;
  const excerpt = isEn && post.excerptEn ? post.excerptEn : post.excerpt;

  return (
    <article className="min-h-screen bg-white text-slate-900 pb-28">
      {/* ── BREADCRUMB ── */}
      <div className="border-b border-slate-100 py-4 bg-slate-50/50">
        <div className="yody-container max-w-4xl">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Link href="/" className="hover:text-black transition-colors">
              {t.breadcrumb.home}
            </Link>
            <ChevronRight size={12} />
            <Link href="/blog" className="hover:text-black transition-colors">
              Blog
            </Link>
            <ChevronRight size={12} />
            <span className="text-slate-900 font-semibold line-clamp-1 max-w-xs sm:max-w-md">
              {title}
            </span>
          </nav>
        </div>
      </div>

      {/* ── ARTICLE HEADER ── */}
      <header className="yody-container max-w-4xl pt-12 pb-8 space-y-6">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
          <span className="px-3 py-1 rounded-full bg-red-50 text-[#530000] font-bold uppercase tracking-wider text-[10px]">
            Vie&apos;Co Editorial
          </span>
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-slate-400" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-slate-400" />
            <span>4 {isEn ? "min read" : "phút đọc"}</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.15] text-slate-900">
          {title}
        </h1>

        {excerpt && (
          <p className="text-base md:text-xl text-slate-600 font-light leading-relaxed border-l-2 border-[#530000] pl-5 italic">
            {excerpt}
          </p>
        )}

        {/* Share actions bar */}
        <div className="flex items-center justify-between py-4 border-y border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {isEn ? "Share this story" : "Chia sẻ bài viết"}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareFacebook}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-[#1877F2] hover:text-white flex items-center justify-center text-slate-600 transition-colors"
              title="Share on Facebook"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 text-xs font-bold text-slate-700 transition-colors"
              title="Copy Link"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? (isEn ? "Copied!" : "Đã copy") : (isEn ? "Copy Link" : "Sao chép link")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── FEATURED IMAGE ── */}
      <div className="yody-container max-w-4xl mb-12">
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/800x450/F0F0F0/999?text=VieCo+Journal";
            }}
          />
        </div>
      </div>

      {/* ── ARTICLE BODY CONTENT ── */}
      <div className="yody-container max-w-3xl">
        <div className="prose prose-slate lg:prose-lg max-w-none space-y-6 text-slate-700 leading-relaxed font-sans text-base md:text-lg">
          {content?.split("\n\n").map((para, idx) => (
            <p key={idx} className="leading-relaxed">
              {para}
            </p>
          ))}
        </div>

        {/* ── AUTHOR BOX ── */}
        <div className="mt-16 p-8 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-[#530000] text-white font-black flex items-center justify-center text-xl shrink-0 shadow-md">
            V
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-base">Vie&apos;Co Editorial Team</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isEn
                ? "Dedicated to sharing insights into heritage Vietnamese fashion, cutting-edge AR/AI technology, and sustainable lifestyle."
                : "Đội ngũ biên tập Vie'Co — mang đến những câu chuyện về cổ phục di sản, công nghệ AR/AI đột phá và lối sống thời trang bền vững."}
            </p>
          </div>
        </div>
      </div>

      {/* ── RECENT / RELATED POSTS ── */}
      {recentPosts.length > 0 && (
        <section className="mt-20 pt-16 border-t border-slate-100 bg-slate-50/50">
          <div className="yody-container max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {isEn ? "Recent Stories" : "Bài viết mới nhất"}
              </h3>
              <Link
                href="/blog"
                className="text-xs font-bold text-[#530000] hover:underline flex items-center gap-1"
              >
                <span>{isEn ? "View all articles" : "Xem tất cả bài viết"}</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentPosts.slice(0, 3).map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.imageUrl}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {r.date}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#530000] transition-colors line-clamp-2 leading-snug">
                        {isEn && r.titleEn ? r.titleEn : r.title}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-[#530000] flex items-center gap-1 pt-1">
                      {isEn ? "Read article →" : "Đọc bài viết →"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
