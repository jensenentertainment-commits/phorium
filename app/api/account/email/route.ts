import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const { newEmail } = await req.json();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { error: updateError } = await supabase.auth.updateUser({
    email: newEmail,
  });

  if (updateError)
    return NextResponse.json({ error: updateError.message }, { status: 400 });

  return NextResponse.json({
    success: true,
    message: "Vi har sendt en verifiseringsmail for å bekrefte ny e-post.",
  });
}
