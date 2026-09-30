import { z } from "zod";

// ── Service input schemas ──

// Validated on the client only: sign-in calls go through authClient so
// better-auth's /api/auth rate limits apply.
export const sendOtpSchema = z.object({
  email: z.email("Enter a valid email address"),
});
export type SendOtpInput = z.infer<typeof sendOtpSchema>;

export const verifyOtpSchema = sendOtpSchema.extend({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
