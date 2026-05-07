import {
  AUTH_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  createSessionToken,
  validateAdminCredentials
} from "@/lib/auth";
import { jsonNoStore, readJsonWithLimit } from "@/lib/api-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LoginPayload = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  const parsedBody = await readJsonWithLimit<LoginPayload>(request, 10_000);

  if ("error" in parsedBody) {
    return invalidCredentialsResponse();
  }

  const body = parsedBody.data;
  const username = body.username?.trim() || "";
  const password = body.password || "";

  if (!validateAdminCredentials(username, password)) {
    return invalidCredentialsResponse();
  }

  const response = jsonNoStore({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, createSessionToken(username), {
    httpOnly: true,
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}

function invalidCredentialsResponse() {
  return jsonNoStore({ error: "Usuário ou senha inválidos." }, 401);
}
