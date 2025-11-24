// app/api/access/verify/route.ts
import { NextResponse } from "next/server";

const ACCESS_CODE = process.env.ACCESS_CODE || "PHORIUM2025";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { ok: false, error: "Kode mangler" },
        { status: 400 }
      );
    }

    if (code !== ACCESS_CODE) {
      return NextResponse.json(
        { ok: false, error: "Feil kode" },
        { status: 403 }
      );
    }

    // Sett cookie i responsen
    const res = NextResponse.json({ ok: true });

    res.cookies.set("phorium_bypass", "true", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 24 timer
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Uventet feil" },
      { status: 500 }
    );
  }
}
