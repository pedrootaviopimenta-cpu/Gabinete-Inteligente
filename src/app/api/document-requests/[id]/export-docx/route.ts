import { getAuthenticatedUser } from "@/lib/auth";
import {
  badRequestResponse,
  forbiddenResponse,
  isSafeUuid,
  logControlledError,
  notFoundResponse,
  unauthorizedResponse
} from "@/lib/api-security";
import { createAuditEvent } from "@/lib/audit";
import { getDocumentRequest } from "@/lib/document-requests";
import { generateDocumentRequestDocx } from "@/lib/docx/export-docx";
import { getOrganizationSettings } from "@/lib/organization-settings";
import { canExportDocuments } from "@/lib/permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  if (!canExportDocuments(user)) {
    return forbiddenResponse("Operação restrita ao administrador.");
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

    if (!documentRequest.final_document_text.trim()) {
      return badRequestResponse("Insira o texto final antes de exportar.");
    }

    const organizationSettings = await getOrganizationSettings();
    const buffer = await generateDocumentRequestDocx({
      request: documentRequest,
      organizationSettings
    });
    const body = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(body).set(buffer);
    const fileName = sanitizeFileName(
      `${documentRequest.protocol_number}-${documentRequest.title}.docx`
    );

    try {
      await createAuditEvent({
        requestId: id,
        eventType: "final_document_exported",
        actorUsername: user.username,
        actorRole: user.role,
        description: "Documento final exportado em formato DOCX.",
        metadata: {
          bytes: buffer.byteLength,
          moduleSlug: documentRequest.module_slug
        }
      });
    } catch (error) {
      logControlledError("audit_docx_exported", error);
    }

    return new Response(body, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Length": String(buffer.byteLength),
        "Content-Disposition": `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
      }
    });
  } catch (error) {
    logControlledError("document_request_export_docx", error);
    return new Response("Não foi possível exportar o documento DOCX.", {
      status: 500,
      headers: {
        "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  }
}

function sanitizeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 180)
    .replace(/^_+|_+$/g, "");
}
