import { StructuredDocumentWorkspace } from "@/components/structured-document-workspace";
import { getModuleBySlug } from "@/lib/modules";

export default function OficiosPage() {
  const module = getModuleBySlug("oficios");

  return <StructuredDocumentWorkspace module={module} />;
}
