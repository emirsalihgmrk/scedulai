// C2 is not tested: a short multiple-choice test cannot tell C1 from C2.
export const PLACEMENT_LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;
export type PlacementLevel = (typeof PLACEMENT_LEVELS)[number];

// Share of a level's questions that must be right to pass that level.
export const PLACEMENT_PASS_RATIO = 2 / 3;

export interface PlacementQuestion {
  id: string;
  level: PlacementLevel;
  prompt: string;
  options: readonly string[];
  correctIndex: number;
}

// Shipped to the client with the answers: the test runs before sign-up and the
// result only sets the learner's own starting level, so there is nothing to
// protect. The server still does the scoring.
export const PLACEMENT_QUESTIONS: readonly PlacementQuestion[] = [
  {
    id: "en-a1-1",
    level: "A1",
    prompt: "She ___ a teacher.",
    options: ["are", "is", "am", "be"],
    correctIndex: 1,
  },
  {
    id: "en-a1-2",
    level: "A1",
    prompt: "I ___ coffee every morning.",
    options: ["drinks", "drinking", "drink", "drank"],
    correctIndex: 2,
  },
  {
    id: "en-a1-3",
    level: "A1",
    prompt: "Where ___ you from?",
    options: ["is", "are", "do", "does"],
    correctIndex: 1,
  },
  {
    id: "en-a2-1",
    level: "A2",
    prompt: "Yesterday we ___ to the cinema.",
    options: ["went", "go", "goes", "gone"],
    correctIndex: 0,
  },
  {
    id: "en-a2-2",
    level: "A2",
    prompt: "There isn't ___ milk in the fridge.",
    options: ["some", "a", "any", "many"],
    correctIndex: 2,
  },
  {
    id: "en-a2-3",
    level: "A2",
    prompt: "My brother is ___ than me.",
    options: ["tall", "more tall", "tallest", "taller"],
    correctIndex: 3,
  },
  {
    id: "en-b1-1",
    level: "B1",
    prompt: "If it rains tomorrow, we ___ at home.",
    options: ["will stay", "stay", "would stay", "stayed"],
    correctIndex: 0,
  },
  {
    id: "en-b1-2",
    level: "B1",
    prompt: "I've lived here ___ 2019.",
    options: ["for", "from", "since", "during"],
    correctIndex: 2,
  },
  {
    id: "en-b1-3",
    level: "B1",
    prompt: "The book ___ by millions of people.",
    options: ["has read", "has been read", "is reading", "have read"],
    correctIndex: 1,
  },
  {
    id: "en-b2-1",
    level: "B2",
    prompt: "I wish I ___ more time to travel.",
    options: ["have", "would have", "had", "having"],
    correctIndex: 2,
  },
  {
    id: "en-b2-2",
    level: "B2",
    prompt: "She suggested ___ the meeting until Monday.",
    options: ["postponing", "to postpone", "postpone", "to postponing"],
    correctIndex: 0,
  },
  {
    id: "en-b2-3",
    level: "B2",
    prompt: "By the time we arrived, the film ___.",
    options: [
      "already started",
      "has already started",
      "was already starting",
      "had already started",
    ],
    correctIndex: 3,
  },
  {
    id: "en-c1-1",
    level: "C1",
    prompt: "Not only ___ late, but he also forgot the documents.",
    options: ["he arrived", "did he arrive", "he did arrive", "arrived he"],
    correctIndex: 1,
  },
  {
    id: "en-c1-2",
    level: "C1",
    prompt: "The proposal was rejected on the ___ that it was too expensive.",
    options: ["reasons", "purposes", "motives", "grounds"],
    correctIndex: 3,
  },
  {
    id: "en-c1-3",
    level: "C1",
    prompt: "Had I known about the delay, I ___ earlier.",
    options: ["would have left", "would leave", "left", "had left"],
    correctIndex: 0,
  },
];
