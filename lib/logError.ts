// lib/logError.ts
import { supabaseAdmin } from "./supabaseAdmin";

type LogErrorArgs = {
  userId?: string | null;
  path?: string;
  context?: string;
  severity?: "info" | "warning" | "error";
  message: string;
  stack?: string;
  meta?: Record<string, any>;
};

export async function logError({
  userId,
  path,
  context,
  severity = "error",
  message,
  stack,
  meta,
}: LogErrorArgs) {
  await supabaseAdmin.from("error_log").insert({
    user_id: userId ?? null,
    path,
    context,
    severity,
    message,
    stack,
    meta,
  });
}
