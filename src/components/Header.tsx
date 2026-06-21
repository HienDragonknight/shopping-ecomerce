"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, CartIcon, UserIcon, MenuIcon, CloseIcon, StoreIcon, ChevronRightIcon } from "@/components/icons";
import { navCategories } from "@/lib/data";
import type { NavCategory } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { CartDrawer } from "@/components/CartDrawer";

function YodyLogo() {
  return (
    <Link href="/" className="flex-shrink-0 flex items-baseline gap-0 font-black text-2xl md:text-3xl tracking-tighter focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FCCE00] group">
      <span className="text-[#1A1A1A] group-hover:text-[#333] transition-colors">yo</span>
      <span className="text-[#FCCE00]">dy</span>
    </Link>
  );
}

function MegaMenuDropdown({ category }: { category: NavCategory }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[850px] bg-white/95 backdrop-blur-xl border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-50 p-8 rounded-b-2xl transition-all duration-300 opacity-0 animate-in fade-in slide-in-from-top-2">
      <div className="flex gap-8">
        <div className="flex-1 grid grid-cols-3 gap-8">
          {category.groups?.map((group) => (
            <div key={group.title}>
              <h4 className="text-[11px] font-black text-[#1A1A1A] uppercase mb-4 tracking-[0.15em] border-b border-slate-100 pb-2">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-[13px] text-slate-500 hover:text-[#1A1A1A] hover:font-bold transition-all duration-200 block w-fit"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="w-[240px] shrink-0 border-l border-slate-100 pl-8">
          <Link href="/collection/hang-moi-ve-thang-qua" className="group block">
            <div className="relative aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden mb-3">
              <img
                src="https://placehold.co/400x533/D4E6F1/1A1A1A?text=New+Collection"
                alt="New Collection"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider mb-1 block text-[#FCCE00]">Khám phá</span>
                <span className="font-bold text-sm">BST Mới Nhất</span>
              </div>
            </div>
            <h4 className="font-bold text-sm text-[#1A1A1A] group-hover:text-[#FCCE00] transition-colors">Bộ sưu tập tháng này</h4>
            <p className="text-xs text-slate-500 mt-0.5">Cập nhật xu hướng mới nhất</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function NavItem({ category }: { category: NavCategory }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <li
      ref={ref}
      className="relative"
      onMouseEnter={() => category.groups && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={category.href}
        className="block py-5 text-[13px] font-bold text-[#1A1A1A] hover:text-[#FCCE00] transition-colors whitespace-nowrap tracking-wide relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#FCCE00] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center"
      >
        {category.name}
      </Link>
      {open && category.groups && <MegaMenuDropdown category={category} />}
    </li>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cart & auth state
  const { totalItems, openCart, isOpen, fetchCart } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => { setIsScrolled(window.scrollY > 20); };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    if (!confirm("Bạn có chắc muốn đăng xuất không?")) return;
    setUserMenuOpen(false);
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/account/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const cartCount = mounted ? totalItems() : 0;

  const topLinks = [
    { name: "Mới về", href: "/collection/hang-moi-ve-thang-qua", className: "" },
    { name: "ƯU ĐÃI -50%", href: "/sale", className: "text-[#E53E3E] font-black" },
    { name: "Đồng phục", href: "https://landing.yody.vn/dongphucyody", className: "" },
  ];

  return (
    <>
      <CartDrawer />

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/85 backdrop-blur-lg shadow-[0_4px_20px_rgba(0,0,0,0.04)] border-b border-slate-200/50"
            : "bg-white border-b border-slate-100"
        }`}
      >
        <div className="yody-container">
          <div className={`flex items-center gap-4 transition-all duration-300 ${isScrolled ? "h-16" : "h-20"}`}>
            {/* Mobile menu button */}
            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 text-[#1A1A1A] hover:bg-slate-100 rounded-full transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <div className="mr-4 lg:mr-8">
              <YodyLogo />
            </div>

            {/* Desktop nav */}
            <nav className="hidden lg:flex flex-1" aria-label="Danh mục chính">
              <ul className="flex items-center gap-8">
                {navCategories.map((cat) => (
                  <NavItem key={cat.name} category={cat} />
                ))}
                {topLinks.map((link) => (
                  <li key={link.name} className="relative">
                    <Link
                      href={link.href}
                      className={`block py-5 text-[13px] font-bold hover:text-[#FCCE00] transition-colors whitespace-nowrap tracking-wide ${link.className || "text-[#1A1A1A]"}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Search */}
              <div className="hidden md:flex relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Tìm kiếm..."
                  className={`w-[200px] lg:w-[240px] h-10 pl-4 pr-10 text-[13px] font-medium rounded-full transition-all duration-300 outline-none placeholder:text-slate-400 ${
                    searchFocused
                      ? "bg-white border-2 border-[#FCCE00] shadow-[0_0_10px_rgba(252,206,0,0.2)] w-[240px] lg:w-[280px]"
                      : "bg-slate-100 border border-transparent hover:bg-slate-200"
                  }`}
                />
                <button
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${searchFocused ? "text-[#1A1A1A]" : "text-slate-500 group-hover:text-[#1A1A1A]"}`}
                  aria-label="Tìm kiếm"
                >
                  <SearchIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Icons */}
              <div className="flex items-center gap-1">
                <Link
                  href="/he-thong-cua-hang"
                  className="hidden lg:flex items-center justify-center w-10 h-10 text-slate-700 hover:text-[#1A1A1A] hover:bg-slate-100 rounded-full transition-all"
                  title="Cửa hàng"
                >
                  <StoreIcon className="w-[22px] h-[22px]" />
                </Link>

                {/* User icon / dropdown */}
                <div className="relative" ref={userMenuRef}>
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={() => setUserMenuOpen((o) => !o)}
                        title="Tài khoản"
                        className="flex items-center justify-center w-10 h-10 text-slate-700 hover:text-[#1A1A1A] hover:bg-slate-100 rounded-full transition-all"
                      >
                        <div className="w-7 h-7 rounded-full bg-[#FCCE00] flex items-center justify-center text-[#1A1A1A] font-black text-xs">
                          {user?.fullName?.[0]?.toUpperCase() || "U"}
                        </div>
                      </button>
                      {userMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                          <div className="px-4 py-3 border-b border-slate-100">
                            <p className="font-bold text-sm text-[#1A1A1A] truncate">{user?.fullName}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email || user?.phone}</p>
                          </div>
                          <div className="p-1.5">
                            <Link
                              href="/account/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#1A1A1A] rounded-xl transition-colors font-medium"
                            >
                              <span>👤</span> Tài khoản của tôi
                            </Link>
                            <Link
                              href="/account/orders"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#1A1A1A] rounded-xl transition-colors font-medium"
                            >
                              <span>📦</span> Đơn hàng
                            </Link>
                            <Link
                              href="/wishlist"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#1A1A1A] rounded-xl transition-colors font-medium"
                            >
                              <span>❤️</span> Yêu thích
                            </Link>
                            <button
                              onClick={handleLogout}
                              disabled={isLoggingOut}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium disabled:opacity-50"
                            >
                              <span>{isLoggingOut ? "⏳" : "🚪"}</span>
                              {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href="/account/login"
                      className="flex items-center justify-center w-10 h-10 text-slate-700 hover:text-[#1A1A1A] hover:bg-slate-100 rounded-full transition-all"
                      title="Tài khoản"
                    >
                      <UserIcon className="w-6 h-6" />
                    </Link>
                  )}
                </div>

                {/* Cart button — opens drawer */}
                <button
                  onClick={openCart}
                  className="relative flex items-center justify-center w-10 h-10 text-slate-700 hover:text-[#1A1A1A] hover:bg-slate-100 rounded-full transition-all"
                  title="Giỏ hàng"
                  aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}
                  suppressHydrationWarning
                >
                  <CartIcon className="w-6 h-6" />
                  {mounted && cartCount > 0 && (
                    <span className="absolute top-1 right-0 min-w-[18px] h-[18px] bg-[#FCCE00] text-[#1A1A1A] text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm transition-transform animate-in zoom-in">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className={`md:hidden px-4 transition-all duration-300 overflow-hidden ${isScrolled ? "h-0 opacity-0" : "h-14 opacity-100"}`}>
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full h-11 pl-4 pr-10 text-sm border-none rounded-xl bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FCCE00]"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" aria-label="Tìm kiếm">
              <SearchIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 py-4 max-h-[calc(100vh-80px)] overflow-y-auto shadow-2xl animate-in slide-in-from-top-2">
            <ul className="space-y-1">
              {navCategories.map((cat) => (
                <li key={cat.name}>
                  <Link
                    href={cat.href}
                    className="flex items-center justify-between py-4 text-sm font-bold text-[#1A1A1A] border-b border-slate-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    {cat.name}
                    <ChevronRightIcon className="w-4 h-4 text-slate-300" />
                  </Link>
                </li>
              ))}
              {topLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`flex items-center justify-between py-4 text-sm font-bold border-b border-slate-100 ${link.className || "text-[#1A1A1A]"}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.name}
                    <ChevronRightIcon className="w-4 h-4 text-slate-300" />
                  </Link>
                </li>
              ))}
              {/* Auth links in mobile */}
              <li>
                <Link
                  href={isAuthenticated ? "/account" : "/account/login"}
                  className="flex items-center justify-between py-4 text-sm font-bold text-[#1A1A1A] border-b border-slate-100"
                  onClick={() => setMobileOpen(false)}
                >
                  {isAuthenticated ? "Tài khoản của tôi" : "Đăng nhập / Đăng ký"}
                  <ChevronRightIcon className="w-4 h-4 text-slate-300" />
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>
    </>
  );
}
