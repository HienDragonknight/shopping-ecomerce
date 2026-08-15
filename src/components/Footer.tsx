"use client";

import Link from "next/link";
import { PhoneIcon, MailIcon, MapPinIcon } from "@/components/icons";
import { useT } from "@/hooks/useT";

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
    </svg>
  );
}

function TiktokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.07-2.88-.54-4.05-1.4-1.17-.86-1.95-2.15-2.22-3.55v7.26c.15 1.74-.29 3.55-1.32 4.96-1.03 1.41-2.67 2.37-4.41 2.58-1.74.21-3.61-.17-5.02-1.2-1.41-1.03-2.37-2.67-2.58-4.41-.21-1.74.17-3.61 1.2-5.02 1.03-1.41 2.67-2.37 4.41-2.58 1.48-.18 3.02.09 4.31.86v-4.3c-1.12-.41-2.3-.53-3.48-.36-1.18.17-2.3.69-3.21 1.47-.91.78-1.57 1.83-1.89 2.99-.32 1.16-.3 2.39.06 3.53.36 1.14 1.05 2.14 1.97 2.87.92.73 2.05 1.16 3.22 1.25 1.17.09 2.36-.15 3.42-.69 1.06-.54 1.93-1.39 2.47-2.43.54-1.04.75-2.24.62-3.42V.02z"/>
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

const socialLinks = [
  { 
    name: "Facebook", 
    href: "https://www.facebook.com/profile.php?id=61590500870261", 
    icon: FacebookIcon,
    hoverClass: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]"
  },
  { 
    name: "TikTok", 
    href: "https://www.tiktok.com/@vieco.vn?_r=1&_d=secCgYIASAHKAESPgo8T38b481M9KvQ8wQ1fY%2F2kcgKU0puYZgk9wV6XnPxkRPJUOXwlyULs8UNr2%2FGoPw0h3Vc0EU5SklBV7zgGgA%3D&_svg=1&checksum=68d2bfc9ee6d83d31901c90c69376473af715f9927c8237f34ce572483c56e3a&item_author_type=1&reflow_sign_scene=7&rgssign=8.1.zh0i2Ij60cD-DvQe4nSBQQ&sec_uid=MS4wLjABAAAAoVzJCKPOubfIBKXtFKWxNu_QDXXUZnB0Ik5LbWig2wFYwwcZhy4Sr-9fWFixVNiR&sec_user_id=MS4wLjABAAAAoVzJCKPOubfIBKXtFKWxNu_QDXXUZnB0Ik5LbWig2wFYwwcZhy4Sr-9fWFixVNiR&share_app_id=1180&share_author_id=7652398436171858964&share_link_id=CF2001CF-7D7F-469E-8DF4-30B3767E88A4&share_region=VN&share_scene=1&sharer_language=vi&social_share_type=4&source=h5_t&timestamp=1786610638&tt_from=copy&u_code=f4495i4iibljaa&ug_btm=b8727%2Cb0&user_id=7652398436171858964&utm_campaign=client_share&utm_medium=ios&utm_source=copy", 
    icon: TiktokIcon,
    hoverClass: "hover:bg-black hover:text-white hover:border-slate-800"
  },
  { 
    name: "Instagram", 
    href: "https://www.instagram.com/vieco.vn", 
    icon: InstagramIcon,
    hoverClass: "hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white hover:border-transparent"
  },
];

