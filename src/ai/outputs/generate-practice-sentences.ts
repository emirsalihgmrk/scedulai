import { z } from "zod";

import { sentencePairSchema } from "@/ai/outputs/generate-sentences";

export const generatePracticeSentencesOutputSchema = z.object({
  sentences: z.array(sentencePairSchema),
});

export type GeneratePracticeSentencesOutput = z.infer<
  typeof generatePracticeSentencesOutputSchema
>;
