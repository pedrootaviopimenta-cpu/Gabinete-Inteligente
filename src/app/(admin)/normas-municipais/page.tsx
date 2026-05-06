import { DocumentWorkspace } from "@/components/document-workspace";
import { getModuleBySlug } from "@/lib/modules";
import { BookMarked } from "lucide-react";

export default function NormasMunicipaisPage() {
  const module = getModuleBySlug("normas-municipais");

  return (
    <div className="space-y-6">
      <DocumentWorkspace module={module} />

      <section className="rounded-lg border border-gi-line bg-white p-5 shadow-panel">
        <div className="flex items-start gap-3">
          <BookMarked className="mt-1 h-5 w-5 text-gi-teal" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold text-gi-ink">Catalogacao normativa</h2>
            <p className="mt-2 text-sm leading-6 text-gi-muted">
              A estrutura de dados ja preve especie normativa, numero, ano, ementa, tema,
              vigencia, fonte e conteudo em Markdown. A busca semantica e os vinculos de
              revogacao podem ser adicionados em etapa posterior.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
