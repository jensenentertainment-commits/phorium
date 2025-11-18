import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const shop = searchParams.get("shop");
  const code = searchParams.get("code");

  if (!shop || !code) {
    return NextResponse.json(
      { error: "Missing parameters" },
      { status: 400 }
    );
  }

  const clientId = process.env.SHOPIFY_API_KEY!;
  const clientSecret = process.env.SHOPIFY_API_SECRET!;

  const tokenUrl = `https://${shop}/admin/oauth/access_token`;

  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    return NextResponse.json(
      { error: "Unable to fetch access token" },
      { status: 400 }
    );
  }

  // 👉 Prøv å lagre i Supabase – men ikke stopp hvis det feiler
  try {
    const { error: dbError } = await supabase
      .from("connected_stores")
      .upsert({
        shop,
        access_token: tokenData.access_token,
        installed_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("DB SAVE ERROR (ignoreres i MVP):", dbError);
    }
  } catch (err) {
    console.error("DB EXCEPTION (ignoreres i MVP):", err);
  }

  console.log("SHOPIFY ACCESS TOKEN:", tokenData.access_token);

  // 👉 Sett cookies som /api/shopify/products kan lese
  const isProd = process.env.NODE_ENV === "production";
  const redirectUrl = `${process.env.SHOPIFY_APP_URL}/studio/koble-nettbutikk?connected=1`;
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set("phorium_shop", shop, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  });

  response.cookies.set("phorium_token", tokenData.access_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  });

  return response;
}
