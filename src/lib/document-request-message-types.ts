export const documentRequestMessageAuthorTypes = ["admin", "requester", "system"] as const;

export type DocumentRequestMessageAuthorType =
  (typeof documentRequestMessageAuthorTypes)[number];

export const documentRequestMessageVisibilities = ["public", "internal"] as const;

export type DocumentRequestMessageVisibility =
  (typeof documentRequestMessageVisibilities)[number];

export const maxDocumentRequestMessageLength = 4_000;

export type DocumentRequestMessage = {
  id: string;
  request_id: string;
  author_type: DocumentRequestMessageAuthorType;
  author_name: string;
  visibility: DocumentRequestMessageVisibility;
  message: string;
  created_at: string;
};

export type CreateDocumentRequestMessageInput = {
  request_id: string;
  author_type: DocumentRequestMessageAuthorType;
  author_name?: string;
  visibility: DocumentRequestMessageVisibility;
  message: string;
};

export function isDocumentRequestMessageAuthorType(
  value: string
): value is DocumentRequestMessageAuthorType {
  return documentRequestMessageAuthorTypes.includes(
    value as DocumentRequestMessageAuthorType
  );
}

export function isDocumentRequestMessageVisibility(
  value: string
): value is DocumentRequestMessageVisibility {
  return documentRequestMessageVisibilities.includes(
    value as DocumentRequestMessageVisibility
  );
}

export function documentRequestMessageVisibilityLabel(
  visibility: DocumentRequestMessageVisibility
) {
  return visibility === "public" ? "Mensagem ao solicitante" : "Nota interna";
}

export function documentRequestMessageAuthorLabel(
  authorType: DocumentRequestMessageAuthorType
) {
  const labels: Record<DocumentRequestMessageAuthorType, string> = {
    admin: "Equipe responsável",
    requester: "Solicitante",
    system: "Sistema"
  };

  return labels[authorType];
}
