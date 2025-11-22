// app/api/shopify/save-product-text/route.ts
import { NextResponse } from "next/server";

const SHOPIFY_API_VERSION = "2024-01";

function getCookieFromHeader(header: string | null, name: string): string | null {
  if (!header) return null;
  const cookies = header.split(";").map((c) => c.trim());
  const match = cookies.find((c) => c.startsWith(name + "="));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

export async function POST(req: Request) {
  try {
    // 1) Finn butikk + token fra cookies (samme som de andre Shopify-rutene)
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

    // 2) Les body
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { success: false, error: "Mangler JSON-body i requesten." },
        { status: 400 },
      );
    }

    const productId = Number(body.productId);
    const result = body.result;

    if (!productId || !result) {
      return NextResponse.json(
        { success: false, error: "Mangler productId eller result." },
        { status: 400 },
      );
    }

    type FullResult = {
      title?: string;
      shortDescription?: string;
      description?: string;
      bullets?: string[];
      tags?: string[];
      meta_title?: string;
      meta_description?: string;
      bodyHtml?: string;
      seoTitle?: string;
      seoDescription?: string;
    };

    const r = result as FullResult;

    let bodyHtml = "";
    let seoTitle = "";
    let seoDescription = "";
    let tags: string | undefined;

    const hasRichFields =
      r.description ||
      r.shortDescription ||
      (Array.isArray(r.bullets) && r.bullets.length > 0);

    if (hasRichFields) {
      // 3A) "Rikt" result fra generate-product-text
      const parts: string[] = [];

      if (r.title) parts.push(`<h1>${r.title}</h1>`);
      if (r.shortDescription) parts.push(`<p>${r.shortDescription}</p>`);
      if (r.description) parts.push(`<p>${r.description}</p>`);

      if (Array.isArray(r.bullets) && r.bullets.length > 0) {
        const bulletsHtml = r.bullets.map((b) => `<li>${b}</li>`).join("");
        parts.push(`<ul>${bulletsHtml}</ul>`);
      }

      bodyHtml = parts.join("\n");
      seoTitle = r.meta_title || "";
      seoDescription = r.meta_description || "";
      tags = Array.isArray(r.tags) ? r.tags.join(", ") : undefined;
    } else {
      // 3B) Kompakt payload fra buildShopifyPayload() (title/bodyHtml/seoTitle/seoDescription)
      bodyHtml = r.bodyHtml || "";
      seoTitle = r.seoTitle || "";
      seoDescription = r.seoDescription || "";
      // ingen tags i denne varianten – det er helt ok
    }

    const payload: any = {
      product: {
        id: productId,
        ...(bodyHtml && { body_html: bodyHtml }),
      },
    };

    if (seoTitle) {
      payload.product.metafields_global_title_tag = seoTitle;
    }
    if (seoDescription) {
      payload.product.metafields_global_description_tag = seoDescription;
    }
    if (tags) {
      payload.product.tags = tags;
    }

    const url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`;

    const shopifyRes = await fetch(url, {
      method: "PUT",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const rawText = await shopifyRes.text();

    if (!shopifyRes.ok) {
      console.error("Shopify save error:", rawText);
      return NextResponse.json(
        {
          success: false,
          error: "Shopify avviste oppdateringen.",
          details: rawText.slice(0, 500),
        },
        { status: shopifyRes.status },
      );
    }

    let data: any = {};
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        console.warn(
          "Shopify svarte 200, men ikke ren JSON. Ignorerer parse-feil.",
        );
      }
    }

    return NextResponse.json({
      success: true,
      product: data.product ?? null,
    });
  } catch (err: any) {
    console.error("Unexpected save error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Uventet feil ved lagring til Shopify.",
        details: err?.message,
      },
      { status: 500 },
    );
  }
}
