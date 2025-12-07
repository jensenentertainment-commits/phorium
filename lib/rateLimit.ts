// lib/rateLimit.ts
import { supabaseAdmin } from "./supabaseAdmin";

type RateLimitParams = {
  route: string;
  userId?: string | null;
  ip?: string | null;
  windowSeconds: number;
  maxRequests: number;
};

export async function checkRateLimit({
  route,
  userId,
  ip,
  windowSeconds,
  maxRequests,
}: RateLimitParams): Promise<{ allowed: boolean }> {
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();

  let query = supabaseAdmin
    .from("api_rate_limits")
    .select("id", { head: true, count: "exact" })
    .eq("route", route)
    .gte("created_at", since);

  if (userId) {
    query = query.eq("user_id", userId);
  } else if (ip) {
    query = query.eq("ip", ip);
  }

  const { count, error } = await query;

  if (error) {
    console.error("[rateLimit] feil ved telling:", error);
    // fail-open: ikke blokker brukeren pga DB-feil
    return { allowed: true };
  }

  if ((count ?? 0) >= maxRequests) {
    return { allowed: false };
  }

  const { error: insertError } = await supabaseAdmin
    .from("api_rate_limits")
    .insert({
      route,
      user_id: userId ?? null,
      ip: ip ?? null,
    });

  if (insertError) {
    console.error("[rateLimit] feil ved insert:", insertError);
  }

  return { allowed: true };
}
