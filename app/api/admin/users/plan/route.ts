import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getQuotaForPlan } from "@/lib/billing";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body.userId as string | undefined;
    const rawPlan = body.plan as string | null | undefined;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Mangler userId." },
        { status: 400 },
      );
    }

    // Tom / null → source
    const newPlan = rawPlan && rawPlan.trim() !== "" ? rawPlan.trim() : "source";
    const newQuota = getQuotaForPlan(newPlan);

    // (valgfritt) Hente eksisterende profil, i tilfelle du vil logge før/etter
    const { data: existingProfile, error: existingError } = await supabaseAdmin
      .from("profiles")
      .select("id, plan, plan_quota")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingError) {
      console.error("Feil ved henting av profil før plan-oppdatering:", existingError);
    }

    // Selve oppdateringen
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        plan: newPlan,
        plan_quota: newQuota,
      })
      .eq("user_id", userId)
      .select("plan, plan_quota")
      .maybeSingle();

    if (updateError || !updatedProfile) {
      console.error("update plan error", updateError);
      return NextResponse.json(
        { ok: false, error: "Kunne ikke oppdatere plan." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      plan: updatedProfile.plan,
      planQuota: updatedProfile.plan_quota,
    });
  } catch (err) {
    console.error("Uventet feil i /api/admin/users/plan:", err);
    return NextResponse.json(
      { ok: false, error: "Uventet feil ved oppdatering av plan." },
      { status: 500 },
    );
  }
}
