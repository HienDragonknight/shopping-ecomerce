"use client";

import { useLocale } from "@/context/LocaleContext";
import Link from "next/link";

const valuesVi = [
  {
    num: "01",
    title: "Bản sắc Việt",
    subtitle: "Vietnamese Identity",
    desc: "VIE'CO lấy bản sắc Việt làm gốc trong quá trình xây dựng thương hiệu. Các thiết kế được phát triển từ những chất liệu văn hóa như họa tiết, màu sắc, câu chuyện lịch sử, nghệ thuật dân gian và tinh thần dân tộc. Giá trị này giúp VIE'CO tạo nên dấu ấn riêng, có sự khác biệt với các thương hiệu thời trang thông thường trên thị trường.",
  },
  {
    num: "02",
    title: "Hiện đại & Sáng tạo",
    subtitle: "Modern & Creative",
    desc: "VIE'CO không tái hiện văn hóa theo lối cũ, mà biến đổi những yếu tố truyền thống thành những thiết kế phù hợp với gu thẩm mỹ và phong cách sống hiện đại. Thương hiệu đề cao tư duy sáng tạo trong form dáng, cách phối màu, và cách kể chuyện, nhằm tạo ra sản phẩm mới mẻ nhưng vẫn có chiều sâu.",
  },
  {
    num: "03",
    title: "Trải nghiệm",
    subtitle: "Experience",
    desc: "VIE'CO hướng đến việc mang lại cho khách hàng nhiều hơn một sản phẩm thời trang. Thông qua công nghệ AR, người dùng có thể tương tác, khám phá câu chuyện phía sau thiết kế và cảm nhận sản phẩm theo cách sinh động hơn. Giá trị này giúp quá trình mặc, xem và chia sẻ trang phục trở nên thú vị, đáng nhớ và khác biệt.",
  },
  {
    num: "04",
    title: "Chất lượng",
    subtitle: "Quality",
    desc: "VIE'CO chú trọng chất lượng trong từng chi tiết sản phẩm, bao gồm chất liệu, đường may, form dáng, độ bền và tính ứng dụng. Trang phục không chỉ cần đẹp về ý tưởng mà còn phải thoải mái, dễ mặc và phù hợp với đời sống hằng ngày. Chất lượng là nền tảng để thương hiệu tạo dựng niềm tin và giữ chân khách hàng lâu dài.",
  },
  {
    num: "05",
    title: "Kết nối",
    subtitle: "Connection",
    desc: "VIE'CO mong muốn tạo ra sự kết nối giữa thương hiệu và khách hàng thông qua thời trang, câu chuyện và cảm xúc. Mỗi sản phẩm là một điểm chạm giúp người mặc thể hiện cá tính, niềm tự hào văn hóa và sự gắn bó với giá trị Việt Nam. Đồng thời, VIE'CO cũng hướng đến việc kết nối văn hóa Việt với bạn bè quốc tế bằng một ngôn ngữ thời trang dễ tiếp cận hơn.",
  },
];

const valuesEn = [
  {
    num: "01",
    title: "Vietnamese Identity",
    subtitle: "Bản sắc Việt",
    desc: "VIE'CO roots its brand in Vietnamese identity. Designs draw from cultural materials — patterns, colors, historical narratives, folk art, and national spirit — creating a distinctive mark that sets us apart from conventional fashion brands.",
  },
  {
    num: "02",
    title: "Modern & Creative",
    subtitle: "Hiện đại & Sáng tạo",
    desc: "VIE'CO does not reproduce culture in old ways. We transform traditional elements into designs that match modern aesthetics and lifestyles, emphasizing creative thinking in silhouettes, color pairing, and storytelling to deliver products that feel fresh yet meaningful.",
  },
  {
    num: "03",
    title: "Experience",
    subtitle: "Trải nghiệm",
    desc: "VIE'CO aims to offer more than clothing. Through AR technology, customers can interact with products, explore the stories behind each design, and experience fashion in a more vivid way — making wearing, viewing, and sharing garments more engaging and memorable.",
  },
  {
    num: "04",
    title: "Quality",
    subtitle: "Chất lượng",
    desc: "VIE'CO prioritizes quality in every detail — materials, stitching, fit, durability, and practicality. Garments must not only look good in concept but also feel comfortable, easy to wear, and suited to everyday life. Quality is the foundation for lasting trust and loyalty.",
  },
  {
    num: "05",
    title: "Connection",
    subtitle: "Kết nối",
    desc: "VIE'CO seeks to connect brand and customer through fashion, stories, and emotion. Each product is a touchpoint for self-expression, cultural pride, and attachment to Vietnamese values — while bridging Vietnamese culture with international audiences through accessible fashion language.",
  },
];

