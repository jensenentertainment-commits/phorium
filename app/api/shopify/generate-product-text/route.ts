// app/api/shopify/generate-product-text/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabaseClient";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

type BrandProfile = {
  storeName?: string;
  industry?: string;
  tone?: string;
  primaryColor?: string;
  accentColor?: string;
  styleNotes?: string;
};

function getCookieFromHeader(header: string | null, name: string): string | null {
  if (!header) return null;
  const parts = header.split(";").map((c) => c.trim());
  const match = parts.find((c) => c.startsWith(name + "="));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const shop = getCookieFromHeader(cookieHeader, "phorium_shop");

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "Mangler tilkoblet Shopify-butikk." },
        { status: 401 },
      );
    }

       const body = await req.json();

    // Prøv flere mulige felt for tittel, i tilfelle frontend sender noe annet enn `title`
    const rawTitle =
      (body.title as string | undefined) ||
      (body.productTitle as string | undefined) ||
      (body.name as string | undefined) ||
      (body.product_name as string | undefined) ||
      (body.product && (body.product.title || body.product.name)) ||
      "";

    const title = (rawTitle || "").toString();

    const bodyText = (body.bodyText as string | undefined) || "";
    const hasExistingDescription =
      typeof body.hasExistingDescription === "boolean"
        ? body.hasExistingDescription
        : bodyText.trim().length > 0;

    const productType = (body.productType as string | undefined) || "";
    const tags = (body.tags as string[] | undefined) || [];
    const handle = (body.handle as string | undefined) || "";
    const vendor = (body.vendor as string | undefined) || "";
    const options = (body.options as any[] | undefined) || [];
    const priceSummary = body.priceSummary ?? null;
    const images = (body.images as any[] | undefined) || [];
    const tone = (body.tone as string | undefined) || "nøytral";

    // Ikke blokker hvis tittel mangler – bruk en generisk fallback
    const safeTitle = title.trim() || "Uten navn";


    // 1) Bygg kontekst til modellen (ren Shopify-data)
        const context = {
      title: safeTitle,
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


    // 2) Hent brandprofil fra Supabase
    const { data: brandRow } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("shop_domain", shop)
      .maybeSingle();

    const brand: BrandProfile | null = brandRow
      ? {
          storeName: brandRow.store_name || undefined,
          industry: brandRow.industry || undefined,
          tone: brandRow.tone || undefined,
          primaryColor: brandRow.primary_color || undefined,
          accentColor: brandRow.accent_color || undefined,
          styleNotes: brandRow.style_notes || undefined,
        }
      : null;

    const brandContext = brand
      ? `
Du skriver som nettbutikken "${brand.storeName || "butikken"}".

Brandprofil:
- Bransje: ${brand.industry || "ikke spesifisert"}
- Tone of voice: ${brand.tone || "nøytral"}
- Primærfarge: ${brand.primaryColor || "ingen spesifisert"}
- Aksentfarge: ${brand.accentColor || "ingen spesifisert"}
- Stilnotater: ${brand.styleNotes || "ingen spesifisert"}

Teksten du lager skal føles som om den er skrevet av nettbutikken selv – ikke av en AI.
`
      : `
Ingen eksplisitt brandprofil. Skriv som en seriøs, tydelig og ærlig norsk nettbutikk, uten cheesy salgsspråk eller tomme fraser.
`;

    // 3) Systemprompt som tvinger komplett Phorium-pakke
    const systemPrompt = `
Du er Phorium – en norsk e-handels-copywriter for Shopify-butikker.

${brandContext}

Du skal generere en komplett "Phorium-pakke" for et produkt i JSON-format:

{
  "description": "Hovedbeskrivelse, 2–4 avsnitt",
  "shortDescription": "Kort oppsummering (1–2 setninger)",
  "seoTitle": "SEO-optimalisert tittel (maks ca 60 tegn)",
  "metaDescription": "Meta-beskrivelse (ca 140–160 tegn)",
  "bullets": ["punktliste", "med fordeler", "..."],
  "tags": ["relevante", "søkeord", "..."],
  "adPrimaryText": "Primær annonsetekst for f.eks. Meta-annonse",
  "adHeadline": "Kort og slagkraftig annonseoverskrift",
  "adDescription": "Tilleggsbeskrivelse til annonsen",
  "socialCaption": "Foreslått caption til Instagram/Facebook",
  "hashtags": ["relevante", "norske", "hashtags"]
}

KRAV:
- Svar KUN med ett JSON-objekt. Ingen ekstra tekst, ingen forklaring.
- Skriv på naturlig, flytende norsk, tilpasset netthandel.
- Ikke skriv at informasjon mangler, og ikke be leseren kontakte kundeservice.
- Hvis det er lite info om produktet:
  - bruk produktnavn, type, kategori og generell forventning til slike produkter
    (f.eks. plantevanningssett → automatisk vanning, praktisk, tidsbesparende, passer til inne-/uteplanter).
- Ikke finn på konkrete tekniske tall (liter, watt, mål osv.) hvis det ikke finnes i dataene.
- Unngå tomme superlativer som "revolusjonerende" og "utrolig fantastisk" med mindre det er naturlig.
`.trim();

    const userPrompt = `
Du får et produkt fra en Shopify-butikk. Lag en komplett Phorium-pakke for dette produktet.

Produktdata (JSON):
${JSON.stringify(context, null, 2)}

Merknad om eksisterende tekst:
- hasExistingDescription = ${hasExistingDescription ? "true" : "false"}.
- Hvis true: bruk eksisterende tekst (bodyText) som inspirasjon, men skriv en NY, bedre og mer strukturert versjon.
- Hvis false: skriv en fullgod, konkret og selgende tekst fra scratch basert på produktnavn, type og kontekst.
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = completion.choices[0].message.content;
    if (!raw) {
      return NextResponse.json(
        {
          success: false,
          error: "Tomt svar fra Phorium Core.",
        },
        { status: 500 },
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = JSON.parse(
        raw.replace(/```json/gi, "").replace(/```/g, "").trim(),
      );
    }

    // Mapp til det frontend forventer: result.*
    const result = {
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
    };

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("Feil i /api/shopify/generate-product-text:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Uventet feil i Shopify tekstgenerator.",
        detail: String(err?.message || err),
      },
      { status: 500 },
    );
  }
}
