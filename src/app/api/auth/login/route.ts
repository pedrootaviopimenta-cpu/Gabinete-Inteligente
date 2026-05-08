import {
  AUTH_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  SENIOR_ADMIN_ROLE,
  createSessionToken,
  validateAdminCredentials
} from "@/lib/auth";
import { createAuditEvent } from "@/lib/audit";
import { jsonNoStore, logControlledError, readJsonWithLimit } from "@/lib/api-security";

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
    await recordLoginFailure(Boolean(username));
    return invalidCredentialsResponse();
  }

  await recordLoginSuccess(username);

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

async function recordLoginSuccess(username: string) {
  try {
    await createAuditEvent({
      eventType: "login_success",
      actorUsername: username,
      actorRole: SENIOR_ADMIN_ROLE,
      description: "Login realizado com sucesso."
    });
  } catch (error) {
    logControlledError("audit_login_success", error);
  }
}

async function recordLoginFailure(hasUsername: boolean) {
  try {
    await createAuditEvent({
      eventType: "login_failed",
      description: "Tentativa de login sem sucesso.",
      metadata: { hasUsername }
    });
  } catch (error) {
    logControlledError("audit_login_failed", error);
  }
}
