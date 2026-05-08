import type { DocumentRequest } from "@/lib/document-request-types";

export type DeadlineFilter = "overdue" | "due_soon" | "no_deadline";

export type DeadlineStatus = "no_prazo" | "vence_hoje" | "proximo_vencimento" | "vencido" | "concluido" | "sem_prazo";

export const deadlineStatusLabels: Record<DeadlineStatus, string> = {
  no_prazo: "No prazo",
  vence_hoje: "Vence hoje",
  proximo_vencimento: "Próximo do vencimento",
  vencido: "Vencido",
  concluido: "Concluído",
  sem_prazo: "Sem prazo"
};

const closedStatuses = ["concluido", "cancelado"];

export function getDeadlineStatus(request: Pick<DocumentRequest, "status" | "due_date">): DeadlineStatus {
  if (request.status === "concluido") {
    return "concluido";
  }

  if (!request.due_date) {
    return "sem_prazo";
  }

  const days = getDaysUntilDue(request.due_date);

  if (days === null) {
    return "sem_prazo";
  }

  if (days < 0) {
    return "vencido";
  }

  if (days === 0) {
    return "vence_hoje";
  }

  if (days <= 3) {
    return "proximo_vencimento";
  }

  return "no_prazo";
}

export function getDaysUntilDue(dueDate: string) {
  if (!dueDate) {
    return null;
  }

  const due = parseDateOnly(dueDate);

  if (!due) {
    return null;
  }

  const today = parseDateOnly(new Date().toISOString().slice(0, 10));

  if (!today) {
    return null;
  }

  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function matchesDeadlineFilter(request: DocumentRequest, filter?: DeadlineFilter) {
  if (!filter) {
    return true;
  }

  if (filter === "no_deadline") {
    return !request.due_date && !closedStatuses.includes(request.status);
  }

  const status = getDeadlineStatus(request);

  if (filter === "overdue") {
    return status === "vencido";
  }

  return status === "vence_hoje" || status === "proximo_vencimento";
}

export function parseDateFromAdministrativeText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const text = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const slashDate = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);

  if (slashDate) {
    const [, day, month, year] = slashDate;
    return `${year}-${month}-${day}`;
  }

  const isoDate = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  return isoDate ? isoDate[0] : "";
}

function parseDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
