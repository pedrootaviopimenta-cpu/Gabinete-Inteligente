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
import { updateDocumentRequestPendingItem } from "@/lib/document-request-pending-items";
import {
  isDocumentRequestPendingItemStatus,
  type UpdateDocumentRequestPendingItemInput
} from "@/lib/document-request-pending-item-types";
import { canManagePendingItems } from "@/lib/permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string; pendingItemId: string }>;
};

type UpdatePendingItemPayload = {
  title?: string;
  description?: string;
  status?: string;
};

const allowedUpdateKeys = ["title", "description", "status"];

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  if (!canManagePendingItems(user)) {
    return forbiddenResponse("Operação restrita à equipe responsável.");
  }

  const { id, pendingItemId } = await context.params;

  if (!isSafeUuid(id) || !isSafeUuid(pendingItemId)) {
    return badRequestResponse("Identificador inválido.");
  }

  const parsedBody = await readJsonWithLimit<UpdatePendingItemPayload>(request, 20_000);

  if ("error" in parsedBody) {
    return badRequestResponse(parsedBody.error);
  }

  const body = parsedBody.data;

  if (!hasOnlyAllowedKeys(body, allowedUpdateKeys)) {
    return badRequestResponse("Requisição inválida.");
  }

  const update: UpdateDocumentRequestPendingItemInput = {};

  if (typeof body.title === "string") {
    const title = trimToMax(body.title, 220);

    if (!title) {
      return badRequestResponse("Informe o título da pendência documental.");
    }

    update.title = title;
  }

  if (typeof body.description === "string") {
    update.description = trimToMax(body.description, 4_000);
  }

  if (body.status !== undefined) {
    if (!isDocumentRequestPendingItemStatus(body.status)) {
      return badRequestResponse("Status da pendência inválido.");
    }

    update.status = body.status;
  }

  try {
    const documentRequest = await getDocumentRequest(id);

    if (!documentRequest) {
      return notFoundResponse("Solicitação não encontrada.");
    }

    const pendingItem = await updateDocumentRequestPendingItem(id, pendingItemId, update);

    if (!pendingItem) {
      return notFoundResponse("Pendência documental não encontrada.");
    }

    try {
      await createAuditEvent({
        requestId: id,
        eventType: "pending_item_updated",
        actorUsername: user.username,
        actorRole: user.role,
        description: "Pendência documental atualizada.",
        metadata: {
          pendingItemId: pendingItem.id,
          status: pendingItem.status
        }
      });
    } catch (error) {
      logControlledError("audit_pending_item_updated", error);
    }

    return jsonNoStore({ pendingItem });
  } catch (error) {
    logControlledError("pending_items_update", error);
    return jsonNoStore({ error: "Não foi possível atualizar a pendência documental." }, 500);
  }
}
