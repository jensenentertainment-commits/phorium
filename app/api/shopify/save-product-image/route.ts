// app/api/shopify/save-product-image/route.ts
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
    // Hent Shopify-data fra cookies (samme som i save-product-text)
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

    const { imageDataUrl, alt } = body as {
      imageDataUrl?: string;
      alt?: string;
    };

    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Mangler imageDataUrl – Phorium må generere eller velge et bilde først."
        },
        { status: 400 }
      );
    }

    // imageDataUrl forventes i format:
    // "data:image/png;base64,AAAA..." eller "data:image/jpeg;base64,BBBB..."
    const match = imageDataUrl.match(/^data:image\/[a-zA-Z0-9+.-]+;base64,(.+)$/);

    if (!match || !match[1]) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ugyldig bildeformat. Forventet data-URL (data:image/...;base64,...)"
        },
        { status: 400 }
      );
    }

    const base64 = match[1];

    const payload: any = {
      image: {
        attachment: base64,
        alt: alt || "Produktbilde generert av Phorium"
        // Her kan vi senere legge til:
        // position, variant_ids, osv. om vi ønsker mer kontroll
      }
    };

    const url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}/images.json`;

    const shopifyRes = await fetch(url, {
      method: "POST",
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
          error: "Shopify avviste bilde-lagringen.",
          details: rawText || `Status: ${shopifyRes.status}`
        },
        { status: shopifyRes.status }
      );
    }

    let data: any = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      // Shopify kan returnere rare formater – da bare sender vi rå-tekst videre
      data = { raw: rawText };
    }

    return NextResponse.json({
      success: true,
      image: data.image ?? data
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Uventet feil ved lagring av produktbilde.",
        details: err?.message
      },
      { status: 500 }
    );
  }
}
