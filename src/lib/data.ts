export const video = {
  title: "How Technology Shapes Communication",
  speaker: "Dr. Elena Voss",
  speakerRole: "Cognitive Linguist, MIT Media Lab",
  releaseDate: "March 14, 2026",
  duration: "18:42",
  currentTime: "04:12",
  progress: 22,
};

export type TranscriptRow = {
  id: number;
  time: string;
  text: string;
  state: "past" | "active" | "upcoming";
};

export const transcript: TranscriptRow[] = [
  {
    id: 1,
    time: "03:48",
    text: "For most of human history, communication was bound by distance and time.",
    state: "past",
  },
  {
    id: 2,
    time: "03:57",
    text: "A message could take weeks to cross an ocean, and a conversation required two people in the same room.",
    state: "past",
  },
  {
    id: 3,
    time: "04:12",
    text: "Today, artificial intelligence is quietly rewriting the rules of how we understand one another.",
    state: "active",
  },
  {
    id: 4,
    time: "04:24",
    text: "It translates in real time, predicts our next word, and even senses the tone behind our sentences.",
    state: "upcoming",
  },
  {
    id: 5,
    time: "04:39",
    text: "But the real question is not what the machine can say — it is how this changes the way we listen.",
    state: "upcoming",
  },
  {
    id: 6,
    time: "04:55",
    text: "In the coming years, fluency may matter less than curiosity and the willingness to connect.",
    state: "upcoming",
  },
];

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type ActiveQuiz = {
  id: number;
  index: number;
  sourceLang: string;
  targetLang: string;
  cefrLevel: CefrLevel;
  sentence: string;
};

export const activeQuiz: ActiveQuiz = {
  id: 4,
  index: 4,
  sourceLang: "Türkçe",
  targetLang: "English",
  cefrLevel: "B1",
  sentence: "Yapay zeka gelecekte iş dünyasını nasıl değiştirecek?",
};

export type AnsweredQuiz = {
  id: number;
  index: number;
  sourceLang: string;
  targetLang: string;
  cefrLevel: CefrLevel;
  sentence: string;
  originalSentence: string;
  userTranslation: string;
  accuracy: number;
  analysis: string;
  mistakes: string[];
  expressions: string[];
  alternatives: string[];
};

export const answeredQuiz: AnsweredQuiz = {
  id: 3,
  index: 3,
  sourceLang: "Türkçe",
  targetLang: "English",
  cefrLevel: "B1",
  sentence:
    "Teknoloji, insanların birbirini anlama biçimini sessizce yeniden yazıyor.",
  originalSentence:
    "Technology is quietly rewriting the way people understand one another.",
  userTranslation:
    "Technology is quietly rewrite the way people understand each other.",
  accuracy: 92,
  analysis:
    'Bu cümle present continuous (şimdiki sürekli) kipini kullanıyor. "Sessizce" zarfı eylemin fark edilmeden gerçekleştiğini vurgular. "Yeniden yazmak" fiili köklü bir dönüşümü simgeler; "rewrite" yerine "reshape" veya "transform" da doğal alternatiflerdir.',
  mistakes: [
    '"is quietly rewrite" yapısı yanlış — present continuous için yardımcı fiilden sonra "-ing" eki gerekir: "is quietly rewriting".',
  ],
  expressions: [
    "quietly rewriting — sessizce yeniden şekillendirmek, fark ettirmeden dönüştürmek",
    "understand one another — birbirini anlamak (resmi yazılarda each other yerine tercih edilir)",
  ],
  alternatives: [
    "Technology is silently reshaping how people understand each other.",
    "Technology quietly rewrites the rules of how we understand one another.",
  ],
};
