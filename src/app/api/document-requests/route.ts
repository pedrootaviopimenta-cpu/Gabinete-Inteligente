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
import { getModuleBySlug, isModuleSlug, type ModuleSlug } from "@/lib/modules";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  badRequestResponse,
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

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const moduleSlug = searchParams.get("moduleSlug") || "";
  const priority = searchParams.get("priority") || "";

  try {
    const requests = await listDocumentRequests({
      status: isDocumentRequestStatus(status) ? status : undefined,
      moduleSlug: isModuleSlug(moduleSlug) ? moduleSlug : undefined,
      priority: isDocumentRequestPriority(priority) ? priority : undefined
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

  const parsedBody = await readJsonWithLimit<DocumentRequestPayload>(request);

  if ("error" in parsedBody) {
    return badRequestResponse(parsedBody.error);
  }

  const body = parsedBody.data;

  if (!hasOnlyAllowedKeys(body, allowedCreateKeys)) {
    return badRequestResponse("Requisição inválida.");
  }

  const validation = validatePayload(body);

  if ("error" in validation) {
    return badRequestResponse(validation.error);
  }

  try {
    const documentRequest = await createDocumentRequest(validation.input);

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

function validatePayload(body: DocumentRequestPayload):
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
      requester_email: requesterEmail,
      requester_phone: trimToMax(body.requesterPhone, 60),
      requester_department: requesterDepartment,
      priority: body.priority,
      structured_fields: fields,
      structured_context: trimToMax(body.context, 30_000) || buildStructuredPayload(form, fields)
    }
  };
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
