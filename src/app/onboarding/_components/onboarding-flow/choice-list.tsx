"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface ChoiceOption {
  value: string;
  title: string;
  description?: string;
  icon?: ReactNode;
}

interface ChoiceListProps {
  name: string;
  label: string;
  options: ChoiceOption[];
  value: string | undefined;
  onValueChange: (value: string) => void;
  columns?: 1 | 2;
  className?: string;
}

// Single-choice list rendered as selectable cards (shadcn "choice card"
// pattern). Picking an option immediately reports it; the flow decides
// whether to advance.
export default function ChoiceList({
  name,
  label,
  options,
  value,
  onValueChange,
  columns = 1,
  className,
}: ChoiceListProps) {
  return (
    <RadioGroup
      name={name}
      aria-label={label}
      value={value ?? null}
      onValueChange={(next) => onValueChange(String(next))}
      className={cn(columns === 2 && "sm:grid-cols-2", className)}
    >
      {options.map((option) => {
        const id = `${name}-${option.value}`;
        return (
          <FieldLabel key={option.value} htmlFor={id} className="w-full">
            <Field orientation="horizontal" className="items-center">
              {option.icon}
              <FieldContent>
                <FieldTitle>{option.title}</FieldTitle>
                {option.description && (
                  <FieldDescription>{option.description}</FieldDescription>
                )}
              </FieldContent>
              <RadioGroupItem id={id} value={option.value} />
            </Field>
          </FieldLabel>
        );
      })}
    </RadioGroup>
  );
}
