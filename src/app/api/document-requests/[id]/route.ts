import { getDocumentRequest, updateDocumentRequest } from "@/lib/document-requests";
import { createAuditEvent } from "@/lib/audit";
import { createStatusChangeMessage } from "@/lib/document-request-messages";
import {
  documentRequestStatusLabels,
  isDocumentRequestStatus,
  type UpdateDocumentRequestInput
} from "@/lib/document-request-types";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  badRequestResponse,
  forbiddenResponse,
  hasOnlyAllowedKeys,
  isSafeUuid,
  jsonNoStore,
  logControlledError,
  notFoundResponse,
  readJsonWithLimit,
  trimToMax,
  unauthorizedResponse
} from "@/lib/api-security";
import {
  canAccessAdmin,
  canEditFinalDocument,
  canManageRequests,
  canViewInternalNotes
} from "@/lib/permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedUpdateKeys = [
  "status",
  "internal_notes",
  "final_document_text",
  "final_document_url",
  "related_norms_text",
  "due_date",
  "received_at",
  "deadline_notes"
];

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UpdatePayload = {
  status?: string;
  internal_notes?: string;
  final_document_text?: string;
  final_document_url?: string;
  related_norms_text?: string;
  due_date?: string;
  received_at?: string;
  deadline_notes?: string;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  if (!canAccessAdmin(user)) {
    return forbiddenResponse("Operação restrita à equipe responsável.");
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

  if (!canAccessAdmin(user)) {
    return forbiddenResponse("Operação restrita à equipe responsável.");
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

  if (typeof body.related_norms_text === "string") {
    update.related_norms_text = trimToMax(body.related_norms_text, 8_000);
  }

  if (typeof body.due_date === "string") {
    if (body.due_date && !isIsoDate(body.due_date)) {
      return badRequestResponse("Prazo inválido.");
    }

    update.due_date = body.due_date;
  }

  if (typeof body.received_at === "string") {
    if (body.received_at && !isIsoDate(body.received_at)) {
      return badRequestResponse("Data de recebimento inválida.");
    }

    update.received_at = body.received_at;
  }

  if (typeof body.deadline_notes === "string") {
    update.deadline_notes = trimToMax(body.deadline_notes, 4_000);
  }

  if (update.status && !canManageRequests(user)) {
    return forbiddenResponse("Operação restrita a perfis autorizados para gestão de status.");
  }

  if (update.internal_notes !== undefined && !canViewInternalNotes(user)) {
    return forbiddenResponse("Operação restrita a perfis autorizados para notas internas.");
  }

  if (
    (update.final_document_text !== undefined || update.final_document_url !== undefined) &&
    !canEditFinalDocument(user)
  ) {
    return forbiddenResponse("Operação restrita a perfis autorizados para edição do documento final.");
  }

  try {
    const previousRequest = await getDocumentRequest(id);
    const documentRequest = await updateDocumentRequest(id, update);

    if (!documentRequest) {
      return notFoundResponse("Solicitação não encontrada.");
    }

    if (update.status && previousRequest && previousRequest.status !== update.status) {
      try {
        await createStatusChangeMessage(id, update.status);
      } catch (error) {
        logControlledError("document_requests_status_message", error);
      }
    }

    if (previousRequest) {
      await recordUpdateEvents(id, user, previousRequest, documentRequest, update);
    }

    return jsonNoStore({ request: documentRequest });
  } catch (error) {
    logControlledError("document_requests_update", error);
    return jsonNoStore({ error: "Não foi possível atualizar a solicitação." }, 500);
  }
}

async function recordUpdateEvents(
  requestId: string,
  user: Awaited<ReturnType<typeof getAuthenticatedUser>>,
  previousRequest: NonNullable<Awaited<ReturnType<typeof getDocumentRequest>>>,
  documentRequest: NonNullable<Awaited<ReturnType<typeof getDocumentRequest>>>,
  update: UpdateDocumentRequestInput
) {
  if (!user) {
    return;
  }

  try {
    if (update.status && previousRequest.status !== documentRequest.status) {
      await createAuditEvent({
        requestId,
        eventType: "status_changed",
        actorUsername: user.username,
        actorRole: user.role,
        description: `Status alterado para ${documentRequestStatusLabels[documentRequest.status]}.`,
        metadata: {
          from: previousRequest.status,
          to: documentRequest.status
        }
      });

      if (documentRequest.status === "concluido") {
        await createAuditEvent({
          requestId,
          eventType: "request_completed",
          actorUsername: user.username,
          actorRole: user.role,
          description: "Solicitação marcada como concluída."
        });
      }
    }

    if (
      update.internal_notes !== undefined &&
      previousRequest.internal_notes !== documentRequest.internal_notes
    ) {
      await createAuditEvent({
        requestId,
        eventType: "internal_note_updated",
        actorUsername: user.username,
        actorRole: user.role,
        description: "Notas internas atualizadas."
      });
    }

    if (
      (update.final_document_text !== undefined &&
        previousRequest.final_document_text !== documentRequest.final_document_text) ||
      (update.final_document_url !== undefined &&
        previousRequest.final_document_url !== documentRequest.final_document_url)
    ) {
      await createAuditEvent({
        requestId,
        eventType: "final_document_updated",
        actorUsername: user.username,
        actorRole: user.role,
        description: "Documento final atualizado.",
        metadata: {
          hasFinalText: Boolean(documentRequest.final_document_text.trim()),
          hasFinalUrl: Boolean(documentRequest.final_document_url.trim())
        }
      });
    }
  } catch (error) {
    logControlledError("audit_request_update", error);
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

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
