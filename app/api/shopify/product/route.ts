// app/api/shopify/products/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getShopifySession } from "@/lib/shopifySession";

export async function GET(req: Request) {
  try {
    const session = await getShopifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Ingen Shopify-session." },
        { status: 401 },
      );
    }

    const { shop } = session;

    const { searchParams } = new URL(req.url);
    const limitRaw = Number(searchParams.get("limit") || "50");
    const pageRaw = Number(searchParams.get("page") || "1");
    const status = searchParams.get("status") || "any";
    const q = searchParams.get("q") || "";
    const missingDescription = searchParams.get("missing_description") === "1";

    const limit = Math.min(Math.max(limitRaw, 1), 250);
    const page = Math.max(pageRaw, 1);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from("shopify_products")
      .select(
        `
        id,
        shopify_product_id,
        title,
        handle,
        status,
        price,
        image,
        created_at_shopify,
        updated_at_shopify,
        plain_description,
        has_description,
        optimization_score,
        optimization_label,
        optimization_characters
      `,
        { count: "exact" },
      )
      .eq("shop_domain", shop);

    if (status !== "any") {
      query = query.eq("status", status);
    }

    if (missingDescription) {
      query = query.eq("has_description", false);
    }

    if (q) {
      query = query.or(
        `title.ilike.%${q}%,handle.ilike.%${q}%,shopify_product_id.eq.${Number(
          q,
        ) || -1}`,
      );
    }

    const { data, error, count } = await query
      .order("created_at_shopify", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Supabase products error:", error);
      return NextResponse.json(
        { success: false, error: "Kunne ikke hente produkter." },
        { status: 500 },
      );
    }

    const products = (data || []).map((row) => ({
      id: row.shopify_product_id, // matcher det ProductsPage forventer :contentReference[oaicite:2]{index=2}
      title: row.title,
      handle: row.handle,
      status: row.status,
      price: row.price,
      image: row.image,
      createdAt: row.created_at_shopify,
      updatedAt: row.updated_at_shopify,
      plainDescription: row.plain_description,
      hasDescription: row.has_description,
      optimizationScore: row.optimization_score,
      optimizationLabel: row.optimization_label,
      optimizationCharacters: row.optimization_characters,
    }));

    return NextResponse.json({
      success: true,
      products,
      total: count ?? products.length,
    });
  } catch (err) {
    console.error("Products API error:", err);
    return NextResponse.json(
      { success: false, error: "Uventet feil i produkt-API." },
      { status: 500 },
    );
  }
}
