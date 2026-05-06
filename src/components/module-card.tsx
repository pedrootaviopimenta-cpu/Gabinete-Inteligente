import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRight, FileText, Scale, ScrollText, ShieldCheck, SquareCheckBig } from "lucide-react";
import type { GiModule, ModuleSlug } from "@/lib/modules";

const icons: Record<ModuleSlug, ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  oficios: FileText,
  "ministerio-publico": ShieldCheck,
  pareceres: Scale,
  "normas-municipais": ScrollText,
  checklists: SquareCheckBig
};

export function ModuleCard({ module }: { module: GiModule }) {
  const Icon = icons[module.slug];

  return (
    <Link
      href={module.href}
      className="group relative block overflow-hidden rounded-lg border border-gi-line bg-gi-white p-5 shadow-panel transition hover:-translate-y-0.5 hover:border-gi-gold/70 hover:shadow-premium gi-focus-ring"
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-gi-gold" aria-hidden="true" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="gi-eyebrow">
            {module.area}
          </p>
          <h2 className="mt-2 text-lg font-semibold text-gi-ink">{module.name}</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-md border border-gi-gold/30 bg-gi-gold/10 text-gi-navy">
          <Icon className="h-5 w-5" aria-hidden={true} />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-gi-muted">{module.description}</p>
      <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-gi-line bg-white px-3 py-2 text-sm font-semibold text-gi-navy transition group-hover:border-gi-gold group-hover:bg-gi-gold/10">
        <span>Acessar módulo</span>
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
      </div>
    </Link>
  );
}
