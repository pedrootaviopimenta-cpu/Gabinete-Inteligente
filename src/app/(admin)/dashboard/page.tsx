import { ModuleCard } from "@/components/module-card";
import { HumanReviewNotice } from "@/components/human-review-notice";
import { modules } from "@/lib/modules";
import Link from "next/link";
import { Activity, ArrowRight, FileCheck2, ShieldCheck } from "lucide-react";

const indicators = [
  {
    label: "Solicitações recebidas",
    value: "0",
    icon: FileCheck2,
    tone: "text-gi-teal"
  },
  {
    label: "Modo de atendimento",
    value: "Assistido",
    icon: Activity,
    tone: "text-gi-amber"
  },
  {
    label: "Revisão humana",
    value: "Obrigatória",
    icon: ShieldCheck,
    tone: "text-gi-rose"
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
      <section className="grid gap-4 md:grid-cols-3">
        {indicators.map((indicator) => {
          const Icon = indicator.icon;

          return (
            <div
              key={indicator.label}
              className="rounded-lg border border-gi-line bg-white p-5 shadow-panel"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gi-muted">{indicator.label}</p>
                <Icon className={`h-5 w-5 ${indicator.tone}`} aria-hidden="true" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-gi-ink">{indicator.value}</p>
            </div>
          );
        })}
      </section>

      <HumanReviewNotice />

      <section className="rounded-lg border border-gi-line bg-white p-5 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gi-teal">
              Modo Assistido
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-gi-ink">
              Produção documental assistida
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gi-muted">
              O GI inicia pelo fluxo assistido: os formulários organizam a solicitação,
              preservam o contexto estruturado e encaminham o pedido para análise e produção
              humana. A geração automática por IA permanece preparada para etapa futura, sem
              exposição ao cliente neste modo.
            </p>
          </div>
          <Link
            href="/solicitacoes"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-gi-navy px-4 text-sm font-semibold text-white transition hover:bg-blue-950"
          >
            Abrir solicitações
            <ArrowRight className="h-4 w-4" aria-hidden={true} />
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {workflow.map((item) => (
            <div key={item.label} className="rounded-md border border-gi-line bg-slate-50 p-4">
              <h2 className="text-sm font-semibold text-gi-ink">{item.label}</h2>
              <p className="mt-2 text-sm leading-6 text-gi-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gi-ink">Painel Administrativo</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-gi-muted">
              Ambiente inicial para produção assistida, organização normativa e controle de
              rotinas documentais municipais.
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
