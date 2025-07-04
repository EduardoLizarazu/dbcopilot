// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/", "/login", "/chat", "/auth"];
const COOKIE_NAME = process.env.COOKIE_NAME || "default_cookie_name";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// Define minimum required role for each route
const ROUTE_ROLES: Record<string, string[]> = {
  "/dashboard": ["admin", "user"],
  // "/auth": ["admin"],
  // "/chat": ["admin", "user"],
  // Add more routes as needed
};

export async function middleware(request: NextRequest) {
  console.log("MIDDLEWARE");

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some(
    (publicPath) => path === publicPath || path.startsWith(`${publicPath}/`)
  );

  // Skip authentication for public paths
  if (isPublic) {
    return NextResponse.next();
  }

  // Get JWT from cookies
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Redirect to login if no token
  if (!token) {
    return redirectToLogin(request);
  }

  try {
    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRoles = (payload.roles as string[]) || [];

    // Find matching route protection rule
    const matchedRoute = Object.entries(ROUTE_ROLES).find(([route]) =>
      path.startsWith(route)
    );

    // Handle route protection logic
    if (matchedRoute) {
      const [, requiredRoles] = matchedRoute;
      const hasPermission = requiredRoles.some((role) =>
        userRoles.includes(role)
      );

      if (!hasPermission) {
        return redirectToHome(request);
      }
    } else {
      // Block access to undefined protected routes
      return redirectToHome(request);
    }

    // Add user roles to request headers for client components
    const headers = new Headers(request.headers);
    headers.set("x-user-roles", JSON.stringify(userRoles));

    return NextResponse.next({
      request: {
        headers,
      },
    });
  } catch (error) {
    console.error("JWT verification failed:", error);
    return redirectToLogin(request);
  }
}

// Helper functions
function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

function redirectToHome(request: NextRequest) {
  const homeUrl = new URL("/", request.url);
  return NextResponse.redirect(homeUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)", "/"],
};
