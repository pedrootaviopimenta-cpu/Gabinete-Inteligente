import type { ModuleSlug } from "@/lib/modules";

export type DocxExportPayload = {
  title: string;
  module: ModuleSlug;
  contentMarkdown: string;
  organizationName?: string;
  municipality?: string;
  generatedBy?: string;
  reviewedBy?: string;
  humanReviewRequired: true;
  metadata?: Record<string, string | number | boolean | null>;
};

export function buildDocxExportPayload(payload: Omit<DocxExportPayload, "humanReviewRequired">) {
  return {
    ...payload,
    humanReviewRequired: true as const
  };
}
