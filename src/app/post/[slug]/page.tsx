"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
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

/** /post/[slug] redirects to /blog/[slug] */
export default function PostRedirectPage({ params }: PageProps) {
  const { slug } = use(params);

  useEffect(() => {
    if (slug) {
      window.location.replace(`/blog/${slug}`);
    }
  }, [slug]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-sm text-slate-400 animate-pulse">Đang chuyển hướng...</p>
    </div>
  );
}
