// app/api/generate-text/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { productName, category, tone, extra } = body;

    if (!productName) {
      return NextResponse.json(
        { error: "productName is required" },
        { status: 400 }
      );
    }

    const prompt = `
Du er Phorium, en norsk AI-assistent for kommersielle nettbutikker.

Oppgave:
Skriv en presis, salgbar og troverdig produkttekst basert på fakta.
Unngå floskler og tull, ingen funnet opp funksjoner.

Input:
- Produktnavn: ${productName}
- Kategori: ${category || "ikke oppgitt"}
- Tone: ${tone || "nøktern, kommersiell, tydelig"}
- Ekstra info: ${extra || "ingen"}

Format:
Svar KUN som gyldig JSON med følgende felter:
{
  "title": "...",
  "description": "...",
  "meta_title": "...",
  "meta_description": "..."
}
    `.trim();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(raw);

    return NextResponse.json(
      {
        success: true,
        source: "phorium-core",
        input: { productName, category, tone },
        data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("generate-text error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Kunne ikke generere tekst nå.",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

// Valgfritt: behold GET for rask sanity-check i nettleser
export async function GET() {
  return NextResponse.json({
    status: "ok",
    route: "/api/generate-text",
    note: "Bruk POST med JSON-body for å generere tekst.",
  });
}
