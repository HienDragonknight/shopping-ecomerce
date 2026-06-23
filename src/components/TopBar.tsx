"use client";

import { useState } from "react";
import Link from "next/link";
import { CloseIcon } from "@/components/icons";
import { useT } from "@/hooks/useT";

export function TopBar() {
  const [visible, setVisible] = useState(true);
  const t = useT();

  const messages = [
    t.topBar.promo1,
    t.topBar.promo2,
    t.topBar.promo3,
    t.topBar.promo4,
  ];

  if (!visible) return null;

  return (
    <div className="relative bg-[#1A1A1A] text-white overflow-hidden" style={{ height: "36px" }}>
      {/* Marquee container */}
      <div className="flex items-center h-full">
        <div
          className="flex gap-16 whitespace-nowrap animate-marquee text-xs font-semibold tracking-wide"
          style={{ animationDuration: "30s" }}
        >
          {/* Duplicate messages for seamless loop */}
          {[...messages, ...messages].map((msg, i) => (
            <span key={i} className="inline-flex items-center gap-6">
              {msg}
              <span className="text-[#FCCE00]">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Right side: action links + close */}
      <div className="absolute right-0 top-0 h-full flex items-center gap-3 px-3 bg-gradient-to-l from-[#1A1A1A] via-[#1A1A1A] to-transparent pl-8">
        <Link
          href="/sale"
          className="text-[11px] font-bold text-[#FCCE00] hover:text-white transition-colors whitespace-nowrap underline-offset-2 hover:underline"
        >
          {t.topBar.viewDeals}
        </Link>
        <button
          onClick={() => setVisible(false)}
          className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-white/20 transition-colors flex-shrink-0 focus-visible:outline-2 focus-visible:outline-white"
          aria-label={t.topBar.close}
        >
          <CloseIcon className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
