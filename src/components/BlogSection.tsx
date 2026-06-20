"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRightIcon } from "@/components/icons";
import type { ApiBlogPost } from "@/types";

interface BlogSectionProps {
  posts: ApiBlogPost[];
}

export function BlogSection({ posts }: BlogSectionProps) {
  if (posts.length === 0) return null;

  return (
    <section className="py-8 bg-[#F5F5F5]">
      <div className="yody-container">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-black text-[#1A1A1A] tracking-tight uppercase">
            TIN TỨC &amp; PHONG CÁCH
          </h2>
          <Link
            href="/blog"
            className="flex items-center gap-1 text-sm font-semibold text-[#1A1A1A] hover:text-[#FCCE00] transition-colors"
          >
            Xem thêm
            <ChevronRightIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.slug}`}
              className="group bg-white rounded-lg overflow-hidden border border-[#E5E5E5] hover:shadow-md transition-all duration-200"
            >
              <div className="relative aspect-[4/3] bg-[#F0F0F0] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, 20vw"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement;
                    t.src = `https://placehold.co/400x300/F0F0F0/999?text=Blog`;
                  }}
                />
              </div>
              <div className="p-3">
                <p className="text-[10px] text-[#999] mb-1">Ngày đăng: {post.date}</p>
                <h3 className="text-xs text-[#1A1A1A] font-medium line-clamp-2 leading-snug group-hover:text-[#333]">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
