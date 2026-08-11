import { GraduationCap, CircleCheck, Clock, Gauge } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuizCardActive } from "@/app/_components/quiz-card-active";
import { QuizCardAnswered } from "@/app/_components/quiz-card-answered";

export function QuizPanel() {
  const answered = 3;
  const unanswered = 2;
  const total = answered + unanswered;
  const progress = Math.round((answered / total) * 100);

  return (
    <div className="flex min-h-0 flex-col gap-5">
      {/* Overview bar */}
      <Card aria-label="Quiz overview" className="gap-4">
        <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Gauge className="size-5" />
          </span>
          <div className="leading-tight">
            <CardTitle className="font-display">Translation Quiz</CardTitle>
            <CardDescription className="text-xs">
              Generated from this talk
            </CardDescription>
          </div>
          <CardAction className="row-span-1 self-center">
            <Badge className="gap-1.5 bg-warning/15 font-bold text-warning-foreground ring-1 ring-inset ring-warning/30">
              <GraduationCap />
              CEFR: B1
            </Badge>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 rounded-xl bg-success/10 px-3 py-2.5">
              <CircleCheck className="size-4 text-success" />
              <span className="text-sm font-medium text-foreground">
                Answered:{" "}
                <span className="font-bold tabular-nums">{answered}</span>
              </span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-muted px-3 py-2.5">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Unanswered:{" "}
                <span className="font-bold tabular-nums">{unanswered}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <span>Progress</span>
              <span className="tabular-nums">
                {answered} / {total}
              </span>
            </div>
            <Progress
              value={progress}
              className="**:data-[slot=progress-indicator]:bg-linear-to-r **:data-[slot=progress-indicator]:from-primary **:data-[slot=progress-indicator]:to-chart-5 **:data-[slot=progress-track]:h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cards */}
      <div className="flex flex-col gap-4">
        <QuizCardActive />
        <QuizCardAnswered />
      </div>
    </div>
  );
}
