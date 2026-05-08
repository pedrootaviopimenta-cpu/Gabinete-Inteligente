"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, FileCheck2, Inbox, RefreshCw } from "lucide-react";
import { PriorityBadge, StatusBadge } from "@/components/document-request-badges";
import type { RequesterDocumentRequestSummary } from "@/lib/requester-document-request-types";
import { getModuleBySlug } from "@/lib/modules";

type RequestsPayload = {
  requests?: RequesterDocumentRequestSummary[];
  error?: string;
};

export function RequesterDocumentRequestsList() {
  const [requests, setRequests] = useState<RequesterDocumentRequestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const orderedRequests = useMemo(
    () =>
      [...requests].sort((first, second) =>
        second.updated_at.localeCompare(first.updated_at)
      ),
    [requests]
  );

  useEffect(() => {
    void loadRequests();
  }, []);

  async function loadRequests() {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/my-document-requests", { cache: "no-store" });
      const payload = (await response.json()) as RequestsPayload;

      if (!response.ok) {
        setRequests([]);
        setMessage(payload.error || "Não foi possível carregar suas solicitações.");
        return;
      }

      setRequests(payload.requests || []);
    } catch {
      setRequests([]);
      setMessage("Não foi possível carregar suas solicitações.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="gi-panel overflow-hidden">
        <div className="border-t-4 border-gi-gold p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="gi-eyebrow">Área do solicitante</p>
              <h1 className="mt-2 text-2xl font-semibold text-gi-ink">
                Minhas solicitações
              </h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-gi-muted">
                Acompanhe protocolos, status, prioridades, pendências públicas e documentos finais
                vinculados às solicitações encaminhadas pelo Gabinete Inteligente.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadRequests()}
              className="gi-button-secondary"
            >
              <RefreshCw className="h-4 w-4" aria-hidden={true} />
              Atualizar
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-gi-navy/15 bg-gi-navy/5 p-4 text-sm leading-6 text-gi-ink">
        Nesta fase MVP, o ambiente utiliza credencial única de administrador sênior; por isso, a
        listagem mostra todas as solicitações para fins de teste. Em produção multiusuário, cada
        usuário verá apenas suas próprias solicitações.
      </section>

      {message ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700">
          {message}
        </p>
      ) : null}

      <section className="gi-panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gi-line p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="gi-eyebrow">Acompanhamento</p>
            <h2 className="mt-2 text-lg font-semibold text-gi-ink">
              {orderedRequests.length} solicitação(ões)
            </h2>
          </div>
          <p className="text-sm leading-6 text-gi-muted">
            Notas internas e informações reservadas não são exibidas nesta área.
          </p>
        </div>

        {isLoading ? (
          <p className="p-5 text-sm leading-6 text-gi-muted">Carregando solicitações...</p>
        ) : null}

        {!isLoading && !orderedRequests.length ? (
          <div className="m-5 rounded-md border border-gi-line bg-gi-background p-5 text-sm leading-6 text-gi-muted">
            <div className="flex items-start gap-3">
              <Inbox className="mt-0.5 h-5 w-5 text-gi-gold" aria-hidden={true} />
              <p>Nenhuma solicitação foi encontrada para acompanhamento neste momento.</p>
            </div>
          </div>
        ) : null}

        {!isLoading && orderedRequests.length ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-gi-line text-sm">
                <thead className="bg-gi-background">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gi-muted">
                    <th className="px-5 py-3">Protocolo</th>
                    <th className="px-5 py-3">Módulo e título</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Prioridade</th>
                    <th className="px-5 py-3">Criação</th>
                    <th className="px-5 py-3">Atualização</th>
                    <th className="px-5 py-3">Documento final</th>
                    <th className="px-5 py-3 text-right">Acesso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gi-line bg-white">
                  {orderedRequests.map((request) => (
                    <RequestTableRow key={request.id} request={request} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-5 lg:hidden">
              {orderedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}

function RequestTableRow({ request }: { request: RequesterDocumentRequestSummary }) {
  const module = getModuleBySlug(request.module_slug);

  return (
    <tr className="align-top transition hover:bg-gi-gold/5">
      <td className="px-5 py-4">
        <span className="font-semibold text-gi-navy">{request.protocol_number}</span>
      </td>
      <td className="px-5 py-4">
        <p className="font-semibold text-gi-ink">{request.title}</p>
        <p className="mt-1 text-xs leading-5 text-gi-muted">{module.name}</p>
      </td>
      <td className="px-5 py-4">
        <StatusBadge status={request.status} />
      </td>
      <td className="px-5 py-4">
        <PriorityBadge priority={request.priority} />
      </td>
      <td className="px-5 py-4 text-gi-muted">{formatDateTime(request.created_at)}</td>
      <td className="px-5 py-4 text-gi-muted">{formatDateTime(request.updated_at)}</td>
      <td className="px-5 py-4">
        {request.final_document_available ? (
          <span className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900">
            <FileCheck2 className="h-3.5 w-3.5" aria-hidden={true} />
            Disponível
          </span>
        ) : (
          <span className="text-xs font-medium text-gi-muted">Ainda não disponível</span>
        )}
      </td>
      <td className="px-5 py-4 text-right">
        <Link
          href={`/minhas-solicitacoes/${request.id}` as Route}
          className="inline-flex items-center gap-2 rounded-md border border-gi-line bg-white px-3 py-2 text-xs font-semibold text-gi-navy transition hover:border-gi-gold hover:bg-gi-gold/10 gi-focus-ring"
        >
          Abrir
          <ExternalLink className="h-3.5 w-3.5" aria-hidden={true} />
        </Link>
      </td>
    </tr>
  );
}

function RequestCard({ request }: { request: RequesterDocumentRequestSummary }) {
  const module = getModuleBySlug(request.module_slug);

  return (
    <article className="rounded-md border border-gi-line bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gi-gold">
          {request.protocol_number}
        </span>
        <StatusBadge status={request.status} />
      </div>
      <h3 className="mt-3 text-base font-semibold text-gi-ink">{request.title}</h3>
      <p className="mt-1 text-sm leading-6 text-gi-muted">{module.name}</p>
      <div className="mt-3 grid gap-2 text-sm text-gi-muted">
        <p>
          <span className="font-semibold text-gi-ink">Criada em:</span>{" "}
          {formatDateTime(request.created_at)}
        </p>
        <p>
          <span className="font-semibold text-gi-ink">Atualizada em:</span>{" "}
          {formatDateTime(request.updated_at)}
        </p>
        <p>
          <span className="font-semibold text-gi-ink">Documento final:</span>{" "}
          {request.final_document_available ? "disponível" : "ainda não disponível"}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <PriorityBadge priority={request.priority} />
        <Link
          href={`/minhas-solicitacoes/${request.id}` as Route}
          className="gi-button-secondary h-9 px-3"
        >
          Abrir
        </Link>
      </div>
    </article>
  );
}

function formatDateTime(value: string) {
  if (!value) {
    return "Não informado";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}
