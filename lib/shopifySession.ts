// lib/shopifySession.ts
import { cookies } from "next/headers";

export type ShopifySession = {
  shop: string;
  accessToken: string;
};

/**
 * Leser Shopify-session fra cookies.
 * Settes i /api/shopify/callback etter OAuth.
 */
export async function getShopifySession(): Promise<ShopifySession | null> {
  const cookieStore = cookies();
  const shop = cookieStore.get("phorium_shop")?.value;
  const accessToken = cookieStore.get("phorium_token")?.value;

  if (!shop || !accessToken) {
    return null;
  }

  return {
    shop,
    accessToken,
  };
}
