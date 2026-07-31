import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output, ModelMessage } from "ai";
import { z } from "zod";
import { outputs } from "./outputs";

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

interface ObjectAgentArgs<T> {
  model?: string;
  system?: string;
  messages: ModelMessage[];
  output: {
    schema: z.Schema<T>;
    description?: string;
  };
}

export async function getAIObjectResponse<T>({
  model = "google/gemini-2.5-flash",
  system = SYSTEM_PROMPT,
  messages,
  output,
}: ObjectAgentArgs<T>) {
  const result = await generateText({
    model: aiProvider(model),
    system,
    messages,
    output: Output.object({
      schema: output.schema,
      description: output.description,
    }),
  });

  return result;
}

export { outputs };
