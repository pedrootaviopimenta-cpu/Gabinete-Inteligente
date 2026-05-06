import { DocumentWorkspace } from "@/components/document-workspace";
import { getModuleBySlug } from "@/lib/modules";
import { CheckCircle2 } from "lucide-react";

const initialChecklist = [
  "Identificar unidade responsável e autoridade revisora.",
  "Conferir documentos essenciais e anexos informados.",
  "Registrar providências pendentes antes do encaminhamento.",
  "Submeter a minuta à revisão humana obrigatória."
];

export default function ChecklistsPage() {
  const module = getModuleBySlug("checklists");

  return (
    <div className="space-y-6">
      <DocumentWorkspace module={module} />

      <section className="gi-panel p-5">
        <h2 className="text-base font-semibold text-gi-ink">Checklist base</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {initialChecklist.map((item) => (
            <div key={item} className="flex min-h-14 items-start gap-3 rounded-md border border-gi-line bg-gi-background p-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-gi-gold" aria-hidden="true" />
              <span className="text-sm leading-5 text-gi-ink">{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
