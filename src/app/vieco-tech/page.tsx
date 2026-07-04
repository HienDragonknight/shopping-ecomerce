"use client";

import { useLocale } from "@/context/LocaleContext";
import Link from "next/link";

export default function ViecoTechPage() {
  const { locale } = useLocale();
  const isEn = locale === "en";

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header section */}
      <section className="py-24 text-center max-w-4xl mx-auto px-4 relative z-10 space-y-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          ✦ Innovation Hub
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          VIE&apos;CO TECHNOLOGY
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          {isEn
            ? "Pioneering the intersection of fashion, digital art, and interactivity. Discover our next-gen AR Heritage Scan and AI Virtual Try-On."
            : "Tiên phong mở lối tại giao lộ của thời trang, nghệ thuật số và công nghệ tương tác. Khám phá giải pháp AR Heritage Scan và AI Virtual Try-On thế hệ mới."}
        </p>
      </section>

      {/* Two Technology Cards */}
      <section className="py-12 max-w-6xl mx-auto px-4 relative z-10 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: AR Heritage Scan */}
          <div className="group relative bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 hover:border-amber-500/40 transition-all duration-500 flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/25 transition-all" />
            
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-amber-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-extrabold text-white group-hover:text-amber-400 transition-colors">
                  AR Heritage Scan
                </h3>
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-amber-500/80">
                  {isEn ? "3D INTERACTION & AR CAMERA" : "TƯƠNG TÁC 3D & CAMERA THỰC TẾ ẢO"}
                </span>
              </div>

              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                {isEn
                  ? "Scan, rotate, zoom, and inspect traditional Vietnamese garments in high-fidelity 3D and augmented reality. Learn the history and craftsmanship behind every motif in real-time."
                  : "Số hóa và trải nghiệm trang phục truyền thống Việt Nam dưới góc nhìn 3D và thực tế tăng cường (AR). Tự do xoay góc, phóng to để chiêm ngưỡng từng chi tiết hoa văn sắc sảo."}
              </p>
            </div>

            <div className="pt-8">
              <a
                href="https://vieco-dragon-ar.pages.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full py-4 rounded-2xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-lg active:scale-[0.98]"
              >
                {isEn ? "Launch AR Scan ✦" : "Trải nghiệm AR Scan ✦"}
              </a>
            </div>
          </div>

          {/* Card 2: AI Virtual Try-On */}
          <div className="group relative bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 hover:border-pink-500/40 transition-all duration-500 flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-pink-500/25 transition-all" />
            
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-extrabold text-white group-hover:text-pink-400 transition-colors">
                  AI Virtual Try-On
                </h3>
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-pink-500/80">
                  {isEn ? "AI PHOTO RENDERING & FIT SIMULATOR" : "AI MÔ PHỎNG & MẶC THỬ TRỰC QUAN"}
                </span>
              </div>

              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                {isEn
                  ? "Upload your portrait, select any dress or polo, and visualize how it fits your body within seconds. Powered by diffusion models mapping garments seamlessly onto your photo."
                  : "Tải ảnh chụp của bạn lên, lựa chọn mẫu áo quần tùy ý và xem ngay hình ảnh bản thân mặc thử trang phục chân thực chỉ trong vài giây, được tối ưu hóa bởi mô hình học sâu (AI)."}
              </p>
            </div>

            <div className="pt-8">
              <Link
                href="/try-on"
                className="inline-flex items-center justify-center w-full py-4 rounded-2xl font-bold bg-pink-500 text-white hover:bg-pink-400 transition-all shadow-lg active:scale-[0.98]"
              >
                {isEn ? "Launch AI Try-On ✦" : "Trải nghiệm AI Try-On ✦"}
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
