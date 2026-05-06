import { DocumentWorkspace } from "@/components/document-workspace";
import { getModuleBySlug } from "@/lib/modules";
import { BookMarked } from "lucide-react";

export default function NormasMunicipaisPage() {
  const module = getModuleBySlug("normas-municipais");

  return (
    <div className="space-y-6">
      <DocumentWorkspace module={module} />

      <section className="gi-panel p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md border border-gi-gold/30 bg-gi-gold/10 text-gi-navy">
            <BookMarked className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gi-ink">Catalogação normativa</h2>
            <p className="mt-2 text-sm leading-6 text-gi-muted">
              A estrutura de dados já prevê espécie normativa, número, ano, ementa, tema,
              vigência, fonte e conteúdo em Markdown. A busca semântica e os vínculos de
              revogação podem ser adicionados em etapa posterior.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
