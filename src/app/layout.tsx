import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { LocaleProvider } from "@/context/LocaleContext";
import { TranslationBanner } from "@/components/TranslationBanner";
import { VisitorTracker } from "@/components/VisitorTracker";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vie'Co - Look Good - Feel Good",
  description:
    "Vie'Co - Thương hiệu thời trang uy tín đưa sản phẩm áo thun, polo, jeans,.. có chất liệu tốt, dịch vụ tốt đến tận tay khách hàng. Liên hệ đặt hàng: 1800 2086",
  keywords: "vieco, thời trang, áo polo, áo thun, quần jeans, áo chống nắng",
  icons: {
    icon: "https://res.cloudinary.com/dev4uz63q/image/upload/f_auto,q_auto/Asset_4_xd8oe6",
  },
  openGraph: {
    title: "Vie'Co - Look Good - Feel Good",
    description: "Thương hiệu thời trang uy tín với chất liệu tốt, dịch vụ tốt",
    url: "https://vieco.vn",
    siteName: "Vie'Co",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // lang attribute is "vi" statically for SEO (Vietnamese is the primary indexed language).
    // The LocaleProvider client component switches UI strings without changing this attribute.
    // Phase 2 (URL-based routing) will make this dynamic.
    <html lang="vi" className={`h-full ${manrope.variable}`}>
      <body
        className="min-h-full flex flex-col bg-white antialiased"
        style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
      >
        <LocaleProvider>
          <VisitorTracker />
          <Header />
          <main className="flex-1 pb-20 lg:pb-0">{children}</main>
          <Footer />
          <TranslationBanner />
          <BottomNavigation />
        </LocaleProvider>
      </body>
    </html>
  );
}
