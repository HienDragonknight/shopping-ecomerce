"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  Plus, Search, Edit2, Trash2, Eye, RefreshCw,
  CheckCircle2, XCircle, Globe, Calendar, ArrowUpDown,
  BookOpen, Sparkles, AlertCircle, X, ExternalLink
} from "lucide-react";

export interface BlogPostItem {
  id: number;
  title: string;
  titleEn?: string | null;
  slug: string;
  excerpt?: string | null;
  excerptEn?: string | null;
  content?: string | null;
  contentEn?: string | null;
  imageUrl: string;
  date: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
}

interface FormState {
  title: string;
  titleEn: string;
  slug: string;
  excerpt: string;
  excerptEn: string;
  content: string;
  contentEn: string;
  imageUrl: string;
  date: string;
  isActive: boolean;
  sortOrder: number;
}

const INITIAL_FORM: FormState = {
  title: "",
  titleEn: "",
  slug: "",
  excerpt: "",
  excerptEn: "",
  content: "",
  contentEn: "",
  imageUrl: "",
  date: new Date().toISOString().split("T")[0],
  isActive: true,
  sortOrder: 0,
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [activeTab, setActiveTab] = useState<"vi" | "en" | "media">("vi");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.get("/admin/blog", {
        params: {
          page,
          size: 10,
          search: search.trim() || undefined,
        },
      });
      const data = res.data.data;
      if (data && data.content) {
        setPosts(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        setPosts([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || "Không thể tải danh sách bài viết");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle open create modal
  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      ...INITIAL_FORM,
      date: new Date().toISOString().split("T")[0],
    });
    setActiveTab("vi");
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (post: BlogPostItem) => {
    setEditingId(post.id);
    setForm({
      title: post.title || "",
      titleEn: post.titleEn || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      excerptEn: post.excerptEn || "",
      content: post.content || "",
      contentEn: post.contentEn || "",
      imageUrl: post.imageUrl || "",
      date: post.date || new Date().toISOString().split("T")[0],
      isActive: post.isActive ?? true,
      sortOrder: post.sortOrder ?? 0,
    });
    setActiveTab("vi");
    setIsModalOpen(true);
  };

  // Auto generate slug from title
  const handleGenerateSlug = () => {
    const text = form.title.trim();
    if (!text) return;
    const slug = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setForm((prev) => ({ ...prev, slug }));
  };

  // Submit save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Vui lòng nhập tiêu đề tiếng Việt");
      setActiveTab("vi");
      return;
    }
    if (!form.imageUrl.trim()) {
      alert("Vui lòng nhập đường dẫn ảnh đại diện");
      setActiveTab("media");
      return;
    }
    if (!form.content.trim()) {
      alert("Vui lòng nhập nội dung bài viết");
      setActiveTab("vi");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/blog/${editingId}`, form);
        showToast("Cập nhật bài viết thành công!");
      } else {
        await api.post("/admin/blog", form);
        showToast("Tạo bài viết mới thành công!");
      }
      setIsModalOpen(false);
      fetchPosts();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Lưu bài viết thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: number) => {
    try {
      await api.patch(`/admin/blog/${id}/toggle`);
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
      );
      showToast("Đã cập nhật trạng thái hiển thị");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  // Delete post
  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/admin/blog/${deletingId}`);
      showToast("Đã xóa bài viết thành công!");
      setDeletingId(null);
      fetchPosts();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Không thể xóa bài viết");
    }
  };

  const activeCount = posts.filter((p) => p.isActive).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 border border-white/10">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#530000] text-white flex items-center justify-center shadow-md">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Quản lý Bài viết & Tin tức (Blog)
              </h1>
              <p className="text-xs text-slate-500">
                Xuất bản, chỉnh sửa và quản lý các bài viết tin tức, xu hướng thời trang và công nghệ.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#530000] hover:bg-[#3d0000] text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <Plus size={16} />
          <span>Thêm bài viết</span>
        </button>
      </div>

      {/* ── STATS & SEARCH BAR ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng bài viết</span>
          <span className="text-2xl font-black text-slate-900">{totalElements}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Đang hiển thị</span>
          <span className="text-2xl font-black text-emerald-600">{activeCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang ẩn</span>
          <span className="text-2xl font-black text-slate-400">{posts.length - activeCount}</span>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề hoặc slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full h-full min-h-[52px] pl-10 pr-4 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#530000]/20 focus:border-[#530000] transition-all"
          />
        </div>
      </div>

      {/* ── TABLE CARD ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Danh sách bài viết ({totalElements})
          </span>
          <button
            onClick={fetchPosts}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Tải lại"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw size={24} className="animate-spin mx-auto text-[#530000]" />
            <p className="text-xs font-medium">Đang tải dữ liệu bài viết...</p>
          </div>
        ) : errorMessage ? (
          <div className="p-12 text-center text-rose-500 space-y-2">
            <AlertCircle size={24} className="mx-auto" />
            <p className="text-sm font-semibold">{errorMessage}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <BookOpen size={36} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">Chưa có bài viết nào</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Hãy nhấn nút &quot;Thêm bài viết&quot; để tạo bài viết đầu tiên trên hệ thống.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4 w-16">ID</th>
                  <th className="py-3.5 px-4 w-24">Ảnh</th>
                  <th className="py-3.5 px-4">Tiêu đề & Slug</th>
                  <th className="py-3.5 px-4 w-32">Ngày đăng</th>
                  <th className="py-3.5 px-4 w-24 text-center">Thứ tự</th>
                  <th className="py-3.5 px-4 w-28 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 w-36 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">#{post.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="w-16 aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.imageUrl || "https://placehold.co/400x300/F0F0F0/999?text=Blog"}
                          alt={post.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/400x300/F0F0F0/999?text=Blog";
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1 max-w-lg">
                        <p className="font-bold text-slate-900 group-hover:text-[#530000] transition-colors line-clamp-1">
                          {post.title}
                        </p>
                        {post.titleEn && (
                          <p className="text-xs text-slate-500 italic line-clamp-1">
                            🇬🇧 {post.titleEn}
                          </p>
                        )}
                        <span className="inline-block font-mono text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          /{post.slug}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                      {post.date}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-center font-mono text-slate-500">
                      {post.sortOrder}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(post.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                          post.isActive
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                        title="Nhấn để đổi trạng thái"
                      >
                        {post.isActive ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span>Hiển thị</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />
                            <span>Ẩn</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/post/${post.slug}`}
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Xem trên web"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="p-2 text-slate-400 hover:text-[#530000] hover:bg-red-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingId(post.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa bài viết"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Trang {page + 1} / {totalPages}</span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-40 transition-all"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 rounded-lg font-bold transition-all ${
                    page === i
                      ? "bg-[#530000] text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page === totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-40 transition-all"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#530000] text-white flex items-center justify-center">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingId ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Điền thông tin bài viết theo mẫu song ngữ Việt - Anh
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-100 px-6 bg-slate-50/30 gap-6 text-sm">
              <button
                type="button"
                onClick={() => setActiveTab("vi")}
                className={`py-3.5 font-bold border-b-2 transition-all ${
                  activeTab === "vi"
                    ? "border-[#530000] text-[#530000]"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                🇻🇳 Tiếng Việt
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("en")}
                className={`py-3.5 font-bold border-b-2 transition-all ${
                  activeTab === "en"
                    ? "border-[#530000] text-[#530000]"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                🇬🇧 English (Bilingual)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("media")}
                className={`py-3.5 font-bold border-b-2 transition-all ${
                  activeTab === "media"
                    ? "border-[#530000] text-[#530000]"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                ⚙️ Cài đặt & Ảnh
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* TAB 1: VIETNAMESE */}
              {activeTab === "vi" && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tiêu đề bài viết (Tiếng Việt) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Ứng dụng AR Heritage Scan trong thời trang Việt..."
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full h-11 px-4 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#530000]/20 focus:border-[#530000]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Đường dẫn Slug (URL)
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateSlug}
                        className="text-xs text-[#530000] font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <Sparkles size={12} /> Tự tạo slug từ tiêu đề
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="ar-heritage-scan-viet-co-phuc"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      className="w-full h-11 px-4 text-sm font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#530000]/20 focus:border-[#530000]"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Để trống hệ thống sẽ tự động sinh slug theo tiêu đề.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tóm tắt ngắn (Excerpt)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Tóm tắt 1-2 câu ngắn để hiển thị trên danh sách bài viết..."
                      value={form.excerpt}
                      onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                      className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#530000]/20 focus:border-[#530000]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nội dung bài viết (Content) *
                    </label>
                    <textarea
                      rows={8}
                      required
                      placeholder="Nhập toàn bộ nội dung bài viết. Có thể chia đoạn bằng phím Enter..."
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#530000]/20 focus:border-[#530000] font-sans leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: ENGLISH */}
              {activeTab === "en" && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Title (English)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Applying AR Heritage Scan in Vietnamese Traditional Fashion..."
                      value={form.titleEn}
                      onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                      className="w-full h-11 px-4 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#530000]/20 focus:border-[#530000]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Summary / Excerpt (English)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Short excerpt in English..."
                      value={form.excerptEn}
                      onChange={(e) => setForm({ ...form, excerptEn: e.target.value })}
                      className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#530000]/20 focus:border-[#530000]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Article Content (English)
                    </label>
                    <textarea
                      rows={8}
                      placeholder="Full article content in English..."
                      value={form.contentEn}
                      onChange={(e) => setForm({ ...form, contentEn: e.target.value })}
                      className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#530000]/20 focus:border-[#530000] font-sans leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: MEDIA & SETTINGS */}
              {activeTab === "media" && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Đường dẫn ảnh đại diện (Image URL) *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/... hoặc link Cloudinary"
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      className="w-full h-11 px-4 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#530000]/20 focus:border-[#530000]"
                    />
                  </div>

                  {/* Image Preview */}
                  {form.imageUrl && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-500">Xem trước ảnh:</span>
                      <div className="relative aspect-[16/9] max-w-sm rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/600x400/F0F0F0/999?text=Invalid+Image+URL";
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Ngày xuất bản (Publish Date)
                      </label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full h-11 px-4 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#530000]/20 focus:border-[#530000]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Thứ tự ưu tiên (Sort Order)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={form.sortOrder}
                        onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                        className="w-full h-11 px-4 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#530000]/20 focus:border-[#530000]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="w-5 h-5 rounded-md text-[#530000] focus:ring-[#530000]"
                      />
                      <span className="text-sm font-bold text-slate-800">
                        Hiển thị công khai bài viết này trên website
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#530000] hover:bg-[#3d0000] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Đang lưu..." : editingId ? "Cập nhật bài viết" : "Xuất bản bài viết"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa bài viết?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hành động này sẽ xóa vĩnh viễn bài viết khỏi cơ sở dữ liệu và không thể hoàn tác.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
