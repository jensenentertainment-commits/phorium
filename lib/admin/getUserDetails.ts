// lib/admin/getUserDetails.ts
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AdminUserDetails = {
  id: string;
  email: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  // profile
  brandName?: string | null;
  plan?: string | null;
  credits?: number | null;
  // aktivitet
  events?: number;
  lastActivity?: string | null;
};

export async function getUserDetails(userId: string) {
  // 1) Auth-info
  const { data: userData, error: userError } =
    await supabaseAdmin.auth.admin.getUserById(userId);

  if (userError || !userData?.user) {
    throw new Error("User not found");
  }

  const user = userData.user;

  // 2) Profil-info (tilpass tabellnavn og felter til det du har)
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("brand_name, plan, credits")
    .eq("id", userId)
    .single();

  // 3) Aggregert aktivitet (matchet med det vi gjorde i /admin/users)
  const { data: activityAgg } = await supabaseAdmin
    .from("activity_log")
    .select("count(*)::int as events, max(created_at) as last_activity")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email,
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at,
    brandName: profile?.brand_name ?? null,
    plan: profile?.plan ?? null,
    credits: profile?.credits ?? null,
    events: activityAgg?.events ?? 0,
    lastActivity: activityAgg?.last_activity ?? null,
  } as AdminUserDetails;
}
