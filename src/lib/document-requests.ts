import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { matchesDeadlineFilter, type DeadlineFilter } from "@/lib/deadlines";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSequentialProtocol } from "@/lib/protocols";
import type {
  CreateDocumentRequestInput,
  DocumentRequest,
  DocumentRequestPriority,
  DocumentRequestStatus,
  UpdateDocumentRequestInput
} from "@/lib/document-request-types";
import { documentRequestStatuses } from "@/lib/document-request-types";
import type { ModuleSlug } from "@/lib/modules";

type ListDocumentRequestsFilters = {
  status?: DocumentRequestStatus;
  moduleSlug?: ModuleSlug;
  priority?: DocumentRequestPriority;
  deadline?: DeadlineFilter;
};

const localDataDirectory = path.join(process.cwd(), ".local-data");
const localDataFile = path.join(localDataDirectory, "document_requests.json");

export async function listDocumentRequests(filters: ListDocumentRequestsFilters = {}) {
  const supabase = createSupabaseAdminClient();

  if (supabase) {
    let query = supabase
      .from("document_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.moduleSlug) {
      query = query.eq("module_slug", filters.moduleSlug);
    }

    if (filters.priority) {
      query = query.eq("priority", filters.priority);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return (data || [])
      .map(normalizeDocumentRequest)
      .filter((request) => matchesDeadlineFilter(request, filters.deadline));
  }

  const requests = await readLocalRequests();

  return requests
    .filter((request) => !filters.status || request.status === filters.status)
    .filter((request) => !filters.moduleSlug || request.module_slug === filters.moduleSlug)
    .filter((request) => !filters.priority || request.priority === filters.priority)
    .filter((request) => matchesDeadlineFilter(request, filters.deadline))
    .sort((first, second) => second.created_at.localeCompare(first.created_at));
}

export async function getDocumentRequest(id: string) {
  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("document_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return null;
    }

    return normalizeDocumentRequest(data);
  }

  const requests = await readLocalRequests();
  return requests.find((request) => request.id === id) || null;
}

export async function createDocumentRequest(input: CreateDocumentRequestInput) {
  const now = new Date().toISOString();
  const request: DocumentRequest = {
    id: randomUUID(),
    module_slug: input.module_slug,
    title: input.title.trim(),
    requester_name: input.requester_name.trim(),
    requester_username: input.requester_username?.trim() || "",
    requester_user_id: input.requester_user_id?.trim() || "",
    requester_email: input.requester_email.trim(),
    requester_phone: input.requester_phone?.trim() || "",
    requester_department: input.requester_department.trim(),
    priority: input.priority,
    status: "recebido",
    structured_fields: input.structured_fields,
    structured_context: input.structured_context,
    internal_notes: "",
    final_document_text: "",
    final_document_url: "",
    related_norms_text: "",
    protocol_number: await createSequentialProtocol(input.module_slug, new Date(now)),
    due_date: input.due_date || "",
    received_at: input.received_at || "",
    completed_at: "",
    deadline_notes: input.deadline_notes || "",
    created_at: now,
    updated_at: now
  };

  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("document_requests")
      .insert(toDatabaseRow(request))
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizeDocumentRequest(data);
  }

  const requests = await readLocalRequests();
  requests.unshift(request);
  await writeLocalRequests(requests);
  return request;
}

export async function updateDocumentRequest(id: string, input: UpdateDocumentRequestInput) {
  const current = await getDocumentRequest(id);

  if (!current) {
    return null;
  }

  const sanitizedUpdate = sanitizeUpdate(input);
  const updated: DocumentRequest = {
    ...current,
    ...sanitizedUpdate,
    completed_at:
      sanitizedUpdate.status === "concluido" && current.status !== "concluido"
        ? new Date().toISOString()
        : sanitizedUpdate.completed_at !== undefined
          ? sanitizedUpdate.completed_at
          : current.completed_at,
    updated_at: new Date().toISOString()
  };

  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("document_requests")
      .update(toDatabaseUpdate(updated))
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizeDocumentRequest(data);
  }

  const requests = await readLocalRequests();
  const nextRequests = requests.map((request) => (request.id === id ? updated : request));
  await writeLocalRequests(nextRequests);
  return updated;
}

