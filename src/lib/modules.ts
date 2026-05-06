import type { Route } from "next";

export type ModuleSlug =
  | "oficios"
  | "ministerio-publico"
  | "pareceres"
  | "normas-municipais"
  | "checklists";

export type ModuleField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "select";
  required?: boolean;
  placeholder?: string;
  rows?: number;
  options?: string[];
};

export type GiModule = {
  slug: ModuleSlug;
  name: string;
  shortName: string;
  area: string;
  href: Route;
  description: string;
  promptFile: string;
  accent: string;
  fields: ModuleField[];
};

export const HUMAN_REVIEW_NOTICE =
  "Minuta gerada com apoio de inteligência artificial. Revisão humana obrigatória por profissional ou autoridade competente antes de qualquer uso oficial, assinatura, protocolo, publicação ou encaminhamento.";

export const modules: GiModule[] = [
  {
    slug: "oficios",
    name: "GI Ofícios",
    shortName: "GI Ofícios",
    area: "Comunicação administrativa",
    href: "/oficios",
    description:
      "Criação assistida de ofícios, encaminhamentos, solicitações e respostas formais para rotinas municipais.",
    promptFile: "oficio_administrativo.md",
    accent: "bg-gi-teal",
    fields: [
      {
        name: "orgao_remetente",
        label: "Órgão remetente",
        type: "text",
        required: true,
        placeholder: "Ex.: Secretaria Municipal de Administração"
      },
      {
        name: "destinatario",
        label: "Destinatário",
        type: "text",
        required: true,
        placeholder: "Ex.: Promotoria de Justiça, empresa, cidadão ou órgão público"
      },
      {
        name: "assunto",
        label: "Assunto",
        type: "text",
        required: true,
        placeholder: "Ex.: Encaminhamento de informações administrativas"
      },
      {
        name: "finalidade",
        label: "Finalidade do ofício",
        type: "select",
        required: true,
        options: ["Solicitação", "Encaminhamento", "Resposta", "Comunicação", "Convite"]
      },
      {
        name: "fatos",
        label: "Fatos e contexto administrativo",
        type: "textarea",
        required: true,
        rows: 5,
        placeholder: "Descreva apenas fatos conhecidos, documentos existentes e providências reais."
      },
      {
        name: "providencia",
        label: "Providência solicitada ou comunicada",
        type: "textarea",
        rows: 4,
        placeholder: "Informe o encaminhamento esperado, sem presumir decisão final."
      },
      {
        name: "prazo",
        label: "Prazo",
        type: "text",
        placeholder: "Ex.: 10 dias úteis, se aplicável"
      },
      {
        name: "anexos",
        label: "Documentos anexos",
        type: "textarea",
        rows: 3,
        placeholder: "Liste documentos efetivamente disponíveis."
      }
    ]
  },
  {
    slug: "ministerio-publico",
    name: "GI Ministério Público",
    shortName: "GI MP",
    area: "Resposta institucional",
    href: "/ministerio-publico",
    description:
      "Apoio a respostas administrativas para requisições, recomendações e notificações do Ministério Público.",
    promptFile: "resposta_mp.md",
    accent: "bg-gi-rose",
    fields: [
      {
        name: "procedimento",
        label: "Procedimento ou expediente",
        type: "text",
        required: true,
        placeholder: "Ex.: Notícia de Fato, Inquérito Civil, Recomendação ou Ofício nº..."
      },
      {
        name: "orgao_ministerial",
        label: "Órgão ministerial",
        type: "text",
        required: true,
        placeholder: "Ex.: 1ª Promotoria de Justiça da Comarca"
      },
      {
        name: "prazo_resposta",
        label: "Prazo para resposta",
        type: "text",
        placeholder: "Ex.: até 15/06/2026"
      },
      {
        name: "teor_requisicao",
        label: "Síntese da requisição",
        type: "textarea",
        required: true,
        rows: 5,
        placeholder: "Resuma o que foi solicitado, recomendado ou notificado."
      },
      {
        name: "fatos_apurados",
        label: "Fatos apurados pela Administração",
        type: "textarea",
        required: true,
        rows: 5,
        placeholder: "Informe fatos comprováveis e evite conclusões não documentadas."
      },
      {
        name: "providencias_adotadas",
        label: "Providências já adotadas",
        type: "textarea",
        rows: 4,
        placeholder: "Liste atos, diligências, despachos, reuniões ou documentos já produzidos."
      },
      {
        name: "pendencias",
        label: "Pendências e providências em andamento",
        type: "textarea",
        rows: 3,
        placeholder: "Informe lacunas, documentos pendentes ou necessidade de dilação de prazo."
      },
      {
        name: "documentos",
        label: "Documentos anexos",
        type: "textarea",
        rows: 3,
        placeholder: "Liste documentos que acompanharão a resposta."
      }
    ]
  },
  {
    slug: "pareceres",
    name: "GI Pareceres",
    shortName: "GI Pareceres",
    area: "Análise preliminar",
    href: "/pareceres",
    description:
      "Elaboração de pareceres preliminares e notas técnicas iniciais, sem substituição da análise profissional competente.",
    promptFile: "parecer_preliminar.md",
    accent: "bg-gi-amber",
    fields: [
      {
        name: "tipo_manifestacao",
        label: "Tipo de manifestação preliminar",
        type: "select",
        required: true,
        options: ["Parecer preliminar", "Nota técnica", "Análise inicial", "Informação jurídica inicial"]
      },
      {
        name: "consulta",
        label: "Consulta submetida",
        type: "textarea",
        required: true,
        rows: 4,
        placeholder: "Descreva a dúvida objetiva apresentada ao setor responsável."
      },
      {
        name: "fatos",
        label: "Fatos relevantes",
        type: "textarea",
        required: true,
        rows: 5,
        placeholder: "Informe os fatos conhecidos, sem acrescentar hipóteses não verificadas."
      },
      {
        name: "documentos",
        label: "Documentos disponíveis",
        type: "textarea",
        rows: 4,
        placeholder: "Liste processos, contratos, ofícios, memorandos, pareceres anteriores ou anexos."
      },
      {
        name: "normas_conhecidas",
        label: "Normas conhecidas pelo usuário",
        type: "textarea",
        rows: 3,
        placeholder: "Informe apenas normas já identificadas. O sistema não deve inventar fundamentos."
      },
      {
        name: "riscos",
        label: "Riscos ou lacunas percebidas",
        type: "textarea",
        rows: 3,
        placeholder: "Informe dúvidas, documentos ausentes ou pontos que exigem revisão técnica."
      }
    ]
  },
  {
    slug: "normas-municipais",
    name: "GI Normas Municipais",
    shortName: "GI Normas",
    area: "Base normativa",
    href: "/normas-municipais",
    description:
      "Organização de leis, decretos, portarias e demais atos municipais, com estrutura preparada para consulta futura.",
    promptFile: "parecer_preliminar.md",
    accent: "bg-slate-500",
    fields: [
      {
        name: "especie_normativa",
        label: "Espécie normativa",
        type: "select",
        required: true,
        options: ["Lei", "Lei Complementar", "Decreto", "Portaria", "Resolução", "Instrução Normativa"]
      },
      {
        name: "numero",
        label: "Número",
        type: "text",
        required: true,
        placeholder: "Ex.: 1.234"
      },
      {
        name: "ano",
        label: "Ano",
        type: "text",
        required: true,
        placeholder: "Ex.: 2026"
      },
      {
        name: "ementa",
        label: "Ementa",
        type: "textarea",
        rows: 3,
        placeholder: "Transcreva ou resuma a ementa oficial."
      },
      {
        name: "tema",
        label: "Tema",
        type: "text",
        placeholder: "Ex.: Licitações, servidores, tributos, saúde, educação"
      },
      {
        name: "vigencia",
        label: "Situação de vigência",
        type: "select",
        options: ["Vigente", "Revogada", "Parcialmente revogada", "Não informada"]
      },
      {
        name: "fonte",
        label: "Fonte",
        type: "text",
        placeholder: "URL, diário oficial ou processo administrativo"
      },
      {
        name: "observacoes",
        label: "Observações para análise",
        type: "textarea",
        rows: 4,
        placeholder: "Informe dúvidas de classificação, relações com outras normas ou pontos de atenção."
      }
    ]
  },
  {
    slug: "checklists",
    name: "GI Checklists",
    shortName: "GI Checklists",
    area: "Conformidade operacional",
    href: "/checklists",
    description:
      "Criação e acompanhamento de checklists administrativos, instrutivos e processuais para rotinas municipais.",
    promptFile: "oficio_administrativo.md",
    accent: "bg-blue-700",
    fields: [
      {
        name: "rotina",
        label: "Rotina administrativa",
        type: "text",
        required: true,
        placeholder: "Ex.: Resposta ao Ministério Público, contratação direta, convênio"
      },
      {
        name: "objetivo",
        label: "Objetivo do checklist",
        type: "textarea",
        required: true,
        rows: 3,
        placeholder: "Explique o que deve ser conferido antes do encaminhamento."
      },
      {
        name: "fase_processo",
        label: "Fase do processo",
        type: "select",
        options: ["Instrução inicial", "Revisão técnica", "Aprovação", "Encaminhamento externo", "Arquivamento"]
      },
      {
        name: "documentos_exigidos",
        label: "Documentos exigidos",
        type: "textarea",
        rows: 5,
        placeholder: "Liste os documentos mínimos a verificar."
      },
      {
        name: "responsaveis",
        label: "Responsáveis",
        type: "textarea",
        rows: 3,
        placeholder: "Informe setores, cargos ou agentes responsáveis pela conferência."
      },
      {
        name: "riscos",
        label: "Riscos e pontos de atenção",
        type: "textarea",
        rows: 4,
        placeholder: "Informe riscos administrativos, documentais ou de prazo."
      }
    ]
  }
];

export const moduleSlugs = modules.map((module) => module.slug);

export function isModuleSlug(slug: string): slug is ModuleSlug {
  return moduleSlugs.includes(slug as ModuleSlug);
}

export function getModuleBySlug(slug: string) {
  const module = modules.find((item) => item.slug === slug);

  if (!module) {
    throw new Error(`Módulo não encontrado: ${slug}`);
  }

  return module;
}
