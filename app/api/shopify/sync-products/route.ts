// app/api/shopify/sync-products/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getShopifySession } from "@/lib/shopifySession";

const SHOPIFY_API_VERSION = "2024-01"; // samme versjon som du bruker ellers

export async function POST(req: Request) {
  try {
    const session = await getShopifySession();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ingen Shopify-session (phorium_shop/phorium_token-cookies mangler).",
        },
        { status: 401 },
      );
    }

    const { shop, accessToken } = session;

    // ENKEL SYNC: hent én side fra Shopify (opptil 250 produkter)
    const url = new URL(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products.json`,
    );
    url.searchParams.set("limit", "250");

    const res = await fetch(url.toString(), {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Shopify sync error:", res.status, text);
      return NextResponse.json(
        {
          success: false,
          error: `Feil fra Shopify (${res.status}). Sjekk token/tilganger.`,
        },
        { status: 500 },
      );
    }

    const data = await res.json();
    const products = data.products || [];

    if (!products.length) {
      return NextResponse.json({
        success: true,
        imported: 0,
        message: "Ingen produkter returnert fra Shopify.",
      });
    }

    const rows = products.map((p: any) => {
      const firstImage = p.image?.src || p.images?.[0]?.src || null;
      const hasDescription =
        typeof p.body_html === "string" && p.body_html.trim().length > 0;

      const plainDescription = hasDescription
        ? p.body_html.replace(/<[^>]+>/g, "").trim()
        : null;

      const chars = plainDescription?.length ?? 0;

      let optimizationScore: number | null = null;
      let optimizationLabel: string | null = null;

      if (hasDescription) {
        if (chars < 150) optimizationScore = 33;
        else if (chars < 400) optimizationScore = 66;
        else optimizationScore = 100;
        optimizationLabel = `${optimizationScore}% AI-optimalisert`;
      }

      return {
        shop_domain: shop,
        shopify_product_id: Number(p.id),
        handle: p.handle,
        title: p.title,
        status: p.status,
        price: p.variants?.[0]?.price ?? null,
        image: firstImage,
        created_at_shopify: p.created_at,
        updated_at_shopify: p.updated_at,
        plain_description: plainDescription,
        has_description: hasDescription,
        optimization_score: optimizationScore,
        optimization_label: optimizationLabel,
        optimization_characters: chars,
        updated_at: new Date().toISOString(),
      };
    });

    const { error } = await supabaseAdmin
      .from("shopify_products")
      .upsert(rows, {
        onConflict: "shop_domain,shopify_product_id",
      });

    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json(
        {
          success: false,
          error: `Kunne ikke lagre produkter: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      imported: rows.length,
    });
  } catch (err: any) {
    console.error("Sync-products error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err?.message ||
          (typeof err === "string" ? err : "Uventet feil under sync."),
      },
      { status: 500 },
    );
  }
}
