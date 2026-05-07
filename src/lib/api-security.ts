import { NextResponse } from "next/server";

export const restrictedAccessMessage = "Acesso restrito a usuários autorizados.";
export const genericServerErrorMessage =
  "Não foi possível concluir a operação neste momento.";

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0"
};

export function jsonNoStore<T>(body: T, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: noStoreHeaders
  });
}

export function unauthorizedResponse() {
  return jsonNoStore({ error: restrictedAccessMessage }, 401);
}

export function badRequestResponse(message = "Requisição inválida.") {
  return jsonNoStore({ error: message }, 400);
}

export function forbiddenResponse(message = "Operação não disponível para este ambiente.") {
  return jsonNoStore({ error: message }, 403);
}

export function notFoundResponse(message = "Registro não encontrado.") {
  return jsonNoStore({ error: message }, 404);
}

export function serverErrorResponse() {
  return jsonNoStore({ error: genericServerErrorMessage }, 500);
}

export async function readJsonWithLimit<T>(request: Request, maxBytes = 200_000) {
  const contentLength = Number(request.headers.get("content-length") || "0");

  if (contentLength > maxBytes) {
    return { error: "Requisição excede o tamanho máximo permitido." } as const;
  }

  try {
    return { data: (await request.json()) as T } as const;
  } catch {
    return { error: "Requisição inválida." } as const;
  }
}

export function logControlledError(context: string, error: unknown) {
  const errorName = error instanceof Error ? error.name : typeof error;
  console.error(`[GI:${context}] erro controlado (${errorName})`);
}

export function isSafeUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export function hasOnlyAllowedKeys(value: unknown, allowedKeys: string[]) {
  if (!isPlainRecord(value)) {
    return false;
  }

  return Object.keys(value).every((key) => allowedKeys.includes(key));
}

export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function trimToMax(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}
