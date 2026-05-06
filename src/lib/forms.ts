import type { ModuleSlug } from "@/lib/modules";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "date"
  | "checkbox"
  | "checkbox-group"
  | "repeatable-list";

export type Option = {
  label: string;
  value: string;
};

export type FieldWidth = "full" | "half";

type BaseField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  helpText?: string;
  width?: FieldWidth;
};

export type TextFieldDefinition = BaseField & {
  type: "text";
  placeholder?: string;
};

export type TextareaFieldDefinition = BaseField & {
  type: "textarea";
  placeholder?: string;
  rows?: number;
};

export type SelectFieldDefinition = BaseField & {
  type: "select";
  options: Option[];
  placeholder?: string;
};

export type DateFieldDefinition = BaseField & {
  type: "date";
};

export type CheckboxFieldDefinition = BaseField & {
  type: "checkbox";
};

export type CheckboxGroupFieldDefinition = BaseField & {
  type: "checkbox-group";
  options: Option[];
};

export type RepeatableListFieldDefinition = BaseField & {
  type: "repeatable-list";
  placeholder?: string;
  addLabel?: string;
  minItems?: number;
};

export type FormField =
  | TextFieldDefinition
  | TextareaFieldDefinition
  | SelectFieldDefinition
  | DateFieldDefinition
  | CheckboxFieldDefinition
  | CheckboxGroupFieldDefinition
  | RepeatableListFieldDefinition;

export type FormSection = {
  title: string;
  description?: string;
  fields: FormField[];
};

export type FormDefinition = {
  moduleSlug: ModuleSlug;
  title: string;
  description: string;
  sections: FormSection[];
};

export type FormValue = string | boolean | string[];
export type FormValues = Record<string, FormValue>;

const oficioOptions = [
  "Encaminhamento",
  "Solicitação de informações",
  "Resposta administrativa",
  "Comunicação institucional",
  "Pedido de providências",
  "Solicitação de apoio técnico",
  "Remessa de documentos"
].map(toOption);

const tomOptions = ["Objetivo", "Cauteloso", "Institucional", "Mais robusto"].map(toOption);

const setoresMpOptions = [
  "Licitação",
  "Controle Interno",
  "Contabilidade",
  "RH",
  "Engenharia",
  "Saúde",
  "Educação",
  "Assistência Social",
  "Procuradoria",
  "Gabinete",
  "Outro"
].map(toOption);

const orientacaoRespostaOptions = [
  "Responder apenas ao solicitado",
  "Prestar esclarecimentos amplos",
  "Solicitar prazo complementar",
  "Informar providências em andamento",
  "Encaminhar a outro setor competente"
].map(toOption);

const tipoConsultaOptions = [
  "Diárias",
  "Servidor público",
  "Licitações e contratos",
  "Pagamento indenizatório",
  "Convênios/parcerias",
  "Apoio institucional/eventos",
  "Saúde pública",
  "Educação",
  "Conselho municipal",
  "Patrimônio público",
  "Outro"
].map(toOption);

const entendimentoOptions = [
  "Favorável",
  "Desfavorável",
  "Favorável com condicionantes",
  "Necessidade de complementação documental",
  "Imparcial/avaliativo"
].map(toOption);

const especieNormativaOptions = [
  "Lei Orgânica",
  "Lei Complementar",
  "Lei Ordinária",
  "Decreto",
  "Portaria",
  "Resolução",
  "Instrução Normativa",
  "Edital",
  "Outro"
].map(toOption);

const temaNormaOptions = [
  "Servidores",
  "Magistério",
  "Diárias",
  "Licitações",
  "Saúde",
  "Educação",
  "Tributário",
  "Conselhos municipais",
  "Assistência Social",
  "Cultura",
  "Patrimônio público",
  "Outro"
].map(toOption);

const rotinaChecklistOptions = [
  "Resposta ao MP",
  "Diária",
  "Contratação direta",
  "Licitação",
  "Pagamento indenizatório",
  "Convênio/parceria",
  "Sindicância/PAD",
  "Servidor público",
  "Evento público",
  "Transporte/saúde",
  "Outro"
].map(toOption);

