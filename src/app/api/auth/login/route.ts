import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  createSessionToken,
  validateAdminCredentials
} from "@/lib/auth";

export const runtime = "nodejs";

type LoginPayload = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginPayload;
  const username = body.username?.trim() || "";
  const password = body.password || "";

  if (!validateAdminCredentials(username, password)) {
    return NextResponse.json(
      { error: "Usuário ou senha inválidos." },
      { status: 401 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, createSessionToken(username), {
    httpOnly: true,
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return NextResponse.json({ ok: true });
}
