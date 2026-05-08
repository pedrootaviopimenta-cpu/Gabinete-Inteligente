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
import { toRequesterDetail } from "@/lib/requester-document-request-types";
import { canViewOwnRequests } from "@/lib/permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  if (!canViewOwnRequests(user)) {
    return forbiddenResponse("Operação não disponível para este perfil de usuário.");
  }

  const { id } = await context.params;

  if (!isSafeUuid(id)) {
    return badRequestResponse("Identificador inválido.");
  }

  try {
    const request = await getDocumentRequest(id);

    if (!request) {
      return notFoundResponse("Solicitação não encontrada.");
    }

    return jsonNoStore({
      request: toRequesterDetail(request),
      accessMode: "mvp_all_requests"
    });
  } catch (error) {
    logControlledError("my_document_requests_detail", error);
    return jsonNoStore({ error: "Não foi possível carregar sua solicitação." }, 500);
  }
}
