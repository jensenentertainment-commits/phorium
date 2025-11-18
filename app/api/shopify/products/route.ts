import { NextResponse } from "next/server";

const SHOPIFY_API_VERSION = "2024-01";

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
  try {
    // 👇 Les cookies direkte fra requesten
    const cookieHeader = req.headers.get("cookie");
    const shop = getCookieFromHeader(cookieHeader, "phorium_shop");
    const accessToken = getCookieFromHeader(cookieHeader, "phorium_token");

    if (!shop || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ingen aktiv Shopify-tilkobling. Koble til nettbutikk på nytt via Phorium Studio.",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") ?? "20");

    const params = new URLSearchParams();
    params.set("limit", String(Math.min(Math.max(limit, 1), 50)));
    params.set(
      "fields",
      "id,title,handle,status,created_at,updated_at,variants,image,images",
    );

    const url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products.json?${params.toString()}`;

    const res = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Shopify products error:", res.status, text);
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke hente produkter fra Shopify.",
          status: res.status,
          details: text.slice(0, 300),
        },
        { status: 500 },
      );
    }

    const data = await res.json();
    const products: any[] = data?.products ?? [];

    const simplified = products.map((p) => {
      const firstVariant = p.variants?.[0];
      const price = firstVariant?.price ?? null;
      const currency = firstVariant?.currency ?? undefined;
      const image =
        p.image?.src || (p.images && p.images[0]?.src) || null;

      return {
        id: p.id,
        title: p.title,
        handle: p.handle,
        status: p.status,
        price,
        currency,
        image,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
    });

    return NextResponse.json({
      success: true,
      products: simplified,
    });
  } catch (err: any) {
    console.error("products route error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Uventet feil ved henting av produkter.",
        details: err?.message,
      },
      { status: 500 },
    );
  }
}
