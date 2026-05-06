"use client";

import { useState } from "react";
import { Copy, FileDown, Sparkles } from "lucide-react";
import { HumanReviewNotice } from "@/components/human-review-notice";
import type { GiModule } from "@/lib/modules";

type GenerationState = "idle" | "loading" | "success" | "error";

export function DocumentWorkspace({ module }: { module: GiModule }) {
  const [context, setContext] = useState("");
  const [draft, setDraft] = useState("");
  const [state, setState] = useState<GenerationState>("idle");
  const [error, setError] = useState("");

  async function generateDraft() {
    setState("loading");
    setError("");

    const response = await fetch("/api/ai/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleSlug: module.slug, context })
    });

    const payload = (await response.json()) as { draft?: string; error?: string };

    if (!response.ok) {
      setState("error");
      setError(payload.error || "Nao foi possivel gerar a minuta.");
      return;
    }

    setDraft(payload.draft || "");
    setState("success");
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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-lg border border-gi-line bg-white p-5 shadow-panel">
          <label htmlFor="context" className="text-sm font-semibold text-gi-ink">
            Contexto administrativo
          </label>
          <textarea
            id="context"
            value={context}
            onChange={(event) => setContext(event.target.value)}
            className="mt-3 min-h-80 w-full resize-y rounded-md border border-gi-line bg-white p-3 text-sm leading-6 text-gi-ink outline-none transition placeholder:text-slate-400 focus:border-gi-teal focus:ring-2 focus:ring-teal-100"
            placeholder={module.placeholder}
          />

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
              <p className="mt-1 text-xs text-gi-muted">Conteudo preliminar sujeito a revisao.</p>
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

          <div className="mt-4 min-h-96 whitespace-pre-wrap rounded-md border border-gi-line bg-slate-50 p-4 text-sm leading-6 text-gi-ink">
            {draft ||
              "A minuta gerada aparecera neste painel apos a configuracao da OpenAI API e o envio de contexto suficiente."}
          </div>
        </div>
      </section>
    </main>
  );
}
