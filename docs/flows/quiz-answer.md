# Quiz akışı

Section sayfasındaki çeviri quiz'i. Kullanıcı ana dilindeki cümleyi İngilizceye çevirir, AI
değerlendirir. Yanlış cevaplanan soru kuyruğun sonuna döner, her soru doğru cevaplanınca quiz
tamamlanır.

- **Giriş noktası:** `app/(app)/programs/[programSlug]/[sectionSlug]/content.tsx`
- **Okuduğu tablolar:** `quizzes`, `questions`, `section_progress`, `sections`, `videos`,
  `transcripts`, `grades`, `learning_profiles`
- **Yazdığı tablolar:** `quizzes`, `questions`, `grades`, `mistakes`, `section_progress`
- **AI görevleri:** `generateSentences` (quiz üretimi), `analyzeSentence` (değerlendirme)

## Genel bakış

```mermaid
flowchart TD
  A["1. Sayfa yükleme (sunucu)"] --> B{"Giriş yapmış mı?"}
  B -- hayır --> X["'Sign in for the quiz' ekranı"]
  B -- evet --> C{"Bu section + ana dil için<br/>quiz var mı?"}
  C -- hayır --> D["2. Quiz üretimi (AI)"]
  D -- hata --> Y["'Quiz could not be prepared' ekranı"]
  D -- başarılı --> F
  C -- evet --> E{"Daha önce<br/>tamamlanmış mı?"}
  E -- hayır --> F["Kuyruk = tüm sorular"]
  E -- evet --> G["Tamamlandı ekranı"]
  G -- Restart --> F
  F --> H["3. Cevap değerlendirme"]
  H -- doğru --> I["Soruyu kuyruktan çıkar"]
  H -- yanlış --> J["Soruyu kuyruğun sonuna ekle"]
  J --> H
  I --> K{"Kuyruk boş mu?"}
  K -- hayır --> H
  K -- evet --> L["4. Tamamlanma"]
  L --> G
```

## 1. Sayfa yükleme

```mermaid
sequenceDiagram
  participant P as content.tsx (sunucu)
  participant S as services
  participant DB
  participant QC as QuizCard (istemci)

  P->>S: getCurrentUserService()
  par promise olarak, beklemeden
    P->>S: getQuizService(sectionId)
    S->>DB: user + learning_profiles
    S->>DB: quizzes + questions (sectionId, nativeLanguage)
  and
    P->>S: getSectionProgressService(sectionId)
    S->>DB: section_progress
  end
  P-->>QC: user, quizPromise, isCompletedPromise
  Note over QC: use() ile promise'leri açar,<br/>o sırada Suspense iskeleti görünür
  QC->>QC: queue = isCompleted ? [] : tüm soru id'leri
```

- **Nerede:** `content.tsx` → `getQuizService` (`services/quiz.ts`), `getSectionProgressService`
  (`services/program.ts`), sunucuda. Promise'ler istemcideki `QuizCard`'a (`quiz-card.tsx`) verilir.
- **Okuduğu:** `learning_profiles`, `quizzes`, `questions`, `section_progress`
- **Yazdığı:** yok
- **AI çağrısı:** yok
- **Dallanmalar:**
  - Kullanıcı ya da profili yoksa `getQuizService` null döner. Quiz ana dile göre tutulduğu için
    profili olmayan kullanıcıya quiz verilemez.
  - Kullanıcı yoksa `QuizCard` "Sign in" ekranını gösterir.
  - `quizCompletedAt` doluysa kuyruk boş başlar ve doğrudan tamamlandı ekranı görünür.
- **Döndürdüğü:** soruları sırasıyla (`order`) birlikte quiz, ve tamamlanma bilgisi (boolean)

## 2. Quiz üretimi (quiz yoksa)

