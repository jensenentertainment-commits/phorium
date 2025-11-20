// app/api/shopify/brand-profile/route.ts
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

function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export async function GET(req: Request) {
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

    // 1) Hent shop-info
    const shopRes = await fetch(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/shop.json`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!shopRes.ok) {
      const txt = await shopRes.text().catch(() => "");
      console.error("Shopify shop error:", shopRes.status, txt);
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke hente butikkinfo fra Shopify.",
          details: `Status: ${shopRes.status}`,
        },
        { status: 500 },
      );
    }

    const shopJson = await shopRes.json();
    const shopData = shopJson.shop;
    if (!shopData) {
      return NextResponse.json(
        {
          success: false,
          error: "Uventet respons fra Shopify – mangler shop-felt.",
        },
        { status: 500 },
      );
    }

    const shopName: string = shopData.name || "";
    const shopDomain: string = shopData.myshopify_domain || shopData.domain || "";
    const shopEmail: string = shopData.email || "";
    const primaryLocale: string = shopData.primary_locale || "";
    const currency: string = shopData.currency || "";
    const country: string = shopData.country_name || shopData.country || "";

    // 2) Hent noen produkter (for å se bransje / stil)
    const productsRes = await fetch(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=8`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    let products: any[] = [];
    if (productsRes.ok) {
      const productsJson = await productsRes.json();
      products = Array.isArray(productsJson.products)
        ? productsJson.products
        : [];
    }

    const productSnapshot = products.map((p) => ({
      title: p.title,
      product_type: p.product_type,
      tags: (p.tags || "")
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean),
      vendor: p.vendor,
      bodyText: stripHtml(p.body_html),
    }));

    // 3) Bygg kontekst til modellen
    const context = {
      shopName,
      shopDomain,
      shopEmail,
      primaryLocale,
      currency,
      country,
      products: productSnapshot,
    };

    // 4) Kall OpenAI for å lage både storeProfile + brandProfile
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Du analyserer norske nettbutikker (primært Shopify) og lager en kort brandprofil. Svar ALLTID kun med gyldig JSON uten ekstra tekst.",
        },
        {
          role: "user",
          content: `
Du får info om en nettbutikk (fra Shopify) og noen av produktene.
Du skal lage to ting:

1) storeProfile – brukes til å gi kontekst for tekster og bilder:
   - industry: kort bransjebeskrivelse, f.eks. "kjøkkenutstyr", "hund & kjæledyr", "klær & accessories"
   - style: kort stilbeskrivelse, f.eks. "moderne og ren", "lekent og fargerikt", "rustikk og naturlig"
   - tone: kort teksttone, f.eks. "nøytral", "lekent", "eksklusivt", "trygt og folkelig"

2) brandProfile – brukes i Phorium Visuals:
   - name: naturlig navn på butikken (basert på shopName, uten .no/.com hvis mulig)
   - primaryColor: en HEX-farge som passer brandet (f.eks. #C8B77A), du må foreslå én
   - accentColor: en HEX-farge som passer som aksent
   - tone: én av "nøytral", "lekent" eller "eksklusivt" (velg den som passer best)

VIKTIG:
- Ikke finn opp konkrete fakta om produkter; beskriv bare stil og følelse.
- Hvis du er usikker, velg nøytrale, trygge verdier.
- Navnet skal ikke inneholde "Shopify" eller tekniske ting – bare butikk-/brandnavn.

Data (JSON):
${JSON.stringify(context, null, 2)}

Svar KUN som et JSON-objekt på formen:

{
  "storeProfile": {
    "industry": "...",
    "style": "...",
    "tone": "..."
  },
  "brandProfile": {
    "name": "...",
    "primaryColor": "#C8B77A",
    "accentColor": "#ECE8DA",
    "tone": "nøytral"
  }
}
        `,
        },
      ],
      temperature: 0.6,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        {
          success: false,
          error: "Tomt svar fra språkmodellen (brand profile).",
        },
        { status: 500 },
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("JSON-parse-feil (brand-profile):", err, raw);
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke tolke brandprofil (ugyldig JSON).",
        },
        { status: 500 },
      );
    }

    const storeProfile = parsed.storeProfile || {};
    const brandProfile = parsed.brandProfile || {};

    return NextResponse.json({
      success: true,
      storeProfile: {
        industry: storeProfile.industry || "",
        style: storeProfile.style || "",
        tone: storeProfile.tone || "nøytral",
      },
      brandProfile: {
        name: brandProfile.name || shopName || "Butikken din",
        primaryColor: brandProfile.primaryColor || "#C8B77A",
        accentColor: brandProfile.accentColor || "#ECE8DA",
        tone: brandProfile.tone || "nøytral",
      },
    });
  } catch (err: any) {
    console.error("Feil i /api/shopify/brand-profile:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          "Uventet feil ved henting av brandprofil. Prøv igjen om litt.",
      },
      { status: 500 },
    );
  }
}
