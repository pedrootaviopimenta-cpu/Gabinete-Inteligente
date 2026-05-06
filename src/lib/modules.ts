import type { Route } from "next";

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
  href: Route;
  description: string;
  promptFile: string;
  accent: string;
};

export const HUMAN_REVIEW_NOTICE =
  "Minuta ou documento produzido com apoio do Gabinete Inteligente. Revisão humana obrigatória por profissional ou autoridade competente antes de qualquer uso oficial, assinatura, protocolo, publicação ou encaminhamento.";

export const modules: GiModule[] = [
  {
    slug: "oficios",
    name: "GI Ofícios",
    shortName: "GI Ofícios",
    area: "Comunicação administrativa",
    href: "/oficios",
    description:
      "Solicitação estruturada de apoio para ofícios, encaminhamentos, solicitações e respostas formais em rotinas municipais.",
    promptFile: "oficio_administrativo.md",
    accent: "bg-gi-gold"
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
    accent: "bg-gi-gold"
  },
  {
    slug: "pareceres",
    name: "GI Pareceres",
    shortName: "GI Pareceres",
    area: "Análise preliminar",
    href: "/pareceres",
    description:
      "Solicitação de apoio para pareceres administrativos preliminares, notas técnicas iniciais e análises de cautela documental.",
    promptFile: "parecer_preliminar.md",
    accent: "bg-gi-gold"
  },
  {
    slug: "normas-municipais",
    name: "GI Normas Municipais",
    shortName: "GI Normas",
    area: "Base normativa",
    href: "/normas-municipais",
    description:
      "Cadastro e análise preliminar de leis, decretos, portarias e demais atos normativos municipais.",
    promptFile: "norma_municipal.md",
    accent: "bg-gi-gold"
  },
  {
    slug: "checklists",
    name: "GI Checklists",
    shortName: "GI Checklists",
    area: "Conformidade operacional",
    href: "/checklists",
    description:
      "Solicitação de checklists administrativos para rotinas municipais, validações internas e conferência documental.",
    promptFile: "checklist_administrativo.md",
    accent: "bg-gi-gold"
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
