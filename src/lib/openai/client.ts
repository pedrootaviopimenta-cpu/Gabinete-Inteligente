import OpenAI from "openai";

export function createOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}
