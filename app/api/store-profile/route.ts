import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { domain } = await req.json();

    if (!domain || typeof domain !== "string") {
      return NextResponse.json(
        { error: "Mangler eller ugyldig domenenavn." },
        { status: 400 }
      );
    }

    // Sørg for at vi har https://
    const url =
      domain.startsWith("http://") || domain.startsWith("https://")
        ? domain
        : `https://${domain}`;

    // Hent HTML fra forsiden
    const resp = await fetch(url, { method: "GET" });
    if (!resp.ok) {
      return NextResponse.json(
        {
          error:
            "Kunne ikke hente innhold fra nettbutikken. Sjekk URL eller tilgjengelighet.",
        },
        { status: 400 }
      );
    }

    const html = await resp.text();

    const prompt = `
Du får HTML fra en norsk nettbutikk.
Analyser og svar KUN med gyldig JSON (ingen forklaringstekst).

Felt:
- industry: kort beskrivelse av bransje
- style: visuell stil / uttrykk
- tone: skriv kort, f.eks. "rolig", "energisk", "eksklusivt"
- targetAudience: kort beskrivelse
- priceLevel: "lav", "middels", "høy" (grov vurdering)
- mainCategories: liste med 3-8 viktigste kategorier (enkle norske ord)

HTML (trunkert):
${html.slice(0, 8000)}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content || "{}";

    let profile;
    try {
      profile = JSON.parse(raw);
    } catch {
      // fallback hvis modellen legger på noe ekstra
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        profile = JSON.parse(raw.slice(start, end + 1));
      } else {
        throw new Error("Kunne ikke tolke profil-data.");
      }
    }

    return NextResponse.json({ profile });
  } catch (err: any) {
    console.error("store-profile error", err);
    return NextResponse.json(
      {
        error:
          err.message ||
          "Uventet feil under analyse av nettbutikk.",
      },
      { status: 500 }
    );
  }
}
