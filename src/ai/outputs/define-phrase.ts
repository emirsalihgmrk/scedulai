import { phraseDefinitionSchema } from "@/schemas/vocabulary";

const { shape } = phraseDefinitionSchema;

export const definePhraseOutputSchema = phraseDefinitionSchema.extend({
  phrase: shape.phrase.describe(
    "The selected English words in dictionary form: base verb, singular noun, no article. Keep a multi-word expression whole.",
  ),
  meaning: shape.meaning.describe(
    "Its meaning in this sentence, as a short dictionary-style equivalent in the learner's native language.",
  ),
});
