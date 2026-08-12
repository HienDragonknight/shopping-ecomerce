"use client";

import { useLocale } from "@/context/LocaleContext";
import Link from "next/link";

export default function ViecoTechPage() {
  const { locale } = useLocale();
  const isEn = locale === "en";

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="yody-container relative z-10 py-24 md:py-32 text-center max-w-4xl mx-auto space-y-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-neutral-400">
            {isEn ? "Innovation Hub" : "Trung tâm đổi mới"}
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Vie&apos;Co Tech
          </h1>
          <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
            {isEn
              ? "Pioneering the intersection of fashion, digital art, and interactivity. Discover AR Heritage Scan and AI Virtual Try-On."
              : "Tiên phong tại giao lộ thời trang, nghệ thuật số và công nghệ tương tác. Khám phá AR Heritage Scan và AI Virtual Try-On."}
          </p>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </section>

      {/* Technology Cards */}
      <section className="py-16 md:py-24 yody-container pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-200 border border-neutral-200">

          {/* AR Heritage Scan */}
          <div className="group bg-white p-8 md:p-12 flex flex-col justify-between hover:bg-neutral-950 hover:text-white transition-colors duration-500">
            <div className="space-y-6">
              <div className="w-12 h-12 border border-neutral-200 group-hover:border-white/20 flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-neutral-900 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                  AR Heritage Scan
                </h3>
                <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400 group-hover:text-neutral-500 transition-colors">
                  {isEn ? "Pattern scan & cultural storytelling" : "Quét họa tiết & kể chuyện văn hóa"}
                </span>
              </div>

              <p className="text-neutral-500 group-hover:text-neutral-400 text-sm md:text-base leading-relaxed transition-colors">
                {isEn
                  ? "Point your camera at traditional Vietnamese patterns on garments and instantly uncover the cultural and historical stories behind each motif — from folk art origins to the meaning woven into every detail."
                  : "Hướng camera vào họa tiết trên trang phục truyền thống Việt Nam để khám phá ngay câu chuyện văn hóa và lịch sử đằng sau từng hoa văn — từ nguồn gốc nghệ thuật dân gian đến ý nghĩa được thêu dệt trong từng chi tiết."}
              </p>
            </div>

            <div className="pt-10">
              <a
                href="https://ar-ashen-nine.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full py-4 text-sm font-semibold bg-black text-white group-hover:bg-white group-hover:text-black transition-colors"
              >
                {isEn ? "Launch AR Scan →" : "Trải nghiệm AR Scan →"}
              </a>
            </div>
          </div>

          {/* AI Virtual Try-On */}
          <div className="group bg-white p-8 md:p-12 flex flex-col justify-between hover:bg-neutral-950 hover:text-white transition-colors duration-500">
            <div className="space-y-6">
              <div className="w-12 h-12 border border-neutral-200 group-hover:border-white/20 flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-neutral-900 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                  AI Virtual Try-On
                </h3>
                <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400 group-hover:text-neutral-500 transition-colors">
                  {isEn ? "AI photo rendering & fit simulator" : "AI mô phỏng & mặc thử trực quan"}
                </span>
              </div>

              <p className="text-neutral-500 group-hover:text-neutral-400 text-sm md:text-base leading-relaxed transition-colors">
                {isEn
                  ? "Upload your portrait, select any garment, and visualize how it fits your body within seconds — powered by deep learning models that map clothing seamlessly onto your photo."
                  : "Tải ảnh chụp của bạn lên, lựa chọn mẫu áo quần tùy ý và xem ngay hình ảnh bản thân mặc thử trang phục chân thực chỉ trong vài giây, được tối ưu hóa bởi mô hình học sâu (AI)."}
              </p>
            </div>

            <div className="pt-10">
              <Link
                href="/try-on"
                className="inline-flex items-center justify-center w-full py-4 text-sm font-semibold border border-neutral-900 text-neutral-900 group-hover:border-white group-hover:bg-white group-hover:text-black transition-colors"
              >
                {isEn ? "Launch AI Try-On →" : "Trải nghiệm AI Try-On →"}
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
