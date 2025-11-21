import { NextResponse } from "next/server";

const SHOPIFY_API_VERSION = "2024-01";

function getCookieFromHeader(
  header: string | null,
  name: string,
): string | null {
  if (!header) return null;
  const parts = header.split(";").map((c) => c.trim());
  const match = parts.find((c) => c.startsWith(name + "="));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const shopDomain = getCookieFromHeader(cookieHeader, "phorium_shop");
    const accessToken = getCookieFromHeader(cookieHeader, "phorium_token");

    if (!shopDomain || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Ingen Shopify-butikk er koblet til.",
        },
        { status: 401 },
      );
    }

    const baseUrl = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}`;

    const shopRes = await fetch(`${baseUrl}/shop.json`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!shopRes.ok) {
      const text = await shopRes.text();
      console.error("auto-brand-profile shop error:", shopRes.status, text);
      return NextResponse.json(
        {
          success: false,
          error: "Klarte ikke å hente butikkinfo fra Shopify.",
        },
        { status: shopRes.status },
      );
    }

    const shopData = await shopRes.json();
    const shop = shopData?.shop ?? {};

    // Enkel første versjon – senere kan vi la AI tolke produkter, tekst osv.
    const profile = {
      storeName: shop.name ?? "",
      industry:
        shop.primary_locale === "nb"
          ? "Norsk nettbutikk"
          : "Generell nettbutikk",
      tone: "nøytral, tydelig og kundevennlig",
      primaryColor: undefined,
      accentColor: undefined,
      styleNotes: undefined,
    };

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (err: any) {
    console.error("auto-brand-profile error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Uventet feil ved auto-analyse.",
        details: err?.message,
      },
      { status: 500 },
    );
  }
}
