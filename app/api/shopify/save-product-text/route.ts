import { NextResponse } from "next/server";

const SHOPIFY_API_VERSION =
  process.env.SHOPIFY_API_VERSION || "2023-10";

/**
 * Forventet body fra frontend:
 * {
 *   productId: number;
 *   title: string;
 *   bodyHtml?: string;
 *   seoTitle?: string;
 *   seoDescription?: string;
 * }
 */
export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Klarte ikke å lese request-body som JSON.",
        },
        { status: 400 },
      );
    }

    const { productId, title, bodyHtml, seoTitle, seoDescription } =
      body || {};

    if (!productId || !title) {
      return NextResponse.json(
        {
          success: false,
          error: "Mangler productId eller title.",
          details: { productId, title },
        },
        { status: 400 },
      );
    }

    const shopDomain = process.env.SHOPIFY_ADMIN_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopDomain || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Mangler Shopify-konfigurasjon. Sett SHOPIFY_ADMIN_DOMAIN og SHOPIFY_ADMIN_ACCESS_TOKEN i miljøvariabler.",
        },
        { status: 500 },
      );
    }

    const url = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`;

    // Bygg kun felter vi faktisk ønsker å oppdatere
    const productPayload: any = {
      id: productId,
    };

    if (title) {
      productPayload.title = title;
    }

    if (bodyHtml) {
      productPayload.body_html = bodyHtml;
    }

    if (seoTitle) {
      // Shopify SEO-tittel
      productPayload.metafields_global_title_tag = seoTitle;
    }

    if (seoDescription) {
      // Shopify SEO-beskrivelse
      productPayload.metafields_global_description_tag =
        seoDescription;
    }

    const shopifyRes = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ product: productPayload }),
    });

    let shopifyJson: any = null;
    try {
      shopifyJson = await shopifyRes.json();
    } catch {
      // hvis Shopify ikke sender JSON tilbake (uvanlig, men vi tar høyde for det)
    }

    if (!shopifyRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Shopify svarte med en feil ved oppdatering av produkt.",
          status: shopifyRes.status,
          shopify: shopifyJson,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        product: shopifyJson?.product ?? shopifyJson ?? null,
      },
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Uventet feil ved lagring til Shopify.",
        details: String(err?.message || err),
      },
      { status: 500 },
    );
  }
}
