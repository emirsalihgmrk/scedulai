import { Fragment } from "react";
import type { ReactNode } from "react";

import SaveGlossButton from "@/components/shared/quiz/save-gloss-button";
import { splitByGlosses } from "@/components/shared/quiz/utils";
import type { GlossForm } from "@/components/shared/quiz/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Gloss } from "@/schemas/quiz";

interface GlossedTextProps {
  text: string;
  glosses: Gloss[];
  form: GlossForm;
  renderHint: (gloss: Gloss) => ReactNode;
  onSaveGloss?: (gloss: Gloss) => Promise<boolean>;
}

export default function GlossedText({
  text,
  glosses,
  form,
  renderHint,
  onSaveGloss,
}: GlossedTextProps) {
  const segments = splitByGlosses(text, glosses, form);

  return segments.map(({ text: segment, gloss }, index) =>
    gloss ? (
      <Popover key={index}>
        <PopoverTrigger
          openOnHover
          delay={150}
          className="cursor-help underline decoration-muted-foreground/60 decoration-dotted decoration-2 underline-offset-[0.35em] transition-colors [text-decoration-skip-ink:none] hover:decoration-primary data-popup-open:decoration-primary"
        >
          {segment}
        </PopoverTrigger>
        <PopoverContent side="top" className="w-auto max-w-64 gap-2 px-3 py-2">
          {renderHint(gloss)}
          {onSaveGloss && <SaveGlossButton onSave={() => onSaveGloss(gloss)} />}
        </PopoverContent>
      </Popover>
    ) : (
      <Fragment key={index}>{segment}</Fragment>
    ),
  );
}