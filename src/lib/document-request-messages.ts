import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  CreateDocumentRequestMessageInput,
  DocumentRequestMessage,
  DocumentRequestMessageVisibility
} from "@/lib/document-request-message-types";
import type { DocumentRequestStatus } from "@/lib/document-request-types";
import { documentRequestStatusLabels } from "@/lib/document-request-types";

type ListDocumentRequestMessagesFilters = {
  // Future requester views must pass visibility: "public" to keep internal notes reserved.
  visibility?: DocumentRequestMessageVisibility;
};

const localDataDirectory = path.join(process.cwd(), ".local-data");
const localMessagesFile = path.join(localDataDirectory, "document_request_messages.json");

export async function listDocumentRequestMessages(
  requestId: string,
  filters: ListDocumentRequestMessagesFilters = {}
) {
  const supabase = createSupabaseAdminClient();

  if (supabase) {
    let query = supabase
      .from("document_request_messages")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: true });

    if (filters.visibility) {
      query = query.eq("visibility", filters.visibility);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(normalizeMessage);
  }

  const messages = await readLocalMessages();
  return messages
    .filter((message) => message.request_id === requestId)
    .filter((message) => !filters.visibility || message.visibility === filters.visibility)
    .sort((first, second) => first.created_at.localeCompare(second.created_at));
}

export async function createDocumentRequestMessage(input: CreateDocumentRequestMessageInput) {
  const message: DocumentRequestMessage = {
    id: randomUUID(),
    request_id: input.request_id,
    author_type: input.author_type,
    author_name: input.author_name?.trim() || "",
    visibility: input.visibility,
    message: input.message.trim(),
    created_at: new Date().toISOString()
  };

  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("document_request_messages")
      .insert(toDatabaseRow(message))
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizeMessage(data);
  }

  const messages = await readLocalMessages();
  messages.push(message);
  await writeLocalMessages(messages);
  return message;
}

export async function createStatusChangeMessage(
  requestId: string,
  status: DocumentRequestStatus
) {
  return createDocumentRequestMessage({
    request_id: requestId,
    author_type: "system",
    author_name: "Gabinete Inteligente",
    visibility: "internal",
    message: `Status alterado para ${documentRequestStatusLabels[status]}.`
  });
}

async function readLocalMessages(): Promise<DocumentRequestMessage[]> {
  try {
    const content = await readFile(localMessagesFile, "utf8");
    return JSON.parse(content) as DocumentRequestMessage[];
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeLocalMessages(messages: DocumentRequestMessage[]) {
  await mkdir(localDataDirectory, { recursive: true });
  await writeFile(localMessagesFile, JSON.stringify(messages, null, 2), "utf8");
}

function toDatabaseRow(message: DocumentRequestMessage) {
  return {
    id: message.id,
    request_id: message.request_id,
    author_type: message.author_type,
    author_name: message.author_name,
    visibility: message.visibility,
    message: message.message,
    created_at: message.created_at
  };
}

function normalizeMessage(row: Record<string, unknown>): DocumentRequestMessage {
  return {
    id: String(row.id || ""),
    request_id: String(row.request_id || ""),
    author_type:
      row.author_type === "requester" || row.author_type === "system" ? row.author_type : "admin",
    author_name: String(row.author_name || ""),
    visibility: row.visibility === "internal" ? "internal" : "public",
    message: String(row.message || ""),
    created_at: String(row.created_at || "")
  };
}
