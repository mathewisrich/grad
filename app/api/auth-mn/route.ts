import { NextResponse } from "next/server";
import { MN_AUTH_COOKIE, normalize } from "@/lib/auth";

export async function POST(req: Request) {
  const { answer } = (await req.json().catch(() => ({}))) as {
    answer?: string;
  };
  const expected = normalize(process.env.MN_PASSWORD ?? "daddymat");
  const given = normalize(answer ?? "");

  if (!given || given !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(MN_AUTH_COOKIE, "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MN_AUTH_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
