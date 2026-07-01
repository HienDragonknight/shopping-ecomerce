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
  variants: { id: number; size: string | null; color: string | null; stockQty: number }[];
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
        .then((r) => setWishlistProductIds(r.data.data?.map((item: any) => item.product.id) || []))
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

  // Left Sidebar Component Content
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Gender Section */}
      <div className="border-b border-slate-100 pb-5">
        <button 
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
          onClick={() => setOpenSection(prev => ({ ...prev, categories: !prev.categories }))}
          className="flex items-center justify-between w-full font-bold text-xs text-[#111111] uppercase tracking-wider py-2 hover:text-[#666666] transition-colors"
        >
          <span>Danh mục</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSection.categories ? "rotate-180" : ""}`} />
        </button>
        
        {openSection.categories && (
          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin animate-in fade-in slide-in-from-top-1 duration-200">
            <button
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

      {/* Price Filter Section */}
      <div className="border-b border-slate-100 pb-5">
        <button 
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
                  className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                />
                <span className="text-slate-400 text-xs">—</span>
                <input
                  type="number"
                  placeholder="Tối đa"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
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

      {/* Brands Section */}
      {brands.length > 0 && (
        <div className="border-b border-slate-100 pb-5">
          <button 
            onClick={() => setOpenSection(prev => ({ ...prev, brands: !prev.brands }))}
            className="flex items-center justify-between w-full font-bold text-xs text-[#111111] uppercase tracking-wider py-2 hover:text-[#666666] transition-colors"
          >
            <span>Thương hiệu</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSection.brands ? "rotate-180" : ""}`} />
          </button>

          {openSection.brands && (
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin animate-in fade-in slide-in-from-top-1 duration-200">
              <button
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

      {/* Color Section */}
      <div className="border-b border-slate-100 pb-5">
        <button 
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
                  onClick={() => {
                    setSelectedColor(isSelected ? null : colorName);
                    setPage(0);
                  }}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                    isSelected ? "border-black scale-105" : "border-slate-200 hover:scale-105"
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

      {/* Size Section */}
      <div className="border-b border-slate-100 pb-5">
        <button 
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

      {/* Availability Section */}
      <div className="border-b border-slate-100 pb-5">
        <button 
          onClick={() => setOpenSection(prev => ({ ...prev, availability: !prev.availability }))}
          className="flex items-center justify-between w-full font-bold text-xs text-[#111111] uppercase tracking-wider py-2 hover:text-[#666666] transition-colors"
        >
          <span>Trạng thái</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSection.availability ? "rotate-180" : ""}`} />
        </button>
        {openSection.availability && (
          <div className="mt-4 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
            <button
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
          onClick={() => setOpenSection(prev => ({ ...prev, offers: !prev.offers }))}
          className="flex items-center justify-between w-full font-bold text-xs text-[#111111] uppercase tracking-wider py-2 hover:text-[#666666] transition-colors"
        >
          <span>Khuyến mãi</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSection.offers ? "rotate-180" : ""}`} />
        </button>
        
        {openSection.offers && (
          <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <button
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
    <div className="min-h-screen bg-slate-50/50">
      {/* ── HERO BANNER ── */}
      <div className="relative bg-slate-900 py-20 md:py-28 text-white overflow-hidden">
        {/* Glow decorations */}
        <div className="absolute top-0 right-0 w-[45%] h-full bg-gradient-to-l from-[#FCCE00]/10 to-transparent pointer-events-none" />
        <div className="absolute -top-40 right-20 w-[400px] h-[400px] bg-[#FCCE00]/5 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full filter blur-[100px] pointer-events-none" />
        
        <div className="yody-container relative z-10">
          <nav className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span className="text-slate-600">/</span>
            <span className="text-[#FCCE00] font-bold">Cửa hàng</span>
          </nav>
          
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-[#FCCE00] uppercase tracking-wider mb-5">
              ✨ BST Mới Nhất 2026
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight uppercase mb-6 leading-[1.05]">
              CỬA HÀNG THỜI TRANG
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light max-w-xl">
              Khám phá các sản phẩm thời trang cao cấp từ Vie'co. Thiết kế tối giản, chất liệu cao cấp và sự tỉ mỉ trong từng đường kim mũi chỉ.
            </p>
          </div>
          
          {/* Brand highlights info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/5 text-xs text-slate-400 font-semibold tracking-wider uppercase">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#FCCE00] rounded-full" />
              <span>Miễn phí vận chuyển &gt; 500k</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#FCCE00] rounded-full" />
              <span>Đổi trả trong 15 ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#FCCE00] rounded-full" />
              <span>100% Chất lượng cao</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#FCCE00] rounded-full" />
              <span>Chuẩn form dáng Việt</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY ACTIONS BAR ── */}
      <div className="sticky top-[64px] z-30 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 transition-all duration-300">
        <div className="yody-container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm sản phẩm theo tên..."
                defaultValue={search}
                onChange={(e) => {
                  const val = e.target.value;
                  const handler = setTimeout(() => {
                    setSearch(val);
                    setPage(0);
                  }, 400);
                  return () => clearTimeout(handler);
                }}
                className="w-full h-12 pl-12 pr-10 text-sm bg-white border border-slate-200/80 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-slate-400/70"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              {search && (
                <button 
                  onClick={() => { setSearch(""); if (searchInputRef.current) searchInputRef.current.value = ""; }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Grid options & Filter / Sort controls */}
            <div className="flex items-center justify-between sm:justify-end gap-4">
              
              {/* Product Count (Desktop) */}
              <span className="hidden md:inline text-xs text-slate-500 font-bold tracking-wider uppercase mr-2">
                Tổng: <span className="text-[#1A1A1A] font-extrabold">{loading ? "..." : filteredProducts.length}</span> sản phẩm
              </span>

              {/* Grid Layout Toggle */}
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
                <button 
                  onClick={() => setCols(3)}
                  className={`p-1.5 rounded-lg transition-all ${cols === 3 ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  title="Lưới 3 cột"
                >
                  <Grid2X2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setCols(4)}
                  className={`p-1.5 rounded-lg transition-all ${cols === 4 ? "bg-white text-[#1A1A1A] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  title="Lưới 4 cột"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>

              {/* Sorting Dropdown */}
              <div className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 h-11 text-sm">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(0); }}
                  className="bg-transparent pr-4 focus:outline-none text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Mobile Filter Trigger */}
              <button
                onClick={() => setFilterOpen(true)}
                className="md:hidden flex items-center justify-center gap-1.5 bg-slate-900 text-white px-5 h-11 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#FCCE00] hover:text-[#1A1A1A] transition-colors shadow-sm"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Bộ Lọc</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 xl:px-16 py-8 md:py-12 bg-[#FAFAFA]">
        <div className="flex gap-8">
          
          {/* Desktop Left Sidebar */}
          <aside className="hidden md:block w-64 shrink-0 bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] self-start sticky top-28">
            <FilterSidebar />
          </aside>

          {/* Catalog view */}
          <div className="flex-1 min-w-0">
            
            {/* Active Filters chips bar */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-[#666666] font-bold uppercase tracking-wider mr-1">Đang áp dụng:</span>
                
                {/* Category Chip */}
                {categoryId && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200/50 rounded-full text-xs text-[#111111] font-medium shadow-sm">
                    <span>Mục: {categories.find(c => c.id === categoryId)?.name}</span>
                    <button onClick={() => setCategoryId(null)} className="hover:text-red-500 transition-colors ml-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {/* Brand Chip */}
                {brandId && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200/50 rounded-full text-xs text-[#111111] font-medium shadow-sm">
                    <span>Hiệu: {brands.find(b => b.id === brandId)?.name}</span>
                    <button onClick={() => setBrandId(null)} className="hover:text-red-500 transition-colors ml-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {/* Gender Chip */}
                {gender && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200/50 rounded-full text-xs text-[#111111] font-medium shadow-sm">
                    <span>Giới tính: {GENDER_OPTIONS.find(g => g.value === gender)?.label}</span>
                    <button onClick={() => setGender("")} className="hover:text-red-500 transition-colors ml-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {/* Discount Chip */}
                {minDiscountPercent !== null && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 border border-red-100 rounded-full text-xs text-red-600 font-medium shadow-sm">
                    <span>Đang giảm giá</span>
                    <button onClick={() => setMinDiscountPercent(null)} className="hover:text-red-500 transition-colors ml-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {/* Price Chip */}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200/50 rounded-full text-xs text-[#111111] font-medium shadow-sm">
                    <span>
                      Giá: {minPrice && maxPrice 
                        ? `${formatPrice(parseInt(minPrice))} - ${formatPrice(parseInt(maxPrice))}` 
                        : minPrice 
                          ? `> ${formatPrice(parseInt(minPrice))}` 
                          : `< ${formatPrice(parseInt(maxPrice))}`}
                    </span>
                    <button 
                      onClick={() => { 
                        setMinPrice(""); 
                        setMaxPrice(""); 
                        setSelectedPriceIdx(null); 
                        setMinPriceInput(""); 
                        setMaxPriceInput(""); 
                      }} 
                      className="hover:text-red-500 transition-colors ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {/* Color Chip */}
                {selectedColor && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200/50 rounded-full text-xs text-[#111111] font-medium shadow-sm">
                    <span>Màu: {selectedColor}</span>
                    <button onClick={() => setSelectedColor(null)} className="hover:text-red-500 transition-colors ml-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {/* Size Chip */}
                {selectedSize && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200/50 rounded-full text-xs text-[#111111] font-medium shadow-sm">
                    <span>Size: {selectedSize}</span>
                    <button onClick={() => setSelectedSize(null)} className="hover:text-red-500 transition-colors ml-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {/* Availability Chip */}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200/50 rounded-full text-xs text-[#111111] font-medium shadow-sm">
                    <span>Còn hàng</span>
                    <button onClick={() => setInStockOnly(false)} className="hover:text-red-500 transition-colors ml-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {/* Search query Chip */}
                {search && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200/50 rounded-full text-xs text-[#111111] font-medium shadow-sm">
                    <span>Tìm: "{search}"</span>
                    <button onClick={() => { setSearch(""); if (searchInputRef.current) searchInputRef.current.value = ""; }} className="hover:text-red-500 transition-colors ml-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {/* Clear all triggers */}
                <button
                  onClick={handleClearAllFilters}
                  className="text-xs text-[#111111] hover:text-[#666666] font-bold underline decoration-dotted transition-colors ml-1"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}

            {/* Skeletons Loading view */}
            {loading ? (
              <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${cols === 3 ? "lg:grid-cols-3 xl:grid-cols-3" : "lg:grid-cols-4 xl:grid-cols-5"} gap-6`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border-none shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-4 space-y-4">
                    <div className="aspect-[4/5] bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-4 bg-slate-100 rounded-full w-2/3 animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded-full w-1/3 animate-pulse" />
                    <div className="h-6 bg-slate-100 rounded-full w-1/2 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-8">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-5">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Không tìm thấy sản phẩm</h3>
                <p className="text-xs text-slate-400 max-w-xs mb-6">Không có kết quả nào trùng với các bộ lọc hiện tại của bạn. Thử thiết lập lại bộ lọc.</p>
                <button
                  onClick={handleClearAllFilters}
                  className="px-6 py-3 bg-slate-900 text-white hover:bg-[#FCCE00] hover:text-[#1A1A1A] text-xs font-bold rounded-full transition-all shadow-sm"
                >
                  Xem tất cả sản phẩm
                </button>
              </div>
            ) : (
              
              /* Products Grid view */
              <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${cols === 3 ? "lg:grid-cols-3 xl:grid-cols-3" : "lg:grid-cols-4 xl:grid-cols-5"} gap-6`}>
                {filteredProducts.map((product) => {
                  const discount = product.salePrice
                    ? Math.round((1 - product.salePrice / product.basePrice) * 100)
                    : null;
                  const firstVariant = product.variants?.[0];
                  const isHovered = hoveredId === product.id;

                  // Extract color swatches and size swatches
                  const uniqueColors = Array.from(new Set(product.variants.map(v => v.color).filter(Boolean))) as string[];
                  const uniqueSizes = Array.from(new Set(product.variants.map(v => v.size).filter(Boolean))) as string[];

                  return (
                    <article
                      key={product.id}
                      className="group bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)] hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between h-full"
                      onMouseEnter={() => setHoveredId(product.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <div>
                        {/* Thumbnail Image Container */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-[#FAFAFA] group">
                          <Link href={`/product/${product.slug}`} className="block w-full h-full">
                            <img
                              src={product.thumbnailUrl || `https://placehold.co/400x500/FAFAFA/CCCCCC?text=${encodeURIComponent(product.name.slice(0, 12))}`}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                          </Link>
                          
                          {/* Badges */}
                          {discount && (
                            <span className="absolute top-3 left-3 bg-[#E53E3E] text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm z-10">
                              -{discount}%
                            </span>
                          )}

                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
                            className={`absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all z-10 ${
                              wishlistProductIds.includes(product.id) ? "text-red-500 scale-110" : "text-slate-400 hover:text-red-500 hover:scale-110"
                            }`}
                            title="Yêu thích"
                          >
                            <Heart className={`w-4 h-4 transition-all ${wishlistProductIds.includes(product.id) ? "fill-current" : ""}`} />
                          </button>

                          {/* Quick Action Floating Overlay */}
                          <div className={`absolute bottom-3 left-3 right-3 transition-all duration-300 flex gap-2 z-10 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>
                            {firstVariant ? (
                              <button
                                onClick={(e) => { e.preventDefault(); addItem(firstVariant.id); }}
                                className="flex-1 h-9 bg-black hover:bg-black/80 text-white text-[11px] font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-[0.97]"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Thêm vào giỏ</span>
                              </button>
                            ) : null}
                            <Link
                              href={`/product/${product.slug}`}
                              className="w-9 h-9 bg-white hover:bg-black text-slate-700 hover:text-white rounded-xl transition-all shadow-md flex items-center justify-center active:scale-[0.97]"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>

                        {/* Brand & Category info */}
                        <div className="pt-4 px-4 flex items-center justify-between">
                          <p className="text-[11px] text-[#888888] uppercase tracking-widest font-medium">
                            {product.brand?.name || product.category?.name || "Vie'co"}
                          </p>
                          {product.avgRating && product.reviewCount > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                              <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400" />
                              <span>{product.avgRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {/* Title link */}
                        <Link href={`/product/${product.slug}`} className="block mt-2 px-4">
                          <h3 className="text-base text-[#111111] font-semibold leading-snug line-clamp-2 hover:text-[#666666] transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                      </div>

                      <div className="p-4 pt-2">
                        {/* Swatches (Colors & Sizes preview) */}
                        <div className="flex items-center justify-between gap-2 mb-3.5">
                          {uniqueColors.length > 0 ? (
                            <div className="flex items-center gap-1 flex-wrap">
                              {uniqueColors.slice(0, 4).map((color, idx) => {
                                const cssColor = COLOR_MAP[color] || "#CCCCCC";
                                return (
                                  <span 
                                    key={idx}
                                    className="w-3 h-3 rounded-full border border-slate-200 shadow-sm block cursor-pointer transition-transform hover:scale-110"
                                    style={{ backgroundColor: cssColor }}
                                    title={color}
                                  />
                                );
                              })}
                              {uniqueColors.length > 4 && (
                                <span className="text-[9px] font-bold text-slate-400">+{uniqueColors.length - 4}</span>
                              )}
                            </div>
                          ) : <div />}

                          {uniqueSizes.length > 0 && (
                            <div className="flex gap-1 text-[9px] font-bold text-[#666666] uppercase">
                              {uniqueSizes.slice(0, 3).map((size, idx) => (
                                <span key={idx} className="bg-slate-100 px-1 py-0.5 rounded-sm">{size}</span>
                              ))}
                              {uniqueSizes.length > 3 && <span>+</span>}
                            </div>
                          )}
                        </div>

                        {/* Price Container */}
                        <div className="flex items-baseline gap-2 pt-2 border-t border-slate-50">
                          <span className="text-xl font-bold text-[#111111]">
                            {formatPrice(product.effectivePrice)}
                          </span>
                          {product.salePrice && (
                            <span className="text-xs text-[#999999] line-through font-medium">
                              {formatPrice(product.basePrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-16 pt-8 border-t border-slate-100">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-700 hover:bg-slate-900 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-10 h-10 rounded-full text-xs font-bold transition-all shadow-sm ${
                      page === i 
                        ? "bg-[#111111] text-white border border-[#111111]" 
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-[#111111]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-700 hover:bg-slate-900 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER ── */}
      {filterOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <div className="relative ml-auto w-80 bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-black uppercase tracking-[0.15em] text-[#1A1A1A]">Bộ lọc & Sắp xếp</h2>
              <button 
                onClick={() => setFilterOpen(false)} 
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <FilterSidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
