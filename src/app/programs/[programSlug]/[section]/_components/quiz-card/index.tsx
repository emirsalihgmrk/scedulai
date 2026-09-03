"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { QuestionWithAnswer, QuizWithQuestions } from "@/schemas/quiz";
import { OverviewStep } from "./overview-step";
import { QuestionStep } from "./question-step";

export function QuizCard({
  quiz,
  nativeLangLabel,
  targetLangLabel,
}: {
  quiz: QuizWithQuestions;
  nativeLangLabel: string;
  targetLangLabel: string;
}) {
  const total = quiz.questions.length;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [graded, setGraded] = useState<Record<string, QuestionWithAnswer>>({});

  const questions = quiz.questions.map((q) => graded[q.id] ?? q);
  const answered = questions.filter((q) => q.answer !== null).length;
  const unanswered = total - answered;
  const progress = total === 0 ? 0 : Math.round((answered / total) * 100);

  const isOverview = step === 0;
  const question = isOverview ? undefined : questions[step - 1];

  return (
    <div className="sticky top-20">
      <Card
        aria-label="Translation quiz"
        className={`relative flex h-[80vh] flex-col gap-0 overflow-hidden py-0`}
      >
        {/* Active accent bar (shown while answering a question) */}
        {!isOverview && (
          <div className="absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r from-primary to-chart-5" />
        )}

        {isOverview || !question ? (
          <OverviewStep
            quiz={quiz}
            questions={questions}
            answered={answered}
            unanswered={unanswered}
            progress={progress}
            onStart={() => setStep(1)}
            onGoTo={setStep}
          />
        ) : (
          <QuestionStep
            key={question.id}
            question={question}
            index={step}
            total={total}
            nativeLangLabel={nativeLangLabel}
            targetLangLabel={targetLangLabel}
            value={answers[question.id] ?? ""}
            onChange={(value) =>
              setAnswers((prev) => ({ ...prev, [question.id]: value }))
            }
            onOverview={() => setStep(0)}
            onPrev={() => setStep((s) => s - 1)}
            onNext={() => setStep((s) => Math.min(s + 1, total))}
            onGraded={(q) => setGraded((prev) => ({ ...prev, [q.id]: q }))}
          />
        )}
      </Card>
    </div>
  );
}
