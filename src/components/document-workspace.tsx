import { StructuredDocumentWorkspace } from "@/components/structured-document-workspace";
import type { GiModule } from "@/lib/modules";
import { getWorkspaceRuntimeConfig } from "@/lib/runtime-config";

export function DocumentWorkspace({ module }: { module: GiModule }) {
  return <StructuredDocumentWorkspace module={module} runtimeConfig={getWorkspaceRuntimeConfig()} />;
}
