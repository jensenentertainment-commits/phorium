// app/api/shopify/save-product-text/route.ts
import { NextResponse } from "next/server";

const SHOPIFY_API_VERSION = "2024-01";

function getCookieFromHeader(header: string | null, name: string) {
  if (!header) return null;
  const cookies = header.split(";").map((c) => c.trim());
  const match = cookies.find((c) => c.startsWith(name + "="));
  if (!match) return null;
  return decodeURIComponent(match.split("=")[1]);
}

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const shop = getCookieFromHeader(cookieHeader, "phorium_shop");
    const accessToken = getCookieFromHeader(cookieHeader, "phorium_token");

    if (!shop || !accessToken) {
      return NextResponse.json(
        { success: false, error: "Mangler Shopify-tilkobling." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Mangler request-body." },
        { status: 400 }
      );
    }

    const productId = Number(body.productId);
    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Mangler productId." },
        { status: 400 }
      );
    }

    // Frontend sender disse direkte:
    const {
      title,
      bodyHtml,
      seoTitle,
      seoDescription
    } = body;

    if (!title || !bodyHtml) {
      return NextResponse.json(
        {
          success: false,
          error: "Mangler title eller bodyHtml – Phorium må generere tekst først."
        },
        { status: 400 }
      );
    }

    const payload: any = {
      product: {
        id: productId,
        title,
        body_html: bodyHtml
      }
    };

    if (seoTitle) {
      payload.product.metafields_global_title_tag = seoTitle;
    }
    if (seoDescription) {
      payload.product.metafields_global_description_tag = seoDescription;
    }

    const url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`;

    const shopifyRes = await fetch(url, {
      method: "PUT",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const rawText = await shopifyRes.text();

    if (!shopifyRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Shopify avviste lagringen.",
          details: rawText
        },
        { status: shopifyRes.status }
      );
    }

    let data = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      // Shopify kan returnere irr JSON – helt normalt
    }

    return NextResponse.json({
      success: true,
      product: data
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Uventet feil ved lagring.",
        details: err?.message
      },
      { status: 500 }
    );
  }
}
