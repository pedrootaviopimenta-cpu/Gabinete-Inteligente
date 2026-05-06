"use client";

import { useState } from "react";
import { Copy, FileDown, Sparkles } from "lucide-react";
import { HumanReviewNotice } from "@/components/human-review-notice";
import type { GiModule } from "@/lib/modules";

type GenerationState = "idle" | "loading" | "success" | "error";

export function DocumentWorkspace({ module }: { module: GiModule }) {
  const [fields, setFields] = useState(() =>
    Object.fromEntries(module.fields.map((field) => [field.name, ""]))
  );
  const [draft, setDraft] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [state, setState] = useState<GenerationState>("idle");
  const [error, setError] = useState("");

  async function generateDraft() {
    setState("loading");
    setError("");

    const response = await fetch("/api/ai/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleSlug: module.slug, fields })
    });

    const payload = (await response.json()) as {
      draft?: string;
      error?: string;
      mode?: "demo" | "openai";
    };

    if (!response.ok) {
      setState("error");
      setError(payload.error || "Não foi possível gerar a minuta.");
      return;
    }

    setDraft(payload.draft || "");
    setIsDemo(payload.mode === "demo");
    setState("success");
  }

  function updateField(name: string, value: string) {
    setFields((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function copyDraft() {
    if (!draft) {
      return;
    }

    await navigator.clipboard.writeText(draft);
  }

  return (
    <main className="space-y-6">
      <section className="rounded-lg border border-gi-line bg-white p-5 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gi-muted">
              {module.area}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-gi-ink">{module.name}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gi-muted">
              {module.description}
            </p>
          </div>
          <div className="rounded-md border border-gi-line px-3 py-2 text-xs font-medium text-gi-muted">
            Prompt: {module.promptFile}
          </div>
        </div>
      </section>

      <HumanReviewNotice />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-lg border border-gi-line bg-white p-5 shadow-panel">
          <div>
            <h2 className="text-sm font-semibold text-gi-ink">Dados para elaboração</h2>
            <p className="mt-1 text-sm leading-6 text-gi-muted">
              Preencha apenas informações conhecidas. Campos vazios serão tratados como pendências,
              sem criação de fatos, fundamentos ou documentos fictícios.
            </p>
          </div>

          <div className="mt-5 grid gap-4">
            {module.fields.map((field) => (
              <FieldControl
                key={field.name}
                field={field}
                value={fields[field.name] || ""}
                onChange={(value) => updateField(field.name, value)}
              />
            ))}
          </div>

          {error ? (
            <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700">
              {error}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={generateDraft}
              disabled={state === "loading"}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-gi-navy px-4 text-sm font-semibold text-white transition hover:bg-blue-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {state === "loading" ? "Gerando" : "Gerar minuta"}
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-gi-line bg-white p-5 shadow-panel">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gi-ink">Minuta</h2>
              <p className="mt-1 text-xs text-gi-muted">Conteúdo preliminar sujeito a revisão.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyDraft}
                disabled={!draft}
                title="Copiar minuta"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gi-line text-gi-ink transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled
                title="Exportar DOCX"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gi-line text-gi-muted opacity-60"
              >
                <FileDown className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {isDemo ? (
            <p className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm leading-6 text-blue-900">
              Modo demonstração ativo: a minuta abaixo foi simulada porque a variável
              OPENAI_API_KEY não está configurada.
            </p>
          ) : null}

          <div className="mt-4 min-h-96 whitespace-pre-wrap rounded-md border border-gi-line bg-slate-50 p-4 text-sm leading-6 text-gi-ink">
            {draft ||
              "A minuta gerada aparecerá neste painel após o envio dos dados do módulo. Sem chave OpenAI, o sistema retorna uma minuta demonstrativa claramente identificada."}
          </div>
        </div>
      </section>
    </main>
  );
}

type FieldControlProps = {
  field: GiModule["fields"][number];
  value: string;
  onChange: (value: string) => void;
};

function FieldControl({ field, value, onChange }: FieldControlProps) {
  const id = `${field.name}-field`;
  const label = `${field.label}${field.required ? " *" : ""}`;
  const className =
    "mt-2 w-full rounded-md border border-gi-line bg-white px-3 py-2 text-sm leading-6 text-gi-ink outline-none transition placeholder:text-slate-400 focus:border-gi-teal focus:ring-2 focus:ring-teal-100";

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-gi-ink">
        {label}
      </label>
      {field.type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          rows={field.rows || 4}
          required={field.required}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`${className} resize-y`}
        />
      ) : null}
      {field.type === "select" ? (
        <select
          id={id}
          value={value}
          required={field.required}
          onChange={(event) => onChange(event.target.value)}
          className={className}
        >
          <option value="">Selecione</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : null}
      {field.type === "text" || field.type === "date" ? (
        <input
          id={id}
          type={field.type}
          value={value}
          required={field.required}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={className}
        />
      ) : null}
    </div>
  );
}
