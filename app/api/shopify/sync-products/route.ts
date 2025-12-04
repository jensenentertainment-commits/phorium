// app/api/shopify/sync-products/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const shop = getCookieFromHeader(cookieHeader, "phorium_shop");
    const accessToken = getCookieFromHeader(cookieHeader, "phorium_token");

    if (!shop || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ingen Shopify-session. Mangler phorium_shop/phorium_token-cookie.",
        },
        { status: 401 },
      );
    }

    let sinceId = 0;
    let totalImported = 0;

    // Loop gjennom ALLE produkter ved å bruke since_id
    // (Shopify returnerer maks 250 per kall)
    // Vi fortsetter til vi får 0 produkter tilbake.
    // Dette unngår alt trøbbel med Link-headers og .get()
    // og skalerer fint opp til 400–500+ produkter.
    // ------------------------------------------------
    for (;;) {
      const url = new URL(
  `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products.json`,
);

url.searchParams.set("limit", "250");
url.searchParams.set("status", "any");             // 👈 ta med active + draft + archived
url.searchParams.set("published_status", "any");   // 👈 ta med published + unpublished

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
        // ferdig – ingen flere sider
        break;
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
            error: `Kunne ikke lagre produkter i databasen: ${error.message}`,
          },
          { status: 500 },
        );
      }

      totalImported += rows.length;

      // Oppdater sinceId til høyeste produkt-ID vi har sett så langt
      const maxIdInBatch = Math.max(
        ...products.map((p: any) => Number(p.id) || 0),
      );
      sinceId = maxIdInBatch;

      // Sikkerhetsnett: hvis noe er helt galt så vi ikke looper evig
      if (rows.length < 250) {
        // Siste side
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
