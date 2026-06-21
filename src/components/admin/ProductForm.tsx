"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, Save, Plus, X, Tag, ShieldCheck, Box, RefreshCw } from "lucide-react";
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

  const [form, setForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    salePrice: "",
    thumbnailUrl: "",
    isActive: true,
    isFeatured: false,
    weightGrams: 300,
    categoryId: "",
    brandId: "",
  });

  const [variants, setVariants] = useState<any[]>([
    { size: "S", color: "Đen", colorHex: "#000000", sku: "", stockQty: 10, priceAdjustment: 0 }
  ]);

  // Load basic data
  useEffect(() => {
    Promise.all([
      api.get("/categories").then(r => setCategories(r.data.data || [])).catch(() => {}),
      api.get("/brands").then(r => setBrands(r.data.data || [])).catch(() => {})
    ]).then(() => {
      if (productId) {
        api.get(`/admin/products/${productId}`)
          .then((r) => {
            const p = r.data.data;
            setForm({
              name: p.name || "",
              description: p.description || "",
              basePrice: p.basePrice ? p.basePrice.toString() : "",
              salePrice: p.salePrice ? p.salePrice.toString() : "",
              thumbnailUrl: p.thumbnailUrl || "",
              isActive: p.isActive !== false,
              isFeatured: !!p.isFeatured,
              weightGrams: p.weightGrams || 300,
              categoryId: p.category?.id ? p.category.id.toString() : "",
              brandId: p.brand?.id ? p.brand.id.toString() : "",
            });
            setVariants(p.variants && p.variants.length > 0 ? p.variants : [
              { size: "S", color: "Đen", colorHex: "#000000", sku: "", stockQty: 10, priceAdjustment: 0 }
            ]);
          })
          .catch(e => setError("Không thể tải thông tin sản phẩm"))
          .finally(() => setLoading(false));
      }
    });
  }, [productId]);

  const addVariant = () => {
    setVariants([...variants, { size: "M", color: "Đen", colorHex: "#000000", sku: "", stockQty: 10, priceAdjustment: 0 }]);
  };

  const removeVariant = (i: number) => {
    setVariants(variants.filter((_, idx) => idx !== i));
  };

  const updateVariant = (i: number, field: string, value: any) => {
    setVariants(variants.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
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

  const inputCls = "w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FCCE00]/30 focus:border-[#FCCE00] bg-slate-50 hover:bg-slate-50/50 focus:bg-white transition-all";
  const labelCls = "text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FCCE00]" />
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
              <Tag size={16} className="text-[#FCCE00]" /> Thông tin cơ bản
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
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FCCE00]/30 focus:border-[#FCCE00] bg-slate-50 focus:bg-white resize-none transition-all"
              />
            </div>
          </div>

          {/* Variants and stock */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Box size={16} className="text-[#FCCE00]" /> Biến thể & Tồn kho
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
                  className="text-xs font-bold text-[#1A1A1A] bg-[#FCCE00] hover:bg-[#E5B800] px-3 py-1.5 rounded-lg transition-colors"
                >
                  + Thêm biến thể
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {variants.map((v, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all">
                  {/* Size */}
                  <div className="w-full sm:w-16">
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
                  <div className="w-full sm:w-20 flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 h-9">
                    <input
                      type="color"
                      value={v.colorHex || "#000000"}
                      onChange={(e) => updateVariant(i, "colorHex", e.target.value)}
                      className="w-6 h-6 border-0 p-0 rounded-full cursor-pointer overflow-hidden shrink-0"
                    />
                    <input
                      placeholder="#HEX"
                      value={v.colorHex}
                      onChange={(e) => updateVariant(i, "colorHex", e.target.value)}
                      className="w-full border-0 text-[10px] uppercase font-mono p-0 focus:outline-none"
                    />
                  </div>

                  {/* SKU */}
                  <div className="w-full sm:w-32">
                    <input
                      required
                      placeholder="Mã SKU *"
                      value={v.sku}
                      onChange={(e) => updateVariant(i, "sku", e.target.value)}
                      className="w-full h-9 px-2.5 border border-slate-200 rounded-lg text-xs font-mono bg-white focus:outline-none"
                    />
                  </div>

                  {/* Stock */}
                  <div className="w-full sm:w-20">
                    <input
                      type="number"
                      required
                      placeholder="Số lượng"
                      value={v.stockQty}
                      onChange={(e) => updateVariant(i, "stockQty", parseInt(e.target.value) || 0)}
                      className="w-full h-9 px-2 border border-slate-200 rounded-lg text-xs text-center bg-white focus:outline-none"
                    />
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="w-9 h-9 flex items-center justify-center text-red-500 hover:text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
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

          {/* Media & display settings */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Hình ảnh & Hiển thị</h3>

            <div className="space-y-1.5">
              <label className={labelCls}>URL hình ảnh đại diện</label>
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

            <div className="pt-2 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition-all">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#FCCE00] rounded"
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
                  className="w-4 h-4 accent-[#FCCE00] rounded"
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
              className="flex-1 h-12 bg-[#FCCE00] hover:bg-[#E5B800] disabled:opacity-50 text-[#1A1A1A] font-bold rounded-full text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
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
