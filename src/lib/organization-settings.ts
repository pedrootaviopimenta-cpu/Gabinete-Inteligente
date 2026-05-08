import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  buildEmptyOrganizationSettings,
  organizationSettingFields,
  type OrganizationSettings,
  type UpdateOrganizationSettingsInput
} from "@/lib/organization-settings-types";

const localDataDirectory = path.join(process.cwd(), ".local-data");
const localSettingsFile = path.join(localDataDirectory, "organization_settings.json");

export async function getOrganizationSettings() {
  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("organization_settings")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? normalizeSettings(data) : buildEmptyOrganizationSettings();
  }

  return readLocalSettings();
}

export async function updateOrganizationSettings(input: UpdateOrganizationSettingsInput) {
  const current = await getOrganizationSettings();
  const now = new Date().toISOString();
  const nextSettings: OrganizationSettings = {
    ...current,
    id: current.id || randomUUID(),
    ...sanitizeSettings(input),
    updated_at: now,
    created_at: current.created_at || now
  };

  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const row = toDatabaseRow(nextSettings);

    if (current.id) {
      const { data, error } = await supabase
        .from("organization_settings")
        .update(row)
        .eq("id", current.id)
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return normalizeSettings(data);
    }

    const { data, error } = await supabase
      .from("organization_settings")
      .insert(row)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizeSettings(data);
  }

  await writeLocalSettings(nextSettings);
  return nextSettings;
}

async function readLocalSettings(): Promise<OrganizationSettings> {
  try {
    const content = await readFile(localSettingsFile, "utf8");
    return normalizeSettings(JSON.parse(content) as Record<string, unknown>);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return buildEmptyOrganizationSettings();
    }

    throw error;
  }
}

async function writeLocalSettings(settings: OrganizationSettings) {
  await mkdir(localDataDirectory, { recursive: true });
  await writeFile(localSettingsFile, JSON.stringify(settings, null, 2), "utf8");
}

function sanitizeSettings(input: UpdateOrganizationSettingsInput): UpdateOrganizationSettingsInput {
  return Object.fromEntries(
    organizationSettingFields.map((field) => {
      const limit = field === "header_text" || field === "footer_text" ? 2_000 : 300;
      return [field, sanitizeText(input[field], limit)];
    })
  ) as UpdateOrganizationSettingsInput;
}

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function toDatabaseRow(settings: OrganizationSettings) {
  return {
    id: settings.id,
    organization_name: settings.organization_name,
    city: settings.city,
    state: settings.state,
    cnpj: settings.cnpj,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    website: settings.website,
    mayor_name: settings.mayor_name,
    attorney_name: settings.attorney_name,
    default_secretary_name: settings.default_secretary_name,
    header_text: settings.header_text,
    footer_text: settings.footer_text,
    logo_url: settings.logo_url,
    created_at: settings.created_at,
    updated_at: settings.updated_at
  };
}

function normalizeSettings(row: Record<string, unknown>): OrganizationSettings {
  return {
    id: String(row.id || ""),
    organization_name: String(row.organization_name || ""),
    city: String(row.city || ""),
    state: String(row.state || ""),
    cnpj: String(row.cnpj || ""),
    address: String(row.address || ""),
    phone: String(row.phone || ""),
    email: String(row.email || ""),
    website: String(row.website || ""),
    mayor_name: String(row.mayor_name || ""),
    attorney_name: String(row.attorney_name || ""),
    default_secretary_name: String(row.default_secretary_name || ""),
    header_text: String(row.header_text || ""),
    footer_text: String(row.footer_text || ""),
    logo_url: String(row.logo_url || ""),
    created_at: String(row.created_at || ""),
    updated_at: String(row.updated_at || "")
  };
}
