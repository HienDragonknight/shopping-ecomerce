"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ShoppingBag, RefreshCw, Truck, ShieldCheck, MessageCircle, Store, ChevronRight, Star, Copy, Check } from "lucide-react";

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

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addError, setAddError] = useState("");
  const [skuCopied, setSkuCopied] = useState(false);
  const [imgExpanded, setImgExpanded] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, [slug]);

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
    if (v) setSelectedVariant(v);
  };

  const selectBySize = (size: string) => {
    const v = product?.variants?.find(v => v.size === size && (currentColor ? v.color === currentColor : true))
      || product?.variants?.find(v => v.size === size);
    if (v) setSelectedVariant(v);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) { router.push("/account/login?redirect=/product/" + slug); return; }
    if (!selectedVariant) { setAddError("Vui lòng chọn phân loại sản phẩm"); return; }
    if (selectedVariant.stockQty < quantity) { setAddError("Không đủ hàng trong kho"); return; }
    setAddError("");
    try {
      await addItem(selectedVariant.id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setAddError(axiosErr?.response?.data?.message || "Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/checkout");
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
      <p className="font-bold text-lg text-[#1A3459]">Không tìm thấy sản phẩm</p>
      <Link href="/products" className="px-6 py-2.5 bg-[#FCCE00] text-[#1A1A1A] font-bold rounded-full text-sm">
        Xem sản phẩm khác
      </Link>
    </div>
  );

  /* ─── MAIN ─── */
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-[1200px] mx-auto px-4 pt-4 pb-16">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-[#666] mb-4 font-medium">
          <Link href="/" className="hover:text-[#1A3459] transition-colors">Trang chủ</Link>
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

        {/* Main Layout: Left images stack + Right sticky info */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">

          {/* ── LEFT: Stacked Images (Yody/Zara style) ── */}
          <div className="space-y-2 relative">
            {allImages.length === 0 ? (
              <div className="aspect-[3/4] bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-sm">
                Chưa có ảnh sản phẩm
              </div>
            ) : (
              <>
                {/* Show first image always, rest based on expanded state */}
                {(imgExpanded ? allImages : allImages.slice(0, 3)).map((src, i) => (
                  <div
                    key={i}
                    className="relative overflow-hidden rounded-2xl bg-white"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${product.name} - ảnh ${i + 1}`}
                      className="w-full object-cover"
                      style={{ aspectRatio: "3/4" }}
                    />
                    {/* Discount badge on first image */}
                    {i === 0 && discountPct > 0 && (
                      <div className="absolute top-3 left-3 bg-[#E53E3E] text-white text-[11px] font-black px-2 py-1 rounded-md">
                        -{discountPct}%
                      </div>
                    )}
                  </div>
                ))}

                {/* Collapse/Expand button */}
                {allImages.length > 3 && (
                  <button
                    onClick={() => setImgExpanded(e => !e)}
                    className="w-full py-3 text-sm font-bold text-[#1A3459] bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {imgExpanded ? (
                      <><span>Thu gọn</span> <span className="text-xs">▲</span></>
                    ) : (
                      <><span>Xem thêm {allImages.length - 3} ảnh</span> <span className="text-xs">▼</span></>
                    )}
                  </button>
                )}
              </>
            )}
          </div>

          {/* ── RIGHT: Sticky Info Panel ── */}
          <div
            ref={infoRef}
            className="lg:sticky lg:top-4 space-y-5 bg-transparent"
          >
            {/* Price */}
            <div>
              <div className="flex items-baseline gap-3 mb-1.5">
                <span className="text-[28px] font-black text-[#1A3459] leading-none">
                  {effectivePrice.toLocaleString("vi-VN")}đ
                </span>
                {product.salePrice && (
                  <span className="text-sm text-[#999] line-through font-medium">
                    {product.basePrice.toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>

              <h1 className="text-[15px] font-semibold text-[#1A1A1A] leading-snug mb-1.5">
                {product.name}
              </h1>

              {/* SKU */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#999]">{selectedVariant?.sku || "—"}</span>
                <button onClick={copySku} className="text-[#999] hover:text-[#1A3459] transition-colors">
                  {skuCopied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                </button>
              </div>

              {/* Rating */}
              {product.avgRating && (
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      size={13}
                      fill={s <= Math.round(product.avgRating!) ? "#FCCE00" : "none"}
                      stroke={s <= Math.round(product.avgRating!) ? "#FCCE00" : "#ccc"}
                    />
                  ))}
                  <span className="text-xs text-[#666] ml-1">({product.reviewCount} đánh giá)</span>
                </div>
              )}
            </div>

            {/* ── Colors ── */}
            {uniqueColors.length > 0 && (
              <div>
                <p className="text-[13px] font-semibold text-[#1A1A1A] mb-2.5">
                  Màu sắc: <span className="font-bold">{currentColor || "Chọn màu"}</span>
                </p>
                <div className="flex gap-2.5 flex-wrap">
                  {uniqueColors.map((v) => {
                    const isActive = currentColor === v.color;
                    // Use variant image or colorHex as swatch background
                    const swatchBg = v.colorHex || "#ccc";
                    return (
                      <button
                        key={v.color!}
                        onClick={() => selectByColor(v.color!)}
                        title={v.color!}
                        className={`relative w-10 h-10 rounded-full border-2 transition-all shrink-0 ${
                          isActive
                            ? "border-[#FCCE00] shadow-[0_0_0_1px_#FCCE00]"
                            : "border-[#ddd] hover:border-[#aaa]"
                        }`}
                        style={{ backgroundColor: swatchBg }}
                      >
                        {/* Pattern overlay for light colors */}
                        {swatchBg === "#FFFFFF" || swatchBg === "#fff" ? (
                          <span className="absolute inset-[3px] rounded-full border border-[#eee]" />
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
                  <p className="text-[13px] font-semibold text-[#1A1A1A]">
                    Kích thước: <span className="font-bold">{currentSize || "Chọn size"}</span>
                  </p>
                  <button className="text-xs text-[#1A3459] font-semibold hover:underline">
                    Hướng dẫn chọn size
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
                        className={`min-w-[50px] h-10 px-3 rounded-full text-[13px] font-semibold transition-all border ${
                          isActive
                            ? "border-[#FCCE00] border-2 bg-white text-[#1A1A1A] shadow-sm"
                            : outOfStock
                            ? "border-[#e0e0e0] text-[#ccc] line-through cursor-not-allowed bg-[#fafafa]"
                            : "border-[#ccc] text-[#333] hover:border-[#1A3459] bg-white"
                        }`}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Quantity + Add to cart (Yody style) ── */}
            <div className="flex items-center gap-3">
              {/* Qty stepper */}
              <div className="flex items-center border border-[#ddd] rounded-full h-12 px-1 bg-white shrink-0">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-[#333] hover:bg-[#f5f5f5] rounded-full text-xl font-light transition-colors"
                >
                  −
                </button>
                <span className="w-9 text-center text-sm font-bold text-[#1A1A1A] select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(selectedVariant?.stockQty || 99, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-[#333] hover:bg-[#f5f5f5] rounded-full text-xl font-light transition-colors"
                >
                  +
                </button>
              </div>

              {/* Main CTA — yellow "Thêm vào giỏ" */}
              <button
                onClick={handleAddToCart}
                disabled={cartLoading || !inStock}
                className={`flex-1 h-12 rounded-full font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-sm ${
                  addedToCart
                    ? "bg-emerald-500 text-white"
                    : inStock
                    ? "bg-[#FCCE00] text-[#1A1A1A] hover:bg-[#f5c500]"
                    : "bg-[#FCCE00]/50 text-[#1A1A1A]/50 cursor-not-allowed"
                }`}
              >
                <ShoppingBag size={17} strokeWidth={2.5} />
                {cartLoading ? "Đang thêm..." : addedToCart ? "Đã thêm vào giỏ ✓" : "Thêm vào giỏ"}
              </button>
            </div>

            {/* Mua ngay */}
            <button
              onClick={handleBuyNow}
              disabled={!inStock || cartLoading}
              className="w-full h-12 bg-[#1A3459] hover:bg-[#142a47] text-white font-bold text-sm rounded-full transition-all active:scale-[0.98] disabled:opacity-40"
            >
              Mua ngay
            </button>

            {addError && (
              <p className="text-red-500 text-xs text-center -mt-2 font-medium">{addError}</p>
            )}

            {/* View in store */}
            <button className="flex items-center gap-2 text-[13px] text-[#1A3459] font-semibold hover:underline transition-colors w-full">
              <Store size={16} className="text-[#1A3459] shrink-0" />
              Xem cửa hàng còn sản phẩm
            </button>

            {/* ── YODY cam kết ── */}
            <div>
              <p className="text-[13px] font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                YODY cam kết
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-xs">✓</span>
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    icon: <RefreshCw size={18} className="text-[#1A3459] shrink-0" />,
                    title: "Đổi, trả miễn phí",
                    desc: "tại nhà nếu không hài lòng",
                    link: "Xem chính sách ↗",
                  },
                  {
                    icon: <Truck size={18} className="text-[#1A3459] shrink-0" />,
                    title: "Giao trong 3-5 ngày",
                    desc: "và freeship đơn từ 498k",
                    link: null,
                  },
                  {
                    icon: <ShieldCheck size={18} className="text-[#1A3459] shrink-0" />,
                    title: "Cam kết bảo mật",
                    desc: "thông tin khách hàng",
                    link: null,
                  },
                  {
                    icon: <MessageCircle size={18} className="text-[#1A3459] shrink-0" />,
                    title: "Cần tư vấn thêm?",
                    desc: "Chat ngay!",
                    link: "Chat ngay ↗",
                    isChat: true,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 bg-white rounded-xl border border-[#eee] p-3"
                  >
                    {item.icon}
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-[#1A1A1A] leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#666] leading-tight mt-0.5">{item.desc}</p>
                      {item.link && (
                        <button className="text-[11px] text-[#1A3459] font-semibold hover:underline mt-0.5">
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
                {inStock ? `✓ Còn ${selectedVariant.stockQty} sản phẩm trong kho` : "✗ Hết hàng — Chọn màu/size khác"}
              </p>
            )}
          </div>
        </div>

        {/* ── Description ── */}
        {product.description && (
          <div className="mt-8 bg-white rounded-2xl p-6 border border-[#eee]">
            <h2 className="text-base font-bold text-[#1A3459] mb-4 pb-3 border-b border-[#f0f0f0]">
              Mô tả sản phẩm
            </h2>
            <div className="text-sm text-[#444] leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>
        )}

        {/* ── FAQ / Câu hỏi thường gặp ── */}
        <div className="mt-4 bg-white rounded-2xl p-6 border border-[#eee]">
          <h2 className="text-base font-bold text-[#1A3459] mb-4 pb-3 border-b border-[#f0f0f0]">
            Câu hỏi thường gặp
          </h2>
          <div className="space-y-3">
            {[
              { q: "Sản phẩm có đổi/trả không?", a: "YODY hỗ trợ đổi/trả trong vòng 30 ngày nếu sản phẩm còn nguyên tags, chưa qua sử dụng và có hóa đơn mua hàng." },
              { q: "Thời gian giao hàng bao lâu?", a: "Thông thường 3-5 ngày làm việc với đơn hàng trong nước. Freeship cho đơn từ 498.000đ." },
              { q: "Làm sao biết mình mặc size nào?", a: "Vui lòng tham khảo bảng hướng dẫn chọn size bên trên hoặc chat với tư vấn viên để được hỗ trợ nhanh nhất." },
            ].map((item, i) => (
              <FaqItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#f0f0f0] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#fafafa] transition-colors"
      >
        <span className="text-sm font-semibold text-[#1A1A1A]">{question}</span>
        <span className={`text-[#666] transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-[#555] leading-relaxed border-t border-[#f0f0f0] pt-3 bg-[#fafafa]">
          {answer}
        </div>
      )}
    </div>
  );
}
