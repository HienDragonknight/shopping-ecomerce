"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface PageProps { params: Promise<{ slug: string }>; }

interface Variant {
  id: number; size: string | null; color: string | null;
  colorHex: string | null; sku: string; stockQty: number;
  priceAdjustment: number; label: string;
}
interface ProductDetail {
  id: number; name: string; slug: string; description: string | null;
  basePrice: number; salePrice: number | null; effectivePrice: number;
  thumbnailUrl: string | null; imageUrls: string[];
  avgRating: number | null; reviewCount: number;
  variants: Variant[];
  brand: { name: string } | null;
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
  const [activeThumb, setActiveThumb] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`)
      .then((r) => {
        const p: ProductDetail = r.data.data;
        setProduct(p);
        // Auto-select first in-stock variant
        const firstInStock = p.variants?.find((v) => v.stockQty > 0) || p.variants?.[0] || null;
        setSelectedVariant(firstInStock);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const gallery = product
    ? [product.thumbnailUrl, ...(product.imageUrls || [])].filter(Boolean) as string[]
    : [];

  const uniqueSizes = Array.from(new Set(product?.variants?.filter(v => v.size).map(v => v.size!) || []));
  const uniqueColors = Array.from(
    new Map(product?.variants?.filter(v => v.color).map(v => [v.color!, v]) || []).values()
  );

  const currentSize = selectedVariant?.size || null;
  const currentColor = selectedVariant?.color || null;

  const selectBySize = (size: string) => {
    const v = product?.variants?.find(v => v.size === size && (currentColor ? v.color === currentColor : true))
      || product?.variants?.find(v => v.size === size);
    if (v) setSelectedVariant(v);
  };

  const selectByColor = (color: string) => {
    const v = product?.variants?.find(v => v.color === color && (currentSize ? v.size === currentSize : true))
      || product?.variants?.find(v => v.color === color);
    if (v) setSelectedVariant(v);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) { router.push("/account/login?redirect=/product/" + slug); return; }
    if (!selectedVariant) { setAddError("Vui lòng chọn phân loại sản phẩm"); return; }
    if (selectedVariant.stockQty < quantity) { setAddError("Không đủ hàng"); return; }
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

  if (loading) return (
    <div className="min-h-screen bg-white py-8">
      <div className="yody-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
          <div className="lg:col-span-7 aspect-[3/4] bg-slate-100 rounded-3xl" />
          <div className="lg:col-span-5 space-y-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-slate-100 rounded-xl" />)}
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <p className="text-4xl">😕</p>
      <p className="font-bold text-lg">Không tìm thấy sản phẩm</p>
      <Link href="/products" className="px-6 py-2 bg-[#FCCE00] text-[#1A1A1A] font-bold rounded-full">
        Xem sản phẩm khác
      </Link>
    </div>
  );

  const effectivePrice = (product.effectivePrice ?? product.basePrice) + (selectedVariant?.priceAdjustment ?? 0);
  const inStock = selectedVariant ? selectedVariant.stockQty > 0 : false;

  return (
    <div className="bg-white min-h-screen py-6">
      <div className="yody-container">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-[#FCCE00]">Trang chủ</Link>
          <span>›</span>
          {product.category && (
            <>
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-[#FCCE00]">
                {product.category.name}
              </Link>
              <span>›</span>
            </>
          )}
          <span className="text-slate-800 font-medium line-clamp-1">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Gallery ── */}
          <div className="lg:col-span-7 flex gap-4">
            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="hidden md:flex flex-col gap-2 w-[70px] shrink-0">
                {gallery.map((src, i) => (
                  <button key={i} onClick={() => setActiveThumb(i)}
                    className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                      activeThumb === i ? "border-[#FCCE00]" : "border-slate-200"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {/* Main image */}
            <div className="flex-1 relative aspect-[3/4] bg-slate-50 rounded-3xl overflow-hidden border border-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gallery[activeThumb] || "https://placehold.co/600x800/F5F5F5/999?text=YODY"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.salePrice && (
                <div className="absolute top-4 left-4 bg-[#E53E3E] text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                  -{Math.round((1 - product.salePrice / product.basePrice) * 100)}%
                </div>
              )}
            </div>
          </div>

          {/* ── Product Info ── */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Price */}
            <div>
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-black text-slate-900">
                  {effectivePrice.toLocaleString("vi-VN")}đ
                </span>
                {product.salePrice && (
                  <span className="text-sm text-slate-400 line-through">
                    {product.basePrice.toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-slate-900 leading-snug">{product.name}</h1>
              {product.avgRating && (
                <div className="flex items-center gap-1.5 mt-1.5 text-sm">
                  <span className="text-[#FCCE00]">★</span>
                  <span className="font-semibold">{product.avgRating.toFixed(1)}</span>
                  <span className="text-slate-400">({product.reviewCount} đánh giá)</span>
                </div>
              )}
            </div>

            {/* Colors */}
            {uniqueColors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Màu sắc: <span className="text-slate-800 normal-case font-bold">{currentColor || "Chọn màu"}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {uniqueColors.map((v) => (
                    <button key={v.color!} onClick={() => selectByColor(v.color!)}
                      title={v.color!}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${
                        currentColor === v.color ? "border-[#FCCE00] scale-110" : "border-slate-200"}`}
                      style={{ backgroundColor: v.colorHex || "#ccc" }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {uniqueSizes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Kích thước: <span className="text-slate-800 font-bold">{currentSize || "Chọn size"}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {uniqueSizes.map((size) => {
                    const v = product.variants?.find(v => v.size === size && (currentColor ? v.color === currentColor : true));
                    const outOfStock = !v || v.stockQty === 0;
                    return (
                      <button key={size} onClick={() => !outOfStock && selectBySize(size)}
                        disabled={outOfStock}
                        className={`min-w-[40px] h-10 px-3 rounded-full font-bold text-sm transition-all border-2 ${
                          currentSize === size
                            ? "border-[#FCCE00] bg-white text-slate-900"
                            : outOfStock
                            ? "border-slate-100 text-slate-300 line-through cursor-not-allowed bg-slate-50"
                            : "border-slate-200 text-slate-600 hover:border-slate-400"
                        }`}>
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock info */}
            {selectedVariant ? (
              <p className={`text-xs font-semibold ${inStock ? "text-emerald-600" : "text-red-500"}`}>
                {inStock ? `✓ Còn ${selectedVariant.stockQty} sản phẩm` : "✗ Hết hàng"}
              </p>
            ) : (
              <p className="text-xs font-semibold text-red-500">
                ✗ Sản phẩm hiện tại chưa có phân loại hàng hoặc đã hết hàng.
              </p>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-slate-200 rounded-full h-12 px-2">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-black font-bold text-lg">−</button>
                <span className="w-8 text-center text-sm font-extrabold">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(selectedVariant?.stockQty || 99, q + 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-black font-bold text-lg">+</button>
              </div>
              <button onClick={handleAddToCart} disabled={cartLoading || !inStock}
                className={`flex-1 h-12 font-bold text-sm rounded-full transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  addedToCart
                    ? "bg-emerald-500 text-white"
                    : "bg-[#FCCE00] text-slate-900 hover:bg-[#E5B800] disabled:opacity-50"
                }`}>
                {cartLoading ? "Đang thêm..." : addedToCart ? "✓ Đã thêm vào giỏ!" : "🛒 Thêm vào giỏ"}
              </button>
            </div>

            {/* Buy now */}
            <button onClick={handleBuyNow} disabled={!inStock || cartLoading}
              className="w-full h-12 bg-[#1A1A1A] hover:bg-black text-white font-bold text-sm rounded-full transition-all active:scale-95 disabled:opacity-50">
              Mua ngay
            </button>

            {addError && <p className="text-red-500 text-xs text-center">{addError}</p>}

            {/* Commitments */}
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-2 text-xs text-slate-600">
              {[
                "🔄 Đổi trả miễn phí trong 30 ngày",
                "🚚 Freeship đơn từ 498.000đ",
                "✅ Hàng chính hãng 100% từ YODY",
              ].map((t) => <p key={t} className="font-medium">{t}</p>)}
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-12 max-w-3xl">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Mô tả sản phẩm</h2>
            <div className="prose prose-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