export default function AboutUsPage() {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const values = isEn ? valuesEn : valuesVi;

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="yody-container relative z-10 py-28 md:py-36">
          <div className="max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-neutral-400 mb-6">
              Vie&apos;Co
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-8">
              {isEn ? "About Us" : "Về Chúng Tôi"}
            </h1>
            <p className="text-neutral-400 text-base md:text-xl font-light leading-relaxed max-w-2xl border-l-2 border-white/20 pl-6">
              {isEn
                ? "A fashion brand rooted in Vietnamese identity, reimagined through modern design and immersive technology."
                : "Thương hiệu thời trang lấy bản sắc Việt làm nền tảng, tái hiện qua thiết kế hiện đại và công nghệ trải nghiệm."}
            </p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </section>

      {/* Giới thiệu */}
      <section id="gioi-thieu" className="py-20 md:py-28 yody-container scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
              {isEn ? "Company Profile" : "Giới thiệu doanh nghiệp"}
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              {isEn ? "Where heritage meets the future" : "Nơi di sản gặp tương lai"}
            </h2>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/vieco-tech"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold bg-black text-white hover:bg-neutral-800 transition-colors"
              >
                {isEn ? "Vie'Co Tech →" : "Vie'Co Tech →"}
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold border border-neutral-900 text-neutral-900 hover:bg-neutral-50 transition-colors"
              >
                {isEn ? "Shop now" : "Xem sản phẩm"}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 text-neutral-600 text-base md:text-lg leading-relaxed">
            <p>
              {isEn
                ? "Founded with the desire to preserve and elevate traditional Vietnamese fashion values, Vie'Co bridges a glorious past with a digital future."
                : "Khởi nguồn từ khát vọng gìn giữ và nâng tầm các giá trị thời trang truyền thống Việt Nam, Vie'Co ra đời như một chiếc cầu nối giữa quá khứ huy hoàng và tương lai công nghệ số."}
            </p>
            <p>
              {isEn
                ? "Unlike conventional brands, Vie'Co creates a holistic shopping journey through AR Heritage Scan and AI Virtual Try-On — letting customers explore intricate details and try products instantly."
                : "Khác biệt với những thương hiệu truyền thống, Vie'Co kiến tạo hành trình mua sắm toàn diện thông qua AR Heritage Scan và AI Virtual Try-On — giúp khách hàng ngắm chi tiết hoa văn di sản và mặc thử sản phẩm tức thì."}
            </p>
            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 mt-4">
              <img
                src="https://images.unsplash.com/photo-1509319117193-57bab727e09d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt={isEn ? "Vie'Co fashion" : "Thời trang Vie'Co"}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tầm nhìn & Sứ mệnh */}
      <section id="tam-nhin" className="bg-black text-white scroll-mt-24">
        <div className="yody-container py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 border border-white/10">
            <div className="p-10 md:p-14 space-y-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
                {isEn ? "Vision" : "Tầm nhìn"}
              </span>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                {isEn ? "Leading heritage fashion" : "Thời trang di sản hàng đầu"}
              </h3>
              <p className="text-neutral-400 text-base md:text-lg leading-relaxed font-light">
                {isEn
                  ? "To become Vietnam's leading heritage fashion brand, pioneering digital innovation to preserve, refresh, and present traditional values to global audiences."
                  : "Trở thành thương hiệu thời trang di sản hàng đầu Việt Nam, đi đầu ứng dụng công nghệ số hóa để lưu giữ, làm mới và đưa giá trị văn hóa truyền thống vươn tầm quốc tế."}
              </p>
            </div>
            <div id="su-menh" className="scroll-mt-24 p-10 md:p-14 space-y-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
                {isEn ? "Mission" : "Sứ mệnh"}
              </span>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                {isEn ? "Honoring history, serving today" : "Tôn vinh lịch sử, phục vụ hiện tại"}
              </h3>
              <p className="text-neutral-400 text-base md:text-lg leading-relaxed font-light">
                {isEn
                  ? "Honoring historical beauty through modern design, delivering immersive digital experiences for maximum personalization and customer convenience."
                  : "Tôn vinh nét đẹp lịch sử qua lăng kính thời trang đương đại, đem công nghệ trải nghiệm số đỉnh cao phục vụ cá nhân hóa tối đa và sự thuận tiện của khách hàng."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Giá trị cốt lõi */}
      <section id="gia-tri-cot-loi" className="py-20 md:py-28 scroll-mt-24">
        <div className="yody-container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-20">
            <div className="space-y-4 max-w-xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
                {isEn ? "Core Values" : "Giá trị cốt lõi"}
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                {isEn ? "What defines Vie'Co" : "Điều định hình Vie'Co"}
              </h2>
            </div>
            <p className="text-neutral-500 text-sm md:text-base max-w-md leading-relaxed">
              {isEn
                ? "Five pillars that guide our design, technology, and relationship with every customer."
                : "Năm cột trụ định hướng thiết kế, công nghệ và mối quan hệ với từng khách hàng."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-200 border border-neutral-200">
            {values.map((v, i) => (
              <div
                key={v.num}
                className={`group bg-white p-8 md:p-10 hover:bg-neutral-950 hover:text-white transition-colors duration-500 ${
                  i === 4 ? "md:col-span-2 md:grid md:grid-cols-2 md:gap-10 md:items-center" : ""
                }`}
              >
                <div className={i === 4 ? "space-y-5" : "space-y-5 h-full flex flex-col"}>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-4xl md:text-5xl font-black text-neutral-100 group-hover:text-white/10 transition-colors tabular-nums">
                      {v.num}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400 group-hover:text-neutral-500 transition-colors pt-2">
                      {v.subtitle}
                    </span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold tracking-tight">{v.title}</h4>
                  <p className="text-neutral-500 group-hover:text-neutral-400 text-sm md:text-base leading-relaxed transition-colors">
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
