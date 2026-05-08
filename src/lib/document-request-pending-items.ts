import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  documentRequestPendingItemStatuses,
  type CreateDocumentRequestPendingItemInput,
  type DocumentRequestPendingItem,
  type DocumentRequestPendingItemStatus,
  type UpdateDocumentRequestPendingItemInput
} from "@/lib/document-request-pending-item-types";

const localDataDirectory = path.join(process.cwd(), ".local-data");
const localPendingItemsFile = path.join(localDataDirectory, "document_request_pending_items.json");

export async function listDocumentRequestPendingItems(requestId: string) {
  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("document_request_pending_items")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(normalizePendingItem);
  }

  const items = await readLocalPendingItems();
  return items
    .filter((item) => item.request_id === requestId)
    .sort((first, second) => first.created_at.localeCompare(second.created_at));
}

export async function createDocumentRequestPendingItem(
  input: CreateDocumentRequestPendingItemInput
) {
  const now = new Date().toISOString();
  const item: DocumentRequestPendingItem = {
    id: randomUUID(),
    request_id: input.request_id,
    title: input.title.trim(),
    description: input.description?.trim() || "",
    status: "pendente",
    requested_by: input.requested_by?.trim() || "",
    resolved_at: "",
    created_at: now,
    updated_at: now
  };

  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("document_request_pending_items")
      .insert(toDatabaseRow(item))
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizePendingItem(data);
  }

  const items = await readLocalPendingItems();
  items.push(item);
  await writeLocalPendingItems(items);
  return item;
}

export async function updateDocumentRequestPendingItem(
  requestId: string,
  pendingItemId: string,
  input: UpdateDocumentRequestPendingItemInput
) {
  const current = await getPendingItem(requestId, pendingItemId);

  if (!current) {
    return null;
  }

  const nextStatus = normalizeStatus(input.status, current.status);
  const updated: DocumentRequestPendingItem = {
    ...current,
    title: typeof input.title === "string" && input.title.trim() ? input.title.trim() : current.title,
    description:
      typeof input.description === "string" ? input.description.trim() : current.description,
    status: nextStatus,
    resolved_at:
      nextStatus === "resolvido" || nextStatus === "dispensado"
        ? current.resolved_at || new Date().toISOString()
        : "",
    updated_at: new Date().toISOString()
  };

  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("document_request_pending_items")
      .update(toDatabaseUpdate(updated))
      .eq("id", pendingItemId)
      .eq("request_id", requestId)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizePendingItem(data);
  }

  const items = await readLocalPendingItems();
  const nextItems = items.map((item) =>
    item.id === pendingItemId && item.request_id === requestId ? updated : item
  );
  await writeLocalPendingItems(nextItems);
  return updated;
}

async function getPendingItem(requestId: string, pendingItemId: string) {
  const items = await listDocumentRequestPendingItems(requestId);
  return items.find((item) => item.id === pendingItemId) || null;
}

async function readLocalPendingItems(): Promise<DocumentRequestPendingItem[]> {
  try {
    const content = await readFile(localPendingItemsFile, "utf8");
    return JSON.parse(content) as DocumentRequestPendingItem[];
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeLocalPendingItems(items: DocumentRequestPendingItem[]) {
  await mkdir(localDataDirectory, { recursive: true });
  await writeFile(localPendingItemsFile, JSON.stringify(items, null, 2), "utf8");
}

function normalizeStatus(
  value: DocumentRequestPendingItemStatus | undefined,
  fallback: DocumentRequestPendingItemStatus
) {
  if (value && documentRequestPendingItemStatuses.includes(value)) {
    return value;
  }

  return fallback;
}

function toDatabaseRow(item: DocumentRequestPendingItem) {
  return {
    id: item.id,
    request_id: item.request_id,
    title: item.title,
    description: item.description,
    status: item.status,
    requested_by: item.requested_by,
    resolved_at: item.resolved_at || null,
    created_at: item.created_at,
    updated_at: item.updated_at
  };
}

function toDatabaseUpdate(item: DocumentRequestPendingItem) {
  return {
    title: item.title,
    description: item.description,
    status: item.status,
    resolved_at: item.resolved_at || null,
    updated_at: item.updated_at
  };
}

function normalizePendingItem(row: Record<string, unknown>): DocumentRequestPendingItem {
  const status = String(row.status || "pendente");

  return {
    id: String(row.id || ""),
    request_id: String(row.request_id || ""),
    title: String(row.title || ""),
    description: String(row.description || ""),
    status: documentRequestPendingItemStatuses.includes(
      status as DocumentRequestPendingItemStatus
    )
      ? (status as DocumentRequestPendingItemStatus)
      : "pendente",
    requested_by: String(row.requested_by || ""),
    resolved_at: String(row.resolved_at || ""),
    created_at: String(row.created_at || ""),
    updated_at: String(row.updated_at || "")
  };
}
