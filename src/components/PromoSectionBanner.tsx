"use client";

import Link from "next/link";
import Image from "next/image";
import { useT } from "@/hooks/useT";

interface PromoBannerProps {
  title: string;
  subtitle: string;
  href: string;
  image: string;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
}

export function PromoSectionBanner({
  title,
  subtitle,
  href,
  image,
  bgColor = "#000",
  textColor = "#fff",
  accentColor = "#FCCE00",
}: PromoBannerProps) {
  const t = useT();
  return (
    <div className="py-8 bg-white">
      <div className="yody-container max-w-7xl">
        <Link
          href={href}
          className="group relative flex overflow-hidden rounded-3xl w-full aspect-[2/1] md:aspect-[3/1] shadow-lg"
          style={{ backgroundColor: bgColor }}
        >
          {/* Full Background Image */}
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out"
            sizes="(max-width: 1280px) 100vw, 1280px"
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              t.src = `https://placehold.co/1200x400/333/555?text=YODY+PROMO`;
            }}
          />

          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none transition-opacity duration-500 group-hover:from-black/90" />

          {/* Text Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 z-10 w-full md:w-2/3 lg:w-1/2">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-3 md:mb-4 whitespace-pre-line tracking-tight drop-shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500"
              style={{ color: textColor }}
            >
              {title}
            </h2>
            <p
              className="text-sm md:text-lg mb-6 md:mb-8 max-w-md drop-shadow-sm transform translate-y-2 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75"
              style={{ color: textColor }}
            >
              {subtitle}
            </p>
            
            <div className="flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-150">
              <span
                className="inline-flex items-center justify-center text-sm md:text-base font-bold px-6 py-3 rounded-full w-fit transition-all duration-300"
                style={{ 
                  backgroundColor: accentColor, 
                  color: accentColor === "#FCCE00" ? "#1A1A1A" : "#fff",
                }}
              >
                {t.hero.defaultCta}
              </span>
              <div 
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-2 shadow-md"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
