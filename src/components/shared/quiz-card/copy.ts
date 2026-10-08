// The card runs both a section's quiz and a mistake's practice; only this text
// tells them apart.
export const QUIZ_CARD_COPY = {
  section: {
    cardLabel: "Translation quiz",
    sourceLabel: "AI-generated from transcript",
    generatingTitle: "Quiz is being prepared with AI",
    generatingDescription:
      "Personalized translation sentences are being generated from your transcript...",
    errorTitle: "Quiz could not be prepared",
    completedTitle: "Quiz completed",
  },
  practice: {
    cardLabel: "Mistake practice",
    sourceLabel: "AI-generated for your mistake",
    generatingTitle: "Practice is being prepared with AI",
    generatingDescription:
      "New sentences are being written around your mistake...",
    errorTitle: "Practice could not be prepared",
    completedTitle: "Practice completed",
  },
} as const;
