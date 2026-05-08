"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { municipalNormTypes, type MunicipalNorm } from "@/lib/municipal-norm-types";

type MunicipalNormFormValues = {
  norm_type: string;
  number: string;
  year: string;
  title: string;
  summary: string;
  subject: string;
  source_url: string;
  published_at: string;
  effective_from: string;
  revoked_at: string;
  content_markdown: string;
};

const emptyValues: MunicipalNormFormValues = {
  norm_type: "Lei Ordinária",
  number: "",
  year: String(new Date().getFullYear()),
  title: "",
  summary: "",
  subject: "",
  source_url: "",
  published_at: "",
  effective_from: "",
  revoked_at: "",
  content_markdown: ""
};

export function MunicipalNormForm({ norm }: { norm?: MunicipalNorm }) {
  const router = useRouter();
  const [values, setValues] = useState<MunicipalNormFormValues>(
    norm
      ? {
          norm_type: norm.norm_type,
          number: norm.number,
          year: norm.year ? String(norm.year) : "",
          title: norm.title,
          summary: norm.summary,
          subject: norm.subject,
          source_url: norm.source_url,
          published_at: norm.published_at,
          effective_from: norm.effective_from,
          revoked_at: norm.revoked_at,
          content_markdown: norm.content_markdown
        }
      : emptyValues
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);

    const response = await fetch(norm ? `/api/municipal-norms/${norm.id}` : "/api/municipal-norms", {
      method: norm ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        year: Number(values.year),
        metadata: {}
      })
    });
    const payload = (await response.json().catch(() => ({}))) as {
      norm?: MunicipalNorm;
      error?: string;
    };

    if (!response.ok || !payload.norm) {
      setError(payload.error || "Não foi possível salvar a norma municipal.");
      setIsSaving(false);
      return;
    }

    setMessage("Norma municipal salva com sucesso.");
    setIsSaving(false);
    router.replace(`/normas-municipais/${payload.norm.id}`);
    router.refresh();
  }

  function updateValue(name: keyof MunicipalNormFormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  return (
    <main className="space-y-6">
      <section className="gi-panel overflow-hidden">
        <div className="border-t-4 border-gi-gold p-5">
          <Link href="/normas-municipais" className="gi-button-secondary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" aria-hidden={true} />
            Voltar à base normativa
          </Link>
          <p className="gi-eyebrow">Base Normativa Municipal</p>
          <h1 className="mt-2 text-2xl font-semibold text-gi-ink">
            {norm ? "Editar norma municipal" : "Cadastrar norma municipal"}
          </h1>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-gi-muted">
            Cadastre metadados, ementa, resumo, datas relevantes, fonte oficial e texto integral
            para consulta interna e futura busca semântica.
          </p>
        </div>
      </section>

      <section className="rounded-md border border-gi-gold/35 bg-gi-gold/10 p-4 text-sm leading-6 text-gi-ink">
        O cadastro não substitui conferência em diário oficial, portal legislativo ou fonte oficial
        competente. Não afirme vigência sem validação documental.
      </section>

      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="gi-panel p-5">
          <h2 className="text-base font-semibold text-gi-ink">Identificação</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-gi-ink">
              Espécie normativa
              <select
                value={values.norm_type}
                onChange={(event) => updateValue("norm_type", event.target.value)}
                className="gi-input"
                required
              >
                {municipalNormTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <Input label="Número" value={values.number} onChange={(value) => updateValue("number", value)} required />
            <Input label="Ano" value={values.year} onChange={(value) => updateValue("year", value)} required />
            <Input label="Assunto" value={values.subject} onChange={(value) => updateValue("subject", value)} required />
            <div className="md:col-span-2">
              <Input label="Ementa ou título" value={values.title} onChange={(value) => updateValue("title", value)} required />
            </div>
          </div>
        </section>

        <section className="gi-panel p-5">
          <h2 className="text-base font-semibold text-gi-ink">Datas e fonte oficial</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Input label="Data de publicação" type="date" value={values.published_at} onChange={(value) => updateValue("published_at", value)} />
            <Input label="Início de vigência" type="date" value={values.effective_from} onChange={(value) => updateValue("effective_from", value)} />
            <Input label="Data de revogação, se houver" type="date" value={values.revoked_at} onChange={(value) => updateValue("revoked_at", value)} />
            <Input label="Fonte oficial" value={values.source_url} onChange={(value) => updateValue("source_url", value)} placeholder="https://..." />
          </div>
        </section>

        <section className="gi-panel p-5">
          <h2 className="text-base font-semibold text-gi-ink">Conteúdo</h2>
          <label className="mt-4 block text-sm font-medium text-gi-ink">
            Resumo
            <textarea
              value={values.summary}
              onChange={(event) => updateValue("summary", event.target.value)}
              rows={4}
              className="gi-input resize-y"
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-gi-ink">
            Texto integral ou Markdown
            <textarea
              value={values.content_markdown}
              onChange={(event) => updateValue("content_markdown", event.target.value)}
              rows={12}
              className="gi-input resize-y"
            />
          </label>
        </section>

        <div className="gi-panel p-4">
          <button type="submit" disabled={isSaving} className="gi-button-primary">
            <Save className="h-4 w-4" aria-hidden={true} />
            {isSaving ? "Salvando" : "Salvar norma municipal"}
          </button>
        </div>
      </form>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-gi-ink">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="gi-input"
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}
