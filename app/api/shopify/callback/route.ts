import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const shop = searchParams.get("shop");
  const code = searchParams.get("code");

  if (!shop || !code) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
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
    return NextResponse.json({ error: "Unable to fetch access token" }, { status: 400 });
  }

  // 👉 Her kan du lagre i database senere
  // connected_stores.create({ shop, tokenData.access_token })

  console.log("SHOPIFY ACCESS TOKEN:", tokenData.access_token);

  return NextResponse.redirect(`${process.env.SHOPIFY_APP_URL}/studio/koble-nettbutikk?connected=1`);
}
