import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("phorium_admin")?.value === "1";

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Ikke autorisert" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const userId = body.userId as string | undefined;
    const plan = body.plan as string | null | undefined;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Mangler userId." },
        { status: 400 },
      );
    }

    // Hent gammel plan (fra profiles.id = auth user id)
    const { data: oldProfile, error: oldErr } = await supabaseAdmin
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .maybeSingle();

    if (oldErr) {
      console.error("fetch old plan error", oldErr);
    }

    const oldPlan = oldProfile?.plan ?? null;
    const newPlan = plan || null;

    // Oppdater plan – NB: bruker `id`, ikke `user_id`
    const {
      data: updatedProfile,
      error: updateError,
    } = await supabaseAdmin
      .from("profiles")
      .update({ plan: newPlan })
      .eq("id", userId)
      .select("plan")
      .maybeSingle();

    if (updateError) {
      console.error("update plan error", updateError);
      return NextResponse.json(
        { ok: false, error: "Kunne ikke oppdatere plan." },
        { status: 500 },
      );
    }

    const finalPlan = updatedProfile?.plan ?? newPlan ?? null;

    // Logg admin-action (greit å ha, men feiler ikke hele requesten om dette ryker)
    try {
      await supabaseAdmin.from("admin_actions").insert({
        admin_label: "admin",
        target_user_id: userId,
        action: "PLAN_CHANGE",
        old_plan: oldPlan,
        new_plan: finalPlan,
        meta: null,
      });
    } catch (logErr) {
      console.error("Kunne ikke logge admin-action PLAN_CHANGE:", logErr);
    }

    return NextResponse.json({
      ok: true,
      plan: finalPlan,
    });
  } catch (err) {
    console.error("update plan fatal", err);
    return NextResponse.json(
      { ok: false, error: "Uventet feil ved oppdatering av plan." },
      { status: 500 },
    );
  }
}
