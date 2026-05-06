import { DocumentWorkspace } from "@/components/document-workspace";
import { getModuleBySlug } from "@/lib/modules";

export default function PareceresPage() {
  const module = getModuleBySlug("pareceres");

  return <DocumentWorkspace module={module} />;
}
