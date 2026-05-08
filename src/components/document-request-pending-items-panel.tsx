"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, FileUp, Plus, Save } from "lucide-react";
import {
  documentRequestPendingItemStatusLabels,
  documentRequestPendingItemStatuses,
  type DocumentRequestPendingItem,
  type DocumentRequestPendingItemStatus
} from "@/lib/document-request-pending-item-types";

type PendingItemsPayload = {
  pendingItems?: DocumentRequestPendingItem[];
  pendingItem?: DocumentRequestPendingItem;
  message?: string;
  error?: string;
};

const examplePendingItems = [
  "Cópia integral do ofício recebido.",
  "Relatório técnico da secretaria.",
  "Manifestação do Controle Interno.",
  "Informação do setor de licitação.",
  "Legislação municipal aplicável.",
  "Despacho da autoridade competente."
];

export function DocumentRequestPendingItemsPanel({
  requestId,
  canManage = false
}: {
  requestId: string;
  canManage?: boolean;
}) {
  const [items, setItems] = useState<DocumentRequestPendingItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingDescriptions, setEditingDescriptions] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hasOpenPendingItems = useMemo(
    () => items.some((item) => item.status === "pendente" || item.status === "enviado"),
    [items]
  );

  useEffect(() => {
    void loadPendingItems();
  }, [requestId]);

  async function loadPendingItems() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/document-requests/${requestId}/pending-items`, {
        cache: "no-store"
      });
      const payload = (await response.json()) as PendingItemsPayload;

      if (!response.ok) {
        setItems([]);
        setError(payload.error || "Não foi possível carregar as pendências documentais.");
        return;
      }

      const nextItems = payload.pendingItems || [];
      setItems(nextItems);
      setEditingDescriptions(
        Object.fromEntries(nextItems.map((item) => [item.id, item.description]))
      );
    } catch {
      setItems([]);
      setError("Não foi possível carregar as pendências documentais.");
    } finally {
      setIsLoading(false);
    }
  }

  async function addPendingItem() {
    if (!title.trim()) {
      setError("Informe o título da pendência documental.");
      return;
    }

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/document-requests/${requestId}/pending-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description })
      });
      const payload = (await response.json()) as PendingItemsPayload;

      if (!response.ok || !payload.pendingItem) {
        setError(payload.error || "Não foi possível registrar a pendência documental.");
        return;
      }

      setItems((current) => [...current, payload.pendingItem as DocumentRequestPendingItem]);
      setEditingDescriptions((current) => ({
        ...current,
        [payload.pendingItem!.id]: payload.pendingItem!.description
      }));
      setTitle("");
      setDescription("");
      setMessage(
        payload.message ||
          "Pendência documental registrada. Avalie alterar o status para Aguardando documentos."
      );
    } catch {
      setError("Não foi possível registrar a pendência documental.");
    } finally {
      setIsSaving(false);
    }
  }

  async function updatePendingItem(
    item: DocumentRequestPendingItem,
    update: Partial<Pick<DocumentRequestPendingItem, "description" | "status">>
  ) {
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/document-requests/${requestId}/pending-items/${item.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update)
        }
      );
      const payload = (await response.json()) as PendingItemsPayload;

      if (!response.ok || !payload.pendingItem) {
        setError(payload.error || "Não foi possível atualizar a pendência documental.");
        return;
      }

      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id ? (payload.pendingItem as DocumentRequestPendingItem) : currentItem
        )
      );
      setEditingDescriptions((current) => ({
        ...current,
        [payload.pendingItem!.id]: payload.pendingItem!.description
      }));
      setMessage("Pendência documental atualizada.");
    } catch {
      setError("Não foi possível atualizar a pendência documental.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="gi-panel p-5">
      <div className="flex items-start gap-3">
        <ClipboardList className="mt-1 h-5 w-5 flex-none text-gi-gold" aria-hidden={true} />
        <div>
          <h2 className="text-base font-semibold text-gi-ink">Pendências documentais</h2>
          <p className="mt-2 text-sm leading-6 text-gi-muted">
            Controle documentos e informações faltantes para conclusão segura da solicitação.
          </p>
        </div>
      </div>

      {hasOpenPendingItems && canManage ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
          Há pendência aberta. Avalie alterar o status da solicitação para “Aguardando documentos”
          na área de gestão interna.
        </p>
      ) : null}

      {canManage ? (
        <div className="mt-5 rounded-md border border-gi-line bg-gi-background p-4">
          <h3 className="text-sm font-semibold text-gi-ink">Adicionar pendência</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-gi-ink md:col-span-2">
              Título
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="gi-input bg-white"
                placeholder="Ex.: Cópia integral do ofício recebido"
              />
            </label>
            <label className="block text-sm font-medium text-gi-ink md:col-span-2">
              Descrição
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="gi-input resize-y bg-white"
                placeholder="Descreva o documento, setor responsável ou informação necessária."
              />
            </label>
          </div>
          <button
            type="button"
            onClick={() => void addPendingItem()}
            disabled={isSaving}
            className="gi-button-assisted mt-4"
          >
            <Plus className="h-4 w-4" aria-hidden={true} />
            {isSaving ? "Salvando" : "Adicionar pendência"}
          </button>
          <p className="mt-3 text-xs leading-5 text-gi-muted">
            Exemplos: {examplePendingItems.join(" ")}
          </p>
        </div>
      ) : null}

      {message ? (
        <p className="mt-4 rounded-md border border-gi-gold/35 bg-gi-gold/10 p-3 text-sm leading-6 text-gi-ink">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <p className="rounded-md border border-gi-line bg-gi-background p-4 text-sm leading-6 text-gi-muted">
            Carregando pendências documentais...
          </p>
        ) : items.length ? (
          items.map((item) => (
            <article key={item.id} className="rounded-md border border-gi-line bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gi-ink">{item.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-gi-muted">
                    Criada em {formatDateTime(item.created_at)}
                    {item.resolved_at ? ` · resolvida/baixada em ${formatDateTime(item.resolved_at)}` : ""}
                  </p>
                </div>
                <PendingStatusBadge status={item.status} />
              </div>

              {canManage ? (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={editingDescriptions[item.id] || ""}
                    onChange={(event) =>
                      setEditingDescriptions((current) => ({
                        ...current,
                        [item.id]: event.target.value
                      }))
                    }
                    rows={3}
                    className="gi-input resize-y"
                    placeholder="Descrição da pendência"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void updatePendingItem(item, {
                          description: editingDescriptions[item.id] || ""
                        })
                      }
                      disabled={isSaving}
                      className="gi-button-secondary h-9 px-3"
                    >
                      <Save className="h-4 w-4" aria-hidden={true} />
                      Salvar descrição
                    </button>
                    {documentRequestPendingItemStatuses.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => void updatePendingItem(item, { status })}
                        disabled={isSaving || item.status === status}
                        className="gi-button-secondary h-9 px-3 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {documentRequestPendingItemStatusLabels[status]}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-md border border-gi-line bg-gi-background p-3">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-gi-ink">
                    {item.description || "Sem descrição complementar."}
                  </p>
                  {(item.status === "pendente" || item.status === "enviado") ? (
                    <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-gi-muted">
                      <FileUp className="mt-0.5 h-4 w-4 flex-none text-gi-gold" aria-hidden={true} />
                      Anexe o documento relacionado na seção “Documentos anexos” desta solicitação.
                    </p>
                  ) : null}
                </div>
              )}
            </article>
          ))
        ) : (
          <p className="rounded-md border border-gi-line bg-gi-background p-4 text-sm leading-6 text-gi-muted">
            Nenhuma pendência documental registrada para esta solicitação.
          </p>
        )}
      </div>
    </section>
  );
}

function PendingStatusBadge({ status }: { status: DocumentRequestPendingItemStatus }) {
  const classes: Record<DocumentRequestPendingItemStatus, string> = {
    pendente: "border-amber-200 bg-amber-50 text-amber-900",
    enviado: "border-gi-gold/35 bg-gi-gold/10 text-gi-navy",
    dispensado: "border-gi-line bg-gi-background text-gi-muted",
    resolvido: "border-emerald-200 bg-emerald-50 text-emerald-900"
  };

  return (
    <span className={`w-fit rounded-md border px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>
      {documentRequestPendingItemStatusLabels[status]}
    </span>
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
