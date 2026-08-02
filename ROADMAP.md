# Dil Öğrenme Platformu — Detaylı Proje Planı

> **Ana ilke:** Değer modelde değil, kullanıcı hakkında biriktirdiğin veride. Her karar bu ilkeye hizmet etmeli. Ürün, kullanıcıyı ne kadar uzun süre tanırsa o kadar iyi çalışan bir öğrenen profili etrafında kurulur.

---

## 1. Genel Yapı (Mimari)

Sistemi birbirinden ayrılabilir katmanlar hâlinde düşün. Her katmanı ayrı ayrı geliştirip test edebilmen, en baştan doğru kurmaktan daha önemli.

```
┌─────────────────────────────────────────────────────────┐
│                    KULLANICI (Tarayıcı)                   │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  FRONTEND — Web Uygulaması                                │
│  • Program listesi, seans arayüzü, ilerleme panosu        │
│  • Cümle çevirme / geri bildirim sohbet ekranı            │
└───────────────────────────┬─────────────────────────────┘
                            │  (API çağrıları)
┌───────────────────────────▼─────────────────────────────┐
│  BACKEND — Uygulama Sunucusu / API                        │
│  • Kimlik doğrulama, program mantığı, seans akışı         │
│  • Prompt kurma + LLM çağrısı + cevap işleme              │
│  • Hata analizi ve profil güncelleme mantığı              │
└──────┬──────────────────┬───────────────────┬───────────┘
       │                  │                   │
┌──────▼──────┐   ┌────────▼────────┐   ┌──────▼──────────┐
│  VERİTABANI │   │  LLM KATMANI     │   │  DIŞ SERVİSLER  │
│  (Postgres) │   │  (model yönlen-  │   │  • Transkript   │
│  • kullanıcı│   │   dirme + cache) │   │  • E-posta      │
│  • profil   │   │  Haiku / Flash   │   │  • (sonra) Ses  │
│  • hatalar  │   │  premium: Sonnet │   │  • (sonra) Öde. │
│  • programlar│  └──────────────────┘   └─────────────────┘
└─────────────┘
```

**Kritik nokta — LLM Katmanı:** Modeli doğrudan çağırma; araya bir _soyutlama katmanı_ koy. Böylece maliyet/kalite dengesine göre modeli (Haiku ↔ Gemini Flash ↔ Sonnet) tek satır değiştirerek takas edebilirsin. Transkript ve sistem talimatı için **prompt caching** bu katmanda uygulanır; maliyetinin büyük kısmını burada kırarsın.

**Kritik nokta — Değerlendirme disiplini:** Bu katmanı sadece prompt yazıp denemezsin; Braintrust ile bir **golden dataset** kurup düzenli **evals** çalıştırırsın. Gerçek kullanıcı senaryolarını ve zor örnekleri dataset'e ekleyip, modelin doğru cümle üretimi, hata açıklama kalitesi ve bağlam kullanımı (context) için ölçülebilir hedefler belirlersin. Prompt, sistem mesajı, context ekleme biçimi ve model seçimi değiştikçe Braintrust skorlarıyla geriye doğru regresyon kontrolü yaparsın.

---

## 2. Teknoloji Seçimleri

Tek kişilik veya küçük ekiple, hızlı ve ucuz başlangıç için önerdiğim yığın. Her satır bir işi mümkün olan en az bakım masrafıyla çözer.

