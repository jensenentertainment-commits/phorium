// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("credits")
      .select("user_id, balance, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("admin/users GET error:", error);
      return NextResponse.json(
        { ok: false, error: "Kunne ikke hente brukere/credits." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, users: data ?? [] },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("admin/users GET exception:", err);
    return NextResponse.json(
      { ok: false, error: "Uventet serverfeil." },
      { status: 500 }
    );
  }
}
