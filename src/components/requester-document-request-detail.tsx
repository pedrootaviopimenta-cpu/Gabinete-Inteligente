"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, FileCheck2, FileText } from "lucide-react";
import { DocumentAttachmentsPanel } from "@/components/document-attachments-panel";
import { PriorityBadge, StatusBadge } from "@/components/document-request-badges";
import { DocumentRequestPendingItemsPanel } from "@/components/document-request-pending-items-panel";
import { RequesterPublicMessagesPanel } from "@/components/requester-public-messages-panel";
import type { RequesterDocumentRequestDetail } from "@/lib/requester-document-request-types";
import { getFormDefinition, type FormValue } from "@/lib/forms";
import { getModuleBySlug } from "@/lib/modules";

type DetailPayload = {
  request?: RequesterDocumentRequestDetail;
  error?: string;
};

export function RequesterDocumentRequestDetailView({ requestId }: { requestId: string }) {
  const [request, setRequest] = useState<RequesterDocumentRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadRequest();
  }, [requestId]);

  async function loadRequest() {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/my-document-requests/${requestId}`, {
        cache: "no-store"
      });
      const payload = (await response.json()) as DetailPayload;

      if (!response.ok || !payload.request) {
        setRequest(null);
        setMessage(payload.error || "Solicitação não encontrada.");
        return;
      }

      setRequest(payload.request);
    } catch {
      setRequest(null);
      setMessage("Não foi possível carregar sua solicitação.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <main className="space-y-6">
        <section className="gi-panel p-5">
          <p className="text-sm leading-6 text-gi-muted">Carregando solicitação...</p>
        </section>
      </main>
    );
  }

  if (!request) {
    return (
      <main className="space-y-6">
        <Link href={"/minhas-solicitacoes" as Route} className="gi-button-secondary w-fit">
          <ArrowLeft className="h-4 w-4" aria-hidden={true} />
          Voltar
        </Link>
        <section className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700">
          {message || "Solicitação não encontrada."}
        </section>
      </main>
    );
  }

  const module = getModuleBySlug(request.module_slug);
  const hasFinalDocument = request.final_document_text.trim() || request.final_document_url.trim();

  return (
    <main className="space-y-6">
      <section className="gi-panel overflow-hidden">
        <div className="border-t-4 border-gi-gold p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link
                href={"/minhas-solicitacoes" as Route}
                className="gi-button-secondary mb-4 w-fit"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden={true} />
                Voltar às minhas solicitações
              </Link>
              <p className="gi-eyebrow">{request.protocol_number}</p>
              <h1 className="mt-2 text-2xl font-semibold text-gi-ink">{request.title}</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-gi-muted">
                Acompanhamento da solicitação vinculada ao módulo {module.name}. Esta área exibe
                apenas informações públicas ao solicitante, sem notas internas ou registros
                administrativos reservados.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <PriorityBadge priority={request.priority} />
              <StatusBadge status={request.status} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="gi-panel p-5">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gi-gold" aria-hidden={true} />
              <h2 className="text-base font-semibold text-gi-ink">Resumo da solicitação</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <InfoLine label="Protocolo" value={request.protocol_number} />
              <InfoLine label="Módulo" value={module.name} />
              <InfoLine label="Status" value={publicStatusText(request.status)} />
              <InfoLine label="Prioridade" value={publicPriorityText(request.priority)} />
              <InfoLine label="Criada em" value={formatDateTime(request.created_at)} />
              <InfoLine label="Atualizada em" value={formatDateTime(request.updated_at)} />
            </div>
          </section>

          <section className="gi-panel p-5">
            <h2 className="text-base font-semibold text-gi-ink">Dados enviados</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <InfoLine label="Solicitante" value={request.requester_name} />
              <InfoLine label="E-mail" value={request.requester_email} />
              <InfoLine label="Telefone" value={request.requester_phone || "Não informado"} />
              <InfoLine label="Setor/unidade solicitante" value={request.requester_department} />
            </div>
          </section>

          <DocumentAttachmentsPanel
            requestId={request.id}
            allowUpload={true}
            title="Documentos anexos"
            description="Documentos de apoio vinculados à sua solicitação. Inclua complementações úteis quando houver necessidade de reforçar a análise."
          />

          <DocumentRequestPendingItemsPanel requestId={request.id} />

          <section className="gi-panel p-5">
            <h2 className="text-base font-semibold text-gi-ink">Campos estruturados enviados</h2>
            <StructuredFields request={request} />
          </section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <RequesterPublicMessagesPanel
            requestId={request.id}
            fallbackMessages={request.public_messages}
          />

          <section className="gi-panel p-5">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-gi-gold" aria-hidden={true} />
              <h2 className="text-base font-semibold text-gi-ink">Documento final</h2>
            </div>

            {hasFinalDocument ? (
              <div className="mt-4 space-y-4">
                <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">
                  Documento final disponível.
                </p>
                {request.final_document_text.trim() ? (
                  <div className="max-h-[34rem] overflow-auto whitespace-pre-wrap rounded-md border border-gi-line bg-gi-background p-4 text-sm leading-6 text-gi-ink">
                    {request.final_document_text}
                  </div>
                ) : null}
                {request.final_document_url.trim() ? (
                  <a
                    href={request.final_document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="gi-button-assisted w-fit"
                  >
                    Abrir documento final
                    <ExternalLink className="h-4 w-4" aria-hidden={true} />
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 rounded-md border border-gi-line bg-gi-background p-3 text-sm leading-6 text-gi-muted">
                O documento final ainda não está disponível.
              </p>
            )}
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

function StructuredFields({ request }: { request: RequesterDocumentRequestDetail }) {
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
    return items.length
      ? items.map((item, index) => `${index + 1}. ${item}`).join("\n")
      : "Não informado";
  }

  if (typeof value === "boolean") {
    return value ? "Sim" : "Não";
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return "Não informado";
}

function publicStatusText(status: RequesterDocumentRequestDetail["status"]) {
  const labels: Record<RequesterDocumentRequestDetail["status"], string> = {
    recebido: "Recebida",
    em_analise: "Em análise",
    aguardando_documentos: "Aguardando complementação",
    em_producao: "Em produção",
    em_revisao: "Em revisão",
    concluido: "Concluída",
    cancelado: "Cancelada"
  };

  return labels[status];
}

function publicPriorityText(priority: RequesterDocumentRequestDetail["priority"]) {
  const labels: Record<RequesterDocumentRequestDetail["priority"], string> = {
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
