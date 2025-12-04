import { NextResponse } from "next/server";

// Public pages that don't require authentication
const PUBLIC_PAGES = ["/auth/login", "/auth/forgot-password", "/auth/reset-password", "/403"];

// Pages/paths to skip middleware entirely (static assets, api routes, etc.)
const SKIP_PATHS = ["/_next", "/api", "/favicon.ico", "/logos", "/public"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets, API routes, and public files
  if (SKIP_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Skip middleware for any file with an extension (static files like .png, .jpg, .svg, etc.)
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  // Allow public pages
  if (PUBLIC_PAGES.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for auth token in cookies
  const accessToken = request.cookies.get("accessToken")?.value;

  // If no token, redirect to login
  if (!accessToken) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists - allow request to proceed
  // The actual token validation happens in the API/AuthProvider
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|logos).*)",
  ],
};
