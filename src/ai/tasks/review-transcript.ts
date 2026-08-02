import { getAIObjectResponse } from "@/ai";
import { reviewTranscriptOutput } from "@/ai/outputs";

interface ReviewTranscriptArgs {
  transcript: string;
  nativeLanguage: string;
}

export function reviewTranscript({
  transcript,
  nativeLanguage,
}: ReviewTranscriptArgs) {
  return getAIObjectResponse({
    messages: [
      {
        role: "user",
        content: `Analyze the following transcript. Based on its sentence patterns, vocabulary, and expressions, generate exactly 15 new practice sentences in ${nativeLanguage} for the learner to translate into English.\n\nTranscript:\n${transcript}`,
      },
    ],
    output: reviewTranscriptOutput,
  });
}
