import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  // 👇 1. Sider som ALLTID skal være åpne
  const publicPaths = [
    "/", 
    "/login",
    "/om",
    "/priser",
    "/guide",
    "/kontakt",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
  ];

  // Åpne alle statiske filer
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.match(/\.(css|js|png|jpg|jpeg|svg|webp|ico)$/)
  ) {
    return res;
  }

  // 👇 2. Beskytter /studio og alt under
  if (pathname.startsWith("/studio")) {
    if (!user) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}

// Matcher ALLE ruter bortsett fra API-ruter
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
