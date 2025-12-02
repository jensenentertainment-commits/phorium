import { supabaseAdmin } from "./supabaseAdmin";

type ActivityEventType =
  | "TEXT_GENERATED"
  | "IMAGE_GENERATED"
  | "CAMPAIGN_GENERATED"
  | "CREDITS_CHANGED"
  | "LOGIN"
  | "SIGNUP"
  | "ERROR";

type LogActivityParams = {
  userId?: string | null;
  email?: string | null;
  eventType: ActivityEventType | string;
  meta?: Record<string, any>;
};

/**
 * Logger en hendelse til activity_log-tabellen.
 * Feil her skal ALDRI krasje requesten – det er bare "telemetri".
 */
export async function logActivity({
  userId,
  email,
  eventType,
  meta = {},
}: LogActivityParams) {
  try {
    const { error } = await supabaseAdmin.from("activity_log").insert({
      user_id: userId ?? null,
      email_snapshot: email ?? null,
      event_type: eventType,
      meta,
    });

    if (error) {
      console.error("[activity_log] insert-feil:", error.message);
    }
  } catch (err) {
    console.error("[activity_log] Uventet feil:", err);
  }
}
