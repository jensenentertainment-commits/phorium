// app/api/shopify/auto-brand-profile/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const SHOPIFY_API_VERSION = "2024-01";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/** Hent cookie-verdi fra header */
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

/** Veldig enkel HTML → tekst */
function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Sikkert fallback-hex */
function safeHex(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const v = value.trim();
  // enkel sjekk på #RRGGBB
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  return fallback;
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

    // 1) Hent grunnleggende shop-info
    const shopRes = await fetch(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/shop.json`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!shopRes.ok) {
      const txt = await shopRes.text().catch(() => "");
      console.error("Shopify shop.json error:", shopRes.status, txt);
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

    // 2) Hent et lite utvalg produkter (for tone / bransje)
    const productsRes = await fetch(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=12&fields=title,product_type,body_html,tags,handle`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    let productsSample: any[] = [];
    if (productsRes.ok) {
      const pJson = await productsRes.json();
      if (Array.isArray(pJson.products)) {
        productsSample = pJson.products.map((p: any) => ({
          title: p.title || "",
          product_type: p.product_type || "",
          handle: p.handle || "",
          tags: typeof p.tags === "string" ? p.tags : "",
          body_text: stripHtml(p.body_html),
        }));
      }
    } else {
      const txt = await productsRes.text().catch(() => "");
      console.warn("Shopify products.json error:", productsRes.status, txt);
    }

    // 3) (Valgfritt) Prøv å hente theme settings (vi sender rå-data til modellen)
    let themeSettings: any = null;
    try {
      const themesRes = await fetch(
        `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/themes.json`,
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            Accept: "application/json",
          },
          cache: "no-store",
        },
      );

      if (themesRes.ok) {
        const themesJson = await themesRes.json();
        const themes: any[] = Array.isArray(themesJson.themes)
          ? themesJson.themes
          : [];
        const liveTheme =
          themes.find((t) => t.role === "main") ||
          themes.find((t) => t.role === "live") ||
          themes[0];

        if (liveTheme) {
          const assetRes = await fetch(
            `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/themes/${liveTheme.id}/assets.json?asset[key]=config/settings_data.json&theme_id=${liveTheme.id}`,
            {
              headers: {
                "X-Shopify-Access-Token": accessToken,
                Accept: "application/json",
              },
              cache: "no-store",
            },
          );

          if (assetRes.ok) {
            const assetJson = await assetRes.json();
            const asset = assetJson.asset;
            if (asset?.value) {
              try {
                themeSettings = JSON.parse(asset.value);
              } catch {
                themeSettings = asset.value; // send som rå-streng
              }
            }
          }
        }
      }
    } catch (themeErr) {
      console.warn("Klarte ikke å hente theme settings:", themeErr);
    }

    // 4) Bygg kontekst som sendes til OpenAI
    const context = {
      shop: {
        name: shopData?.name || "",
        domain: shopData?.domain || "",
        myshopify_domain: shopData?.myshopify_domain || "",
        country: shopData?.country_name || "",
        country_code: shopData?.country_code || "",
        currency: shopData?.currency || "",
        email: shopData?.email || "",
      },
      productsSample,
      themeSettings,
    };

    // 5) Kall OpenAI for å generere brandprofil
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Du er en norsk merkevare-strateg for Shopify-butikker. Du analyserer butikkdata og foreslår en kort, praktisk brandprofil som kan brukes av et AI-verktøy til å skrive tekster og lage bilder.",
        },
        {
          role: "user",
          content: `
Du får info om en Shopify-butikk: butikkinfo, noen produkter og (muligens) theme settings.

Kontekst (JSON):
${JSON.stringify(context, null, 2)}

Oppgave:
- Anta hvilken bransje butikken tilhører (kort, f.eks. "Kjøkken & interiør", "Dyreutstyr", "Sport & fritid").
- Analyser skrivestilen i produktene (formell/uformell, leken, teknisk, eksklusiv, osv.).
- Bruk theme settings til å finne hovedfarger hvis mulig (hex-koder). Hvis du ikke finner noe fornuftig, velg to passende hex-farger som matcher bransjen og stilen.
- Oppsummer brand-stil kort.

Svar KUN med et gyldig JSON-objekt på denne formen (ingen ekstra tekst):

{
  "storeName": "Navn på butikk slik du vil at det skal vises",
  "industry": "Kort bransjebeskrivelse på norsk",
  "style": "Kort stilbeskrivelse, f.eks. 'minimalistisk', 'lekent', 'eksklusivt', 'naturlig', 'robust', osv.",
  "tone": "1–2 korte setninger om tone of voice på norsk.",
  "primaryColor": "#C8B77A",
  "accentColor": "#ECE8DA",
  "notes": "Valgfri kort merknad om hvordan verktøyet bør tilpasse seg denne butikken."
}

VIKTIG:
- Alle farger skal være gyldige hex-koder på formen #RRGGBB.
- Bruk naturlig norsk.
- Ikke finn på spesifikke sertifiseringer eller lovnader (garanti, medisinske effekter osv.).
        `,
        },
      ],
      temperature: 0.5,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        {
          success: false,
          error: "Tomt svar fra språkmodellen ved brandanalyse.",
        },
        { status: 500 },
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("JSON-parse-feil fra OpenAI (brandprofil):", err, raw);
      return NextResponse.json(
        {
          success: false,
          error:
            "Kunne ikke tolke brandprofilen fra modellen (ugyldig JSON).",
        },
        { status: 500 },
      );
    }

    // 6) Sanitér og fallback-verdier
    const brand = {
      storeName:
        (typeof parsed.storeName === "string" && parsed.storeName.trim()) ||
        shopData?.name ||
        "Butikken din",
      industry:
        (typeof parsed.industry === "string" && parsed.industry.trim()) ||
        "",
      style:
        (typeof parsed.style === "string" && parsed.style.trim()) || "nøytral",
      tone:
        (typeof parsed.tone === "string" && parsed.tone.trim()) ||
        "Naturlig, tydelig og kundevennlig.",
      primaryColor: safeHex(parsed.primaryColor, "#1A4242"),
      accentColor: safeHex(parsed.accentColor, "#C8B77A"),
      notes:
        (typeof parsed.notes === "string" && parsed.notes.trim()) || "",
    };

    // Her lar vi klienten (useBrandProfile) ta seg av lagring i Supabase,
    // slik at samme lagringslogikk brukes som ved manuell redigering.
    return NextResponse.json({
      success: true,
      brand,
      source: "auto" as const,
    });
  } catch (err: any) {
    console.error("Feil i /api/shopify/auto-brand-profile:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          "Uventet feil ved automatisk Shopify-analyse. Prøv igjen om litt.",
      },
      { status: 500 },
    );
  }
}
