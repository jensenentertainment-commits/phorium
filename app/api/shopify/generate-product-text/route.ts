// app/api/shopify/generate-product-text/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  ensureCreditsAvailable,
  consumeCreditsAfterSuccess,
} from "@/lib/credits";

export const runtime = "nodejs";

const apiKey = process.env.OPENAI_API_KEY;
const MODEL = "gpt-4.1-mini";
const CREDITS_PER_CALL = 2;
const FEATURE_KEY = "shopify_generate_product_text";

const openai = new OpenAI({
  apiKey: apiKey!,
});

type GenerateProductTextBody = {
  userId?: string;

  // Shopify-relatert input
  title?: string;
  description?: string;
  productType?: string;
  vendor?: string;
  tags?: string[];

  // Stil / språk
  language?: string; // f.eks. "nb" eller "no"
  tone?: string; // f.eks. "rolig og trygg", "lekent", osv.
};

type GeneratedProductText = {
  title: string;
  short_description: string;
  long_description: string;
  bullets: string[];
  seo_title: string;
  seo_description: string;
};

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY mangler på server.",
        },
        { status: 500 },
      );
    }

    const body = (await req.json()) as GenerateProductTextBody;

    const userId = body.userId;
    const language = body.language || "nb";
    const tone =
      body.tone ||
      "jordnær, konkret, trygg, uten hype, tilpasset norske nettbutikk-kunder";

    const title = (body.title || "").trim();
    const description = (body.description || "").trim();
    const productType = (body.productType || "").trim();
    const vendor = (body.vendor || "").trim();
    const tags = body.tags || [];

    // 1) Krev innlogging (for kreditt-trekk)
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Du må være innlogget for å generere produkttekster.",
        },
        { status: 401 },
      );
    }

    // 2) Minste krav til input
    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error: "Mangler produkttittel (title) fra Shopify.",
        },
        { status: 400 },
      );
    }

    // 3) Kredittsjekk – INGEN trekk ennå
    const creditCheck = await ensureCreditsAvailable(userId, CREDITS_PER_CALL);

    if (!creditCheck.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            creditCheck.error ||
            "Ikke nok kreditter til å generere produkttekst.",
        },
        { status: 403 },
      );
    }

    // 4) Bygg prompt til OpenAI
    const langInstruks =
      language === "en"
        ? "Write all output in natural, fluent English."
        : "Skriv all tekst på naturlig, flytende norsk (bokmål).";

    const baseInfo = `
Produktdata fra Shopify:
- Tittel: ${title || "-"}
- Beskrivelse (rå): ${description || "-"}
- Produkttype / kategori: ${productType || "-"}
- Leverandør / merke: ${vendor || "-"}
- Tags: ${tags.length ? tags.join(", ") : "-"}
`.trim();

    const prompt = `
Du er en spesialisert tekstforfatter for norske nettbutikker, med fokus på høy konvertering og ærlig, jordnær tone.

${langInstruks}

Tone:
- ${tone}
- Unngå klisjéer, hype og tomme superlativer.
- Skriv så det føles som en dyktig butikkmedarbeider forklarer produktet.

Oppgave:
Bruk produktdataene under og skriv en komplett produkttekstpakke for en Shopify-produktside.

Returner KUN JSON i denne strukturen (INGEN ekstra tekst, ingen forklaring):

{
  "title": "...",
  "short_description": "...",
  "long_description": "...",
  "bullets": ["...", "..."],
  "seo_title": "...",
  "seo_description": "..."
}

Retningslinjer:
- "title": kan forbedres litt for tydelighet, men ikke forandre produktet.
- "short_description": 1–2 setninger som raskt forklarer hva produktet er og hvem det passer for.
- "long_description": 2–5 korte avsnitt. Konkret, lettlest, fokus på fordeler + praktisk info.
- "bullets": 3–7 punktlister med nøkkelfordeler eller fakta. Korte, konkrete.
- "seo_title": kort, presis, inkluder gjerne produktnavn + én viktig kvalitet.
- "seo_description": 130–155 tegn metatekst som gir lyst til å klikke, uten clickbait.

${baseInfo}
`.trim();

    // 5) Kall OpenAI (responses API)
    const response = await openai.responses.create({
      model: MODEL,
      input: prompt,
    });

    const textOutput =
      (response as any)?.output?.[0]?.content?.[0]?.text || null;

    if (!textOutput) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI returnerte ikke noe innhold.",
        },
        { status: 502 },
      );
    }

    let parsed: GeneratedProductText;
    try {
      parsed = JSON.parse(textOutput) as GeneratedProductText;
    } catch (err) {
      console.error(
        "[generate-product-text] Klarte ikke å parse JSON-svar:",
        err,
        "Råtekst:",
        textOutput,
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "OpenAI ga et svar som ikke var gyldig JSON. Prøv igjen eller juster prompten.",
        },
        { status: 502 },
      );
    }

    // Enkel sanity-sjekk
    if (!parsed.title || !parsed.short_description || !parsed.long_description) {
      return NextResponse.json(
        {
          success: false,
          error:
            "OpenAI-svaret mangler nødvendige felt (title / short_description / long_description).",
        },
        { status: 502 },
      );
    }

    // 6) Trekk og logg kreditter ETTER suksess
    await consumeCreditsAfterSuccess(userId, CREDITS_PER_CALL, FEATURE_KEY, {
      openaiModel: MODEL,
      // tokensIn / tokensOut kan settes hvis du logger usage senere
    });

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
        error: "Uventet feil under generering av produkttekst.",
        detail: String(err?.message || err),
      },
      { status: 500 },
    );
  }
}
