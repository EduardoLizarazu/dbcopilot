// middleware.ts (at project root)
import { NextResponse, NextRequest } from "next/server";
import { COOKIE_NAME } from "@/utils/constants";

/**
 * Middleware rules:
 * - /login is public (no token required)
 * - All other routes require a valid ID token stored in cookie (COOKIE_NAME)
 * - Routes starting with /chat or /history require a valid token but NOT admin role
 * - All other routes require admin role (custom claim 'admin' in decoded.roles)
 * - On missing/invalid token or insufficient role: clear cookie and redirect to /login
 */

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  // /login is public
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Read token from cookie
  const token = req.cookies.get(COOKIE_NAME)?.value || "";
  if (!token) {
    // clear cookie and redirect to login
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE_NAME, "", { path: "/", httpOnly: true, maxAge: 0 });
    return res;
  }

  // Verify token by calling a server-side endpoint (avoids importing admin SDK into middleware)
  let decoded: any = null;
  try {
    const verifyUrl = new URL(
      "/api/auth/verify",
      req.nextUrl.origin
    ).toString();
    const verifyRes = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      // ensure we don't cache the verification response
      cache: "no-store",
    });

    if (!verifyRes.ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      const res = NextResponse.redirect(url);
      res.cookies.set(COOKIE_NAME, "", {
        path: "/",
        httpOnly: true,
        maxAge: 0,
      });
      return res;
    }

    decoded = await verifyRes.json();
  } catch (err) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE_NAME, "", { path: "/", httpOnly: true, maxAge: 0 });
    return res;
  }

  // Determine if admin role is required for this path
  const adminNotRequired =
    pathname.startsWith("/chat") || pathname.startsWith("/history");

  if (!adminNotRequired) {
    // For all other routes, require admin role
    const rolesClaim = decoded?.roles || decoded?.role || [];
    const roles = Array.isArray(rolesClaim)
      ? rolesClaim
      : typeof rolesClaim === "string"
        ? [rolesClaim]
        : [];
    const isAdmin = roles.includes("admin");
    if (!isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      const res = NextResponse.redirect(url);
      res.cookies.set(COOKIE_NAME, "", {
        path: "/",
        httpOnly: true,
        maxAge: 0,
      });
      return res;
    }
  }

  // Token valid and roles ok
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
