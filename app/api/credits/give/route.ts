// app/api/credits/give/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // juster import-path hvis annerledes

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body.userId as string | undefined;
    const amount = Number(body.amount);

    if (!userId || Number.isNaN(amount)) {
      return NextResponse.json(
        { ok: false, error: "Mangler userId eller ugyldig amount." },
        { status: 400 },
      );
    }

    // 1) Hent eksisterende credits-rad for brukeren
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("credits")
      .select("balance")
      .eq("user_id", userId) // 👈 viktig: user_id
      .maybeSingle();

    if (fetchErr) {
      console.error("Feil ved henting av credits:", fetchErr);
      return NextResponse.json(
        { ok: false, error: "Kunne ikke hente kreditt-saldo." },
        { status: 500 },
      );
    }

    const currentBalance = existing?.balance ?? 0;
    let newBalance = currentBalance + amount;

    // Ikke gå under 0
    if (newBalance < 0) newBalance = 0;

    // 2) Oppdater eller opprett raden
    let upsertError = null;

    if (existing) {
      const { error: updateErr } = await supabaseAdmin
        .from("credits")
        .update({ balance: newBalance })
        .eq("user_id", userId);

      upsertError = updateErr;
    } else {
      const { error: insertErr } = await supabaseAdmin
        .from("credits")
        .insert({ user_id: userId, balance: newBalance });

      upsertError = insertErr;
    }

    if (upsertError) {
      console.error("Feil ved oppdatering/innsetting av credits:", upsertError);
      return NextResponse.json(
        { ok: false, error: "Kunne ikke oppdatere kreditt-saldo." },
        { status: 500 },
      );
    }

    // 3) Returner ny saldo slik AdminUsersClient forventer
    return NextResponse.json({
      ok: true,
      balance: newBalance,
    });
  } catch (err) {
    console.error("Uventet feil i /api/credits/give:", err);
    return NextResponse.json(
      { ok: false, error: "Uventet feil ved oppdatering av kreditter." },
      { status: 500 },
    );
  }
}