| Katman                           | Öneri                                                                    | Neden                                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**                     | Next.js (React) + Tailwind CSS                                           | Tek framework'te hem arayüz hem sunucu; Vercel'e tek tıkla deploy; dev topluluğu geniş.                                            |
| **Backend / API**                | Next.js API Routes (MVP için) → büyüyünce ayrı servis                    | Ayrı backend kurmadan başlarsın. İşler ağırlaşırsa Python/FastAPI'ye taşırsın (AI ekosistemi orada zengin).                        |
| **Veritabanı + Auth + Depolama** | **Supabase** (PostgreSQL tabanlı)                                        | Auth, veritabanı ve dosya depolamayı tek üründe verir. Cömert ücretsiz katman. Solo geliştirici için en büyük zaman tasarrufu.     |
| **ORM**                          | Prisma veya Drizzle                                                      | Veritabanını tip güvenli, okunabilir şekilde yönetirsin. Şema (özellikle hata tablosu) için kritik.                                |
| **LLM erişimi**                  | Anthropic / Gemini SDK + **OpenRouter** (model yönlendirici)             | OpenRouter tek API'den çok modele erişim verir; modeli kod değiştirmeden takas edersin. Çekirdek işte Haiku 4.5 veya Gemini Flash. |
| **Transkript çekme**             | TED.com scraper (`cheerio`) / resmi altyazı verisi                       | TED/TEDx altyazılarını programatik çekmek için. Hukuki/ToS sınırlarına dikkat et.                                                   |
| **E-posta / hatırlatma**         | Resend + zamanlanmış görev (Vercel Cron veya Supabase pg_cron)           | Hatırlatma e-postaları için basit ve ucuz.                                                                                         |
| **Hosting**                      | Vercel (frontend) + Supabase (backend/db)                                | İkisi de ücretsiz katmanda başlar; trafikle birlikte ölçeklenir.                                                                   |
| **Ödeme (ileride)**              | Stripe (küresel) / iyzico (Türkiye) / Lemon Squeezy (merchant-of-record) | Abonelik için. Lemon Squeezy vergi/faturayı senin yerine üstlenir; solo dev için pratik.                                           |
| **Ses (çok sonra)**              | STT (Whisper vb.) + TTS + gerçek zamanlı ses modeli                      | Sadece premium katmanda; maliyeti en yüksek parça.                                                                                 |

> **Not:** Python'a daha yatkınsan alternatif yığın: FastAPI (backend) + React (frontend) + yine Supabase/Postgres. AI tarafında Python ekosistemi biraz daha zengin, ama Next.js'in "her şey tek yerde" avantajı solo başlangıçta genelde ağır basar.

---

## 3. Veri Modeli — Asıl Hendeğin Burada

Bu, projenin kalbi. ChatGPT'nin yapamadığı şey buydu: kullanıcıyı zamanla tanımak. Şema baştan doğru kurulmalı çünkü sonradan değiştirmek zor. Ana tablolar (kavramsal):

**`users`** — temel kullanıcı bilgisi, seviye, hedef dil, ana dil.

**`programs`** — program şablonları. Kim oluşturdu, kategori (mesleki / sokak ağzı / kelime / zaman kalıpları), hangi öğretim tekniklerini uyguluyor, açıklama, teknik-link.

**`enrollments`** — kullanıcının bir programa kaydı ve o kayıttaki genel ilerleme durumu.

**`sessions`** — tek bir seans (ör. "1. gün, ilk 15 cümle"). Hangi video, hangi transkript, tamamlanma durumu, tarih.

**`sentence_attempts`** — her cümle denemesi. Verilen ana-dil cümlesi, kullanıcının çevirisi, doğru/yanlış, modelin geri bildirimi. Bu tablo profili besler.

**`errors`** — 🔑 **En kritik tablo.** Her hata bir satır:

- `user_id`
- `error_type` (ör. zaman kalıbı, edat, kelime seçimi, sözdizimi, üçüncü tekil -s)
- `related_word` / `related_grammar` (hangi kelime veya yapı)
- `session_id`, `timestamp`
- `resolved` (bu hatayı sonradan doğru yaptı mı — tekrar zamanlaması için)

**`vocabulary`** — kullanıcının maruz kaldığı kelimeler: kelime, maruz kalma sayısı, doğru kullanım sayısı, ustalık skoru. Nadir kelimelere öncelik verme mantığı buradan beslenir.

**Bu şemanın yaptığı iş:** Yeni bir seans başladığında sistem `errors` ve `vocabulary` tablolarına bakar, kullanıcının en çok takıldığı yapıları ve pekişmemiş kelimeleri seçer, ve LLM'e "bu kullanıcının zayıf olduğu present perfect ve şu 5 kelimeyi hedefleyen cümleler üret" der. İşte kişiselleştirme ve ayrılma maliyeti tam olarak burada doğar.

---

## 4. Adım Adım Yol Haritası

Fazları sırayla yap. Her fazın sonunda çalışan, gösterilebilir bir şey olsun. Sonraki faza geçmeden önce bir öncekinin işe yaradığını doğrula.

### Faz 0 — Doğrulama ve Hazırlık (1–2 hafta)

- Çekirdek döngüyü (transkript → cümle → geri bildirim) **kod yazmadan**, elle ChatGPT/Claude üzerinde birkaç kez dene. Metod gerçekten işe yarıyor mu, cümleler doğru zorlukta mı?
- Teknoloji yığınını kur, boş bir Next.js + Supabase projesi ayağa kaldır, "merhaba dünya" deploy et.
- Hedef kullanıcıyı netleştir (kendine soruyu sor: hangi seviye, hangi dil, hangi motivasyon).

