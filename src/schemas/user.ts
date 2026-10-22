import { z } from "zod";

import { createUserRowSchema, userRowSchema } from "@/db/rows";

// ── Query types ──

// Parsed at runtime: the session user comes from better-auth, not the DAL.
export const userSchema = userRowSchema.pick({
  id: true,
  name: true,
  email: true,
  nativeLanguage: true,
  plan: true,
  role: true,
  timeZone: true,
});
export type User = z.infer<typeof userSchema>;

// ── DAL input schemas ──

function isTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

// better-auth owns identity writes (email, sessions); the app only updates
// these profile fields.
export const updateUserSchema = createUserRowSchema
  .pick({ name: true, nativeLanguage: true, timeZone: true })
  .extend({
    name: z.string().trim().min(1, "Tell us what to call you").max(60),
    timeZone: z.string().max(64).refine(isTimeZone, "Unknown time zone"),
  })
  .partial();
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ── Service input schemas ──

export const saveTimeZoneSchema = updateUserSchema
  .pick({ timeZone: true })
  .required();
export type SaveTimeZoneInput = z.infer<typeof saveTimeZoneSchema>;
