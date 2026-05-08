import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/lib/auth";
import { createAuditEvent } from "@/lib/audit";
import { jsonNoStore, logControlledError } from "@/lib/api-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getAuthenticatedUser();

  if (user) {
    try {
      await createAuditEvent({
        eventType: "logout",
        actorUsername: user.username,
        actorRole: user.role,
        description: "Sessão encerrada pelo usuário."
      });
    } catch (error) {
      logControlledError("audit_logout", error);
    }
  }

  const response = jsonNoStore({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}
