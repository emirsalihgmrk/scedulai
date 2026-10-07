import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { after } from "next/server";
import { Resend } from "resend";

import { db } from "@/db";
import * as schema from "@/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

const DAY_SECONDS = 60 * 60 * 24;

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.userTable,
      session: schema.sessionTable,
      account: schema.accountTable,
      verification: schema.verificationTable,
    },
  }),
  // Passwordless: every sign-in costs a trip to the inbox, so sessions are
  // long-lived and slide forward on use.
  session: {
    expiresIn: DAY_SECONDS * 30,
    updateAge: DAY_SECONDS,
  },
  // Additional fields are never client-writable (`input: false`), otherwise
  // authClient.updateUser() could set them. `nativeLanguage` is written by the
  // onboarding service; `plan` changes only through billing.
  user: {
    additionalFields: {
      nativeLanguage: {
        type: "string",
        required: false,
        defaultValue: "tr",
        input: false,
        returned: true,
      },
      plan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
        returned: true,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
        returned: true,
      },
    },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      storeOTP: "hashed",
      sendVerificationOTP: async ({ email, otp }) => {
        if (process.env.NODE_ENV !== "production") {
          console.info(`[auth] OTP for ${email}: ${otp}`);
        }

        after(async () => {
          const { error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL ?? "noreply@scedulai.com",
            to: email,
            subject: `${otp} is your ScedulAI code`,
            html: `<p>Your ScedulAI sign-in code is <strong>${otp}</strong>.</p><p>It expires in 10 minutes. If you didn't request it, you can ignore this email.</p>`,
          });
          if (error) {
            console.error("[auth] OTP email failed:", error);
          }
        });
      },
    }),
    // Must be the last plugin so it can set cookies from server actions.
    nextCookies(),
  ],
});
