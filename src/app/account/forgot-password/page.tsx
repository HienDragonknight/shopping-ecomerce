"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useT } from "@/hooks/useT";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const t = useT();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { identifier });
      setSent(true);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setSent(false);
  };

  return (
    <div className="flex justify-center py-12 px-4 bg-[#F5F5F5] min-h-[80vh]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">

        {sent ? (
          <div className="text-center py-4">
            <div className="relative mx-auto w-20 h-20 mb-5">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#1A1A1A] rounded-full flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-[#1A1A1A]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">{t.forgotPassword.sentTitle}</h1>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-1">
              {t.forgotPassword.sentDesc}
            </p>
            <p className="font-bold text-[#1A1A1A] mb-6">{identifier}</p>

            <div className="bg-[#FFFBEB] border border-[#1A1A1A]/40 rounded-xl p-4 text-sm text-left mb-6">
              <p className="font-semibold text-[#1A1A1A] mb-1">{t.forgotPassword.noEmail}</p>
              <ul className="text-slate-500 space-y-1 text-xs">
                <li>{t.forgotPassword.checkSpam}</li>
                <li>{t.forgotPassword.takesTime}</li>
                <li>{t.forgotPassword.checkAddress}</li>
              </ul>
            </div>

            <button
              onClick={handleResend}
              disabled={countdown > 0}
              className="text-sm font-semibold text-[#1A1A1A] hover:text-[#1A1A1A] transition-colors disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {countdown > 0 ? t.forgotPassword.resendAfter(countdown) : t.forgotPassword.resend}
            </button>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <Link href="/account/login" className="text-sm text-slate-500 hover:text-[#1A1A1A] transition-colors">
                {t.forgotPassword.backToLogin}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-[#FFFBEB] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#1A1A1A]">
                <svg className="w-7 h-7 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">{t.forgotPassword.title}</h1>
              <p className="text-sm text-slate-500 mt-2">
                {t.forgotPassword.subtitle}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{t.forgotPassword.emailPhone}</label>
                <Input
                  type="text"
                  placeholder={t.forgotPassword.placeholder}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#1A1A1A] hover:bg-[#E5B800] text-white font-bold rounded-full disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t.forgotPassword.sending}
                  </span>
                ) : t.forgotPassword.sendLink}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm">
              <Link href="/account/login" className="font-semibold text-[#1A1A1A] hover:text-[#1A1A1A] transition-colors">
                {t.forgotPassword.backToLogin}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
