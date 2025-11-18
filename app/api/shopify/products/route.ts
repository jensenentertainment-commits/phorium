import { NextResponse } from "next/server";
import { getShopifySession } from "@/lib/shopifySessions";

const SHOPIFY_API_VERSION = "2024-01";

export async function GET(req: Request) {
  try {
    const session = await getShopifySession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Ingen tilkoblet Shopify-butikk funnet (connected_stores er tom).",
        },
        { status: 401 },
      );
    }

    const { shop, accessToken } = session;

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
