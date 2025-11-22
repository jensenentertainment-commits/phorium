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

    const {
      title,
      category,
      oldDescription,
      productAttributes,
    } = await req.json();

    // 1. Hent brandprofil fra Supabase for riktig butikk
    const { data: brandRow } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("shop_domain", shop)
      .maybeSingle();

    const brand: BrandProfile | null = brandRow
      ? {
          storeName: brandRow.store_name,
          industry: brandRow.industry,
          tone: brandRow.tone,
          primaryColor: brandRow.primary_color,
          accentColor: brandRow.accent_color,
          styleNotes: brandRow.style_notes,
        }
      : null;

    // 2. Brand-kontekst
    const brandContext = brand
      ? `
Du skriver som nettbutikken **${brand.storeName}**.

Brandprofil:
- Bransje: ${brand.industry || "ikke spesifisert"}
- Tone of voice: ${brand.tone || "nøytral"}
- Primærfarge: ${brand.primaryColor || "ingen spesifikk"}
- Aksentfarge: ${brand.accentColor || "ingen spesifikk"}
- Stilnotater: ${brand.styleNotes || "ingen spesifisert"}

Du skal skrive tekster som matcher nettbutikkens personlighet og kunder.
`
      : `
Ingen brandprofil er spesifisert. Skriv som en seriøs norsk nettbutikk, uten overdrivelse eller cheesy salgstekster.
`;

    // 3. Prompt som alltid gir deg perfekt format
    const systemPrompt = `
Du er Phorium, en norsk AI-tekstmotor som skriver for nettbutikker.

${brandContext}

Du skal generere en SEO-optimalisert produkttekst for Shopify med følgende format:

{
  "title": "...",
  "description": "...",
  "shortDescription": "...",
  "meta_title": "...",
  "meta_description": "..."
}

Krav:
- Følg brandprofilen helt konsekvent.
- Skriv profesjonelt, norsk og tilpasset e-handel.
- Ikke bruk klisjéer eller overdriv.
- Svar KUN med ett JSON-objekt. Ingen ekstra tekst.
`.trim();

    const userPrompt = `
Produktnavn: ${title}
Kategori: ${category}
Eksisterende tekst: ${oldDescription || "ingen"}
Produktdetaljer: ${JSON.stringify(productAttributes || {})}
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
        { success: false, error: "Tomt svar fra Phorium Core." },
        { status: 500 },
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = JSON.parse(
        raw.replace(/```json/gi, "").replace(/```/g, "").trim(),
      );
    }

    return NextResponse.json({ success: true, data: parsed });
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
