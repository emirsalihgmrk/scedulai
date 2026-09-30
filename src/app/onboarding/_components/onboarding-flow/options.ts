import type {
  CefrLevel,
  DailyMinutes,
  LearningGoal,
} from "@/constants/learning";

// Sentinel for "I'm not sure" — radio values must be strings; it maps to a
// null level (placement test pending).
export const UNSURE_LEVEL = "unsure";

export const LEVEL_OPTIONS: {
  value: CefrLevel | typeof UNSURE_LEVEL;
  title: string;
  description: string;
}[] = [
  { value: "A1", title: "Beginner · A1", description: "I know a few words and phrases." },
  { value: "A2", title: "Elementary · A2", description: "I can handle simple, everyday exchanges." },
  { value: "B1", title: "Intermediate · B1", description: "I get the gist of clear, familiar topics." },
  { value: "B2", title: "Upper intermediate · B2", description: "I follow most videos without subtitles." },
  { value: "C1", title: "Advanced · C1", description: "I understand fast, natural speech." },
  { value: "C2", title: "Proficient · C2", description: "I'm polishing nuance and style." },
  { value: UNSURE_LEVEL, title: "I'm not sure", description: "We'll figure it out with a short placement test." },
];

export const GOAL_OPTIONS: {
  value: LearningGoal;
  title: string;
  description: string;
}[] = [
  { value: "work", title: "Work", description: "Meetings, emails and presentations." },
  { value: "travel", title: "Travel", description: "Getting around and talking to locals." },
  { value: "exam", title: "Exam", description: "IELTS, TOEFL and similar tests." },
  { value: "fun", title: "Fun", description: "Shows, videos and conversations I enjoy." },
];

export const DAILY_MINUTES_LABELS: Record<
  DailyMinutes,
  { title: string; description: string }
> = {
  5: { title: "5 min", description: "Casual" },
  10: { title: "10 min", description: "Regular" },
  15: { title: "15 min", description: "Serious" },
  20: { title: "20 min", description: "Intense" },
  30: { title: "30 min", description: "All in" },
};
