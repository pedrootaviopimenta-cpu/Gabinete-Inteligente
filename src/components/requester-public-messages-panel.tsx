"use client";

import { useEffect, useState } from "react";
import { MessageSquareText } from "lucide-react";
import {
  documentRequestMessageAuthorLabel,
  type DocumentRequestMessage
} from "@/lib/document-request-message-types";

type MessagesPayload = {
  messages?: DocumentRequestMessage[];
  error?: string;
};

export function RequesterPublicMessagesPanel({
  requestId,
  fallbackMessages
}: {
  requestId: string;
  fallbackMessages: string[];
}) {
  const [messages, setMessages] = useState<DocumentRequestMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadMessages();
  }, [requestId]);

  async function loadMessages() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/document-requests/${requestId}/messages?visibility=public`,
        { cache: "no-store" }
      );
      const payload = (await response.json()) as MessagesPayload;

      if (!response.ok) {
        setMessages([]);
        setError(payload.error || "Não foi possível carregar as mensagens.");
        return;
      }

      setMessages(payload.messages || []);
    } catch {
      setMessages([]);
      setError("Não foi possível carregar as mensagens.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="gi-panel p-5">
      <div className="flex items-center gap-2">
        <MessageSquareText className="h-4 w-4 text-gi-gold" aria-hidden={true} />
        <h2 className="text-base font-semibold text-gi-ink">Mensagens ao solicitante</h2>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <p className="rounded-md border border-gi-line bg-gi-background p-3 text-sm leading-6 text-gi-muted">
            Carregando mensagens...
          </p>
        ) : messages.length ? (
          messages.map((message) => (
            <article
              key={message.id}
              className="rounded-md border border-gi-gold/35 bg-gi-gold/10 p-3 text-sm leading-6 text-gi-ink"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gi-muted">
                {documentRequestMessageAuthorLabel(message.author_type)} ·{" "}
                {formatDateTime(message.created_at)}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{message.message}</p>
            </article>
          ))
        ) : (
          fallbackMessages.map((item) => (
            <p
              key={item}
              className="rounded-md border border-gi-line bg-gi-background p-3 text-sm leading-6 text-gi-ink"
            >
              {item}
            </p>
          ))
        )}
      </div>
    </section>
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
