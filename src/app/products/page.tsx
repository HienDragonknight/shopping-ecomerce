"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  SlidersHorizontal, 
  ChevronDown, 
  X, 
  Grid3X3, 
  Grid2X2,
  Search, 
  ShoppingBag, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Check,
  Eye,
  ArrowUpDown,
  Heart
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  effectivePrice: number;
  thumbnailUrl: string | null;
  brand: { name: string } | null;
  category: { name: string } | null;
  avgRating: number | null;
  reviewCount: number;
  variants: { id: number; size: string | null; color: string | null; colorHex: string | null; stockQty: number }[];
}

interface Category { id: number; name: string; slug: string }
interface Brand { id: number; name: string; slug: string }

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "popular", label: "Phổ biến nhất" },
  { value: "price_asc", label: "Giá: Thấp → Cao" },
  { value: "price_desc", label: "Giá: Cao → Thấp" },
];

const PRICE_RANGES = [
  { label: "Dưới 200.000đ", min: "", max: "200000" },
  { label: "200.000 – 500.000đ", min: "200000", max: "500000" },
  { label: "500.000 – 1.000.000đ", min: "500000", max: "1000000" },
  { label: "Trên 1.000.000đ", min: "1000000", max: "" },
];

const GENDER_OPTIONS = [
  { value: "", label: "Tất cả giới tính" },
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "UNISEX", label: "Unisex" },
  { value: "KIDS", label: "Trẻ em" },
];

