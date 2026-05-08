import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  CreateMunicipalNormInput,
  MunicipalNorm,
  UpdateMunicipalNormInput
} from "@/lib/municipal-norm-types";

type MunicipalNormFilters = {
  query?: string;
  subject?: string;
};

const localDataDirectory = path.join(process.cwd(), ".local-data");
const localNormsFile = path.join(localDataDirectory, "municipal_norms.json");

export async function listMunicipalNorms(filters: MunicipalNormFilters = {}) {
  const supabase = createSupabaseAdminClient();

  if (supabase) {
    let query = supabase
      .from("municipal_norms")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.subject) {
      query = query.eq("subject", filters.subject);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return filterLocalNorms((data || []).map(normalizeMunicipalNorm), filters);
  }

  return filterLocalNorms(await readLocalNorms(), filters).sort((first, second) =>
    second.created_at.localeCompare(first.created_at)
  );
}

export async function getMunicipalNorm(id: string) {
  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("municipal_norms")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return null;
    }

    return normalizeMunicipalNorm(data);
  }

  const norms = await readLocalNorms();
  return norms.find((norm) => norm.id === id) || null;
}

export async function createMunicipalNorm(input: CreateMunicipalNormInput) {
  const now = new Date().toISOString();
  const norm: MunicipalNorm = {
    id: randomUUID(),
    ...sanitizeMunicipalNormInput(input),
    metadata: sanitizeMetadata(input.metadata || {}),
    created_at: now,
    updated_at: now
  };
  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const organizationId = await getDefaultOrganizationId();
    const { data, error } = await supabase
      .from("municipal_norms")
      .insert({ ...toDatabaseRow(norm), organization_id: organizationId })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizeMunicipalNorm(data);
  }

  const norms = await readLocalNorms();
  norms.unshift(norm);
  await writeLocalNorms(norms);
  return norm;
}

export async function updateMunicipalNorm(id: string, input: UpdateMunicipalNormInput) {
  const current = await getMunicipalNorm(id);

  if (!current) {
    return null;
  }

  const updated: MunicipalNorm = {
    ...current,
    ...sanitizeMunicipalNormInput({ ...current, ...input }),
    metadata: sanitizeMetadata(input.metadata || current.metadata),
    updated_at: new Date().toISOString()
  };
  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("municipal_norms")
      .update(toDatabaseRow(updated))
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizeMunicipalNorm(data);
  }

  const norms = await readLocalNorms();
  await writeLocalNorms(norms.map((norm) => (norm.id === id ? updated : norm)));
  return updated;
}

async function getDefaultOrganizationId() {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase.from("organizations").select("id").limit(1).maybeSingle();
  return data?.id || null;
}

async function readLocalNorms(): Promise<MunicipalNorm[]> {
  try {
    const content = await readFile(localNormsFile, "utf8");
    return JSON.parse(content) as MunicipalNorm[];
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeLocalNorms(norms: MunicipalNorm[]) {
  await mkdir(localDataDirectory, { recursive: true });
  await writeFile(localNormsFile, JSON.stringify(norms, null, 2), "utf8");
}

function filterLocalNorms(norms: MunicipalNorm[], filters: MunicipalNormFilters) {
  const normalizedQuery = normalizeSearch(filters.query || "");

  return norms.filter((norm) => {
    if (!normalizedQuery) {
      return true;
    }

    return normalizeSearch(
      [
        norm.norm_type,
        norm.number,
        norm.year,
        norm.title,
        norm.summary,
        norm.subject,
        norm.content_markdown
      ].join(" ")
    ).includes(normalizedQuery);
  });
}

function sanitizeMunicipalNormInput(input: UpdateMunicipalNormInput): CreateMunicipalNormInput {
  return {
    norm_type: trim(input.norm_type, 120),
    number: trim(input.number, 60),
    year: normalizeYear(input.year),
    title: trim(input.title, 300),
    summary: trim(input.summary, 4_000),
    subject: trim(input.subject, 160),
    source_url: trim(input.source_url, 2_048),
    published_at: normalizeDate(input.published_at),
    effective_from: normalizeDate(input.effective_from),
    revoked_at: normalizeDate(input.revoked_at),
    content_markdown: trim(input.content_markdown, 80_000),
    metadata: sanitizeMetadata(input.metadata || {})
  };
}

function toDatabaseRow(norm: MunicipalNorm) {
  return {
    norm_type: norm.norm_type,
    number: norm.number,
    year: norm.year,
    title: norm.title,
    summary: norm.summary,
    subject: norm.subject,
    source_url: norm.source_url,
    published_at: norm.published_at || null,
    effective_from: norm.effective_from || null,
    revoked_at: norm.revoked_at || null,
    content_markdown: norm.content_markdown,
    metadata: norm.metadata,
    updated_at: norm.updated_at
  };
}

function normalizeMunicipalNorm(row: Record<string, unknown>): MunicipalNorm {
  return {
    id: String(row.id || ""),
    norm_type: String(row.norm_type || ""),
    number: String(row.number || ""),
    year: typeof row.year === "number" ? row.year : normalizeYear(row.year),
    title: String(row.title || ""),
    summary: String(row.summary || ""),
    subject: String(row.subject || ""),
    source_url: String(row.source_url || ""),
    published_at: String(row.published_at || ""),
    effective_from: String(row.effective_from || ""),
    revoked_at: String(row.revoked_at || ""),
    content_markdown: String(row.content_markdown || ""),
    metadata: (row.metadata || {}) as Record<string, unknown>,
    created_at: String(row.created_at || ""),
    updated_at: String(row.updated_at || "")
  };
}

function sanitizeMetadata(metadata: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !["password", "secret", "token", "cookie", "authorization"].includes(key.toLowerCase()))
      .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 300) : value])
  );
}

function normalizeDate(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function normalizeYear(value: unknown) {
  const year = Number(value);

  if (!Number.isInteger(year) || year < 1800 || year > 2200) {
    return null;
  }

  return year;
}

function trim(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
