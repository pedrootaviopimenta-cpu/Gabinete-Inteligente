"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { BookMarked, ExternalLink, Plus, RefreshCw, Search } from "lucide-react";
import {
  getMunicipalNormStatus,
  municipalNormStatusLabels,
  type MunicipalNorm
} from "@/lib/municipal-norm-types";

type NormsPayload = {
  norms?: MunicipalNorm[];
  error?: string;
};

export function MunicipalNormsList() {
  const [norms, setNorms] = useState<MunicipalNorm[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const visibleNorms = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    if (!normalizedQuery) {
      return norms;
    }

    return norms.filter((norm) =>
      normalizeSearch(
        [norm.norm_type, norm.number, norm.year, norm.title, norm.summary, norm.subject].join(" ")
      ).includes(normalizedQuery)
    );
  }, [norms, query]);

  useEffect(() => {
    void loadNorms();
  }, []);

  async function loadNorms() {
    setIsLoading(true);
    setMessage("");

    const response = await fetch("/api/municipal-norms", { cache: "no-store" });
    const payload = (await response.json().catch(() => ({}))) as NormsPayload;

    if (!response.ok) {
      setMessage(payload.error || "Não foi possível carregar a base normativa.");
      setNorms([]);
      setIsLoading(false);
      return;
    }

    setNorms(payload.norms || []);
    setIsLoading(false);
  }

  return (
    <main className="space-y-6">
      <section className="gi-panel overflow-hidden">
        <div className="border-t-4 border-gi-gold p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="gi-eyebrow">Base Normativa Municipal</p>
              <h1 className="mt-2 text-2xl font-semibold text-gi-ink">
                Normas municipais cadastradas
              </h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-gi-muted">
                Organize leis, decretos, portarias, resoluções e demais atos municipais para
                consulta interna, conferência documental e futura busca semântica.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => void loadNorms()} className="gi-button-secondary">
                <RefreshCw className="h-4 w-4" aria-hidden={true} />
                Atualizar
              </button>
              <Link href={"/normas-municipais/nova" as Route} className="gi-button-assisted">
                <Plus className="h-4 w-4" aria-hidden={true} />
                Nova norma
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-gi-gold/35 bg-gi-gold/10 p-4 text-sm leading-6 text-gi-ink">
        A vigência, alterações e revogações devem ser conferidas em fonte oficial antes de qualquer
        uso administrativo, jurídico ou documental. O sistema não presume validade normativa.
      </section>

      <section className="gi-panel p-5">
        <label className="block text-sm font-medium text-gi-ink">
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gi-gold" aria-hidden={true} />
            Buscar na base normativa
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="gi-input"
            placeholder="Buscar por tipo, número, ano, ementa, assunto ou resumo"
          />
        </label>
      </section>

      {message ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700">
          {message}
        </p>
      ) : null}

      <section className="gi-panel overflow-hidden">
        <div className="border-b border-gi-line p-5">
          <p className="gi-eyebrow">Consulta interna</p>
          <h2 className="mt-2 text-lg font-semibold text-gi-ink">
            {visibleNorms.length} norma(s) encontrada(s)
          </h2>
        </div>

        {isLoading ? (
          <p className="p-5 text-sm leading-6 text-gi-muted">Carregando normas municipais...</p>
        ) : null}

        {!isLoading && !visibleNorms.length ? (
          <div className="m-5 rounded-md border border-gi-line bg-gi-background p-5 text-sm leading-6 text-gi-muted">
            <div className="flex items-start gap-3">
              <BookMarked className="mt-0.5 h-5 w-5 text-gi-gold" aria-hidden={true} />
              <p>Nenhuma norma municipal foi encontrada para os critérios atuais.</p>
            </div>
          </div>
        ) : null}

        {!isLoading && visibleNorms.length ? (
          <div className="divide-y divide-gi-line">
            {visibleNorms.map((norm) => (
              <article key={norm.id} className="p-5 transition hover:bg-gi-gold/5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gi-muted">
                      {norm.norm_type} nº {norm.number}/{norm.year || "ano não informado"}
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-gi-ink">{norm.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gi-muted">
                      {norm.summary || "Resumo não informado."}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-gi-muted">
                      Assunto: {norm.subject || "não informado"} · Vigência:{" "}
                      {formatDate(norm.effective_from)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 lg:items-end">
                    <NormStatusBadge norm={norm} />
                    <Link
                      href={`/normas-municipais/${norm.id}` as Route}
                      className="gi-button-secondary h-9 px-3"
                    >
                      Abrir
                      <ExternalLink className="h-4 w-4" aria-hidden={true} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function NormStatusBadge({ norm }: { norm: MunicipalNorm }) {
  const status = getMunicipalNormStatus(norm);
  const classes = {
    revogada: "border-rose-200 bg-rose-50 text-rose-900",
    vigencia_futura: "border-amber-200 bg-amber-50 text-amber-900",
    conferir_vigencia: "border-gi-gold/35 bg-gi-gold/10 text-gi-navy"
  };

  return (
    <span className={`w-fit rounded-md border px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>
      {municipalNormStatusLabels[status]}
    </span>
  );
}

function formatDate(value: string) {
  if (!value) {
    return "não informada";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
