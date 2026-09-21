//DEMO — Bu dosyanın tamamı geçici demo modu içindir. Gerçek auth'a dönerken silin.
import { cookies } from "next/headers";
import { and, count, eq, gte } from "drizzle-orm";

import { db } from "@/db";
import { aiTracesTable, userTable } from "@/db/schema";
import { AppError } from "@/lib/errors";
import { userSchema, type User } from "@/schemas/auth";
import type { SupportedNativeLanguageCode } from "@/constants/language";

export const DEMO_USER_COOKIE = "demo_user";

// Cookie'deki demo kullanıcıyı okur. Server tarafında çağrılır (getCurrentUser).
export async function readDemoUser(): Promise<User | null> {
  const store = await cookies();
  const raw = store.get(DEMO_USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return userSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

// FK'lerin (answers / section_progress → user.id) geçerli olması için DB'ye
// gerçek bir demo-user satırı yazar.
export async function upsertDemoUserRow(user: {
  id: string;
  nativeLanguage: SupportedNativeLanguageCode;
}): Promise<void> {
  const now = new Date();
  await db
    .insert(userTable)
    .values({
      id: user.id,
      name: "Demo User",
      email: `${user.id}@demo.local`,
      emailVerified: true,
      plan: "free",
      nativeLanguage: user.nativeLanguage,
      targetLanguage: "en",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: userTable.id,
      set: { nativeLanguage: user.nativeLanguage, updatedAt: now },
    });
}

// Herkese açık demo için LLM maliyet koruması. Kimlik bariyeri olmadığından
// tek demo-user her AI çağrısında token harcatabilir → kayan pencere sınırı.
// Sayaç kaynağı: ai_traces (her analyze-sentence çağrısı userId + createdAt ile
// loglanır). Not: trace yanıttan sonra (after()) yazıldığından burst sınırı
// hafif gevşek olabilir; günlük sınır toplamı yine de sıkı tutar.
export const DEMO_RATE_LIMIT = { perMinute: 10, perDay: 50 } as const;

async function countTraces(userId: string, since: Date): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(aiTracesTable)
    .where(
      and(
        eq(aiTracesTable.userId, userId),
        eq(aiTracesTable.task, "analyze-sentence"),
        gte(aiTracesTable.createdAt, since),
      ),
    );
  return row?.n ?? 0;
}

export async function assertDemoRateLimit(userId: string): Promise<void> {
  const now = Date.now();

  const perMinute = await countTraces(userId, new Date(now - 60_000));
  if (perMinute >= DEMO_RATE_LIMIT.perMinute) {
    throw new AppError("Çok hızlı gidiyorsun, biraz bekleyip tekrar dene.");
  }

  const perDay = await countTraces(userId, new Date(now - 24 * 60 * 60_000));
  if (perDay >= DEMO_RATE_LIMIT.perDay) {
    throw new AppError("Günlük demo sınırına ulaştın, yarın tekrar dene.");
  }
}
