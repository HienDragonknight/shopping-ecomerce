"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard, ShoppingBag, ListOrdered, Users, Package,
  Tag, Star, BarChart3, Image, FolderOpen, Award,
  LogOut, ChevronDown, ChevronRight, X, Menu,
  Ticket, Settings
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  children?: { href: string; label: string }[];
}

const navGroups: { group: string; items: NavItem[] }[] = [
  {
    group: "",
    items: [
      { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
      { href: "/admin/reports", label: "Báo cáo & Analytics", icon: <BarChart3 size={18} /> },
    ],
  },
  {
    group: "Danh mục",
    items: [
      {
        href: "/admin/products",
        label: "Sản phẩm",
        icon: <ShoppingBag size={18} />,
        children: [
          { href: "/admin/products", label: "Danh sách" },
          { href: "/admin/products/new", label: "Thêm mới" },
          { href: "/admin/categories", label: "Danh mục" },
          { href: "/admin/brands", label: "Thương hiệu" },
        ],
      },
      { href: "/admin/inventory", label: "Tồn kho", icon: <Package size={18} /> },
    ],
  },
  {
    group: "Kinh doanh",
    items: [
      { href: "/admin/orders", label: "Đơn hàng", icon: <ListOrdered size={18} /> },
      { href: "/admin/customers", label: "Khách hàng", icon: <Users size={18} /> },
      { href: "/admin/promotions", label: "Khuyến mãi", icon: <Ticket size={18} /> },
    ],
  },
  {
    group: "Nội dung",
    items: [
      { href: "/admin/reviews", label: "Đánh giá", icon: <Star size={18} /> },
      { href: "/admin/banners", label: "Banner", icon: <Image size={18} /> },
    ],
  },
];

function NavLink({ item, pathname, onClose }: { item: NavItem; pathname: string; onClose?: () => void }) {
  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
  const hasChildren = item.children && item.children.length > 0;
  const [open, setOpen] = useState(isActive);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isActive
              ? "bg-[#FCCE00]/15 text-[#FCCE00]"
              : "text-slate-400 hover:text-white hover:bg-white/8"
          }`}
        >
          <span className="shrink-0">{item.icon}</span>
          <span className="flex-1 text-left">{item.label}</span>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {open && (
          <div className="ml-9 mt-1 space-y-0.5 border-l border-white/10 pl-3">
            {item.children!.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onClose}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === child.href
                    ? "text-[#FCCE00] font-semibold bg-[#FCCE00]/10"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? "bg-[#FCCE00] text-[#1A1A1A] font-bold shadow-sm"
          : "text-slate-400 hover:text-white hover:bg-white/8"
      }`}
    >
      <span className="shrink-0">{item.icon}</span>
      {item.label}
    </Link>
  );
}

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/account/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
        <Link href="/admin" className="flex items-baseline gap-0 font-black text-2xl">
          <span className="text-white">yo</span>
          <span className="text-[#FCCE00]">dy</span>
          <span className="ml-2 text-[10px] font-bold bg-[#FCCE00] text-[#1A1A1A] px-1.5 py-0.5 rounded">ADMIN</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white md:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.group && (
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-1">
                {group.group}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} onClose={onClose} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-[#FCCE00] flex items-center justify-center text-[#1A1A1A] font-black text-sm shrink-0">
            {user?.fullName?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.fullName || "Admin"}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut size={15} className={isLoggingOut ? "animate-spin" : ""} />
          {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-[#111827] flex-col shrink-0 fixed top-0 left-0 h-screen z-30">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#111827] flex flex-col shadow-2xl">
            <SidebarContent onClose={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  );
}
