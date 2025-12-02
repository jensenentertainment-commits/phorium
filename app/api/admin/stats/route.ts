// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/admin/getAdminStats";

export async function GET() {
  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to compute stats" },
      { status: 500 },
    );
  }
}
