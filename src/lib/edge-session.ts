export const AUTH_COOKIE_NAME = "gi_session";
export const SENIOR_ADMIN_ROLE = "senior_admin";

type SessionPayload = {
  username?: string;
  role?: string;
  issuedAt?: number;
  expiresAt?: number;
};

export async function verifyEdgeSessionToken(token: string | undefined | null) {
  if (!token || !process.env.GI_SESSION_SECRET || !process.env.GI_ADMIN_USERNAME) {
    return false;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return false;
  }

  const signatureBytes = base64UrlToBytes(signature);

  if (!signatureBytes) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(process.env.GI_SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const isSignatureValid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    new TextEncoder().encode(encodedPayload)
  );

  if (!isSignatureValid) {
    return false;
  }

  const payload = decodePayload(encodedPayload);
  const now = Math.floor(Date.now() / 1000);

  return Boolean(
    payload &&
      payload.username === process.env.GI_ADMIN_USERNAME &&
      payload.role === SENIOR_ADMIN_ROLE &&
      typeof payload.expiresAt === "number" &&
      payload.expiresAt > now
  );
}

function decodePayload(encodedPayload: string): SessionPayload | null {
  const payloadBytes = base64UrlToBytes(encodedPayload);

  if (!payloadBytes) {
    return null;
  }

  try {
    return JSON.parse(new TextDecoder().decode(payloadBytes)) as SessionPayload;
  } catch {
    return null;
  }
}

function base64UrlToBytes(value: string) {
  try {
    const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const binary = atob(paddedBase64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  } catch {
    return null;
  }
}
