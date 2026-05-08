export type MunicipalNorm = {
  id: string;
  norm_type: string;
  number: string;
  year: number | null;
  title: string;
  summary: string;
  subject: string;
  source_url: string;
  published_at: string;
  effective_from: string;
  revoked_at: string;
  content_markdown: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CreateMunicipalNormInput = {
  norm_type: string;
  number: string;
  year: number | null;
  title: string;
  summary: string;
  subject: string;
  source_url: string;
  published_at: string;
  effective_from: string;
  revoked_at: string;
  content_markdown: string;
  metadata?: Record<string, unknown>;
};

export type UpdateMunicipalNormInput = Partial<CreateMunicipalNormInput>;

export const municipalNormTypes = [
  "Lei Orgânica",
  "Lei Complementar",
  "Lei Ordinária",
  "Decreto",
  "Portaria",
  "Resolução",
  "Instrução Normativa",
  "Edital",
  "Outro"
] as const;

export function getMunicipalNormStatus(norm: Pick<MunicipalNorm, "revoked_at" | "effective_from">) {
  if (norm.revoked_at) {
    return "revogada";
  }

  if (norm.effective_from && new Date(norm.effective_from).getTime() > Date.now()) {
    return "vigencia_futura";
  }

  return "conferir_vigencia";
}

export const municipalNormStatusLabels = {
  revogada: "Revogada ou com revogação informada",
  vigencia_futura: "Vigência futura informada",
  conferir_vigencia: "Conferir vigência em fonte oficial"
};