export const formDefinitions: Record<ModuleSlug, FormDefinition> = {
  oficios: {
    moduleSlug: "oficios",
    title: "Formulário de Ofício Administrativo",
    description:
      "Estruture os dados essenciais para minuta de ofício, com clareza sobre remetente, destinatário, referência, providência e signatário.",
    sections: [
      {
        title: "Identificação do órgão remetente",
        fields: [
          {
            name: "orgao_secretaria_remetente",
            label: "Órgão/secretaria remetente",
            type: "text",
            required: true,
            width: "half",
            placeholder: "Ex.: Secretaria Municipal de Administração"
          },
          {
            name: "unidade_administrativa_responsavel",
            label: "Unidade administrativa responsável",
            type: "text",
            required: true,
            width: "half",
            placeholder: "Ex.: Departamento de Compras"
          },
          {
            name: "numero_interno_oficio",
            label: "Número interno do ofício",
            type: "text",
            width: "half",
            placeholder: "Ex.: Ofício nº 012/2026"
          },
          {
            name: "data_documento",
            label: "Data do documento",
            type: "date",
            required: true,
            width: "half"
          }
        ]
      },
      {
        title: "Destinatário e referência",
        fields: [
          {
            name: "destinatario",
            label: "Destinatário",
            type: "text",
            required: true,
            width: "half",
            placeholder: "Nome da pessoa ou unidade destinatária"
          },
          {
            name: "cargo_funcao_destinatario",
            label: "Cargo/função do destinatário",
            type: "text",
            width: "half",
            placeholder: "Ex.: Promotor de Justiça, Secretário Municipal"
          },
          {
            name: "orgao_destinatario",
            label: "Órgão destinatário",
            type: "text",
            required: true,
            width: "half",
            placeholder: "Ex.: Ministério Público do Estado"
          },
          {
            name: "assunto",
            label: "Assunto",
            type: "text",
            required: true,
            width: "half",
            placeholder: "Ex.: Encaminhamento de documentos"
          },
          {
            name: "referencia_anterior",
            label: "Referência a ofício, processo, protocolo ou solicitação anterior",
            type: "text",
            placeholder: "Ex.: Processo Administrativo nº 123/2026"
          },
          {
            name: "tipo_oficio",
            label: "Tipo de ofício",
            type: "select",
            required: true,
            options: oficioOptions
          }
        ]
      },
      {
        title: "Conteúdo administrativo",
        fields: [
          {
            name: "sintese_fatos",
            label: "Síntese dos fatos",
            type: "textarea",
            required: true,
            rows: 5,
            helpText: "Informe apenas fatos conhecidos, sem suposições ou conclusões sem documento."
          },
          {
            name: "providencia_solicitada_comunicada",
            label: "Providência solicitada ou comunicada",
            type: "textarea",
            required: true,
            rows: 4
          },
          {
            name: "prazo_mencionado",
            label: "Prazo mencionado, se houver",
            type: "text",
            width: "half",
            placeholder: "Ex.: 10 dias úteis"
          },
          {
            name: "setor_complementar",
            label: "Setor que deverá complementar informações, se houver",
            type: "text",
            width: "half"
          },
          {
            name: "documentos_anexos",
            label: "Documentos anexos",
            type: "repeatable-list",
            addLabel: "Adicionar anexo",
            placeholder: "Ex.: Cópia do processo administrativo"
          }
        ]
      },
      {
        title: "Assinatura e tom",
        fields: [
          {
            name: "signatario",
            label: "Nome e cargo do signatário",
            type: "text",
            required: true,
            width: "half",
            placeholder: "Ex.: Maria Silva, Secretária Municipal"
          },
          {
            name: "tom_desejado",
            label: "Tom desejado",
            type: "select",
            required: true,
            width: "half",
            options: tomOptions
          }
        ]
      }
    ]
  },
  "ministerio-publico": {
    moduleSlug: "ministerio-publico",
    title: "Formulário de Resposta ao Ministério Público",
    description:
      "Organize a resposta com cautela institucional, aderência às perguntas formuladas e indicação expressa de lacunas documentais.",
    sections: [
      {
        title: "Identificação do expediente ministerial",
        fields: [
          {
            name: "orgao_ministerial_destinatario",
            label: "Promotoria/órgão ministerial destinatário",
            type: "text",
            required: true,
            width: "half",
            placeholder: "Ex.: 1ª Promotoria de Justiça"
          },
          {
            name: "nome_promotor",
            label: "Nome do promotor, se informado",
            type: "text",
            width: "half"
          },
          {
            name: "numero_procedimento",
            label: "Número do procedimento, protocolo, notícia de fato ou inquérito civil",
            type: "text",
            width: "half"
          },
          {
            name: "numero_oficio_requisicao",
            label: "Número do ofício/requisição recebida",
            type: "text",
            width: "half"
          },
          {
            name: "data_recebimento",
            label: "Data de recebimento",
            type: "date",
            width: "half"
          },
          {
            name: "prazo_resposta",
            label: "Prazo de resposta",
            type: "text",
            width: "half",
            placeholder: "Ex.: 15 dias, até 20/06/2026"
          }
        ]
      },
      {
        title: "Delimitação da resposta",
        fields: [
          {
            name: "unidade_responsavel_resposta",
            label: "Secretaria/unidade responsável pela resposta",
            type: "text",
            required: true,
            width: "half"
          },
          {
            name: "assunto_central_requisicao",
            label: "Assunto central da requisição",
            type: "text",
            required: true,
            width: "half"
          },
          {
            name: "perguntas_mp",
            label: "Perguntas formuladas pelo MP",
            type: "repeatable-list",
            required: true,
            minItems: 1,
            addLabel: "Adicionar pergunta",
            placeholder: "Transcreva ou resuma uma pergunta por item.",
            helpText: "Responder apenas ao que foi perguntado reduz risco de excesso ou afirmação indevida."
          },
          {
            name: "orientacao_resposta",
            label: "Orientação de resposta",
            type: "select",
            required: true,
            options: orientacaoRespostaOptions
          }
        ]
      },
      {
        title: "Informações administrativas",
        fields: [
          {
            name: "fatos_comprovados",
            label: "Fatos comprovados pela Administração",
            type: "textarea",
            required: true,
            rows: 5,
            helpText: "Evite admitir irregularidade, culpa ou omissão sem respaldo documental e validação competente."
          },
          {
            name: "providencias_adotadas",
            label: "Providências já adotadas",
            type: "textarea",
            rows: 4
          },
          {
            name: "providencias_em_andamento",
            label: "Providências em andamento",
            type: "textarea",
            rows: 4,
            helpText: "Não prometa resultado futuro sem ato administrativo, cronograma ou determinação formal."
          },
          {
            name: "informacoes_dependentes_outro_setor",
            label: "Informações que dependem de outro setor",
            type: "textarea",
            rows: 3
          }
        ]
      },
      {
        title: "Validação interna e cautelas",
        fields: [
          {
            name: "setores_consultar",
            label: "Setores que devem ser consultados antes do envio",
            type: "checkbox-group",
            options: setoresMpOptions
          },
          {
            name: "documentos_anexos_disponiveis",
            label: "Documentos anexos disponíveis",
            type: "repeatable-list",
            addLabel: "Adicionar documento",
            placeholder: "Ex.: Relatório técnico, memorando, despacho"
          },
          {
            name: "pontos_sensiveis_sem_prova",
            label: "Pontos sensíveis que não devem ser afirmados sem prova",
            type: "textarea",
            rows: 4,
            helpText: "Inclua informações que exigem conferência da Procuradoria, Controle Interno ou setor técnico."
          },
          {
            name: "risco_responsabilizacao",
            label: "Há risco de responsabilização ou tema delicado?",
            type: "checkbox",
            helpText: "Quando marcado, a minuta deve adotar linguagem especialmente cautelosa."
          },
          {
            name: "signatario",
            label: "Nome e cargo do signatário",
            type: "text",
            required: true
          }
        ]
      }
    ]
  },
  pareceres: {
    moduleSlug: "pareceres",
    title: "Formulário de Parecer Administrativo Preliminar",
    description:
      "Delimite fatos, dúvida submetida, documentos e riscos antes de gerar uma minuta de análise preliminar.",
    sections: [
      {
        title: "Consulta",
        fields: [
          {
            name: "orgao_consulente",
            label: "Órgão consulente",
            type: "text",
            required: true,
            width: "half"
          },
          {
            name: "autoridade_consulente",
            label: "Autoridade consulente",
            type: "text",
            width: "half"
          },
          {
            name: "assunto",
            label: "Assunto",
            type: "text",
            required: true,
            width: "half"
          },
          {
            name: "tipo_consulta",
            label: "Tipo de consulta",
            type: "select",
            required: true,
            width: "half",
            options: tipoConsultaOptions
          }
        ]
      },
      {
        title: "Relatório e documentação",
        fields: [
          {
            name: "relatorio_fatos",
            label: "Relatório dos fatos",
            type: "textarea",
            required: true,
            rows: 5
          },
          {
            name: "pedido_duvida_submetida",
            label: "Pedido ou dúvida submetida",
            type: "textarea",
            required: true,
            rows: 4
          },
          {
            name: "documentos_analisados",
            label: "Documentos analisados",
            type: "repeatable-list",
            addLabel: "Adicionar documento",
            placeholder: "Ex.: Processo administrativo, contrato, memorando"
          },
          {
            name: "legislacao_municipal_fornecida",
            label: "Legislação municipal fornecida pelo usuário",
            type: "textarea",
            rows: 3,
            helpText: "Não invente normas. Informe apenas legislação efetivamente fornecida ou conhecida."
          },
          {
            name: "legislacao_federal_estadual_conhecida",
            label: "Legislação federal/estadual conhecida, se informada",
            type: "textarea",
            rows: 3
          }
        ]
      },
      {
        title: "Análise preliminar",
        fields: [
          {
            name: "pontos_controvertidos",
            label: "Pontos controvertidos",
            type: "textarea",
            rows: 4
          },
          {
            name: "riscos_juridicos_administrativos",
            label: "Riscos jurídicos/administrativos identificados",
            type: "textarea",
            rows: 4
          },
          {
            name: "entendimento_preliminar_desejado",
            label: "Entendimento preliminar desejado",
            type: "select",
            required: true,
            options: entendimentoOptions
          },
          {
            name: "condicionantes_administrativas",
            label: "Condicionantes administrativas",
            type: "textarea",
            rows: 4
          },
          {
            name: "parecerista_setor",
            label: "Nome/cargo do parecerista ou setor responsável",
            type: "text",
            required: true
          }
        ]
      }
    ]
  },
  "normas-municipais": {
    moduleSlug: "normas-municipais",
    title: "Formulário de Cadastro e Análise de Norma Municipal",
    description:
      "Registre metadados normativos, vigência, dispositivos relevantes e relações possíveis com outros atos municipais.",
    sections: [
      {
        title: "Identificação da norma",
        fields: [
          { name: "municipio", label: "Município", type: "text", required: true, width: "half" },
          { name: "estado", label: "Estado", type: "text", required: true, width: "half", placeholder: "Ex.: SP" },
          {
            name: "especie_normativa",
            label: "Espécie normativa",
            type: "select",
            required: true,
            width: "half",
            options: especieNormativaOptions
          },
          { name: "numero", label: "Número", type: "text", required: true, width: "half" },
          { name: "ano", label: "Ano", type: "text", required: true, width: "half" },
          { name: "data_publicacao", label: "Data de publicação", type: "date", width: "half" },
          { name: "data_vigencia", label: "Data de vigência", type: "date", width: "half" },
          {
            name: "tema_principal",
            label: "Tema principal",
            type: "select",
            required: true,
            width: "half",
            options: temaNormaOptions
          }
        ]
      },
      {
        title: "Conteúdo normativo",
        fields: [
          { name: "ementa", label: "Ementa", type: "textarea", required: true, rows: 3 },
          {
            name: "texto_integral_resumo",
            label: "Texto integral ou resumo da norma",
            type: "textarea",
            rows: 6
          },
          {
            name: "dispositivos_relevantes",
            label: "Dispositivos relevantes",
            type: "repeatable-list",
            addLabel: "Adicionar dispositivo",
            placeholder: "Ex.: Art. 3º, § 1º"
          }
        ]
      },
      {
        title: "Relações normativas e cautelas",
        fields: [
          {
            name: "revoga_ou_altera",
            label: "Norma revoga ou altera outra?",
            type: "textarea",
            rows: 3
          },
          {
            name: "possivelmente_revogada_por",
            label: "Norma possivelmente revogada por outra?",
            type: "textarea",
            rows: 3
          },
          {
            name: "observacoes_administrativas",
            label: "Observações administrativas",
            type: "textarea",
            rows: 4,
            helpText: "Registre dúvidas sobre vigência, alterações, republicação ou necessidade de consolidação."
          }
        ]
      }
    ]
  },
  checklists: {
    moduleSlug: "checklists",
    title: "Formulário de Checklist Administrativo",
    description:
      "Monte checklists por rotina municipal, com itens obrigatórios, validações internas, responsáveis, prazos e riscos.",
    sections: [
      {
        title: "Identificação da rotina",
        fields: [
          {
            name: "tipo_rotina",
            label: "Tipo de rotina",
            type: "select",
            required: true,
            width: "half",
            options: rotinaChecklistOptions
          },
          {
            name: "secretaria_responsavel",
            label: "Secretaria responsável",
            type: "text",
            required: true,
            width: "half"
          },
          {
            name: "objetivo_checklist",
            label: "Objetivo do checklist",
            type: "textarea",
            required: true,
            rows: 3
          },
          {
            name: "documento_processo_relacionado",
            label: "Documento/processo relacionado",
            type: "text",
            width: "half"
          },
          { name: "prazo_interno", label: "Prazo interno", type: "text", width: "half" },
          {
            name: "responsavel_verificacao",
            label: "Responsável pela verificação",
            type: "text",
            required: true
          }
        ]
      },
      {
        title: "Itens e documentos",
        fields: [
          {
            name: "itens_obrigatorios",
            label: "Itens obrigatórios",
            type: "repeatable-list",
            required: true,
            minItems: 1,
            addLabel: "Adicionar item obrigatório"
          },
          {
            name: "itens_recomendaveis",
            label: "Itens recomendáveis",
            type: "repeatable-list",
            addLabel: "Adicionar item recomendável"
          },
          {
            name: "documentos_comprobatorios",
            label: "Documentos comprobatórios necessários",
            type: "repeatable-list",
            addLabel: "Adicionar documento"
          }
        ]
      },
      {
        title: "Validações e riscos",
        fields: [
          {
            name: "setores_validar",
            label: "Setores que devem validar",
            type: "textarea",
            rows: 3,
            placeholder: "Ex.: Procuradoria, Controle Interno, Contabilidade"
          },
          {
            name: "riscos_item_faltar",
            label: "Riscos se o item faltar",
            type: "textarea",
            rows: 4
          },
          {
            name: "observacoes_finais",
            label: "Observações finais",
            type: "textarea",
            rows: 4
          }
        ]
      }
    ]
  }
};

