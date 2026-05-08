import { getAuthenticatedUser } from "@/lib/auth";
import {
  badRequestResponse,
  hasOnlyAllowedKeys,
  jsonNoStore,
  logControlledError,
  readJsonWithLimit,
  trimToMax,
  unauthorizedResponse
} from "@/lib/api-security";
import { createMunicipalNorm, listMunicipalNorms } from "@/lib/municipal-norms";
import type { CreateMunicipalNormInput } from "@/lib/municipal-norm-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);

  try {
    const norms = await listMunicipalNorms({
      query: searchParams.get("query") || "",
      subject: searchParams.get("subject") || ""
    });

    return jsonNoStore({ norms });
  } catch (error) {
    logControlledError("municipal_norms_list", error);
    return jsonNoStore({ error: "Não foi possível carregar a base normativa." }, 500);
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const parsedBody = await readJsonWithLimit<CreateMunicipalNormInput>(request, 120_000);

  if ("error" in parsedBody) {
    return badRequestResponse(parsedBody.error);
  }

  const body = parsedBody.data;

  if (!hasOnlyAllowedKeys(body, allowedKeys)) {
    return badRequestResponse("Requisição inválida.");
  }

  const validation = validateNormPayload(body);

  if ("error" in validation) {
    return badRequestResponse(validation.error);
  }

  try {
    const norm = await createMunicipalNorm(validation.input);
    return jsonNoStore({ norm }, 201);
  } catch (error) {
    logControlledError("municipal_norms_create", error);
    return jsonNoStore({ error: "Não foi possível cadastrar a norma municipal." }, 500);
  }
}

function validateNormPayload(
  body: Partial<CreateMunicipalNormInput>
): { input: CreateMunicipalNormInput } | { error: string } {
  const norm_type = trimToMax(body.norm_type, 120);
  const number = trimToMax(body.number, 60);
  const title = trimToMax(body.title, 300);
  const subject = trimToMax(body.subject, 160);
  const year = normalizeYear(body.year);

  if (!norm_type) {
    return { error: "Informe a espécie normativa." };
  }

  if (!number) {
    return { error: "Informe o número da norma." };
  }

  if (!year) {
    return { error: "Informe um ano válido." };
  }

  if (!title) {
    return { error: "Informe a ementa ou título da norma." };
  }

  if (!subject) {
    return { error: "Informe o assunto da norma." };
  }

  return {
    input: {
      norm_type,
      number,
      year,
      title,
      summary: trimToMax(body.summary, 4_000),
      subject,
      source_url: trimToMax(body.source_url, 2_048),
      published_at: normalizeDate(body.published_at),
      effective_from: normalizeDate(body.effective_from),
      revoked_at: normalizeDate(body.revoked_at),
      content_markdown: trimToMax(body.content_markdown, 80_000),
      metadata: typeof body.metadata === "object" && body.metadata ? body.metadata : {}
    }
  };
}

function normalizeYear(value: unknown) {
  const year = Number(value);
  return Number.isInteger(year) && year >= 1800 && year <= 2200 ? year : null;
}

function normalizeDate(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}
