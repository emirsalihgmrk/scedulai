import { Sparkles } from "lucide-react";
import { VideoPanel } from "./_components/video-panel";
import { QuizPanel } from "./_components/quiz-panel";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex  items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              Scedu<span className="text-primary">lAI</span>
            </span>
          </div>
          <nav className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="hidden rounded-full bg-muted px-3 py-1.5 sm:inline-flex">
              Lesson 12 · Communication
            </span>
            <span className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                AK
              </span>
              Ada K.
            </span>
          </nav>
        </div>
      </header>

      {/* Split view */}
      <main className="mx-auto  px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr] xl:gap-8">
          <section aria-label="Video and transcript">
            <VideoPanel />
          </section>
          <section aria-label="AI interactive quiz">
            <QuizPanel />
          </section>
        </div>
      </main>
    </div>
  );
}
