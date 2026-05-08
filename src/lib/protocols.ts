import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ModuleSlug } from "@/lib/modules";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ProtocolSequence = {
  id: string;
  prefix: string;
  year: number;
  current_value: number;
  updated_at: string;
};

const localDataDirectory = path.join(process.cwd(), ".local-data");
const localProtocolFile = path.join(localDataDirectory, "protocol_sequences.json");

const moduleProtocolPrefixes: Record<ModuleSlug, string> = {
  oficios: "GI-OF",
  "ministerio-publico": "GI-MP",
  pareceres: "GI-PA",
  "normas-municipais": "GI-NM",
  checklists: "GI-CK"
};

export async function createSequentialProtocol(moduleSlug: ModuleSlug, date = new Date()) {
  const prefix = moduleProtocolPrefixes[moduleSlug] || "GI";
  const year = date.getFullYear();
  const nextValue = await nextProtocolSequence(prefix, year);

  return `${prefix}-${year}-${String(nextValue).padStart(6, "0")}`;
}

async function nextProtocolSequence(prefix: string, year: number) {
  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const { data: current, error } = await supabase
      .from("protocol_sequences")
      .select("*")
      .eq("prefix", prefix)
      .eq("year", year)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    const nextValue = Number(current?.current_value || 0) + 1;
    const payload = {
      id: current?.id || randomUUID(),
      prefix,
      year,
      current_value: nextValue,
      updated_at: new Date().toISOString()
    };
    const { error: upsertError } = await supabase
      .from("protocol_sequences")
      .upsert(payload, { onConflict: "prefix,year" });

    if (upsertError) {
      throw new Error(upsertError.message);
    }

    return nextValue;
  }

  const sequences = await readLocalSequences();
  const current = sequences.find((sequence) => sequence.prefix === prefix && sequence.year === year);

  if (current) {
    current.current_value += 1;
    current.updated_at = new Date().toISOString();
    await writeLocalSequences(sequences);
    return current.current_value;
  }

  const sequence: ProtocolSequence = {
    id: randomUUID(),
    prefix,
    year,
    current_value: 1,
    updated_at: new Date().toISOString()
  };
  sequences.push(sequence);
  await writeLocalSequences(sequences);
  return sequence.current_value;
}

async function readLocalSequences(): Promise<ProtocolSequence[]> {
  try {
    const content = await readFile(localProtocolFile, "utf8");
    return JSON.parse(content) as ProtocolSequence[];
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeLocalSequences(sequences: ProtocolSequence[]) {
  await mkdir(localDataDirectory, { recursive: true });
  await writeFile(localProtocolFile, JSON.stringify(sequences, null, 2), "utf8");
}
