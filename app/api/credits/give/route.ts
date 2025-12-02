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
    const amount = body.amount as number | undefined;

    if (!userId || typeof amount !== "number") {
      return NextResponse.json(
        { ok: false, error: "Mangler userId eller amount." },
        { status: 400 },
      );
    }

    // Hent nåværende saldo
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("credits")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchErr) {
      console.error("credits fetch error", fetchErr);
    }

    const currentBalance = existing?.balance ?? 0;
    const newBalance = currentBalance + amount;

    // Oppdater/sett saldo
    const { data: upserted, error: upsertErr } = await supabaseAdmin
      .from("credits")
      .upsert(
        {
          user_id: userId,
          balance: newBalance,
        },
        { onConflict: "user_id" },
      )
      .select("balance")
      .maybeSingle();

    if (upsertErr) {
      console.error("credits upsert error", upsertErr);
      return NextResponse.json(
        { ok: false, error: "Kunne ikke oppdatere kreditter." },
        { status: 500 },
      );
    }

    // Logg admin-action
    await supabaseAdmin.from("admin_actions").insert({
      admin_label: "admin",
      target_user_id: userId,
      action: "CREDITS_ADJUST",
      delta_credits: amount,
      meta: {
        previous_balance: currentBalance,
        new_balance: upserted?.balance ?? newBalance,
      },
    });

    return NextResponse.json({
      ok: true,
      balance: upserted?.balance ?? newBalance,
    });
  } catch (err) {
    console.error("credits give fatal", err);
    return NextResponse.json(
      { ok: false, error: "Uventet feil ved oppdatering av kreditter." },
      { status: 500 },
    );
  }
}
