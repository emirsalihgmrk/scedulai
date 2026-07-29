import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, ModelMessage, stepCountIs } from "ai";
import getTools from "./tools";

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY ortam değişkeni tanımlanmamış!");
}

export const aiProvider = createOpenRouter({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "ScedulAI",
  },
});

export const SYSTEM_PROMPT = `
Sen ScedulAI platformunda görev yapan uzman bir dil öğretmenisin.
Görevin, verilen transkripti incelemek; kullanılan cümle yapılarını, kelimeleri ve ifade biçimlerini analiz etmek; ardından kullanıcının dilinde doğal, doğru ve akıcı cümleler üretmektir.
Kullanıcının çevirilerini değerlendir, hataları tespit et ve kısa, net, yapıcı geri bildirimler sun.
`.trim();

interface AgentArgs {
  model?: string;
  messages: ModelMessage[];
  system?: string;
  maxSteps?: number;
  toolName?: keyof ReturnType<typeof getTools>;
}

export async function getAIResponse({
  model = "google/gemini-2.5-flash",
  system = SYSTEM_PROMPT,
  messages,
  maxSteps = 5,
  toolName,
}: AgentArgs) {
  const result = await generateText({
    model: aiProvider(model),
    system,
    messages,
    tools: getTools(),
    toolChoice: toolName ? { type: "tool", toolName: toolName } : undefined,
    stopWhen: stepCountIs(maxSteps),
  });

  return {
    text: result.text,
    toolResults: result.toolResults,
  };
}
