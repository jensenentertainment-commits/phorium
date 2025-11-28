import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId as string | undefined;
    const amountRaw = body.amount;
    const reason = (body.reason as string | undefined) ?? "admin_adjust";

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Mangler gyldig userId." },
        { status: 400 }
      );
    }

    const amount = Number(amountRaw);
    if (!Number.isFinite(amount) || amount === 0) {
      return NextResponse.json(
        { error: "Beløpet må være et tall forskjellig fra 0." },
        { status: 400 }
      );
    }

    // 1) Finn nåværende saldo (kan være null hvis raden ikke finnes enda)
    const { data: existing, error: selectError } = await supabase
      .from("credits")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();

    if (selectError) {
      console.error("Feil ved henting av kreditter:", selectError);
      return NextResponse.json(
        { error: "Kunne ikke hente eksisterende kreditter." },
        { status: 500 }
      );
    }

    const currentBalance = existing?.balance ?? 0;
    const newBalance = currentBalance + amount;

    let finalBalance = newBalance;

    if (existing) {
      // 2a) Raden finnes → oppdater
      const { error: updateError } = await supabase
        .from("credits")
        .update({
          balance: newBalance,
          last_reason: reason,
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Feil ved oppdatering av kreditter:", updateError);
        return NextResponse.json(
          { error: "Kunne ikke oppdatere kreditt-rad." },
          { status: 500 }
        );
      }
    } else {
      // 2b) Raden finnes ikke → opprett
      const { data: insertData, error: insertError } = await supabase
        .from("credits")
        .insert({
          user_id: userId,
          balance: newBalance,
          last_reason: reason,
        })
        .select("balance")
        .single();

      if (insertError) {
        console.error("Feil ved opprettelse av kreditt-rad:", insertError);
        return NextResponse.json(
          { error: "Kunne ikke opprette kreditt-rad." },
          { status: 500 }
        );
      }

      finalBalance = insertData.balance;
    }

    return NextResponse.json(
      {
        ok: true,
        balance: finalBalance,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Uventet feil i /api/credits/give:", err);
    return NextResponse.json(
      { error: "Uventet feil ved kredittjustering." },
      { status: 500 }
    );
  }
}
