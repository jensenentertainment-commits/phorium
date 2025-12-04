// app/api/shopify/products/route.ts
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

function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/<[^>]+>/g, "").trim();
}

// Grov Phorium-score basert på hvor "rik" teksten er.
// (Brukes ikke direkte i denne ruta nå, men beholdes i tilfelle du trenger den.)
function computeOptimizationScore(p: any) {
  const rawHtml = (p.body_html || "") as string;

  // Fjern HTML-tag’er før vi måler tekstlengde
  const plain = rawHtml.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const len = plain.length;

  let score = 0;

  if (len > 40) score = 33;
  if (len > 160) score = 66;
  if (len > 320) score = 100;

  let label = "0% AI-optimalisert";
  if (score === 33) label = "33% AI-optimalisert";
  if (score === 66) label = "66% AI-optimalisert";
  if (score === 100) label = "100% AI-optimalisert";

  return { score, label, characters: len };
}

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const shop = getCookieFromHeader(cookieHeader, "phorium_shop");

    if (!shop) {
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
    const limitRaw = Number(searchParams.get("limit") || "50");
    const pageRaw = Number(searchParams.get("page") || "1");
    const q = (searchParams.get("q") || "").toLowerCase();
    const status = searchParams.get("status") || "any"; // active|draft|archived|any
    const onlyMissingDescription =
      (searchParams.get("missing_description") || "0") === "1";

    const limit = Math.min(Math.max(limitRaw, 1), 250);
    const page = Math.max(pageRaw, 1);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 🔽 Hent FRA SUPABASE i stedet for direkte fra Shopify
    let query = supabaseAdmin
      .from("shopify_products")
      .select(
        `
        id,
        shop_domain,
        shopify_product_id,
        title,
        handle,
        status,
        price,
        image,
        created_at_shopify,
        updated_at_shopify,
        plain_description,
        has_description,
        optimization_score,
        optimization_label,
        optimization_characters
      `,
        { count: "exact" },
      )
      .eq("shop_domain", shop);

    if (status !== "any") {
      query = query.eq("status", status);
    }

    if (onlyMissingDescription) {
      // Mangler beskrivelse: ingen tekst / veldig kort
      // (her antar vi at sync har fylt plain_description + has_description)
      query = query.or(
        "has_description.is.false,plain_description.is.null,plain_description.eq.",
      );
    }

    if (q) {
      const asNumber = Number(q);
      const idFilter =
        !Number.isNaN(asNumber) && Number.isFinite(asNumber)
          ? `shopify_product_id.eq.${asNumber}`
          : "";

      const orParts = [
        `title.ilike.%${q}%`,
        `handle.ilike.%${q}%`,
      ];

      if (idFilter) {
        orParts.push(idFilter);
      }

      query = query.or(orParts.join(","));
    }

    const { data, error, count } = await query
      // du kan endre til created_at_shopify om du heller vil sortere kronologisk
      .order("title", { ascending: true })
      .range(from, to);

    if (error) {
      console.error("Supabase products error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke hente produkter fra databasen.",
          details: String(error.message || "").slice(0, 300),
        },
        { status: 500 },
      );
    }

    const mapped =
      (data || []).map((row: any) => {
        const plainDescription = row.plain_description ?? "";
        const hasDescription =
          typeof row.has_description === "boolean"
            ? row.has_description
            : plainDescription.length > 0;

        return {
          id: row.shopify_product_id, // matcher det ProductsPage forventer
          title: row.title,
          handle: row.handle,
          status: row.status,
          price: row.price,
          image: row.image,
          createdAt: row.created_at_shopify,
          updatedAt: row.updated_at_shopify,
          plainDescription,
          hasDescription,
          optimizationScore: row.optimization_score ?? null,
          optimizationLabel: row.optimization_label ?? null,
          optimizationCharacters: row.optimization_characters ?? null,
        };
      });

    return NextResponse.json({
      success: true,
      products: mapped,
      total: count ?? mapped.length,
    });
  } catch (err: any) {
    console.error("Uventet feil i /api/shopify/products:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Uventet feil ved henting av produkter.",
        details: String(err?.message || err).slice(0, 300),
      },
      { status: 500 },
    );
  }
}
