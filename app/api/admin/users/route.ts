import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("credits")
      .select("user_id, balance, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("credits list error", error);
      return NextResponse.json(
        { ok: false, error: "Feil ved henting av brukere." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      users: data ?? [],
    });
  } catch (err) {
    console.error("credits list fatal", err);
    return NextResponse.json(
      { ok: false, error: "Uventet feil ved henting av brukere." },
      { status: 500 },
    );
  }
}
