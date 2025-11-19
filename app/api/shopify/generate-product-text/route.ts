import { NextResponse } from "next/server";
import OpenAI from "openai";

const SHOPIFY_API_VERSION = "2024-01";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function getCookieFromHeader(
  header: string | null,
  name: string,
): string | null {
  if (!header) return null;
  const cookies = header.split(";").map((c) => c.trim());
  const match = cookies.find((c) => c.startsWith(name + "="));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const shop = getCookieFromHeader(cookieHeader, "phorium_shop");
    const accessToken = getCookieFromHeader(cookieHeader, "phorium_token");

    if (!shop || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ingen aktiv Shopify-tilkobling. Koble til nettbutikk på nytt via Phorium Studio.",
        },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { productId, tone = "nøytral" } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Mangler productId" },
        { status: 400 },
      );
    }

    // 1) Hent produktet fra Shopify
    const productRes = await fetch(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        cache: "no-store",
      },
    );

    if (!productRes.ok) {
      const txt = await productRes.text();
      console.error("Shopify product error:", txt);
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke hente produkt fra Shopify.",
          details: txt,
        },
        { status: 500 },
      );
    }

    const { product } = await productRes.json();

    const coreProductData = {
      id: product.id,
      title: product.title,
      handle: product.handle,
      product_type: product.product_type,
      tags: product.tags,
      vendor: product.vendor,
      status: product.status,
      options: product.options,
      variants: product.variants?.map((v: any) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        price: v.price,
        compare_at_price: v.compare_at_price,
      })),
      body_html: product.body_html,
    };

    // 2) Kall OpenAI med norsk, strukturert prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content:
            "Du er Phorium – en norsk AI-tekstforfatter spesialisert på nettbutikker. " +
            "Du skriver naturlig norsk, unngår klisjeer, og tilpasser deg butikkens stil. " +
            "Du svarer alltid som ren JSON uten ekstra tekst.",
        },
        {
          role: "user",
          content: JSON.stringify({
            instruksjon:
              "Lag en komplett tekstpakke for et Shopify-produkt. Alt skal være på flytende norsk, tilpasset e-handel.",
            tone,
            produktdata: coreProductData,
            format: {
              description:
                "Hovedbeskrivelse til Shopify-produktet. 2–5 korte avsnitt, lettlest, fokus på fordeler.",
              shortDescription:
                "Kort versjon / ingress. 1–2 setninger som kan brukes i lister eller som intro.",
              bullets:
                "Liste med 3–7 punkt. Hvert punkt kort og konkret, maks én setning.",
              seoTitle:
                "SEO-tittel (max ca. 60 tegn). Skal både være klikkvennlig og inneholde viktige søkeord.",
              metaDescription:
                "Meta description (max ca. 155 tegn). Selgende, men ikke overdrevent, og beskriver produktet konkret.",
              adPrimaryText:
                "Primær annonsetekst (f.eks. til Meta Ads). 1–3 setninger, litt mer punch enn vanlig produkttekst.",
              adHeadline:
                "Kort annonseoverskrift (f.eks. til Meta/Google). Max ca. 40 tegn.",
              adDescription:
                "Kort beskrivelse til annonsen. 1–2 setninger. Supplerer overskriften.",
              socialCaption:
                "Forslag til SoMe-caption for f.eks. Instagram/TikTok. 1–3 setninger.",
              hashtags:
                "Liste med relevante norske/engelske hashtags. 3–10 stk.",
              tags:
                "Liste med Shopify-tags. Ikke duplikater, ikke for generiske (unngå bare 'tilbud', 'nyhet').",
            },
            output_schema: {
              description: "string",
              shortDescription: "string",
              bullets: "string[]",
              seoTitle: "string",
              metaDescription: "string",
              adPrimaryText: "string",
              adHeadline: "string",
              adDescription: "string",
              socialCaption: "string",
              hashtags: "string[]",
              tags: "string[]",
            },
          }),
        },
      ],
    });

    let parsed: any = {};
    try {
      parsed = JSON.parse(completion.choices[0].message.content || "{}");
    } catch (e) {
      console.error("JSON parse error from OpenAI:", e);
    }

    // 3) Returner strukturert resultat til frontend
    return NextResponse.json({
      success: true,
      result: {
        description: parsed.description || "",
        shortDescription: parsed.shortDescription || "",
        bullets: parsed.bullets || [],
        seoTitle: parsed.seoTitle || "",
        metaDescription: parsed.metaDescription || "",
        adPrimaryText: parsed.adPrimaryText || "",
        adHeadline: parsed.adHeadline || "",
        adDescription: parsed.adDescription || "",
        socialCaption: parsed.socialCaption || "",
        hashtags: parsed.hashtags || [],
        tags: parsed.tags || [],
      },
    });
  } catch (err: any) {
    console.error("generate-product-text error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Uventet feil ved generering av produkttekst.",
        details: err?.message,
      },
      { status: 500 },
    );
  }
}
