"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import { useT } from "@/hooks/useT";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const t = useT();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(identifier, password);
      const { user } = useAuthStore.getState();
      if (user?.role === "ROLE_ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || t.common.error);
    }
  };

  const DEV_ACCOUNTS = [
    { label: "Admin", email: "admin@fashion.com", password: "Admin@123", color: "#1A1A1A", bg: "#1A1A1A" },
    { label: "Customer", email: "customer@test.com", password: "123456", color: "#fff", bg: "#333" },
  ];

  return (
    <div className="flex justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F5F5F5] min-h-[80vh]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] text-center mb-4">{t.auth.login}</h1>

        {/* DEV QUICK-LOGIN */}
        <div className="mb-5 rounded-xl border border-dashed border-[#1A1A1A] bg-[#FFFBEB] p-3">
          <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-2 text-center">
            🛠 Dev accounts — click để điền nhanh
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEV_ACCOUNTS.map((acc) => (
              <button
                key={acc.label}
                type="button"
                onClick={() => { setIdentifier(acc.email); setPassword(acc.password); }}
                className="flex flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition-all hover:scale-[1.02] active:scale-95 border border-[#E5E5E5] hover:border-[#1A1A1A] bg-white hover:bg-[#FFFDE7] shadow-sm"
              >
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full mb-1" style={{ background: acc.bg, color: acc.color }}>
                  {acc.label}
                </span>
                <span className="text-[11px] font-mono text-[#1A1A1A] truncate w-full">{acc.email}</span>
                <span className="text-[11px] font-mono text-[#666]">{acc.password}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center flex items-center gap-2 justify-center">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <Input
              type="text"
              placeholder={t.auth.emailOrPhone}
              className="h-12"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={t.auth.password}
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

          <div className="flex justify-end">
            <Link href="/account/forgot-password" className="text-sm font-semibold text-[#1A1A1A] hover:text-[#1A1A1A] transition-colors">
              {t.auth.forgotPassword}
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#1A1A1A] hover:bg-[#E5B800] text-white font-bold text-base rounded-full transition-colors disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t.auth.loggingIn}
              </span>
            ) : t.auth.login}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="w-1/5 border-b border-[#E5E5E5] lg:w-1/4" />
          <span className="text-xs text-center text-[#999] uppercase">{t.common.or}</span>
          <span className="w-1/5 border-b border-[#E5E5E5] lg:w-1/4" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-12 rounded-full border-[#E5E5E5] text-[#1A1A1A] font-semibold hover:bg-[#F5F5F5]">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>
          <Button variant="outline" className="h-12 rounded-full border-[#E5E5E5] text-[#1A1A1A] font-semibold hover:bg-[#F5F5F5]">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-[#555]">
          {t.auth.noAccount}{" "}
          <Link href="/account/register" className="font-bold text-[#1A1A1A] hover:text-[#1A1A1A] transition-colors">
            {t.auth.registerNow}
          </Link>
        </p>
      </div>
    </div>
  );
}
