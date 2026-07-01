"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, Save, Plus, X, Tag, Box, RefreshCw, Image as ImageIcon, Trash2, ChevronDown, ChevronUp, Languages, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!productId);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<{
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    basePrice: string;
    salePrice: string;
    thumbnailUrl: string;
    isActive: boolean;
    isFeatured: boolean;
    weightGrams: number;
    categoryId: string;
    brandId: string;
    imageUrls: string[];
  }>({
    name: "",
    nameEn: "",
    description: "",
    descriptionEn: "",
    basePrice: "",
    salePrice: "",
    thumbnailUrl: "",
    isActive: true,
    isFeatured: false,
    weightGrams: 300,
    categoryId: "",
    brandId: "",
    imageUrls: [],
  });

  // Bilingual editor state
  const [bilingualTab, setBilingualTab] = useState<"vi" | "en">("vi");
  const [translatingName, setTranslatingName] = useState(false);
  const [translatingDesc, setTranslatingDesc] = useState(false);
  const [translateNameDone, setTranslateNameDone] = useState(false);
  const [translateDescDone, setTranslateDescDone] = useState(false);

  const [variants, setVariants] = useState<any[]>([
    { size: "S", color: "Đen", colorHex: "#000000", sku: "", stockQty: 10, priceAdjustment: 0, imageUrls: [] }
  ]);

  // Track which variant has its image editor expanded
  const [expandedVariantIndex, setExpandedVariantIndex] = useState<number | null>(null);
  
  // Temp inputs for adding images
  const [newProductImg, setNewProductImg] = useState("");
  const [newVariantImg, setNewVariantImg] = useState<string[]>([]);

  // Load categories + brands with sessionStorage cache (faster on revisit)
  useEffect(() => {
    const cachedCats = sessionStorage.getItem("admin_categories");
    const cachedBrands = sessionStorage.getItem("admin_brands");

    const catPromise = cachedCats
      ? Promise.resolve(JSON.parse(cachedCats))
      : api.get("/categories").then(r => {
          const data = r.data.data || [];
          sessionStorage.setItem("admin_categories", JSON.stringify(data));
          return data;
        }).catch(() => []);

    const brandPromise = cachedBrands
      ? Promise.resolve(JSON.parse(cachedBrands))
      : api.get("/brands").then(r => {
          const data = r.data.data || [];
          sessionStorage.setItem("admin_brands", JSON.stringify(data));
          return data;
        }).catch(() => []);

    Promise.all([catPromise, brandPromise]).then(([cats, brands]) => {
      setCategories(cats);
      setBrands(brands);
      if (!productId) setNewVariantImg(new Array(1).fill(""));
    });
  }, [productId]);

  // Load product data separately — avoids blocking on cat/brand fetch
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    api.get(`/admin/products/${productId}`)
      .then(res => {
        const p = res.data.data;
        if (!p) { setError("Không thể tải thông tin sản phẩm"); return; }
        setForm({
          name: p.nameVi || p.name || "",
          nameEn: p.nameEn || "",
          description: p.descriptionVi || p.description || "",
          descriptionEn: p.descriptionEn || "",
          basePrice: p.basePrice ? p.basePrice.toString() : "",
          salePrice: p.salePrice ? p.salePrice.toString() : "",
          thumbnailUrl: p.thumbnailUrl || "",
          isActive: p.isActive !== false,
          isFeatured: !!p.isFeatured,
          weightGrams: p.weightGrams || 300,
          categoryId: p.category?.id ? p.category.id.toString() : "",
          brandId: p.brand?.id ? p.brand.id.toString() : "",
          imageUrls: p.imageUrls || [],
        });
        const loadedVariants = p.variants && p.variants.length > 0
          ? p.variants.map((v: { imageUrls?: string | string[] | null; [key: string]: unknown }) => ({
              ...v,
              imageUrls: Array.isArray(v.imageUrls) ? v.imageUrls : (v.imageUrls ? [v.imageUrls] : [])
            }))
          : [{ size: "S", color: "Đen", colorHex: "#000000", sku: "", stockQty: 10, priceAdjustment: 0, imageUrls: [] }];
        setVariants(loadedVariants);
        setNewVariantImg(new Array(loadedVariants.length).fill(""));
      })
      .catch(() => setError("Lỗi kết nối. Vui lòng thử lại."))
      .finally(() => setLoading(false));
  }, [productId]);


  const addVariant = () => {
    setVariants([...variants, { size: "M", color: "Đen", colorHex: "#000000", sku: "", stockQty: 10, priceAdjustment: 0, imageUrls: [] }]);
    setNewVariantImg([...newVariantImg, ""]);
  };

  const removeVariant = (i: number) => {
    setVariants(variants.filter((_, idx) => idx !== i));
    setNewVariantImg(newVariantImg.filter((_, idx) => idx !== i));
    if (expandedVariantIndex === i) setExpandedVariantIndex(null);
  };

  const updateVariant = (i: number, field: string, value: any) => {
    setVariants(variants.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  };

  // Add image to product gallery
  const addProductImage = () => {
    if (!newProductImg.trim()) return;
    setForm(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, newProductImg.trim()]
    }));
    // Auto set thumbnail if currently empty
    if (!form.thumbnailUrl) {
      setForm(prev => ({ ...prev, thumbnailUrl: newProductImg.trim() }));
    }
    setNewProductImg("");
  };

  const removeProductImage = (idx: number) => {
    setForm(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== idx)
    }));
  };

  // Add image to a specific variant
  const addVariantImage = (vIdx: number) => {
    const url = newVariantImg[vIdx]?.trim();
    if (!url) return;

    setVariants(prev => prev.map((v, idx) => {
      if (idx === vIdx) {
        return {
          ...v,
          imageUrls: [...(v.imageUrls || []), url]
        };
      }
      return v;
    }));

    setNewVariantImg(prev => prev.map((val, idx) => idx === vIdx ? "" : val));
  };

  const removeVariantImage = (vIdx: number, imgIdx: number) => {
    setVariants(prev => prev.map((v, idx) => {
      if (idx === vIdx) {
        return {
          ...v,
          imageUrls: (v.imageUrls || []).filter((_: any, i: number) => i !== imgIdx)
        };
      }
      return v;
    }));
  };

  // Auto-translate name VI → EN
  const translateName = async () => {
    if (!form.name.trim()) return;
    setTranslatingName(true);
    setTranslateNameDone(false);
    try {
      const res = await api.post("/admin/ai/translate", {
        text: form.name,
        targetLang: "en",
        context: "product name for a Vietnamese fashion brand",
      });
      const translated: string = res.data.data?.translation || "";
      if (translated) {
        setForm(prev => ({ ...prev, nameEn: translated }));
        setTranslateNameDone(true);
        setTimeout(() => setTranslateNameDone(false), 3000);
      }
    } catch {
      setError("Không thể dịch tên sản phẩm. Vui lòng thử lại.");
    } finally {
      setTranslatingName(false);
    }
  };

  // Auto-translate description VI → EN
  const translateDesc = async () => {
    if (!form.description.trim()) return;
    setTranslatingDesc(true);
    setTranslateDescDone(false);
    try {
      const res = await api.post("/admin/ai/translate", {
        text: form.description,
        targetLang: "en",
        context: "product description for a Vietnamese fashion brand",
      });
      const translated: string = res.data.data?.translation || "";
      if (translated) {
        setForm(prev => ({ ...prev, descriptionEn: translated }));
        setTranslateDescDone(true);
        setTimeout(() => setTranslateDescDone(false), 3000);
      }
    } catch {
      setError("Không thể dịch mô tả sản phẩm. Vui lòng thử lại.");
    } finally {
      setTranslatingDesc(false);
    }
  };

  // Auto SKU generator helper
  const generateSkus = () => {
    if (!form.name) {
      setError("Nhập tên sản phẩm trước khi tạo SKU tự động");
      return;
    }
    const baseCode = form.name
      .split(" ")
      .map(w => w[0])
      .join("")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    
    setVariants(variants.map((v, i) => {
      const sizeStr = v.size ? v.size.toUpperCase() : "OS";
      const colorStr = v.color ? v.color.substring(0, 3).toUpperCase() : "GEN";
      const sku = `${baseCode}-${colorStr}-${sizeStr}-${Math.floor(100 + Math.random() * 900)}`;
      return { ...v, sku };
    }));
    setSuccess("Đã sinh mã SKU tự động!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (variants.some(v => !v.sku)) {
      setError("Vui lòng nhập SKU cho tất cả biến thể!");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...form,
        basePrice: parseFloat(form.basePrice),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        brandId: form.brandId ? parseInt(form.brandId) : null,
        variants,
      };

      if (productId) {
        await api.put(`/admin/products/${productId}`, payload);
        setSuccess("Cập nhật sản phẩm thành công!");
      } else {
        await api.post("/admin/products", payload);
        setSuccess("Tạo sản phẩm mới thành công!");
      }
      setTimeout(() => {
        router.push("/admin/products");
      }, 1000);
    } catch (e: any) {
      setError(e.response?.data?.message || "Lỗi khi lưu sản phẩm. Vui lòng kiểm tra lại dữ liệu.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/30 focus:border-[#1A1A1A] bg-slate-50 hover:bg-slate-50/50 focus:bg-white transition-all";
  const labelCls = "text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A1A1A]" />
        <p className="mt-4 text-sm text-slate-500">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              {productId ? "Chi tiết sản phẩm" : "Tạo sản phẩm mới"}
            </h1>
            <p className="text-xs text-slate-400">
              {productId ? `Đang chỉnh sửa mã #${productId}` : "Thêm sản phẩm mới vào danh mục bán hàng"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Tag size={16} className="text-[#1A1A1A]" /> Thông tin cơ bản
            </h2>

            <div className="space-y-1.5">
              <label className={labelCls}>Tên sản phẩm *</label>
              <input
                required
                placeholder="Nhập tên sản phẩm (Ví dụ: Áo khoác phao nam có mũ)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Danh mục</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className={`${inputCls} bg-white`}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={labelCls}>Thương hiệu</label>
                <select
                  value={form.brandId}
                  onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                  className={`${inputCls} bg-white`}
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>Mô tả chi tiết</label>
              <textarea
                placeholder="Mô tả chất liệu, thiết kế, hướng dẫn chọn size..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/30 focus:border-[#1A1A1A] bg-slate-50 focus:bg-white resize-none transition-all"
              />
            </div>
          </div>

          {/* ─── BILINGUAL CONTENT ─────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-[#1A1A1A]/30 p-6 shadow-sm space-y-4">
            {/* Header with tab switcher */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Languages size={16} className="text-[#1A1A1A]" />
                Nội dung song ngữ
                <span className="text-[10px] font-normal text-slate-400">— dùng cho khách quốc tế</span>
              </h2>
              {/* VI / EN tabs */}
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
                <button
                  type="button"
                  onClick={() => setBilingualTab("vi")}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    bilingualTab === "vi" ? "bg-white text-[#1A1A1A] shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  🇻🇳 Tiếng Việt
                </button>
                <button
                  type="button"
                  onClick={() => setBilingualTab("en")}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    bilingualTab === "en" ? "bg-white text-[#1A1A1A] shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {bilingualTab === "vi" ? (
              /* VI tab — read-only preview linked to main form above */
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>Tên sản phẩm (VI)</label>
                  <div className="w-full h-11 px-4 flex items-center border border-slate-100 rounded-xl bg-slate-50 text-sm text-slate-700">
                    {form.name || <span className="text-slate-300 italic">Chưa nhập tên ở phần trên...</span>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Mô tả (VI)</label>
                  <div className="w-full min-h-[80px] px-4 py-3 border border-slate-100 rounded-xl bg-slate-50 text-sm text-slate-600 whitespace-pre-wrap">
                    {form.description || <span className="text-slate-300 italic">Chưa nhập mô tả ở phần trên...</span>}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  💡 Chỉnh sửa nội dung tiếng Việt trong card <strong>Thông tin cơ bản</strong> ở trên.
                </p>
              </div>
            ) : (
              /* EN tab — editable fields + AI translate buttons */
              <div className="space-y-4">
                {/* Name EN */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={labelCls}>Product name (EN)</label>
                    <button
                      type="button"
                      onClick={translateName}
                      disabled={translatingName || !form.name.trim()}
                      className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      {translatingName ? (
                        <><Loader2 size={11} className="animate-spin" /> Đang dịch...</>
                      ) : translateNameDone ? (
                        <><CheckCircle size={11} className="text-emerald-500" /> Đã dịch!</>
                      ) : (
                        <><Languages size={11} /> AI Dịch tự động</>
                      )}
                    </button>
                  </div>
                  <input
                    placeholder="Enter product name in English..."
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    className={inputCls}
                  />
                  {form.name && (
                    <p className="text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-500">VI:</span> {form.name}
                    </p>
                  )}
                </div>

                {/* Description EN */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={labelCls}>Description (EN)</label>
                    <button
                      type="button"
                      onClick={translateDesc}
                      disabled={translatingDesc || !form.description.trim()}
                      className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      {translatingDesc ? (
                        <><Loader2 size={11} className="animate-spin" /> Đang dịch...</>
                      ) : translateDescDone ? (
                        <><CheckCircle size={11} className="text-emerald-500" /> Đã dịch!</>
                      ) : (
                        <><Languages size={11} /> AI Dịch tự động</>
                      )}
                    </button>
                  </div>
                  <textarea
                    placeholder="Enter product description in English..."
                    value={form.descriptionEn}
                    onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/30 focus:border-[#1A1A1A] bg-slate-50 focus:bg-white resize-none transition-all"
                  />
                </div>

                {/* Status indicator */}
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                  form.nameEn && form.descriptionEn
                    ? "bg-emerald-50 border-emerald-100"
                    : "bg-amber-50 border-amber-100"
                }`}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${form.nameEn && form.descriptionEn ? "bg-emerald-400" : "bg-amber-400"}`} />
                  <p className="text-[11px] text-slate-600">
                    {form.nameEn && form.descriptionEn
                      ? "✅ Đã có bản dịch tiếng Anh đầy đủ — sẵn sàng cho khách quốc tế."
                      : form.nameEn
                      ? "⚠️ Đã có tên EN, chưa có mô tả EN."
                      : "⚠️ Chưa có bản dịch tiếng Anh — khách quốc tế sẽ thấy nội dung tiếng Việt."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Variants and stock */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Box size={16} className="text-[#1A1A1A]" /> Biến thể & Tồn kho
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={generateSkus}
                  className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  Sinh SKU tự động
                </button>
                <button
                  type="button"
                  onClick={addVariant}
                  className="text-xs font-bold text-white bg-[#1A1A1A] hover:bg-[#E5B800] px-3 py-1.5 rounded-lg transition-colors"
                >
                  + Thêm biến thể
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {variants.map((v, i) => {
                const isExpanded = expandedVariantIndex === i;
                const imagesCount = v.imageUrls?.length || 0;

                return (
                  <div key={i} className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-xs">
                    {/* Main Row */}
                    <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center p-3 bg-slate-50/50 hover:bg-slate-50/80 transition-all border-b border-slate-100">
                      {/* Size */}
                      <div className="w-full sm:w-16 shrink-0">
                        <input
                          required
                          placeholder="Size"
                          value={v.size}
                          onChange={(e) => updateVariant(i, "size", e.target.value)}
                          className="w-full h-9 px-2 text-center border border-slate-200 rounded-lg text-xs font-bold bg-white focus:outline-none"
                        />
                      </div>

                      {/* Color */}
                      <div className="w-full sm:flex-1">
                        <input
                          required
                          placeholder="Màu (Ví dụ: Đen, Trắng)"
                          value={v.color}
                          onChange={(e) => updateVariant(i, "color", e.target.value)}
                          className="w-full h-9 px-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                        />
                      </div>

                      {/* Color Hex */}
                      <div className="w-full sm:w-20 flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 h-9 shrink-0">
                        <input
                          type="color"
                          value={v.colorHex || "#000000"}
                          onChange={(e) => updateVariant(i, "colorHex", e.target.value)}
                          className="w-5 h-5 border-0 p-0 rounded-full cursor-pointer overflow-hidden shrink-0"
                        />
                        <input
                          placeholder="#HEX"
                          value={v.colorHex}
                          onChange={(e) => updateVariant(i, "colorHex", e.target.value)}
                          className="w-full border-0 text-[10px] uppercase font-mono p-0 focus:outline-none"
                        />
                      </div>

                      {/* SKU */}
                      <div className="w-full sm:w-28 shrink-0">
                        <input
                          required
                          placeholder="Mã SKU *"
                          value={v.sku}
                          onChange={(e) => updateVariant(i, "sku", e.target.value)}
                          className="w-full h-9 px-2.5 border border-slate-200 rounded-lg text-xs font-mono bg-white focus:outline-none"
                        />
                      </div>

                      {/* Stock */}
                      <div className="w-full sm:w-16 shrink-0">
                        <input
                          type="number"
                          required
                          placeholder="Kho"
                          value={v.stockQty}
                          onChange={(e) => updateVariant(i, "stockQty", parseInt(e.target.value) || 0)}
                          className="w-full h-9 px-1 border border-slate-200 rounded-lg text-xs text-center bg-white focus:outline-none"
                        />
                      </div>

                      {/* Controls: Images Toggle & Delete */}
                      <div className="flex items-center gap-1.5 justify-end shrink-0">
                        <button
                          type="button"
                          onClick={() => setExpandedVariantIndex(isExpanded ? null : i)}
                          className={`h-9 px-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                            imagesCount > 0 
                              ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <ImageIcon size={13} />
                          <span>Ảnh ({imagesCount})</span>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          className="w-9 h-9 flex items-center justify-center text-red-500 hover:text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Variant Specific Images Collapse Sub-Form */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-50/50 border-t border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Hình ảnh riêng của biến thể này (Màu: {v.color || "chưa chọn"})</p>
                        
                        <div className="flex gap-2">
                          <input
                            placeholder="Nhập URL hình ảnh cho biến thể..."
                            value={newVariantImg[i] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewVariantImg(prev => prev.map((item, idx) => idx === i ? val : item));
                            }}
                            className="flex-1 h-9 px-3 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => addVariantImage(i)}
                            className="px-3 h-9 bg-slate-800 text-white font-bold rounded-lg text-xs hover:bg-slate-900 transition-colors"
                          >
                            + Thêm ảnh
                          </button>
                        </div>

                        {v.imageUrls && v.imageUrls.length > 0 ? (
                          <div className="grid grid-cols-5 gap-2 mt-2">
                            {v.imageUrls.map((imgUrl: string, imgIdx: number) => (
                              <div key={imgIdx} className="aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 relative group bg-white">
                                <img
                                  src={imgUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeVariantImage(i, imgIdx)}
                                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Biến thể này chưa có ảnh riêng (Sẽ sử dụng ảnh chung của sản phẩm).</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right side settings panel (1 col) */}
        <div className="space-y-6">
          {/* Pricing & details card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Giá & Vận chuyển</h3>

            <div className="space-y-1.5">
              <label className={labelCls}>Giá gốc (đ) *</label>
              <div className="relative">
                <input
                  required
                  type="number"
                  placeholder="0"
                  value={form.basePrice}
                  onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                  className={inputCls}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Đ</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>Giá khuyến mãi (đ)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Không giảm giá"
                  value={form.salePrice}
                  onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                  className={inputCls}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Đ</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>Trọng lượng (grams) *</label>
              <div className="relative">
                <input
                  required
                  type="number"
                  value={form.weightGrams}
                  onChange={(e) => setForm({ ...form, weightGrams: parseInt(e.target.value) || 0 })}
                  className={inputCls}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">g</span>
              </div>
            </div>
          </div>

          {/* Product Gallery Images Manager */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Thư viện hình ảnh chung</span>
              {form.imageUrls.length > 0 && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {form.imageUrls.length} ảnh
                </span>
              )}
            </h3>

            <div className="space-y-1.5">
              <label className={labelCls}>URL ảnh đại diện (Thumbnail)</label>
              <input
                placeholder="https://..."
                value={form.thumbnailUrl}
                onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                className={inputCls}
              />
              {form.thumbnailUrl && (
                <div className="mt-3 aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100 relative group">
                  <img
                    src={form.thumbnailUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, thumbnailUrl: "" })}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <label className={labelCls}>Thêm hình ảnh chung khác</label>
              <div className="flex gap-2">
                <input
                  placeholder="https://..."
                  value={newProductImg}
                  onChange={(e) => setNewProductImg(e.target.value)}
                  className="flex-1 h-9 px-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] bg-slate-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={addProductImage}
                  className="px-3 h-9 bg-[#1A1A1A] hover:bg-[#E5B800] text-white font-bold rounded-lg text-xs transition-colors shrink-0"
                >
                  Thêm
                </button>
              </div>

              {form.imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {form.imageUrls.map((url, idx) => (
                    <div key={idx} className="aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 relative group bg-slate-50">
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, thumbnailUrl: url })}
                          className="text-[9px] font-bold text-white bg-slate-800 hover:bg-[#1A1A1A] hover:text-white px-1.5 py-0.5 rounded transition-all"
                          title="Đặt làm ảnh đại diện"
                        >
                          Chọn làm diện
                        </button>
                        <button
                          type="button"
                          onClick={() => removeProductImage(idx)}
                          className="w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors"
                          title="Xóa hình ảnh"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Visibility and display */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Hiển thị</h3>

            <div className="pt-2 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition-all">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#1A1A1A] rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">Hiển thị sản phẩm</p>
                  <p className="text-[10px] text-slate-400">Khách hàng có thể tìm thấy và mua hàng</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition-all">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-[#1A1A1A] rounded"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">Đánh dấu nổi bật</p>
                  <p className="text-[10px] text-slate-400">Đưa sản phẩm lên banner hoặc các mục nổi bật</p>
                </div>
              </label>
            </div>
          </div>

          {/* Form message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs flex gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-xs flex gap-2">
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-12 bg-[#1A1A1A] hover:bg-[#E5B800] disabled:opacity-50 text-white font-bold rounded-full text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Save size={16} />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <Link
              href="/admin/products"
              className="px-6 h-12 border border-slate-200 text-slate-600 font-semibold rounded-full hover:bg-slate-50 flex items-center justify-center transition-colors"
            >
              Hủy
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
