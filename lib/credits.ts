// /lib/credits.ts

import { supabase } from "@/lib/supabaseClient";

const CREDITS_TABLE = "credits";

export type CreditsRow = {
  id: string;
  user_id: string;
  balance: number;
  updated_at: string;
};

export type CreditsResult =
  | { ok: true; balance: number }
  | { ok: false; error: string };

/**
 * Sørger for at brukeren har en rad i credits-tabellen.
 * Returnerer nåværende balance (kan være 0).
 */
export async function ensureCreditsRow(
  userId: string
): Promise<CreditsResult> {
  if (!userId) {
    return { ok: false, error: "Missing userId" };
  }

  // Finn eksisterende rad
  const { data, error } = await supabase
    .from<CreditsRow>(CREDITS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = row not found
    console.error("ensureCreditsRow: fetch error", error);
    return { ok: false, error: "Kunne ikke hente kreditter" };
  }

  if (data) {
    return { ok: true, balance: data.balance };
  }

  // Ingen rad → opprett med 0
  const { data: inserted, error: insertError } = await supabase
    .from<CreditsRow>(CREDITS_TABLE)
    .insert({ user_id: userId, balance: 0 })
    .select("*")
    .single();

  if (insertError || !inserted) {
    console.error("ensureCreditsRow: insert error", insertError);
    return { ok: false, error: "Kunne ikke opprette kreditt-rad" };
  }

  return { ok: true, balance: inserted.balance };
}

/**
 * Hent nåværende kredittsaldo.
 */
export async function getCredits(userId: string): Promise<CreditsResult> {
  if (!userId) {
    return { ok: false, error: "Missing userId" };
  }

  const { data, error } = await supabase
    .from<CreditsRow>(CREDITS_TABLE)
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("getCredits error", error);
    return { ok: false, error: "Kunne ikke hente kreditter" };
  }

  return { ok: true, balance: data?.balance ?? 0 };
}

/**
 * Gi brukeren X antall kreditter (kan være negativt hvis du vil trekke manuelt).
 */
export async function giveCredits(
  userId: string,
  amount: number
): Promise<CreditsResult> {
  if (!userId) return { ok: false, error: "Missing userId" };
  if (!Number.isFinite(amount)) {
    return { ok: false, error: "Ugyldig kredittbeløp" };
  }

  // Sørg for at rad finnes
  const ensured = await ensureCreditsRow(userId);
  if (!ensured.ok) return ensured;

  const newBalance = ensured.balance + amount;

  const { data, error } = await supabase
    .from<CreditsRow>(CREDITS_TABLE)
    .update({ balance: newBalance })
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("giveCredits error", error);
    return { ok: false, error: "Kunne ikke oppdatere kreditter" };
  }

  return { ok: true, balance: data.balance };
}

/**
 * Bruk X antall kreditter.
 * Returnerer error hvis brukeren har for lite.
 */
export async function useCredits(
  userId: string,
  amount: number
): Promise<CreditsResult> {
  if (!userId) return { ok: false, error: "Missing userId" };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Ugyldig kredittbeløp" };
  }

  const current = await ensureCreditsRow(userId);
  if (!current.ok) return current;

  if (current.balance < amount) {
    return { ok: false, error: "Ikke nok kreditter" };
  }

  const newBalance = current.balance - amount;

  const { data, error } = await supabase
    .from<CreditsRow>(CREDITS_TABLE)
    .update({ balance: newBalance })
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("useCredits error", error);
    return { ok: false, error: "Kunne ikke oppdatere kreditter" };
  }

  return { ok: true, balance: data.balance };
}

// 👇 eksplisitt re-eksport – gjør det krystallklart for Next
export { ensureCreditsRow, getCredits, giveCredits, useCredits };
