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

    const newPlan = plan || null;

    // 1) Hent gammel plan (via user_id – samme som ellers i appen)
    const { data: oldProfile, error: oldErr } = await supabaseAdmin
      .from("profiles")
      .select("plan")
      .eq("user_id", userId)
      .maybeSingle();

    if (oldErr) {
      console.error("[admin/users/plan] fetch old plan error:", oldErr);
    }

    const oldPlan = oldProfile?.plan ?? null;

    // 2) Oppdater / opprett profil med ny plan (upsert på user_id)
    const { data: upserted, error: upsertErr } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          plan: newPlan,
        },
        { onConflict: "user_id" },
      )
      .select("plan")
      .maybeSingle();

    if (upsertErr) {
      console.error("[admin/users/plan] upsert error:", upsertErr);
      return NextResponse.json(
        {
          ok: false,
          error:
            upsertErr.message || "Kunne ikke oppdatere/lagre plan (Supabase-feil).",
        },
        { status: 500 },
      );
    }

    if (!upserted) {
      console.error(
        "[admin/users/plan] Ingen profilrad returnert etter upsert for user_id=",
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

    const finalPlan = upserted.plan ?? newPlan ?? null;

    // 3) Logg admin-action (best effort)
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
      console.error("[admin/users/plan] klarte ikke å logge admin_actions:", logErr);
    }

    // 4) Suksess
    return NextResponse.json({
      ok: true,
      plan: finalPlan,
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
