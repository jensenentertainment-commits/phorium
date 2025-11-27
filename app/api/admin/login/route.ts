import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { secret } = await req.json().catch(() => ({ secret: "" }));

  if (!process.env.ADMIN_SECRET) {
    return NextResponse.json(
      { error: "ADMIN_SECRET er ikke satt i miljøvariabler." },
      { status: 500 }
    );
  }

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Ugyldig admin-nøkkel." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  // Sett HttpOnly-cookie som kun serveren kan lese
  res.cookies.set("phorium_admin", "1", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 4, // 4 timer
  });

  return res;
}