### Faz 1 — Çekirdek MVP Döngüsü (3–5 hafta)

**Hedef:** Tek bir program, tek kullanıcı, hesap bile olmadan çalışan sihirli an.

- Kullanıcı bir TED.com konuşma linki girer veya sen sabit bir TEDx konuşması verirsin → transkript çekilir.
- LLM transkripti analiz eder, nadir kelimeleri işaretler.
- Sistem 15 ana-dil cümlesi üretir; kullanıcı tek tek çevirir.
- Her çeviride LLM hataları açıklar, sonrakine geçer.
- 15 bitince "yarın devam" der; ertesi gün 15 cümle daha; sonra altyazısız izleme adımı.
- **Bu fazda LLM Katmanını caching ile doğru kur** — token maliyetini burada ölç, 1. cevabımdaki tahminleri gerçek veriyle doğrula.
- Braintrust ile ilk golden dataset'i çıkar: iyi, kötü ve sınırda örnekleri topla; eval'lerle prompt ve context tasarımını tekrar tekrar sıkılaştır.

### Faz 2 — Öğrenen Profili / Kalıcılık (4–6 hafta) 🔑

**Bu faz projenin var oluş sebebi. Atlanamaz.**

- Supabase Auth ile hesaplar.
- `errors` ve `vocabulary` tablolarını devreye al; her seans hataları kaydet.
- Yeni seansların cümlelerini kullanıcının geçmiş zayıflıklarına göre üret.
- Basit tekrar mantığı: geçmişte yanlış yapılan yapıları ileride tekrar gündeme getir.
- **Bu faz bittiğinde "neden ChatGPT değil de bu?" sorusunun somut cevabı vardır:** çünkü seninki dünkü hatayı hatırlıyor.

### Faz 3 — İlerleme, Çoklu Program, Hatırlatma (3–4 hafta)

- İlerleme panosu: başarı oranını tarihsel grafikle göster.
- Birden fazla hazır program + kategoriler (mesleki, sokak ağzı, kelime, zaman kalıpları).
- E-posta hatırlatma (Resend + zamanlanmış görev).

### Faz 4 — Topluluk ve Özel Programlar (4–6 hafta)

- Kullanıcı kendi programını oluşturabilir.
- Program yayınlama sayfası: yorum, öneri, oylama.
- **Moderasyon/oylama mekanizması baştan** (spam ve kötü program riski için).
- Programın kullanılma sıklığı + geri bildirime dayalı başarım skoru.
- Her programda "kim oluşturdu, hangi teknikleri uyguluyor, teknik-inceleme linki" bölümü (ör. active recall).

### Faz 5 — Para Kazanma (2–3 hafta)

- Freemium: ayda birkaç program bedava; sınırsız kullanım + kendi programını oluşturma + hatırlatma abonelikle.
- Ödeme entegrasyonu (Stripe / iyzico / Lemon Squeezy).
- Maliyet analizin gösteriyor: ucuz model + caching ile $5–10/ay abonelik rahat kâra geçer.

### Faz 6 — Gelişmiş (açık uçlu)

- Sesli pratik (STT + TTS) — **sadece premium**, maliyet burada zıplar.
- Çoklu dil desteği (İngilizce dışı).
- Daha akıllı tekrar algoritması (aralıklı tekrar / spaced repetition ince ayarı).

---

## 5. İlk Somut Adım

Bu hafta yapılacak tek şey: **Faz 1'in çekirdek döngüsünü** çalışır hâle getirmek — transkript al, 15 cümle üret, hataları geri bildir. Hesap yok, profil yok, sadece sihirli anın kendisi. O çalışınca gerçek token tüketimini ölçer, sonra Faz 2'de asıl hendeği (öğrenen profili) inşa etmeye geçersin.

---

### Özet Öncelik Sırası

1. Çalışan çekirdek döngü (Faz 1)
2. Öğrenen profili + hata takibi (Faz 2 — hendek)
3. İlerleme + hatırlatma (Faz 3 — tutundurma)
4. Topluluk (Faz 4 — ölçekleme)
5. Para kazanma (Faz 5)
6. Ses + çoklu dil (Faz 6)

## 💡 Fikir Kutusu (Backlog / İleride Düşünülecekler)
