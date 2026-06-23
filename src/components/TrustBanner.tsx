"use client";

import Link from "next/link";
import { useT } from "@/hooks/useT";

export function TrustBanner() {
  const t = useT();
  const items = [
    { icon: "🔄", text: t.trust.freeReturn, link: "/page/chinh-sach-bao-hanh-doi-tra", linkText: t.trust.freeReturnLink },
    { icon: "🚚", text: t.trust.freeShip, link: "/page/chinh-sach-giao-nhan-hang-online", linkText: t.trust.freeShipLink },
    { icon: "✅", text: t.trust.authentic, link: "/page/gioi-thieu", linkText: null },
    { icon: "📞", text: t.trust.hotline, link: "tel:18002086", linkText: null },
  ];

  return (
    <div className="bg-[#FFF9E6] border-b border-[#F0E8C8]">
      <div className="yody-container">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-[#4A3F2F]">
              <span className="text-sm">{item.icon}</span>
              <span className="font-medium">{item.text}</span>
              {item.link && item.linkText && (
                <Link
                  href={item.link}
                  className="font-bold text-[#1A1A1A] underline underline-offset-2 hover:text-[#FCCE00] transition-colors ml-0.5"
                >
                  {item.linkText} ↗
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
