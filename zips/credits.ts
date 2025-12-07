// lib/credits.ts
import { supabase } from "./supabaseClient";

export type UseCreditsResult = {
  ok: boolean;
  balance: number;
  error?: string;
};

/**
 * Trekker "amount" kreditter fra en bruker.
 * Brukes av:
 *  - /api/generate-text
 *  - /api/phorium-generate
 *  - /api/whatever-du-lager-senere
 */
export async function useCredits(
  userId: string,
  amount: number,
): Promise<UseCreditsResult> {
  if (!userId) {
    return {
      ok: false,
      balance: 0,
      error: "UserId mangler.",
    };
  }

  if (amount <= 0) {
    // Ingen endring, bare returner nåværende saldo
    const { data, error } = await supabase
      .from("credits") // 👈 tabellnavn: "credits"
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return {
        ok: false,
        balance: 0,
        error: "Kunne ikke hente kreditter.",
      };
    }

    return {
      ok: true,
      balance: data.balance ?? 0,
    };
  }

  // 1) Hent nåværende saldo
  const { data, error } = await supabase
    .from("credits")
    .select("id, balance")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.error("[useCredits] Klarte ikke å hente kreditter:", error);
    return {
      ok: false,
      balance: 0,
      error: "Fant ingen kredittkonto for brukeren.",
    };
  }

  const currentBalance = data.balance ?? 0;
  const newBalance = currentBalance - amount;

  // 2) Ikke nok kreditter → AVBRYT, ikke trekk
  if (newBalance < 0) {
    return {
      ok: false,
      balance: currentBalance,
      error: "Ikke nok kreditter.",
    };
  }

  // 3) Oppdater saldo
  const { error: updateError } = await supabase
    .from("credits")
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  if (updateError) {
    console.error("[useCredits] Feil ved oppdatering av kreditter:", updateError);
    return {
      ok: false,
      balance: currentBalance,
      error: "Kunne ikke oppdatere kreditter.",
    };
  }

  return {
    ok: true,
    balance: newBalance,
  };
}
