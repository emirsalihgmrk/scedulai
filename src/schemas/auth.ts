import { z } from "zod";
import { createUserRowSchema, userRowSchema } from "@/db/rows";

export const userSchema = userRowSchema.pick({
  id: true,
  name: true,
  email: true,
  nativeLanguage: true,
  plan: true,
  role: true,
});
export type User = z.infer<typeof userSchema>;

export const sendOtpSchema = z.object({
  email: z.email("Enter a valid email address"),
});
export type SendOtpInput = z.infer<typeof sendOtpSchema>;

export const verifyOtpSchema = sendOtpSchema.extend({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

// better-auth owns `user` writes for identity; onboarding only touches these.
export const updateUserSchema = createUserRowSchema
  .pick({ name: true, nativeLanguage: true })
  .partial();
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
