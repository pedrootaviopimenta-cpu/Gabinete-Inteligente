import { getAuthenticatedUser } from "@/lib/auth";
import { forbiddenResponse, jsonNoStore, logControlledError, unauthorizedResponse } from "@/lib/api-security";
import { listDocumentRequests } from "@/lib/document-requests";
import { toRequesterSummary } from "@/lib/requester-document-request-types";
import { canViewOwnRequests } from "@/lib/permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  if (!canViewOwnRequests(user)) {
    return forbiddenResponse("Operação não disponível para este perfil de usuário.");
  }

  try {
    const requests = await listDocumentRequests();

    return jsonNoStore({
      requests: requests.map(toRequesterSummary),
      accessMode: "mvp_all_requests"
    });
  } catch (error) {
    logControlledError("my_document_requests_list", error);
    return jsonNoStore({ error: "Não foi possível carregar suas solicitações." }, 500);
  }
}
