"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!fullName.trim()) return "Vui lòng nhập họ và tên";
    if (!email && !phone) return "Vui lòng nhập email hoặc số điện thoại";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email không hợp lệ";
    if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
    if (password !== confirmPassword) return "Mật khẩu xác nhận không khớp";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    try {
      await register(fullName, email || null, phone || null, password);
      setSuccess(true);
      setTimeout(() => router.push("/"), 1500);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  if (success) {
    return (
      <div className="flex justify-center py-12 px-4 bg-[#F5F5F5] min-h-[80vh]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4 animate-bounce">
            <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Đăng ký thành công! 🎉</h2>
          <p className="text-slate-500 text-sm">Chào mừng bạn đến với Yody! Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F5F5F5] min-h-[80vh]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] text-center mb-2">Tạo tài khoản</h1>
        <p className="text-center text-slate-500 text-sm mb-6">Tham gia Yody để nhận ưu đãi độc quyền</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Nguyễn Văn A"
              className="h-12"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
            <Input
              type="email"
              placeholder="example@email.com"
              className="h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Số điện thoại</label>
            <Input
              type="tel"
              placeholder="0901 234 567"
              className="h-12"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <p className="text-xs text-slate-400 -mt-2">* Nhập ít nhất email hoặc số điện thoại</p>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Ít nhất 6 ký tự"
                className="h-12 pr-10"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#1A1A1A] transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            {/* Password strength */}
            {password && (
              <div className="mt-1.5 flex gap-1">
                {[1, 2, 3].map((level) => (
                  <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${
                    password.length >= level * 4
                      ? level === 1 ? "bg-red-400" : level === 2 ? "bg-yellow-400" : "bg-emerald-400"
                      : "bg-slate-200"
                  }`} />
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                className={`h-12 pr-10 ${confirmPassword && confirmPassword !== password ? "border-red-300 focus:ring-red-200" : confirmPassword && confirmPassword === password ? "border-emerald-300" : ""}`}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#1A1A1A] transition-colors"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
              {confirmPassword && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                  {confirmPassword === password
                    ? <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    : <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  }
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Bằng cách đăng ký, bạn đồng ý với{" "}
            <Link href="/chinh-sach-bao-mat" className="text-[#1A1A1A] font-semibold hover:text-[#FCCE00]">
              Điều khoản dịch vụ
            </Link>{" "}
            của chúng tôi.
          </p>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#FCCE00] hover:bg-[#E5B800] text-[#1A1A1A] font-bold text-base rounded-full transition-colors disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang đăng ký...
              </span>
            ) : "Đăng ký ngay"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#555]">
          Bạn đã có tài khoản?{" "}
          <Link href="/account/login" className="font-bold text-[#1A1A1A] hover:text-[#FCCE00] transition-colors">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
