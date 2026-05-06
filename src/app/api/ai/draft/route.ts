import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { buildStructuredPayload, getFormDefinition, type FormValue, type FormValues } from "@/lib/forms";
import { HUMAN_REVIEW_NOTICE, getModuleBySlug, isModuleSlug, type ModuleSlug } from "@/lib/modules";

export const runtime = "nodejs";

type DraftRequest = {
  moduleSlug?: string;
  fields?: FormValues;
  context?: string;
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
  const context = body.context?.trim() || buildStructuredPayload(getFormDefinition(moduleSlug), fields);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      draft: ensureHumanReviewNotice(createDemoDraft(moduleSlug, fields, context), HUMAN_REVIEW_NOTICE),
      mode: "demo",
      notice: HUMAN_REVIEW_NOTICE
    });
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
          "Dados estruturados fornecidos pelo usuário:",
          context,
          "",
          "Módulo solicitado:",
          module.name,
          "",
          "Exigências permanentes:",
          "1. Não inventar fatos, documentos, artigos, jurisprudência ou fundamentos não fornecidos.",
          "2. Não sugerir substituição de advogado, procurador, controlador interno, autoridade administrativa ou servidor responsável.",
          "3. Manter aviso de revisão humana obrigatória."
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

function normalizeFields(fields: FormValues): FormValues {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, normalizeValue(value)])
  );
}

function normalizeValue(value: FormValue): FormValue {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim());
  }

  if (typeof value === "boolean") {
    return value;
  }

  return String(value || "").trim();
}

function text(fields: FormValues, key: string, fallback = "[não informado]") {
  const value = fields[key];

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "boolean") {
    return value ? "Sim" : "Não";
  }

  if (Array.isArray(value) && value.some(Boolean)) {
    return value.filter(Boolean).join("; ");
  }

  return fallback;
}

