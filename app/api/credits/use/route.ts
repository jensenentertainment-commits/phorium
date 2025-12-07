import { NextResponse } from "next/server";
import { consumeCreditsAfterSuccess } from "@/lib/credits";

export async function POST(req: Request) {
  try {
    const { user_id, amount } = await req.json();

    if (!user_id || !amount) {
      return NextResponse.json(
        { error: "Missing user_id or amount" },
        { status: 400 }
      );
    }

    const result = await consumeCreditsAfterSuccess({
      userId: user_id,
      cost: amount,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("Credits use error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
