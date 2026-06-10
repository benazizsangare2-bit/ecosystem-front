import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/dashboard", "/reports/create", "/reports/", "/profile", "/notifications"]
const adminRoutes = ["/admin"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

  const isProtected = protectedRoutes.some((route) => {
    if (route.endsWith("/")) return pathname.startsWith(route)
    return pathname === route || pathname.startsWith(route + "/")
  })

  const isAdmin = adminRoutes.some((route) => {
    if (route.endsWith("/")) return pathname.startsWith(route)
    return pathname === route || pathname.startsWith(route + "/")
  })

  if (isAdmin) {
    if (!token) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
    const role = request.cookies.get("user_role")?.value
    if (role !== "admin" && role !== "authority") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads/|api/).*)",
  ],
}
