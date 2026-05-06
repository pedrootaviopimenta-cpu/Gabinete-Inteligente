"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ClipboardCopy,
  ExternalLink,
  FileText,
  RefreshCw,
  Save,
  SquareCheckBig
} from "lucide-react";
import {
  documentRequestStatusLabels,
  documentRequestStatuses,
  type DocumentRequest,
  type DocumentRequestStatus
} from "@/lib/document-request-types";
import { getFormDefinition, type FormValue } from "@/lib/forms";
import { getModuleBySlug } from "@/lib/modules";
import {
  ADMIN_COMPLETION_NOTICE,
  PriorityBadge,
  StatusBadge
} from "@/components/document-request-badges";

type EditableRequestFields = {
  status: DocumentRequestStatus;
  internal_notes: string;
  final_document_text: string;
  final_document_url: string;
};

export function DocumentRequestDetailAdmin({ requestId }: { requestId: string }) {
  const [request, setRequest] = useState<DocumentRequest | null>(null);
  const [editValues, setEditValues] = useState<EditableRequestFields | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadRequest();
  }, [requestId]);

  async function loadRequest() {
    setIsLoading(true);
    setMessage("");

    const response = await fetch(`/api/document-requests/${requestId}`, { cache: "no-store" });
    const payload = (await response.json()) as { request?: DocumentRequest; error?: string };

    if (!response.ok || !payload.request) {
      setRequest(null);
      setEditValues(null);
      setMessage(payload.error || "Solicitação não encontrada.");
      setIsLoading(false);
      return;
    }

    setRequest(payload.request);
    setEditValues({
      status: payload.request.status,
      internal_notes: payload.request.internal_notes,
      final_document_text: payload.request.final_document_text,
      final_document_url: payload.request.final_document_url
    });
    setIsLoading(false);
  }

  async function saveRequest(nextStatus?: DocumentRequestStatus) {
    if (!request || !editValues) {
      return;
    }

    setIsSaving(true);
    setMessage("");

    const response = await fetch(`/api/document-requests/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editValues,
        status: nextStatus || editValues.status
      })
    });
    const payload = (await response.json()) as { request?: DocumentRequest; error?: string };

    if (!response.ok || !payload.request) {
      setMessage(payload.error || "Não foi possível atualizar a solicitação.");
      setIsSaving(false);
      return;
    }

    setRequest(payload.request);
    setEditValues({
      status: payload.request.status,
      internal_notes: payload.request.internal_notes,
      final_document_text: payload.request.final_document_text,
      final_document_url: payload.request.final_document_url
    });
    setMessage("Solicitação atualizada com sucesso.");
    setIsSaving(false);
  }

  async function copyContext() {
    if (!request) {
      return;
    }

    await navigator.clipboard.writeText(request.structured_context);
    setMessage("Contexto estruturado copiado para a área de transferência.");
  }

  if (isLoading) {
    return (
      <main className="space-y-6">
        <section className="gi-panel p-5">
          <p className="text-sm leading-6 text-gi-muted">Carregando detalhe da solicitação...</p>
        </section>
      </main>
    );
  }

  if (!request || !editValues) {
    return (
      <main className="space-y-6">
        <Link href="/admin/solicitacoes" className="gi-button-secondary w-fit">
          <ArrowLeft className="h-4 w-4" aria-hidden={true} />
          Voltar à fila
        </Link>
        <section className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700">
          {message || "Solicitação não encontrada."}
        </section>
      </main>
    );
  }

  const module = getModuleBySlug(request.module_slug);

  return (
    <main className="space-y-6">
      <section className="gi-panel overflow-hidden">
        <div className="border-t-4 border-gi-gold p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link href="/admin/solicitacoes" className="gi-button-secondary mb-4 w-fit">
                <ArrowLeft className="h-4 w-4" aria-hidden={true} />
                Voltar à fila
              </Link>
              <p className="gi-eyebrow">{request.protocol_number}</p>
              <h1 className="mt-2 text-2xl font-semibold text-gi-ink">{request.title}</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-gi-muted">
                Análise administrativa da solicitação vinculada ao módulo {module.name}, com
                preservação integral dos campos estruturados e do contexto encaminhado pelo
                solicitante.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <PriorityBadge priority={request.priority} />
              <StatusBadge status={request.status} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-gi-gold/35 bg-gi-gold/10 p-4 text-sm leading-6 text-gi-ink">
        {ADMIN_COMPLETION_NOTICE}
      </section>

      {message ? (
        <p className="rounded-md border border-gi-gold/35 bg-gi-gold/10 p-3 text-sm leading-6 text-gi-ink">
          {message}
        </p>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="gi-panel p-5">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gi-gold" aria-hidden={true} />
              <h2 className="text-base font-semibold text-gi-ink">Dados da solicitação</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <InfoLine label="Protocolo" value={request.protocol_number} />
              <InfoLine label="Módulo" value={module.name} />
              <InfoLine label="Status atual" value={documentRequestStatusLabels[request.status]} />
              <InfoLine label="Prioridade" value={formatPriority(request.priority)} />
              <InfoLine label="Criada em" value={formatDateTime(request.created_at)} />
              <InfoLine label="Atualizada em" value={formatDateTime(request.updated_at)} />
            </div>
          </section>

          <section className="gi-panel p-5">
            <h2 className="text-base font-semibold text-gi-ink">Dados do solicitante</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <InfoLine label="Solicitante" value={request.requester_name} />
              <InfoLine label="E-mail" value={request.requester_email} />
              <InfoLine label="Telefone" value={request.requester_phone || "Não informado"} />
              <InfoLine label="Setor/unidade solicitante" value={request.requester_department} />
            </div>
          </section>

          <section className="gi-panel p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-gi-ink">Contexto estruturado</h2>
                <p className="mt-1 text-sm leading-6 text-gi-muted">
                  Payload administrativo montado a partir dos formulários estruturados.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void copyContext()}
                className="gi-button-secondary"
              >
                <ClipboardCopy className="h-4 w-4" aria-hidden={true} />
                Copiar contexto
              </button>
            </div>
            <div className="mt-4 min-h-80 whitespace-pre-wrap rounded-md border border-gi-line bg-gi-background p-4 text-sm leading-6 text-gi-ink">
              {request.structured_context}
            </div>
          </section>

          <section className="gi-panel p-5">
            <h2 className="text-base font-semibold text-gi-ink">Campos estruturados preservados</h2>
            <StructuredFields request={request} />
          </section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <section className="gi-panel p-5">
            <h2 className="text-base font-semibold text-gi-ink">Gestão interna</h2>
            <p className="mt-2 text-sm leading-6 text-gi-muted">
              Atualize a tramitação, registre notas de análise e consolide o texto final após a
              revisão humana competente.
            </p>

            <label className="mt-4 block text-sm font-medium text-gi-ink">
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

            <label className="mt-4 block text-sm font-medium text-gi-ink">
              Notas internas
              <textarea
                value={editValues.internal_notes}
                onChange={(event) =>
                  setEditValues((current) =>
                    current ? { ...current, internal_notes: event.target.value } : current
                  )
                }
                rows={6}
                className="gi-input resize-y"
                placeholder="Registre cautelas, pendências, documentos faltantes e encaminhamentos internos."
              />
            </label>

            <label className="mt-4 block text-sm font-medium text-gi-ink">
              Texto final da peça/documento
              <textarea
                value={editValues.final_document_text}
                onChange={(event) =>
                  setEditValues((current) =>
                    current ? { ...current, final_document_text: event.target.value } : current
                  )
                }
                rows={9}
                className="gi-input resize-y"
                placeholder="Insira o texto final após análise e revisão humana competente."
              />
            </label>

            <label className="mt-4 block text-sm font-medium text-gi-ink">
              URL do documento final
              <input
                value={editValues.final_document_url}
                onChange={(event) =>
                  setEditValues((current) =>
                    current ? { ...current, final_document_url: event.target.value } : current
                  )
                }
                className="gi-input"
                placeholder="https://... ou link interno de armazenamento"
              />
            </label>

            {request.final_document_url ? (
              <a
                href={request.final_document_url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-gi-navy underline decoration-gi-gold decoration-2 underline-offset-4"
              >
                Abrir documento final registrado
                <ExternalLink className="h-4 w-4" aria-hidden={true} />
              </a>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void saveRequest()}
                disabled={isSaving}
                className="gi-button-primary"
              >
                <Save className="h-4 w-4" aria-hidden={true} />
                {isSaving ? "Salvando" : "Salvar alterações"}
              </button>
              <button
                type="button"
                onClick={() => void saveRequest("concluido")}
                disabled={isSaving}
                className="gi-button-assisted"
              >
                <SquareCheckBig className="h-4 w-4" aria-hidden={true} />
                Marcar como concluído
              </button>
            </div>
          </section>

          <section className="rounded-md border border-gi-line bg-white p-5 shadow-panel">
            <div className="flex items-start gap-3">
              <RefreshCw className="mt-0.5 h-4 w-4 text-gi-gold" aria-hidden={true} />
              <p className="text-sm leading-6 text-gi-muted">
                Alterações de status, notas internas, texto final e URL são salvas pela rota
                administrativa de atualização e preservam os dados estruturados originais.
              </p>
            </div>
          </section>
        </aside>
      </section>
    </main>
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
    <div className="mt-4 space-y-4">
      {form.sections.map((section) => (
        <div key={section.title} className="rounded-md border border-gi-line bg-gi-background p-4">
          <h3 className="border-l-4 border-gi-gold pl-3 text-sm font-semibold text-gi-ink">
            {section.title}
          </h3>
          <dl className="mt-4 grid gap-3 md:grid-cols-2">
            {section.fields.map((field) => (
              <div key={field.name} className="rounded-md bg-white p-3">
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

function formatPriority(priority: DocumentRequest["priority"]) {
  const labels: Record<DocumentRequest["priority"], string> = {
    baixa: "Baixa",
    normal: "Normal",
    alta: "Alta",
    urgente: "Urgente"
  };

  return labels[priority];
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
