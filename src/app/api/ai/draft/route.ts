import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { HUMAN_REVIEW_NOTICE, getModuleBySlug, isModuleSlug } from "@/lib/modules";

export const runtime = "nodejs";

type DraftRequest = {
  moduleSlug?: string;
  fields?: Record<string, string>;
};

export async function POST(request: Request) {
  const body = (await request.json()) as DraftRequest;
  const moduleSlug = body.moduleSlug;

  if (!moduleSlug || !isModuleSlug(moduleSlug)) {
    return NextResponse.json(
      { error: "Módulo inválido para geração de minuta." },
      { status: 400 }
    );
  }

  const module = getModuleBySlug(moduleSlug);
  const fields = normalizeFields(body.fields || {});
  const context = buildContext(module, fields);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        draft: ensureHumanReviewNotice(createDemoDraft(moduleSlug, fields), HUMAN_REVIEW_NOTICE),
        mode: "demo",
        notice: HUMAN_REVIEW_NOTICE
      }
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const [systemPrompt, modulePrompt] = await Promise.all([
    readPrompt("system.md"),
    readPrompt(module.promptFile)
  ]);

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          modulePrompt,
          "",
          "Dados fornecidos pelo usuário:",
          context,
          "",
          "Módulo solicitado:",
          module.name
        ].join("\n")
      }
    ]
  });

  const content = completion.choices[0]?.message.content?.trim();

  return NextResponse.json({
    draft: ensureHumanReviewNotice(content || "", HUMAN_REVIEW_NOTICE),
    mode: "openai",
    notice: HUMAN_REVIEW_NOTICE
  });
}

async function readPrompt(fileName: string) {
  const promptPath = path.join(process.cwd(), "prompts", fileName);
  return readFile(promptPath, "utf8");
}

function ensureHumanReviewNotice(content: string, notice: string) {
  if (content.includes(notice)) {
    return content;
  }

  return `${content}\n\n${notice}`;
}

function normalizeFields(fields: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, String(value || "").trim()])
  );
}

function buildContext(module: ReturnType<typeof getModuleBySlug>, fields: Record<string, string>) {
  return module.fields
    .map((field) => {
      const value = fields[field.name] || "[não informado]";
      return `${field.label}: ${value}`;
    })
    .join("\n");
}

function readField(fields: Record<string, string>, key: string, fallback = "[não informado]") {
  return fields[key] || fallback;
}

