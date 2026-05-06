import { DocumentWorkspace } from "@/components/document-workspace";
import { getModuleBySlug } from "@/lib/modules";

export default function MinisterioPublicoPage() {
  const module = getModuleBySlug("ministerio-publico");

  return <DocumentWorkspace module={module} />;
}
