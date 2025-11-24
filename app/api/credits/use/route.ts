import { NextResponse } from "next/server";
import { useCredits } from "@/lib/credits";

export async function POST(req: Request) {
  const { user_id, amount } = await req.json();

  const result = await useCredits(user_id, amount);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json({ success: true, balance: result.balance });
}
