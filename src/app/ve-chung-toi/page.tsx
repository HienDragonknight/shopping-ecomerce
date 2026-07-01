"use client";

import { useLocale } from "@/context/LocaleContext";
import Link from "next/link";

export default function AboutUsPage() {
  const { locale } = useLocale();
  const isEn = locale === "en";

  const values = [
    {
      title: isEn ? "Heritage Celebration" : "Tôn vinh di sản",
      desc: isEn
        ? "Preserving and promoting the identity of Vietnamese culture through modern design language."
        : "Gìn giữ và phát huy bản sắc văn hóa Việt qua ngôn ngữ thiết kế thời trang đương đại.",
      icon: (
        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: isEn ? "Pioneering Tech" : "Tiên phong công nghệ",
      desc: isEn
        ? "Integrating AR/AI to redefine how customers interact, try, and feel fashion online."
        : "Tích hợp công nghệ AR/AI để tái định nghĩa cách khách hàng tương tác, thử đồ và cảm nhận thời trang.",
      icon: (
        <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      title: isEn ? "Premium Quality" : "Chất lượng vượt trội",
      desc: isEn
        ? "Meticulous in every stitch, selecting eco-friendly, premium fabrics for durability and comfort."
        : "Tỉ mỉ trong từng đường kim mũi chỉ, lựa chọn chất liệu cao cấp, thân thiện với môi trường.",
      icon: (
        <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      title: isEn ? "Customer Centricity" : "Khách hàng là trọng tâm",
      desc: isEn
        ? "Personalizing every service aspect to guarantee absolute satisfaction and memorable experiences."
        : "Cá nhân hóa mọi phương diện dịch vụ nhằm đem lại sự hài lòng và trải nghiệm mua sắm đáng nhớ.",
      icon: (
        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 py-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="yody-container relative z-10 text-center space-y-6 max-w-4xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
            Vie'Co Brand
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            {isEn ? "CONNECTING HERITAGE & TECHNOLOGY" : "KẾT NỐI DI SẢN & CÔNG NGHỆ"}
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            {isEn
              ? "Vie'Co is a pioneering fashion brand that seamlessly integrates traditional Vietnamese values with state-of-the-art interactive digital technologies."
              : "Vie'Co là thương hiệu thời trang tiên phong kết hợp hài hòa giữa các giá trị di sản Việt Nam và nền tảng công nghệ số tương tác hiện đại."}
          </p>
        </div>
      </section>

      {/* ── Giới thiệu doanh nghiệp ── */}
      <section id="gioi-thieu" className="py-20 yody-container scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-amber-500">
              {isEn ? "About Vie'Co" : "Giới thiệu doanh nghiệp"}
            </h2>
            <div className="text-slate-600 text-base md:text-lg space-y-4 leading-relaxed font-medium">
              <p>
                {isEn
                  ? "Founded with the burning desire to preserve and glorify traditional Vietnamese fashion values, Vie'Co was born as a bridge between the glorious past and the digital future."
                  : "Khởi nguồn từ khát vọng gìn giữ và nâng tầm các giá trị thời trang truyền thống Việt Nam, Vie'Co ra đời như một chiếc cầu nối giữa quá khứ huy hoàng và tương lai công nghệ số."}
              </p>
              <p>
                {isEn
                  ? "Unlike conventional brands, Vie'Co creates a holistic shopping journey by integrating advanced AR Heritage Scan and AI Virtual Try-On technologies. This allows consumers to engage with high-fashion designs, appreciate delicate details, and witness fits in real-time."
                  : "Khác biệt với những thương hiệu truyền thống, Vie'Co kiến tạo một hành trình mua sắm toàn diện thông qua việc tích hợp các giải pháp AR Heritage Scan và AI Virtual Try-On. Khách hàng giờ đây có thể ngắm nhìn cận cảnh chi tiết hoa văn di sản, và mặc thử sản phẩm tức thì qua camera."}
              </p>
            </div>
            <div className="flex gap-4 pt-2">
              <Link
                href="/vieco-tech"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-bold text-white bg-slate-950 hover:bg-slate-900 transition-all shadow-md hover:-translate-y-0.5"
              >
                {isEn ? "Explore Vie'Co Tech ✦" : "Khám phá Vie'Co Tech ✦"}
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm hover:-translate-y-0.5"
              >
                {isEn ? "View Shop" : "Xem sản phẩm"}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-purple-600 rounded-3xl blur opacity-25" />
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1509319117193-57bab727e09d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Heritage illustration"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Tầm nhìn & Sứ mệnh ── */}
      <section id="tam-nhin" className="py-20 bg-slate-900 text-white scroll-mt-24">
        <div className="yody-container grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tầm nhìn (Vision) */}
          <div className="relative group bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 md:p-12 hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
            <div className="space-y-6 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-3xl font-black tracking-tight">{isEn ? "Vision" : "Tầm nhìn"}</h3>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed font-medium">
                {isEn
                  ? "To become the leading heritage fashion brand in Vietnam, pioneering digital innovations to preserve, refresh, and present traditional values to global audiences."
                  : "Trở thành thương hiệu thời trang di sản hàng đầu Việt Nam, đi đầu trong việc ứng dụng công nghệ số hóa để lưu giữ, làm mới và đưa các giá trị văn hóa truyền thống vươn tầm quốc tế."}
              </p>
            </div>
            <div id="su-menh" className="scroll-mt-24 pt-8" />
          </div>

          {/* Sứ mệnh (Mission) */}
          <div className="relative group bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 md:p-12 hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
            <div className="space-y-6 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-3xl font-black tracking-tight">{isEn ? "Mission" : "Sứ mệnh"}</h3>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed font-medium">
                {isEn
                  ? "Honoring historical beauty through modern design lenses, providing state-of-the-art immersive technologies to serve absolute personalization and customer convenience."
                  : "Tôn vinh nét đẹp lịch sử qua lăng kính thời trang đương đại, đem công nghệ trải nghiệm số đỉnh cao phục vụ nhu cầu cá nhân hóa tối đa và sự thuận tiện của khách hàng."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Giá trị cốt lõi ── */}
      <section id="gia-tri-cot-loi" className="py-20 yody-container scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight">
            {isEn ? "Core Values" : "Giá trị cốt lõi"}
          </h2>
          <p className="text-slate-500 text-sm md:text-base font-medium">
            {isEn
              ? "The key pillars shaping our design decisions, software tools, and customer dedication."
              : "Những cột trụ vững chắc định hình phong cách thiết kế, phát triển sản phẩm và dịch vụ của chúng tôi."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <div
              key={i}
              className="group relative bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {v.icon}
                </div>
                <h4 className="text-lg font-bold text-slate-950 group-hover:text-amber-500 transition-colors">
                  {v.title}
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
