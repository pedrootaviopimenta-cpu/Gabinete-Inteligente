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
  unauthorizedResponse
} from "@/lib/api-security";
import { getDocumentRequest } from "@/lib/document-requests";
import { createAuditEvent } from "@/lib/audit";
import {
  createDocumentRequestMessage,
  listDocumentRequestMessages
} from "@/lib/document-request-messages";
import {
  isDocumentRequestMessageAuthorType,
  isDocumentRequestMessageVisibility,
  maxDocumentRequestMessageLength,
  type DocumentRequestMessageAuthorType,
  type DocumentRequestMessageVisibility
} from "@/lib/document-request-message-types";
import { canSendPublicMessages, canViewInternalNotes } from "@/lib/permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CreateMessagePayload = {
  authorType?: string;
  visibility?: string;
  message?: string;
};

const allowedCreateKeys = ["authorType", "visibility", "message"];

export async function GET(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;

  if (!isSafeUuid(id)) {
    return badRequestResponse("Identificador inválido.");
  }

  const { searchParams } = new URL(request.url);
  const requestedVisibility = searchParams.get("visibility") || "public";
  const isAdmin = canViewInternalNotes(user);

  if ((requestedVisibility === "all" || requestedVisibility === "internal") && !isAdmin) {
    return forbiddenResponse("Operação restrita à equipe responsável.");
  }

  if (
    requestedVisibility !== "all" &&
    !isDocumentRequestMessageVisibility(requestedVisibility)
  ) {
    return badRequestResponse("Visibilidade inválida.");
  }

  try {
    const documentRequest = await getDocumentRequest(id);

    if (!documentRequest) {
      return notFoundResponse("Solicitação não encontrada.");
    }

    const messages = await listDocumentRequestMessages(
      id,
      requestedVisibility === "all"
        ? {}
        : { visibility: requestedVisibility as DocumentRequestMessageVisibility }
    );

    return jsonNoStore({ messages });
  } catch (error) {
    logControlledError("document_request_messages_list", error);
    return jsonNoStore({ error: "Não foi possível carregar as mensagens." }, 500);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;

  if (!isSafeUuid(id)) {
    return badRequestResponse("Identificador inválido.");
  }

  const parsedBody = await readJsonWithLimit<CreateMessagePayload>(request, 20_000);

  if ("error" in parsedBody) {
    return badRequestResponse(parsedBody.error);
  }

  const body = parsedBody.data;

  if (!hasOnlyAllowedKeys(body, allowedCreateKeys)) {
    return badRequestResponse("Requisição inválida.");
  }

  const visibility = body.visibility || "public";

  if (!isDocumentRequestMessageVisibility(visibility)) {
    return badRequestResponse("Visibilidade inválida.");
  }

  if (visibility === "internal" && !canViewInternalNotes(user)) {
    return forbiddenResponse("Operação restrita à equipe responsável.");
  }

  if (visibility === "public" && !canSendPublicMessages(user)) {
    return forbiddenResponse("Operação restrita à equipe responsável.");
  }

  const authorType = normalizeAuthorType(body.authorType, visibility);

  if (!authorType) {
    return badRequestResponse("Tipo de autoria inválido.");
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return badRequestResponse("A mensagem não pode estar vazia.");
  }

  if (message.length > maxDocumentRequestMessageLength) {
    return badRequestResponse("Mensagem excede o tamanho máximo permitido.");
  }

  try {
    const documentRequest = await getDocumentRequest(id);

    if (!documentRequest) {
      return notFoundResponse("Solicitação não encontrada.");
    }

    const createdMessage = await createDocumentRequestMessage({
      request_id: id,
      author_type: authorType,
      author_name: user.username,
      visibility,
      message
    });

    try {
      await createAuditEvent({
        requestId: id,
        eventType: visibility === "public" ? "public_message_created" : "internal_message_created",
        actorUsername: user.username,
        actorRole: user.role,
        description:
          visibility === "public"
            ? "Mensagem pública enviada ao solicitante."
            : "Nota interna registrada para a equipe responsável.",
        metadata: {
          messageId: createdMessage.id,
          visibility
        }
      });
    } catch (error) {
      logControlledError("audit_message_created", error);
    }

    return jsonNoStore({ message: createdMessage }, 201);
  } catch (error) {
    logControlledError("document_request_messages_create", error);
    return jsonNoStore({ error: "Não foi possível registrar a mensagem." }, 500);
  }
}

function normalizeAuthorType(
  value: string | undefined,
  visibility: DocumentRequestMessageVisibility
): DocumentRequestMessageAuthorType | null {
  if (!value) {
    return visibility === "internal" ? "admin" : "admin";
  }

  if (!isDocumentRequestMessageAuthorType(value)) {
    return null;
  }

  if (value === "system") {
    return null;
  }

  return value;
}
