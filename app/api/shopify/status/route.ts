import { NextResponse } from "next/server";

function getCookieFromHeader(
  header: string | null,
  name: string,
): string | null {
  if (!header) return null;
  const cookies = header.split(";").map((c) => c.trim());
  const match = cookies.find((c) => c.startsWith(name + "="));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  const shop = getCookieFromHeader(cookieHeader, "phorium_shop");
  const token = getCookieFromHeader(cookieHeader, "phorium_token");

  if (!shop || !token) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    shop,
  });
}
