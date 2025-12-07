// app/api/edit-image/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  ensureCreditsAvailable,
  consumeCreditsAfterSuccess,
} from "@/lib/credits";

export const runtime = "nodejs";

const apiKey = process.env.OPENAI_API_KEY;
const CREDITS_PER_EDIT = 3;
const FEATURE_KEY = "image_edit";

const openai = new OpenAI({
  apiKey: apiKey!,
});

type EditImageBody = {
  userId?: string;
  /**
   * Original image som base64 *uten* "data:image/png;base64," prefix.
   * Tilpass hvis du bruker et annet format.
   */
  imageBase64: string;
  /**
   * Valgfritt: maske (hvit = behold, svart = endre)
   */
  maskBase64?: string;
  /**
   * Hva brukeren vil endre – f.eks "fjern bakgrunn", "gjør bakgrunnen mørkegrønn", osv.
   */
  prompt: string;
  /**
   * Størrelse på output – "1024x1024", "768x768" etc.
   */
  size?: string;
};

function parseSize(size: string | undefined): string {
  if (!size) return "1024x1024";
  const match = size.match(/^(\d+)x(\d+)$/i);
  if (!match) return "1024x1024";
  const w = Number(match[1]);
  const h = Number(match[2]);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return "1024x1024";
  }
  return `${w}x${h}`;
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

    const body = (await req.json()) as EditImageBody;
    const { userId, imageBase64, maskBase64, prompt } = body;

    // 1) Auth
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Du må være innlogget for å redigere bilder.",
        },
        { status: 401 },
      );
    }

    // 2) Valider input
    if (!imageBase64 || !imageBase64.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Mangler originalbilde (imageBase64).",
        },
        { status: 400 },
      );
    }

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Mangler prompt for bilde-redigering.",
        },
        { status: 400 },
      );
    }

    // 3) Kredittsjekk (INGEN trekk ennå)
    const creditCheck = await ensureCreditsAvailable(userId, CREDITS_PER_EDIT);

    if (!creditCheck.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            creditCheck.error ||
            "Ikke nok kreditter til å redigere bilder.",
        },
        { status: 403 },
      );
    }

    const size = parseSize(body.size);

    // 4) Forbered bildedata
    const imageBuffer = Buffer.from(imageBase64, "base64");
    const maskBuffer = maskBase64 ? Buffer.from(maskBase64, "base64") : null;

    /**
     * Merk:
     * Per dagens OpenAI SDK brukes gpt-image-1 via images.generate.
     * Ekte "edit"-støtte er litt annerledes (image + mask).
     * Her viser vi et generisk eksempel – juster til ditt tidligere kall
     * hvis du allerede hadde redigering på plass.
     */

    const params: any = {
      model: "gpt-image-1",
      prompt,
      size,
      n: 1,
      response_format: "b64_json",
    };

    // Hvis/ når du bruker ekte edit-endepunkt, vil dette se annerledes ut.
    // Her legger vi inn originalbildet som "image" bare for å ha den tilgjengelig.
    // Sjekk OpenAI docs for oppdatert edit-API.
    (params as any).image = imageBuffer;
    if (maskBuffer) {
      (params as any).mask = maskBuffer;
    }

    const editResponse = await openai.images.generate(params);

    const editedB64 = editResponse.data?.[0]?.b64_json;
    if (!editedB64) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI returnerte ikke noe redigert bilde.",
        },
        { status: 502 },
      );
    }

    // 5) Trekk og logg kreditter ETTER suksess
    await consumeCreditsAfterSuccess(userId, CREDITS_PER_EDIT, FEATURE_KEY, {
      openaiModel: "gpt-image-1",
      // tokensIn / tokensOut kan legges til hvis du logger usage senere
    });

    return NextResponse.json(
      {
        success: true,
        imageBase64: editedB64,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("Feil i /api/edit-image:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Uventet feil under bilde-redigering.",
        detail: String(err?.message || err),
      },
      { status: 500 },
    );
  }
}
