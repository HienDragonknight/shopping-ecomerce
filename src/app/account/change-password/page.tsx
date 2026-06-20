"use client";

import { useState } from "react";
import { AccountSidebar } from "@/components/AccountSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp"); return;
    }
    if (form.newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự"); return;
    }
    setLoading(true); setError(""); setSuccess("");
    try {
      await api.put("/profile/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess("Đổi mật khẩu thành công!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: any) {
      setError(e.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen py-8">
      <div className="yody-container max-w-6xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4 shrink-0"><AccountSidebar /></div>
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <h1 className="text-xl font-bold text-[#1A1A1A] mb-6">Đổi mật khẩu</h1>
              <form className="max-w-md space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Mật khẩu hiện tại</label>
                  <Input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} className="h-11" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Mật khẩu mới</label>
                  <Input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className="h-11" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Xác nhận mật khẩu mới</label>
                  <Input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="h-11" required />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-emerald-600 text-sm font-semibold">{success}</p>}
                <Button type="submit" disabled={loading} className="w-full h-12 bg-[#FCCE00] hover:bg-[#E5B800] text-[#1A1A1A] font-bold rounded-full">
                  {loading ? "Đang lưu..." : "Đổi mật khẩu"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
