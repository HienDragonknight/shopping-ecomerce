"use client";

import { useEffect, useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

interface SocialLoginButtonsProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? "";

function loadFacebookSdk(appId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Facebook SDK chỉ chạy trên trình duyệt"));
      return;
    }

    if (window.FB) {
      resolve();
      return;
    }

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId,
        cookie: true,
        xfbml: false,
        version: "v21.0",
      });
      resolve();
    };

    const existing = document.getElementById("facebook-jssdk");
    if (existing) {
      const checkReady = setInterval(() => {
        if (window.FB) {
          clearInterval(checkReady);
          resolve();
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/vi_VN/sdk.js";
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Không tải được Facebook SDK"));
    document.body.appendChild(script);
  });
}

export function SocialLoginButtons({ onSuccess, onError, disabled }: SocialLoginButtonsProps) {
  const { loginWithGoogle, loginWithFacebook, isLoading } = useAuthStore();
  const [fbReady, setFbReady] = useState(false);

  useEffect(() => {
    if (!FACEBOOK_APP_ID) return;

    loadFacebookSdk(FACEBOOK_APP_ID)
      .then(() => setFbReady(true))
      .catch((err: Error) => console.warn(err.message));
  }, []);

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

  const handleFacebookLogin = () => {
    if (!FACEBOOK_APP_ID) {
      onError("Facebook chưa được cấu hình (thiếu NEXT_PUBLIC_FACEBOOK_APP_ID)");
      return;
    }

    if (!window.FB) {
      onError("Facebook SDK chưa sẵn sàng, thử lại sau vài giây");
      return;
    }

    window.FB.login(
      async (response) => {
        const accessToken = response.authResponse?.accessToken;
        if (!accessToken) {
          onError("Đăng nhập Facebook đã bị hủy");
          return;
        }

        try {
          await loginWithFacebook(accessToken);
          onSuccess();
        } catch (err: unknown) {
          const axiosErr = err as { response?: { data?: { message?: string } } };
          onError(axiosErr?.response?.data?.message || "Đăng nhập Facebook thất bại");
        }
      },
      { scope: "email,public_profile" }
    );
  };

  const isDisabled = disabled || isLoading;

  return (
    <div className="mt-6 grid grid-cols-2 gap-4">
      <div className="flex justify-center">
        {GOOGLE_CLIENT_ID ? (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => onError("Đăng nhập Google thất bại")}
            theme="outline"
            size="large"
            shape="pill"
            text="signin_with"
            width="100%"
          />
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled
            className="w-full h-12 rounded-full border-[#E5E5E5] text-[#999] font-semibold"
            title="Thiếu NEXT_PUBLIC_GOOGLE_CLIENT_ID"
          >
            Google
          </Button>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={isDisabled || !FACEBOOK_APP_ID || !fbReady}
        onClick={handleFacebookLogin}
        className="h-12 rounded-full border-[#E5E5E5] text-[#1A1A1A] font-semibold hover:bg-[#F5F5F5] disabled:opacity-60"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Facebook
      </Button>
    </div>
  );
}
