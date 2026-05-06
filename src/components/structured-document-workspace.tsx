"use client";

import { useMemo, useState } from "react";
import { Copy, Eraser, FileDown, Sparkles } from "lucide-react";
import { CheckboxField } from "@/components/fields/checkbox-field";
import { CheckboxGroupField } from "@/components/fields/checkbox-group-field";
import { DateField } from "@/components/fields/date-field";
import { RepeatableListField } from "@/components/fields/repeatable-list-field";
import { SelectField } from "@/components/fields/select-field";
import { TextField } from "@/components/fields/text-field";
import { TextareaField } from "@/components/fields/textarea-field";
import { HumanReviewNotice } from "@/components/human-review-notice";
import {
  buildInitialValues,
  buildStructuredPayload,
  getFormDefinition,
  validateForm,
  type FormField,
  type FormValue,
  type FormValues
} from "@/lib/forms";
import type { GiModule } from "@/lib/modules";

type GenerationState = "idle" | "loading" | "success" | "error";

export function StructuredDocumentWorkspace({ module }: { module: GiModule }) {
  const form = useMemo(() => getFormDefinition(module.slug), [module.slug]);
  const initialValues = useMemo(() => buildInitialValues(form), [form]);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<GenerationState>("idle");
  const [isDemo, setIsDemo] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [generalError, setGeneralError] = useState("");

  async function generateDraft() {
    const nextErrors = validateForm(form, values);
    setErrors(nextErrors);
    setGeneralError("");
    setCopyMessage("");

    if (Object.keys(nextErrors).length) {
      setStatus("error");
      setGeneralError("Preencha os campos obrigatórios destacados antes de gerar a minuta.");
      return;
    }

    setStatus("loading");

    const context = buildStructuredPayload(form, values);
    const response = await fetch("/api/ai/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moduleSlug: module.slug,
        fields: values,
        context
      })
    });

    const payload = (await response.json()) as {
      draft?: string;
      error?: string;
      mode?: "demo" | "openai";
    };

    if (!response.ok) {
      setStatus("error");
      setGeneralError(payload.error || "Não foi possível gerar a minuta.");
      return;
    }

    setDraft(payload.draft || "");
    setIsDemo(payload.mode === "demo");
    setStatus("success");
  }

  function updateValue(name: string, value: FormValue) {
    setValues((current) => ({
      ...current,
      [name]: value
    }));
    setErrors((current) => {
      const { [name]: _removed, ...rest } = current;
      return rest;
    });
  }

  function clearForm() {
    setValues(buildInitialValues(form));
    setErrors({});
    setDraft("");
    setIsDemo(false);
    setStatus("idle");
    setCopyMessage("");
    setGeneralError("");
  }

  async function copyDraft() {
    if (!draft) {
      return;
    }

    await navigator.clipboard.writeText(draft);
    setCopyMessage("Minuta copiada para a área de transferência.");
  }

  return (
    <main className="space-y-6">
      <section className="rounded-lg border border-gi-line bg-white p-5 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gi-teal">
              {module.area}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-gi-ink">{module.name}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gi-muted">
              {module.description}
            </p>
          </div>
          <div className="rounded-md border border-gi-line px-3 py-2 text-xs font-medium text-gi-muted">
            Prompt versionado: {module.promptFile}
          </div>
        </div>
      </section>

      <HumanReviewNotice />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            void generateDraft();
          }}
        >
          <section className="rounded-lg border border-gi-line bg-white p-5 shadow-panel">
            <h2 className="text-base font-semibold text-gi-ink">{form.title}</h2>
            <p className="mt-2 text-sm leading-6 text-gi-muted">{form.description}</p>
          </section>

          {form.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-lg border border-gi-line bg-white p-5 shadow-panel"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gi-ink">
                {section.title}
              </h3>
              {section.description ? (
                <p className="mt-2 text-sm leading-6 text-gi-muted">{section.description}</p>
              ) : null}
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {section.fields.map((field) => (
                  <div
                    key={field.name}
                    className={field.width === "half" ? "md:col-span-1" : "md:col-span-2"}
                  >
                    {renderField(field, values[field.name], errors[field.name], updateValue)}
                  </div>
                ))}
              </div>
            </section>
          ))}

          {generalError ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700">
              {generalError}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 rounded-lg border border-gi-line bg-white p-4 shadow-panel">
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-gi-navy px-4 text-sm font-semibold text-white transition hover:bg-blue-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" aria-hidden={true} />
              {status === "loading" ? "Gerando minuta" : "Gerar minuta"}
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-gi-line px-4 text-sm font-semibold text-gi-ink transition hover:bg-slate-100"
            >
              <Eraser className="h-4 w-4" aria-hidden={true} />
              Limpar formulário
            </button>
          </div>
        </form>

        <aside className="rounded-lg border border-gi-line bg-white p-5 shadow-panel xl:sticky xl:top-24 xl:self-start">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gi-ink">Pré-visualização da minuta</h2>
              <p className="mt-1 text-xs leading-5 text-gi-muted">
                Conteúdo preliminar, sujeito à revisão humana obrigatória.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyDraft}
                disabled={!draft}
                title="Copiar minuta"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gi-line text-gi-ink transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Copy className="h-4 w-4" aria-hidden={true} />
              </button>
              <button
                type="button"
                disabled
                title="Exportação DOCX prevista para fase futura"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-gi-line px-3 text-sm font-medium text-gi-muted opacity-70"
              >
                <FileDown className="h-4 w-4" aria-hidden={true} />
                DOCX em fase futura
              </button>
            </div>
          </div>

          {isDemo ? (
            <p className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm leading-6 text-blue-900">
              Modo demonstração ativo: a minuta abaixo foi simulada porque a variável
              OPENAI_API_KEY não está configurada. Use-a apenas para testar o fluxo visual.
            </p>
          ) : null}

          {copyMessage ? (
            <p className="mt-4 rounded-md border border-teal-200 bg-teal-50 p-3 text-sm leading-6 text-teal-900">
              {copyMessage}
            </p>
          ) : null}

          <div className="mt-4 min-h-96 whitespace-pre-wrap rounded-md border border-gi-line bg-slate-50 p-4 text-sm leading-6 text-gi-ink">
            {draft ||
              "A minuta gerada aparecerá neste painel. Sem chave OpenAI, o sistema produzirá uma minuta demonstrativa claramente identificada."}
          </div>
        </aside>
      </section>
    </main>
  );
}

