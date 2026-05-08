import { getAuthenticatedUser } from "@/lib/auth";
import {
  badRequestResponse,
  forbiddenResponse,
  isSafeUuid,
  jsonNoStore,
  logControlledError,
  notFoundResponse,
  unauthorizedResponse
} from "@/lib/api-security";
import { getDocumentRequest } from "@/lib/document-requests";
import { deleteAttachment } from "@/lib/file-storage";
import { canUploadAttachments } from "@/lib/permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string; attachmentId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  if (!canUploadAttachments(user)) {
    return forbiddenResponse("Operação não disponível para este perfil de usuário.");
  }

  const { id, attachmentId } = await context.params;

  if (!isSafeUuid(id) || !isSafeUuid(attachmentId)) {
    return badRequestResponse("Identificador inválido.");
  }

  try {
    const documentRequest = await getDocumentRequest(id);

    if (!documentRequest) {
      return notFoundResponse("Solicitação não encontrada.");
    }

    const deleted = await deleteAttachment(id, attachmentId);

    if (!deleted) {
      return notFoundResponse("Documento anexo não encontrado.");
    }

    return jsonNoStore({ ok: true });
  } catch (error) {
    logControlledError("attachments_delete", error);
    return jsonNoStore({ error: "Não foi possível remover o documento anexo." }, 500);
  }
}
