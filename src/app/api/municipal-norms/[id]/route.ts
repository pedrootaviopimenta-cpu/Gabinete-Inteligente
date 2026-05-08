import { getAuthenticatedUser } from "@/lib/auth";
import {
  badRequestResponse,
  hasOnlyAllowedKeys,
  isSafeUuid,
  jsonNoStore,
  logControlledError,
  notFoundResponse,
  readJsonWithLimit,
  trimToMax,
  unauthorizedResponse
} from "@/lib/api-security";
import { getMunicipalNorm, updateMunicipalNorm } from "@/lib/municipal-norms";
import type { UpdateMunicipalNormInput } from "@/lib/municipal-norm-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const allowedKeys = [
  "norm_type",
  "number",
  "year",
  "title",
  "summary",
  "subject",
  "source_url",
  "published_at",
  "effective_from",
  "revoked_at",
  "content_markdown",
  "metadata"
];

export async function GET(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;

  if (!isSafeUuid(id)) {
    return badRequestResponse("Identificador inválido.");
  }

  try {
    const norm = await getMunicipalNorm(id);

    if (!norm) {
      return notFoundResponse("Norma municipal não encontrada.");
    }

    return jsonNoStore({ norm });
  } catch (error) {
    logControlledError("municipal_norm_detail", error);
    return jsonNoStore({ error: "Não foi possível carregar a norma municipal." }, 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;

  if (!isSafeUuid(id)) {
    return badRequestResponse("Identificador inválido.");
  }

  const parsedBody = await readJsonWithLimit<UpdateMunicipalNormInput>(request, 120_000);

  if ("error" in parsedBody) {
    return badRequestResponse(parsedBody.error);
  }

  const body = parsedBody.data;

  if (!hasOnlyAllowedKeys(body, allowedKeys)) {
    return badRequestResponse("Requisição inválida.");
  }

  const update = sanitizeUpdate(body);

  if (update.source_url && !isAllowedUrl(update.source_url)) {
    return badRequestResponse("Fonte oficial inválida.");
  }

  try {
    const norm = await updateMunicipalNorm(id, update);

    if (!norm) {
      return notFoundResponse("Norma municipal não encontrada.");
    }

    return jsonNoStore({ norm });
  } catch (error) {
    logControlledError("municipal_norm_update", error);
    return jsonNoStore({ error: "Não foi possível atualizar a norma municipal." }, 500);
  }
}

function sanitizeUpdate(body: UpdateMunicipalNormInput): UpdateMunicipalNormInput {
  return {
    norm_type: trimToMax(body.norm_type, 120),
    number: trimToMax(body.number, 60),
    year: normalizeYear(body.year),
    title: trimToMax(body.title, 300),
    summary: trimToMax(body.summary, 4_000),
    subject: trimToMax(body.subject, 160),
    source_url: trimToMax(body.source_url, 2_048),
    published_at: normalizeDate(body.published_at),
    effective_from: normalizeDate(body.effective_from),
    revoked_at: normalizeDate(body.revoked_at),
    content_markdown: trimToMax(body.content_markdown, 80_000),
    metadata: typeof body.metadata === "object" && body.metadata ? body.metadata : {}
  };
}

function normalizeYear(value: unknown) {
  const year = Number(value);
  return Number.isInteger(year) && year >= 1800 && year <= 2200 ? year : null;
}

function normalizeDate(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function isAllowedUrl(value: string) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
