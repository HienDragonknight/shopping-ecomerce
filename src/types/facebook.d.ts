interface FacebookAuthResponse {
  authResponse?: {
    accessToken: string;
    userID: string;
  };
  status: string;
}

interface FacebookStatic {
  init: (params: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
  login: (
    callback: (response: FacebookAuthResponse) => void,
    options?: { scope?: string }
  ) => void;
}

declare global {
  interface Window {
    FB?: FacebookStatic;
    fbAsyncInit?: () => void;
  }
}

export type { FacebookAuthResponse };
