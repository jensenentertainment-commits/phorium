// app/api/analyze-tone/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { checkRateLimit } from "lib/rateLimit";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

type ToneResult = {
  tone: string;
  confidence: number;
  styleTags: string[];
  summary: string;
  suggestions: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = (body.text as string | undefined) || "";
    const language = (body.language as string | undefined) || "norsk";
    const userId = (body.userId as string | undefined) || null;

    if (!text.trim()) {
      return NextResponse.json(
        { success: false, error: "Ingen tekst å analysere." },
        { status: 400 },
      );
    }

    // 🔹 RATE LIMIT: gratis, men ikke uendelig
    const ip =
      (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      null;

    const limit = await checkRateLimit({
      route: "/api/analyze-tone",
      userId,
      ip,
      windowSeconds: 60, // vindu på 60 sekunder
      maxRequests: 20,   // f.eks. maks 20 analyser per minutt per bruker/IP
    });

    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Du har gjort mange toneanalyser på kort tid. Vent litt og prøv igjen.",
        },
        { status: 429 },
      );
    }

    const systemPrompt = `
Du er en spesialist på teksttone for netthandel.

Du får en eksisterende tekst fra en nettbutikk, og du skal:
- analysere tone-of-voice
- beskrive hvordan den oppleves
- gi konkrete forslag til forbedring for en moderne nettbutikk

Svar KUN med ett JSON-objekt med følgende struktur:

{
  "tone": "kort beskrivelse av tone-of-voice",
  "confidence": 0.0-1.0,
  "styleTags": ["stikkord", "for", "stil"],
  "summary": "kort tekst (1–3 setninger) som forklarer hvordan teksten oppleves",
  "suggestions": "konkrete tips (2–5 setninger) for å forbedre tonen for netthandel"
}

Skriv alle tekster på ${language}.
`.trim();

    const userPrompt = `
Analyser denne teksten fra en nettbutikk og gi JSON-responsen beskrevet over:

---
${text}
---
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
        { success: false, error: "Tomt svar fra analysen." },
        { status: 500 },
      );
    }

    let parsed: ToneResult;
    try {
      parsed = JSON.parse(raw) as ToneResult;
    } catch {
      const cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      parsed = JSON.parse(cleaned) as ToneResult;
    }

    return NextResponse.json(
      {
        success: true,
        result: {
          tone: parsed.tone,
          confidence: parsed.confidence,
          styleTags: parsed.styleTags || [],
          summary: parsed.summary,
          suggestions: parsed.suggestions,
        },
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("Feil i /api/analyze-tone:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Uventet feil i tone-analysen.",
        detail: String(err?.message || err),
      },
      { status: 500 },
    );
  }
}
