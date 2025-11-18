// lib/shopifySession.ts
import { supabase } from "@/lib/supabaseClient";

export type ShopifySession = {
  shop: string;
  accessToken: string;
};

/**
 * Henter siste tilkoblede Shopify-butikk fra connected_stores.
 * Foreløpig antar vi én butikk.
 */
export async function getShopifySession(): Promise<ShopifySession | null> {
  const { data, error } = await supabase
    .from("connected_stores")
    .select("shop, access_token, installed_at")
    .order("installed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Feil ved henting av Shopify-session fra Supabase:",
      error
    );
    return null;
  }

  if (!data?.shop || !data?.access_token) {
    return null;
  }

  return {
    shop: data.shop,
    accessToken: data.access_token,
  };
}
