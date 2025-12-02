import { cookies } from "next/headers";
import { supabase } from "./supabaseClient";

export async function getUserCredits() {
  const cookieStore = cookies();

  // 👇 Dette er navnet på auth-cookie i Phorium
  const token = cookieStore.get("_phorium_supabase_auth-token")?.value;

  if (!token) {
    return 0;
  }

  // Hent innlogget bruker basert på token
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return 0;
  }

  // Hent credits fra tabellen
  const { data, error } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return 0;
  }

  return data.balance ?? 0;
}
