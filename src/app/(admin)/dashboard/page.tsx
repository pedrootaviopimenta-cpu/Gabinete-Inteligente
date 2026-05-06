import { ModuleCard } from "@/components/module-card";
import { HumanReviewNotice } from "@/components/human-review-notice";
import { modules } from "@/lib/modules";
import { Activity, FileCheck2, ShieldCheck } from "lucide-react";

const indicators = [
  {
    label: "Minutas em revisão",
    value: "0",
    icon: FileCheck2,
    tone: "text-gi-teal"
  },
  {
    label: "Gerações auditáveis",
    value: "0",
    icon: Activity,
    tone: "text-gi-amber"
  },
  {
    label: "Alertas institucionais",
    value: "Ativo",
    icon: ShieldCheck,
    tone: "text-gi-rose"
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

      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gi-ink">Painel Administrativo</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-gi-muted">
              Ambiente inicial para producao assistida, organizacao normativa e controle de
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
