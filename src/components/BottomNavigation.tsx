"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useT } from "@/hooks/useT";

// Custom icons for Bottom Navigation
function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function GridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
    </svg>
  );
}

function ShoppingBagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx={12} cy={7} r={4} />
    </svg>
  );
}

export function BottomNavigation() {
  const pathname = usePathname();
  const t = useT();
  const { totalItems, openCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname.startsWith("/product/")) {
    return null;
  }

  const cartCount = mounted ? totalItems() : 0;

  // Navigation items configuration
  const navItems = [
    {
      label: t.nav.home || "Trang chủ",
      href: "/",
      icon: HomeIcon,
      active: pathname === "/",
    },
    {
      label: t.nav.products || "Cửa hàng",
      href: "/products",
      icon: GridIcon,
      active: pathname.startsWith("/products") || pathname.startsWith("/category") || pathname.startsWith("/collection"),
    },
    {
      label: "AR Quét",
      href: "https://ar-ashen-nine.vercel.app/",
      icon: SparklesIcon,
      active: false,
      special: true, // Center highlighted button
    },
    {
      label: t.nav.cart || "Giỏ hàng",
      onClick: openCart,
      icon: ShoppingBagIcon,
      active: false,
      badge: cartCount,
    },
    {
      label: t.nav.account || "Cá nhân",
      href: isAuthenticated ? "/account/profile" : "/account/login",
      icon: UserIcon,
      active: pathname.startsWith("/account"),
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] pb-safe-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          
          if (item.special) {
            const isExternal = item.href.startsWith("http");
            return (
              <Link
                key={index}
                href={item.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="flex flex-col items-center justify-center -translate-y-4"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  item.active 
                    ? "bg-[#1A1A1A] text-white scale-110 rotate-12" 
                    : "bg-gradient-to-tr from-amber-400 to-yellow-500 text-white hover:scale-105"
                }`}>
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span className={`text-[10px] font-bold mt-1 transition-colors duration-200 ${
                  item.active ? "text-[#1A1A1A] font-extrabold" : "text-slate-500"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          }

          const content = (
            <>
              <div className="relative">
                <Icon className={`w-5.5 h-5.5 transition-all duration-200 ${
                  item.active 
                    ? "text-[#1A1A1A] scale-110 stroke-[2.5px]" 
                    : "text-slate-400 group-hover:text-slate-600"
                }`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-sm">
                    {item.badge > 99 ? "99" : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium mt-1 transition-colors duration-200 ${
                item.active ? "text-[#1A1A1A] font-bold" : "text-slate-400"
              }`}>
                {item.label}
              </span>
            </>
          );

          if (item.onClick) {
            return (
              <button
                key={index}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center flex-1 py-1 group"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={index}
              href={item.href || "/"}
              className="flex flex-col items-center justify-center flex-1 py-1 group"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
