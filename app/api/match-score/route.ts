import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { brand, text } = await req.json();

    if (!brand || !text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "Brandprofil og tekst mangler." },
        { status: 400 }
      );
    }

    const systemPrompt = `
Du er en AI som evaluerer hvor godt en tekst samsvarer med en brandprofil for en nettbutikk.

Du skal returnere KUN et JSON-objekt med følgende struktur:

{
  "score": 0-100,
  "strengths": ["punkt 1", "punkt 2"],
  "weaknesses": ["punkt 1", "punkt 2"],
  "recommendations": "kort tekst (2–5 setninger) med forbedringsforslag"
}

Tenk over:
- Tone of voice
- Ordvalg
- Formell vs uformell
- Målgruppe
- Brand-kjerneord
- Typisk bransje-stil
- Norske e-commerce forventninger
    `.trim();

    const prompt = `
Brandprofil:
${JSON.stringify(brand, null, 2)}

Tekst som skal vurderes:
${text}
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const raw = response.choices[0].message.content;
    const parsed = JSON.parse(raw);

    return NextResponse.json({ success: true, result: parsed });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Ukjent serverfeil." },
      { status: 500 }
    );
  }
}
