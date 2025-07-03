// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/", "/login"];
const COOKIE_NAME = process.env.COOKIE_NAME || "default_cookie_name";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// Route-to-Role Mapping Configuration
const ROUTE_ROLES: Record<string, string[]> = {
  "/admin": ["admin"],
  "/user": ["user", "admin"],
  "/reports": ["admin", "auditor"],
  // Add more routes as needed
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip authentication for public paths
  if (PUBLIC_PATHS.includes(path)) {
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

    // Check if route has specific role requirements
    const routeEntry = Object.entries(ROUTE_ROLES).find(([route]) =>
      path.startsWith(route)
    );

    // Handle route protection logic
    if (routeEntry) {
      const [, allowedRoles] = routeEntry;
      const hasPermission = allowedRoles.some((role) =>
        userRoles.includes(role)
      );

      if (!hasPermission) {
        return redirectToHome(request);
      }
    }

    // Continue to protected route
    return NextResponse.next();
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

// Match all routes except static files and API routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
