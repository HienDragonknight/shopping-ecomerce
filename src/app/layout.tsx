import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YODY - Look Good - Feel Good",
  description:
    "YODY - Thương hiệu thời trang uy tín đưa sản phẩm áo thun, polo, jeans,.. có chất liệu tốt, dịch vụ tốt đến tận tay khách hàng. Liên hệ đặt hàng: 1800 2086",
  keywords: "yody, thời trang, áo polo, áo thun, quần jeans, áo chống nắng",
  openGraph: {
    title: "YODY - Look Good - Feel Good",
    description: "Thương hiệu thời trang uy tín với chất liệu tốt, dịch vụ tốt",
    url: "https://yody.vn",
    siteName: "YODY",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`h-full ${manrope.variable}`}>
      <body
        className="min-h-full flex flex-col bg-white antialiased"
        style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
      >
        <TopBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
