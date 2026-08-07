"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OAuthProviders } from "@/components/OAuthProviders";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
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

  const redirectAfterLogin = () => {
    const { user } = useAuthStore.getState();
    if (user?.role === "ROLE_ADMIN") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(identifier, password);
      redirectAfterLogin();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || t.common.error);
    }
  };

  return (
    <OAuthProviders>
      <div className="flex justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F5F5F5] min-h-[80vh]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A] text-center mb-4">{t.auth.login}</h1>

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

        <SocialLoginButtons
          onSuccess={redirectAfterLogin}
          onError={setError}
          disabled={isLoading}
        />

        <p className="mt-8 text-center text-sm text-[#555]">
          {t.auth.noAccount}{" "}
          <Link href="/account/register" className="font-bold text-[#1A1A1A] hover:text-[#1A1A1A] transition-colors">
            {t.auth.registerNow}
          </Link>
        </p>
      </div>
    </div>
    </OAuthProviders>
  );
}
