import { NextResponse } from "next/server";

const studentCookie = "typescope_student";
const adminCookie = "typescope_admin";
const stateChangingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function securityHeaders() {
  return {
    "X-DNS-Prefetch-Control": "on",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Content-Security-Policy": [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' https://accounts.google.com https://accounts.google.com/gsi/client",
      "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com",
      "frame-src https://accounts.google.com"
    ].join("; ")
  };
}

function withSecurityHeaders(response) {
  const headers = securityHeaders();
  Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  return response;
}

function hasCrossSiteOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin !== request.nextUrl.origin;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (stateChangingMethods.has(request.method) && hasCrossSiteOrigin(request)) {
    return withSecurityHeaders(NextResponse.json({ message: "Cross-site request blocked." }, { status: 403 }));
  }

  if (pathname === "/quiz" && !request.cookies.has(studentCookie)) {
    return withSecurityHeaders(NextResponse.redirect(new URL("/student/login", request.url)));
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !request.cookies.has(adminCookie)) {
    return withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
