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
    // 1) Hent Shopify info fra cookies
    const cookieHeader = req.headers.get("cookie");
    const shop = getCookieFromHeader(cookieHeader, "phorium_shop");
    const accessToken = getCookieFromHeader(cookieHeader, "phorium_token");

    if (!shop || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Ingen aktiv Shopify-tilkobling. Logg inn på nytt.",
        },
        { status: 401 },
      );
    }

    // 2) Hent body
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { success: false, error: "Mangler JSON-body." },
        { status: 400 },
      );
    }

    const productId = Number(body.productId);
    const result = body.result;

    if (!productId || !result || !result.title) {
      return NextResponse.json(
        { success: false, error: "Mangler productId eller title.", details: { productId, result } },
        { status: 400 },
      );
    }

    // --- Map til Shopify-format ---
    const payload: any = {
      product: {
        id: productId,
        title: result.title,
      },
    };

    if (result.bodyHtml) {
      payload.product.body_html = result.bodyHtml;
    }

    // SEO → korrekt 2024-API format
    if (result.seoTitle || result.seoDescription) {
      payload.product.seo = {
        ...(result.seoTitle ? { title: result.seoTitle } : {}),
        ...(result.seoDescription ? { description: result.seoDescription } : {}),
      };
    }

    // Tags må være én string separert med komma
    if (Array.isArray(result.tags) && result.tags.length > 0) {
      payload.product.tags = result.tags.join(", ");
    }

    // --- SEND REQUEST TIL SHOPIFY ---
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

    const raw = await shopifyRes.text();

    if (!shopifyRes.ok) {
      console.error("Shopify update error:", raw);
      return NextResponse.json(
        {
          success: false,
          error: "Shopify avviste oppdateringen.",
          details: raw,
        },
        { status: shopifyRes.status },
      );
    }

    let data: any = {};
    try {
      data = JSON.parse(raw);
    } catch {
      // Shopify svarer noen ganger med tom-body ved suksess
    }

    return NextResponse.json({
      success: true,
      product: data.product ?? null,
    });
  } catch (err: any) {
    console.error("UNHANDLED save-product-text error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Uventet feil i save-product-text.",
        details: err?.message,
      },
      { status: 500 },
    );
  }
}
