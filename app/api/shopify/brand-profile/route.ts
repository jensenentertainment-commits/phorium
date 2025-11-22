import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function getCookieFromHeader(header: string | null, name: string): string | null {
  if (!header) return null;
  const parts = header.split(";").map((c) => c.trim());
  const match = parts.find((c) => c.startsWith(name + "="));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  const shop = getCookieFromHeader(cookieHeader, "phorium_shop");

  if (!shop) {
    return NextResponse.json(
      { success: false, error: "Ingen tilkoblet Shopify-butikk." },
      { status: 401 },
    );
  }

  const { data, error } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("shop_domain", shop)
    .maybeSingle();

  if (error) {
    console.error("brand_profiles GET error", error);
    return NextResponse.json(
      { success: false, error: "Kunne ikke hente brandprofil." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, profile: data ?? null });
}

export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  const shop = getCookieFromHeader(cookieHeader, "phorium_shop");

  if (!shop) {
    return NextResponse.json(
      { success: false, error: "Ingen tilkoblet Shopify-butikk." },
      { status: 401 },
    );
  }

  const body = await req.json();
  const {
    storeName,
    industry,
    tone,
    primaryColor,
    accentColor,
    styleNotes,
    source,
  } = body;

  const { data, error } = await supabase
    .from("brand_profiles")
    .upsert(
      {
        shop_domain: shop,
        store_name: storeName,
        industry,
        tone,
        primary_color: primaryColor,
        accent_color: accentColor,
        style_notes: styleNotes,
        source: source ?? "manual",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "shop_domain" },
    )
    .select()
    .single();

  if (error) {
    console.error("brand_profiles GET error", error);
    return NextResponse.json(
      {
        success: false,
        error: "Kunne ikke hente brandprofil.",
        supabaseError: {
          message: error.message,
          details: (error as any).details ?? null,
          hint: (error as any).hint ?? null,
          code: (error as any).code ?? null,
        },
      },
      { status: 500 },
    );
  }


  return NextResponse.json({ success: true, profile: data });
}
