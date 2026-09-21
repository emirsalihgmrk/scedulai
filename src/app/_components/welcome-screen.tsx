"use client";
//DEMO — Bu dosyanın tamamı geçici demo karşılama/landing ekranıdır. Gerçek auth'a dönerken silin.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlayCircle, PenLine, Sparkles } from "lucide-react";

import { startDemoAction } from "@/actions/demo";
import { SUPPORTED_NATIVE_LANGUAGES } from "@/constants/language";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthBrandPanel } from "@/app/auth/_components/auth-brand-panel";

const STEPS = [
  {
    icon: PlayCircle,
    title: "İzle",
    description: "Gerçek videoları ve altyazılarını izle.",
  },
  {
    icon: PenLine,
    title: "Çevir",
    description: "Cümleleri İngilizce'ye kendin çevir.",
  },
  {
    icon: Sparkles,
    title: "Öğren",
    description: "AI çevirini anında puanlayıp düzeltsin.",
  },
] as const;

export function WelcomeScreen() {
  const router = useRouter();
  const [nativeLanguage, setNativeLanguage] = useState("tr");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onStart = async () => {
    setLoading(true);
    setError(null);
    const result = await startDemoAction({ nativeLanguage });
    if (result.ok) {
      router.push("/programs");
      router.refresh();
      return;
    }
    setError(result.error);
    setLoading(false);
  };

  return (
    <>
      <main className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <header className="mb-8">
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wider text-primary uppercase">
              AI ile İngilizce
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
              Gerçek videolarla İngilizce öğren
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              AI çevirini anında değerlendirip düzeltir. Kayıt yok — ana dilini
              seç, saniyeler içinde ilk seansına gir.
            </p>
          </header>

          {/* Nasıl çalışır — mobilde de görünür (brand panel yalnız desktop). */}
          <ol className="mb-8 grid gap-3 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-xl border border-border bg-card/50 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <step.icon className="size-4" />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {index + 1}. adım
                  </span>
                </div>
                <p className="mt-2.5 text-sm font-semibold text-foreground">
                  {step.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Başlatılamadı</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="nativeLanguage">Ana dilin</FieldLabel>
              <Select
                value={nativeLanguage}
                onValueChange={(value) => value && setNativeLanguage(value)}
              >
                <SelectTrigger id="nativeLanguage" size="lg" className="w-full">
                  <SelectValue placeholder="Dil seç">
                    {(value) => {
                      const language = SUPPORTED_NATIVE_LANGUAGES.find(
                        (item) => item.code === value,
                      );
                      return language ? (
                        <>
                          <span
                            className={cn(
                              "fi rounded-xs",
                              `fi-${language.countryCode}`,
                            )}
                          />
                          {language.nativeName}
                        </>
                      ) : null;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_NATIVE_LANGUAGES.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      <span
                        className={cn(
                          "fi rounded-xs",
                          `fi-${language.countryCode}`,
                        )}
                      />
                      {language.nativeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Açıklamalar ve düzeltmeler bu dilde yapılır. Hedef dil: İngilizce.
              </FieldDescription>
            </Field>

            <Button
              type="button"
              onClick={onStart}
              disabled={loading}
              className="h-11 w-full text-sm font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Hazırlanıyor...
                </>
              ) : (
                <>Başla</>
              )}
            </Button>
          </FieldGroup>

          {/* //DEMO: demo beklenti notu */}
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Bu bir demodur — ilerlemen yalnızca bu tarayıcıda saklanır ve
            sıfırlanabilir.
          </p>
        </div>
      </main>

      <AuthBrandPanel
        eyebrow="AI Language Tutor"
        title="İlk seansında öğrenmeye başla."
        description="Ana dilini söyle; eğitmen açıklamalarını, temposunu ve düzeltmelerini ona göre uyarlasın."
        features={[
          "Gerçek videolardan üretilen alıştırmalar",
          "Ana dilinde açıklanan düzeltmeler",
          "Anında AI geri bildirimi",
        ]}
      />
    </>
  );
}