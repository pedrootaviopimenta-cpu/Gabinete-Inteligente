import {
  createDocumentRequest,
  listDocumentRequests
} from "@/lib/document-requests";
import {
  isDocumentRequestPriority,
  isDocumentRequestStatus,
  type CreateDocumentRequestInput
} from "@/lib/document-request-types";
import { buildStructuredPayload, getFormDefinition, validateForm, type FormValues } from "@/lib/forms";
import { parseDateFromAdministrativeText, type DeadlineFilter } from "@/lib/deadlines";
import { getModuleBySlug, isModuleSlug, type ModuleSlug } from "@/lib/modules";
import { getAuthenticatedUser } from "@/lib/auth";
import { createAuditEvent } from "@/lib/audit";
import { canAccessAdmin, canCreateRequests } from "@/lib/permissions";
import {
  badRequestResponse,
  forbiddenResponse,
  hasOnlyAllowedKeys,
  isPlainRecord,
  jsonNoStore,
  logControlledError,
  readJsonWithLimit,
  trimToMax,
  unauthorizedResponse
} from "@/lib/api-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedCreateKeys = [
  "moduleSlug",
  "title",
  "requesterName",
  "requesterEmail",
  "requesterPhone",
  "requesterDepartment",
  "priority",
  "fields",
  "context"
];

