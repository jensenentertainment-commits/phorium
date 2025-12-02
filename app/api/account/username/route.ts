import { NextResponse } from "next/server";
import { supabase } from "lib/supabaseServer";

export async function POST(req: Request) {
  const body = await req.json();
  const { username } = body;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Sjekk om brukernavn finnes
  const { data: existing } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("username", username)
    .maybeSingle();

  if (existing)
    return NextResponse.json({ error: "Brukernavnet er allerede tatt" }, { status: 400 });

  const { error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("user_id", user.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
