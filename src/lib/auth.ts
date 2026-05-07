import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const AUTH_COOKIE_NAME = "gi_session";
export const SESSION_DURATION_SECONDS = 8 * 60 * 60;
export const SENIOR_ADMIN_ROLE = "senior_admin";

type SessionPayload = {
  username: string;
  role: typeof SENIOR_ADMIN_ROLE;
  issuedAt: number;
  expiresAt: number;
};

export type AuthenticatedUser = {
  username: string;
  role: typeof SENIOR_ADMIN_ROLE;
  recoveryEmail: string;
  issuedAt: number;
  expiresAt: number;
};

export function getConfiguredAdminUser() {
  return {
    username: process.env.GI_ADMIN_USERNAME?.trim() || "",
    password: process.env.GI_ADMIN_PASSWORD || "",
    recoveryEmail: process.env.GI_ADMIN_RECOVERY_EMAIL?.trim() || "",
    sessionSecret: process.env.GI_SESSION_SECRET || ""
  };
}

export function isInitialAdminConfigured() {
  const admin = getConfiguredAdminUser();
  return Boolean(admin.username && admin.password && admin.sessionSecret);
}

export function validateAdminCredentials(username: string, password: string) {
  const admin = getConfiguredAdminUser();

  if (!admin.username || !admin.password || !admin.sessionSecret) {
    return false;
  }

  return safeEqual(username.trim(), admin.username) && safeEqual(password, admin.password);
}

export function createSessionToken(username: string) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    username,
    role: SENIOR_ADMIN_ROLE,
    issuedAt: now,
    expiresAt: now + SESSION_DURATION_SECONDS
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): AuthenticatedUser | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  let payload: SessionPayload;

  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }

  const admin = getConfiguredAdminUser();
  const now = Math.floor(Date.now() / 1000);

  if (!admin.username || !admin.password || !admin.sessionSecret) {
    return null;
  }

  if (
    payload.username !== admin.username ||
    payload.role !== SENIOR_ADMIN_ROLE ||
    payload.expiresAt <= now
  ) {
    return null;
  }

  return {
    username: payload.username,
    role: SENIOR_ADMIN_ROLE,
    recoveryEmail: admin.recoveryEmail,
    issuedAt: payload.issuedAt,
    expiresAt: payload.expiresAt
  };
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getSessionSecret()).update(encodedPayload).digest("base64url");
}

function getSessionSecret() {
  const admin = getConfiguredAdminUser();
  return admin.sessionSecret || "";
}

function safeEqual(first: string, second: string) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  if (firstBuffer.length !== secondBuffer.length) {
    return false;
  }

  return timingSafeEqual(firstBuffer, secondBuffer);
}
