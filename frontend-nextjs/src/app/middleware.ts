// middleware.js
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

interface MiddlewareRequest extends Request {
  nextUrl: {
    pathname: string;
    [key: string]: any;
  };
  cookies: {
    get: (name: string) => { value: string } | undefined;
  };
  headers: Headers;
  [key: string]: any;
}

interface JwtPayload {
  sub: string;
  [key: string]: any;
}

export async function middleware(
  request: MiddlewareRequest
): Promise<Response> {
  const { pathname } = request.nextUrl;
  const protectedRoutes: string[] = ["/dashboard", "/profile", "/admin"];

  // Check if route is protected
  if (protectedRoutes.some((route: string) => pathname.startsWith(route))) {
    const token: string | undefined =
      request.cookies.get("authToken")?.value ||
      request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Verify JWT
      const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (err) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}
