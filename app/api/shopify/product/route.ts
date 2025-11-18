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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Mangler produkt-id (?id=...)." },
        { status: 400 },
      );
    }

    const productUrl = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${id}.json`;
    const metafieldsUrl = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${id}/metafields.json`;

    const [productRes, metafieldsRes] = await Promise.all([
      fetch(productUrl, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }),
      fetch(metafieldsUrl, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }),
    ]);

    if (!productRes.ok) {
      const text = await productRes.text().catch(() => "");
      console.error("Shopify product error:", productRes.status, text);
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke hente produkt fra Shopify.",
          status: productRes.status,
          details: text.slice(0, 300),
        },
        { status: 500 },
      );
    }

    const productData = await productRes.json();
    const metafieldsData = metafieldsRes.ok
      ? await metafieldsRes.json()
      : { metafields: [] };

    const product = productData?.product;
    const metafields = metafieldsData?.metafields ?? [];

    return NextResponse.json({
      success: true,
      product,
      metafields,
    });
  } catch (err: any) {
    console.error("product route error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Uventet feil ved henting av produkt.",
        details: err?.message,
      },
      { status: 500 },
    );
  }
}
