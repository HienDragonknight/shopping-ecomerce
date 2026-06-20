"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Plus, Trash2, Edit2, LayoutGrid, RefreshCw } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  isActive: boolean;
  sortOrder: number;
  productCount?: number;
}

const EMPTY_FORM = { name: "", slug: "", isActive: true, sortOrder: 0 };

function slugify(s: string) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const res = await api.get("/categories");
    setCategories(res.data.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, isActive: c.isActive, sortOrder: c.sortOrder });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/categories/${editing.id}`, form);
      } else {
        await api.post("/admin/categories", form);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi lưu danh mục");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Xóa danh mục này? (Sản phẩm thuộc danh mục này có thể bị ảnh hưởng)")) return;
    await api.delete(`/admin/categories/${id}`);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Danh mục</h1>
          <p className="text-sm text-slate-400">{categories.length} danh mục</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchCategories} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500">
            <RefreshCw size={15} />
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#FCCE00] hover:bg-[#E5B800] text-[#1A1A1A] font-bold rounded-xl text-sm">
            <Plus size={16} /> Thêm danh mục
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-2"><LayoutGrid size={15} /></div>
          <p className="text-lg font-black text-slate-900">{categories.length}</p>
          <p className="text-xs text-slate-500">Tổng danh mục</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl mb-2" />
          <p className="text-lg font-black text-slate-900">{categories.filter(c => c.isActive).length}</p>
          <p className="text-xs text-slate-500">Đang hiển thị</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {["Tên", "Slug", "Thứ tự", "Trạng thái", "Thao tác"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-4">
                  <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                </td></tr>
              )) : categories.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-400">ID: {c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500">{c.slug}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{c.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {c.isActive ? "Hiển thị" : "Ẩn"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg">
                        <Edit2 size={11} /> Sửa
                      </button>
                      <button onClick={() => deleteCategory(c.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg">
                        <Trash2 size={11} /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{editing ? "Sửa danh mục" : "Thêm danh mục"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Tên danh mục *</label>
                <input required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                  placeholder="Áo thun, Quần jean, ..."
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Slug *</label>
                <input required value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="ao-thun"
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Thứ tự hiển thị</label>
                <input type="number" value={form.sortOrder}
                  onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="rounded border-slate-300 accent-blue-600" />
                <span className="text-sm font-medium text-slate-700">Hiển thị danh mục</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 h-11 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50">Hủy</button>
                <button type="submit" disabled={saving}
                  className="flex-1 h-11 bg-[#FCCE00] hover:bg-[#E5B800] text-[#1A1A1A] font-bold rounded-xl disabled:opacity-60">
                  {saving ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Thêm danh mục"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
