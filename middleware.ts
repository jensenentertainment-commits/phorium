// middleware.ts (ligger i rotmappa, samme nivå som app/)

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/maintenance",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname, searchParams } = req.nextUrl;

  const maintenanceCode = process.env.MAINTENANCE_CODE;
  const accessCookie = req.cookies.get("phorium_access")?.value;
  const codeFromUrl = searchParams.get("code");

  // 1) Lokalt → alltid tilgang
  const localHosts = ["localhost", "127.0.0.1", "::1"];
  if (localHosts.includes(req.nextUrl.hostname)) {
    return NextResponse.next();
  }

  // 2) Tillat statiske filer + maintenance
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/public") ||
    pathname.match(/\.(css|js|png|jpg|jpeg|svg|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // 3) Cookie → full tilgang
  if (accessCookie === "granted") {
    return NextResponse.next();
  }

  // 4) Riktig kode i URL → sett cookie og slipp inn
  if (maintenanceCode && codeFromUrl === maintenanceCode) {
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set("phorium_access", "granted", {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 6, // 6 timer
    });
    return res;
  }

  // 5) Alle andre → redirect til /maintenance
url.pathname = "/maintenance";
url.search = "";
return NextResponse.redirect(url);

}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
