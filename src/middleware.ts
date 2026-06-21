// Next.js 16: route protection proxy
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_CUSTOMER = ["/account/profile", "/account/orders", "/account/addresses", "/account/change-password", "/cart", "/checkout", "/wishlist"];
const PROTECTED_ADMIN = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = PROTECTED_ADMIN.some((p) => pathname.startsWith(p));
  const isCustomerRoute = PROTECTED_CUSTOMER.some((p) => pathname.startsWith(p));

  if (!isAdminRoute && !isCustomerRoute) {
    return NextResponse.next();
  }

  // Read auth-token cookie (set by auth.ts on login)
  const authCookie = request.cookies.get("auth-token");

  if (!authCookie?.value) {
    const loginUrl = new URL("/account/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For admin routes, also verify role from Zustand persist cookie
  if (isAdminRoute) {
    const authStorage = request.cookies.get("auth-storage");
    if (authStorage?.value) {
      try {
        const parsed = JSON.parse(decodeURIComponent(authStorage.value));
        const role = parsed?.state?.user?.role;
        if (role !== "ROLE_ADMIN" && role !== "ADMIN") {
          return NextResponse.redirect(new URL("/", request.url));
        }
      } catch {
        // Can't parse — deny access
        return NextResponse.redirect(new URL("/account/login", request.url));
      }
    }
    // If no auth-storage but has auth-token, allow through (admin layout will handle it)
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/profile/:path*",
    "/account/orders/:path*",
    "/account/addresses/:path*",
    "/account/change-password",
    "/cart",
    "/checkout/:path*",
    "/wishlist",
    "/admin/:path*",
  ],
};