```mermaid
sequenceDiagram
  participant QC as QuizCard (istemci)
  participant A as generateQuizByAiAction
  participant S as generateQuizByAiService
  participant AI as generateSentences (AI)
  participant DB

  Note over QC: useEffect: user var, quiz yok,<br/>daha önce istenmemiş
  QC->>A: sectionId
  A->>S: sectionId
  S->>DB: user + learning_profiles
  S->>DB: sections → videos, transcripts
  break video ya da transcript yoksa
    S-->>QC: AppError → hata ekranı
  end
  S->>AI: transcript + ana dil, 5 cümle
  AI-->>S: cümleler (ana dil, İngilizce, glosses)
  rect rgba(127, 127, 127, 0.12)
    Note over S,DB: db.transaction
    S->>DB: INSERT quizzes (çakışırsa hiçbir şey yapma)
    S->>DB: INSERT questions × 5
  end
  S-->>A: quiz + sorular
  A-->>QC: ActionResult
  QC->>QC: setQuiz, queue = tüm sorular
```

- **Nerede:** `quiz-card.tsx` (useEffect) → `actions/quiz.ts` → `generateQuizByAiService`
  (`services/quiz.ts`) → `ai/tasks/generate-sentences.ts`
- **Okuduğu:** `learning_profiles`, `sections`, `videos`, `transcripts`
- **Yazdığı:** `quizzes`, `questions` (tek transaction)
- **AI çağrısı:** var, `generateSentences`. Her soru `payload` içinde ana dil cümlesini
  (`sourceSentence`), beklenen İngilizce çeviriyi (`expectedTranslation`) ve `glosses`'u taşır.
- **Dallanmalar:**
  - Video ya da transcript yoksa `AppError` fırlatılır ve hata ekranı gösterilir.
  - Action başarısız olursa `hasRequestedRef` sıfırlanır, böylece sonraki render'da tekrar
    denenebilir.
- **Döndürdüğü:** `QuizWithQuestions`
- **Not:** Quiz kullanıcıya değil **section + ana dile** ait. Aynı dili konuşan ilk kullanıcı quiz'i
  üretir, sonrakiler aynı quiz'i görür. Servisteki TODO'ya göre ileride quiz'ler istek anında değil
  önceden üretilecek.

## 3. Cevap değerlendirme

```mermaid
sequenceDiagram
  actor U as Kullanıcı
  participant QC as QuizCard (istemci)
  participant QS as QuestionStep (istemci)
  participant A as gradeTranslationAction
  participant S as gradeTranslationService
  participant AI as analyzeSentence (AI)
  participant DB

  U->>QS: çeviriyi yazar, gönderir
  QS->>A: questionId, userTranslation
  A->>S: questionId, userTranslation
  S->>DB: user + learning_profiles
  S->>S: girdiyi Zod ile doğrula
  S->>DB: questions (kaynak cümle, beklenen çeviri)
  par aynı anda
    S->>AI: kaynak cümle, beklenen çeviri, kullanıcının çevirisi
    Note over AI: boş ya da harf içermeyen cevap<br/>AI'a gitmeden "no" sayılır
    AI-->>S: meaningPreserved, mistakes, description, alternatives
  and
    S->>DB: grades: bu kullanıcı bu soruyu daha önce cevapladı mı?
  end
  Note over S: isCorrect = meaningPreserved == "yes"<br/>source = practiceId varsa practice, yoksa section
  S-->>A: analiz + isCorrect
  A-->>QS: ActionResult
  QS-->>U: değerlendirme ekranı (GradedQuestion)
  rect rgba(127, 127, 127, 0.12)
    Note over S,DB: after(): yanıt gittikten sonra, tek transaction
    S->>DB: INSERT grades (isCorrect, isFirstAttempt, source)
    opt hata bulunduysa
      S->>DB: INSERT mistakes (hata başına bir satır)
    end
  end
  U->>QS: Continue
  QS->>QC: onContinue(isCorrect)
  QC->>QC: doğruysa kuyruktan çıkar, yanlışsa sona ekle
```

- **Nerede:** `components/shared/quiz/question-step.tsx` (`handleSubmit`) → `actions/quiz.ts` →
  `gradeTranslationService` (`services/quiz.ts`) → `ai/tasks/analyze-sentence.ts`. Kuyruk
  `quiz-card.tsx` içindeki `handleContinue`'da güncellenir.
