export const attachmentAllowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain"
] as const;

export const attachmentAcceptedInputTypes = attachmentAllowedMimeTypes.join(",");

export const maxAttachmentSizeBytes = 15 * 1024 * 1024;

export const maxAttachmentsPerRequest = 10;

export type DocumentRequestAttachment = {
  id: string;
  request_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  visibility: "internal";
  created_at: string;
};

export function isAllowedAttachmentMimeType(value: string) {
  return attachmentAllowedMimeTypes.includes(
    value as (typeof attachmentAllowedMimeTypes)[number]
  );
}

export function formatAttachmentSize(sizeInBytes: number) {
  if (!Number.isFinite(sizeInBytes) || sizeInBytes <= 0) {
    return "0 KB";
  }

  if (sizeInBytes < 1024 * 1024) {
    return `${Math.ceil(sizeInBytes / 1024)} KB`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
}
