import { LockKeyhole } from "lucide-react";
import {
  documentRequestPriorityLabels,
  documentRequestStatusLabels,
  type DocumentRequestPriority,
  type DocumentRequestStatus
} from "@/lib/document-request-types";

export const ADMIN_COMPLETION_NOTICE =
  "A conclusão da solicitação não representa emissão automática de parecer, decisão administrativa ou documento oficial. A entrega final deve ser revisada e validada por profissional ou autoridade competente.";

export const CONFIDENTIAL_CONTENT_NOTICE =
  "Conteúdo confidencial. Uso restrito a usuários autorizados.";

export const statusBadgeClasses: Record<DocumentRequestStatus, string> = {
  recebido: "border-gi-gold/35 bg-gi-gold/10 text-gi-navy",
  em_analise: "border-gi-navy/20 bg-gi-navy/5 text-gi-navy",
  aguardando_documentos: "border-amber-200 bg-amber-50 text-amber-900",
  em_producao: "border-gi-gold/45 bg-gi-gold/15 text-gi-navy",
  em_revisao: "border-gi-line bg-gi-background text-gi-ink",
  concluido: "border-emerald-200 bg-emerald-50 text-emerald-900",
  cancelado: "border-rose-200 bg-rose-50 text-rose-900"
};

export const priorityBadgeClasses: Record<DocumentRequestPriority, string> = {
  baixa: "border-gi-line bg-gi-background text-gi-muted",
  normal: "border-gi-navy/15 bg-gi-navy/5 text-gi-navy",
  alta: "border-gi-gold/40 bg-gi-gold/10 text-gi-navy",
  urgente: "border-rose-200 bg-rose-50 text-rose-900"
};

export function StatusBadge({ status }: { status: DocumentRequestStatus }) {
  return (
    <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${statusBadgeClasses[status]}`}>
      {documentRequestStatusLabels[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: DocumentRequestPriority }) {
  return (
    <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${priorityBadgeClasses[priority]}`}>
      {documentRequestPriorityLabels[priority]}
    </span>
  );
}

export function ConfidentialNotice() {
  return (
    <section className="rounded-md border border-gi-navy/15 bg-gi-navy/5 p-4 text-sm leading-6 text-gi-ink">
      <div className="flex items-start gap-3">
        <LockKeyhole className="mt-0.5 h-4 w-4 flex-none text-gi-gold" aria-hidden={true} />
        <p>{CONFIDENTIAL_CONTENT_NOTICE}</p>
      </div>
    </section>
  );
}
