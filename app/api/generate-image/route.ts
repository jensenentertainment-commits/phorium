// app/api/generate-image/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import sharp from "sharp";
import { useCredits } from "@/lib/credits";
import { logActivity } from "@/lib/activityLog";


const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Tillatte mål-formater som UI-en din kan sende inn
const TARGET_SIZES: Record<
  string,
  {
    width: number;
    height: number;
  }
> = {
  "1024x1024": { width: 1024, height: 1024 }, // kvadrat
  "1200x628": { width: 1200, height: 628 }, // hero-banner
  "1080x1350": { width: 1080, height: 1350 }, // feed / portrett
  "1080x1920": { width: 1080, height: 1920 }, // story
};

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Mangler OPENAI_API_KEY i .env.local" },
        { status: 500 },
      );
    }

    const body = await req.json().catch(() => ({}));

    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const requestedSize: string =
      typeof body.size === "string" ? body.size : "1024x1024";
    const userId = body.userId as string | undefined;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "prompt er påkrevd" },
        { status: 400 },
      );
    }

    // 1) Må være innlogget
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Du må være innlogget for å generere bilder.",
        },
        { status: 401 },
      );
    }

    // 2) Kredittsjekk – 4 kreditter per standardbilde
    const creditResult = await useCredits(userId, 4);

    if (!creditResult.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            creditResult.error ||
            "Ikke nok kreditter til å generere flere bilder.",
        },
        { status: 403 },
      );
    }

    // 3) Finn ønsket målformat – fallback til 1024x1024
    const target =
      TARGET_SIZES[requestedSize] ?? TARGET_SIZES["1024x1024"];

    // OpenAI støtter kun noen faste størrelser – vi genererer kvadratisk
    const baseSize = "1024x1024";

    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: baseSize,
      n: 1,
      // ⚠️ Ingen response_format her – gpt-image-1 returnerer alltid b64_json
    });

    const img = response.data?.[0];
    const b64 = (img as any)?.b64_json as string | undefined;

    if (!b64) {
      console.error(
        "[/api/generate-image] Mangler b64_json i svar:",
        JSON.stringify(response, null, 2),
      );
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke hente bilde-data fra modellen.",
        },
        { status: 500 },
      );
    }

    // 4) Dekod base64 → buffer
    const baseBuffer = Buffer.from(b64, "base64");

    // 5) Resize/crop til ønsket format med sharp
    const resizedBuffer = await sharp(baseBuffer)
      .resize(target.width, target.height, {
        fit: "cover", // fyller hele rammen og croper overskudd
        position: "centre",
      })
      .png()
      .toBuffer();

    const finalB64 = resizedBuffer.toString("base64");
    const dataUrl = `data:image/png;base64,${finalB64}`;

      // ... etter at du har laget dataUrl, før return:
    await logActivity({
      userId,
      eventType: "IMAGE_GENERATED",
      meta: {
        kind: "standard",
        requestedSize,
        finalSize: `${target.width}x${target.height}`,
        credits_charged: 4,
      },
    });

    // 6) Returner i formatet PhoriumVisualsForm forventer
    return NextResponse.json(
      {
        success: true,
        imageUrl: dataUrl,
        width: target.width,
        height: target.height,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[/api/generate-image] Uventet feil:", error);

    const details =
      error?.response?.data ||
      error?.message ||
      JSON.stringify(error, null, 2);

    return NextResponse.json(
      {
        success: false,
        error: "Kunne ikke generere bilde.",
        details,
      },
      { status: 500 },
    );
  }
}
