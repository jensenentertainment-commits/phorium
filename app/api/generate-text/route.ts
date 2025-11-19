// app/api/generate-text/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productName = (body.productName as string | undefined) || "";
    const category = (body.category as string | undefined) || "";
    const tone = (body.tone as string | undefined) || "nøytral";

    if (!productName.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Produktnavn mangler.",
        },
        { status: 400 },
      );
    }

    const systemPrompt = `
Du er Phorium, en norsk tekstmotor for nettbutikker.

Du skal lage en kompakt tekstpakke for et produkt, med dette formatet:

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

    // Frontend-en din forventer data.data.* i "manuell" modus
    return NextResponse.json(
      {
        success: true,
        data: {
          title: parsed.title || productName,
          description: parsed.description || "",
          meta_title: parsed.meta_title || parsed.title || productName,
          meta_description: parsed.meta_description || "",
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
