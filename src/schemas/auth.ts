import { z } from "zod";
import { createUserSchema } from "@/db/types";

export const signUpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  nativeLanguage: createUserSchema.shape.nativeLanguage,
  plan: createUserSchema.shape.plan,
  rememberMe: z.boolean().optional().default(false),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
});
export type SignInInput = z.infer<typeof signInSchema>;
