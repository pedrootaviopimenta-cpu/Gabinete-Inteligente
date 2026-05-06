import type { FormValues } from "@/lib/forms";
import type { ModuleSlug } from "@/lib/modules";

export const documentRequestStatuses = [
  "recebido",
  "em_analise",
  "aguardando_documentos",
  "em_producao",
  "em_revisao",
  "concluido",
  "cancelado"
] as const;

export type DocumentRequestStatus = (typeof documentRequestStatuses)[number];

export const documentRequestPriorities = ["baixa", "normal", "alta", "urgente"] as const;

export type DocumentRequestPriority = (typeof documentRequestPriorities)[number];

export const documentRequestStatusLabels: Record<DocumentRequestStatus, string> = {
  recebido: "Recebido",
  em_analise: "Em análise",
  aguardando_documentos: "Aguardando documentos",
  em_producao: "Em produção",
  em_revisao: "Em revisão",
  concluido: "Concluído",
  cancelado: "Cancelado"
};

export const documentRequestPriorityLabels: Record<DocumentRequestPriority, string> = {
  baixa: "Baixa",
  normal: "Normal",
  alta: "Alta",
  urgente: "Urgente"
};

export type DocumentRequest = {
  id: string;
  module_slug: ModuleSlug;
  title: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  requester_department: string;
  priority: DocumentRequestPriority;
  status: DocumentRequestStatus;
  structured_fields: FormValues;
  structured_context: string;
  internal_notes: string;
  final_document_text: string;
  final_document_url: string;
  protocol_number: string;
  created_at: string;
  updated_at: string;
};

export type CreateDocumentRequestInput = {
  module_slug: ModuleSlug;
  title: string;
  requester_name: string;
  requester_email: string;
  requester_phone?: string;
  requester_department: string;
  priority: DocumentRequestPriority;
  structured_fields: FormValues;
  structured_context: string;
};

export type UpdateDocumentRequestInput = Partial<
  Pick<
    DocumentRequest,
    | "status"
    | "internal_notes"
    | "final_document_text"
    | "final_document_url"
  >
>;

export function isDocumentRequestStatus(value: string): value is DocumentRequestStatus {
  return documentRequestStatuses.includes(value as DocumentRequestStatus);
}

export function isDocumentRequestPriority(value: string): value is DocumentRequestPriority {
  return documentRequestPriorities.includes(value as DocumentRequestPriority);
}
