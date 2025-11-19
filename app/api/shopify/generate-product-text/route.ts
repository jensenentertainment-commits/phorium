// app/api/shopify/generate-product-text/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const SHOPIFY_API_VERSION = "2024-01";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Hjelper for å lese cookies (samme stil som andre Shopify-ruter)
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

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const shop = getCookieFromHeader(cookieHeader, "phorium_shop");
    const accessToken = getCookieFromHeader(cookieHeader, "phorium_token");

    if (!shop || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ingen aktiv Shopify-tilkobling. Koble til nettbutikk via Phorium Studio.",
        },
        { status: 401 },
      );
    }

    const body = await req.json();
    const productId = Number(body.productId);
    const tone = (body.tone as string | undefined) || "nøytral";

    if (!productId || Number.isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: "Mangler eller ugyldig productId." },
        { status: 400 },
      );
    }

    // 1) Hent produktdata fra Shopify
    const productRes = await fetch(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      },
    );

    if (!productRes.ok) {
      const txt = await productRes.text().catch(() => "");
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke hente produkt fra Shopify.",
          details: txt.slice(0, 400),
        },
        { status: 500 },
      );
    }

    const productJson = await productRes.json();
    const product = productJson.product;

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Fant ikke produktdata i Shopify-responsen.",
        },
        { status: 500 },
      );
    }

    // Litt opprydding / utdrag til prompt
    const title = product.title as string;
    const bodyHtml = (product.body_html || "") as string;
    const productType = (product.product_type || "") as string;
    const vendor = (product.vendor || "") as string;
    const tags = (product.tags || "") as string;
    const handle = (product.handle || "") as string;

    const variants = Array.isArray(product.variants)
      ? product.variants.map((v: any) => ({
          title: v.title,
          sku: v.sku,
          price: v.price,
          compare_at_price: v.compare_at_price,
        }))
      : [];

    const options = Array.isArray(product.options)
      ? product.options.map((o: any) => ({
          name: o.name,
          values: o.values,
        }))
      : [];

    const contextBlob = JSON.stringify(
      {
        title,
        body_html: bodyHtml,
        product_type: productType,
        vendor,
        tags,
        handle,
        variants,
        options,
      },
      null,
      2,
    );

    // 2) Kall OpenAI – be om rik struktur, i ren JSON
    const systemPrompt = `
Du er Phorium, en norsk AI-assistent for nettbutikker som lager komplette produkt-tekstpakker.

Du får produktdata fra Shopify (JSON) og skal returnere én ren JSON med dette formatet:

{
  "description": "Hovedbeskrivelse i flytende tekst, 2–4 avsnitt",
  "shortDescription": "Kortere, selgende sammendrag på 1–3 setninger",
  "seoTitle": "SEO-tittel (maks ca. 60 tegn)",
  "metaDescription": "Meta-beskrivelse (ca. 140–160 tegn)",
  "bullets": ["punkt 1", "punkt 2", "punkt 3"],
  "tags": ["nøkkelord 1", "nøkkelord 2"],
  "seoKeywords": ["primært keyword", "sekundært keyword", "long-tail keyword"],
  "adPrimaryText": "Tekst til f.eks. Meta/Google-annonse, 1–3 setninger",
  "adHeadline": "Kort annonseoverskrift",
  "adDescription": "Utfyllende annonsebeskrivelse",
  "socialCaption": "Forslag til caption til sosiale medier",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}

VIKTIG:
- Svar KUN med JSON-objekt, ingen ekstra tekst.
- Skriv på naturlig, flytende norsk.
- Tilpass tone til instruksjonen som blir sendt inn (tone-parameter).
- Ikke finn opp fakta som ikke er troverdige ut fra produktdataen.
`;

    const userPrompt = `
Lag en komplett norsk tekstpakke for dette Shopify-produktet.

Tone: ${tone}

Produktdata (JSON):
${contextBlob}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt.trim() },
        { role: "user", content: userPrompt.trim() },
      ],
    });

    const raw = completion.choices[0].message.content;

    if (!raw) {
      return NextResponse.json(
        {
          success: false,
          error: "Tomt svar fra Phorium Core (OpenAI).",
        },
        { status: 500 },
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // fallback: prøv å rense ```json-innpakning hvis den skulle slippe gjennom
      const cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch (err) {
        return NextResponse.json(
          {
            success: false,
            error: "Kunne ikke tolke svar fra Phorium Core.",
            details: String(err),
            raw,
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        result: parsed,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("Feil i /api/shopify/generate-product-text:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Uventet feil ved generering av produkttekst.",
        details: String(err?.message || err),
      },
      { status: 500 },
    );
  }
}
