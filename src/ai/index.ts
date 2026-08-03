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

const SYSTEM_PROMPT =
  "You are an expert language teacher on the ScedulAI platform.";

interface ObjectAgentArgs<T> {
  model?: string;
  system?: string;
  messages: ModelMessage[];
  output: {
    schema: z.Schema<T>;
    description?: string;
  };
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export async function getAIObjectResponse<T>({
  model = DEFAULT_MODEL,
  system = SYSTEM_PROMPT,
  messages,
  output,
}: ObjectAgentArgs<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
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
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
      }
    }
  }

  throw lastError;
}
