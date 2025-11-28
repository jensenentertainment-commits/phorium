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
 *  - /api/credits/use
 *  - /api/generate-text
 *  - /api/phorium-generate
 */
export async function useCredits(
  userId: string,
  amount: number
): Promise<UseCreditsResult> {
  if (!userId) {
    return {
      ok: false,
      balance: 0,
      error: "Mangler userId.",
    };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      ok: false,
      balance: 0,
      error: "Beløpet må være et tall > 0.",
    };
  }

  // 1) Hent eksisterende saldo
  const { data, error } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[useCredits] Feil ved henting av kreditter:", error);
    return {
      ok: false,
      balance: 0,
      error: "Kunne ikke hente kreditter.",
    };
  }

  const currentBalance = data?.balance ?? 0;

  // 2) Sjekk om det er nok kreditter
  if (currentBalance < amount) {
    return {
      ok: false,
      balance: currentBalance,
      error: "Ikke nok kreditter.",
    };
  }

  const newBalance = currentBalance - amount;

  // 3) Oppdater saldo
  const { error: updateError } = await supabase
    .from("credits")
    .update({
      balance: newBalance,
      last_reason: "usage",
    })
    .eq("user_id", userId);

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
