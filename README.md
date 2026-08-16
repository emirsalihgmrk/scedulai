# ScedulAI

Kişiselleştirilmiş dil öğrenme platformu. Video transkriptlerinden cümle üretir, kullanıcı çevirisini LLM ile değerlendirir ve hataları zamanla takip ederek kişiye özel seans oluşturur.

## Tech Stack

- **Frontend + Backend:** Next.js (App Router) + Tailwind CSS
- **Veritabanı + Auth:** Supabase (PostgreSQL)
- **ORM:** Drizzle
- **LLM:** Anthropic SDK + OpenRouter
- **Video / Transkript:** YouTube Data API (planlanıyor)
- **E-posta:** Resend + Vercel Cron
- **Deploy:** Vercel + Supabase

## Geliştirme

```bash
npm run dev        # geliştirme sunucusu
npm run build      # production build
npm run lint       # ESLint
npx drizzle-kit push   # şema değişikliklerini Supabase'e uygula
npx drizzle-kit studio # DB görsel arayüz
```
