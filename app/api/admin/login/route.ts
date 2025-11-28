import { NextResponse } from "next/server";

// Midlertidig: hardkodet admin-nøkkel for lokal/beta
const ADMIN_SECRET = "BRILLEFINT123"; // velg noe du husker

export async function POST(req: Request) {
  const { secret } = await req.json().catch(() => ({ secret: "" }));

  if (!secret || secret !== ADMIN_SECRET) {
    return NextResponse.json(
      { error: "Ugyldig admin-nøkkel." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set("phorium_admin", "1", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 4, // 4 timer
  });

  return res;
}
