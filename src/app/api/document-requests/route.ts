import { NextResponse } from "next/server";
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

export const runtime = "nodejs";

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
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const moduleSlug = searchParams.get("moduleSlug") || "";
  const priority = searchParams.get("priority") || "";

  const requests = await listDocumentRequests({
    status: isDocumentRequestStatus(status) ? status : undefined,
    moduleSlug: isModuleSlug(moduleSlug) ? moduleSlug : undefined,
    priority: isDocumentRequestPriority(priority) ? priority : undefined
  });

  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const body = (await request.json()) as DocumentRequestPayload;
  const validation = validatePayload(body);

  if ("error" in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const documentRequest = await createDocumentRequest(validation.input);

  return NextResponse.json(
    {
      request: documentRequest,
      protocolNumber: documentRequest.protocol_number,
      message:
        "Solicitação recebida para produção documental assistida. O protocolo interno foi gerado para acompanhamento administrativo."
    },
    { status: 201 }
  );
}

function validatePayload(body: DocumentRequestPayload):
  | { input: CreateDocumentRequestInput }
  | { error: string } {
  if (!body.moduleSlug || !isModuleSlug(body.moduleSlug)) {
    return { error: "Módulo inválido para solicitação assistida." };
  }

  const module = getModuleBySlug(body.moduleSlug);
  const fields = normalizeFields(body.fields || {});
  const form = getFormDefinition(body.moduleSlug);
  const formErrors = validateForm(form, fields);
  const requesterEmail = body.requesterEmail?.trim() || "";

  if (Object.keys(formErrors).length) {
    return { error: "Preencha os campos obrigatórios do formulário antes de enviar." };
  }

  if (!body.title?.trim()) {
    return { error: "Informe um título administrativo para a solicitação." };
  }

  if (!body.requesterName?.trim()) {
    return { error: "Informe o nome do solicitante." };
  }

  if (!isValidEmail(requesterEmail)) {
    return { error: "Informe um e-mail válido para o solicitante." };
  }

  if (!body.requesterDepartment?.trim()) {
    return { error: "Informe a secretaria, setor ou unidade solicitante." };
  }

  if (!body.priority || !isDocumentRequestPriority(body.priority)) {
    return { error: "Informe uma prioridade válida." };
  }

  return {
    input: {
      module_slug: body.moduleSlug,
      title: body.title.trim() || module.name,
      requester_name: body.requesterName.trim(),
      requester_email: requesterEmail,
      requester_phone: body.requesterPhone?.trim() || "",
      requester_department: body.requesterDepartment.trim(),
      priority: body.priority,
      structured_fields: fields,
      structured_context: body.context?.trim() || buildStructuredPayload(form, fields)
    }
  };
}

function normalizeFields(fields: FormValues): FormValues {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, value.map((item) => String(item || "").trim())];
      }

      if (typeof value === "boolean") {
        return [key, value];
      }

      return [key, String(value || "").trim()];
    })
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
