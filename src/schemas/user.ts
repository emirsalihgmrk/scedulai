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
});
export type User = z.infer<typeof userSchema>;

// ── DAL input schemas ──

// better-auth owns identity writes (email, sessions); the app only updates
// these profile fields.
export const updateUserSchema = createUserRowSchema
  .pick({ name: true, nativeLanguage: true })
  .extend({
    name: z.string().trim().min(1, "Tell us what to call you").max(60),
  })
  .partial();
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
