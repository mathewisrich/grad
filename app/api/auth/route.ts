import { NextResponse } from "next/server";
import { AUTH_COOKIE, normalize } from "@/lib/auth";

export async function POST(req: Request) {
  const { answer } = (await req.json().catch(() => ({}))) as {
    answer?: string;
  };
  const expected = normalize(process.env.SITE_PASSWORD ?? "myshaylaa");
  const given = normalize(answer ?? "");

  if (!given || given !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, "ok", {
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
  res.cookies.set(AUTH_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
