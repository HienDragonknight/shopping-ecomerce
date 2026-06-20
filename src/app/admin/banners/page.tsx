"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", imageUrl: "", linkUrl: "", position: "HOME_HERO", isActive: true, sortOrder: 0 });

  const fetchBanners = async () => {
    setLoading(true);
    const res = await api.get("/admin/banners");
    setBanners(res.data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleSave = async () => {
    await api.post("/admin/banners", form);
    setShowForm(false);
    setForm({ title: "", imageUrl: "", linkUrl: "", position: "HOME_HERO", isActive: true, sortOrder: 0 });
    fetchBanners();
  };

  const deleteBanner = async (id: number) => {
    if (!confirm("Xóa banner này?")) return;
    await api.delete(`/admin/banners/${id}`);
    fetchBanners();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Quản lý Banner</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-[#FCCE00] text-[#1A1A1A] font-bold rounded-xl text-sm">
          + Thêm banner
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-bold text-[#1A1A1A]">Banner mới</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Tiêu đề", field: "title", type: "text" },
              { label: "URL ảnh", field: "imageUrl", type: "text" },
              { label: "URL liên kết", field: "linkUrl", type: "text" },
              { label: "Thứ tự", field: "sortOrder", type: "number" },
            ].map(({ label, field, type }) => (
              <div key={field} className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">{label}</label>
                <input
                  type={type}
                  value={(form as any)[field]}
                  onChange={(e) => setForm({ ...form, [field]: type === "number" ? parseInt(e.target.value) || 0 : e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="px-6 h-10 bg-[#FCCE00] text-[#1A1A1A] font-bold rounded-xl text-sm">Lưu</button>
            <button onClick={() => setShowForm(false)} className="px-4 h-10 border border-slate-200 text-sm rounded-xl">Hủy</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-48 bg-slate-200 rounded-2xl animate-pulse" />)
        ) : banners.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <img src={b.imageUrl} alt={b.title} className="w-full h-36 object-cover" onError={(e) => ((e.target as HTMLImageElement).src = "https://placehold.co/400x144")} />
            <div className="p-4">
              <p className="font-bold text-sm text-[#1A1A1A]">{b.title}</p>
              <p className="text-xs text-slate-400 truncate">{b.linkUrl}</p>
              <div className="flex items-center justify-between mt-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {b.isActive ? "Hiển thị" : "Ẩn"}
                </span>
                <button onClick={() => deleteBanner(b.id)} className="text-xs text-red-400 hover:text-red-600 font-semibold">Xóa</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
