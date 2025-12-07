// lib/auth.ts
import { cookies } from "next/headers";
// evt. supabaseAdmin, JWT-verifisering, egen session osv.

export async function getAuthenticatedUserId(): Promise<string> {
  // EKSEMPEL – tilpass til ditt system:
  const cookieStore = cookies();
  const userId = cookieStore.get("phorium_user_id")?.value;

  if (!userId) {
    throw new Error("Not authenticated");
  }

  return userId;
}
