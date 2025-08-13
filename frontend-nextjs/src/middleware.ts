// middleware.ts (at project root)
import { NextResponse, NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/_next", // Next.js assets
  "/favicon.ico",
  "/public", // your static public folder prefix if needed
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  const token = req.cookies.get("fb_id_token")?.value;

  // If visiting login and already authed → redirect home
  if (isPublic && pathname === "/login" && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // If a non-public route and no token → redirect to /login
  if (!isPublic && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // preserve original path as ?redirect=
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all routes except static files; customize to your app
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
