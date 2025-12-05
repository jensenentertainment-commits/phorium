import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getShopifySession } from "@/lib/shopifySession";

export async function GET() {
  const session = await getShopifySession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Ingen Shopify-session." },
      { status: 401 }
    );
  }

  const { shop } = session;

  // Hent siste sync
  const { data, error } = await supabaseAdmin
    .from("shopify_sync_log")
    .select("*")
    .eq("shop_domain", shop)
    .order("synced_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { success: false, error: "Kunne ikke hente sync-info." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    log: data || null,
  });
}
