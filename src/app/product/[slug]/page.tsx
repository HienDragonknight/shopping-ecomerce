"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useT } from "@/hooks/useT";
import { useLocale } from "@/context/LocaleContext";
import { ShoppingBag, RefreshCw, Truck, ShieldCheck, MessageCircle, Store, ChevronRight, Star, Copy, Check } from "lucide-react";
import TryOnPanel from "@/components/TryOnPanel";

interface PageProps { params: Promise<{ slug: string }>; }

interface Variant {
  id: number; size: string | null; color: string | null;
  colorHex: string | null; sku: string; stockQty: number;
  priceAdjustment: number; label: string;
  imageUrls?: string[];
}
interface ProductDetail {
  id: number; name: string; slug: string; description: string | null;
  basePrice: number; salePrice: number | null; effectivePrice: number;
  thumbnailUrl: string | null; imageUrls: string[];
  avgRating: number | null; reviewCount: number;
  variants: Variant[];
  brand: { name: string; logoUrl?: string | null } | null;
  category: { name: string; slug: string } | null;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const { addItem, isLoading: cartLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const t = useT();
  const { locale } = useLocale();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addError, setAddError] = useState("");
  const [skuCopied, setSkuCopied] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const tryOnRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  // Re-fetch when slug OR locale changes — axios interceptor sends Accept-Language automatically
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    api.get(`/products/${slug}`)
      .then((r) => {
        const p: ProductDetail = r.data.data;
        setProduct(p);
        const firstInStock = p.variants?.find((v) => v.stockQty > 0) || p.variants?.[0] || null;
        setSelectedVariant(firstInStock);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug, locale]);

