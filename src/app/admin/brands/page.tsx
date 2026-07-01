"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", logoUrl: "", isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchBrands = async () => {
    setLoading(true);
    const res = await api.get("/brands");
    setBrands(res.data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/brands", form);
      setShowForm(false);
      setForm({ name: "", slug: "", description: "", logoUrl: "", isActive: true });
      fetchBrands();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Quản lý thương hiệu</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-[#1A1A1A] text-white font-bold rounded-xl text-sm">
          + Thêm thương hiệu
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-bold text-[#1A1A1A]">Thương hiệu mới</h2>
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Tên thương hiệu" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none" />
            <input required placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none" />
            <input placeholder="URL logo" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} className="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none" />
            <input placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-5 h-10 bg-[#1A1A1A] text-white font-bold rounded-xl text-sm disabled:opacity-60">{saving ? "Đang lưu..." : "Lưu"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 h-10 border text-sm rounded-xl">Hủy</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
        )) : brands.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl shadow-sm p-4">
            {b.logoUrl && <img src={b.logoUrl} alt={b.name} className="h-12 object-contain mb-3" />}
            <p className="font-bold text-sm text-[#1A1A1A]">{b.name}</p>
            <p className="text-xs text-slate-400 font-mono">{b.slug}</p>
            <span className={`mt-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full ${b.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
              {b.isActive ? "Hoạt động" : "Ẩn"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
