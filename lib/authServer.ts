// lib/authServer.ts
import { cookies } from "next/headers";

// Denne er et eksempel – du tilpasser den til ditt system
export async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  // Eksempel: hvis du har en cookie som inneholder supabase/bruker-ID
  const cookieStore = cookies();
  const userId = cookieStore.get("phorium_user_id")?.value || null;

  return userId;
}
