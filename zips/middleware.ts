import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",            // forsiden
  "/login",       // login/beta
  "/access",
  "/maintenance",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;
  const hostname = req.nextUrl.hostname;

  const localHosts = ["localhost", "127.0.0.1", "::1"];

  // Lokalt + vercel.app → alltid full tilgang
  if (localHosts.includes(hostname) || hostname.endsWith(".vercel.app")) {
    return NextResponse.next();
  }

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.match(/\.(css|js|png|jpg|jpeg|svg|webp|ico)$/);

  // Slå av/på maintenance med env-variabel
  const maintenanceEnabled =
    process.env.NEXT_PUBLIC_MAINTENANCE === "true";

  if (maintenanceEnabled && !isPublic) {
    url.pathname = "/maintenance";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Normal drift
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
