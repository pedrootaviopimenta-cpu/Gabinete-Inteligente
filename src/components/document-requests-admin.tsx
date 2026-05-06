"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardCopy, RefreshCw, Save, Search, SquareCheckBig } from "lucide-react";
import {
  documentRequestPriorities,
  documentRequestPriorityLabels,
  documentRequestStatusLabels,
  documentRequestStatuses,
  type DocumentRequest,
  type DocumentRequestPriority,
  type DocumentRequestStatus
} from "@/lib/document-request-types";
import { getFormDefinition, type FormValue } from "@/lib/forms";
import { getModuleBySlug, modules, type ModuleSlug } from "@/lib/modules";

type Filters = {
  status: "" | DocumentRequestStatus;
  moduleSlug: "" | ModuleSlug;
  priority: "" | DocumentRequestPriority;
};

type EditableRequestFields = {
  status: DocumentRequestStatus;
  internal_notes: string;
  final_document_text: string;
  final_document_url: string;
};

const emptyFilters: Filters = {
  status: "",
  moduleSlug: "",
  priority: ""
};

const statusBadgeClasses: Record<DocumentRequestStatus, string> = {
  recebido: "border-gi-gold/35 bg-gi-gold/10 text-gi-navy",
  em_analise: "border-gi-navy/20 bg-gi-navy/5 text-gi-navy",
  aguardando_documentos: "border-amber-200 bg-amber-50 text-amber-900",
  em_producao: "border-gi-gold/45 bg-gi-gold/15 text-gi-navy",
  em_revisao: "border-gi-line bg-gi-background text-gi-ink",
  concluido: "border-emerald-200 bg-emerald-50 text-emerald-900",
  cancelado: "border-rose-200 bg-rose-50 text-rose-900"
};

