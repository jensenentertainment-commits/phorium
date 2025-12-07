// lib/credits.ts
import { supabaseAdmin } from "./supabaseAdmin";

export type UseCreditsResult = {
  ok: boolean;
  balance: number;
  error?: string;
};

export type CreditFeature =
  | "product_text"
  | "phorium_generate"
  | "image_generate"
  | "image_edit"
  | (string & {});

// 👇 DU MÅ SETTE DISSE RIKTIG etter hvordan DB-en din ser ut
const CREDITS_TABLE = "user_credits";  // f.eks. "user_credits" eller "profiles"
const CREDITS_COLUMN = "credits";      // f.eks. "credits" eller "balance"

async function getCurrentCredits(userId: string): Promise<UseCreditsResult> {
  const { data, error } = await supabaseAdmin
    .from(CREDITS_TABLE)
    .select(CREDITS_COLUMN)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.error("[credits] Kunne ikke hente kreditter:", error);
    return { ok: false, balance: 0, error: "Kunne ikke hente kreditter." };
  }

  const balance = (data as any)[CREDITS_COLUMN] as number;
  return { ok: true, balance };
}

export async function ensureCreditsAvailable(
  userId: string,
  required: number,
): Promise<UseCreditsResult> {
  const current = await getCurrentCredits(userId);
  if (!current.ok) return current;

  if (current.balance < required) {
    return { ok: false, balance: current.balance, error: "Ikke nok kreditter." };
  }

  return current;
}

export async function logCreditUsage(params: {
  userId: string;
  feature: CreditFeature;
  amount: number;
  status: "success" | "failed" | "refunded";
  openaiModel?: string;
  tokensIn?: number;
  tokensOut?: number;
  errorMessage?: string;
}) {
  const { error } = await supabaseAdmin.from("credit_usage").insert({
    user_id: params.userId,
    feature: params.feature,
    credits_used: params.amount,
    status: params.status,
    openai_model: params.openaiModel ?? null,
    tokens_in: params.tokensIn ?? null,
    tokens_out: params.tokensOut ?? null,
    error_message: params.errorMessage?.slice(0, 1000) ?? null,
  });

  if (error) console.error("[credits] Klarte ikke å logge kredittbruk:", error);
}

export async function consumeCreditsAfterSuccess(
  userId: string,
  amount: number,
  feature: CreditFeature,
  opts?: { openaiModel?: string; tokensIn?: number; tokensOut?: number },
): Promise<UseCreditsResult> {
  const current = await getCurrentCredits(userId);
  if (!current.ok) {
    await logCreditUsage({
      userId,
      feature,
      amount,
      status: "failed",
      errorMessage: current.error,
      ...opts,
    });
    return current;
  }

  if (current.balance < amount) {
    const res: UseCreditsResult = {
      ok: false,
      balance: current.balance,
      error: "Ikke nok kreditter.",
    };
    await logCreditUsage({
      userId,
      feature,
      amount,
      status: "failed",
      errorMessage: res.error,
      ...opts,
    });
    return res;
  }

  const newBalance = current.balance - amount;

  const { error: updateError } = await supabaseAdmin
    .from(CREDITS_TABLE)
    .update({ [CREDITS_COLUMN]: newBalance })
    .eq("user_id", userId);

  if (updateError) {
    console.error("[credits] Feil ved oppdatering av kreditter:", updateError);
    await logCreditUsage({
      userId,
      feature,
      amount,
      status: "failed",
      errorMessage: "Kunne ikke oppdatere kreditter.",
      ...opts,
    });

    return {
      ok: false,
      balance: current.balance,
      error: "Kunne ikke oppdatere kreditter.",
    };
  }

  await logCreditUsage({
    userId,
    feature,
    amount,
    status: "success",
    ...opts,
  });

  return { ok: true, balance: newBalance };
}
