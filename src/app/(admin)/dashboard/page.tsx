import Link from "next/link";
import type { ComponentType } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FolderClock,
  Landmark,
  ShieldCheck,
  TimerReset
} from "lucide-react";
import { ModuleCard } from "@/components/module-card";
import { HumanReviewNotice } from "@/components/human-review-notice";
import { PriorityBadge, StatusBadge } from "@/components/document-request-badges";
import { buildDashboardMetrics, type DashboardDistributionItem, type DashboardRequestSummary } from "@/lib/dashboard-metrics";
import { modules } from "@/lib/modules";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const metrics = await buildDashboardMetrics();
  const indicators = [
    {
      label: "Solicitações recebidas no mês",
      value: String(metrics.receivedThisMonth),
      icon: FileCheck2
    },
    {
      label: "Demandas pendentes",
      value: String(metrics.pending),
      icon: FolderClock
    },
    {
      label: "Em análise",
      value: String(metrics.inAnalysis),
      icon: Activity
    },
    {
      label: "Aguardando documentos",
      value: String(metrics.awaitingDocuments),
      icon: AlertTriangle
    },
    {
      label: "Em produção",
      value: String(metrics.inProduction),
      icon: Landmark
    },
    {
      label: "Concluídas",
      value: String(metrics.completed),
      icon: CheckCircle2
    },
    {
      label: "Solicitações urgentes",
      value: String(metrics.urgent),
      icon: ShieldCheck
    },
    {
      label: "Solicitações vencidas",
      value: String(metrics.overdue),
      icon: AlertTriangle
    },
    {
      label: "Vencendo em até 3 dias",
      value: String(metrics.dueSoon),
      icon: Clock3
    },
    {
      label: "Solicitações sem prazo",
      value: String(metrics.noDeadline),
      icon: FolderClock
    },
    {
      label: "Tempo médio de conclusão",
      value: formatAverageCompletion(metrics.averageCompletionDays),
      icon: TimerReset
    }
  ];

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-lg border border-gi-navy bg-gi-navy shadow-premium">
        <div className="relative p-6 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gi-gold" aria-hidden="true" />
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-gi-gold">
              Governança documental
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Gabinete Inteligente
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/82">
              Apoio administrativo, documental e jurídico para gestão pública municipal.
            </p>
            <p className="mt-4 max-w-4xl text-sm leading-6 text-white/70">
              Acompanhe a fila de trabalho, identifique demandas críticas, monitore pendências e
              preserve rastreabilidade institucional em solicitações documentais assistidas.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/oficios" className="gi-button-assisted">
              Iniciar solicitação
              <ArrowRight className="h-4 w-4" aria-hidden={true} />
            </Link>
            <Link
              href="/admin/solicitacoes"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:border-gi-gold hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-gi-gold focus:ring-offset-2 focus:ring-offset-gi-navy"
            >
              Ver fila de trabalho
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {indicators.map((indicator) => (
          <MetricCard
            key={indicator.label}
            label={indicator.label}
            value={indicator.value}
            icon={indicator.icon}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <DistributionPanel
          title="Solicitações por módulo"
          eyebrow="Produção assistida"
          items={metrics.byModule}
        />
        <DistributionPanel
          title="Solicitações por status"
          eyebrow="Fila de trabalho"
          items={metrics.byStatus}
        />
        <DistributionPanel
          title="Solicitações por prioridade"
          eyebrow="Demandas críticas"
          items={metrics.byPriority}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <RequestListPanel
          title="Últimas solicitações recebidas"
          eyebrow="Conclusões recentes e novos protocolos"
          emptyText="Nenhuma solicitação registrada até o momento."
          requests={metrics.latestRequests}
        />
        <RequestListPanel
          title="Próximas demandas críticas"
          eyebrow="Atenção gerencial"
          emptyText="Nenhuma demanda crítica aberta no momento."
          requests={metrics.criticalDemands}
        />
      </section>

      <HumanReviewNotice />

      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="gi-eyebrow">Módulos de atendimento</p>
            <h2 className="mt-2 text-2xl font-semibold text-gi-ink">
              Áreas do Gabinete Inteligente
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-gi-muted">
              Cada módulo preserva formulário próprio, contexto estruturado, anexos, mensagens,
              pendências documentais e fluxo de revisão humana antes de qualquer uso oficial.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {modules.map((module) => (
            <ModuleCard key={module.slug} module={module} />
          ))}
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <div className="gi-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gi-muted">{label}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-gi-gold/30 bg-gi-gold/10 text-gi-navy">
          <Icon className="h-5 w-5" aria-hidden={true} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold text-gi-ink">{value}</p>
    </div>
  );
}

function DistributionPanel({
  title,
  eyebrow,
  items
}: {
  title: string;
  eyebrow: string;
  items: DashboardDistributionItem[];
}) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="gi-panel p-5">
      <div className="flex items-start gap-3">
        <BarChart3 className="mt-1 h-5 w-5 flex-none text-gi-gold" aria-hidden={true} />
        <div>
          <p className="gi-eyebrow">{eyebrow}</p>
          <h2 className="mt-1 text-base font-semibold text-gi-ink">{title}</h2>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {items.map((item) => {
          const percent = total ? Math.round((item.count / total) * 100) : 0;

          return (
            <div key={item.key}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-gi-ink">{item.label}</span>
                <span className="text-gi-muted">{item.count}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gi-background">
                <div
                  className="h-full rounded-full bg-gi-gold"
                  style={{ width: `${percent}%` }}
                  aria-hidden={true}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RequestListPanel({
  title,
  eyebrow,
  emptyText,
  requests
}: {
  title: string;
  eyebrow: string;
  emptyText: string;
  requests: DashboardRequestSummary[];
}) {
  return (
    <section className="gi-panel p-5">
      <div className="flex items-start gap-3">
        <Clock3 className="mt-1 h-5 w-5 flex-none text-gi-gold" aria-hidden={true} />
        <div>
          <p className="gi-eyebrow">{eyebrow}</p>
          <h2 className="mt-1 text-base font-semibold text-gi-ink">{title}</h2>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {requests.length ? (
          requests.map((request) => (
            <article
              key={request.id}
              className="rounded-md border border-gi-line bg-gi-background p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gi-muted">
                    {request.protocolNumber} · {request.moduleName}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-gi-ink">{request.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-gi-muted">
                    {request.requesterName} · {request.requesterDepartment}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <PriorityBadge priority={request.priority} />
                  <StatusBadge status={request.status} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs leading-5 text-gi-muted">
                  Criada em {formatDateTime(request.createdAt)}
                </p>
                <Link
                  href={`/admin/solicitacoes/${request.id}`}
                  className="text-xs font-semibold text-gi-navy underline decoration-gi-gold decoration-2 underline-offset-4"
                >
                  Abrir solicitação
                </Link>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-md border border-gi-line bg-gi-background p-4 text-sm leading-6 text-gi-muted">
            {emptyText}
          </p>
        )}
      </div>
    </section>
  );
}

function formatAverageCompletion(value: number | null) {
  if (value === null) {
    return "Sem dados";
  }

  if (value === 0) {
    return "Mesmo dia";
  }

  return `${value.toLocaleString("pt-BR")} ${value === 1 ? "dia" : "dias"}`;
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
