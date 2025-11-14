import { NextResponse } from "next/server";
import OpenAI from "openai";
import sharp from "sharp";

export const runtime = "nodejs";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn(
    "[Phorium] OPENAI_API_KEY mangler. Sett den i .env.local og restart dev-server."
  );
}

const client = new OpenAI({ apiKey: apiKey || "" });

type Body = {
  backgroundPrompt: string;
  headline: string;
  subline?: string;
  size?: string; // ønsket sluttstørrelse, f.eks. "1200x628"
};

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY mangler på serveren. Legg den til i .env.local og restart.",
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as Body;

    if (!body?.backgroundPrompt || !body?.headline) {
      return NextResponse.json(
        {
          error: "backgroundPrompt og headline er påkrevd.",
        },
        { status: 400 }
      );
    }

    // 1) Ønsket sluttstørrelse (for Phorium-banneret)
    const [targetWidth, targetHeight] = parseSize(body.size || "1200x628");
    if (!targetWidth || !targetHeight) {
      return NextResponse.json(
        {
          error: "Ugyldig size-format. Bruk f.eks. 1200x628.",
        },
        { status: 400 }
      );
    }

    // 2) Velg en gyldig OpenAI-størrelse basert på ratio
    const openAiSize = chooseOpenAiSize(targetWidth, targetHeight);
    // Må være en av: "1024x1024", "1024x1536", "1536x1024"

    const prompt = `
${body.backgroundPrompt}
Design et kommersielt banner uten tekst, tall, logoer eller vannmerker i motivet.
La komposisjonen ha tydelig plass til tittel og undertekst som skal legges på etterpå.
`;

    // 3) Generer bakgrunn i OpenAI-størrelse
    const imageResult = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: openAiSize,
      n: 1,
      // Ikke send response_format her; vi håndterer både url og b64_json under.
    });

    if (!imageResult.data || !imageResult.data[0]) {
      console.error("[Phorium] Ingen bilde-data fra OpenAI:", imageResult);
      return NextResponse.json(
        { error: "Kunne ikke generere bakgrunnsbilde." },
        { status: 500 }
      );
    }

    const first = imageResult.data[0] as any;

    let rawBuffer: Buffer | null = null;

    // Foretrukket: b64_json dersom tilgjengelig
    if (first.b64_json) {
      rawBuffer = Buffer.from(first.b64_json, "base64");
    }
    // Fallback: url → hent bildefil
    else if (first.url) {
      const imgRes = await fetch(first.url);
      if (!imgRes.ok) {
        console.error(
          "[Phorium] Klarte ikke å hente bilde fra URL:",
          first.url,
          imgRes.status,
          await imgRes.text().catch(() => "")
        );
        return NextResponse.json(
          { error: "Kunne ikke hente generert bilde fra OpenAI." },
          { status: 500 }
        );
      }
      const arrayBuffer = await imgRes.arrayBuffer();
      rawBuffer = Buffer.from(arrayBuffer);
    }

    if (!rawBuffer) {
      console.error("[Phorium] Mangler bildepayload (hverken b64_json eller url).");
      return NextResponse.json(
        { error: "Kunne ikke lese generert bilde." },
        { status: 500 }
      );
    }

    // 4) Resize/crop til ønsket sluttstørrelse (f.eks. 1200x628)
    const bgBuffer = await sharp(rawBuffer)
      .resize(targetWidth, targetHeight, {
        fit: "cover",
        position: "center",
      })
      .toBuffer();

    // 5) Bygg tekst-overlay i SVG
    const headline = sanitize(body.headline);
    const subline = body.subline ? sanitize(body.subline) : "";
    const svg = buildTextOverlaySVG({
      width: targetWidth,
      height: targetHeight,
      headline,
      subline,
    });

    // 6) Komponer bakgrunn + tekst
    const finalBuffer = await sharp(bgBuffer)
      .composite([{ input: Buffer.from(svg), left: 0, top: 0 }])
      .png()
      .toBuffer();

   // 7) Returner PNG som Uint8Array (BodyInit-friendly)
const pngBytes = new Uint8Array(finalBuffer);

return new NextResponse(pngBytes as any, {
  status: 200,
  headers: {
    "Content-Type": "image/png",
  },
});

  } catch (err: any) {
    console.error("[Phorium] Phorium-generate error:", err);
    return NextResponse.json(
      {
        error: "Noe gikk galt ved generering av Phorium-banner.",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}

// ---------- helpers ----------

function parseSize(size: string): [number, number] {
  try {
    const [w, h] = size.split("x").map((n) => parseInt(n.trim(), 10));
    if (!w || !h || Number.isNaN(w) || Number.isNaN(h)) return [0, 0];
    return [w, h];
  } catch {
    return [0, 0];
  }
}

// Velg nærmeste gyldige GPT-Image-1-størrelse basert på ratio
// Lovlige: 1024x1024 (kvadrat), 1536x1024 (wide), 1024x1536 (tall)
function chooseOpenAiSize(
  targetWidth: number,
  targetHeight: number
): "1024x1024" | "1536x1024" | "1024x1536" {
  const ratio = targetWidth / targetHeight;

  // Bredere enn ca 4:3 → wide
  if (ratio > 1.3) return "1536x1024";
  // Smal / høy → tall
  if (ratio < 0.8) return "1024x1536";
  // Ellers kvadrat-ish
  return "1024x1024";
}

function sanitize(text: string): string {
  return text.replace(/[<>]/g, "").trim();
}

function buildTextOverlaySVG({
  width,
  height,
  headline,
  subline,
}: {
  width: number;
  height: number;
  headline: string;
  subline?: string;
}): string {
  const padding = Math.round(width * 0.06);
  const headlineFontSize = Math.max(Math.round(width * 0.07), 32);
  const sublineFontSize = Math.max(Math.round(width * 0.028), 16);

  const headlineY = padding + headlineFontSize;
  const sublineY = headlineY + sublineFontSize + 10;

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .headline {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: ${headlineFontSize}px;
      font-weight: 700;
      fill: #F4F0E6;
      text-shadow: 0px 2px 6px rgba(0,0,0,0.55);
    }
    .subline {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: ${sublineFontSize}px;
      font-weight: 400;
      fill: #E4D7B0;
      text-shadow: 0px 2px 5px rgba(0,0,0,0.55);
    }
  </style>
  <rect x="0" y="0" width="${width}" height="${height}" fill="transparent" />
  <text x="${padding}" y="${headlineY}" class="headline">${escapeXML(
    headline
  )}</text>
  ${
    subline
      ? `<text x="${padding}" y="${sublineY}" class="subline">${escapeXML(
          subline
        )}</text>`
      : ""
  }
</svg>`;
}

function escapeXML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
