import { NextRequest, NextResponse } from "next/server";

import { apiFetch } from "@/lib/api";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/auth")) {
    const accessToken = req.cookies.get("access_token");
    const csrfToken = req.cookies.get("csrf_token");

    if (!accessToken || !csrfToken) {
      return NextResponse.next();
    }

    try {
      const response = await apiFetch("/auth/validate", {
        method: "GET",
        headers: {
          "X-CSRF-Token": csrfToken.value,
          Cookie: `access_token=${accessToken.value}; csrf_token=${csrfToken.value}`,
        },
      });

      if (response.ok) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch (error) {
      console.error("Error during validation request:", error);
    }
  }

  if (pathname.startsWith("/dashboard")) {
    const accessToken = req.cookies.get("access_token");
    const csrfToken = req.cookies.get("csrf_token");

    if (!accessToken || !csrfToken) {
      return NextResponse.redirect(new URL("/auth", req.url));
    }

    try {
      const response = await apiFetch("/auth/validate", {
        method: "GET",
        headers: {
          "X-CSRF-Token": csrfToken.value,
          Cookie: `access_token=${accessToken.value}; csrf_token=${csrfToken.value}`,
        },
      });

      if (!response.ok) {
        return NextResponse.redirect(new URL("/auth", req.url));
      }
    } catch (error) {
      console.error("Error during validation request:", error);
      return NextResponse.redirect(new URL("/auth", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth", "/dashboard/:path*"],
};
