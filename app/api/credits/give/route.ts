import { NextResponse } from "next/server";
import { giveCredits } from "@/lib/credits";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, amount } = body;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number") {
      return NextResponse.json(
        { ok: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    const result = await giveCredits(userId, amount);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: true, balance: result.balance },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("credits/give error", error);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
