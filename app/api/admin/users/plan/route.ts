import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    // 1) Sjekk admin-cookie
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("phorium_admin")?.value === "1";

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Ikke autorisert" },
        { status: 401 },
      );
    }

    // 2) Les body
    const body = await req.json();
    const userId = body.userId as string | undefined;
    const plan = body.plan as string | null | undefined;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Mangler userId." },
        { status: 400 },
      );
    }

    // Normaliser ny plan (tom streng -> null)
    const newPlan = plan || null;

    // 3) Hent gammel plan (bruker samme nøkkel som ellers i appen: user_id)
    const { data: oldProfile, error: oldErr } = await supabaseAdmin
      .from("profiles")
      .select("plan")
      .eq("user_id", userId)
      .maybeSingle();

    if (oldErr) {
      console.error("[admin/users/plan] fetch old plan error:", oldErr);
    }

    const oldPlan = oldProfile?.plan ?? null;

    // 4) Oppdater plan
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ plan: newPlan })
      .eq("user_id", userId)
      .select("plan")
      .maybeSingle();

    if (updateError) {
      console.error("[admin/users/plan] update plan error:", updateError);
      return NextResponse.json(
        {
          ok: false,
          // Sender med faktisk Supabase-feil tilbake så vi ser *hva* som skjer
          error:
            updateError.message ||
            "Kunne ikke oppdatere plan (Supabase-feil).",
        },
        { status: 500 },
      );
    }

    // (Valgfritt: hvis ingen rad ble oppdatert)
    if (!updated) {
      console.error(
        "[admin/users/plan] Ingen profilrad funnet for user_id=",
        userId,
      );
      return NextResponse.json(
        {
          ok: false,
          error: "Fant ingen profilrad å oppdatere for denne brukeren.",
        },
        { status: 404 },
      );
    }

    // 5) Logg admin-action
    try {
      await supabaseAdmin.from("admin_actions").insert({
        admin_label: "admin",
        target_user_id: userId,
        action: "PLAN_CHANGE",
        old_plan: oldPlan,
        new_plan: updated.plan ?? newPlan,
        meta: null,
      });
    } catch (logErr) {
      console.error("[admin/users/plan] klarte ikke å logge admin_actions:", logErr);
      // Ikke fatal for selve oppdateringen
    }

    // 6) Suksess
    return NextResponse.json({
      ok: true,
      plan: updated.plan ?? null,
    });
  } catch (err: any) {
    console.error("[admin/users/plan] fatal error:", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          err?.message || "Uventet feil ved oppdatering av plan (server).",
      },
      { status: 500 },
    );
  }
}
