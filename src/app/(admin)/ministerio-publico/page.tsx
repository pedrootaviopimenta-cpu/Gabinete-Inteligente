import { StructuredDocumentWorkspace } from "@/components/structured-document-workspace";
import { getModuleBySlug } from "@/lib/modules";

export default function MinisterioPublicoPage() {
  const module = getModuleBySlug("ministerio-publico");

  return <StructuredDocumentWorkspace module={module} />;
}
