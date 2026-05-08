"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, FilterX, Inbox, RefreshCw, Search } from "lucide-react";
import {
  documentRequestPriorities,
  documentRequestPriorityLabels,
  documentRequestStatusLabels,
  documentRequestStatuses,
  type DocumentRequest,
  type DocumentRequestPriority,
  type DocumentRequestStatus
} from "@/lib/document-request-types";
import {
  deadlineStatusLabels,
  getDaysUntilDue,
  getDeadlineStatus,
  type DeadlineFilter,
  type DeadlineStatus
} from "@/lib/deadlines";
import { getModuleBySlug, modules, type ModuleSlug } from "@/lib/modules";
import {
  ADMIN_COMPLETION_NOTICE,
  ConfidentialNotice,
  PriorityBadge,
  StatusBadge
} from "@/components/document-request-badges";

type Filters = {
  status: "" | DocumentRequestStatus;
  moduleSlug: "" | ModuleSlug;
  priority: "" | DocumentRequestPriority;
  deadline: "" | DeadlineFilter;
  query: string;
};

const emptyFilters: Filters = {
  status: "",
  moduleSlug: "",
  priority: "",
  deadline: "",
  query: ""
};

export function DocumentRequestsAdminList() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const visibleRequests = useMemo(() => {
    const query = normalizeSearch(filters.query);

    return requests.filter((request) => {
      if (!query) {
        return true;
      }

      const module = getModuleBySlug(request.module_slug);
      const searchableText = [
        request.protocol_number,
        request.title,
        request.requester_name,
        request.requester_email,
        request.requester_department,
        module.name,
        module.area,
        documentRequestPriorityLabels[request.priority],
        documentRequestStatusLabels[request.status],
        request.structured_context
      ]
        .join(" ")
        .toLowerCase();

      return normalizeSearch(searchableText).includes(query);
    });
  }, [filters.query, requests]);

  useEffect(() => {
    void loadRequests();
  }, [filters.status, filters.moduleSlug, filters.priority, filters.deadline]);

  async function loadRequests() {
    setIsLoading(true);
    setMessage("");

    const params = new URLSearchParams();
    if (filters.status) {
      params.set("status", filters.status);
    }
    if (filters.moduleSlug) {
      params.set("moduleSlug", filters.moduleSlug);
    }
    if (filters.priority) {
      params.set("priority", filters.priority);
    }
    if (filters.deadline) {
      params.set("deadline", filters.deadline);
    }

    const suffix = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`/api/document-requests${suffix}`, { cache: "no-store" });
    const payload = (await response.json()) as { requests?: DocumentRequest[]; error?: string };

    if (!response.ok) {
      setMessage(payload.error || "Não foi possível carregar as solicitações documentais.");
      setRequests([]);
      setIsLoading(false);
      return;
    }

    setRequests(payload.requests || []);
    setIsLoading(false);
  }

  function clearFilters() {
    setFilters(emptyFilters);
  }

  return (
    <main className="space-y-6">
      <section className="gi-panel overflow-hidden">
        <div className="border-t-4 border-gi-gold p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="gi-eyebrow">Painel administrativo</p>
              <h1 className="mt-2 text-2xl font-semibold text-gi-ink">
                Solicitações documentais assistidas
              </h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-gi-muted">
                Fila administrativa para triagem, análise, complementação, produção e conclusão
                das solicitações enviadas pelos formulários estruturados do Gabinete Inteligente.
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

      <section className="rounded-md border border-gi-gold/35 bg-gi-gold/10 p-4 text-sm leading-6 text-gi-ink">
        {ADMIN_COMPLETION_NOTICE}
      </section>

      <ConfidentialNotice />

      <section className="gi-panel p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gi-gold" aria-hidden={true} />
            <h2 className="text-base font-semibold text-gi-ink">Filtros de análise</h2>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="gi-button-secondary h-9 px-3"
          >
            <FilterX className="h-4 w-4" aria-hidden={true} />
            Limpar filtros
          </button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <label className="block text-sm font-medium text-gi-ink">
            Texto livre
            <input
              value={filters.query}
              onChange={(event) =>
                setFilters((current) => ({ ...current, query: event.target.value }))
              }
              className="gi-input"
              placeholder="Buscar por protocolo, título, solicitante, setor ou contexto"
            />
          </label>

          <FilterSelect
            label="Status"
            value={filters.status}
            onChange={(value) =>
              setFilters((current) => ({ ...current, status: value as Filters["status"] }))
            }
            options={documentRequestStatuses.map((status) => ({
              label: documentRequestStatusLabels[status],
              value: status
            }))}
          />

          <FilterSelect
            label="Módulo"
            value={filters.moduleSlug}
            onChange={(value) =>
              setFilters((current) => ({ ...current, moduleSlug: value as Filters["moduleSlug"] }))
            }
            options={modules.map((module) => ({
              label: module.name,
              value: module.slug
            }))}
          />

          <FilterSelect
            label="Prioridade"
            value={filters.priority}
            onChange={(value) =>
              setFilters((current) => ({ ...current, priority: value as Filters["priority"] }))
            }
            options={documentRequestPriorities.map((priority) => ({
              label: documentRequestPriorityLabels[priority],
              value: priority
            }))}
          />

          <FilterSelect
            label="Prazo"
            value={filters.deadline}
            onChange={(value) =>
              setFilters((current) => ({ ...current, deadline: value as Filters["deadline"] }))
            }
            options={[
              { label: "Vencidas", value: "overdue" },
              { label: "Próximas do vencimento", value: "due_soon" },
              { label: "Sem prazo", value: "no_deadline" }
            ]}
          />
        </div>
      </section>

      {message ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700">
          {message}
        </p>
      ) : null}

      <section className="gi-panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gi-line p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="gi-eyebrow">Fila de trabalho</p>
            <h2 className="mt-2 text-lg font-semibold text-gi-ink">
              {visibleRequests.length} solicitação(ões) encontrada(s)
            </h2>
          </div>
          <p className="text-sm leading-6 text-gi-muted">
            Os dados estruturados permanecem preservados para conferência técnica e produção final.
          </p>
        </div>

        {isLoading ? (
          <p className="p-5 text-sm leading-6 text-gi-muted">Carregando solicitações...</p>
        ) : null}

        {!isLoading && !visibleRequests.length ? (
          <div className="m-5 rounded-md border border-gi-line bg-gi-background p-5 text-sm leading-6 text-gi-muted">
            <div className="flex items-start gap-3">
              <Inbox className="mt-0.5 h-5 w-5 text-gi-gold" aria-hidden={true} />
              <p>
                Nenhuma solicitação foi encontrada para os filtros selecionados. Revise os
                critérios de busca ou atualize a fila administrativa.
              </p>
            </div>
          </div>
        ) : null}

        {!isLoading && visibleRequests.length ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-gi-line text-sm">
                <thead className="bg-gi-background">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gi-muted">
                    <th className="px-5 py-3">Protocolo</th>
                    <th className="px-5 py-3">Módulo e título</th>
                    <th className="px-5 py-3">Solicitante</th>
                    <th className="px-5 py-3">Setor/unidade</th>
                    <th className="px-5 py-3">Prioridade</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Prazo</th>
                    <th className="px-5 py-3">Criação</th>
                    <th className="px-5 py-3 text-right">Detalhe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gi-line bg-white">
                  {visibleRequests.map((request) => (
                    <RequestTableRow key={request.id} request={request} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-5 lg:hidden">
              {visibleRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}

function RequestTableRow({ request }: { request: DocumentRequest }) {
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
        <p className="font-medium text-gi-ink">{request.requester_name}</p>
        <p className="mt-1 text-xs leading-5 text-gi-muted">{request.requester_email}</p>
      </td>
      <td className="px-5 py-4 text-gi-muted">{request.requester_department}</td>
      <td className="px-5 py-4">
        <PriorityBadge priority={request.priority} />
      </td>
      <td className="px-5 py-4">
        <StatusBadge status={request.status} />
      </td>
      <td className="px-5 py-4">
        <DeadlineBadge request={request} />
      </td>
      <td className="px-5 py-4 text-gi-muted">{formatDateTime(request.created_at)}</td>
      <td className="px-5 py-4 text-right">
        <Link
          href={`/admin/solicitacoes/${request.id}` as Route}
          className="inline-flex items-center gap-2 rounded-md border border-gi-line bg-white px-3 py-2 text-xs font-semibold text-gi-navy transition hover:border-gi-gold hover:bg-gi-gold/10 gi-focus-ring"
        >
          Abrir
          <ExternalLink className="h-3.5 w-3.5" aria-hidden={true} />
        </Link>
      </td>
    </tr>
  );
}

function RequestCard({ request }: { request: DocumentRequest }) {
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
          <span className="font-semibold text-gi-ink">Solicitante:</span>{" "}
          {request.requester_name}
        </p>
        <p>
          <span className="font-semibold text-gi-ink">Setor:</span>{" "}
          {request.requester_department}
        </p>
        <p>
          <span className="font-semibold text-gi-ink">Criada em:</span>{" "}
          {formatDateTime(request.created_at)}
        </p>
        <div>
          <span className="font-semibold text-gi-ink">Prazo:</span>{" "}
          <span className="mt-1 inline-flex">
            <DeadlineBadge request={request} />
          </span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <PriorityBadge priority={request.priority} />
        <Link
          href={`/admin/solicitacoes/${request.id}` as Route}
          className="gi-button-secondary h-9 px-3"
        >
          Abrir detalhe
        </Link>
      </div>
    </article>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-gi-ink">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="gi-input"
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function DeadlineBadge({ request }: { request: DocumentRequest }) {
  const status = getDeadlineStatus(request);
  const days = getDaysUntilDue(request.due_date);
  const classes: Record<DeadlineStatus, string> = {
    no_prazo: "border-gi-navy/15 bg-gi-navy/5 text-gi-navy",
    vence_hoje: "border-amber-200 bg-amber-50 text-amber-900",
    proximo_vencimento: "border-gi-gold/40 bg-gi-gold/10 text-gi-navy",
    vencido: "border-rose-200 bg-rose-50 text-rose-900",
    concluido: "border-emerald-200 bg-emerald-50 text-emerald-900",
    sem_prazo: "border-gi-line bg-gi-background text-gi-muted"
  };
  const suffix =
    days === null || status === "sem_prazo" || status === "concluido"
      ? ""
      : days < 0
        ? ` · ${Math.abs(days)} dia(s) vencido`
        : ` · ${days} dia(s)`;

  return (
    <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>
      {deadlineStatusLabels[status]}
      {suffix}
    </span>
  );
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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
