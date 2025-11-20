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

      return {
        id: p.id,
        title: p.title,
        handle: p.handle,
        status: p.status,
        price,
        image: p.image?.src || null,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        hasDescription: !!stripHtml(p.body_html),
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
