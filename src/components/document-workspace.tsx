import { StructuredDocumentWorkspace } from "@/components/structured-document-workspace";
import type { GiModule } from "@/lib/modules";

export function DocumentWorkspace({ module }: { module: GiModule }) {
  return <StructuredDocumentWorkspace module={module} />;
}
