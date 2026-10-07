// Stub: props are typed so the dispatchers stay type-safe, but go unused until
// the real UI lands.
import type { FillInTheBlankPayload } from "@/schemas/quiz";

import ComingSoon from "./coming-soon";

interface FillInTheBlankPromptProps {
  payload: FillInTheBlankPayload;
}

export default function FillInTheBlankPrompt(_: FillInTheBlankPromptProps) {
  return <ComingSoon />;
}