export function DocumentRequestsAdmin() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [selectedId, setSelectedId] = useState("");
  const [editValues, setEditValues] = useState<EditableRequestFields | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const filteredRequests = useMemo(() => {
    return requests
      .filter((request) => !filters.status || request.status === filters.status)
      .filter((request) => !filters.moduleSlug || request.module_slug === filters.moduleSlug)
      .filter((request) => !filters.priority || request.priority === filters.priority);
  }, [filters, requests]);

  const selectedRequest = useMemo(() => {
    return requests.find((request) => request.id === selectedId) || filteredRequests[0] || null;
  }, [filteredRequests, requests, selectedId]);

  useEffect(() => {
    void loadRequests();
  }, []);

  useEffect(() => {
    if (!selectedRequest) {
      setEditValues(null);
      return;
    }

    setEditValues({
      status: selectedRequest.status,
      internal_notes: selectedRequest.internal_notes,
      final_document_text: selectedRequest.final_document_text,
      final_document_url: selectedRequest.final_document_url
    });
    setSelectedId(selectedRequest.id);
  }, [selectedRequest?.id]);

  async function loadRequests() {
    setIsLoading(true);
    setStatusMessage("");

    const response = await fetch("/api/document-requests", { cache: "no-store" });
    const payload = (await response.json()) as { requests?: DocumentRequest[]; error?: string };

    if (!response.ok) {
      setStatusMessage(payload.error || "Não foi possível carregar as solicitações.");
      setIsLoading(false);
      return;
    }

    setRequests(payload.requests || []);
    setIsLoading(false);
  }

  async function saveSelectedRequest(nextStatus?: DocumentRequestStatus) {
    if (!selectedRequest || !editValues) {
      return;
    }

    setIsSaving(true);
    setStatusMessage("");

    const response = await fetch(`/api/document-requests/${selectedRequest.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editValues,
        status: nextStatus || editValues.status
      })
    });
    const payload = (await response.json()) as { request?: DocumentRequest; error?: string };

    if (!response.ok || !payload.request) {
      setStatusMessage(payload.error || "Não foi possível salvar a solicitação.");
      setIsSaving(false);
      return;
    }

    setRequests((current) =>
      current.map((request) => (request.id === payload.request?.id ? payload.request : request))
    );
    setEditValues({
      status: payload.request.status,
      internal_notes: payload.request.internal_notes,
      final_document_text: payload.request.final_document_text,
      final_document_url: payload.request.final_document_url
    });
    setStatusMessage("Solicitação atualizada com sucesso.");
    setIsSaving(false);
  }

  async function copyContext() {
    if (!selectedRequest) {
      return;
    }

    await navigator.clipboard.writeText(selectedRequest.structured_context);
    setStatusMessage("Contexto estruturado copiado para a área de transferência.");
  }

  return (
    <main className="space-y-6">
      <section className="gi-panel p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="gi-eyebrow">
              Operação assistida
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-gi-ink">
              Solicitações documentais
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gi-muted">
              Painel inicial para triagem, análise, complementação e produção humana de
              documentos solicitados pelos módulos do Gabinete Inteligente.
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
      </section>

      <section className="gi-panel p-5">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gi-muted" aria-hidden={true} />
          <h2 className="text-base font-semibold text-gi-ink">Filtros</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <FilterSelect
            label="Status"
            value={filters.status}
            onChange={(value) => setFilters((current) => ({ ...current, status: value as Filters["status"] }))}
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
        </div>
      </section>

      {statusMessage ? (
        <p className="rounded-md border border-gi-gold/35 bg-gi-gold/10 p-3 text-sm leading-6 text-gi-ink">
          {statusMessage}
        </p>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
        <div className="gi-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-gi-ink">Fila de solicitações</h2>
            <span className="rounded-md border border-gi-line px-2 py-1 text-xs font-medium text-gi-muted">
              {filteredRequests.length} registro(s)
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {isLoading ? (
              <p className="text-sm leading-6 text-gi-muted">Carregando solicitações...</p>
            ) : null}

            {!isLoading && !filteredRequests.length ? (
              <p className="rounded-md border border-gi-line bg-gi-background p-4 text-sm leading-6 text-gi-muted">
                Nenhuma solicitação encontrada para os filtros selecionados.
              </p>
            ) : null}

            {filteredRequests.map((request) => {
              const module = getModuleBySlug(request.module_slug);
              const isSelected = selectedRequest?.id === request.id;

              return (
                <button
                  type="button"
                  key={request.id}
                  onClick={() => setSelectedId(request.id)}
                  className={`block w-full rounded-md border p-4 text-left transition ${
                    isSelected
                      ? "border-gi-gold bg-gi-gold/10"
                      : "border-gi-line bg-white hover:border-gi-gold/60 hover:bg-gi-gold/5"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gi-gold">
                      {request.protocol_number}
                    </span>
                    <span className={`rounded-md border px-2 py-1 text-xs font-medium ${statusBadgeClasses[request.status]}`}>
                      {documentRequestStatusLabels[request.status]}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-gi-ink">{request.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-gi-muted">
                    {module.name} · {documentRequestPriorityLabels[request.priority]} ·{" "}
                    {request.requester_department}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="gi-panel p-5">
          {selectedRequest && editValues ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="gi-eyebrow">
                    {selectedRequest.protocol_number}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-gi-ink">
                    {selectedRequest.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gi-muted">
                    {getModuleBySlug(selectedRequest.module_slug).name} · solicitante:{" "}
                    {selectedRequest.requester_name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void saveSelectedRequest("concluido")}
                  disabled={isSaving}
                  className="gi-button-assisted"
                >
                  <SquareCheckBig className="h-4 w-4" aria-hidden={true} />
                  Marcar como concluído
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <InfoLine label="E-mail" value={selectedRequest.requester_email} />
                <InfoLine label="Telefone" value={selectedRequest.requester_phone || "Não informado"} />
                <InfoLine label="Unidade" value={selectedRequest.requester_department} />
                <InfoLine
                  label="Prioridade"
                  value={documentRequestPriorityLabels[selectedRequest.priority]}
                />
              </div>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gi-ink">
                  Gestão interna
                </h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-medium text-gi-ink">
                    Status
                    <select
                      value={editValues.status}
                      onChange={(event) =>
                        setEditValues((current) =>
                          current
                            ? { ...current, status: event.target.value as DocumentRequestStatus }
                            : current
                        )
                      }
                      className="gi-input"
                    >
                      {documentRequestStatuses.map((status) => (
                        <option key={status} value={status}>
                          {documentRequestStatusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-gi-ink">
                    URL do documento final
                    <input
                      value={editValues.final_document_url}
                      onChange={(event) =>
                        setEditValues((current) =>
                          current ? { ...current, final_document_url: event.target.value } : current
                        )
                      }
                      className="gi-input"
                      placeholder="Link interno ou futuro arquivo DOCX"
                    />
                  </label>
                </div>
                <label className="mt-4 block text-sm font-medium text-gi-ink">
                  Notas internas
                  <textarea
                    value={editValues.internal_notes}
                    onChange={(event) =>
                      setEditValues((current) =>
                        current ? { ...current, internal_notes: event.target.value } : current
                      )
                    }
                    rows={5}
                    className="gi-input resize-y"
                    placeholder="Registre cautelas, pendências, documentos faltantes e encaminhamentos internos."
                  />
                </label>
                <label className="mt-4 block text-sm font-medium text-gi-ink">
                  Texto final produzido pela equipe responsável
                  <textarea
                    value={editValues.final_document_text}
                    onChange={(event) =>
                      setEditValues((current) =>
                        current ? { ...current, final_document_text: event.target.value } : current
                      )
                    }
                    rows={8}
                    className="gi-input resize-y"
                    placeholder="Cole ou redija o texto final após análise humana competente."
                  />
                </label>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void saveSelectedRequest()}
                    disabled={isSaving}
                    className="gi-button-primary"
                  >
                    <Save className="h-4 w-4" aria-hidden={true} />
                    {isSaving ? "Salvando" : "Salvar alterações"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyContext()}
                    className="gi-button-secondary"
                  >
                    <ClipboardCopy className="h-4 w-4" aria-hidden={true} />
                    Copiar contexto
                  </button>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gi-ink">
                  Campos estruturados
                </h3>
                <StructuredFields request={selectedRequest} />
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gi-ink">
                  Contexto estruturado
                </h3>
                <div className="mt-3 min-h-72 whitespace-pre-wrap rounded-md border border-gi-line bg-gi-background p-4 text-sm leading-6 text-gi-ink">
                  {selectedRequest.structured_context}
                </div>
              </section>
            </div>
          ) : (
            <p className="rounded-md border border-gi-line bg-gi-background p-4 text-sm leading-6 text-gi-muted">
              Selecione uma solicitação para visualizar detalhes, campos estruturados e
              providências internas.
            </p>
          )}
        </div>
      </section>
    </main>
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

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gi-line bg-gi-background p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gi-muted">{label}</p>
      <p className="mt-1 break-words text-sm leading-6 text-gi-ink">{value}</p>
    </div>
  );
}

function StructuredFields({ request }: { request: DocumentRequest }) {
  const form = getFormDefinition(request.module_slug);

  return (
    <div className="mt-3 space-y-4">
      {form.sections.map((section) => (
        <div key={section.title} className="rounded-md border border-gi-line bg-gi-background p-4">
          <h4 className="border-l-4 border-gi-gold pl-3 text-sm font-semibold text-gi-ink">
            {section.title}
          </h4>
          <dl className="mt-3 grid gap-3 md:grid-cols-2">
            {section.fields.map((field) => (
              <div key={field.name}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gi-muted">
                  {field.label}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gi-ink">
                  {formatFieldValue(request.structured_fields[field.name])}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

function formatFieldValue(value: FormValue | undefined) {
  if (Array.isArray(value)) {
    const items = value.map((item) => item.trim()).filter(Boolean);
    return items.length ? items.map((item, index) => `${index + 1}. ${item}`).join("\n") : "Não informado";
  }

  if (typeof value === "boolean") {
    return value ? "Sim" : "Não";
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return "Não informado";
}
