export type ModuleSlug =
  | "oficios"
  | "ministerio-publico"
  | "pareceres"
  | "normas-municipais"
  | "checklists";

export type GiModule = {
  slug: ModuleSlug;
  name: string;
  shortName: string;
  area: string;
  href: string;
  description: string;
  promptFile: string;
  placeholder: string;
  accent: string;
};

export const HUMAN_REVIEW_NOTICE =
  "Minuta gerada com apoio de inteligencia artificial. Revisao humana obrigatoria por profissional ou autoridade competente antes de qualquer uso oficial, assinatura, protocolo, publicacao ou encaminhamento.";

export const modules: GiModule[] = [
  {
    slug: "oficios",
    name: "GI Oficios",
    shortName: "GI Oficios",
    area: "Comunicacao administrativa",
    href: "/oficios",
    description:
      "Criacao assistida de oficios, encaminhamentos, solicitacoes e respostas formais para rotinas municipais.",
    promptFile: "oficio_administrativo.md",
    placeholder:
      "Informe orgao remetente, destinatario, assunto, finalidade, fatos relevantes, providencia solicitada, prazo e anexos.",
    accent: "bg-gi-teal"
  },
  {
    slug: "ministerio-publico",
    name: "GI Ministerio Publico",
    shortName: "GI MP",
    area: "Resposta institucional",
    href: "/ministerio-publico",
    description:
      "Apoio a respostas administrativas para requisicoes, recomendacoes e notificacoes do Ministerio Publico.",
    promptFile: "resposta_mp.md",
    placeholder:
      "Informe numero do procedimento, orgao ministerial, teor da requisicao, fatos, providencias adotadas, documentos e prazo.",
    accent: "bg-gi-rose"
  },
  {
    slug: "pareceres",
    name: "GI Pareceres",
    shortName: "GI Pareceres",
    area: "Analise preliminar",
    href: "/pareceres",
    description:
      "Elaboracao de pareceres preliminares e notas tecnicas iniciais, sem substituicao da analise profissional competente.",
    promptFile: "parecer_preliminar.md",
    placeholder:
      "Informe a consulta, fatos comprovados, documentos disponiveis, normas conhecidas, riscos e conclusao esperada.",
    accent: "bg-gi-amber"
  },
  {
    slug: "normas-municipais",
    name: "GI Normas Municipais",
    shortName: "GI Normas",
    area: "Base normativa",
    href: "/normas-municipais",
    description:
      "Organizacao de leis, decretos, portarias e demais atos municipais, com estrutura preparada para consulta futura.",
    promptFile: "parecer_preliminar.md",
    placeholder:
      "Informe especie normativa, numero, ano, ementa, tema, vigencia, fonte e observacoes para analise preliminar.",
    accent: "bg-slate-500"
  },
  {
    slug: "checklists",
    name: "GI Checklists",
    shortName: "GI Checklists",
    area: "Conformidade operacional",
    href: "/checklists",
    description:
      "Criacao e acompanhamento de checklists administrativos, instrutivos e processuais para rotinas municipais.",
    promptFile: "oficio_administrativo.md",
    placeholder:
      "Informe a rotina administrativa, objetivo do checklist, documentos exigidos, responsaveis, prazos e riscos.",
    accent: "bg-blue-700"
  }
];

export const moduleSlugs = modules.map((module) => module.slug);

export function isModuleSlug(slug: string): slug is ModuleSlug {
  return moduleSlugs.includes(slug as ModuleSlug);
}

export function getModuleBySlug(slug: string) {
  const module = modules.find((item) => item.slug === slug);

  if (!module) {
    throw new Error(`Modulo nao encontrado: ${slug}`);
  }

  return module;
}