- **Okuduğu:** `learning_profiles`, `questions`, `grades`
- **Yazdığı:** `grades` (her cevapta bir satır), `mistakes` (hata varsa, hata başına bir satır)
- **AI çağrısı:** var, `analyzeSentence`
- **Dallanmalar:**
  - `isCorrect` kararını sunucudaki kod verir, AI değil. AI'ın döndürdüğü `meaningPreserved`
    değeri `"yes"` ise doğru sayılır. Gramer hataları cevabı yanlış yapmaz, yalnızca gösterilir ve
    kaydedilir. `"partial"` ise yanlış sayılır.
  - `meaningPreserved` `"no"` ise kod `mistakes` listesini boşaltır, böylece anlamsız bir cevap
    hata geçmişini doldurmaz.
  - `isFirstAttempt`, bu kullanıcı için bu soruya ait **herhangi** bir grade yoksa true olur. Bu
    sorgu AI ile paralel çalıştığı için ek süre eklemez.
  - `source`, sorunun sahibinden çıkarılır: `practiceId` doluysa `practice`, değilse `section`. Bu
    servis practice soruları için de aynı şekilde kullanılır.
- **Döndürdüğü:** `TranslationGrade` (kullanıcının çevirisi, analiz, `isCorrect`)
- **Yan çıkış:** sorudaki kelimeyi kaydetmek (`saveQuizGlossAction`) vocabulary akışına aittir.

## 4. Tamamlanma

```mermaid
sequenceDiagram
  participant QC as QuizCard (istemci)
  participant A as completeQuizAction
  participant S as completeQuizService
  participant DB

  Note over QC: kuyruk boşaldı,<br/>tamamlandı ekranı hemen görünür
  QC->>A: sectionId (sonuç beklenmeden)
  A->>S: sectionId
  S->>DB: user, quiz var mı?
  S->>DB: UPSERT section_progress.quiz_completed_at = şimdi
  A-->>QC: ok
  QC->>QC: router.refresh()
```

- **Nerede:** `quiz-card.tsx` (`handleContinue`) → `actions/quiz.ts` → `completeQuizService`
  (`services/quiz.ts`)
- **Okuduğu:** `learning_profiles`, `quizzes`
- **Yazdığı:** `section_progress` (yoksa ekler, varsa `quiz_completed_at`'i günceller)
- **AI çağrısı:** yok
- **Dallanmalar:** kullanıcı ya da quiz yoksa `AppError`
- **Döndürdüğü:** yok. Başarılıysa sayfa sunucudan yeniden render edilir.

## Kenar durumlar

- **Sayfa yenilenirse:** kuyruk yalnızca tarayıcıda tutulduğu için kaybolur. Quiz tamamlanmadıysa
  baştan, tüm sorularla başlar. Önceki cevapların `grades` satırları kalır.
- **Restart:** tamamlandı ekranındaki Restart kuyruğu tüm sorularla yeniden doldurur. Tekrar
  bitince `completeQuizAction` yine çağrılır ve `quiz_completed_at` yeni tarihle güncellenir.
- **Tekrar denemeler:** yanlış cevaptan sonra, ya da restart sonrası verilen cevaplar
  `isFirstAttempt = false` ile kaydedilir. Doğruluk oranı yalnızca ilk denemeleri sayar.

## Gözlemler ve açık sorular

- **İstemciye güveniliyor:** `completeQuizService` kuyruğun gerçekten boşaldığını doğrulayamaz,
  çünkü grade'ler quiz turuna değil cevaba bağlı (servis üstündeki "Trusts the client" yorumu).
- **Kayıtlar arka planda:** `grades` ve `mistakes`, `after()` içinde yanıt gönderildikten sonra
  yazılır. Kullanıcı sonucu beklemez, ama bu yazma başarısız olursa kullanıcı bundan haberdar
  olmaz.
- **Eşzamanlı üretim:** Aynı section + dil için iki istek aynı anda quiz üretirse ikisi de AI'ı
  çağırır. `createQuiz` çakışmada satır döndürmez, bu yüzden ikinci istek "Quiz could not be
  created" hatası alır (yenileyince var olan quiz yüklenir).
- **Cevap metni:** "Cevap metni saklanmaz" kuralı `grades` için geçerli. Hata varsa cevap
  `mistakes.user_translation` içine kopyalanır.
