"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Eraser, FileDown, Send, Sparkles } from "lucide-react";
import { CheckboxField } from "@/components/fields/checkbox-field";
import { CheckboxGroupField } from "@/components/fields/checkbox-group-field";
import { DateField } from "@/components/fields/date-field";
import { RepeatableListField } from "@/components/fields/repeatable-list-field";
import { SelectField } from "@/components/fields/select-field";
import { TextField } from "@/components/fields/text-field";
import { TextareaField } from "@/components/fields/textarea-field";
import { HumanReviewNotice } from "@/components/human-review-notice";
import {
  documentRequestPriorityLabels,
  documentRequestPriorities,
  type DocumentRequestPriority
} from "@/lib/document-request-types";
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
import type { WorkspaceRuntimeConfig } from "@/lib/runtime-config";

type WorkspaceState = "idle" | "loading" | "success" | "error";

type RequesterValues = {
  title: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  requesterDepartment: string;
  priority: DocumentRequestPriority;
};

type SubmissionConfirmation = {
  protocolNumber: string;
  title: string;
};

const defaultRuntimeConfig: WorkspaceRuntimeConfig = {
  deliveryMode: "assisted",
  clientAiEnabled: false,
  adminAiEnabled: false
};

const initialRequesterValues: RequesterValues = {
  title: "",
  requesterName: "",
  requesterEmail: "",
  requesterPhone: "",
  requesterDepartment: "",
  priority: "normal"
};

const priorityOptions = documentRequestPriorities.map((priority) => ({
  label: documentRequestPriorityLabels[priority],
  value: priority
}));

