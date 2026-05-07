"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, FileText, Paperclip, Upload } from "lucide-react";
import {
  attachmentAcceptedInputTypes,
  formatAttachmentSize,
  isAllowedAttachmentMimeType,
  maxAttachmentSizeBytes,
  maxAttachmentsPerRequest,
  type DocumentRequestAttachment
} from "@/lib/attachment-constants";

type DocumentAttachmentsPanelProps = {
  requestId: string;
  allowUpload?: boolean;
  title?: string;
  description?: string;
};

type AttachmentsPayload = {
  attachments?: DocumentRequestAttachment[];
  error?: string;
  message?: string;
};

const supportText =
  "Anexe documentos úteis para análise da solicitação. Inclua ofícios, processos, relatórios, leis municipais, memorandos e demais elementos comprobatórios.";

export function DocumentAttachmentsPanel({
  requestId,
  allowUpload = false,
  title = "Documentos anexos",
  description = supportText
}: DocumentAttachmentsPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [attachments, setAttachments] = useState<DocumentRequestAttachment[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const remainingSlots = useMemo(
    () => Math.max(maxAttachmentsPerRequest - attachments.length, 0),
    [attachments.length]
  );

  useEffect(() => {
    void loadAttachments();
  }, [requestId]);

  async function loadAttachments() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/document-requests/${requestId}/attachments`, {
        cache: "no-store"
      });
      const payload = (await response.json()) as AttachmentsPayload;

      if (!response.ok) {
        setAttachments([]);
        setError(payload.error || "Não foi possível carregar os documentos anexos.");
        setIsLoading(false);
        return;
      }

      setAttachments(payload.attachments || []);
    } catch {
      setAttachments([]);
      setError("Não foi possível carregar os documentos anexos.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileSelection(files: FileList | null) {
    setError("");
    setMessage("");

    const nextFiles = Array.from(files || []);

    if (!nextFiles.length) {
      setSelectedFiles([]);
      return;
    }

    if (nextFiles.length > remainingSlots) {
      setSelectedFiles([]);
      setError("Limite de documentos anexos atingido.");
      return;
    }

    for (const file of nextFiles) {
      if (!isAllowedAttachmentMimeType(file.type)) {
        setSelectedFiles([]);
        setError("Tipo de arquivo não permitido.");
        return;
      }

      if (file.size > maxAttachmentSizeBytes) {
        setSelectedFiles([]);
        setError("Arquivo excede o limite permitido.");
        return;
      }
    }

    setSelectedFiles(nextFiles);
  }

  async function uploadSelectedFiles() {
    if (!selectedFiles.length) {
      setError("Selecione ao menos um documento para anexar.");
      return;
    }

    setIsUploading(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch(`/api/document-requests/${requestId}/attachments`, {
        method: "POST",
        body: formData
      });
      const payload = (await response.json()) as AttachmentsPayload;

      if (!response.ok) {
        setError(payload.error || "Não foi possível anexar o documento.");
        return;
      }

      setMessage(payload.message || "Documento anexado com segurança à solicitação.");
      setSelectedFiles([]);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      await loadAttachments();
    } catch {
      setError("Não foi possível anexar o documento.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="gi-panel p-5">
      <div className="flex items-start gap-3">
        <Paperclip className="mt-1 h-5 w-5 flex-none text-gi-gold" aria-hidden={true} />
        <div>
          <h2 className="text-base font-semibold text-gi-ink">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-gi-muted">{description}</p>
          <p className="mt-2 text-xs leading-5 text-gi-muted">
            Tipos permitidos: PDF, DOC, DOCX, PNG, JPEG, XLSX, CSV e TXT. Limite de 15 MB
            por arquivo e até 10 documentos por solicitação.
          </p>
        </div>
      </div>

      {allowUpload ? (
        <div className="mt-5 rounded-md border border-gi-line bg-gi-background p-4">
          <label className="block text-sm font-medium text-gi-ink">
            Selecionar documentos
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={attachmentAcceptedInputTypes}
              onChange={(event) => handleFileSelection(event.target.files)}
              className="mt-2 block w-full cursor-pointer rounded-md border border-gi-line bg-white text-sm text-gi-ink file:mr-4 file:border-0 file:bg-gi-navy file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gi-navy-light gi-focus-ring"
            />
          </label>

          {selectedFiles.length ? (
            <div className="mt-4 space-y-2">
              {selectedFiles.map((file) => (
                <div
                  key={`${file.name}-${file.size}`}
                  className="flex flex-col gap-1 rounded-md border border-gi-line bg-white p-3 text-sm text-gi-ink sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="break-words font-medium">{file.name}</span>
                  <span className="text-xs text-gi-muted">{formatAttachmentSize(file.size)}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void uploadSelectedFiles()}
              disabled={isUploading || !selectedFiles.length || remainingSlots <= 0}
              className="gi-button-assisted"
            >
              <Upload className="h-4 w-4" aria-hidden={true} />
              {isUploading ? "Anexando" : "Anexar documentos"}
            </button>
            <span className="text-xs leading-5 text-gi-muted">
              {remainingSlots} de {maxAttachmentsPerRequest} vagas disponíveis.
            </span>
          </div>
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
            Carregando documentos anexos...
          </p>
        ) : attachments.length ? (
          attachments.map((attachment) => (
            <article
              key={attachment.id}
              className="rounded-md border border-gi-line bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <FileText className="mt-1 h-4 w-4 flex-none text-gi-gold" aria-hidden={true} />
                  <div className="min-w-0">
                    <h3 className="break-words text-sm font-semibold text-gi-ink">
                      {attachment.file_name}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-gi-muted">
                      {attachment.file_type} · {formatAttachmentSize(attachment.file_size)} ·{" "}
                      {formatDateTime(attachment.created_at)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gi-muted">
                      Origem: solicitante ou usuário autorizado. Visibilidade: restrita.
                    </p>
                  </div>
                </div>
                <a
                  href={`/api/document-requests/${requestId}/attachments/${attachment.id}/download`}
                  className="gi-button-secondary w-fit"
                >
                  <Download className="h-4 w-4" aria-hidden={true} />
                  Baixar/abrir
                </a>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-md border border-gi-line bg-gi-background p-4 text-sm leading-6 text-gi-muted">
            Nenhum documento anexo registrado para esta solicitação.
          </p>
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
