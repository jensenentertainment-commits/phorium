// app/api/shopify/store-identity/route.ts
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

async function shopifyFetch(
  shop: string,
  token: string,
  path: string,
  init?: RequestInit,
) {
  const res = await fetch(
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/${path}`,
    {
      ...init,
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init?.headers || {}),
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Shopify API error", path, res.status, txt);
    throw new Error(`Shopify API error: ${res.status}`);
  }

  return res.json();
}

function extractAssetKey(settingValue: string | undefined | null): string | null {
  if (!settingValue) return null;
  // typisk: "shopify://shop_images/logo.png"
  if (settingValue.startsWith("shopify://")) {
    return settingValue.replace("shopify://", "");
  }
  return settingValue;
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

    // 1) Hent shop-info (navn, domene)
    const shopJson = await shopifyFetch(shop, accessToken, "shop.json");
    const s = shopJson.shop;

    const primaryDomain =
      s?.primary_domain?.host ||
      s?.domain ||
      s?.myshopify_domain ||
      shop.replace(/^https?:\/\//, "");

    // Default: ingen logo/favicons
    let logoUrl: string | null = null;
    let faviconUrl: string | null = null;

    // 2) Finn hovedtema
    try {
      const themesJson = await shopifyFetch(shop, accessToken, "themes.json");
      const themes = Array.isArray(themesJson.themes) ? themesJson.themes : [];
      const mainTheme =
        themes.find((t: any) => t.role === "main") || themes[0];

      if (mainTheme) {
        const themeId = mainTheme.id;

        // 3) Les config/settings_data.json fra temaet
        const settingsRes = await fetch(
          `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/themes/${themeId}/assets.json?asset[key]=config/settings_data.json`,
          {
            headers: {
              "X-Shopify-Access-Token": accessToken,
              Accept: "application/json",
            },
            cache: "no-store",
          },
        );

        if (settingsRes.ok) {
          const settingsJson = await settingsRes.json();
          const value = settingsJson?.asset?.value;
          if (value) {
            const parsed = JSON.parse(value);

            let themeSettings: any = null;

            // OS 2.0 struktur: { current: "...", presets: { [current]: { theme_settings: {...} } } }
            if (
              parsed.current &&
              parsed.presets &&
              parsed.presets[parsed.current]?.theme_settings
            ) {
              themeSettings =
                parsed.presets[parsed.current].theme_settings;
            } else if (parsed.theme_settings) {
              themeSettings = parsed.theme_settings;
            }

            if (themeSettings) {
              const faviconKey = extractAssetKey(
                themeSettings.favicon || themeSettings.favicon_image,
              );
              const logoKey = extractAssetKey(
                themeSettings.logo ||
                  themeSettings.logo_main ||
                  themeSettings.header_logo,
              );

              async function fetchAssetPublicUrl(
                assetKey: string | null,
              ): Promise<string | null> {
                if (!assetKey) return null;
                const assetRes = await fetch(
                  `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/themes/${themeId}/assets.json?asset[key]=${encodeURIComponent(
                    assetKey,
                  )}`,
                  {
                    headers: {
                      "X-Shopify-Access-Token": accessToken,
                      Accept: "application/json",
                    },
                    cache: "no-store",
                  },
                );

                if (!assetRes.ok) return null;
                const assetJson = await assetRes.json();
                return assetJson.asset?.public_url || null;
              }

              faviconUrl = await fetchAssetPublicUrl(faviconKey);
              logoUrl = await fetchAssetPublicUrl(logoKey);
            }
          }
        }
      }
    } catch (err) {
      // ikke kritisk – vi kan fint leve uten logo
      console.warn("Klarte ikke å hente theme/logo-info:", err);
    }

    return NextResponse.json({
      success: true,
      shop: {
        name: s?.name || "",
        domain: primaryDomain,
        logoUrl,
        faviconUrl,
      },
    });
  } catch (err: any) {
    console.error("Feil i /api/shopify/store-identity:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Uventet feil ved henting av butikkutseende.",
      },
      { status: 500 },
    );
  }
}
