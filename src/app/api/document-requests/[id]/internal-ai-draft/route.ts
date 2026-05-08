import { readFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  badRequestResponse,
  forbiddenResponse,
  isSafeUuid,
  jsonNoStore,
  logControlledError,
  notFoundResponse,
  unauthorizedResponse
} from "@/lib/api-security";
import { createAuditEvent } from "@/lib/audit";
import { getDocumentRequest } from "@/lib/document-requests";
import { HUMAN_REVIEW_NOTICE, getModuleBySlug } from "@/lib/modules";
import { canAccessAdmin } from "@/lib/permissions";
import { getGiDeliveryMode, isAdminAiEnabled } from "@/lib/runtime-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INTERNAL_DRAFT_NOTICE =
  "Rascunho interno. Revisão humana obrigatória antes de qualquer utilização.";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  if (!canAccessAdmin(user)) {
    return forbiddenResponse("Operação restrita à equipe responsável.");
  }

  if (getGiDeliveryMode() !== "hybrid" || !isAdminAiEnabled() || !process.env.OPENAI_API_KEY) {
    return forbiddenResponse("Rascunho interno com IA indisponível neste ambiente.");
  }

  const { id } = await context.params;

  if (!isSafeUuid(id)) {
    return badRequestResponse("Identificador inválido.");
  }

  try {
    const documentRequest = await getDocumentRequest(id);

    if (!documentRequest) {
      return notFoundResponse("Solicitação não encontrada.");
    }

    const module = getModuleBySlug(documentRequest.module_slug);
    const [systemPrompt, modulePrompt] = await Promise.all([
      readPrompt("system.md"),
      readPrompt(module.promptFile)
    ]);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
            "Produza um rascunho interno para apoio da equipe responsável.",
            "Não entregue o texto como documento final e não afirme validade oficial.",
            "Não invente fatos, normas, artigos, jurisprudência ou documentos.",
            "Não substitua procurador, advogado, controlador interno, servidor técnico ou autoridade competente.",
            "",
            "Identificação da solicitação:",
            `Protocolo: ${documentRequest.protocol_number}`,
            `Módulo: ${module.name}`,
            `Título: ${documentRequest.title}`,
            `Prioridade: ${documentRequest.priority}`,
            "",
            "Contexto estruturado fornecido:",
            documentRequest.structured_context,
            "",
            "Avisos obrigatórios:",
            INTERNAL_DRAFT_NOTICE,
            HUMAN_REVIEW_NOTICE
          ].join("\n")
        }
      ]
    });
    const draft = ensureInternalNotice(completion.choices[0]?.message.content?.trim() || "");

    try {
      await createAuditEvent({
        requestId: documentRequest.id,
        eventType: "internal_ai_draft_generated",
        actorUsername: user.username,
        actorRole: user.role,
        description: "Rascunho interno com IA gerado para apoio da equipe responsável.",
        metadata: {
          moduleSlug: documentRequest.module_slug,
          model: process.env.OPENAI_MODEL || "gpt-4.1-mini"
        }
      });
    } catch (error) {
      logControlledError("audit_internal_ai_draft", error);
    }

    return jsonNoStore({
      draft,
      notice: INTERNAL_DRAFT_NOTICE
    });
  } catch (error) {
    logControlledError("internal_ai_draft", error);
    return jsonNoStore({ error: "Não foi possível gerar o rascunho interno." }, 500);
  }
}

async function readPrompt(fileName: string) {
  return readFile(path.join(process.cwd(), "prompts", fileName), "utf8");
}

function ensureInternalNotice(content: string) {
  const safeContent = content || "Não foi possível retornar conteúdo útil para o rascunho interno.";

  if (safeContent.includes(INTERNAL_DRAFT_NOTICE)) {
    return safeContent;
  }

  return `${safeContent}\n\n${INTERNAL_DRAFT_NOTICE}`;
}