const COLOR_MAP: Record<string, string> = {
  "Đen": "#000000",
  "Trắng": "#FFFFFF",
  "Đỏ": "#EF4444",
  "Xanh": "#3B82F6",
  "Xanh lá": "#10B981",
  "Vàng": "#FBBF24",
  "Hồng": "#EC4899",
  "Xám": "#9CA3AF",
  "Be": "#F5F5DC",
  "Cam": "#F97316",
  "Tím": "#8B5CF6",
  "Nâu": "#78350F"
};

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [cols, setCols] = useState<3 | 4>(4);

  // Filters State
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [brandId, setBrandId] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [gender, setGender] = useState<string>("");
  const [minDiscountPercent, setMinDiscountPercent] = useState<number | null>(null);
  const [selectedPriceIdx, setSelectedPriceIdx] = useState<number | null>(null);
  
  // Custom price input
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");

  // New Color, Size, Availability filters
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Collapsible sections
  const [openSection, setOpenSection] = useState({
    gender: true,
    categories: true,
    price: true,
    brands: true,
    offers: true,
    colors: true,
    sizes: true,
    availability: true
  });

  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const PAGE_SIZE = 16;
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [wishlistProductIds, setWishlistProductIds] = useState<number[]>([]);

  // Fetch categories and brands once
  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data.data || [])).catch(() => {});
    api.get("/brands").then((r) => setBrands(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      api.get("/wishlist")
        .then((r) => setWishlistProductIds(r.data.data?.map((item: { product: { id: number } }) => item.product.id) || []))
        .catch(() => {});
    } else {
      setWishlistProductIds([]);
    }
  }, [isAuthenticated]);

  const toggleWishlist = async (productId: number) => {
    if (!isAuthenticated) return;
    const isFav = wishlistProductIds.includes(productId);
    try {
      if (isFav) {
        await api.delete(`/wishlist/${productId}`);
        setWishlistProductIds(prev => prev.filter(id => id !== productId));
      } else {
        await api.post("/wishlist", { productId });
        setWishlistProductIds(prev => [...prev, productId]);
      }
    } catch {}
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const p: Record<string, string | number> = { page, size: PAGE_SIZE, sort };
      if (categoryId) p.categoryId = categoryId;
      if (brandId) p.brandId = brandId;
      if (minPrice) p.minPrice = minPrice;
      if (maxPrice) p.maxPrice = maxPrice;
      if (gender) p.gender = gender;
      if (minDiscountPercent !== null) p.minDiscountPercent = minDiscountPercent;
      
      if (search.trim()) {
        const res = await api.get("/products/search", { params: { q: search, page, size: PAGE_SIZE } });
        setProducts(res.data.data.content || []);
        setTotal(res.data.data.totalElements || 0);
        return;
      }
      
      const res = await api.get("/products", { params: p });
      setProducts(res.data.data.content || []);
      setTotal(res.data.data.totalElements || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, categoryId, brandId, minPrice, maxPrice, sort, search, gender, minDiscountPercent]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Handlers
  const handlePriceRange = (idx: number) => {
    const r = PRICE_RANGES[idx];
    setSelectedPriceIdx(idx);
    setMinPrice(r.min);
    setMaxPrice(r.max);
    setMinPriceInput("");
    setMaxPriceInput("");
    setPage(0);
  };

  const handleCustomPriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    setMinPrice(minPriceInput);
    setMaxPrice(maxPriceInput);
    setSelectedPriceIdx(null);
    setPage(0);
  };

  const handleClearAllFilters = () => {
    setCategoryId(null);
    setBrandId(null);
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
    setGender("");
    setMinDiscountPercent(null);
    setSelectedPriceIdx(null);
    setMinPriceInput("");
    setMaxPriceInput("");
    setSort("newest");
    setPage(0);
    setSelectedColor(null);
    setSelectedSize(null);
    setInStockOnly(false);
    if (searchInputRef.current) searchInputRef.current.value = "";
  };

  const activeFiltersCount = 
    (categoryId ? 1 : 0) + 
    (brandId ? 1 : 0) + 
    (minPrice || maxPrice ? 1 : 0) + 
    (search ? 1 : 0) +
    (gender ? 1 : 0) +
    (minDiscountPercent !== null ? 1 : 0) +
    (selectedColor ? 1 : 0) +
    (selectedSize ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  // Client-side filtering for Color, Size, Availability
  const filteredProducts = products.filter((product) => {
    if (selectedColor) {
      const hasColor = product.variants?.some((v) => v.color === selectedColor);
      if (!hasColor) return false;
    }
    if (selectedSize) {
      const hasSize = product.variants?.some((v) => v.size === selectedSize);
      if (!hasSize) return false;
    }
    if (inStockOnly) {
      const hasStock = product.variants?.some((v) => v.stockQty > 0);
      if (!hasStock) return false;
    }
    return true;
  });

  // Sidebar Filter Component (Drawer & Desktop Sidebar)
  const FilterSidebarContent = () => (
    <div className="space-y-6">
      {/* Gender Section */}
      <div className="border-b border-slate-100 pb-5">
        <button 
          type="button"
          onClick={() => setOpenSection(prev => ({ ...prev, gender: !prev.gender }))}
          className="flex items-center justify-between w-full font-bold text-xs text-[#111111] uppercase tracking-wider py-2 hover:text-[#666666] transition-colors"
        >
          <span>Giới tính</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSection.gender ? "rotate-180" : ""}`} />
        </button>
        
        {openSection.gender && (
          <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            {GENDER_OPTIONS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => { setGender(g.value); setPage(0); }}
                className="flex items-center gap-3 w-full text-left text-sm py-1 text-slate-700 hover:text-[#111111] transition-colors group"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  gender === g.value 
                    ? "border-black bg-black text-white" 
                    : "border-slate-300 bg-white group-hover:border-slate-400"
                }`}>
                  {gender === g.value && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className={`text-sm ${gender === g.value ? "font-semibold text-black" : "text-slate-600 font-medium"}`}>{g.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Section */}
      <div className="border-b border-slate-100 pb-5">
        <button 
          type="button"
          onClick={() => setOpenSection(prev => ({ ...prev, categories: !prev.categories }))}
          className="flex items-center justify-between w-full font-bold text-xs text-[#111111] uppercase tracking-wider py-2 hover:text-[#666666] transition-colors"
        >
          <span>Danh mục</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSection.categories ? "rotate-180" : ""}`} />
        </button>
        
        {openSection.categories && (
          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin animate-in fade-in slide-in-from-top-1 duration-200">
            <button
              type="button"
              onClick={() => { setCategoryId(null); setPage(0); }}
              className="flex items-center gap-3 w-full text-left text-sm py-1 text-slate-700 hover:text-[#111111] transition-colors group"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                !categoryId 
                  ? "border-black bg-black text-white" 
                  : "border-slate-300 bg-white group-hover:border-slate-400"
              }`}>
                {!categoryId && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span className={`text-sm ${!categoryId ? "font-semibold text-black" : "text-slate-600 font-medium"}`}>Tất cả danh mục</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setCategoryId(c.id); setPage(0); }}
                className="flex items-center gap-3 w-full text-left text-sm py-1 text-slate-700 hover:text-[#111111] transition-colors group"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  categoryId === c.id 
                    ? "border-black bg-black text-white" 
                    : "border-slate-300 bg-white group-hover:border-slate-400"
                }`}>
                  {categoryId === c.id && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className={`text-sm ${categoryId === c.id ? "font-semibold text-black" : "text-slate-600 font-medium"}`}>{c.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color Section */}
      <div className="border-b border-slate-100 pb-5">
        <button 
          type="button"
          onClick={() => setOpenSection(prev => ({ ...prev, colors: !prev.colors }))}
          className="flex items-center justify-between w-full font-bold text-xs text-[#111111] uppercase tracking-wider py-2 hover:text-[#666666] transition-colors"
        >
          <span>Màu sắc</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSection.colors ? "rotate-180" : ""}`} />
        </button>
        {openSection.colors && (
          <div className="mt-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            {Object.entries(COLOR_MAP).map(([colorName, colorHex]) => {
              const isSelected = selectedColor === colorName;
              return (
                <button
                  key={colorName}
                  type="button"
                  onClick={() => {
                    setSelectedColor(isSelected ? null : colorName);
                    setPage(0);
                  }}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                    isSelected ? "border-black scale-105 ring-2 ring-offset-1 ring-black/30" : "border-slate-200 hover:scale-105"
                  }`}
                  style={{ padding: '2px' }}
                  title={colorName}
                >
                  <span
                    className="w-full h-full rounded-full border border-black/10"
                    style={{ backgroundColor: colorHex }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Filter Section */}
      <div className="border-b border-slate-100 pb-5">
        <button 
          type="button"
          onClick={() => setOpenSection(prev => ({ ...prev, price: !prev.price }))}
          className="flex items-center justify-between w-full font-bold text-xs text-[#111111] uppercase tracking-wider py-2 hover:text-[#666666] transition-colors"
        >
          <span>Khoảng giá</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSection.price ? "rotate-180" : ""}`} />
        </button>

        {openSection.price && (
          <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="space-y-2">
              {PRICE_RANGES.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePriceRange(i)}
                  className="flex items-center gap-3 w-full text-left text-sm py-1 text-slate-700 hover:text-[#111111] transition-colors group"
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    selectedPriceIdx === i 
                      ? "border-[#111111] bg-white text-[#111111]" 
                      : "border-slate-300 bg-white group-hover:border-slate-400"
                  }`}>
                    {selectedPriceIdx === i && <div className="w-2 h-2 rounded-full bg-black" />}
                  </div>
                  <span className={`text-sm ${selectedPriceIdx === i ? "font-semibold text-black" : "text-slate-600 font-medium"}`}>{r.label}</span>
                </button>
              ))}
            </div>

            {/* Custom Price Range Input */}
            <form onSubmit={handleCustomPriceApply} className="pt-3.5 border-t border-dashed border-slate-200">
              <p className="text-[11px] text-slate-400 font-bold mb-2 uppercase tracking-wider">Tự nhập khoảng giá</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Tối thiểu"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                />
                <span className="text-slate-400 text-xs">—</span>
                <input
                  type="number"
                  placeholder="Tối đa"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full h-10 mt-3 bg-black hover:bg-black/90 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-[0.98]"
              >
                Áp dụng
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Size Section */}
      <div className="border-b border-slate-100 pb-5">
        <button 
          type="button"
          onClick={() => setOpenSection(prev => ({ ...prev, sizes: !prev.sizes }))}
          className="flex items-center justify-between w-full font-bold text-xs text-[#111111] uppercase tracking-wider py-2 hover:text-[#666666] transition-colors"
        >
          <span>Kích thước</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSection.sizes ? "rotate-180" : ""}`} />
        </button>
        {openSection.sizes && (
          <div className="mt-4 grid grid-cols-4 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            {["S", "M", "L", "XL", "2XL", "3XL"].map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setSelectedSize(isSelected ? null : size);
                    setPage(0);
                  }}
                  className={`h-9 border text-xs font-semibold rounded-lg flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-black bg-black text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:text-black"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Brands Section */}
      {brands.length > 0 && (
        <div className="border-b border-slate-100 pb-5">
          <button 
            type="button"
            onClick={() => setOpenSection(prev => ({ ...prev, brands: !prev.brands }))}
            className="flex items-center justify-between w-full font-bold text-xs text-[#111111] uppercase tracking-wider py-2 hover:text-[#666666] transition-colors"
          >
            <span>Thương hiệu</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSection.brands ? "rotate-180" : ""}`} />
          </button>

          {openSection.brands && (
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin animate-in fade-in slide-in-from-top-1 duration-200">
              <button
                type="button"
                onClick={() => { setBrandId(null); setPage(0); }}
                className="flex items-center gap-3 w-full text-left text-sm py-1 text-slate-700 hover:text-[#111111] transition-colors group"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  !brandId 
                    ? "border-black bg-black text-white" 
                    : "border-slate-300 bg-white group-hover:border-slate-400"
                }`}>
                  {!brandId && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className={`text-sm ${!brandId ? "font-semibold text-black" : "text-slate-600 font-medium"}`}>Tất cả thương hiệu</span>
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => { setBrandId(b.id); setPage(0); }}
                  className="flex items-center gap-3 w-full text-left text-sm py-1 text-slate-700 hover:text-[#111111] transition-colors group"
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    brandId === b.id 
                      ? "border-black bg-black text-white" 
                      : "border-slate-300 bg-white group-hover:border-slate-400"
                  }`}>
                    {brandId === b.id && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span className={`text-sm ${brandId === b.id ? "font-semibold text-black" : "text-slate-600 font-medium"}`}>{b.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Availability Section */}
      <div className="border-b border-slate-100 pb-5">
        <button 
          type="button"
          onClick={() => setOpenSection(prev => ({ ...prev, availability: !prev.availability }))}
          className="flex items-center justify-between w-full font-bold text-xs text-[#111111] uppercase tracking-wider py-2 hover:text-[#666666] transition-colors"
        >
          <span>Trạng thái</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSection.availability ? "rotate-180" : ""}`} />
        </button>
        {openSection.availability && (
          <div className="mt-4 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
            <button
              type="button"
              onClick={() => { setInStockOnly(!inStockOnly); setPage(0); }}
              className="flex items-center gap-3 w-full text-left text-sm py-1.5 text-slate-700 hover:text-[#111111] transition-colors group"
            >
              <div className={`w-8 h-4 rounded-full p-0.5 transition-all duration-200 flex items-center ${
                inStockOnly ? "bg-black" : "bg-slate-200"
              }`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-all duration-200 ${
                  inStockOnly ? "translate-x-4" : "translate-x-0"
                }`} />
              </div>
              <span className={`text-sm ${inStockOnly ? "font-semibold text-black" : "text-slate-600 font-medium"}`}>Chỉ hiển thị còn hàng</span>
            </button>
          </div>
        )}
      </div>

      {/* Special Offers Section */}
      <div className="border-b border-slate-100 pb-5">
        <button 
          type="button"
          onClick={() => setOpenSection(prev => ({ ...prev, offers: !prev.offers }))}
          className="flex items-center justify-between w-full font-bold text-xs text-[#111111] uppercase tracking-wider py-2 hover:text-[#666666] transition-colors"
        >
          <span>Khuyến mãi</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSection.offers ? "rotate-180" : ""}`} />
        </button>
        
        {openSection.offers && (
          <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <button
              type="button"
              onClick={() => { setMinDiscountPercent(minDiscountPercent === 1 ? null : 1); setPage(0); }}
              className="flex items-center gap-3 w-full text-left text-sm py-1 text-slate-700 hover:text-[#111111] transition-colors group"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                minDiscountPercent === 1 
                  ? "border-[#E53E3E] bg-[#E53E3E] text-white" 
                  : "border-slate-300 bg-white group-hover:border-slate-400"
              }`}>
                {minDiscountPercent === 1 && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span className={`text-sm ${minDiscountPercent === 1 ? "font-semibold text-[#E53E3E]" : "text-slate-600 font-medium"}`}>Đang giảm giá</span>
            </button>
          </div>
        )}
      </div>

      {/* Reset all button inside sidebar */}
      {activeFiltersCount > 0 && (
        <button
          type="button"
          onClick={handleClearAllFilters}
          className="flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-[0.98]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại bộ lọc</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      
      {/* ── HEADER TITLE BLOCK (YODY Style) ── */}
      <div className="bg-white border-b border-slate-100 py-6 md:py-8">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-black transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">New Arrival - Hàng mới về</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            New Arrival - Hàng mới về
          </h1>
        </div>
      </div>

      {/* ── INTERACTIVE CONTROLS BAR (YODY Style) ── */}
      <div className="sticky top-[64px] z-30 bg-white border-b border-slate-100 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Left: Quick sort tabs & Search */}
          <div className="flex items-center gap-6 flex-1 min-w-0">
            {/* Quick Sort Tabs (Desktop only) */}
            <div className="hidden md:flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              {SORT_OPTIONS.map((o) => {
                const isActive = sort === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => { setSort(o.value); setPage(0); }}
                    className={`pb-1 border-b-2 transition-all ${
                      isActive 
                        ? "border-[#fcaf17] text-black font-extrabold" 
                        : "border-transparent hover:text-black"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>

            {/* Subtle Search Bar inside controls bar */}
            <div className="relative flex-1 max-w-xs">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm kiếm..."
                defaultValue={search}
                onChange={(e) => {
                  const val = e.target.value;
                  const handler = setTimeout(() => {
                    setSearch(val);
                    setPage(0);
                  }, 400);
                  return () => clearTimeout(handler);
                }}
                className="w-full h-9 pl-9 pr-8 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:bg-white focus:border-black transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              {search && (
                <button 
                  type="button"
                  onClick={() => { setSearch(""); if (searchInputRef.current) searchInputRef.current.value = ""; }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300 transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Grid switcher & Filter Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Grid Layout Toggle (Desktop) */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button 
                type="button"
                onClick={() => setCols(3)}
                className={`p-1.5 rounded-lg transition-all ${cols === 3 ? "bg-white text-slate-900 shadow-xs" : "text-slate-400 hover:text-slate-600"}`}
                title="Lưới 3 cột"
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => setCols(4)}
                className={`p-1.5 rounded-lg transition-all ${cols === 4 ? "bg-white text-slate-900 shadow-xs" : "text-slate-400 hover:text-slate-600"}`}
                title="Lưới 4 cột"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Trigger Button (YODY Style - Open Drawer) */}
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="flex items-center justify-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 px-4 h-9 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Lọc</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#fcaf17] text-black text-[9px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* ── MAIN LAYOUT (Spacious & Clean) ── */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        
        {/* Active Filters chips bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 animate-in fade-in duration-200">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">Đang áp dụng:</span>
            
            {/* Category Chip */}
            {categoryId && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 font-medium shadow-xs">
                <span>Mục: {categories.find(c => c.id === categoryId)?.name}</span>
                <button type="button" onClick={() => setCategoryId(null)} className="hover:text-red-500 transition-colors ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Brand Chip */}
            {brandId && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 font-medium shadow-xs">
                <span>Hiệu: {brands.find(b => b.id === brandId)?.name}</span>
                <button type="button" onClick={() => setBrandId(null)} className="hover:text-red-500 transition-colors ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Gender Chip */}
            {gender && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 font-medium shadow-xs">
                <span>Giới tính: {GENDER_OPTIONS.find(g => g.value === gender)?.label}</span>
                <button type="button" onClick={() => setGender("")} className="hover:text-red-500 transition-colors ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Discount Chip */}
            {minDiscountPercent !== null && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-100 rounded-full text-xs text-red-600 font-medium shadow-xs">
                <span>Đang giảm giá</span>
                <button type="button" onClick={() => setMinDiscountPercent(null)} className="hover:text-red-500 transition-colors ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Price Chip */}
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 font-medium shadow-xs">
                <span>
                  Giá: {minPrice && maxPrice 
                    ? `${formatPrice(parseInt(minPrice))} - ${formatPrice(parseInt(maxPrice))}` 
                    : minPrice 
                      ? `> ${formatPrice(parseInt(minPrice))}` 
                      : `< ${formatPrice(parseInt(maxPrice))}`}
                </span>
                <button 
                  type="button"
                  onClick={() => { 
                    setMinPrice(""); 
                    setMaxPrice(""); 
                    setSelectedPriceIdx(null); 
                    setMinPriceInput(""); 
                    setMaxPriceInput(""); 
                  }} 
                  className="hover:text-red-500 transition-colors ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Color Chip */}
            {selectedColor && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 font-medium shadow-xs">
                <span>Màu: {selectedColor}</span>
                <button type="button" onClick={() => setSelectedColor(null)} className="hover:text-red-500 transition-colors ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Size Chip */}
            {selectedSize && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 font-medium shadow-xs">
                <span>Size: {selectedSize}</span>
                <button type="button" onClick={() => setSelectedSize(null)} className="hover:text-red-500 transition-colors ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Availability Chip */}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 font-medium shadow-xs">
                <span>Còn hàng</span>
                <button type="button" onClick={() => setInStockOnly(false)} className="hover:text-red-500 transition-colors ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Search query Chip */}
            {search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 font-medium shadow-xs">
                <span>Tìm: &quot;{search}&quot;</span>
                <button type="button" onClick={() => { setSearch(""); if (searchInputRef.current) searchInputRef.current.value = ""; }} className="hover:text-red-500 transition-colors ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Clear all triggers */}
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-xs text-slate-500 hover:text-black font-bold underline decoration-dotted transition-colors ml-1"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}

        {/* Skeletons Loading view */}
        {loading ? (
          <div className={`grid grid-cols-2 ${cols === 3 ? "md:grid-cols-3 lg:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-4"} gap-x-4 gap-y-8`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] bg-slate-100 rounded-2xl animate-pulse" />
                <div className="h-4 bg-slate-100 rounded-full w-2/3 animate-pulse" />
                <div className="h-3 bg-slate-100 rounded-full w-1/3 animate-pulse" />
                <div className="h-6 bg-slate-100 rounded-full w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center p-8">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-5">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Không tìm thấy sản phẩm</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-6">Không có kết quả nào trùng với các bộ lọc hiện tại của bạn. Thử thiết lập lại bộ lọc.</p>
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="px-6 py-3 bg-black text-white hover:bg-[#fcaf17] hover:text-black text-xs font-bold rounded-full transition-all shadow-sm"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        ) : (
          
          /* Products Grid view */
          <div className={`grid grid-cols-2 ${cols === 3 ? "md:grid-cols-3 lg:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-4"} gap-x-4 gap-y-8`}>
            {filteredProducts.map((product) => {
              const discount = product.salePrice
                ? Math.round((1 - product.salePrice / product.basePrice) * 100)
                : null;
              const firstVariant = product.variants?.[0];
              const isHovered = hoveredId === product.id;

                  const uniqueColors = Array.from(
                    new Map(
                      product.variants
                        ?.filter((v) => v.color)
                        .map((v) => [v.color, v.colorHex]) || []
                    ).entries()
                  );

                  return (
                    <article
                      key={product.id}
                      className="group flex flex-col justify-between h-full"
                      onMouseEnter={() => setHoveredId(product.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <div>
                        {/* Thumbnail Image Container */}
                        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 shadow-xs group">
                          <Link href={`/product/${product.slug}`} className="block w-full h-full">
                            <img
                              src={product.thumbnailUrl || `https://placehold.co/400x500/FAFAFA/CCCCCC?text=${encodeURIComponent(product.name.slice(0, 12))}`}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                            />
                          </Link>
                          
                          {/* Discount Badge */}
                          {discount && (
                            <span className="absolute top-3 left-3 bg-[#FF2D37] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm z-10">
                              -{discount}%
                            </span>
                          )}

                          {/* Wishlist Button */}
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
                            className={`absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xs transition-all z-10 ${
                              wishlistProductIds.includes(product.id) ? "text-red-500 scale-105" : "text-slate-400 hover:text-red-500 hover:scale-105"
                            }`}
                            title="Yêu thích"
                          >
                            <Heart className={`w-3.5 h-3.5 transition-all ${wishlistProductIds.includes(product.id) ? "fill-current" : ""}`} />
                          </button>

                          {/* Quick Action Floating Overlay */}
                          <div className={`absolute bottom-3 left-3 right-3 transition-all duration-300 flex gap-1.5 z-10 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>
                            {firstVariant ? (
                              <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); addItem(firstVariant.id); }}
                                className="flex-1 h-8.5 bg-black hover:bg-black/80 text-white text-[10px] font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1 active:scale-[0.97]"
                              >
                                <ShoppingBag className="w-3 h-3" />
                                <span>Thêm vào giỏ</span>
                              </button>
                            ) : null}
                            <Link
                              href={`/product/${product.slug}`}
                              className="w-8.5 h-8.5 bg-white hover:bg-black text-slate-700 hover:text-white rounded-xl transition-all shadow-md flex items-center justify-center active:scale-[0.97]"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>

                        {/* Title */}
                        <Link href={`/product/${product.slug}`} className="block mt-3">
                          <h3 className="text-xs md:text-sm text-gray-800 font-semibold leading-snug line-clamp-2 hover:text-black transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                      </div>

                      <div className="mt-2">
                        {/* Price & Discount */}
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-sm md:text-base font-black text-gray-900">
                            {product.effectivePrice.toLocaleString("vi-VN")}đ
                          </span>
                          {product.salePrice && (
                            <span className="text-[11px] text-gray-400 line-through font-medium">
                              {product.basePrice.toLocaleString("vi-VN")}đ
                            </span>
                          )}
                        </div>

                        {/* Swatches (Colors preview) */}
                        {uniqueColors.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap mt-2.5">
                            {uniqueColors.slice(0, 5).map(([colorName, colorHex], idx) => {
                              const nameStr = colorName as string;
                              const cssColor = colorHex || COLOR_MAP[nameStr] || "#CCCCCC";
                              return (
                                <span 
                                  key={idx}
                                  className="w-2.5 h-2.5 rounded-full border border-slate-200 shadow-xs block cursor-pointer transition-transform hover:scale-110"
                                  style={{ backgroundColor: cssColor }}
                                  title={nameStr}
                                />
                              );
                            })}
                            {uniqueColors.length > 5 && (
                              <span className="text-[9px] text-slate-400 font-bold ml-0.5">+{uniqueColors.length - 5}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-16 border-t border-slate-100 pt-8">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="w-9 h-9 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:border-black hover:text-black disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${
                  page === i 
                    ? "bg-black text-white shadow-sm" 
                    : "border border-slate-200 text-slate-600 hover:border-black hover:text-black"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              disabled={page === totalPages - 1}
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              className="w-9 h-9 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:border-black hover:text-black disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* ── DRAWERS: FILTER SIDEBAR (YODY Style Drawer) ── */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
            onClick={() => setFilterOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-500" /> Bộ lọc sản phẩm
              </h2>
              <button 
                type="button"
                onClick={() => setFilterOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-black transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              <FilterSidebarContent />
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="flex-1 h-11 border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
              >
                Xóa lọc
              </button>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="flex-1 h-11 bg-[#fcaf17] hover:bg-[#e59e10] text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
