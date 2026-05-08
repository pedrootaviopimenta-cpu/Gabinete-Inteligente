import {
  AlignmentType,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun
} from "docx";
import { HUMAN_REVIEW_NOTICE, getModuleBySlug } from "@/lib/modules";
import type { DocumentRequest } from "@/lib/document-request-types";
import type { OrganizationSettings } from "@/lib/organization-settings-types";

export type GenerateDocumentRequestDocxInput = {
  request: DocumentRequest;
  organizationSettings: OrganizationSettings;
};

const officialUseNotice =
  "Documento produzido em ambiente de apoio documental. A utilização oficial depende de revisão, validação e assinatura por autoridade ou profissional competente.";

export async function generateDocumentRequestDocx({
  request,
  organizationSettings
}: GenerateDocumentRequestDocxInput) {
  const module = getModuleBySlug(request.module_slug);
  const sections = buildOfficialDocumentSections(request, organizationSettings);
  const document = new Document({
    creator: "Gabinete Inteligente",
    title: sanitizeDocxText(request.title),
    description: `Exportação DOCX da solicitação ${request.protocol_number}`,
    sections: [
      {
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: sanitizeDocxText(
                      organizationSettings.footer_text || officialUseNotice
                    ),
                    size: 16
                  })
                ]
              })
            ]
          })
        },
        children: [
          ...buildInstitutionalHeader(organizationSettings),
          new Paragraph({
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: sanitizeDocxText(titleForModule(request.module_slug)),
                bold: true
              })
            ]
          }),
          spacer(),
          infoParagraph("Sistema", "Gabinete Inteligente"),
          infoParagraph("Módulo", module.name),
          infoParagraph("Protocolo", request.protocol_number),
          infoParagraph("Título", request.title),
          ...sections,
          spacer(),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "Texto final", bold: true })]
          }),
          ...buildTextParagraphs(request.final_document_text),
          spacer(),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "Observação de revisão humana", bold: true })]
          }),
          paragraph(HUMAN_REVIEW_NOTICE),
          paragraph(officialUseNotice),
          spacer(),
          signatureBlock(organizationSettings)
        ]
      }
    ]
  });

  return Packer.toBuffer(document);
}

export function buildOfficialDocumentSections(
  request: DocumentRequest,
  organizationSettings: OrganizationSettings
) {
  const recipient = getFieldValue(request, [
    "destinatario",
    "orgao_ministerial_destinatario",
    "orgao_destinatario"
  ]);
  const subject = getFieldValue(request, ["assunto", "assunto_central_requisicao", "ementa"]);
  const authority = getFieldValue(request, [
    "cargo_funcao_destinatario",
    "nome_promotor",
    "autoridade_consulente"
  ]);
  const cityAndState = [organizationSettings.city, organizationSettings.state]
    .filter(Boolean)
    .join("/");

  return [
    ...(cityAndState ? [infoParagraph("Município/UF", cityAndState)] : []),
    ...(recipient ? [infoParagraph("Destinatário", recipient)] : []),
    ...(authority ? [infoParagraph("Autoridade/cargo relacionado", authority)] : []),
    ...(subject ? [infoParagraph("Assunto", subject)] : [])
  ];
}

export function sanitizeDocxText(value: unknown) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

function buildInstitutionalHeader(settings: OrganizationSettings) {
  const organizationName = settings.organization_name || "Gabinete Inteligente";
  const locationLine = [settings.city, settings.state].filter(Boolean).join(" - ");
  const contactLine = [settings.address, settings.phone, settings.email, settings.website]
    .filter(Boolean)
    .join(" | ");
  const customHeader = sanitizeDocxText(settings.header_text);

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: sanitizeDocxText(organizationName),
          bold: true,
          size: 28
        })
      ]
    }),
    ...(locationLine ? [centeredSmallParagraph(locationLine)] : []),
    ...(contactLine ? [centeredSmallParagraph(contactLine)] : []),
    ...(customHeader ? buildTextParagraphs(customHeader, true) : []),
    spacer()
  ];
}

function titleForModule(moduleSlug: DocumentRequest["module_slug"]) {
  const titles: Record<DocumentRequest["module_slug"], string> = {
    oficios: "Ofício",
    "ministerio-publico": "Resposta ao Ministério Público",
    pareceres: "Parecer preliminar",
    "normas-municipais": "Ficha de norma municipal",
    checklists: "Checklist administrativo"
  };

  return titles[moduleSlug];
}

function buildTextParagraphs(value: string, centered = false) {
  const text = sanitizeDocxText(value);

  if (!text) {
    return [paragraph("Sem conteúdo informado.", centered)];
  }

  return text
    .split(/\n{2,}/)
    .flatMap((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      const joined = lines.join("\n");
      return joined ? [paragraph(joined, centered)] : [];
    });
}

function getFieldValue(request: DocumentRequest, fieldNames: string[]) {
  for (const fieldName of fieldNames) {
    const value = request.structured_fields[fieldName];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function infoParagraph(label: string, value: string) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({ text: `${label}: `, bold: true }),
      new TextRun({ text: sanitizeDocxText(value) })
    ]
  });
}

function paragraph(value: string, centered = false) {
  return new Paragraph({
    alignment: centered ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: { after: 180 },
    children: [
      new TextRun({
        text: sanitizeDocxText(value),
        size: 24
      })
    ]
  });
}

function centeredSmallParagraph(value: string) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: sanitizeDocxText(value),
        size: 20
      })
    ]
  });
}

function spacer() {
  return new Paragraph({ children: [new TextRun({ text: "" })] });
}

function signatureBlock(settings: OrganizationSettings) {
  const signer =
    settings.default_secretary_name ||
    settings.attorney_name ||
    settings.mayor_name ||
    "Autoridade ou profissional competente";

  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 720 },
    children: [
      new TextRun({ text: "________________________________________", break: 1 }),
      new TextRun({ text: sanitizeDocxText(signer), break: 1, bold: true }),
      new TextRun({ text: "Assinatura e validação competente", break: 1 })
    ]
  });
}