function renderField(
  field: FormField,
  value: FormValue | undefined,
  error: string | undefined,
  onChange: (name: string, value: FormValue) => void
) {
  if (field.type === "text") {
    return (
      <TextField
        field={field}
        value={typeof value === "string" ? value : ""}
        error={error}
        onChange={(nextValue) => onChange(field.name, nextValue)}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <TextareaField
        field={field}
        value={typeof value === "string" ? value : ""}
        error={error}
        onChange={(nextValue) => onChange(field.name, nextValue)}
      />
    );
  }

  if (field.type === "select") {
    return (
      <SelectField
        field={field}
        value={typeof value === "string" ? value : ""}
        error={error}
        onChange={(nextValue) => onChange(field.name, nextValue)}
      />
    );
  }

  if (field.type === "date") {
    return (
      <DateField
        field={field}
        value={typeof value === "string" ? value : ""}
        error={error}
        onChange={(nextValue) => onChange(field.name, nextValue)}
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <CheckboxField
        field={field}
        value={value === true}
        error={error}
        onChange={(nextValue) => onChange(field.name, nextValue)}
      />
    );
  }

  if (field.type === "checkbox-group") {
    return (
      <CheckboxGroupField
        field={field}
        value={Array.isArray(value) ? value : []}
        error={error}
        onChange={(nextValue) => onChange(field.name, nextValue)}
      />
    );
  }

  return (
    <RepeatableListField
      field={field}
      value={Array.isArray(value) ? value : [""]}
      error={error}
      onChange={(nextValue) => onChange(field.name, nextValue)}
    />
  );
}