export function Footer() {
  const t = useT();

  const shopLinks = [
    { name: t.shopLinks.basicProducts, href: "/products" },
    { name: t.shopLinks.collections, href: "/collections" },
  ];

  const serviceLinks = [
    { name: t.serviceLinks.loyalty, href: "/page/chinh-sach-khach-hang-than-thiet" },
    { name: t.serviceLinks.returnPolicy, href: "/page/chinh-sach-bao-hanh-doi-tra" },
    { name: t.serviceLinks.privacy, href: "/page/chinh-sach-bao-mat" },
    { name: t.serviceLinks.payment, href: "/page/chinh-sach-giao-nhan-hang-online" },
    { name: t.serviceLinks.uniform, href: "/" },
    { name: t.serviceLinks.sizeGuide, href: "/page/bang-size-chuan" },
  ];

  const aboutLinks = [
    { name: t.aboutLinks.intro, href: "/page/gioi-thieu" },
    { name: t.aboutLinks.careers, href: "/" },
    { name: t.aboutLinks.stores, href: "/he-thong-cua-hang" },
  ];

  return (
    <footer className="bg-[#1A1A1A] text-white">
      {/* Main footer */}
      <div className="yody-container py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact */}
          <div>
            <Link href="/" className="inline-flex items-center mb-4">
              <img
                src="https://res.cloudinary.com/dev4uz63q/image/upload/f_auto,q_auto/Asset_4_xd8oe6"
                alt="Logo"
                className="h-10 md:h-12 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-white mb-1 font-bold">{t.footer.greeting}</p>
            <p className="text-xs text-[#aaa] mb-4 leading-relaxed">{t.footer.greetingDesc}</p>

            {/* Social links */}
            <div className="flex gap-3 mb-6">
              {socialLinks.map((s) => {
                const IconComponent = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className={`w-10 h-10 rounded-full bg-[#242424] border border-[#3A3A3A] text-slate-100 flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 ${s.hoverClass}`}
                  >
                    <IconComponent className="w-5 h-5 shrink-0" />
                  </a>
                );
              })}
            </div>

            <div className="space-y-4">
              <div className="border-t border-[#2E2E2E] pt-4">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-widest mb-3">
                  Digital Ecosystem & Touchpoints
                </h4>
                <div className="space-y-2.5 text-xs text-[#ccc]">
                  <a href="tel:0325994197" className="flex items-center gap-2 hover:text-[#FCCE00] transition-colors group">
                    <PhoneIcon className="w-4 h-4 shrink-0 text-[#FCCE00]" />
                    <span>
                      <strong className="text-white">0325994197</strong>
                      <span className="block text-[10px] text-[#666]">{t.footer.phone1}</span>
                    </span>
                  </a>
                  <a href="mailto:Vieco.vietnamesecostumes@gmail.com" className="flex items-center gap-2 hover:text-[#FCCE00] transition-colors">
                    <MailIcon className="w-4 h-4 shrink-0 text-[#FCCE00]" />
                    <span className="break-all">Vieco.vietnamesecostumes@gmail.com</span>
                  </a>
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5 text-[#FCCE00]" />
                    <span className="leading-relaxed">{t.footer.address}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shopping */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4 border-b border-[#2E2E2E] pb-2">{t.footer.shopSection}</h4>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-[#888] hover:text-[#FCCE00] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4 border-b border-[#2E2E2E] pb-2">{t.footer.serviceSection}</h4>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-[#888] hover:text-[#FCCE00] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4 border-b border-[#2E2E2E] pb-2">{t.footer.aboutSection}</h4>
            <ul className="space-y-2.5">
              {aboutLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-[#888] hover:text-[#FCCE00] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#2A2A2A] py-5">
        <div className="yody-container text-center">
          <p className="text-xs text-[#555]">{t.footer.copyrightFull}</p>
          <p className="text-xs text-[#444] mt-1">{t.footer.copyrightLicense}</p>
          <p className="text-xs text-[#444] mt-1">
            {t.footer.recaptcha}{" "}
            <Link href="https://policies.google.com/privacy" className="underline hover:text-[#FCCE00]">{t.footer.privacyPolicy}</Link>{" "}
            và{" "}
            <Link href="https://policies.google.com/terms" className="underline hover:text-[#FCCE00]">{t.footer.terms}</Link>{" "}
            {t.footer.googleApply}
          </p>
        </div>
      </div>
    </footer>
  );
}