type DocumentRequestPayload = {
  moduleSlug?: string;
  title?: string;
  requesterName?: string;
  requesterEmail?: string;
  requesterPhone?: string;
  requesterDepartment?: string;
  priority?: string;
  fields?: FormValues;
  context?: string;
};

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  if (!canAccessAdmin(user)) {
    return forbiddenResponse("Operação restrita à equipe responsável.");
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const moduleSlug = searchParams.get("moduleSlug") || "";
  const priority = searchParams.get("priority") || "";
  const deadline = normalizeDeadlineFilter(searchParams.get("deadline") || "");

  try {
    const requests = await listDocumentRequests({
      status: isDocumentRequestStatus(status) ? status : undefined,
      moduleSlug: isModuleSlug(moduleSlug) ? moduleSlug : undefined,
      priority: isDocumentRequestPriority(priority) ? priority : undefined,
      deadline
    });

    return jsonNoStore({ requests });
  } catch (error) {
    logControlledError("document_requests_list", error);
    return jsonNoStore({ error: "Não foi possível carregar as solicitações." }, 500);
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  if (!canCreateRequests(user)) {
    return forbiddenResponse("Operação não disponível para este perfil de usuário.");
  }

  const parsedBody = await readJsonWithLimit<DocumentRequestPayload>(request);

  if ("error" in parsedBody) {
    return badRequestResponse(parsedBody.error);
  }

  const body = parsedBody.data;

  if (!hasOnlyAllowedKeys(body, allowedCreateKeys)) {
    return badRequestResponse("Requisição inválida.");
  }

  const validation = validatePayload(body, user.username);

  if ("error" in validation) {
    return badRequestResponse(validation.error);
  }

  try {
    const documentRequest = await createDocumentRequest(validation.input);

    try {
      await createAuditEvent({
        requestId: documentRequest.id,
        eventType: "request_created",
        actorUsername: user.username,
        actorRole: user.role,
        description: "Solicitação criada pelo formulário assistido.",
        metadata: {
          moduleSlug: documentRequest.module_slug,
          priority: documentRequest.priority,
          protocolNumber: documentRequest.protocol_number
        }
      });
    } catch (error) {
      logControlledError("audit_request_created", error);
    }

    return jsonNoStore(
      {
        request: documentRequest,
        protocolNumber: documentRequest.protocol_number,
        message:
          "Solicitação recebida para produção documental assistida. O protocolo interno foi gerado para acompanhamento administrativo."
      },
      201
    );
  } catch (error) {
    logControlledError("document_requests_create", error);
    return jsonNoStore({ error: "Não foi possível registrar a solicitação." }, 500);
  }
}

function validatePayload(
  body: DocumentRequestPayload,
  requesterUsername: string
):
  | { input: CreateDocumentRequestInput }
  | { error: string } {
  if (!body.moduleSlug || !isModuleSlug(body.moduleSlug)) {
    return { error: "Módulo inválido para solicitação assistida." };
  }

  const module = getModuleBySlug(body.moduleSlug);
  const fields = normalizeFields(isPlainRecord(body.fields) ? (body.fields as FormValues) : {});
  const form = getFormDefinition(body.moduleSlug);
  const formErrors = validateForm(form, fields);
  const requesterEmail = trimToMax(body.requesterEmail, 254);

  if (Object.keys(formErrors).length) {
    return { error: "Preencha os campos obrigatórios do formulário antes de enviar." };
  }

  const title = trimToMax(body.title, 220);
  const requesterName = trimToMax(body.requesterName, 160);
  const requesterDepartment = trimToMax(body.requesterDepartment, 180);

  if (!title) {
    return { error: "Informe um título administrativo para a solicitação." };
  }

  if (!requesterName) {
    return { error: "Informe o nome do solicitante." };
  }

  if (!isValidEmail(requesterEmail)) {
    return { error: "Informe um e-mail válido para o solicitante." };
  }

  if (!requesterDepartment) {
    return { error: "Informe a secretaria, setor ou unidade solicitante." };
  }

  if (!body.priority || !isDocumentRequestPriority(body.priority)) {
    return { error: "Informe uma prioridade válida." };
  }

  return {
    input: {
      module_slug: body.moduleSlug,
      title: title || module.name,
      requester_name: requesterName,
      requester_username: requesterUsername,
      requester_user_id: "",
      requester_email: requesterEmail,
      requester_phone: trimToMax(body.requesterPhone, 60),
      requester_department: requesterDepartment,
      priority: body.priority,
      structured_fields: fields,
      structured_context: trimToMax(body.context, 30_000) || buildStructuredPayload(form, fields),
      ...extractDeadlineFields(body.moduleSlug, fields)
    }
  };
}

function extractDeadlineFields(moduleSlug: ModuleSlug, fields: FormValues) {
  const dueDate =
    moduleSlug === "ministerio-publico"
      ? parseDateFromAdministrativeText(fields.prazo_resposta)
      : moduleSlug === "oficios"
        ? parseDateFromAdministrativeText(fields.prazo_mencionado)
        : moduleSlug === "checklists"
          ? parseDateFromAdministrativeText(fields.prazo_interno)
          : "";
  const receivedAt =
    moduleSlug === "ministerio-publico"
      ? parseDateFromAdministrativeText(fields.data_recebimento)
      : "";

  return {
    due_date: dueDate,
    received_at: receivedAt,
    deadline_notes: buildDeadlineNotes(moduleSlug, fields)
  };
}

function buildDeadlineNotes(moduleSlug: ModuleSlug, fields: FormValues) {
  if (moduleSlug === "ministerio-publico") {
    return typeof fields.prazo_resposta === "string" ? fields.prazo_resposta.trim().slice(0, 2_000) : "";
  }

  if (moduleSlug === "oficios") {
    return typeof fields.prazo_mencionado === "string" ? fields.prazo_mencionado.trim().slice(0, 2_000) : "";
  }

  if (moduleSlug === "checklists") {
    return typeof fields.prazo_interno === "string" ? fields.prazo_interno.trim().slice(0, 2_000) : "";
  }

  return "";
}

function normalizeFields(fields: FormValues): FormValues {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, value.slice(0, 50).map((item) => String(item || "").trim().slice(0, 4_000))];
      }

      if (typeof value === "boolean") {
        return [key, value];
      }

      return [key, String(value || "").trim().slice(0, 8_000)];
    })
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizeDeadlineFilter(value: string): DeadlineFilter | undefined {
  return value === "overdue" || value === "due_soon" || value === "no_deadline"
    ? value
    : undefined;
}
