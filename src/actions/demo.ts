"use server";
//DEMO — Bu dosyanın tamamı geçici demo modu içindir. Gerçek auth'a dönerken silin.
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { z } from "zod";

import { DEMO_USER_COOKIE, readDemoUser, upsertDemoUserRow } from "@/lib/demo";
import { toActionFailure } from "@/lib/action";
import { userSchema } from "@/schemas/auth";
import { SUPPORTED_NATIVE_LANGUAGE_CODES } from "@/constants/language";
import type { ActionResult } from "@/schemas/common";

const startDemoSchema = z.object({
  nativeLanguage: z.enum(SUPPORTED_NATIVE_LANGUAGE_CODES),
});

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// Ana dili seçilen ziyaretçi için demo kimliğini oluşturur/günceller:
// DB'ye demo-user satırı yazar ve tarayıcıya kalıcı bir cookie koyar.
export async function startDemoAction(input: {
  nativeLanguage: string;
}): Promise<ActionResult> {
  try {
    const { nativeLanguage } = startDemoSchema.parse(input);

    // Var olan kimliği koru, yoksa yeni üret → yenilemede ilerleme kaybolmaz.
    const existing = await readDemoUser();
    const id = existing?.id ?? randomUUID();

    await upsertDemoUserRow({ id, nativeLanguage });

    const user = userSchema.parse({
      id,
      name: "Demo User",
      email: `${id}@demo.local`,
      nativeLanguage,
      targetLanguage: "en",
      plan: "free",
    });

    const store = await cookies();
    store.set(DEMO_USER_COOKIE, JSON.stringify(user), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: ONE_YEAR_SECONDS,
    });

    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}

// Demo'yu sıfırlamak için (elle test amaçlı). UserMenu kapalı olduğundan
// akışta zorunlu değil.
export async function endDemoAction(): Promise<ActionResult> {
  try {
    const store = await cookies();
    store.delete(DEMO_USER_COOKIE);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}
