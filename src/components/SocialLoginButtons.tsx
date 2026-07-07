"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

interface SocialLoginButtonsProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export function SocialLoginButtons({ onSuccess, onError, disabled }: SocialLoginButtonsProps) {
  const { loginWithGoogle, isLoading } = useAuthStore();

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      onError("Không nhận được token Google");
      return;
    }

    try {
      await loginWithGoogle(response.credential);
      onSuccess();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      onError(axiosErr?.response?.data?.message || "Đăng nhập Google thất bại");
    }
  };

  return (
    <div className="mt-6 flex w-full justify-center [&>div]:w-full">
      {GOOGLE_CLIENT_ID ? (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => onError("Đăng nhập Google thất bại")}
          theme="outline"
          size="large"
          shape="pill"
          text="signin_with"
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isLoading}
          className="w-full h-12 rounded-full border-[#E5E5E5] text-[#999] font-semibold"
          title="Thiếu NEXT_PUBLIC_GOOGLE_CLIENT_ID"
        >
          Google
        </Button>
      )}
    </div>
  );
}