function createDemoDraft(moduleSlug: string, fields: Record<string, string>) {
  const header = [
    "MINUTA DEMONSTRATIVA",
    "",
    "Este texto foi gerado em modo demonstração porque a variável OPENAI_API_KEY não está configurada. O conteúdo abaixo simula a estrutura documental do módulo, não constitui orientação jurídica, parecer final, decisão administrativa ou manifestação oficial."
  ].join("\n");

  if (moduleSlug === "ministerio-publico") {
    return [
      header,
      "",
      "AO MINISTÉRIO PÚBLICO",
      "",
      `Referência: ${readField(fields, "procedimento")}`,
      `Órgão ministerial: ${readField(fields, "orgao_ministerial")}`,
      "",
      "Senhor(a) Promotor(a) de Justiça,",
      "",
      `Em atenção ao expediente acima referido, o Município apresenta, em caráter preliminar, as informações administrativas disponíveis sobre a demanda assim sintetizada: ${readField(fields, "teor_requisicao")}.`,
      "",
      `Conforme os elementos atualmente informados, registram-se os seguintes fatos apurados pela Administração: ${readField(fields, "fatos_apurados")}.`,
      "",
      `Quanto às providências já adotadas, consta: ${readField(fields, "providencias_adotadas")}. Eventuais pendências ou providências em andamento foram indicadas nos seguintes termos: ${readField(fields, "pendencias")}.`,
      "",
      `Documentos mencionados para conferência e eventual remessa: ${readField(fields, "documentos")}. Prazo informado: ${readField(fields, "prazo_resposta")}.`,
      "",
      "A presente minuta deve ser conferida pela unidade técnica responsável e submetida à autoridade competente antes de qualquer encaminhamento oficial."
    ].join("\n");
  }

  if (moduleSlug === "pareceres") {
    return [
      header,
      "",
      readField(fields, "tipo_manifestacao", "PARECER PRELIMINAR").toUpperCase(),
      "",
      "I. Relatório",
      "",
      `Submete-se à análise preliminar a seguinte consulta: ${readField(fields, "consulta")}.`,
      "",
      "II. Delimitação",
      "",
      `A apreciação demonstrativa considera exclusivamente os fatos informados pelo usuário: ${readField(fields, "fatos")}. Documentos disponíveis: ${readField(fields, "documentos")}.`,
      "",
      "III. Análise preliminar",
      "",
      `As normas indicadas pelo usuário foram: ${readField(fields, "normas_conhecidas")}. Não se presume existência de fundamento legal, jurisprudência ou ato normativo não fornecido no formulário.`,
      "",
      "IV. Riscos e lacunas",
      "",
      `Pontos de atenção informados: ${readField(fields, "riscos")}.`,
      "",
      "V. Conclusão preliminar",
      "",
      "A minuta demonstra apenas uma estrutura inicial de análise e deve ser revisada por profissional ou autoridade competente antes de qualquer aproveitamento institucional."
    ].join("\n");
  }

  if (moduleSlug === "normas-municipais") {
    return [
      header,
      "",
      "FICHA DEMONSTRATIVA DE NORMA MUNICIPAL",
      "",
      `Espécie normativa: ${readField(fields, "especie_normativa")}`,
      `Número: ${readField(fields, "numero")}`,
      `Ano: ${readField(fields, "ano")}`,
      `Tema: ${readField(fields, "tema")}`,
      `Situação de vigência informada: ${readField(fields, "vigencia")}`,
      `Fonte: ${readField(fields, "fonte")}`,
      "",
      "Ementa ou síntese",
      "",
      readField(fields, "ementa"),
      "",
      "Observações para análise",
      "",
      readField(fields, "observacoes"),
      "",
      "Esta ficha é apenas demonstrativa. A vigência, revogações, alterações e compatibilidade normativa dependem de conferência documental e revisão técnica."
    ].join("\n");
  }

  if (moduleSlug === "checklists") {
    return [
      header,
      "",
      "CHECKLIST ADMINISTRATIVO DEMONSTRATIVO",
      "",
      `Rotina administrativa: ${readField(fields, "rotina")}`,
      `Fase do processo: ${readField(fields, "fase_processo")}`,
      "",
      "Objetivo",
      "",
      readField(fields, "objetivo"),
      "",
      "Itens mínimos para conferência",
      "",
      `1. Conferir documentos exigidos: ${readField(fields, "documentos_exigidos")}.`,
      `2. Identificar responsáveis pela análise e aprovação: ${readField(fields, "responsaveis")}.`,
      `3. Registrar riscos e pontos de atenção: ${readField(fields, "riscos")}.`,
      "4. Submeter a minuta, checklist ou encaminhamento à revisão humana obrigatória antes de uso oficial.",
      "",
      "Este checklist deve ser adaptado pela unidade competente conforme o caso concreto."
    ].join("\n");
  }

  return [
    header,
    "",
    "OFÍCIO DEMONSTRATIVO",
    "",
    `Órgão remetente: ${readField(fields, "orgao_remetente")}`,
    `Destinatário: ${readField(fields, "destinatario")}`,
    `Assunto: ${readField(fields, "assunto")}`,
    "",
    "Senhor(a),",
    "",
    `Cumprimentando-o(a) cordialmente, o Município, por meio do órgão acima indicado, apresenta a presente minuta demonstrativa com a finalidade de ${readField(fields, "finalidade", "formalizar comunicação administrativa").toLowerCase()}.`,
    "",
    `O contexto administrativo informado foi o seguinte: ${readField(fields, "fatos")}.`,
    "",
    `A providência solicitada ou comunicada consiste em: ${readField(fields, "providencia")}. Prazo informado: ${readField(fields, "prazo")}.`,
    "",
    `Documentos anexos mencionados: ${readField(fields, "anexos")}.`,
    "",
    "Sem mais para o momento, renova-se protesto de consideração institucional.",
    "",
    "[Local], [data]."
  ].join("\n");
}
