"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Check, EyeOff, Trash2, Star } from "lucide-react";

interface Review {
  id: number;
  userFullName: string;
  productName: string;
  productThumbnail?: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  isHidden?: boolean;
  createdAt: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < rating ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs font-bold text-slate-600 ml-1">{rating}/5</span>
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"" | "pending" | "approved" | "hidden">("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    try {
      const params: Record<string, string | number> = { page: 0, size: 50 };
      if (ratingFilter) params.rating = ratingFilter;
      const res = await api.get("/admin/reviews", { params });
      let data: Review[] = res.data.data.content || [];

      if (statusFilter === "pending") data = data.filter(r => !r.isApproved && !r.isHidden);
      else if (statusFilter === "approved") data = data.filter(r => r.isApproved);
      else if (statusFilter === "hidden") data = data.filter(r => r.isHidden);

      setReviews(data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, ratingFilter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const approve = async (id: number) => {
    await api.put(`/admin/reviews/${id}/approve`).catch(() => {});
    setReviews(prev => prev.map(r => r.id === id ? { ...r, isApproved: true, isHidden: false } : r));
  };

  const hide = async (id: number) => {
    await api.put(`/admin/reviews/${id}/hide`).catch(() => {});
    setReviews(prev => prev.map(r => r.id === id ? { ...r, isHidden: true, isApproved: false } : r));
  };

  const deleteReview = async (id: number) => {
    if (!confirm("Xóa đánh giá này?")) return;
    await api.delete(`/admin/reviews/${id}`).catch(() => {});
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const bulkApprove = async () => {
    await Promise.all([...selected].map(id => api.put(`/admin/reviews/${id}/approve`).catch(() => {})));
    setReviews(prev => prev.map(r => selected.has(r.id) ? { ...r, isApproved: true } : r));
    setSelected(new Set());
  };

  const toggleSelect = (id: number) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const pendingCount = reviews.filter(r => !r.isApproved && !r.isHidden).length;
  const approvedCount = reviews.filter(r => r.isApproved).length;
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  const getStatus = (r: Review) => {
    if (r.isHidden) return { label: "Đã ẩn", className: "bg-slate-100 text-slate-500" };
    if (r.isApproved) return { label: "Đã duyệt", className: "bg-emerald-100 text-emerald-700" };
    return { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Đánh giá sản phẩm</h1>
          <p className="text-sm text-slate-400">{reviews.length} đánh giá</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Chờ duyệt", value: pendingCount, color: "bg-amber-500", urgent: pendingCount > 0 },
          { label: "Đã duyệt", value: approvedCount, color: "bg-emerald-500", urgent: false },
          { label: "Tổng đánh giá", value: reviews.length, color: "bg-blue-500", urgent: false },
          { label: "Rating TB", value: `⭐ ${avgRating}`, color: "bg-purple-500", urgent: false },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-2xl p-4 shadow-sm border ${s.urgent ? "border-amber-200" : "border-slate-100"}`}>
            <div className={`w-8 h-8 ${s.color} rounded-xl mb-2`} />
            <p className="text-xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3">
          {/* Status tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { value: "", label: "Tất cả" },
              { value: "pending", label: `Chờ duyệt${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
              { value: "approved", label: "Đã duyệt" },
              { value: "hidden", label: "Đã ẩn" },
            ].map(t => (
              <button key={t.value} onClick={() => setStatusFilter(t.value as typeof statusFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === t.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Rating filter */}
          <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}
            className="h-9 px-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none">
            <option value="">Tất cả sao</option>
            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} sao</option>)}
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
          <span className="text-sm font-semibold text-blue-700">Đã chọn {selected.size}</span>
          <button onClick={bulkApprove}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-white border border-emerald-200 px-3 py-1.5 rounded-lg">
            <Check size={12} /> Duyệt tất cả
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-slate-500">Bỏ chọn</button>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-slate-100" />
          ))
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-100">
            <p className="text-4xl mb-2">⭐</p>
            <p className="text-slate-500 font-semibold">Không có đánh giá nào</p>
          </div>
        ) : reviews.map(r => {
          const status = getStatus(r);
          return (
            <div key={r.id} className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${
              selected.has(r.id) ? "border-blue-300 bg-blue-50/30" : "border-slate-100 hover:border-slate-200"
            }`}>
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)}
                  className="mt-1 rounded border-slate-300 accent-blue-600 shrink-0" />

                {r.productThumbnail && (
                  <img src={r.productThumbnail} alt="" className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">{r.userFullName}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {r.productName} · {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <StarRating rating={r.rating} />
                  </div>

                  {r.comment && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{r.comment}</p>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    {!r.isApproved && !r.isHidden && (
                      <button onClick={() => approve(r.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors">
                        <Check size={11} /> Duyệt
                      </button>
                    )}
                    {!r.isHidden && (
                      <button onClick={() => hide(r.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                        <EyeOff size={11} /> Ẩn
                      </button>
                    )}
                    <button onClick={() => deleteReview(r.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors">
                      <Trash2 size={11} /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
