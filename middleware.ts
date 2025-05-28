import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Paths that require authentication
const protectedPaths = ["/dashboard", "/projects/create"]

// Paths that should redirect to dashboard if already authenticated
const authPaths = ["/auth/login", "/auth/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth-token")?.value

  // Check if user is authenticated (basic check without JWT verification in middleware)
  const isAuthenticated = !!token

  // Redirect to login if accessing protected paths without authentication
  if (protectedPaths.some((path) => pathname.startsWith(path)) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Redirect to dashboard if accessing auth pages while authenticated
  if (authPaths.some((path) => pathname.startsWith(path)) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
