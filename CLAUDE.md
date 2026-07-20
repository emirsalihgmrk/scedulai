# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proje

ScedulAI — kişiselleştirilmiş dil öğrenme platformu. YouTube transkriptlerinden cümle üretir, kullanıcı çevirisini LLM ile değerlendirir, ve hataları zamanla takip ederek kişiye özel seans oluşturur. Rekabet avantajı modelde değil, biriktirilen kullanıcı verisinde (hata geçmişi, kelime ustalığı).

## Tech Stack

| Katman | Seçim |
|--------|-------|
| Frontend + Backend | Next.js (App Router) + Tailwind CSS |
| Veritabanı + Auth | Supabase (PostgreSQL) |
| ORM | Drizzle (veya Prisma) |
| LLM | Anthropic SDK + OpenRouter (model yönlendirici) |
| Transkript | youtube-transcript veya resmi altyazı API |
| E-posta | Resend + Vercel Cron |
| Deploy | Vercel (frontend) + Supabase (db) |

## Geliştirme Komutları

```bash
npm run dev        # geliştirme sunucusu
npm run build      # production build
npm run lint       # ESLint
npx drizzle-kit push   # şema değişikliklerini Supabase'e uygula
npx drizzle-kit studio # DB görsel arayüz
```

## Mimari

```
app/
  (auth)/          # login, register sayfaları
  (app)/           # oturum gerektiren sayfalar
    dashboard/
    programs/
    session/[id]/
  api/
    session/       # seans başlatma, cümle gönderme
    llm/           # LLM proxy — doğrudan model çağrısı buradan geçer
    transcript/    # YouTube transkript çekme
lib/
  llm.ts           # LLM soyutlama katmanı (model takas edilebilir)
  db/
    schema.ts      # Drizzle şema tanımları
    queries.ts     # sık kullanılan sorgular
```

## Kritik Mimari Kural — LLM Katmanı

`lib/llm.ts` her LLM çağrısını sarmalayan tek noktadır. Bileşenler veya API route'ları modeli doğrudan çağırmaz. Bu sayede:
- Model değişimi (Haiku ↔ Gemini Flash ↔ Sonnet) tek yerden yapılır
- Prompt caching bu katmanda uygulanır
- Token maliyeti merkezi olarak ölçülür

Varsayılan model: `claude-haiku-4-5` (ucuz, hızlı). Premium kullanıcı veya karmaşık analiz: `claude-sonnet-4-6`.

## Veri Modeli — Kritik Tablolar

`errors` tablosu projenin kalbidir. Her hata bir satır: `user_id`, `error_type`, `related_word`, `session_id`, `timestamp`, `resolved`. Yeni seans oluştururken sistem bu tablodan kullanıcının zayıf noktalarını çeker ve LLM'e hedef verir.

`vocabulary` tablosu: kelime, maruz kalma sayısı, doğru kullanım sayısı, ustalık skoru.

Seans cümlesi üretiminde şema: `errors` + `vocabulary` → LLM prompt → hedefli cümleler.

## Mevcut Faz

**Faz 1 — Çekirdek MVP Döngüsü** (hesap yok, tek kullanıcı, sadece çalışan döngü):
transkript al → nadir kelimeleri işaretle → 15 cümle üret → kullanıcı çevirir → LLM geri bildirim → ertesi gün 15 cümle daha.

Faz 2'ye geçmeden önce token maliyetini gerçek veriyle ölçmek zorunlu.