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

  // 1) Lokalt og på vercel.app → alltid full tilgang (ingen lås)
  if (localHosts.includes(hostname) || hostname.endsWith(".vercel.app")) {
    return NextResponse.next();
  }

  // 2) Tillat statiske filer + maintenance
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.match(/\.(css|js|png|jpg|jpeg|svg|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // 3) Alle andre (phorium.no) → redirect til /maintenance
  url.pathname = "/maintenance";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
