import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SHOPIFY_API_VERSION = "2024-01";

type SavePayload = {
  productId: number;
  title: string;
  bodyHtml?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SavePayload;

    const { productId, title, bodyHtml, seoTitle, seoDescription } = body || {};

    if (!productId || !title) {
      return NextResponse.json(
        {
          success: false,
          error: "Mangler productId eller title.",
          details: body,
        },
        { status: 400 },
      );
    }

    const cookieStore = cookies();
    const shop = cookieStore.get("phorium_shop")?.value;
    const token = cookieStore.get("phorium_token")?.value;

    if (!shop || !token) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Mangler Shopify-tilkobling (phorium_shop eller phorium_token). Logg inn / koble til på nytt.",
        },
        { status: 401 },
      );
    }

    // Bygg REST-payload til Shopify
    const productUpdate: any = {
      id: productId,
      title,
    };

    // Bare sett felter hvis vi har noe å lagre
    if (typeof bodyHtml === "string" && bodyHtml.trim().length > 0) {
      productUpdate.body_html = bodyHtml;
    }

    if (typeof seoTitle === "string" && seoTitle.trim().length > 0) {
      productUpdate.metafields_global_title_tag = seoTitle;
    }

    if (
      typeof seoDescription === "string" &&
      seoDescription.trim().length > 0
    ) {
      productUpdate.metafields_global_description_tag = seoDescription;
    }

    const url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`;

    const shopifyRes = await fetch(url, {
      method: "PUT",
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ product: productUpdate }),
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

    let parsed: any = null;
    try {
      parsed = rawText ? JSON.parse(rawText) : null;
    } catch (e) {
      console.warn("Kunne ikke parse Shopify-respons som JSON:", e);
    }

    return NextResponse.json({
      success: true,
      product: parsed?.product ?? null,
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
