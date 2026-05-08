"use client";

import { useEffect, useMemo, useState } from "react";
import { LockKeyhole, MessageSquarePlus, MessagesSquare, RefreshCw, Send } from "lucide-react";
import {
  documentRequestMessageAuthorLabel,
  documentRequestMessageVisibilityLabel,
  type DocumentRequestMessage,
  type DocumentRequestMessageVisibility
} from "@/lib/document-request-message-types";

type MessagesPayload = {
  messages?: DocumentRequestMessage[];
  message?: DocumentRequestMessage;
  error?: string;
};

export function DocumentRequestCommunicationPanel({
  requestId,
  legacyInternalNotes = ""
}: {
  requestId: string;
  legacyInternalNotes?: string;
}) {
  const [messages, setMessages] = useState<DocumentRequestMessage[]>([]);
  const [publicMessage, setPublicMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<DocumentRequestMessageVisibility | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const publicMessages = useMemo(
    () => messages.filter((message) => message.visibility === "public"),
    [messages]
  );
  const internalMessages = useMemo(
    () => messages.filter((message) => message.visibility === "internal"),
    [messages]
  );

  useEffect(() => {
    void loadMessages();
  }, [requestId]);

  async function loadMessages() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/document-requests/${requestId}/messages?visibility=all`, {
        cache: "no-store"
      });
      const payload = (await response.json()) as MessagesPayload;

      if (!response.ok) {
        setMessages([]);
        setError(payload.error || "Não foi possível carregar a comunicação.");
        return;
      }

      setMessages(payload.messages || []);
    } catch {
      setMessages([]);
      setError("Não foi possível carregar a comunicação.");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitMessage(visibility: DocumentRequestMessageVisibility) {
    const currentMessage = visibility === "public" ? publicMessage : internalNote;
    const trimmedMessage = currentMessage.trim();

    if (!trimmedMessage) {
      setError(visibility === "public" ? "Informe a mensagem ao solicitante." : "Informe a nota interna.");
      return;
    }

    setIsSubmitting(visibility);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/document-requests/${requestId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visibility,
          authorType: "admin",
          message: trimmedMessage
        })
      });
      const payload = (await response.json()) as MessagesPayload;

      if (!response.ok || !payload.message) {
        setError(payload.error || "Não foi possível registrar a comunicação.");
        return;
      }

      setMessages((current) =>
        [...current, payload.message as DocumentRequestMessage].sort((first, second) =>
          first.created_at.localeCompare(second.created_at)
        )
      );
      setNotice(
        visibility === "public"
          ? "Mensagem pública enviada ao solicitante."
          : "Nota interna registrada com sigilo."
      );

      if (visibility === "public") {
        setPublicMessage("");
      } else {
        setInternalNote("");
      }
    } catch {
      setError("Não foi possível registrar a comunicação.");
    } finally {
      setIsSubmitting(null);
    }
  }

  return (
    <section className="gi-panel p-5">
      <div className="flex items-start gap-3">
        <MessagesSquare className="mt-1 h-5 w-5 flex-none text-gi-gold" aria-hidden={true} />
        <div>
          <h2 className="text-base font-semibold text-gi-ink">Comunicação</h2>
          <p className="mt-2 text-sm leading-6 text-gi-muted">
            Registre mensagens ao solicitante e notas internas da equipe responsável.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-gi-gold/35 bg-gi-gold/10 p-3 text-sm leading-6 text-gi-ink">
        <div className="flex items-start gap-2">
          <LockKeyhole className="mt-0.5 h-4 w-4 flex-none text-gi-gold" aria-hidden={true} />
          <p>Notas internas são reservadas à equipe responsável e não são exibidas ao solicitante.</p>
        </div>
      </div>

      {notice ? (
        <p className="mt-4 rounded-md border border-gi-gold/35 bg-gi-gold/10 p-3 text-sm leading-6 text-gi-ink">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-md border border-gi-line bg-gi-background p-4">
          <h3 className="text-sm font-semibold text-gi-ink">Mensagem ao solicitante</h3>
          <p className="mt-1 text-xs leading-5 text-gi-muted">
            Esta mensagem ficará visível ao usuário solicitante quando o painel do solicitante estiver habilitado.
          </p>
          <textarea
            value={publicMessage}
            onChange={(event) => setPublicMessage(event.target.value)}
            rows={5}
            maxLength={4_000}
            className="gi-input mt-3 resize-y bg-white"
            placeholder="Ex.: Sua solicitação foi recebida e está em análise pela equipe responsável."
          />
          <button
            type="button"
            onClick={() => void submitMessage("public")}
            disabled={isSubmitting !== null}
            className="gi-button-assisted mt-3"
          >
            <Send className="h-4 w-4" aria-hidden={true} />
            {isSubmitting === "public" ? "Enviando" : "Enviar mensagem pública"}
          </button>
        </div>

        <div className="rounded-md border border-gi-line bg-gi-background p-4">
          <h3 className="text-sm font-semibold text-gi-ink">Nota interna</h3>
          <p className="mt-1 text-xs leading-5 text-gi-muted">
            Notas internas são reservadas à equipe responsável e não são exibidas ao solicitante.
          </p>
          <textarea
            value={internalNote}
            onChange={(event) => setInternalNote(event.target.value)}
            rows={5}
            maxLength={4_000}
            className="gi-input mt-3 resize-y bg-white"
            placeholder="Registre cautelas, pendências internas, validações necessárias ou encaminhamentos reservados."
          />
          <button
            type="button"
            onClick={() => void submitMessage("internal")}
            disabled={isSubmitting !== null}
            className="gi-button-primary mt-3"
          >
            <MessageSquarePlus className="h-4 w-4" aria-hidden={true} />
            {isSubmitting === "internal" ? "Registrando" : "Registrar nota interna"}
          </button>
        </div>
      </div>

      {legacyInternalNotes.trim() ? (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <h3 className="font-semibold">Nota interna legada</h3>
          <p className="mt-2 whitespace-pre-wrap">{legacyInternalNotes.trim()}</p>
        </div>
      ) : null}

      <div className="mt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-gi-ink">Histórico cronológico</h3>
          <button type="button" onClick={() => void loadMessages()} className="gi-button-secondary">
            <RefreshCw className="h-4 w-4" aria-hidden={true} />
            Recarregar histórico
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {isLoading ? (
            <p className="rounded-md border border-gi-line bg-gi-background p-4 text-sm leading-6 text-gi-muted">
              Carregando histórico de comunicação...
            </p>
          ) : messages.length ? (
            messages.map((message) => <MessageHistoryItem key={message.id} message={message} />)
          ) : (
            <p className="rounded-md border border-gi-line bg-gi-background p-4 text-sm leading-6 text-gi-muted">
              Nenhuma comunicação registrada até o momento.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <SummaryBox label="Mensagens públicas" value={String(publicMessages.length)} />
        <SummaryBox label="Notas internas" value={String(internalMessages.length)} />
      </div>
    </section>
  );
}

function MessageHistoryItem({ message }: { message: DocumentRequestMessage }) {
  const isPublic = message.visibility === "public";

  return (
    <article
      className={`rounded-md border p-4 text-sm leading-6 ${
        isPublic
          ? "border-gi-gold/35 bg-gi-gold/10 text-gi-ink"
          : "border-gi-navy/15 bg-gi-navy/5 text-gi-ink"
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gi-muted">
            {documentRequestMessageVisibilityLabel(message.visibility)} ·{" "}
            {documentRequestMessageAuthorLabel(message.author_type)}
          </p>
          <p className="mt-1 text-xs text-gi-muted">
            {message.author_name || "Gabinete Inteligente"} · {formatDateTime(message.created_at)}
          </p>
        </div>
        <span
          className={`w-fit rounded-md border px-2.5 py-1 text-xs font-semibold ${
            isPublic
              ? "border-gi-gold/35 bg-white/70 text-gi-navy"
              : "border-gi-navy/15 bg-white/70 text-gi-navy"
          }`}
        >
          {isPublic ? "Pública" : "Interna"}
        </span>
      </div>
      <p className="mt-3 whitespace-pre-wrap">{message.message}</p>
    </article>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gi-line bg-gi-background p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gi-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gi-ink">{value}</p>
    </div>
  );
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
