import { phraseDefinitionSchema } from "@/schemas/vocabulary";

const { shape } = phraseDefinitionSchema;

export const definePhraseOutputSchema = phraseDefinitionSchema.extend({
  englishLemma: shape.englishLemma.describe(
    "The selected English words in dictionary form: base verb, singular noun, no article. Keep a multi-word expression whole.",
  ),
  nativeLemma: shape.nativeLemma.describe(
    "Its meaning in this sentence, as a short dictionary-style equivalent in the learner's native language.",
  ),
});
