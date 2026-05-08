import type {
  DocumentRequest,
  DocumentRequestPriority,
  DocumentRequestStatus
} from "@/lib/document-request-types";
import type { FormValues } from "@/lib/forms";
import type { ModuleSlug } from "@/lib/modules";

export type RequesterDocumentRequestSummary = {
  id: string;
  module_slug: ModuleSlug;
  title: string;
  priority: DocumentRequestPriority;
  status: DocumentRequestStatus;
  protocol_number: string;
  created_at: string;
  updated_at: string;
  final_document_available: boolean;
};

export type RequesterDocumentRequestDetail = RequesterDocumentRequestSummary & {
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  requester_department: string;
  structured_fields: FormValues;
  public_messages: string[];
  pending_items: string[];
  final_document_text: string;
  final_document_url: string;
};

export function toRequesterSummary(
  request: DocumentRequest
): RequesterDocumentRequestSummary {
  return {
    id: request.id,
    module_slug: request.module_slug,
    title: request.title,
    priority: request.priority,
    status: request.status,
    protocol_number: request.protocol_number,
    created_at: request.created_at,
    updated_at: request.updated_at,
    final_document_available: Boolean(
      request.final_document_text.trim() || request.final_document_url.trim()
    )
  };
}

export function toRequesterDetail(request: DocumentRequest): RequesterDocumentRequestDetail {
  return {
    ...toRequesterSummary(request),
    requester_name: request.requester_name,
    requester_email: request.requester_email,
    requester_phone: request.requester_phone,
    requester_department: request.requester_department,
    structured_fields: request.structured_fields,
    public_messages: buildRequesterMessages(request),
    pending_items: buildPendingItems(request),
    final_document_text: request.final_document_text,
    final_document_url: request.final_document_url
  };
}

export function getRequesterStatusMessage(status: DocumentRequestStatus) {
  const messages: Record<DocumentRequestStatus, string> = {
    recebido: "Sua solicitação foi recebida.",
    em_analise: "Sua solicitação está em análise pela equipe responsável.",
    aguardando_documentos: "Aguardando complementação documental.",
    em_producao: "Sua solicitação está em produção.",
    em_revisao: "O documento está em revisão.",
    concluido: "Solicitação concluída.",
    cancelado: "Solicitação cancelada."
  };

  return messages[status];
}

function buildRequesterMessages(request: DocumentRequest) {
  const messages = [getRequesterStatusMessage(request.status)];

  if (request.status === "concluido" && request.final_document_text.trim()) {
    messages.push("Documento final disponível.");
  }

  if (request.final_document_url.trim()) {
    messages.push("Link do documento final disponível para acesso.");
  }

  return messages;
}

function buildPendingItems(request: DocumentRequest) {
  if (request.status === "aguardando_documentos") {
    return [
      "A solicitação está marcada como aguardando complementação. Verifique com a equipe responsável quais documentos ou informações adicionais devem ser encaminhados."
    ];
  }

  if (request.status === "cancelado") {
    return ["Não há pendência ativa porque a solicitação foi cancelada."];
  }

  if (request.status === "concluido") {
    return ["Não há pendência documental pública registrada para esta solicitação."];
  }

  return ["Não há pendência documental pública registrada no momento."];
}
