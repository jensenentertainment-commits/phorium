import { NextResponse } from "next/server";

const SHOPIFY_API_VERSION = "2024-01";

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

    const body = await req.json().catch(() => null);

    if (!body || !body.productId) {
      return NextResponse.json(
        { success: false, error: "Mangler productId i body." },
        { status: 400 },
      );
    }

    const productId = body.productId as number;
    const tone = (body.tone as string | undefined) ?? "nøytral";

    // 1) Hent produktet fra Shopify
    const productUrl = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`;

    const productRes = await fetch(productUrl, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!productRes.ok) {
      const text = await productRes.text().catch(() => "");
      console.error("Shopify product error:", productRes.status, text);
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke hente produkt fra Shopify.",
          status: productRes.status,
          details: text.slice(0, 300),
        },
        { status: 500 },
      );
    }

    const productData = await productRes.json();
    const product = productData?.product;

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Fant ikke produktdata." },
        { status: 404 },
      );
    }

    const title = product.title as string;
    const bodyHtml = (product.body_html as string) ?? "";
    const handle = product.handle as string;
    const variants = product.variants ?? [];
    const firstVariant = variants[0] ?? null;
    const price = firstVariant?.price ?? null;

    const plainDescription = bodyHtml
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // 2) Kall OpenAI for å generere tekstpakke
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY mangler på server." },
        { status: 500 },
      );
    }

    const prompt = `
Du er en norsk tekstforfatter for nettbutikker. Du skriver klart, selgende og strukturert.

Du skal lage en komplett tekstpakke for dette produktet:

Tittel: ${title}
Handle: ${handle}
Pris (kan være tom): ${price ?? "ukjent"}
Eksisterende beskrivelse (kan være tom):
"""${plainDescription || "Ingen beskrivelse"}"""

Tone: ${tone}. Skriv på naturlig norsk (Norge), ikke for pompøst.

Returner svaret ditt som ren JSON med følgende nøkler:
- description: Lang, godt strukturert produktbeskrivelse (2–4 avsnitt).
- shortDescription: Kort versjon (1–3 setninger).
- seoTitle: En SEO-tittel på maks ca. 60 tegn.
- metaDescription: En meta description på maks ca. 155 tegn.
- tags: En liste (array) med 5–12 relevante tags (enkle ord eller korte uttrykk).
- bullets: En liste (array) med 3–7 punktlister fordeler/egenskaper.

VIKTIG:
- Ikke bruk markdown, bare innholdet.
- Ikke skriv kommentarer, bare gyldig JSON.
`;

    const completionRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: "Du er en assistent som kun svarer med gyldig JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.6,
      }),
    });

    if (!completionRes.ok) {
      const text = await completionRes.text().catch(() => "");
      console.error("OpenAI error:", completionRes.status, text);
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke generere tekst fra OpenAI.",
          status: completionRes.status,
          details: text.slice(0, 300),
        },
        { status: 500 },
      );
    }

    const completionData = await completionRes.json();
    const rawContent =
      completionData.choices?.[0]?.message?.content ?? "{}";

    let parsed: any = null;
    try {
      parsed = JSON.parse(rawContent);
    } catch (e) {
      console.error("JSON parse error:", e, rawContent);
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke tolke JSON-svaret fra OpenAI.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      productId,
      title,
      handle,
      result: {
        description: parsed.description ?? "",
        shortDescription: parsed.shortDescription ?? "",
        seoTitle: parsed.seoTitle ?? "",
        metaDescription: parsed.metaDescription ?? "",
        tags: parsed.tags ?? [],
        bullets: parsed.bullets ?? [],
      },
    });
  } catch (err: any) {
    console.error("generate-product-text route error:", err);
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