  // Reset active image index when variant changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveImgIndex(0);
  }, [selectedVariant]);

  // All product images stacked (Yody style)
  const allImages = (() => {
    if (!product) return [];
    const base = [
      product.thumbnailUrl,
      ...(product.imageUrls || []),
    ].filter(Boolean) as string[];
    // If selected variant has own images, prepend them
    if (selectedVariant?.imageUrls?.length) {
      return [...selectedVariant.imageUrls, ...base.filter(u => !selectedVariant.imageUrls!.includes(u))];
    }
    return base;
  })();

  // Unique colors — one entry per color (first variant of that color)
  const uniqueColors: Variant[] = Array.from(
    new Map(product?.variants?.filter(v => v.color).map(v => [v.color!, v]) || []).values()
  );

  // Sizes available for selected color
  const sizesForColor = product?.variants?.filter(
    v => v.size && (!selectedVariant?.color || v.color === selectedVariant?.color)
  ) || [];

  const currentSize = selectedVariant?.size || null;
  const currentColor = selectedVariant?.color || null;

  const selectByColor = (color: string) => {
    const v = product?.variants?.find(v => v.color === color && (currentSize ? v.size === currentSize : true))
      || product?.variants?.find(v => v.color === color);
    if (v) {
      setSelectedVariant(v);
      if (!v.imageUrls || v.imageUrls.length === 0) {
        const colorIdx = uniqueColors.findIndex(c => c.color === color);
        if (colorIdx >= 0 && colorIdx < allImages.length) {
          setActiveImgIndex(colorIdx);
        }
      }
    }
  };

  const selectBySize = (size: string) => {
    const v = product?.variants?.find(v => v.size === size && (currentColor ? v.color === currentColor : true))
      || product?.variants?.find(v => v.size === size);
    if (v) setSelectedVariant(v);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) { router.push("/account/login?redirect=/product/" + slug); return; }
    if (!selectedVariant) { setAddError(t.product.noVariantError); return; }
    if (selectedVariant.stockQty < quantity) { setAddError(t.product.insufficientStock); return; }
    setAddError("");
    try {
      await addItem(selectedVariant.id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setAddError(axiosErr?.response?.data?.message || t.product.cartError);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { router.push("/account/login?redirect=/product/" + slug); return; }
    if (!selectedVariant) { setAddError(t.product.noVariantError); return; }
    if (selectedVariant.stockQty < quantity) { setAddError(t.product.insufficientStock); return; }
    setAddError("");
    try {
      await addItem(selectedVariant.id, quantity);
      router.push("/checkout");
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setAddError(axiosErr?.response?.data?.message || t.product.cartError);
    }
  };

  const copySku = () => {
    if (selectedVariant?.sku) {
      navigator.clipboard.writeText(selectedVariant.sku);
      setSkuCopied(true);
      setTimeout(() => setSkuCopied(false), 2000);
    }
  };

  const effectivePrice = (product?.effectivePrice ?? product?.basePrice ?? 0) + (selectedVariant?.priceAdjustment ?? 0);
  const inStock = selectedVariant ? selectedVariant.stockQty > 0 : false;
  const discountPct = product?.salePrice && product?.basePrice
    ? Math.round((1 - product.salePrice / product.basePrice) * 100)
    : 0;

  /* ─── LOADING ─── */
  if (loading) return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 animate-pulse">
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="aspect-[3/4] bg-slate-200 rounded-2xl" />)}
          </div>
          <div className="space-y-4 pt-4">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-10 bg-slate-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-[#F5F5F5]">
      <p className="text-4xl">😕</p>
      <p className="font-bold text-lg text-[#1A3459]">{t.product.notFound}</p>
      <Link href="/products" className="px-6 py-2.5 bg-[#1A1A1A] text-white font-bold rounded-full text-sm">
        {t.product.viewOther}
      </Link>
    </div>
  );

  /* ─── MAIN ─── */
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-[1200px] mx-auto px-4 pt-4 pb-16">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-[#666] mb-4 font-medium">
          <Link href="/" className="hover:text-[#1A3459] transition-colors">{t.breadcrumb.home}</Link>
          {product.category && (
            <>
              <ChevronRight size={12} className="shrink-0 text-[#999]" />
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-[#1A3459] transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={12} className="shrink-0 text-[#999]" />
          <span className="text-[#1A3459] font-semibold line-clamp-1">{product.name}</span>
        </nav>

        {/* Main Layout: Left images + Right sticky info (2 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-8 items-start">

          {/* ── LEFT: Interactive Image Gallery (Vertical thumbnails + Main image) ── */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Vertical thumbnails list (desktop only) */}
            {allImages.length > 0 && (
              <div className="hidden lg:flex flex-col gap-2.5 w-[80px] shrink-0 max-h-[550px] overflow-y-auto scrollbar-none">
                {allImages.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all bg-white ${
                      activeImgIndex === idx ? "border-[#fcaf17]" : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image Container */}
            <div className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
              {allImages.length > 0 ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={allImages[activeImgIndex]}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                  {/* Discount badge */}
                  {discountPct > 0 && (
                    <div className="absolute top-4 left-4 bg-[#FF2D37] text-white text-[11px] font-black px-2 py-1 rounded-md shadow-sm">
                      -{discountPct}%
                    </div>
                  )}
                  {/* Navigation arrows at the bottom right */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button
                        onClick={() => setActiveImgIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                        className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition-all active:scale-95 border border-gray-100"
                      >
                        <span className="text-xl font-bold">‹</span>
                      </button>
                      <button
                        onClick={() => setActiveImgIndex((prev) => (prev + 1) % allImages.length)}
                        className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition-all active:scale-95 border border-gray-100"
                      >
                        <span className="text-xl font-bold">›</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                  Chưa có ảnh sản phẩm
                </div>
              )}
            </div>

            {/* Horizontal thumbnails list (mobile only) */}
            {allImages.length > 0 && (
              <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 scrollbar-none mt-2">
                {allImages.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all bg-white ${
                      activeImgIndex === idx ? "border-[#fcaf17]" : "border-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Sticky Info Panel ── */}
          <div
            ref={infoRef}
            className="lg:sticky lg:top-4 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6"
          >
            {/* Price & Discount */}
            <div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl lg:text-3xl font-black text-[#FF2D37]">
                  {effectivePrice.toLocaleString("vi-VN")}đ
                </span>
                {product.salePrice && (
                  <>
                    <span className="text-sm lg:text-base text-gray-400 line-through font-medium">
                      {product.basePrice.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="bg-[#FF2D37] text-white text-[11px] font-black px-1.5 py-0.5 rounded">
                      -{discountPct}%
                    </span>
                  </>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-lg lg:text-xl font-bold text-[#1A1A1A] leading-snug mt-2">
                {product.name}
              </h1>

              {/* SKU */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs text-gray-400 font-mono">{selectedVariant?.sku || "—"}</span>
                <button onClick={copySku} className="text-gray-400 hover:text-[#fcaf17] transition-colors">
                  {skuCopied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                </button>
              </div>

              {/* Rating */}
              {product.avgRating && (
                <div className="flex items-center gap-1 mt-2.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      size={13}
                      fill={s <= Math.round(product.avgRating!) ? "#fcaf17" : "none"}
                      stroke={s <= Math.round(product.avgRating!) ? "#fcaf17" : "#ccc"}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">({product.reviewCount} đánh giá)</span>
                </div>
              )}
            </div>

            {/* ── Colors ── */}
            {uniqueColors.length > 0 && (
              <div>
                <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2.5">
                  {t.product.color}: <span className="font-bold text-gray-600 normal-case">{currentColor || t.product.chooseColor}</span>
                </p>
                <div className="flex gap-2.5 flex-wrap">
                  {uniqueColors.map((v) => {
                    const isActive = currentColor === v.color;
                    const swatchBg = v.colorHex || "#ccc";
                    return (
                      <button
                        key={v.color!}
                        onClick={() => selectByColor(v.color!)}
                        title={v.color!}
                        className={`relative w-9 h-9 rounded-full border transition-all shrink-0 ${
                          isActive
                            ? "ring-2 ring-[#fcaf17] ring-offset-2 border-transparent"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: swatchBg }}
                      >
                        {/* Pattern overlay for light colors */}
                        {swatchBg === "#FFFFFF" || swatchBg === "#fff" ? (
                          <span className="absolute inset-[2px] rounded-full border border-gray-100" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Sizes ── */}
            {sizesForColor.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                    {t.product.size}: <span className="font-bold text-gray-600 normal-case">{currentSize || t.product.chooseSize}</span>
                  </p>
                  <button className="text-xs text-gray-500 font-medium hover:text-[#fcaf17] hover:underline transition-colors">
                    {t.product.sizeGuide}
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {sizesForColor.map((v) => {
                    const isActive = currentSize === v.size && currentColor === v.color;
                    const outOfStock = v.stockQty === 0;
                    return (
                      <button
                        key={v.id}
                        onClick={() => !outOfStock && selectBySize(v.size!)}
                        disabled={outOfStock}
                        className={`min-w-[54px] h-10 px-3 rounded-full text-xs font-bold transition-all border ${
                          isActive
                            ? "border-2 border-[#fcaf17] bg-white text-[#fcaf17] shadow-sm"
                            : outOfStock
                            ? "border-gray-100 text-gray-300 line-through cursor-not-allowed bg-gray-50"
                            : "border-gray-200 text-gray-700 hover:border-[#fcaf17] bg-white"
                        }`}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Quantity + Add to cart ── */}
            <div className="flex items-center gap-3 pt-2">
              {/* Qty stepper */}
              <div className="flex items-center border border-gray-200 rounded-full h-12 px-1 bg-white shrink-0">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-full text-xl font-light transition-colors"
                >
                  −
                </button>
                <span className="w-9 text-center text-sm font-bold text-[#1A1A1A] select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(selectedVariant?.stockQty || 99, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-full text-xl font-light transition-colors"
                >
                  +
                </button>
              </div>

              {/* Main CTA — yellow "Thêm vào giỏ" */}
              <button
                onClick={handleAddToCart}
                disabled={cartLoading || !inStock}
                className={`flex-1 h-12 rounded-full font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md ${
                  addedToCart
                    ? "bg-emerald-500 text-white"
                    : inStock
                    ? "bg-[#fcaf17] hover:bg-[#e59e10] text-[#1A1A1A]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                }`}
              >
                <ShoppingBag size={17} strokeWidth={2.5} />
                {cartLoading ? t.product.adding : addedToCart ? t.product.addedToCart : t.product.addToCart}
              </button>
            </div>

            {/* Mua ngay */}
            <button
              onClick={handleBuyNow}
              disabled={!inStock || cartLoading}
              className="w-full h-12 bg-[#1A3459] hover:bg-[#142a47] text-white font-bold text-sm rounded-full transition-all active:scale-[0.98] disabled:opacity-40 shadow-md"
            >
              {t.product.buyNow}
            </button>

            {/* ✨ Virtual Try-On — button scrolls to try-on panel */}
            <button
              id="try-on-scroll-btn"
              onClick={() => tryOnRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="group w-full flex items-center justify-between py-3 px-4 border-2 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
              style={{ borderColor: "#FF2D78", color: "#FF2D78" }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.86H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.86l.58-3.57a2 2 0 00-1.34-2.23z" />
                </svg>
                Try On
              </div>
              <span className="text-[10px] font-black bg-[#FF2D78] text-white px-1.5 py-0.5 rounded-full animate-pulse">NEW</span>
            </button>

            {addError && (
              <p className="text-red-500 text-xs text-center -mt-2 font-medium">{addError}</p>
            )}

            {/* View in store */}
            <button className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium hover:text-[#fcaf17] hover:underline transition-colors w-full py-2 border border-gray-100 rounded-xl bg-white shadow-sm">
              <Store size={16} className="text-gray-400 shrink-0" />
              {t.product.viewInStore}
            </button>

            {/* ── YODY cam kết ── */}
            <div className="border-t border-gray-100 pt-5">
              <p className="text-sm font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                {t.promises.title}
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px]">✓</span>
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    icon: <RefreshCw size={18} className="text-[#1A3459] shrink-0 mt-0.5" />,
                    title: t.promises.freeReturn,
                    desc: t.promises.freeReturnDesc,
                    link: t.promises.viewPolicy,
                  },
                  {
                    icon: <Truck size={18} className="text-[#1A3459] shrink-0 mt-0.5" />,
                    title: t.promises.delivery,
                    desc: t.promises.deliveryDesc,
                    link: null,
                  },
                  {
                    icon: <ShieldCheck size={18} className="text-[#1A3459] shrink-0 mt-0.5" />,
                    title: t.promises.security,
                    desc: t.promises.securityDesc,
                    link: null,
                  },
                  {
                    icon: <MessageCircle size={18} className="text-[#1A3459] shrink-0 mt-0.5" />,
                    title: t.promises.support,
                    desc: t.promises.supportDesc,
                    link: t.promises.chatNow,
                    isChat: true,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 bg-gray-50 rounded-xl border border-gray-100 p-3 hover:bg-gray-100/50 transition-colors"
                  >
                    {item.icon}
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#1A1A1A] leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{item.desc}</p>
                      {item.link && (
                        <button className="text-[10px] text-[#1A3459] font-semibold hover:underline mt-0.5 block">
                          {item.link}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock info subtle */}
            {selectedVariant && (
              <p className={`text-xs font-semibold text-center ${inStock ? "text-emerald-600" : "text-red-500"}`}>
                {inStock ? t.product.stockCount(selectedVariant.stockQty) : t.product.outOfStockHint}
              </p>
            )}
          </div>{/* end info panel */}

        </div>{/* end 2-col grid */}

      </div>

      {/* ── Description ── */}
      <div className="max-w-[1200px] mx-auto px-4">
        {product.description && (
          <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-base font-bold text-[#1A3459] mb-4 pb-3 border-b border-gray-100">
              {t.product.description}
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>
        )}

        {/* ── AI Virtual Try-On Section ── */}
        <div ref={tryOnRef} id="try-on-section" className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Section header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100" style={{ background: "#fff5f8" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FF2D7820" }}>
              <svg className="w-5 h-5" style={{ color: "#FF2D78" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.86H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.86l.58-3.57a2 2 0 00-1.34-2.23z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#1A1A1A]">AI Virtual Try-On</h2>
                <span className="text-[10px] font-black text-white px-2 py-0.5 rounded-full" style={{ background: "#FF2D78" }}>NEW</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Upload your photo and see how this outfit looks on you</p>
            </div>
          </div>
          {/* Panel content */}
          <div className="p-6">
            <TryOnPanel
              productId={product.id}
              productName={currentColor ? `${product.name} (${currentColor})` : product.name}
              productImageUrl={
                (selectedVariant?.imageUrls && selectedVariant.imageUrls.length > 0)
                  ? selectedVariant.imageUrls[0]
                  : (allImages[activeImgIndex] || product.thumbnailUrl)
              }
            />
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-16">
          <h2 className="text-base font-bold text-[#1A3459] mb-4 pb-3 border-b border-gray-100">
            {t.product.faq}
          </h2>
          <div className="space-y-3">
            {[
              { q: t.faq.returnPolicy.q, a: t.faq.returnPolicy.a },
              { q: t.faq.delivery.q, a: t.faq.delivery.a },
              { q: t.faq.sizing.q, a: t.faq.sizing.a },
            ].map((item, i) => (
              <FaqItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center gap-3 pb-safe-bottom">
        {/* Left: Try On button */}
        <div className="flex gap-2">
          <button
            onClick={() => tryOnRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="w-11 h-11 border border-[#FF2D78]/30 rounded-full flex items-center justify-center text-[#FF2D78] bg-[#FF2D78]/5 active:scale-95 transition-all"
            title="Thử đồ AI"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.86H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.86l.58-3.57a2 2 0 00-1.34-2.23z" />
            </svg>
          </button>
        </div>

        {/* Right: Add to Cart & Buy Now */}
        <div className="flex-1 flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={cartLoading || !inStock}
            className={`flex-1 h-11 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all ${
              addedToCart
                ? "bg-emerald-500 text-white"
                : inStock
                ? "bg-[#fcaf17] text-[#1A1A1A]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <ShoppingBag size={14} strokeWidth={2.5} />
            {cartLoading ? "..." : addedToCart ? "Đã thêm" : "Thêm giỏ"}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!inStock || cartLoading}
            className="flex-1 h-11 bg-[#1A3459] text-white font-bold text-xs rounded-full shadow-sm active:scale-95 transition-all"
          >
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-[#1A1A1A]">{question}</span>
        <span className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3 bg-gray-50">
          {answer}
        </div>
      )}
    </div>
  );
}
