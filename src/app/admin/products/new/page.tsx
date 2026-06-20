"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function AdminProductNewPage() {
  return <ProductForm />;
}

function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", description: "", basePrice: "", salePrice: "",
    thumbnailUrl: "", isActive: true, isFeatured: false,
    weightGrams: 300, categoryId: "", brandId: "",
  });
  const [variants, setVariants] = useState([
    { size: "S", color: "", colorHex: "", sku: "", stockQty: 0, priceAdjustment: 0 }
  ]);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data.data || []));
    api.get("/brands").then((r) => setBrands(r.data.data || []));
    if (productId) {
      api.get(`/admin/products/${productId}`).then((r) => {
        const p = r.data.data;
        setForm({
          name: p.name, description: p.description || "", basePrice: p.basePrice,
          salePrice: p.salePrice || "", thumbnailUrl: p.thumbnailUrl || "",
          isActive: p.isActive, isFeatured: p.isFeatured, weightGrams: p.weightGrams,
          categoryId: p.category?.id || "", brandId: p.brand?.id || "",
        });
        setVariants(p.variants || []);
      });
    }
  }, [productId]);

  const addVariant = () => setVariants([...variants, { size: "", color: "", colorHex: "", sku: "", stockQty: 0, priceAdjustment: 0 }]);
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, field: string, value: any) => {
    setVariants(variants.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
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
      } else {
        await api.post("/admin/products", payload);
      }
      router.push("/admin/products");
    } catch (e: any) {
      setError(e.response?.data?.message || "Lỗi lưu sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">
        {productId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-[#1A1A1A]">Thông tin cơ bản</h2>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Tên sản phẩm *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FCCE00]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Danh mục</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none">
                <option value="">Chọn danh mục</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Thương hiệu</label>
              <select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none">
                <option value="">Chọn thương hiệu</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Giá gốc (đ) *</label>
              <input required type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FCCE00]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Giá khuyến mãi (đ)</label>
              <input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">URL ảnh đại diện</label>
            <input value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
              className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Mô tả</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none resize-none" />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-[#FCCE00] w-4 h-4" />
              <span className="text-sm font-semibold">Hiển thị</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-[#FCCE00] w-4 h-4" />
              <span className="text-sm font-semibold">Nổi bật</span>
            </label>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1A1A1A]">Biến thể sản phẩm</h2>
            <button type="button" onClick={addVariant} className="text-sm font-bold text-[#FCCE00] hover:underline">+ Thêm biến thể</button>
          </div>
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-6 gap-2 items-center">
                {["size", "color", "sku"].map((f) => (
                  <input key={f} placeholder={f === "size" ? "Size" : f === "color" ? "Màu" : "SKU *"} value={(v as any)[f]}
                    onChange={(e) => updateVariant(i, f, e.target.value)}
                    className="h-9 px-2 border border-slate-200 rounded-lg text-xs focus:outline-none" />
                ))}
                <input type="number" placeholder="Tồn kho" value={v.stockQty}
                  onChange={(e) => updateVariant(i, "stockQty", parseInt(e.target.value) || 0)}
                  className="h-9 px-2 border border-slate-200 rounded-lg text-xs focus:outline-none" />
                <input type="text" placeholder="#HEX" value={v.colorHex}
                  onChange={(e) => updateVariant(i, "colorHex", e.target.value)}
                  className="h-9 px-2 border border-slate-200 rounded-lg text-xs focus:outline-none" />
                <button type="button" onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="px-8 h-12 bg-[#FCCE00] hover:bg-[#E5B800] text-[#1A1A1A] font-bold rounded-full disabled:opacity-60">
            {saving ? "Đang lưu..." : "Lưu sản phẩm"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 h-12 border border-slate-200 text-slate-600 font-semibold rounded-full hover:bg-slate-50">
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
