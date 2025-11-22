import { NextResponse } from "next/server";

const SHOPIFY_API_VERSION =
  process.env.SHOPIFY_API_VERSION || "2024-01";

function getCookieFromHeader(
  header: string | null,
  name: string,
): string | null {
  if (!header) return null;
  const parts = header.split(";").map((c) => c.trim());
  const match = parts.find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

type LegacyResultShape = {
  title?: string;
  description?: string;
  shortDescription?: string;
  meta_title?: string;
  meta_description?: string;
};

type SaveBody =
  | {
      productId: number | string;
      result?: LegacyResultShape;
      title?: string;
      bodyHtml?: string;
      seoTitle?: string;
      seoDescription?: string;
    }
  | null;

export async function POST(req: Request) {
  try {
    // 1) Hent Shopify-session fra cookies
    const cookieHeader = req.headers.get("cookie");
    const shop = getCookieFromHeader(cookieHeader, "phorium_shop");
    const accessToken = getCookieFromHeader(cookieHeader, "phorium_token");

    if (!shop || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ingen aktiv Shopify-tilkobling. Koble til nettbutikk og prøv igjen.",
        },
        { status: 401 },
      );
    }

    // 2) Les body
    let body: SaveBody = null;
    try {
      body = (await req.json()) as SaveBody;
    } catch {
      return NextResponse.json(
        { success: false, error: "Klarte ikke å lese JSON-body." },
        { status: 400 },
      );
    }

    if (!body) {
      return NextResponse.json(
        { success: false, error: "Tom request-body." },
        { status: 400 },
      );
    }

    // 3) productId
    const productIdRaw = (body as any).productId;
    const productId =
      typeof productIdRaw === "number"
        ? productIdRaw
        : Number(productIdRaw);

    if (!productId || Number.isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: "Mangler gyldig productId." },
        { status: 400 },
      );
    }

    // 4) Finn tekstdata – støtt både gammelt og nytt format
    let title: string | undefined;
    let bodyHtml: string | undefined;
    let seoTitle: string | undefined;
    let seoDescription: string | undefined;

    // Nytt format: sendes fra PhoriumTextForm nå
    if (body.title || body.bodyHtml || body.seoTitle || body.seoDescription) {
      title = body.title;
      bodyHtml = body.bodyHtml;
      seoTitle = body.seoTitle;
      seoDescription = body.seoDescription;
    }

    // Legacy-format: { productId, result: {...} }
    if (!bodyHtml && body.result) {
      const r = body.result;
      title = title || r.title;
      bodyHtml = bodyHtml || r.description || r.shortDescription;
      seoTitle = seoTitle || r.meta_title;
      seoDescription = seoDescription || r.meta_description;
    }

    if (!title && !bodyHtml && !seoTitle && !seoDescription) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Mangler tekstdata å lagre. Ingen av feltene title/bodyHtml/seoTitle/seoDescription (eller result) var satt.",
        },
        { status: 400 },
      );
    }

    // 5) Bygg Shopify payload
    const productPayload: any = {
      id: productId,
    };

    if (title) productPayload.title = title;
    if (bodyHtml) productPayload.body_html = bodyHtml;
    if (seoTitle) productPayload.metafields_global_title_tag = seoTitle;
    if (seoDescription)
      productPayload.metafields_global_description_tag = seoDescription;

    const url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`;

    const shopifyRes = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ product: productPayload }),
    });

    const text = await shopifyRes.text();

    if (!shopifyRes.ok) {
      let msg = text;
      try {
        const parsed = JSON.parse(text);
        if (parsed.errors) {
          msg = JSON.stringify(parsed.errors);
        }
      } catch {
        // ignore
      }

      return NextResponse.json(
        {
          success: false,
          error: `Shopify-feil (${shopifyRes.status}): ${msg}`,
        },
        { status: 502 },
      );
    }

    let product: any = null;
    try {
      const parsed = JSON.parse(text);
      product = parsed.product ?? null;
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    console.error("Uventet feil i save-product-text:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Uventet serverfeil ved lagring av produkttekst.",
      },
      { status: 500 },
    );
  }
}
