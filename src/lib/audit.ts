import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/permissions";

export type AuditEventType =
  | "request_created"
  | "status_changed"
  | "internal_note_updated"
  | "public_message_created"
  | "internal_message_created"
  | "attachment_uploaded"
  | "pending_item_created"
  | "pending_item_updated"
  | "final_document_updated"
  | "final_document_exported"
  | "internal_ai_draft_generated"
  | "request_completed"
  | "login_success"
  | "login_failed"
  | "logout";

export type DocumentRequestAuditEvent = {
  id: string;
  request_id: string;
  event_type: AuditEventType;
  actor_username: string;
  actor_role: UserRole | "";
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type CreateAuditEventInput = {
  requestId?: string;
  eventType: AuditEventType;
  actorUsername?: string;
  actorRole?: UserRole | "";
  description: string;
  metadata?: Record<string, unknown>;
};

const localDataDirectory = path.join(process.cwd(), ".local-data");
const localAuditFile = path.join(localDataDirectory, "document_request_events.json");

export async function createAuditEvent(input: CreateAuditEventInput) {
  const event: DocumentRequestAuditEvent = {
    id: randomUUID(),
    request_id: input.requestId || "",
    event_type: input.eventType,
    actor_username: input.actorUsername?.trim().slice(0, 160) || "",
    actor_role: input.actorRole || "",
    description: input.description.trim().slice(0, 1_000),
    metadata: sanitizeMetadata(input.metadata || {}),
    created_at: new Date().toISOString()
  };

  if (!event.description) {
    event.description = "Evento registrado.";
  }

  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("document_request_events")
      .insert(toDatabaseRow(event))
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizeAuditEvent(data);
  }

  const events = await readLocalEvents();
  events.push(event);
  await writeLocalEvents(events);
  return event;
}

export async function listAuditEventsForRequest(requestId: string) {
  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("document_request_events")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(normalizeAuditEvent);
  }

  const events = await readLocalEvents();
  return events
    .filter((event) => event.request_id === requestId)
    .sort((first, second) => second.created_at.localeCompare(first.created_at));
}

async function readLocalEvents(): Promise<DocumentRequestAuditEvent[]> {
  try {
    const content = await readFile(localAuditFile, "utf8");
    return JSON.parse(content) as DocumentRequestAuditEvent[];
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeLocalEvents(events: DocumentRequestAuditEvent[]) {
  await mkdir(localDataDirectory, { recursive: true });
  await writeFile(localAuditFile, JSON.stringify(events, null, 2), "utf8");
}

function sanitizeMetadata(metadata: Record<string, unknown>) {
  const blockedKeys = new Set([
    "password",
    "secret",
    "token",
    "cookie",
    "authorization",
    "prompt",
    "final_document_text",
    "structured_context",
    "internal_notes"
  ]);

  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !blockedKeys.has(key.toLowerCase()))
      .map(([key, value]) => [key, sanitizeMetadataValue(value)])
  );
}

function sanitizeMetadataValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value.slice(0, 300);
  }

  if (typeof value === "number" || typeof value === "boolean" || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 10).map(sanitizeMetadataValue);
  }

  if (value && typeof value === "object") {
    return sanitizeMetadata(value as Record<string, unknown>);
  }

  return "";
}

function toDatabaseRow(event: DocumentRequestAuditEvent) {
  return {
    id: event.id,
    request_id: event.request_id || null,
    event_type: event.event_type,
    actor_username: event.actor_username,
    actor_role: event.actor_role,
    description: event.description,
    metadata: event.metadata,
    created_at: event.created_at
  };
}

function normalizeAuditEvent(row: Record<string, unknown>): DocumentRequestAuditEvent {
  return {
    id: String(row.id || ""),
    request_id: String(row.request_id || ""),
    event_type: String(row.event_type || "request_created") as AuditEventType,
    actor_username: String(row.actor_username || ""),
    actor_role: String(row.actor_role || "") as UserRole | "",
    description: String(row.description || ""),
    metadata: (row.metadata || {}) as Record<string, unknown>,
    created_at: String(row.created_at || "")
  };
}
