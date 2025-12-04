// app/api/shopify/sync-products/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getShopifySession } from "@/lib/shopifySession";

const SHOPIFY_API_VERSION = "2024-01";

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").trim();
}

export async function POST(req: Request) {
  try {
    const session = await getShopifySession();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Ingen Shopify-session. Logg inn / koble til Shopify på nytt.",
        },
        { status: 401 },
      );
    }

    const { shop, accessToken } = session;

    let sinceId = 0;
    let totalImported = 0;

    for (;;) {
      const url = new URL(
        `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products.json`,
      );

      // Shopify: maks 250 per kall
      url.searchParams.set("limit", "250");
      // Ta med alle statuser (active + draft + archived)
      url.searchParams.set("status", "any");

      if (sinceId > 0) {
        url.searchParams.set("since_id", String(sinceId));
      }

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
            error: `Feil fra Shopify under sync: ${res.status}`,
          },
          { status: 500 },
        );
      }

      const data = await res.json();
      const products = data.products || [];

      if (!products.length) {
        // Ingen flere produkter → ferdig
        break;
      }

      const rows = products.map((p: any) => {
        const plain = stripHtml(p.body_html);
        const hasDescription = plain.length > 0;
        const chars = plain.length;

        let optimizationScore: number | null = null;
        let optimizationLabel: string | null = null;

        if (hasDescription) {
          if (chars < 150) optimizationScore = 33;
          else if (chars < 400) optimizationScore = 66;
          else optimizationScore = 100;
          optimizationLabel = `${optimizationScore}% AI-optimalisert`;
        }

        const firstImage = p.image?.src || p.images?.[0]?.src || null;

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
          plain_description: plain,
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
            error: `Kunne ikke lagre produkter i databasen: ${error.message}`,
          },
          { status: 500 },
        );
      }

      totalImported += rows.length;

      // Finn høyeste ID i denne batchen
      const maxIdInBatch = Math.max(
        ...products.map((p: any) => Number(p.id) || 0),
      );

      // Sikkerhetsnett: hvis vi ikke kommer oss videre, ikke loop evig
      if (maxIdInBatch <= sinceId) {
        break;
      }

      sinceId = maxIdInBatch;

      // Hvis vi fikk mindre enn 250 i denne batchen, var dette siste side
      if (products.length < 250) {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      imported: totalImported,
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
