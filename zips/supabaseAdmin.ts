import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Mangler NEXT_PUBLIC_SUPABASE_URL i .env.local");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Mangler SUPABASE_SERVICE_ROLE_KEY i .env.local");
}

// ⚠️ Denne klienten skal KUN brukes på server (routes, server actions, osv.)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
