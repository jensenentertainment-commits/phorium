// app/api/generate-image/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { useCredits } from "@/lib/credits";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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
    const size =
      body.size === "512x512" ||
      body.size === "768x768" ||
      body.size === "1024x1024"
        ? body.size
        : "1024x1024";

    const userId = body.userId as string | undefined;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "prompt er påkrevd" },
        { status: 400 },
      );
    }

    // 🔹 1) Kreditt-trekk før OpenAI-kall
    if (userId) {
      // Velg antall pr. generering – midlertidig: 5
      const credits = await useCredits(userId, 5);

      if (!credits.ok) {
        return NextResponse.json(
          {
            success: false,
            error:
              credits.error || "Ikke nok kreditter til å generere flere bilder.",
          },
          { status: 403 },
        );
      }
    } else {
      console.warn(
        "[/api/generate-image] Ingen userId – ingen kreditt-trekk (dev/beta)",
      );
    }

    // 🔹 2) Kall til OpenAI bilde-modell
    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size,
      n: 1,
    });

    const img = response.data?.[0];

    const imageUrl =
      img?.url ||
      (img?.b64_json ? `data:image/png;base64,${img.b64_json}` : null);

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke hente bilde-URL fra modellen.",
        },
        { status: 500 },
      );
    }

    // 🔹 3) Returner i samme format VisualsForm forventer → imageUrl
    return NextResponse.json(
      {
        success: true,
        imageUrl,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("generate-image error:", error);

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
