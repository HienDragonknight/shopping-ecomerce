"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import type { ApiBannerSlide } from "@/types";
import { useT } from "@/hooks/useT";

interface HeroBannerProps {
  slides: ApiBannerSlide[];
}

export function HeroBanner({ slides }: HeroBannerProps) {
  const t = useT();
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION = 5000;

  const goTo = useCallback(
    (idx: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(idx);
      setProgress(0);
      setTimeout(() => setIsTransitioning(false), 800);
    },
    [isTransitioning]
  );

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = useCallback(
    () => goTo((current + 1) % slides.length),
    [current, goTo, slides.length]
  );

  // Auto-advance and progress bar
  useEffect(() => {
    if (slides.length === 0) return;
    const startTime = Date.now();
    let animationFrame: number;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const newProgress = Math.min((elapsed / SLIDE_DURATION) * 100, 100);

      setProgress(newProgress);

      if (newProgress >= 100) {
        next();
      } else {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [current, next, slides.length]);

  if (slides.length === 0) {
    return (
      <div
        className="relative w-full bg-[#1A1A1A] flex items-center justify-center aspect-[4/3] md:aspect-[21/9] h-[320px] md:h-auto min-h-[320px] md:min-h-[400px] md:max-h-[600px]"
      >
        <p className="text-white/40 text-xl">{t.hero.loading}</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden bg-[#1A1A1A] group aspect-[4/3] md:aspect-[21/9] h-[320px] md:h-auto min-h-[320px] md:min-h-[400px] md:max-h-[600px]"
    >
      {/* Slides */}
      {slides.map((slide, i) => {
        const isActive = i === current;
        const badgeColor = slide.badgeColor ?? "#1A1A1A";
        const textColor = slide.textColor ?? "#ffffff";
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
            aria-hidden={!isActive}
          >
            {/* Background Image */}
            <div className={`w-full h-full transition-transform duration-[6000ms] ease-out ${isActive ? "scale-105" : "scale-100"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.imageUrl}
                alt={slide.titleText}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  t.src = `https://placehold.co/1920x800/222/555?text=VIECO+FASHION+${i + 1}`;
                }}
              />
            </div>

            {/* Gradient Overlay */}
            <div
              className="absolute inset-0"
              style={{ background: slide.overlayGradient ?? "linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
            />

            {/* Text Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="yody-container w-full">
                <div className="max-w-xl pl-4 md:pl-8">
                  {/* Badge */}
                  {slide.badge && (
                    <span
                      className={`inline-block text-[10px] md:text-xs font-black tracking-[0.2em] uppercase px-3 py-1 md:px-4 md:py-1.5 rounded-full mb-3 md:mb-6 transition-all duration-700 delay-100 transform ${isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
                      style={{
                        backgroundColor: badgeColor,
                        color: badgeColor === "#1A1A1A" || badgeColor === "#fff" ? "#1A1A1A" : "#fff",
                      }}
                    >
                      {slide.badge}
                    </span>
                  )}

                  {/* Title */}
                  <h1
                    className={`text-2xl sm:text-3xl md:text-6xl lg:text-7xl font-black leading-[1.15] md:leading-[1.1] mb-2 md:mb-4 whitespace-pre-line tracking-tight drop-shadow-lg transition-all duration-700 delay-200 transform ${isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                    style={{ color: textColor }}
                  >
                    {slide.titleText}
                  </h1>

                  {/* Subtitle */}
                  <p
                    className={`text-xs sm:text-sm md:text-xl mb-5 md:mb-8 leading-relaxed font-medium drop-shadow-md transition-all duration-700 delay-300 transform ${isActive ? "translate-y-0 opacity-90" : "translate-y-8 opacity-0"}`}
                    style={{ color: textColor }}
                  >
                    {slide.subtitle}
                  </p>

                  {/* CTA */}
                  <div className={`transition-all duration-700 delay-500 transform ${isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
                    <Link
                      href={slide.linkUrl ?? "/"}
                      className="group/btn inline-flex items-center gap-2 md:gap-3 px-5 py-2.5 md:px-8 md:py-3.5 text-xs sm:text-sm md:text-base font-bold rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(252,206,0,0.4)] hover:scale-105 active:scale-95 bg-[#1A1A1A] text-white"
                    >
                      {slide.ctaText ?? t.hero.defaultCta}
                      <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#1A1A1A] group-hover/btn:translate-x-1 transition-transform">
                        <ChevronRightIcon className="w-3 md:w-3.5 h-3 md:h-3.5" />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white transition-all hover:bg-white hover:text-black opacity-0 group-hover:opacity-100 z-20"
        aria-label={t.hero.prevSlide}
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>

      <button
        onClick={next}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white transition-all hover:bg-white hover:text-black opacity-0 group-hover:opacity-100 z-20"
        aria-label={t.hero.nextSlide}
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>

      {/* Progress Timeline Pagination */}
      <div className="absolute bottom-6 inset-x-0 z-20">
        <div className="yody-container flex justify-center md:justify-start md:pl-8">
          <div className="flex gap-3 bg-black/20 backdrop-blur-sm p-2 rounded-full border border-white/10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
                style={{ width: i === current ? "40px" : "16px", backgroundColor: "rgba(255,255,255,0.3)" }}
                aria-label={t.hero.goToSlide(i + 1)}
              >
                {i === current && (
                  <div
                    className="absolute top-0 left-0 bottom-0 bg-[#1A1A1A]"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
