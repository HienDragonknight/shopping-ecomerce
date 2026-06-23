"use client";

import Link from "next/link";
import { useState } from "react";
import { PhoneIcon, MailIcon, MapPinIcon } from "@/components/icons";
import { useT } from "@/hooks/useT";

const socialLinks = [
  { name: "Facebook", href: "https://www.facebook.com/yodyvn", icon: "f" },
  { name: "TikTok", href: "https://www.tiktok.com/@yodyvietnam", icon: "t" },
  { name: "YouTube", href: "https://www.youtube.com/@yodyvn", icon: "y" },
  { name: "Instagram", href: "https://www.instagram.com/yody.vn", icon: "i" },
  { name: "Zalo", href: "https://zalo.me/yodyvn", icon: "z" },
];

function SocialIcon({ letter }: { letter: string }) {
  return (
    <span className="w-7 h-7 flex items-center justify-center font-extrabold text-[11px] uppercase">
      {letter}
    </span>
  );
}

export function Footer() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  const shopLinks = [
    { name: t.shopLinks.men, href: "/category/nam" },
    { name: t.shopLinks.women, href: "/category/nu" },
    { name: t.shopLinks.kids, href: "/category/tre-em" },
    { name: t.shopLinks.uniform, href: "https://landing.yody.vn/dongphucyody" },
    { name: t.shopLinks.blog, href: "/blog" },
  ];

  const serviceLinks = [
    { name: t.serviceLinks.loyalty, href: "/page/chinh-sach-khach-hang-than-thiet" },
    { name: t.serviceLinks.returnPolicy, href: "/page/chinh-sach-bao-hanh-doi-tra" },
    { name: t.serviceLinks.privacy, href: "/page/chinh-sach-bao-mat" },
    { name: t.serviceLinks.payment, href: "/page/chinh-sach-giao-nhan-hang-online" },
    { name: t.serviceLinks.uniform, href: "/page/chinh-sach-dong-phuc-yody" },
    { name: t.serviceLinks.sizeGuide, href: "/page/bang-size-chuan" },
  ];

  const aboutLinks = [
    { name: t.aboutLinks.intro, href: "/page/gioi-thieu" },
    { name: t.aboutLinks.careers, href: "https://careers.yody.vn/" },
    { name: t.aboutLinks.stores, href: "/he-thong-cua-hang" },
  ];

  return (
    <footer className="bg-[#1A1A1A] text-white">
      {/* Newsletter bar */}
      <div className="border-b border-[#2E2E2E]">
        <div className="yody-container py-6">
          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
            <div>
              <p className="font-extrabold text-lg text-white">{t.footer.newsletter}</p>
              <p className="text-sm text-[#888] mt-0.5">{t.footer.newsletterSub}</p>
            </div>
            {subscribed ? (
              <div className="text-[#FCCE00] font-bold text-sm">{t.footer.newsletterDone}</div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.footer.newsletterPlaceholder}
                  required
                  className="flex-1 md:w-72 h-10 px-4 text-sm bg-[#2A2A2A] border border-[#3A3A3A] rounded-full text-white placeholder:text-[#666] focus:outline-none focus:border-[#FCCE00] transition-colors"
                />
                <button
                  type="submit"
                  className="h-10 px-6 bg-[#FCCE00] text-[#1A1A1A] text-sm font-bold rounded-full hover:bg-[#f0c200] transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {t.footer.newsletterSend}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="yody-container py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact */}
          <div>
            <Link href="/" className="inline-flex items-baseline gap-0 text-2xl font-black mb-4">
              <span className="text-white">yo</span>
              <span className="text-[#FCCE00]">dy</span>
            </Link>
            <p className="text-sm text-[#aaa] mb-1 font-semibold">{t.footer.greeting}</p>
            <p className="text-xs text-[#666] mb-5 leading-relaxed">{t.footer.greetingDesc}</p>

            {/* Social links */}
            <div className="flex gap-2 mb-5">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="w-9 h-9 rounded-full bg-[#2A2A2A] hover:bg-[#FCCE00] hover:text-[#1A1A1A] text-[#aaa] flex items-center justify-center transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FCCE00]"
                >
                  <SocialIcon letter={s.icon} />
                </a>
              ))}
            </div>

            <div className="space-y-2.5">
              <a href="tel:18002086" className="flex items-center gap-2 text-sm text-[#ccc] hover:text-[#FCCE00] transition-colors">
                <PhoneIcon className="w-4 h-4 shrink-0 text-[#FCCE00]" />
                <span>
                  <strong className="text-white">1800 2086</strong>
                  <span className="block text-[10px] text-[#666]">{t.footer.phone1}</span>
                </span>
              </a>
              <a href="mailto:cskh@yody.vn" className="flex items-center gap-2 text-sm text-[#ccc] hover:text-[#FCCE00] transition-colors">
                <MailIcon className="w-4 h-4 shrink-0 text-[#FCCE00]" />
                <span>cskh@yody.vn</span>
              </a>
              <div className="flex items-start gap-2 text-sm text-[#666]">
                <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5 text-[#FCCE00]" />
                <span>{t.footer.address}</span>
              </div>
            </div>
          </div>

          {/* Shopping */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4 border-b border-[#2E2E2E] pb-2">{t.footer.shopSection}</h4>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-[#777] hover:text-[#FCCE00] transition-colors">
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
                  <Link href={link.href} className="text-sm text-[#777] hover:text-[#FCCE00] transition-colors">
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
                  <Link href={link.href} className="text-sm text-[#777] hover:text-[#FCCE00] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Payment icons */}
            <div className="mt-6">
              <p className="text-xs text-[#555] mb-2 font-semibold uppercase tracking-wide">{t.footer.paymentMethods}</p>
              <div className="flex flex-wrap gap-1.5">
                {["VISA", "MasterCard", "ATM", "COD", "MoMo", "ZaloPay"].map((m) => (
                  <span key={m} className="px-2 py-1 text-[10px] font-bold bg-[#2A2A2A] text-[#aaa] rounded-md border border-[#3A3A3A]">
                    {m}
                  </span>
                ))}
              </div>
            </div>
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
