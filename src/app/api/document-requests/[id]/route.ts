import { getDocumentRequest, updateDocumentRequest } from "@/lib/document-requests";
import {
  isDocumentRequestStatus,
  type UpdateDocumentRequestInput
} from "@/lib/document-request-types";
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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedUpdateKeys = [
  "status",
  "internal_notes",
  "final_document_text",
  "final_document_url"
];

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UpdatePayload = {
  status?: string;
  internal_notes?: string;
  final_document_text?: string;
  final_document_url?: string;
};

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
    const documentRequest = await getDocumentRequest(id);

    if (!documentRequest) {
      return notFoundResponse("Solicitação não encontrada.");
    }

    return jsonNoStore({ request: documentRequest });
  } catch (error) {
    logControlledError("document_requests_detail", error);
    return jsonNoStore({ error: "Não foi possível carregar a solicitação." }, 500);
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

  const parsedBody = await readJsonWithLimit<UpdatePayload>(request);

  if ("error" in parsedBody) {
    return badRequestResponse(parsedBody.error);
  }

  const body = parsedBody.data;

  if (!hasOnlyAllowedKeys(body, allowedUpdateKeys)) {
    return badRequestResponse("Requisição inválida.");
  }

  const update: UpdateDocumentRequestInput = {};

  if (body.status !== undefined) {
    if (!isDocumentRequestStatus(body.status)) {
      return badRequestResponse("Status inválido.");
    }

    update.status = body.status;
  }

  if (typeof body.internal_notes === "string") {
    update.internal_notes = trimToMax(body.internal_notes, 20_000);
  }

  if (typeof body.final_document_text === "string") {
    update.final_document_text = trimToMax(body.final_document_text, 80_000);
  }

  if (typeof body.final_document_url === "string") {
    const finalDocumentUrl = trimToMax(body.final_document_url, 2_048);

    if (finalDocumentUrl && !isAllowedDocumentUrl(finalDocumentUrl)) {
      return badRequestResponse("URL do documento final inválida.");
    }

    update.final_document_url = finalDocumentUrl;
  }

  try {
    const documentRequest = await updateDocumentRequest(id, update);

    if (!documentRequest) {
      return notFoundResponse("Solicitação não encontrada.");
    }

    return jsonNoStore({ request: documentRequest });
  } catch (error) {
    logControlledError("document_requests_update", error);
    return jsonNoStore({ error: "Não foi possível atualizar a solicitação." }, 500);
  }
}

function isAllowedDocumentUrl(value: string) {
  if (value.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
