import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";
import { db } from "@/db";
import * as schema from "@/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

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
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      void resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "noreply@scedulai.com",
        to: user.email,
        subject: "Verify your ScedulAI account",
        html: `<p>Click <a href="${url}">here</a> to verify your email address.</p>`,
      });
    },
  },
  user: {
    additionalFields: {
      nativeLanguage: {
        type: "string",
        required: false,
        defaultValue: "tr",
        input: true,
        returned: true,
      },
      targetLanguage: {
        type: "string",
        required: false,
        defaultValue: "en",
        input: false,
        returned: true,
      },
      plan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: true,
        returned: true,
      },
    },
  },
  // Must be the last plugin so it can set cookies from server actions
  // (e.g. signInEmail / signUpEmail). Without it the session cookie is
  // never sent to the browser even though the DB session is created.
  plugins: [nextCookies()],
});