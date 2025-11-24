import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
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

  // 🔓 1) Lokalt (localhost) → alltid tilgang
  if (localHosts.includes(hostname)) {
    return NextResponse.next();
  }

  // 🔓 2) Vercel preview / vercel.app → alltid tilgang
  if (hostname.endsWith(".vercel.app")) {
    return NextResponse.next();
  }

  // 🔓 3) Tillat statiske filer og maintenance
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.match(/\.(css|js|png|jpg|jpeg|svg|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // 🔒 4) ALLE ANDRE DOMENER (phorium.no) → redirect til /maintenance
  url.pathname = "/maintenance";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
