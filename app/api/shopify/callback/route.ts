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

  // 👉 Lagre i Supabase
  const { error: dbError } = await supabase
    .from("connected_stores")
    .upsert({
      shop,
      access_token: tokenData.access_token,
      installed_at: new Date().toISOString(),
    });

  if (dbError) {
    console.error("DB SAVE ERROR:", dbError);
    return NextResponse.json(
      { error: "Failed to save store connection" },
      { status: 500 }
    );
  }

  console.log("SHOPIFY ACCESS TOKEN:", tokenData.access_token);

  return NextResponse.redirect(
    `${process.env.SHOPIFY_APP_URL}/studio/koble-nettbutikk?connected=1`
  );
}
