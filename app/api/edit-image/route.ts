import { NextResponse } from "next/server";
import { useCredits } from "@/lib/credits"; // 👈 NY!
import { logActivity } from "@/lib/activityLog";


export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Mangler OPENAI_API_KEY i .env.local" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const promptRaw = formData.get("prompt");
    const prompt = typeof promptRaw === "string" ? promptRaw.trim() : "";
    const userId = formData.get("userId") as string | null; // 👈 NY!

    if (!file || !prompt) {
      return NextResponse.json(
        { success: false, error: "Både bilde og prompt er påkrevd." },
        { status: 400 }
      );
    }

    // 🔹 1) Kreditt-trekk
    // edit-image = produktscene → foreslår 5 credits
    if (userId) {
      const creditResult = await useCredits(userId, 5);

      if (!creditResult.ok) {
        return NextResponse.json(
          {
            success: false,
            error:
              creditResult.error ||
              "Ikke nok kreditter til å generere flere produktbilder.",
          },
          { status: 403 }
        );
      }
    } else {
      // Lokalt: ingen userId → ingen trekk
      console.warn("[/api/edit-image] Ingen userId – hoppet over kreditt-trekk (dev/beta)");
    }

    // 🔹 2) Send redigeringen videre til OpenAI
    const upstream = new FormData();
    upstream.append("model", "gpt-image-1");
    upstream.append("prompt", prompt);
    upstream.append("image", file); // bruker opplastet fil direkte

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: upstream,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI edit error:", data);
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI avviste bilde-redigeringen.",
          details: data?.error?.message || JSON.stringify(data),
        },
        { status: response.status }
      );
    }

    const img = data?.data?.[0];
    const imageUrl =
      img?.url ||
      (img?.b64_json ? `data:image/png;base64,${img.b64_json}` : null);

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke hente redigert bilde fra modellen.",
        },
        { status: 500 }
      );
    }

    await logActivity({
      userId,
      eventType: "IMAGE_GENERATED", // eller "IMAGE_EDITED" hvis du vil skille de
      meta: {
        kind: "edit",
        credits_charged: 5,
        note: "Existing image edited with new background/overlay",
      },
    });

    return NextResponse.json({ success: true, imageUrl });

  } catch (error: any) {
    console.error("edit-image error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Kunne ikke redigere bilde.",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