function list(fields: FormValues, key: string, fallback = "Não informado.") {
  const value = fields[key];
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value.map((item) => item.trim()).filter(Boolean);
  if (!items.length) {
    return fallback;
  }

  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function yesNo(fields: FormValues, key: string) {
  return fields[key] === true ? "Sim" : "Não";
}

function createDemoDraft(moduleSlug: ModuleSlug, fields: FormValues, context: string) {
  const header = [
    "MINUTA DEMONSTRATIVA",
    "",
    "Este texto foi gerado em modo demonstração porque a variável OPENAI_API_KEY não está configurada. A finalidade é testar o fluxo visual do sistema. O conteúdo não constitui parecer jurídico final, decisão administrativa, orientação vinculante ou manifestação oficial."
  ].join("\n");

  if (moduleSlug === "oficios") {
    return [
      header,
      "",
      "OFÍCIO ADMINISTRATIVO DEMONSTRATIVO",
      "",
      `Remetente: ${text(fields, "orgao_secretaria_remetente")}`,
      `Unidade responsável: ${text(fields, "unidade_administrativa_responsavel")}`,
      `Número interno: ${text(fields, "numero_interno_oficio")}`,
      `Data: ${text(fields, "data_documento")}`,
      "",
      `Ao(À) ${text(fields, "destinatario")}`,
      `${text(fields, "cargo_funcao_destinatario")}`,
      `${text(fields, "orgao_destinatario")}`,
      "",
      `Assunto: ${text(fields, "assunto")}`,
      `Referência: ${text(fields, "referencia_anterior")}`,
      "",
      "Senhor(a),",
      "",
      `Cumprimentando-o(a) cordialmente, encaminha-se a presente minuta demonstrativa de ${text(fields, "tipo_oficio").toLowerCase()}, elaborada a partir dos dados estruturados informados pelo usuário.`,
      "",
      `Conforme síntese apresentada, registram-se os seguintes fatos: ${text(fields, "sintese_fatos")}.`,
      "",
      `A providência solicitada ou comunicada consiste em: ${text(fields, "providencia_solicitada_comunicada")}. Prazo mencionado: ${text(fields, "prazo_mencionado")}.`,
      "",
      `Caso necessário, as informações poderão ser complementadas pelo seguinte setor: ${text(fields, "setor_complementar")}.`,
      "",
      "Documentos anexos:",
      list(fields, "documentos_anexos"),
      "",
      "Ressalva-se que a presente minuta depende de conferência dos documentos, validação do setor competente e autorização da autoridade responsável antes de qualquer envio oficial.",
      "",
      "Atenciosamente,",
      "",
      text(fields, "signatario")
    ].join("\n");
  }

  if (moduleSlug === "ministerio-publico") {
    const onlyAsked =
      text(fields, "orientacao_resposta") === "Responder apenas ao solicitado"
        ? "A resposta deve permanecer limitada às perguntas formuladas, sem acréscimos que ampliem indevidamente o objeto."
        : "A resposta pode prestar esclarecimentos adicionais, desde que amparados por documentos e validação interna.";

    return [
      header,
      "",
      "RESPOSTA ADMINISTRATIVA DEMONSTRATIVA AO MINISTÉRIO PÚBLICO",
      "",
      `Destinatário: ${text(fields, "orgao_ministerial_destinatario")}`,
      `Promotor(a), se informado: ${text(fields, "nome_promotor")}`,
      `Procedimento/protocolo: ${text(fields, "numero_procedimento")}`,
      `Ofício/requisição recebida: ${text(fields, "numero_oficio_requisicao")}`,
      `Data de recebimento: ${text(fields, "data_recebimento")}`,
      `Prazo de resposta: ${text(fields, "prazo_resposta")}`,
      "",
      "Senhor(a) Promotor(a) de Justiça,",
      "",
      `Em atenção à requisição recebida, a ${text(fields, "unidade_responsavel_resposta")} apresenta, em caráter demonstrativo, informações administrativas sobre o seguinte assunto: ${text(fields, "assunto_central_requisicao")}.`,
      "",
      "Perguntas formuladas pelo Ministério Público:",
      list(fields, "perguntas_mp"),
      "",
      onlyAsked,
      "",
      `Fatos comprovados pela Administração: ${text(fields, "fatos_comprovados")}.`,
      "",
      `Providências já adotadas: ${text(fields, "providencias_adotadas")}. Providências em andamento: ${text(fields, "providencias_em_andamento")}.`,
      "",
      `Informações dependentes de outro setor: ${text(fields, "informacoes_dependentes_outro_setor")}. Setores a consultar antes do envio: ${text(fields, "setores_consultar")}.`,
      "",
      "Documentos anexos disponíveis:",
      list(fields, "documentos_anexos_disponiveis"),
      "",
      `Pontos sensíveis que não devem ser afirmados sem prova: ${text(fields, "pontos_sensiveis_sem_prova")}. Risco de responsabilização ou tema delicado: ${yesNo(fields, "risco_responsabilizacao")}.`,
      "",
      "A minuta evita confissão de irregularidade, promessa futura sem base documental e afirmações não comprovadas. Havendo lacunas, recomenda-se complementação antes do envio.",
      "",
      "Atenciosamente,",
      "",
      text(fields, "signatario")
    ].join("\n");
  }

  if (moduleSlug === "pareceres") {
    return [
      header,
      "",
      "PARECER ADMINISTRATIVO PRELIMINAR DEMONSTRATIVO",
      "",
      `Órgão consulente: ${text(fields, "orgao_consulente")}`,
      `Autoridade consulente: ${text(fields, "autoridade_consulente")}`,
      `Assunto: ${text(fields, "assunto")}`,
      `Tipo de consulta: ${text(fields, "tipo_consulta")}`,
      "",
      "I. Relatório",
      "",
      text(fields, "relatorio_fatos"),
      "",
      "II. Delimitação da consulta",
      "",
      text(fields, "pedido_duvida_submetida"),
      "",
      "III. Fundamentação preliminar",
      "",
      `Documentos analisados:\n${list(fields, "documentos_analisados")}`,
      "",
      `Legislação municipal fornecida: ${text(fields, "legislacao_municipal_fornecida")}. Legislação federal/estadual conhecida: ${text(fields, "legislacao_federal_estadual_conhecida")}.`,
      "",
      "IV. Análise do caso concreto",
      "",
      `Pontos controvertidos: ${text(fields, "pontos_controvertidos")}. Riscos jurídicos/administrativos identificados: ${text(fields, "riscos_juridicos_administrativos")}.`,
      "",
      "V. Cautelas administrativas",
      "",
      `Entendimento preliminar indicado: ${text(fields, "entendimento_preliminar_desejado")}. Condicionantes administrativas: ${text(fields, "condicionantes_administrativas")}.`,
      "",
      "VI. Conclusão preliminar",
      "",
      "A conclusão desta minuta demonstrativa é necessariamente condicionada à conferência documental, à validação jurídica competente e à aprovação pela autoridade responsável.",
      "",
      text(fields, "parecerista_setor")
    ].join("\n");
  }

  if (moduleSlug === "normas-municipais") {
    return [
      header,
      "",
      "FICHA TÉCNICA DEMONSTRATIVA DE NORMA MUNICIPAL",
      "",
      `Município/Estado: ${text(fields, "municipio")} - ${text(fields, "estado")}`,
      `Espécie normativa: ${text(fields, "especie_normativa")}`,
      `Número/Ano: ${text(fields, "numero")}/${text(fields, "ano")}`,
      `Publicação: ${text(fields, "data_publicacao")}`,
      `Vigência: ${text(fields, "data_vigencia")}`,
      `Tema principal: ${text(fields, "tema_principal")}`,
      "",
      "Ementa",
      "",
      text(fields, "ementa"),
      "",
      "Resumo",
      "",
      text(fields, "texto_integral_resumo"),
      "",
      "Dispositivos relevantes",
      "",
      list(fields, "dispositivos_relevantes"),
      "",
      "Relações com outras normas",
      "",
      `Revoga ou altera outra norma: ${text(fields, "revoga_ou_altera")}. Possível revogação por outra norma: ${text(fields, "possivelmente_revogada_por")}.`,
      "",
      "Pontos de atenção",
      "",
      text(fields, "observacoes_administrativas"),
      "",
      "Recomenda-se conferência de vigência, alterações, revogações e publicação oficial antes de qualquer uso administrativo ou jurídico."
    ].join("\n");
  }

  if (moduleSlug === "checklists") {
    return [
      header,
      "",
      "CHECKLIST ADMINISTRATIVO DEMONSTRATIVO",
      "",
      `Tipo de rotina: ${text(fields, "tipo_rotina")}`,
      `Secretaria responsável: ${text(fields, "secretaria_responsavel")}`,
      `Documento/processo relacionado: ${text(fields, "documento_processo_relacionado")}`,
      `Prazo interno: ${text(fields, "prazo_interno")}`,
      `Responsável pela verificação: ${text(fields, "responsavel_verificacao")}`,
      "",
      "Objetivo",
      "",
      text(fields, "objetivo_checklist"),
      "",
      "Documentos essenciais",
      "",
      list(fields, "documentos_comprobatorios"),
      "",
      "Manifestações técnicas",
      "",
      "Verificar se há manifestação técnica da secretaria responsável e, quando aplicável, manifestação da Procuradoria, Controle Interno, Contabilidade, setor de licitações ou unidade finalística.",
      "",
      "Validações internas",
      "",
      text(fields, "setores_validar"),
      "",
      "Prazos e responsáveis",
      "",
      `Prazo interno: ${text(fields, "prazo_interno")}. Responsável: ${text(fields, "responsavel_verificacao")}.`,
      "",
      "Itens obrigatórios",
      "",
      list(fields, "itens_obrigatorios"),
      "",
      "Itens recomendáveis",
      "",
      list(fields, "itens_recomendaveis"),
      "",
      "Riscos e cautelas",
      "",
      text(fields, "riscos_item_faltar"),
      "",
      "Pendências antes de assinatura/protocolo",
      "",
      text(fields, "observacoes_finais"),
      "",
      "O checklist deve ser conferido pela unidade competente antes de assinatura, protocolo, publicação ou encaminhamento."
    ].join("\n");
  }

  return context;
}
