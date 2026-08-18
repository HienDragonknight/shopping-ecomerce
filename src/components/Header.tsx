"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CartIcon, UserIcon, MenuIcon, CloseIcon, StoreIcon, HeartIcon } from "@/components/icons";
import { navCategories } from "@/lib/data";
import type { NavCategory } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { CartDrawer } from "@/components/CartDrawer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useT } from "@/hooks/useT";
import { useLocale } from "@/context/LocaleContext";

function YodyLogo() {
  return (
    <Link href="/" className="flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]">
      <img
        src="https://res.cloudinary.com/dev4uz63q/image/upload/f_auto,q_auto/Asset_4_xd8oe6"
        alt="Logo"
        className="h-10 md:h-12 w-auto object-contain transition-opacity duration-200 hover:opacity-80"
      />
    </Link>
  );
}

function MegaMenuDropdown({ category }: { category: NavCategory }) {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const t = useT();

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[850px] bg-white/95 backdrop-blur-xl border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-50 p-8 rounded-b-2xl transition-all duration-300 opacity-0 animate-in fade-in slide-in-from-top-2">
      <div className="flex gap-8">
        <div className="flex-1 grid grid-cols-3 gap-8">
          {category.groups?.map((group) => (
            <div key={group.title}>
              <h4 className="text-[11px] font-black text-[#1A1A1A] uppercase mb-4 tracking-[0.15em] border-b border-slate-100 pb-2">
                {isEn ? group.titleEn || group.title : group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-[13px] text-slate-500 hover:text-[#1A1A1A] hover:font-bold transition-all duration-200 block w-fit"
                    >
                      {isEn ? item.nameEn || item.name : item.name}
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
                <span className="text-[10px] font-bold uppercase tracking-wider mb-1 block text-[#1A1A1A]">
                  {t.nav.discover}
                </span>
                <span className="font-bold text-sm">
                  {t.nav.newCollection}
                </span>
              </div>
            </div>
            <h4 className="font-bold text-sm text-[#1A1A1A] group-hover:text-[#1A1A1A] transition-colors">
              {t.nav.monthlyCollection}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.nav.latestTrends}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function NavItem({ category }: { category: NavCategory }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const { locale } = useLocale();
  const isEn = locale === "en";

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
        className="block py-5 text-[13px] font-bold text-[#1A1A1A] hover:text-slate-500 transition-colors whitespace-nowrap tracking-wide relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1A1A1A] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center"
      >
        {isEn ? category.nameEn || category.name : category.name}
      </Link>
      {open && category.groups && <MegaMenuDropdown category={category} />}
    </li>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cart & auth state
  const { totalItems, openCart, fetchCart } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const t = useT();
  const { locale } = useLocale();
  const isEn = locale === "en";

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
  }, [isAuthenticated, fetchCart]);

  const handleLogout = async () => {
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
          <div className={`grid grid-cols-3 items-center gap-4 transition-all duration-300 ${isScrolled ? "h-16" : "h-20"}`}>
            {/* Left: Logo & Mobile menu button */}
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden flex items-center justify-center w-10 h-10 text-[#1A1A1A] hover:bg-slate-100 rounded-full transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
              </button>
              <YodyLogo />
            </div>

            {/* Center: Navigation Menu */}
            <nav className="hidden lg:flex justify-center" aria-label="Danh mục chính">
              <ul className="flex items-center gap-8">
                {navCategories.map((cat) => (
                  <NavItem key={cat.name} category={cat} />
                ))}
                {/* AR Scan Link */}
                <li className="relative">
                  <Link
                    href="/ar/"
                    className="block py-5 text-[13px] font-bold text-[#1A1A1A] hover:text-slate-500 transition-colors whitespace-nowrap tracking-wide relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1A1A1A] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center"
                  >
                    {isEn ? "AR Scan" : "AR quét"}{" "}
                    <span className="text-[10px] font-extrabold text-white bg-[#ff7684] px-2 py-0.5 rounded-full uppercase tracking-wider ml-1.5 inline-flex items-center justify-center">
                      LIVE
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Right: Actions aligned right */}
            <div className="flex items-center justify-end gap-3.5">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Icons */}
              <div className="flex items-center gap-1">
                <Link
                  href="/he-thong-cua-hang"
                  className="hidden lg:flex items-center justify-center w-10 h-10 text-slate-700 hover:text-[#1A1A1A] hover:bg-slate-100 rounded-full transition-all"
                  title={t.nav.store}
                >
                  <StoreIcon className="w-[22px] h-[22px]" />
                </Link>

                {/* User icon / dropdown */}
                <div className="relative hidden lg:block" ref={userMenuRef}>
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={() => setUserMenuOpen((o) => !o)}
                        title={t.nav.account}
                        className="flex items-center justify-center w-10 h-10 text-slate-700 hover:text-[#1A1A1A] hover:bg-slate-100 rounded-full transition-all"
                      >
                        <div className="w-7 h-7 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white font-black text-xs">
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
                              <span>👤</span> {t.account.profile}
                            </Link>
                            <Link
                              href="/account/orders"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#1A1A1A] rounded-xl transition-colors font-medium"
                            >
                              <span>📦</span> {t.account.orders}
                            </Link>
                            <Link
                              href="/wishlist"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#1A1A1A] rounded-xl transition-colors font-medium"
                            >
                              <span>❤️</span> {t.account.wishlist}
                            </Link>
                            <button
                              onClick={handleLogout}
                              disabled={isLoggingOut}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium disabled:opacity-50"
                            >
                              <span>{isLoggingOut ? "⏳" : "🚪"}</span>
                              {isLoggingOut ? t.auth.loggingOut : t.auth.logout}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href="/account/login"
                      className="flex items-center justify-center w-10 h-10 text-slate-700 hover:text-[#1A1A1A] hover:bg-slate-100 rounded-full transition-all"
                      title={t.nav.account}
                    >
                      <UserIcon className="w-6 h-6" />
                    </Link>
                  )}
                </div>

                {/* Wishlist Link */}
                <Link
                  href="/wishlist"
                  className="hidden lg:flex items-center justify-center w-10 h-10 text-slate-700 hover:text-[#1A1A1A] hover:bg-slate-100 rounded-full transition-all"
                  title={t.account.wishlist}
                >
                  <HeartIcon className="w-[22px] h-[22px]" />
                </Link>

                {/* Cart button — opens drawer */}
                <button
                  onClick={openCart}
                  className="relative flex items-center justify-center w-10 h-10 text-slate-700 hover:text-[#1A1A1A] hover:bg-slate-100 rounded-full transition-all"
                  title={t.nav.cart}
                  aria-label={`${t.nav.cart} (${cartCount})`}
                  suppressHydrationWarning
                >
                  <CartIcon className="w-6 h-6" />
                  {mounted && cartCount > 0 && (
                    <span className="absolute top-1 right-0 min-w-[18px] h-[18px] bg-[#1A1A1A] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm transition-transform animate-in zoom-in">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile search bar removed */}

        {/* Full-screen Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Top Bar inside Menu */}
            <div className="flex items-center justify-center relative h-16 px-4 shrink-0 bg-white">
              <button 
                onClick={() => setMobileOpen(false)}
                className="absolute left-4 w-10 h-10 flex items-center justify-center text-[#1A1A1A] hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
              <YodyLogo />
            </div>

            {/* Menu Content Area */}
            <div className="relative flex-1 bg-[#FCFCFC] rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)] overflow-hidden mt-2">
              {/* Watermark Background */}
              <div 
                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center bg-no-repeat opacity-[0.05] mix-blend-multiply pointer-events-none"
                style={{ backgroundPosition: "top center" }}
              />

              {/* Scrollable List */}
              <div className="relative z-10 h-full overflow-y-auto px-8 pt-8 pb-20">
                <ul className="space-y-0">
                  {navCategories.map((cat) => (
                    <li key={cat.name} className="border-b border-slate-200/70 py-4">
                      <Link
                        href={cat.href}
                        className="block text-[17px] tracking-tight font-semibold text-[#1A1A1A] mb-1"
                        onClick={() => setMobileOpen(false)}
                      >
                        {isEn ? cat.nameEn || cat.name : cat.name}
                      </Link>
                      {cat.groups && (
                        <ul className="pl-4 space-y-3 mt-3">
                          {cat.groups.map((group) => (
                            <li key={group.title}>
                              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                {isEn ? group.titleEn || group.title : group.title}
                              </p>
                              <ul className="space-y-1.5">
                                {group.items.map((item) => (
                                  <li key={item.name}>
                                    <Link
                                      href={item.href}
                                      className="block text-[14px] text-slate-500 hover:text-black py-1"
                                      onClick={() => setMobileOpen(false)}
                                    >
                                      {isEn ? item.nameEn || item.name : item.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                  {/* Mobile Menu AR Scan Link */}
                  <li className="border-b border-slate-200/70 py-4">
                    <Link
                      href="/ar/"
                      className="block text-[17px] tracking-tight font-semibold text-[#1A1A1A] mb-1"
                      onClick={() => setMobileOpen(false)}
                    >
                      {isEn ? "AR Scan" : "AR quét"}{" "}
                      <span className="text-[10px] font-extrabold text-white bg-[#ff7684] px-2 py-0.5 rounded-full uppercase tracking-wider ml-1.5 inline-flex items-center justify-center">
                        LIVE
                      </span>
                    </Link>
                  </li>
                  {/* Auth links in mobile */}
                  <li>
                    <Link
                      href={isAuthenticated ? "/account" : "/account/login"}
                      className="block py-4 text-[17px] tracking-tight font-semibold text-[#1A1A1A] border-b border-slate-200/70"
                      onClick={() => setMobileOpen(false)}
                    >
                      {isAuthenticated ? t.auth.myAccount : `${t.auth.login} / ${t.auth.register}`}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