export function StructuredDocumentWorkspace({
  module,
  runtimeConfig = defaultRuntimeConfig
}: {
  module: GiModule;
  runtimeConfig?: WorkspaceRuntimeConfig;
}) {
  const form = useMemo(() => getFormDefinition(module.slug), [module.slug]);
  const initialValues = useMemo(() => buildInitialValues(form), [form]);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [requesterValues, setRequesterValues] = useState<RequesterValues>(initialRequesterValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requestErrors, setRequestErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<WorkspaceState>("idle");
  const [isDemo, setIsDemo] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [confirmation, setConfirmation] = useState<SubmissionConfirmation | null>(null);

  const usesAssistedFlow = runtimeConfig.deliveryMode === "assisted" || !runtimeConfig.clientAiEnabled;
  const structuredContext = useMemo(
    () => buildStructuredPayload(form, values),
    [form, values]
  );

  async function submitAssistedRequest() {
    const nextErrors = validateForm(form, values);
    const nextRequestErrors = validateRequesterValues(requesterValues);
    setErrors(nextErrors);
    setRequestErrors(nextRequestErrors);
    setGeneralError("");
    setCopyMessage("");
    setConfirmation(null);

    if (Object.keys(nextErrors).length || Object.keys(nextRequestErrors).length) {
      setStatus("error");
      setGeneralError("Preencha os campos obrigatórios destacados antes de enviar a solicitação.");
      return;
    }

    setStatus("loading");

    const response = await fetch("/api/document-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moduleSlug: module.slug,
        title: requesterValues.title,
        requesterName: requesterValues.requesterName,
        requesterEmail: requesterValues.requesterEmail,
        requesterPhone: requesterValues.requesterPhone,
        requesterDepartment: requesterValues.requesterDepartment,
        priority: requesterValues.priority,
        fields: values,
        context: structuredContext
      })
    });

    const payload = (await response.json()) as {
      error?: string;
      protocolNumber?: string;
      request?: { protocol_number: string; title: string };
    };

    if (!response.ok) {
      setStatus("error");
      setGeneralError(payload.error || "Não foi possível registrar a solicitação.");
      return;
    }

    setConfirmation({
      protocolNumber: payload.protocolNumber || payload.request?.protocol_number || "",
      title: payload.request?.title || requesterValues.title
    });
    setStatus("success");
  }

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

    const response = await fetch("/api/ai/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moduleSlug: module.slug,
        fields: values,
        context: structuredContext
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
    setConfirmation(null);
  }

  function updateRequesterValue(name: keyof RequesterValues, value: string) {
    setRequesterValues((current) => ({
      ...current,
      [name]: name === "priority" ? (value as DocumentRequestPriority) : value
    }));
    setRequestErrors((current) => {
      const { [name]: _removed, ...rest } = current;
      return rest;
    });
    setConfirmation(null);
  }

  function clearForm() {
    setValues(buildInitialValues(form));
    setRequesterValues(initialRequesterValues);
    setErrors({});
    setRequestErrors({});
    setDraft("");
    setIsDemo(false);
    setStatus("idle");
    setCopyMessage("");
    setGeneralError("");
    setConfirmation(null);
  }

  async function copyText(text: string, message: string) {
    if (!text) {
      return;
    }

    await navigator.clipboard.writeText(text);
    setCopyMessage(message);
  }

  return (
    <main className="space-y-6">
      <section className="gi-panel p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="gi-eyebrow">
              {module.area}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-gi-ink">{module.name}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gi-muted">
              {module.description}
            </p>
          </div>
          <div className="rounded-md border border-gi-gold/35 bg-gi-gold/10 px-3 py-2 text-xs font-semibold text-gi-navy">
            {usesAssistedFlow
              ? "Modo Assistido: análise e produção humana"
              : `Prompt versionado: ${module.promptFile}`}
          </div>
        </div>
      </section>

      <HumanReviewNotice />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            void (usesAssistedFlow ? submitAssistedRequest() : generateDraft());
          }}
        >
          <section className="gi-panel p-5">
            <h2 className="text-base font-semibold text-gi-ink">{form.title}</h2>
            <p className="mt-2 text-sm leading-6 text-gi-muted">
              {usesAssistedFlow
                ? "Preencha os dados estruturados. A solicitação será encaminhada para produção documental assistida, com protocolo interno e revisão humana obrigatória."
                : form.description}
            </p>
          </section>

          {usesAssistedFlow ? (
            <section className="gi-panel p-5">
              <h3 className="border-l-4 border-gi-gold pl-3 text-sm font-semibold uppercase tracking-wide text-gi-ink">
                Dados da solicitação
              </h3>
              <p className="mt-2 text-sm leading-6 text-gi-muted">
                Identifique o solicitante, a unidade administrativa e a prioridade para triagem.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <TextField
                    field={{
                      name: "title",
                      label: "Título administrativo da solicitação",
                      type: "text",
                      required: true,
                      placeholder: `Ex.: Solicitação de apoio em ${module.shortName}`
                    }}
                    value={requesterValues.title}
                    error={requestErrors.title}
                    onChange={(value) => updateRequesterValue("title", value)}
                  />
                </div>
                <TextField
                  field={{
                    name: "requesterName",
                    label: "Nome do solicitante",
                    type: "text",
                    required: true
                  }}
                  value={requesterValues.requesterName}
                  error={requestErrors.requesterName}
                  onChange={(value) => updateRequesterValue("requesterName", value)}
                />
                <TextField
                  field={{
                    name: "requesterEmail",
                    label: "E-mail institucional",
                    type: "text",
                    required: true,
                    placeholder: "nome@municipio.gov.br"
                  }}
                  value={requesterValues.requesterEmail}
                  error={requestErrors.requesterEmail}
                  onChange={(value) => updateRequesterValue("requesterEmail", value)}
                />
                <TextField
                  field={{
                    name: "requesterPhone",
                    label: "Telefone/WhatsApp institucional",
                    type: "text",
                    placeholder: "(00) 00000-0000"
                  }}
                  value={requesterValues.requesterPhone}
                  error={requestErrors.requesterPhone}
                  onChange={(value) => updateRequesterValue("requesterPhone", value)}
                />
                <TextField
                  field={{
                    name: "requesterDepartment",
                    label: "Secretaria, setor ou unidade solicitante",
                    type: "text",
                    required: true,
                    placeholder: "Ex.: Secretaria Municipal de Saúde"
                  }}
                  value={requesterValues.requesterDepartment}
                  error={requestErrors.requesterDepartment}
                  onChange={(value) => updateRequesterValue("requesterDepartment", value)}
                />
                <SelectField
                  field={{
                    name: "priority",
                    label: "Prioridade",
                    type: "select",
                    required: true,
                    options: priorityOptions
                  }}
                  value={requesterValues.priority}
                  error={requestErrors.priority}
                  onChange={(value) => updateRequesterValue("priority", value)}
                />
              </div>
            </section>
          ) : null}

          {form.sections.map((section) => (
            <section
              key={section.title}
              className="gi-panel p-5"
            >
              <h3 className="border-l-4 border-gi-gold pl-3 text-sm font-semibold uppercase tracking-wide text-gi-ink">
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

          <div className="gi-panel flex flex-wrap gap-3 p-4">
            <button
              type="submit"
              disabled={status === "loading"}
              className={usesAssistedFlow ? "gi-button-assisted" : "gi-button-primary"}
            >
              {usesAssistedFlow ? (
                <Send className="h-4 w-4" aria-hidden={true} />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden={true} />
              )}
              {usesAssistedFlow
                ? status === "loading"
                  ? "Enviando solicitação"
                  : "Enviar para produção assistida"
                : status === "loading"
                  ? "Gerando minuta"
                  : "Gerar minuta"}
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="gi-button-secondary"
            >
              <Eraser className="h-4 w-4" aria-hidden={true} />
              Limpar formulário
            </button>
          </div>
        </form>

        {usesAssistedFlow ? (
          <aside className="gi-panel overflow-hidden xl:sticky xl:top-24 xl:self-start">
            <div className="border-t-4 border-gi-gold p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-gi-ink">
                  Resumo para produção assistida
                </h2>
                <p className="mt-1 text-xs leading-5 text-gi-muted">
                  O conteúdo será preservado para análise da equipe responsável.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  void copyText(
                    structuredContext,
                    "Contexto estruturado copiado para a área de transferência."
                  )
                }
                title="Copiar contexto estruturado"
                className="gi-button-secondary h-9 px-3"
              >
                <Copy className="h-4 w-4" aria-hidden={true} />
                Copiar
              </button>
            </div>

            <p className="mt-4 rounded-md border border-gi-gold/35 bg-gi-gold/10 p-3 text-sm leading-6 text-gi-ink">
              Modo Assistido ativo: a plataforma registra a solicitação, gera protocolo interno
              e não realiza geração automática de documento para o cliente.
            </p>

            {confirmation ? (
              <div className="mt-4 rounded-md border border-gi-gold/35 bg-white p-4 text-sm leading-6 text-gi-ink shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-gi-gold" aria-hidden={true} />
                  <div>
                    <h3 className="font-semibold">Solicitação recebida</h3>
                    <p className="mt-1">
                      Protocolo interno:{" "}
                      <span className="font-semibold">{confirmation.protocolNumber}</span>
                    </p>
                    <p className="mt-1">
                      A equipe responsável poderá analisar os campos estruturados, solicitar
                      complementação documental e produzir o texto final após revisão humana.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {copyMessage ? (
              <p className="mt-4 rounded-md border border-gi-gold/35 bg-gi-gold/10 p-3 text-sm leading-6 text-gi-ink">
                {copyMessage}
              </p>
            ) : null}

            <div className="mt-4 min-h-96 whitespace-pre-wrap rounded-md border border-gi-line bg-gi-background p-4 text-sm leading-6 text-gi-ink">
              {structuredContext}
            </div>
            </div>
          </aside>
        ) : (
          <aside className="gi-panel overflow-hidden xl:sticky xl:top-24 xl:self-start">
            <div className="border-t-4 border-gi-gold p-5">
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
                  onClick={() => void copyText(draft, "Minuta copiada para a área de transferência.")}
                  disabled={!draft}
                  title="Copiar minuta"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gi-line bg-white text-gi-ink transition hover:border-gi-gold hover:bg-gi-gold/10 disabled:cursor-not-allowed disabled:opacity-50 gi-focus-ring"
                >
                  <Copy className="h-4 w-4" aria-hidden={true} />
                </button>
                <button
                  type="button"
                  disabled
                  title="Exportação DOCX prevista para fase futura"
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-gi-line bg-white px-3 text-sm font-medium text-gi-muted opacity-70"
                >
                  <FileDown className="h-4 w-4" aria-hidden={true} />
                  DOCX em fase futura
                </button>
              </div>
            </div>

            {isDemo ? (
              <p className="mt-4 rounded-md border border-gi-gold/35 bg-gi-gold/10 p-3 text-sm leading-6 text-gi-ink">
                Modo demonstração ativo: a minuta abaixo foi simulada porque a variável
                OPENAI_API_KEY não está configurada. Use-a apenas para testar o fluxo visual.
              </p>
            ) : null}

            {copyMessage ? (
              <p className="mt-4 rounded-md border border-gi-gold/35 bg-gi-gold/10 p-3 text-sm leading-6 text-gi-ink">
                {copyMessage}
              </p>
            ) : null}

            <div className="mt-4 min-h-96 whitespace-pre-wrap rounded-md border border-gi-line bg-gi-background p-4 text-sm leading-6 text-gi-ink">
              {draft ||
                "A minuta gerada aparecerá neste painel. Sem chave OpenAI, o sistema produzirá uma minuta demonstrativa claramente identificada."}
            </div>
            </div>
          </aside>
        )}
      </section>
    </main>
  );
}

function validateRequesterValues(values: RequesterValues) {
  const errors: Record<string, string> = {};

  if (!values.title.trim()) {
    errors.title = "Campo obrigatório.";
  }

  if (!values.requesterName.trim()) {
    errors.requesterName = "Campo obrigatório.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.requesterEmail.trim())) {
    errors.requesterEmail = "Informe um e-mail válido.";
  }

  if (!values.requesterDepartment.trim()) {
    errors.requesterDepartment = "Campo obrigatório.";
  }

  if (!documentRequestPriorities.includes(values.priority)) {
    errors.priority = "Informe uma prioridade válida.";
  }

  return errors;
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
