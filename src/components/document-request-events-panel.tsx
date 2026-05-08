"use client";

import { useEffect, useState } from "react";
import { Clock3, RefreshCw } from "lucide-react";
import type { AuditEventType, DocumentRequestAuditEvent } from "@/lib/audit";
import { userRoleLabels, type UserRole } from "@/lib/permissions";

type EventsPayload = {
  events?: DocumentRequestAuditEvent[];
  error?: string;
};

const eventTypeLabels: Record<AuditEventType, string> = {
  request_created: "Solicitação criada",
  status_changed: "Status alterado",
  internal_note_updated: "Nota interna atualizada",
  public_message_created: "Mensagem pública registrada",
  internal_message_created: "Nota interna registrada",
  attachment_uploaded: "Documento anexado",
  pending_item_created: "Pendência criada",
  pending_item_updated: "Pendência atualizada",
  final_document_updated: "Documento final atualizado",
  final_document_exported: "DOCX exportado",
  internal_ai_draft_generated: "Rascunho interno com IA",
  request_completed: "Solicitação concluída",
  login_success: "Login realizado",
  login_failed: "Tentativa de login",
  logout: "Sessão encerrada"
};

export function DocumentRequestEventsPanel({ requestId }: { requestId: string }) {
  const [events, setEvents] = useState<DocumentRequestAuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadEvents();
  }, [requestId]);

  async function loadEvents() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/document-requests/${requestId}/events`, {
        cache: "no-store"
      });
      const payload = (await response.json()) as EventsPayload;

      if (!response.ok) {
        setEvents([]);
        setError(payload.error || "Não foi possível carregar o histórico da solicitação.");
        return;
      }

      setEvents(payload.events || []);
    } catch {
      setEvents([]);
      setError("Não foi possível carregar o histórico da solicitação.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="gi-panel p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Clock3 className="mt-1 h-5 w-5 flex-none text-gi-gold" aria-hidden={true} />
          <div>
            <h2 className="text-base font-semibold text-gi-ink">Histórico da solicitação</h2>
            <p className="mt-2 text-sm leading-6 text-gi-muted">
              Registro de eventos relevantes para rastreabilidade, governança e segurança
              administrativa.
            </p>
          </div>
        </div>
        <button type="button" onClick={() => void loadEvents()} className="gi-button-secondary">
          <RefreshCw className="h-4 w-4" aria-hidden={true} />
          Atualizar
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <p className="rounded-md border border-gi-line bg-gi-background p-4 text-sm leading-6 text-gi-muted">
            Carregando histórico da solicitação...
          </p>
        ) : events.length ? (
          events.map((event) => <AuditEventItem key={event.id} event={event} />)
        ) : (
          <p className="rounded-md border border-gi-line bg-gi-background p-4 text-sm leading-6 text-gi-muted">
            Nenhum evento registrado para esta solicitação até o momento.
          </p>
        )}
      </div>
    </section>
  );
}

function AuditEventItem({ event }: { event: DocumentRequestAuditEvent }) {
  return (
    <article className="rounded-md border border-gi-line bg-gi-background p-4 text-sm leading-6 text-gi-ink">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gi-muted">
            {eventTypeLabels[event.event_type] || event.event_type}
          </p>
          <p className="mt-1 text-sm font-medium text-gi-ink">{event.description}</p>
        </div>
        <time className="text-xs font-medium text-gi-muted" dateTime={event.created_at}>
          {formatDateTime(event.created_at)}
        </time>
      </div>
      <p className="mt-2 text-xs leading-5 text-gi-muted">
        Usuário: {event.actor_username || "Sistema"}{" "}
        {event.actor_role ? `· ${formatRole(event.actor_role)}` : ""}
      </p>
    </article>
  );
}

function formatRole(role: string) {
  return userRoleLabels[role as UserRole] || role;
}

function formatDateTime(value: string) {
  if (!value) {
    return "Data não informada";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}
