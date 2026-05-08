export const documentRequestPendingItemStatuses = [
  "pendente",
  "enviado",
  "dispensado",
  "resolvido"
] as const;

export type DocumentRequestPendingItemStatus =
  (typeof documentRequestPendingItemStatuses)[number];

export const documentRequestPendingItemStatusLabels: Record<
  DocumentRequestPendingItemStatus,
  string
> = {
  pendente: "Pendente",
  enviado: "Enviado",
  dispensado: "Dispensado",
  resolvido: "Resolvido"
};

export type DocumentRequestPendingItem = {
  id: string;
  request_id: string;
  title: string;
  description: string;
  status: DocumentRequestPendingItemStatus;
  requested_by: string;
  resolved_at: string;
  created_at: string;
  updated_at: string;
};

export type CreateDocumentRequestPendingItemInput = {
  request_id: string;
  title: string;
  description?: string;
  requested_by?: string;
};

export type UpdateDocumentRequestPendingItemInput = Partial<
  Pick<DocumentRequestPendingItem, "title" | "description" | "status">
>;

export function isDocumentRequestPendingItemStatus(
  value: string
): value is DocumentRequestPendingItemStatus {
  return documentRequestPendingItemStatuses.includes(
    value as DocumentRequestPendingItemStatus
  );
}
