# Todo — Faz 1: Çekirdek MVP Döngüsü

## Faz 0 — Hazırlık

- [x] `git init` yap
- [x] Next.js projesi oluştur (`npx create-next-app@latest`)
- [x] Tailwind CSS kur
- [ ] Supabase projesi aç, bağlantı bilgilerini `.env.local`'a ekle
- [ ] Drizzle ORM kur ve Supabase'e bağla
- [ ] Boş projeyi Vercel'e deploy et ("merhaba dünya" testi)

## Faz 1 — Transkript + Cümle Üretimi

- [ ] `lib/llm.ts` soyutlama katmanını yaz (model takas edilebilir, caching hazır)
- [ ] YouTube transkript çekme endpoint'i: `POST /api/transcript` → `{ videoId }` → ham transkript
- [ ] LLM ile transkripti analiz et: nadir kelimeleri işaretle, zorluk sırala
- [ ] 15 ana-dil cümlesi üret: `POST /api/session/generate` → cümle listesi
- [ ] Basit seans arayüzü: tek cümle göster, kullanıcı çeviriyi girer
- [ ] `POST /api/session/check` → kullanıcı çevirisini LLM ile değerlendir, hata açıkla
- [ ] Seans akışı: 15 cümle bitince "yarın devam" ekranı

## Faz 1 — Ölçüm (Faz 2'ye geçmeden önce)

- [ ] Her LLM çağrısında token sayısını logla
- [ ] Prompt caching'in token tasarrufu etkisini ölç
- [ ] 1 tam seans için ortalama maliyeti hesapla

## Bekleyen (Faz 2+)

- Supabase Auth ile hesaplar
- `errors` ve `vocabulary` tablolarını devreye al
- Hata geçmişine dayalı kişiselleştirilmiş cümle üretimi
- İlerleme panosu
- E-posta hatırlatma