export function getFormDefinition(moduleSlug: ModuleSlug) {
  return formDefinitions[moduleSlug];
}

export function buildInitialValues(form: FormDefinition): FormValues {
  const values: FormValues = {};

  for (const field of getAllFields(form)) {
    if (field.type === "checkbox") {
      values[field.name] = false;
      continue;
    }

    if (field.type === "checkbox-group") {
      values[field.name] = [];
      continue;
    }

    if (field.type === "repeatable-list") {
      values[field.name] = Array.from({ length: field.minItems || 1 }, () => "");
      continue;
    }

    values[field.name] = "";
  }

  return values;
}

export function getAllFields(form: FormDefinition) {
  return form.sections.flatMap((section) => section.fields);
}

export function buildStructuredPayload(form: FormDefinition, values: FormValues) {
  return form.sections
    .map((section) => {
      const lines = section.fields.map((field) => {
        return `${field.label}: ${formatValue(values[field.name])}`;
      });

      return [`## ${section.title}`, ...lines].join("\n");
    })
    .join("\n\n");
}

export function validateForm(form: FormDefinition, values: FormValues) {
  const errors: Record<string, string> = {};

  for (const field of getAllFields(form)) {
    if (!field.required) {
      continue;
    }

    const value = values[field.name];

    if (field.type === "checkbox" && value !== true) {
      errors[field.name] = "Confirme este campo obrigatório.";
      continue;
    }

    if ((field.type === "checkbox-group" || field.type === "repeatable-list") && !hasArrayValue(value)) {
      errors[field.name] = "Informe ao menos um item.";
      continue;
    }

    if (typeof value === "string" && !value.trim()) {
      errors[field.name] = "Campo obrigatório.";
    }
  }

  return errors;
}

function formatValue(value: FormValue | undefined) {
  if (Array.isArray(value)) {
    const items = value.map((item) => item.trim()).filter(Boolean);
    if (!items.length) {
      return "[não informado]";
    }

    return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
  }

  if (typeof value === "boolean") {
    return value ? "Sim" : "Não";
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return "[não informado]";
}

function hasArrayValue(value: FormValue | undefined) {
  return Array.isArray(value) && value.some((item) => item.trim().length > 0);
}

function toOption(value: string): Option {
  return { label: value, value };
}
