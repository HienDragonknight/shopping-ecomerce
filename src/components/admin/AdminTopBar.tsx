"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Bell, ExternalLink, ChevronRight } from "lucide-react";

interface AdminTopBarProps {
  onMenuOpen: () => void;
}

function useBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const labelMap: Record<string, string> = {
    admin: "Admin",
    products: "Sản phẩm",
    orders: "Đơn hàng",
    customers: "Khách hàng",
    inventory: "Tồn kho",
    promotions: "Khuyến mãi",
    reviews: "Đánh giá",
    reports: "Báo cáo",
    banners: "Banner",
    categories: "Danh mục",
    brands: "Thương hiệu",
    new: "Thêm mới",
    edit: "Chỉnh sửa",
  };

  return segments.map((seg, i) => ({
    label: labelMap[seg] || `#${seg}`,
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));
}

export function AdminTopBar({ onMenuOpen }: AdminTopBarProps) {
  const crumbs = useBreadcrumb();

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuOpen}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
        >
          <Menu size={20} className="text-slate-600" />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm">
          {crumbs.map((crumb, i) => (
            <div key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={13} className="text-slate-300" />}
              {crumb.isLast ? (
                <span className="font-semibold text-slate-900">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-slate-400 hover:text-slate-700 transition-colors">
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl transition-colors"
        >
          <ExternalLink size={13} />
          Xem website
        </Link>
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
          <Bell size={18} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
