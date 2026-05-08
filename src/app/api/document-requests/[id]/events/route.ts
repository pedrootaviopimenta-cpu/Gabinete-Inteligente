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
import { listAuditEventsForRequest } from "@/lib/audit";
import { getDocumentRequest } from "@/lib/document-requests";
import { canAccessAdmin } from "@/lib/permissions";

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

    const events = await listAuditEventsForRequest(id);
    return jsonNoStore({ events });
  } catch (error) {
    logControlledError("audit_events_list", error);
    return jsonNoStore({ error: "Não foi possível carregar o histórico da solicitação." }, 500);
  }
}
