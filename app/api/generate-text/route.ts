// app/api/generate-text/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { useCredits } from "@/lib/credits";

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
    const body = await req.json();

    const productName = (body.productName as string | undefined) || "";
    const category = (body.category as string | undefined) || "";
    const tone = (body.tone as string | undefined) || "nøytral";
    const brand = (body.brand as BrandProfile | undefined) || null;
    const userId = body.userId as string | undefined;

    if (!productName.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Produktnavn mangler.",
        },
        { status: 400 },
      );
    }

    // 🔹 Trekk kreditter hvis vi har userId
    // Midlertidig: 2 kreditter per tekstgenerering
    if (userId) {
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
    } else {
      // Dev/beta: vi lar det passere, men logger
      console.warn(
        "[/api/generate-text] Ingen userId sendt inn – hoppet over kreditt-trekk.",
      );
    }

    // Bygg brand-kontekst til prompten
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
  "meta_title": "SEO-tittel (maks ca. 60 tegn)",
  "meta_description": "Meta-beskrivelse (ca. 140–160 tegn)"
}

VIKTIG:
- Svar kun med ett JSON-objekt (ingen ekstra tekst, ingen forklaringer).
- Skriv på god norsk, tilpasset nettbutikk.
- Tilpass tone til parameteren som sendes inn.
- Ikke overdriv eller bruke klisjé-fyll som 'fantastisk' og 'revolusjonerende' uten grunn.
`;

    const userPromptLines = [
      `Produktnavn: ${productName}`,
      category ? `Kategori: ${category}` : "",
      `Tone: ${tone}`,
    ].filter(Boolean);

    const userPrompt = userPromptLines.join("\n");

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
          error: "Tomt svar fra Phorium Core.",
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

    // 🔹 Viktig: PhoriumTextForm forventer `result`, ikke `data`
    return NextResponse.json(
      {
        success: true,
        result: {
          title: parsed.title || productName,
          description: parsed.description || "",
          shortDescription: "", // kan fylles senere
          meta_title: parsed.meta_title || parsed.title || productName,
          meta_description: parsed.meta_description || "",
          bullets: [],
          tags: [],
          ad_primary: "",
          ad_headline: "",
          ad_description: "",
          social_caption: "",
          social_hashtags: [],
        },
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("Feil i /api/generate-text:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Uventet feil i tekstgeneratoren.",
        details: String(err?.message || err),
      },
      { status: 500 },
    );
  }
}
