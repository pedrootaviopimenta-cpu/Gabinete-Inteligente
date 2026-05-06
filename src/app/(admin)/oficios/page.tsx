import { DocumentWorkspace } from "@/components/document-workspace";
import { getModuleBySlug } from "@/lib/modules";

export default function OficiosPage() {
  const module = getModuleBySlug("oficios");

  return <DocumentWorkspace module={module} />;
}
