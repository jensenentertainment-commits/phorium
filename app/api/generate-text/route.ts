// app/api/generate-text/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { useCredits } from "@/lib/credits";
import { logActivity } from "@/lib/activityLog";

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

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Mangler OPENAI_API_KEY i miljøvariabler.",
        },
        { status: 500 },
      );
    }

    const body = await req.json();

    const productName = (body.productName as string | undefined) || "";
    const category = (body.category as string | undefined) || "";
    const tone = (body.tone as string | undefined) || "nøytral";

    // PhoriumTextForm sender "brandProfile"
    const brand = (body.brandProfile as BrandProfile | undefined) || null;

    const userId = body.userId as string | undefined;

    // 1) Må ha userId
    if (!userId) {
      console.warn("[/api/generate-text] Mangler userId – avbryter.");
      return NextResponse.json(
        {
          success: false,
          error: "Du må være innlogget for å generere tekst.",
        },
        { status: 401 },
      );
    }

    // 2) Må ha produktnavn
    if (!productName.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Produktnavn mangler.",
        },
        { status: 400 },
      );
    }

    // 3) Kredittsjekk – 2 kreditter per generering
    const creditResult = await useCredits(userId, 2);

    if (!creditResult.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            creditResult.error ||
            "Ikke nok kreditter til å generere mer tekst.",
        },
        { status: 403 },
      );
    }

    // 4) Brand-kontekst
    const brandContext = brand
      ? `
Du skriver for en spesifikk nettbutikk med denne brandprofilen:

- Butikknavn: ${brand.storeName || "ikke oppgitt"}
- Bransje: ${brand.industry || "ikke oppgitt"}
- Tone of voice: ${brand.tone || "nøytral"}
- Primærfarge: ${brand.primaryColor || "ingen spesifikk"}
- Aksentfarge: ${brand.accentColor || "ingen spesifikk"}
- Stilnotater: ${brand.styleNotes || "ingen spesielle notater"}

Du skal skrive tekst som om du er denne butikken, ikke en generisk AI.
`
      : `
Du har ikke eksplisitt brandprofil, så skriv som en seriøs, tydelig og selgende norsk nettbutikk uten å være cheesy.
`;

    const systemPrompt = `
Du er Phorium, en norsk tekstmotor for nettbutikker.

${brandContext}

Du skal lage en kompakt tekstpakke for et produkt, med dette formatet (JSON):

{
  "title": "Produktnavn optimalisert for salg",
  "description": "Hovedbeskrivelse, 1–3 avsnitt",
  "shortDescription": "Kortere salgstekst hvis relevant",
  "meta_title": "SEO-tittel (maks ca. 60 tegn)",
  "meta_description": "Meta-beskrivelse (ca. 140–160 tegn)",
  "bullets": ["punkt 1", "punkt 2", ...],
  "tags": ["tag1", "tag2", ...],
  "ad_primary": "Primær annonsetekst",
  "ad_headline": "Annonseoverskrift",
  "ad_description": "Annonsebeskrivelse",
  "social_caption": "Forslag til caption",
  "social_hashtags": ["tag1", "tag2", ...]
}

VIKTIG:
- Svar kun med ett JSON-objekt (ingen ekstra tekst, ingen forklaringer).
- Skriv på god norsk, tilpasset nettbutikk.
- Tilpass tone til parameteren som sendes inn.
- Ikke overdriv eller bruk klisjé-fyll som "fantastisk" og "revolusjonerende" uten grunn.
`.trim();

    const userPromptLines = [
      `Produktnavn: ${productName}`,
      category ? `Kategori: ${category}` : "",
      `Tone: ${tone}`,
    ].filter(Boolean);

    const userPrompt = userPromptLines.join("\n");

    // 5) OpenAI-kall
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content;

    await logActivity({
  userId, // fra body eller session
  eventType: "TEXT_GENERATED",
  meta: {
    source: body.source || "manual", // hvis du har noe lignende
    credits_charged: 2,
    productName: body.productName ?? null,
  },
});

    if (!raw) {
      return NextResponse.json(
        {
          success: false,
          error: "Tomt svar fra tekstmotoren.",
        },
        { status: 500 },
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      parsed = JSON.parse(cleaned);
    }

    // 6) Returner i formatet PhoriumTextForm forventer
    return NextResponse.json(
      {
        success: true,
        result: {
          title: parsed.title || productName,
          description: parsed.description || "",
          shortDescription: parsed.shortDescription || "",
          meta_title: parsed.meta_title || parsed.title || productName,
          meta_description:
            parsed.meta_description || parsed.description || "",
          bullets: parsed.bullets || [],
          tags: parsed.tags || [],
          ad_primary: parsed.ad_primary || "",
          ad_headline: parsed.ad_headline || "",
          ad_description: parsed.ad_description || "",
          social_caption: parsed.social_caption || "",
          social_hashtags: parsed.social_hashtags || [],
        },
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("[/api/generate-text] Uventet feil:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err?.message ||
          "Noe gikk galt under tekstgenereringen. Prøv igjen om litt.",
      },
      { status: 500 },
    );
  }
}
