# Done

- [x] `git init` yap
- [x] Next.js projesi oluştur (`npx create-next-app@latest`)
- [x] Tailwind CSS kur
- [x] Supabase projesi aç, bağlantı bilgilerini `.env.local`'a ekle
- [x] Drizzle ORM kur ve Supabase'e bağla
- [x] Boş projeyi Vercel'e deploy et ("merhaba dünya" testi)
- [x] Kullanılacak ai-sdk kararı ve konfigürasyonu
- [x] Otomatik video seçme mantığının eklenmesi
- [x] Kullanıcı cümlelerinin değerlendirilmesi
- [x] kısmi veritabanının oluşturulması
- [x] ~~TED.com scraper entegrasyonu~~ (kaldırıldı — bkz. DECISIONS.md [2026-08-16])
- [x] YouTube Data API ile video + transkript seed mantığının uygulanması (`src/db/seed.ts`)
- [x] quiz-panel.tsx: graduated-card bileşeninde original sentence yer alacak

# Next

## 💡 Fikir Kutusu (Backlog / İleride Düşünülecekler)

- **VideoPlayer → YouTube IFrame Player API'ye geçiş** (`react-youtube` veya doğrudan `YT.Player`): Şu an play tuşuna basılınca thumbnail yerine basit bir `<iframe>` geliyor; YouTube'un kendi UI'ı gösteriliyor. İleride custom control bar'ı (scrubber, rewind/forward, ses, tam ekran) gerçekten çalıştırmak için IFrame Player API kullanılmalı — `playerRef.current.playVideo()`, `pauseVideo()`, `seekTo()`, `getCurrentTime()` ile tam kontrol sağlanabilir.

- **getOrCreateQuiz metodu parçalama** getOrCreateQuizService ve dal metodu parçalanacak get or create mantığı ui da işlenecek

- **quiz-panel.tsx** quiz-panel.tsx dosyasında çok fazla prop drilling mevcut, iyileştirme yapılacak

## bugs

analyze-sentence.ts: mistakes alanı bazen kullanıcının ana dili yerine ingilizce verilebiliyor
