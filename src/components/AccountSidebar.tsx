"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useT } from "@/hooks/useT";

export function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const t = useT();

  const navItems = [
    { href: "/account/profile", label: t.account.profile, icon: "👤" },
    { href: "/account/orders", label: t.account.orders, icon: "📦" },
    { href: "/wishlist", label: t.account.wishlist, icon: "❤️" },
    { href: "/account/addresses", label: t.account.addresses, icon: "📍" },
    { href: "/account/change-password", label: t.account.changePassword, icon: "🔒" },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/account/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* User info */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white font-black text-lg">
          {user?.fullName?.[0] || "U"}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-[#1A1A1A] truncate">{user?.fullName || t.auth.myAccount}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email || user?.phone}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-3">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all ${
                active
                  ? "bg-[#1A1A1A] text-white font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-[#1A1A1A]"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-all mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isLoggingOut ? "⏳" : "🚪"}</span>
          {isLoggingOut ? t.auth.loggingOut : t.auth.logout}
        </button>
      </nav>
    </div>
  );
}
