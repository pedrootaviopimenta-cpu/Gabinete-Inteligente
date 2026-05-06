import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { HUMAN_REVIEW_NOTICE, getModuleBySlug, isModuleSlug } from "@/lib/modules";

export const runtime = "nodejs";

type DraftRequest = {
  moduleSlug?: string;
  context?: string;
};

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(request: Request) {
  const body = (await request.json()) as DraftRequest;
  const moduleSlug = body.moduleSlug;
  const context = body.context?.trim();

  if (!moduleSlug || !isModuleSlug(moduleSlug)) {
    return NextResponse.json(
      { error: "Modulo invalido para geracao de minuta." },
      { status: 400 }
    );
  }

  if (!context) {
    return NextResponse.json(
      { error: "Informe o contexto administrativo antes de gerar a minuta." },
      { status: 400 }
    );
  }

  if (!openai) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY nao configurada. A estrutura esta pronta, mas a geracao real depende da variavel de ambiente."
      },
      { status: 503 }
    );
  }

  const module = getModuleBySlug(moduleSlug);
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
          "Contexto fornecido pelo usuario:",
          context,
          "",
          "Modulo solicitado:",
          module.name
        ].join("\n")
      }
    ]
  });

  const content = completion.choices[0]?.message.content?.trim();

  return NextResponse.json({
    draft: ensureHumanReviewNotice(content || "", HUMAN_REVIEW_NOTICE),
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
