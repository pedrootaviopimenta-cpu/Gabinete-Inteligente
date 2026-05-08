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
import { getDocumentRequest } from "@/lib/document-requests";
import { createAuditEvent } from "@/lib/audit";
import {
  createDocumentRequestPendingItem,
  listDocumentRequestPendingItems
} from "@/lib/document-request-pending-items";
import { canManagePendingItems } from "@/lib/permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CreatePendingItemPayload = {
  title?: string;
  description?: string;
};

const allowedCreateKeys = ["title", "description"];

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

    const pendingItems = await listDocumentRequestPendingItems(id);
    return jsonNoStore({ pendingItems });
  } catch (error) {
    logControlledError("pending_items_list", error);
    return jsonNoStore({ error: "Não foi possível carregar as pendências documentais." }, 500);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  if (!canManagePendingItems(user)) {
    return forbiddenResponse("Operação restrita à equipe responsável.");
  }

  const { id } = await context.params;

  if (!isSafeUuid(id)) {
    return badRequestResponse("Identificador inválido.");
  }

  const parsedBody = await readJsonWithLimit<CreatePendingItemPayload>(request, 20_000);

  if ("error" in parsedBody) {
    return badRequestResponse(parsedBody.error);
  }

  const body = parsedBody.data;

  if (!hasOnlyAllowedKeys(body, allowedCreateKeys)) {
    return badRequestResponse("Requisição inválida.");
  }

  const title = trimToMax(body.title, 220);
  const description = trimToMax(body.description, 4_000);

  if (!title) {
    return badRequestResponse("Informe o título da pendência documental.");
  }

  try {
    const documentRequest = await getDocumentRequest(id);

    if (!documentRequest) {
      return notFoundResponse("Solicitação não encontrada.");
    }

    const pendingItem = await createDocumentRequestPendingItem({
      request_id: id,
      title,
      description,
      requested_by: user.username
    });

    try {
      await createAuditEvent({
        requestId: id,
        eventType: "pending_item_created",
        actorUsername: user.username,
        actorRole: user.role,
        description: "Pendência documental registrada.",
        metadata: {
          pendingItemId: pendingItem.id,
          status: pendingItem.status
        }
      });
    } catch (error) {
      logControlledError("audit_pending_item_created", error);
    }

    return jsonNoStore(
      {
        pendingItem,
        statusSuggestion: "aguardando_documentos",
        message:
          "Pendência documental registrada. Se a solicitação depender desse documento, avalie alterar o status para Aguardando documentos."
      },
      201
    );
  } catch (error) {
    logControlledError("pending_items_create", error);
    return jsonNoStore({ error: "Não foi possível registrar a pendência documental." }, 500);
  }
}
