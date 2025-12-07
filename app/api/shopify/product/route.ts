// app/api/studio/product/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";

// Henter user_id fra Supabase-auth-cookie (juster hvis du bruker annet auth-system)
async function getUserId() {
  const userCookie = cookies().get("sb-user") || cookies().get("phorium_user_id");
  if (!userCookie) return null;

  try {
    const parsed = JSON.parse(userCookie.value);
    return parsed.id || parsed.user_id || null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    // 1) Auth – sikre at bruker er innlogget
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Ikke innlogget." },
        { status: 401 }
      );
    }

    // 2) Hent produkt-ID fra URL
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Mangler produkt-ID." },
        { status: 400 }
      );
    }

    // 3) Hent brukerens shop_domain via Supabase-profilen
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("shop_domain")
      .eq("id", userId)
      .single();

    if (profileError || !profile?.shop_domain) {
      return NextResponse.json(
        { success: false, error: "Fant ikke brukerens shop-domain." },
        { status: 400 }
      );
    }

    const shopDomain = profile.shop_domain;

    // 4) Hent produktet fra `shopify_products` basert på shop og ID
    const { data, error } = await supabaseAdmin
      .from("shopify_products")
      .select(
        `
          shopify_product_id,
          title,
          handle,
          status,
          price,
          image,
          plain_description,
          has_description,
          created_at_shopify,
          updated_at_shopify,
          optimization_score,
          optimization_label,
          optimization_characters
        `
      )
      .eq("shopify_product_id", id)
      .eq("shop_domain", shopDomain)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Fant ikke produktet." },
        { status: 404 }
      );
    }

    // 5) Standardiser output-formatet slik Studio/Visuals forventer
    const product = {
      id: data.shopify_product_id,
      title: data.title,
      handle: data.handle,
      status: data.status,
      price: data.price,
      image: data.image,
      plainDescription: data.plain_description,
      hasDescription: data.has_description,
      createdAt: data.created_at_shopify,
      updatedAt: data.updated_at_shopify,
      optimizationScore: data.optimization_score,
      optimizationLabel: data.optimization_label,
      optimizationCharacters: data.optimization_characters,
    };

    return NextResponse.json({ success: true, product });

  } catch (err) {
    console.error("❌ Studio product API error:", err);
    return NextResponse.json(
      { success: false, error: "Uventet feil i product-API." },
      { status: 500 }
    );
  }
}
