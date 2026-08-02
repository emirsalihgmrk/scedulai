import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output, ModelMessage } from "ai";
import { z } from "zod";

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY ortam değişkeni tanımlanmamış!");
}

export const DEFAULT_MODEL = "google/gemini-2.5-flash";

export const aiProvider = createOpenRouter({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "ScedulAI",
  },
});

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
  model = DEFAULT_MODEL,
  system,
  messages,
  output,
}: ObjectAgentArgs<T>): Promise<T> {
  const result = await generateText({
    model: aiProvider(model),
    system,
    messages,
    output: Output.object({
      schema: output.schema,
      description: output.description,
    }),
  });

  return result.output as T;
}
