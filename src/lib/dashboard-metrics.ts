import { listDocumentRequests } from "@/lib/document-requests";
import { getDeadlineStatus } from "@/lib/deadlines";
import {
  documentRequestPriorities,
  documentRequestPriorityLabels,
  documentRequestStatuses,
  documentRequestStatusLabels,
  type DocumentRequest,
  type DocumentRequestPriority,
  type DocumentRequestStatus
} from "@/lib/document-request-types";
import { getModuleBySlug, modules, type ModuleSlug } from "@/lib/modules";

export type DashboardRequestSummary = {
  id: string;
  protocolNumber: string;
  title: string;
  moduleSlug: ModuleSlug;
  moduleName: string;
  requesterName: string;
  requesterDepartment: string;
  priority: DocumentRequestPriority;
  priorityLabel: string;
  status: DocumentRequestStatus;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardDistributionItem = {
  key: string;
  label: string;
  count: number;
};

export type DashboardMetrics = {
  receivedThisMonth: number;
  pending: number;
  inAnalysis: number;
  awaitingDocuments: number;
  inProduction: number;
  completed: number;
  urgent: number;
  overdue: number;
  dueSoon: number;
  noDeadline: number;
  averageCompletionDays: number | null;
  byModule: DashboardDistributionItem[];
  byStatus: DashboardDistributionItem[];
  byPriority: DashboardDistributionItem[];
  latestRequests: DashboardRequestSummary[];
  criticalDemands: DashboardRequestSummary[];
};

const inactiveStatuses: DocumentRequestStatus[] = ["concluido", "cancelado"];
const criticalPriorityWeight: Record<DocumentRequestPriority, number> = {
  urgente: 4,
  alta: 3,
  normal: 2,
  baixa: 1
};

export async function buildDashboardMetrics(): Promise<DashboardMetrics> {
  const requests = await listDocumentRequests();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const completedRequests = requests.filter((request) => request.status === "concluido");

  return {
    receivedThisMonth: requests.filter((request) =>
      isSameMonth(request.created_at, currentMonth, currentYear)
    ).length,
    pending: requests.filter((request) => !inactiveStatuses.includes(request.status)).length,
    inAnalysis: countByStatus(requests, "em_analise"),
    awaitingDocuments: countByStatus(requests, "aguardando_documentos"),
    inProduction: countByStatus(requests, "em_producao"),
    completed: completedRequests.length,
    urgent: requests.filter((request) => request.priority === "urgente").length,
    overdue: requests.filter((request) => getDeadlineStatus(request) === "vencido").length,
    dueSoon: requests.filter((request) =>
      ["vence_hoje", "proximo_vencimento"].includes(getDeadlineStatus(request))
    ).length,
    noDeadline: requests.filter((request) => getDeadlineStatus(request) === "sem_prazo").length,
    averageCompletionDays: calculateAverageCompletionDays(completedRequests),
    byModule: modules.map((module) => ({
      key: module.slug,
      label: module.name,
      count: requests.filter((request) => request.module_slug === module.slug).length
    })),
    byStatus: documentRequestStatuses.map((status) => ({
      key: status,
      label: documentRequestStatusLabels[status],
      count: countByStatus(requests, status)
    })),
    byPriority: documentRequestPriorities.map((priority) => ({
      key: priority,
      label: documentRequestPriorityLabels[priority],
      count: requests.filter((request) => request.priority === priority).length
    })),
    latestRequests: requests.slice(0, 5).map(toSummary),
    criticalDemands: requests
      .filter(isCriticalDemand)
      .sort(sortCriticalDemand)
      .slice(0, 5)
      .map(toSummary)
  };
}

function countByStatus(requests: DocumentRequest[], status: DocumentRequestStatus) {
  return requests.filter((request) => request.status === status).length;
}

function isSameMonth(value: string, month: number, year: number) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getMonth() === month && date.getFullYear() === year;
}

function calculateAverageCompletionDays(requests: DocumentRequest[]) {
  const durations = requests
    .map((request) => {
      const createdAt = new Date(request.created_at).getTime();
      const updatedAt = new Date(request.updated_at).getTime();

      if (Number.isNaN(createdAt) || Number.isNaN(updatedAt) || updatedAt < createdAt) {
        return null;
      }

      return updatedAt - createdAt;
    })
    .filter((duration): duration is number => duration !== null);

  if (!durations.length) {
    return null;
  }

  const averageMilliseconds =
    durations.reduce((total, duration) => total + duration, 0) / durations.length;
  const averageDays = averageMilliseconds / (1000 * 60 * 60 * 24);

  return Math.round(averageDays * 10) / 10;
}

function isCriticalDemand(request: DocumentRequest) {
  if (inactiveStatuses.includes(request.status)) {
    return false;
  }

  return (
    request.priority === "urgente" ||
    request.priority === "alta" ||
    request.status === "aguardando_documentos"
  );
}

function sortCriticalDemand(first: DocumentRequest, second: DocumentRequest) {
  const priorityDifference =
    criticalPriorityWeight[second.priority] - criticalPriorityWeight[first.priority];

  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  return first.created_at.localeCompare(second.created_at);
}

function toSummary(request: DocumentRequest): DashboardRequestSummary {
  const module = getModuleBySlug(request.module_slug);

  return {
    id: request.id,
    protocolNumber: request.protocol_number,
    title: request.title,
    moduleSlug: request.module_slug,
    moduleName: module.name,
    requesterName: request.requester_name,
    requesterDepartment: request.requester_department,
    priority: request.priority,
    priorityLabel: documentRequestPriorityLabels[request.priority],
    status: request.status,
    statusLabel: documentRequestStatusLabels[request.status],
    createdAt: request.created_at,
    updatedAt: request.updated_at
  };
}
