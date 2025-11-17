import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Sider som skal være tilgjengelige selv når siden er låst
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

  // 1) Tillat statiske Next.js filer, bilder og offentlige ruter
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/public") ||
    pathname.match(/\.(css|js|png|jpg|jpeg|svg|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // 2) Hvis cookie er satt → full tilgang
  if (accessCookie === "granted") {
    return NextResponse.next();
  }

  // 3) Hvis riktig kode i URL → gi cookie og gi tilgang
  if (maintenanceCode && codeFromUrl === maintenanceCode) {
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set("phorium_access", "granted", {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 6, // 6 timer
    });
    return res;
  }

  // 4) Ellers → send alle til maintenance
  url.pathname = "/maintenance";
  url.search = "";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
