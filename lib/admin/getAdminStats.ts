// lib/admin/getAdminStats.ts
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AdminStats = {
  totalUsers: number;
  activeLast7d: number;
  totalCreditsUsed: number;
  errorsLast24h: number;
  signupsPerDay: { date: string; count: number }[];
};

export async function getAdminStats(): Promise<AdminStats> {
  // Total users
  const { count: totalUsers = 0 } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1,
  });

  // Aktivitet siste 7 dager
  const since7d = new Date();
  since7d.setDate(since7d.getDate() - 7);

  const { data: activeRows } = await supabaseAdmin
    .from("activity_log")
    .select("user_id", { count: "exact", head: false })
    .gte("created_at", since7d.toISOString());

  const uniqueUserIds = Array.from(
    new Set((activeRows ?? []).map((r: any) => r.user_id)),
  );

  // Total credits brukt (forenklet – tilpass til din usage-tabell)
  const { data: usage } = await supabaseAdmin
    .from("credit_usage")
    .select("credits_used");

  const totalCreditsUsed = (usage ?? []).reduce(
    (sum: number, row: any) => sum + (row.credits_used ?? 0),
    0,
  );

  // Errors siste 24t
  const since24h = new Date();
  since24h.setDate(since24h.getDate() - 1);
  const { count: errorsLast24h = 0 } = await supabaseAdmin
    .from("error_log")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since24h.toISOString());

  // Signups per dag (bruk f.eks. egen view, men her er en enkel variant)
  const { data: signupsRaw } = await supabaseAdmin
    .from("user_signups_daily") // gjerne en materialisert view i DB
    .select("date, count");

  const signupsPerDay =
    (signupsRaw ?? []).map((row: any) => ({
      date: row.date,
      count: row.count,
    })) ?? [];

  return {
    totalUsers,
    activeLast7d: uniqueUserIds.length,
    totalCreditsUsed,
    errorsLast24h,
    signupsPerDay,
  };
}
