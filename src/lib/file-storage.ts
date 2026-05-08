import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { DocumentRequestAttachment } from "@/lib/attachment-constants";

type InternalAttachment = DocumentRequestAttachment & {
  storage_path: string;
};

type SaveAttachmentInput = {
  requestId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  data: Buffer;
  uploadedBy?: string;
};

type AttachmentDownload = {
  attachment: DocumentRequestAttachment;
  data: Buffer;
};

const localDataDirectory = path.join(process.cwd(), ".local-data");
const localUploadsDirectory = path.join(localDataDirectory, "uploads");
const localAttachmentsFile = path.join(localDataDirectory, "document_request_attachments.json");
const storageBucket = process.env.GI_ATTACHMENTS_BUCKET || "document-request-attachments";

export async function saveAttachment(input: SaveAttachmentInput) {
  const id = randomUUID();
  const safeFileName = sanitizeFileName(input.fileName);
  const storagePath = `${input.requestId}/${id}-${safeFileName}`;
  const now = new Date().toISOString();
  const attachment: InternalAttachment = {
    id,
    request_id: input.requestId,
    file_name: safeFileName,
    file_type: input.fileType,
    file_size: input.fileSize,
    storage_path: storagePath,
    uploaded_by: input.uploadedBy || "",
    visibility: "internal",
    created_at: now
  };

  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const uploadResult = await supabase.storage
      .from(storageBucket)
      .upload(storagePath, input.data, {
        contentType: input.fileType,
        upsert: false
      });

    if (uploadResult.error) {
      throw new Error(uploadResult.error.message);
    }

    const { data, error } = await supabase
      .from("document_request_attachments")
      .insert(toDatabaseRow(attachment))
      .select("*")
      .single();

    if (error) {
      await supabase.storage.from(storageBucket).remove([storagePath]);
      throw new Error(error.message);
    }

    return toPublicAttachment(normalizeAttachment(data));
  }

  const uploadDirectory = path.join(localUploadsDirectory, input.requestId);
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, `${id}-${safeFileName}`), input.data);

  const attachments = await readLocalAttachments();
  attachments.unshift(attachment);
  await writeLocalAttachments(attachments);

  return toPublicAttachment(attachment);
}

export async function listAttachments(requestId: string) {
  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("document_request_attachments")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((row) => toPublicAttachment(normalizeAttachment(row)));
  }

  const attachments = await readLocalAttachments();
  return attachments
    .filter((attachment) => attachment.request_id === requestId)
    .sort((first, second) => second.created_at.localeCompare(first.created_at))
    .map(toPublicAttachment);
}

export async function getAttachment(requestId: string, attachmentId: string) {
  const attachment = await findInternalAttachment(requestId, attachmentId);
  return attachment ? toPublicAttachment(attachment) : null;
}

export async function getAttachmentDownload(
  requestId: string,
  attachmentId: string
): Promise<AttachmentDownload | null> {
  const attachment = await findInternalAttachment(requestId, attachmentId);

  if (!attachment) {
    return null;
  }

  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase.storage
      .from(storageBucket)
      .download(attachment.storage_path);

    if (error || !data) {
      throw new Error(error?.message || "Attachment not found");
    }

    return {
      attachment: toPublicAttachment(attachment),
      data: Buffer.from(await data.arrayBuffer())
    };
  }

  const localPath = resolveLocalStoragePath(attachment.storage_path);

  return {
    attachment: toPublicAttachment(attachment),
    data: await readFile(localPath)
  };
}

export async function deleteAttachment(requestId: string, attachmentId: string) {
  const attachment = await findInternalAttachment(requestId, attachmentId);

  if (!attachment) {
    return false;
  }

  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const { error: storageError } = await supabase.storage
      .from(storageBucket)
      .remove([attachment.storage_path]);

    if (storageError) {
      throw new Error(storageError.message);
    }

    const { error } = await supabase
      .from("document_request_attachments")
      .delete()
      .eq("id", attachmentId)
      .eq("request_id", requestId);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  }

  const attachments = await readLocalAttachments();
  const nextAttachments = attachments.filter(
    (item) => !(item.id === attachmentId && item.request_id === requestId)
  );

  try {
    await unlink(resolveLocalStoragePath(attachment.storage_path));
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) {
      throw error;
    }
  }

  await writeLocalAttachments(nextAttachments);
  return true;
}

function toPublicAttachment(attachment: InternalAttachment): DocumentRequestAttachment {
  return {
    id: attachment.id,
    request_id: attachment.request_id,
    file_name: attachment.file_name,
    file_type: attachment.file_type,
    file_size: attachment.file_size,
    uploaded_by: attachment.uploaded_by,
    visibility: "internal",
    created_at: attachment.created_at
  };
}

async function findInternalAttachment(requestId: string, attachmentId: string) {
  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("document_request_attachments")
      .select("*")
      .eq("id", attachmentId)
      .eq("request_id", requestId)
      .single();

    if (error || !data) {
      return null;
    }

    return normalizeAttachment(data);
  }

  const attachments = await readLocalAttachments();
  return attachments.find(
    (attachment) => attachment.id === attachmentId && attachment.request_id === requestId
  ) || null;
}

async function readLocalAttachments(): Promise<InternalAttachment[]> {
  try {
    const content = await readFile(localAttachmentsFile, "utf8");
    return JSON.parse(content) as InternalAttachment[];
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeLocalAttachments(attachments: InternalAttachment[]) {
  await mkdir(localDataDirectory, { recursive: true });
  await writeFile(localAttachmentsFile, JSON.stringify(attachments, null, 2), "utf8");
}

function sanitizeFileName(value: string) {
  const parsed = path.parse(value || "documento");
  const name = (parsed.name || "documento")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120)
    .replace(/^_+|_+$/g, "");
  const extension = parsed.ext
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "")
    .slice(0, 16);

  return `${name || "documento"}${extension}`;
}

function toDatabaseRow(attachment: InternalAttachment) {
  return {
    id: attachment.id,
    request_id: attachment.request_id,
    file_name: attachment.file_name,
    file_type: attachment.file_type,
    file_size: attachment.file_size,
    storage_path: attachment.storage_path,
    uploaded_by: attachment.uploaded_by,
    visibility: attachment.visibility,
    created_at: attachment.created_at
  };
}

function resolveLocalStoragePath(storagePath: string) {
  const uploadsRoot = path.resolve(localUploadsDirectory);
  const resolvedPath = path.resolve(uploadsRoot, storagePath);

  if (resolvedPath !== uploadsRoot && !resolvedPath.startsWith(`${uploadsRoot}${path.sep}`)) {
    throw new Error("Invalid local attachment path");
  }

  return resolvedPath;
}

function normalizeAttachment(row: Record<string, unknown>): InternalAttachment {
  return {
    id: String(row.id || ""),
    request_id: String(row.request_id || ""),
    file_name: String(row.file_name || "documento"),
    file_type: String(row.file_type || "application/octet-stream"),
    file_size: Number(row.file_size || 0),
    storage_path: String(row.storage_path || ""),
    uploaded_by: String(row.uploaded_by || ""),
    visibility: "internal",
    created_at: String(row.created_at || "")
  };
}
