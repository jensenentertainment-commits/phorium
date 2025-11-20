// app/api/shopify/products/route.ts
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

function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/<[^>]+>/g, "").trim();
}

// Grov Phorium-score basert på hvor "rik" teksten er.
// NB: Krever at vi henter body_html i Shopify-kallet (se lenger ned).
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
    const limit = Number(searchParams.get("limit") || "30");
    const q = (searchParams.get("q") || "").toLowerCase();
    const status = searchParams.get("status") || "any"; // active|draft|archived|any
    const onlyMissingDescription =
      (searchParams.get("missing_description") || "0") === "1";

  const url = new URL(
  `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products.json`,
);
url.searchParams.set("limit", String(limit));

if (status !== "any") {
  url.searchParams.set("status", status);
}

// 👇 VIKTIG – hent mer data fra Shopify
url.searchParams.set(
  "fields",
  "id,title,handle,status,created_at,updated_at,variants,image,images,body_html,tags"
);


    const res = await fetch(url.toString(), {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Shopify products error:", text);
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke hente produkter fra Shopify.",
          details: text.slice(0, 300),
        },
        { status: 500 },
      );
    }

    const data = await res.json();
    let products = Array.isArray(data.products) ? data.products : [];

    // Søk i title/handle
    if (q) {
      products = products.filter((p: any) => {
        const title = (p.title || "").toLowerCase();
        const handle = (p.handle || "").toLowerCase();
        return title.includes(q) || handle.includes(q);
      });
    }

    // Filtrer på manglende beskrivelse (body_html "tom" eller veldig kort)
    if (onlyMissingDescription) {
      products = products.filter((p: any) => {
        const plain = stripHtml(p.body_html);
        return !plain || plain.length < 15;
      });
    }

    const mapped = products.map((p: any) => {
  const price =
    p.variants && p.variants.length > 0
      ? p.variants[0].price
      : undefined;

  const plainDescription = stripHtml(p.body_html);
  const optimization = computeOptimizationScore(p);

  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    status: p.status,
    price,
    image: p.image?.src || null,
    createdAt: p.created_at,
    updatedAt: p.updated_at,

    // Nytt
    plainDescription,
    hasDescription: plainDescription.length > 0,

    optimizationScore: optimization.score,
    optimizationLabel: optimization.label,
    optimizationCharacters: optimization.characters,
  };
});


    return NextResponse.json({
      success: true,
      products: mapped,
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
