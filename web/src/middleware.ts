import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth-core";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`[Middleware] Processing request for: ${pathname}`);

  // Proteger apenas rotas /admin, exceto /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("admin_session")?.value;
    
    console.log(`[Middleware] Token found: ${!!token}`);

    if (!token) {
      console.log(`[Middleware] No token, redirecting to login`);
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isValid = await verifySessionToken(token);
    console.log(`[Middleware] Token valid: ${isValid}`);

    if (!isValid) {
      console.log(`[Middleware] Invalid token, redirecting to login`);
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
