import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { GiModule } from "@/lib/modules";

export function ModuleCard({ module }: { module: GiModule }) {
  return (
    <Link
      href={module.href}
      className="group block rounded-lg border border-gi-line bg-white p-5 shadow-panel transition hover:-translate-y-0.5 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-gi-teal"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gi-muted">
            {module.area}
          </p>
          <h2 className="mt-2 text-lg font-semibold text-gi-ink">{module.name}</h2>
        </div>
        <span className={`h-3 w-3 rounded-full ${module.accent}`} aria-hidden="true" />
      </div>
      <p className="mt-4 text-sm leading-6 text-gi-muted">{module.description}</p>
      <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-gi-teal">
        <span>Acessar módulo</span>
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
      </div>
    </Link>
  );
}
