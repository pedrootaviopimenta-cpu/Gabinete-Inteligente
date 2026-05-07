import Link from "next/link";
import { ModuleCard } from "@/components/module-card";
import { HumanReviewNotice } from "@/components/human-review-notice";
import { modules } from "@/lib/modules";
import { Activity, ArrowRight, FileCheck2, Landmark, ShieldCheck } from "lucide-react";

const indicators = [
  {
    label: "Solicitações recebidas",
    value: "0",
    icon: FileCheck2
  },
  {
    label: "Modo de atendimento",
    value: "Assistido",
    icon: Activity
  },
  {
    label: "Revisão humana",
    value: "Obrigatória",
    icon: ShieldCheck
  }
];

const workflow = [
  {
    label: "Recebimento",
    text: "O solicitante preenche o formulário estruturado e recebe protocolo interno."
  },
  {
    label: "Triagem",
    text: "A equipe administrativa analisa prioridade, módulo, campos e pendências documentais."
  },
  {
    label: "Produção assistida",
    text: "O texto final é produzido e revisado por pessoa ou autoridade competente."
  }
];

export default function DashboardPage() {
  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-lg border border-gi-navy bg-gi-navy shadow-premium">
        <div className="relative p-6 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gi-gold" aria-hidden="true" />
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-gi-gold">
              Plataforma institucional para municípios
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Gabinete Inteligente
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/82">
              Apoio administrativo, documental e jurídico para gestão pública municipal.
            </p>
            <p className="mt-4 max-w-4xl text-sm leading-6 text-white/70">
              O produto organiza solicitações, preserva contexto estruturado e apoia gabinetes,
              secretarias, procuradorias e controladorias com fluxo assistido, protocolo interno
              e revisão humana obrigatória.
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
              Ver solicitações
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {indicators.map((indicator) => {
          const Icon = indicator.icon;

          return (
            <div key={indicator.label} className="gi-panel p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gi-muted">{indicator.label}</p>
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-gi-gold/30 bg-gi-gold/10 text-gi-navy">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-semibold text-gi-ink">{indicator.value}</p>
            </div>
          );
        })}
      </section>

      <HumanReviewNotice />

      <section className="gi-panel p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="gi-eyebrow">Modo Assistido</p>
            <h2 className="mt-2 text-2xl font-semibold text-gi-ink">
              Produção documental assistida
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gi-muted">
              O GI inicia pelo fluxo assistido: os formulários organizam a solicitação,
              preservam o contexto estruturado e encaminham o pedido para análise e produção
              humana. A geração automática por IA permanece preparada para etapa futura, sem
              exposição ao cliente neste modo.
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-gi-gold/30 bg-gi-gold/10 text-gi-navy">
            <Landmark className="h-6 w-6" aria-hidden={true} />
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {workflow.map((item) => (
            <div key={item.label} className="rounded-md border border-gi-line bg-gi-background p-4">
              <h3 className="text-sm font-semibold text-gi-ink">{item.label}</h3>
              <p className="mt-2 text-sm leading-6 text-gi-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="gi-eyebrow">Módulos de atendimento</p>
            <h2 className="mt-2 text-2xl font-semibold text-gi-ink">Áreas do Gabinete Inteligente</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-gi-muted">
              Cada módulo preserva formulário próprio, contexto estruturado e fluxo de revisão
              humana antes de qualquer uso oficial.
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
