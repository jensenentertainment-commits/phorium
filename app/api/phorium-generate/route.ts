import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  ensureCreditsAvailable,
  consumeCreditsAfterSuccess,
} from "@/lib/credits";
// Hvis du har aktivitetslogging:
import { logActivity } from "@/lib/activityLog";

export const runtime = "nodejs";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn(
    "[Phorium] OPENAI_API_KEY mangler. Sett den i .env.local og restart dev-server.",
  );
}

const client = new OpenAI({
  apiKey: apiKey!,
});

type PhoriumGenerateBody = {
  userId?: string;
  backgroundPrompt: string;
  headline: string;
  subline?: string;
  size?: string; // f.eks. "1200x628"
  brandPrimary?: string;
  brandSecondary?: string;
  brandTextColor?: string;
};

type PhoriumGenerateResult = {
  svg: string;
  width: number;
  height: number;
};

const DEFAULT_SIZE = "1200x628";
const CREDITS_PER_RUN = 6;
const FEATURE_KEY = "phorium_generate";

function parseSize(size: string): [number, number] | [null, null] {
  const match = size.match(/^(\d+)x(\d+)$/i);
  if (!match) return [null, null];
  const w = Number(match[1]);
  const h = Number(match[2]);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return [null, null];
  }
  return [w, h];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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

    const body = (await req.json()) as PhoriumGenerateBody;

    const userId = body.userId;
    const backgroundPrompt = body.backgroundPrompt?.trim();
    const headline = body.headline?.trim();
    const subline = body.subline?.trim() || "";
    const size = body.size || DEFAULT_SIZE;

    // 1) Krev innlogging
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Du må være innlogget for å generere bannere.",
        },
        { status: 401 },
      );
    }

    // 2) Valider input
    if (!backgroundPrompt || !headline) {
      return NextResponse.json(
        {
          success: false,
          error: "backgroundPrompt og headline er påkrevd.",
        },
        { status: 400 },
      );
    }

    const [targetWidth, targetHeight] = parseSize(size);
    if (!targetWidth || !targetHeight) {
      return NextResponse.json(
        {
          success: false,
          error: "Ugyldig size-format. Bruk f.eks. 1200x628.",
        },
        { status: 400 },
      );
    }

    // 3) Sjekk at bruker har nok kreditter (INGEN trekk ennå)
    const creditCheck = await ensureCreditsAvailable(userId, CREDITS_PER_RUN);

    if (!creditCheck.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            creditCheck.error ||
            "Ikke nok kreditter til å kjøre Phorium generate.",
        },
        { status: 403 },
      );
    }

    // 4) Bygg prompt til GPT-Image
    const brandPrimary = body.brandPrimary || "#1A4242";
    const brandSecondary = body.brandSecondary || "#C8B77A";
    const brandTextColor = body.brandTextColor || "#FFFFFF";

    const imagePrompt = `
Highly polished ecommerce banner background, no text, no logos.
Style: premium, minimal, Scandinavian ecommerce, soft gradients and subtle depth.
Use colors that complement:
- Primary: ${brandPrimary}
- Secondary: ${brandSecondary}

Scene description:
${backgroundPrompt}

Do NOT include any text in the image. No words, no letters.
Just a clean, high-end background optimized for overlaying UI text.
`.trim();

    // 5) Kall GPT-Image-1 for å generere bakgrunn
    const imageResponse = await client.images.generate({
      model: "gpt-image-1",
      prompt: imagePrompt,
      size: "1024x1024", // vi skalerer inn i SVG uansett
      n: 1,
      response_format: "b64_json",
    });

    const imgData = imageResponse.data?.[0]?.b64_json;
    if (!imgData) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI returnerte ikke noe bilde.",
        },
        { status: 502 },
      );
    }

    const bgHref = `data:image/png;base64,${imgData}`;

    // 6) Bygg SVG-banner med bilde + tekst
    const safeHeadline = escapeXml(headline);
    const safeSubline = escapeXml(subline);

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${targetWidth}" height="${targetHeight}" viewBox="0 0 ${targetWidth} ${targetHeight}" role="img">
  <defs>
    <clipPath id="clip">
      <rect x="0" y="0" width="${targetWidth}" height="${targetHeight}" rx="32" ry="32" />
    </clipPath>
  </defs>

  <!-- Bakgrunnsbilde -->
  <image
    href="${bgHref}"
    x="0"
    y="0"
    width="${targetWidth}"
    height="${targetHeight}"
    preserveAspectRatio="xMidYMid slice"
    clip-path="url(#clip)"
  />

  <!-- Gradient overlay for lesbar tekst -->
  <rect
    x="0"
    y="0"
    width="${targetWidth}"
    height="${targetHeight}"
    fill="url(#overlayGradient)"
    clip-path="url(#clip)"
  />

  <defs>
    <linearGradient id="overlayGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(0,0,0,0.35)" />
      <stop offset="40%" stop-color="rgba(0,0,0,0.25)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.55)" />
    </linearGradient>
  </defs>

  <!-- Tekstblokk -->
  <g transform="translate(64, ${targetHeight / 2 - 40})">
    <text
      x="0"
      y="0"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
      font-size="40"
      font-weight="700"
      fill="${brandTextColor}"
      dominant-baseline="hanging"
    >
      ${safeHeadline}
    </text>

    ${
      safeSubline
        ? `<text
      x="0"
      y="56"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
      font-size="22"
      font-weight="400"
      fill="${brandTextColor}"
      opacity="0.9"
      dominant-baseline="hanging"
    >
      ${safeSubline}
    </text>`
        : ""
    }
  </g>

  <!-- Subtil border -->
  <rect
    x="0.5"
    y="0.5"
    width="${targetWidth - 1}"
    height="${targetHeight - 1}"
    rx="32"
    ry="32"
    fill="none"
    stroke="${brandSecondary}"
    stroke-width="1"
    opacity="0.7"
  />
</svg>
`.trim();

    // 7) Trekk og logg kreditter ETTER at alt har gått bra
    await consumeCreditsAfterSuccess(userId, CREDITS_PER_RUN, FEATURE_KEY, {
      openaiModel: "gpt-image-1",
      // tokensIn / tokensOut kan legges til senere hvis du vil
    });

    // (valgfritt) logg aktivitet i din egen logg-tabell
    try {
      await logActivity({
        userId,
        eventType: "PHORIUM_GENERATE",
        meta: {
          credits_charged: CREDITS_PER_RUN,
          size,
          brandPrimary,
          brandSecondary,
        },
      });
    } catch (err) {
      console.warn("[Phorium] Klarte ikke å logge aktivitet:", err);
    }

    const result: PhoriumGenerateResult = {
      svg,
      width: targetWidth,
      height: targetHeight,
    };

    return NextResponse.json(
      {
        success: true,
        result,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("Feil i /api/phorium-generate:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Uventet feil under banner-generering.",
        detail: String(err?.message || err),
      },
      { status: 500 },
    );
  }
}