async function readLocalRequests(): Promise<DocumentRequest[]> {
  try {
    const content = await readFile(localDataFile, "utf8");
    return JSON.parse(content) as DocumentRequest[];
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeLocalRequests(requests: DocumentRequest[]) {
  await mkdir(localDataDirectory, { recursive: true });
  await writeFile(localDataFile, JSON.stringify(requests, null, 2), "utf8");
}

function sanitizeUpdate(input: UpdateDocumentRequestInput): UpdateDocumentRequestInput {
  const update: UpdateDocumentRequestInput = {};

  if (input.status && documentRequestStatuses.includes(input.status)) {
    update.status = input.status;
  }

  if (typeof input.internal_notes === "string") {
    update.internal_notes = input.internal_notes;
  }

  if (typeof input.final_document_text === "string") {
    update.final_document_text = input.final_document_text;
  }

  if (typeof input.final_document_url === "string") {
    update.final_document_url = input.final_document_url;
  }

  if (typeof input.related_norms_text === "string") {
    update.related_norms_text = input.related_norms_text;
  }

  if (typeof input.due_date === "string") {
    update.due_date = normalizeDate(input.due_date);
  }

  if (typeof input.received_at === "string") {
    update.received_at = normalizeDate(input.received_at);
  }

  if (typeof input.completed_at === "string") {
    update.completed_at = input.completed_at;
  }

  if (typeof input.deadline_notes === "string") {
    update.deadline_notes = input.deadline_notes;
  }

  return update;
}

function toDatabaseRow(request: DocumentRequest) {
  return {
    id: request.id,
    module_slug: request.module_slug,
    title: request.title,
    requester_name: request.requester_name,
    requester_username: request.requester_username,
    requester_user_id: request.requester_user_id || null,
    requester_email: request.requester_email,
    requester_phone: request.requester_phone,
    requester_department: request.requester_department,
    priority: request.priority,
    status: request.status,
    structured_fields: request.structured_fields,
    structured_context: request.structured_context,
    internal_notes: request.internal_notes,
    final_document_text: request.final_document_text,
    final_document_url: request.final_document_url,
    related_norms_text: request.related_norms_text,
    protocol_number: request.protocol_number,
    due_date: request.due_date || null,
    received_at: request.received_at || null,
    completed_at: request.completed_at || null,
    deadline_notes: request.deadline_notes,
    created_at: request.created_at,
    updated_at: request.updated_at
  };
}

function toDatabaseUpdate(request: DocumentRequest) {
  return {
    status: request.status,
    internal_notes: request.internal_notes,
    final_document_text: request.final_document_text,
    final_document_url: request.final_document_url,
    related_norms_text: request.related_norms_text,
    due_date: request.due_date || null,
    received_at: request.received_at || null,
    completed_at: request.completed_at || null,
    deadline_notes: request.deadline_notes,
    updated_at: request.updated_at
  };
}

function normalizeDocumentRequest(row: Record<string, unknown>): DocumentRequest {
  return {
    id: String(row.id || ""),
    module_slug: String(row.module_slug || "oficios") as ModuleSlug,
    title: String(row.title || ""),
    requester_name: String(row.requester_name || ""),
    requester_username: String(row.requester_username || ""),
    requester_user_id: String(row.requester_user_id || ""),
    requester_email: String(row.requester_email || ""),
    requester_phone: String(row.requester_phone || ""),
    requester_department: String(row.requester_department || ""),
    priority: String(row.priority || "normal") as DocumentRequestPriority,
    status: String(row.status || "recebido") as DocumentRequestStatus,
    structured_fields: (row.structured_fields || {}) as DocumentRequest["structured_fields"],
    structured_context: String(row.structured_context || ""),
    internal_notes: String(row.internal_notes || ""),
    final_document_text: String(row.final_document_text || ""),
    final_document_url: String(row.final_document_url || ""),
    related_norms_text: String(row.related_norms_text || ""),
    protocol_number: String(row.protocol_number || ""),
    due_date: String(row.due_date || ""),
    received_at: String(row.received_at || ""),
    completed_at: String(row.completed_at || ""),
    deadline_notes: String(row.deadline_notes || ""),
    created_at: String(row.created_at || ""),
    updated_at: String(row.updated_at || "")
  };
}

function normalizeDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}
