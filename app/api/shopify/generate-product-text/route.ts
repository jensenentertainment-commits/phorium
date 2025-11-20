// app/api/shopify/generate-product-text/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const SHOPIFY_API_VERSION = "2024-01";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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
  return input.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
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
            "Ingen aktiv Shopify-tilkobling. Koble til nettbutikk på nytt via Phorium Studio.",
        },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => null);
    const productId = body?.productId as number | undefined;
    const tone = (body?.tone as string | undefined) || "nøytral";

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Mangler productId i body." },
        { status: 400 },
      );
    }

    // 1) Hent produktet fra Shopify
    const productRes = await fetch(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!productRes.ok) {
      const txt = await productRes.text().catch(() => "");
      console.error("Shopify product error:", productRes.status, txt);
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke hente produkt fra Shopify.",
          details: `Status: ${productRes.status}`,
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
          error: "Uventet respons fra Shopify – mangler product-felt.",
        },
        { status: 500 },
      );
    }

    const title: string = product.title || "";
    const bodyHtml: string = product.body_html || "";
    const bodyText = stripHtml(bodyHtml);
    const hasExistingDescription = bodyText.length > 0;

    const productType: string = product.product_type || "";
    const tagsRaw: string = product.tags || "";
    const tags = tagsRaw
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);

    const handle: string = product.handle || "";
    const vendor: string = product.vendor || "";
    const options = product.options || [];
    const variants = product.variants || [];

    const prices = Array.isArray(variants)
      ? variants
          .map((v: any) => parseFloat(v.price))
          .filter((n) => !Number.isNaN(n))
      : [];

    const minPrice = prices.length ? Math.min(...prices) : undefined;
    const maxPrice = prices.length ? Math.max(...prices) : undefined;

    const priceSummary =
      minPrice !== undefined && maxPrice !== undefined
        ? minPrice === maxPrice
          ? `${minPrice.toFixed(2)} kr`
          : `${minPrice.toFixed(2)}–${maxPrice.toFixed(2)} kr`
        : undefined;

    // Ta med noen få bildelenker (kan hjelpe modellen med kontekst på stil/bruk)
    const images = Array.isArray(product.images)
      ? product.images.slice(0, 3).map((img: any) => ({
          src: img.src,
          alt: img.alt || "",
        }))
      : [];

    // Bygg kontekst til modellen
    const context = {
      title,
      bodyText,
      hasExistingDescription,
      productType,
      tags,
      handle,
      vendor,
      options,
      priceSummary,
      images,
      tone,
    };

    // 2) Kall OpenAI og be om "Phorium-pakke" i JSON-format
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Du er en norsk e-handels-copywriter som skriver for Shopify-butikker. Du skal alltid svare i gyldig JSON, uten forklaringstekst. Fokus: salg, tydelighet og naturlig norsk.",
        },
        {
          role: "user",
          content: `
Du får et produkt fra en Shopify-butikk. Skriv en komplett tekstpakke for nettbutikk, SEO, annonser og sosiale medier – på norsk.

Produktdata (JSON):
${JSON.stringify(context, null, 2)}

Viktig om eksisterende tekst:
- hasExistingDescription = ${hasExistingDescription ? "true" : "false"}.
- Hvis true: Forbedre og stram opp eksisterende tekst (bodyText). Behold fakta, men skriv den om til mer kommersiell, lesbar og strukturert tekst.
- Hvis false: Skriv en helt ny tekst fra bunnen av, basert på tittel, produktType, tags, pris og annet du har.

Krav til output (SVAR KUN SOM JSON-OBJEKT – INGEN forklarende tekst rundt):

{
  "description": "Hovedbeskrivelse for produktsiden, 2–4 korte avsnitt.",
  "shortDescription": "Kort ingress/overtekst (1–2 setninger).",
  "seoTitle": "SEO-vennlig tittel, maks ca. 60 tegn.",
  "metaDescription": "Meta-beskrivelse, 140–160 tegn, fokus på CTR.",
  "bullets": [
    "3–6 punktliste med konkrete fordeler og spesifikasjoner."
  ],
  "tags": [
    "5–12 korte stikkord/produkt-tags (små bokstaver, ingen #)."
  ],
  "adPrimaryText": "Primær annonsetekst for Meta/Google (1–3 setninger).",
  "adHeadline": "Kort, punchy annonseoverskrift.",
  "adDescription": "Kort forklarende linje under headline.",
  "socialCaption": "Forslag til caption for Instagram/Facebook, 1–3 setninger.",
  "hashtags": [
    "5–12 relevante hashtags (uten # i selve strengen, det legger vi på senere)."
  ]
}

Tone-krav:
- Tilpass teksten til tonefeltet brukeren har valgt: "${tone}".
- Unngå «AI-stemning» og overbruk av klisjeer som "perfekt til", "må-ha", "magisk", osv.
- Skriv som en menneskelig, kommersiell tekstforfatter for en norsk nettbutikk.
- Ikke finn opp tekniske detaljer du ikke har dekning for; hold deg til det som er sannsynlig og trygt å anta.
        `,
        },
      ],
      temperature: 0.8,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        {
          success: false,
          error: "Tomt svar fra språkmodellen.",
        },
        { status: 500 },
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("JSON-parse-feil fra OpenAI:", err, raw);
      return NextResponse.json(
        {
          success: false,
          error:
            "Kunne ikke tolke tekstresponsen fra modellen (ugyldig JSON).",
        },
        { status: 500 },
      );
    }

    // 3) Returner i formatet PhoriumTextForm forventer
    return NextResponse.json({
      success: true,
      result: {
        description: parsed.description || "",
        shortDescription: parsed.shortDescription || "",
        seoTitle: parsed.seoTitle || "",
        metaDescription: parsed.metaDescription || "",
        bullets: Array.isArray(parsed.bullets) ? parsed.bullets : [],
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        adPrimaryText: parsed.adPrimaryText || "",
        adHeadline: parsed.adHeadline || "",
        adDescription: parsed.adDescription || "",
        socialCaption: parsed.socialCaption || "",
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      },
    });
  } catch (err: any) {
    console.error("Feil i /api/shopify/generate-product-text:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          "Uventet feil ved generering av produkttekst. Prøv igjen om litt.",
      },
      { status: 500 },
    );
  }
}
