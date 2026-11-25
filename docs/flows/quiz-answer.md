# Quiz akışı

Section sayfasındaki çeviri quiz'i. Kullanıcı ana dilindeki cümleyi İngilizceye çevirir, AI
değerlendirir. Yanlış cevaplanan soru kuyruğun sonuna döner, her soru doğru cevaplanınca quiz
tamamlanır. Quiz kaldığı yerden devam eder: yalnızca henüz doğru cevaplanmamış sorular sorulur.
Tamamlanmaya sunucu karar verir, restart yoktur.

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
  E -- hayır --> F["Kuyruk = doğru cevaplanmamış sorular"]
  E -- evet --> G["Tamamlandı ekranı"]
  F --> H["3. Cevap değerlendirme"]
  H -- doğru --> I["Soruyu kuyruktan çıkar"]
  H -- yanlış --> J["Soruyu kuyruğun sonuna ekle"]
  J --> H
  I --> K{"Kuyruk boş mu?"}
  K -- hayır --> H
  K -- evet --> L["4. Tamamlanma"]
  L --> G
```

Tamamlanma sunucuda, 3. adımda yazılır: son soruyu doğru cevaplayan cevabın grade'iyle aynı
transaction'da. 4. adım yalnızca istemcinin tamamlandı ekranına geçmesidir.

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
    P->>S: getCorrectGradesService(sectionId)
    S->>DB: grades (bu kullanıcı, quiz'in soruları, isCorrect)
  and
    P->>S: getSectionProgressService(sectionId)
    S->>DB: section_progress
  end
  P-->>QC: user, quizPromise, correctGradesPromise, isCompletedPromise
  Note over QC: use() ile promise'leri açar,<br/>o sırada Suspense iskeleti görünür
  QC->>QC: queue = isCompleted ? [] : doğru cevaplanmamış sorular
```

- **Nerede:** `content.tsx` → `getQuizService`, `getCorrectGradesService` (`services/quiz.ts`),
  `getSectionProgressService` (`services/program.ts`), sunucuda. Promise'ler istemcideki
  `QuizCard`'a (`quiz-card.tsx`) verilir. Kuyruğu `getRemainingQuestionIds` kurar.
- **Okuduğu:** `learning_profiles`, `quizzes`, `questions`, `grades`, `section_progress`
- **Yazdığı:** yok
- **AI çağrısı:** yok
- **Dallanmalar:**
  - Kullanıcı ya da profili yoksa `getQuizService` null döner. Quiz ana dile göre tutulduğu için
    profili olmayan kullanıcıya quiz verilemez.
  - Kullanıcı yoksa `QuizCard` "Sign in" ekranını gösterir.
  - `quizCompletedAt` doluysa kuyruk boş başlar ve doğrudan tamamlandı ekranı görünür. Bu karar
    grade'lerden değil `quizCompletedAt`'ten gelir, çünkü grade'ler eklenmeden önce quiz'i
    bitirenlerin grade'i yoktur.
  - Tamamlanmamışsa kuyruk, bu kullanıcının doğru grade'i olmayan sorulardan (sırasıyla) oluşur.
    Bütün soruların doğru grade'i varken quiz tamamlanmamışsa (iki sekme son iki soruyu aynı anda
    cevapladıysa ya da eski akışta doğru cevaplar birden fazla ziyarete dağıldıysa) bütün sorular
    yeniden sorulur, ilk doğru cevap quiz'i tamamlar.
- **Döndürdüğü:** soruları sırasıyla (`order`) birlikte quiz, doğru grade'ler (`id`, `questionId`)
  ve tamamlanma bilgisi (boolean)

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
  Her gloss dört alan taşır:
  - `nativeInContext`: kaynak cümleden harfi harfine ("vazgeçtim")
  - `nativeLemma`: ana dildeki sözlük biçimi ("vazgeçmek")
  - `englishLemma`: İngilizce sözlük biçimi ("give up")
  - `englishInContext`: beklenen çeviriden harfi harfine ("gave up")
- **Dallanmalar:**
  - Video ya da transcript yoksa `AppError` fırlatılır ve hata ekranı gösterilir.
  - Sorular yazılmadan önce `keepLocatableGlosses` (`lib/utils.ts`) her gloss'u cümlelerinde arar.
    `nativeInContext` kaynak cümlede, `englishInContext` (ya da cümle onu kullanıyorsa
    `englishLemma`) beklenen çeviride geçmiyorsa gloss atılır. Practice setleri de aynı kontrolden
    geçer.
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
  participant A as gradeQuizTranslationAction
  participant S as gradeQuizTranslationService
  participant AI as analyzeSentence (AI)
  participant DB

  U->>QS: çeviriyi yazar, gönderir
  QS->>QC: onGrade(userTranslation)
  QC->>A: sectionId, questionId, userTranslation
  A->>S: sectionId, questionId, userTranslation
  S->>DB: user + learning_profiles
  S->>S: girdiyi Zod ile doğrula
  par
    S->>DB: getQuizService: quizzes + questions (sectionId, nativeLanguage)
  and
    S->>DB: getCorrectGradesService: bu quiz'in doğru grade'leri
  and
    S->>DB: getSectionProgressService: quiz_completed_at
  end
  break soru bu quiz'de yoksa
    S-->>QS: AppError("Not found")
  end
  par aynı anda
    S->>AI: kaynak cümle, beklenen çeviri, kullanıcının çevirisi
    Note over AI: boş ya da harf içermeyen cevap<br/>AI'a gitmeden "no" sayılır
    AI-->>S: meaningPreserved, mistakes, description, alternatives
  and
    S->>DB: grades: bu kullanıcı bu soruyu daha önce cevapladı mı?
  end
  Note over S: isCorrect = meaningPreserved == "yes"<br/>source = section
  S-->>A: analiz + isCorrect
  A-->>QS: ActionResult
  QS-->>U: değerlendirme ekranı (GradedQuestion)
  rect rgba(127, 127, 127, 0.12)
    Note over S,DB: after(): yanıt gittikten sonra, tek transaction
    S->>DB: INSERT grades (isCorrect, isFirstAttempt, source)
    opt doğru ve diğer bütün soruların doğru grade'i var, quiz tamamlanmamış
      S->>DB: UPSERT section_progress.quiz_completed_at = şimdi
    end
    opt hata bulunduysa
      S->>DB: INSERT mistakes (hata başına bir satır)
    end
  end
  U->>QS: Continue
  QS->>QC: onContinue(isCorrect)
  QC->>QC: doğruysa kuyruktan çıkar, yanlışsa sona ekle
```

- **Nerede:** `components/shared/quiz/question-step.tsx` (`handleSubmit`) → `onGrade`
  (`quiz-card.tsx`) → `actions/quiz.ts` → `gradeQuizTranslationService` (`services/quiz.ts`) →
  `ai/tasks/analyze-sentence.ts`. Kuyruk `quiz-card.tsx` içindeki `handleContinue`'da güncellenir.
- **Okuduğu:** `learning_profiles`, `quizzes`, `questions`, `grades`, `section_progress`
- **Yazdığı:** `grades` (her cevapta bir satır), `mistakes` (hata varsa, hata başına bir satır),
  `section_progress` (quiz'i tamamlayan cevapta)
- **AI çağrısı:** var, `analyzeSentence`
- **Dallanmalar:**
  - Soru id ile tek başına aranmaz, kullanıcının gördüğü quiz'in (`getQuizService`: section +
    kullanıcının ana dili) içinde aranır. Orada yoksa (başka dildeki quiz'in ya da bir practice'in
    sorusu) `AppError("Not found")` döner ve AI çağrılmaz.
  - `isCorrect` kararını sunucudaki kod verir, AI değil. AI'ın döndürdüğü `meaningPreserved`
    değeri `"yes"` ise doğru sayılır. Gramer hataları cevabı yanlış yapmaz, yalnızca gösterilir ve
    kaydedilir. `"partial"` ise yanlış sayılır.
  - `meaningPreserved` `"no"` ise kod `mistakes` listesini boşaltır, böylece anlamsız bir cevap
    hata geçmişini doldurmaz.
  - `isFirstAttempt`, bu kullanıcı için bu soruya ait **herhangi** bir grade yoksa true olur. Bu
    sorgu AI ile paralel çalıştığı için ek süre eklemez.
  - **Tamamlanma:** cevap doğruysa, quiz'in diğer bütün sorularının bu kullanıcıdan doğru grade'i
    varsa ve `quizCompletedAt` boşsa, `quiz_completed_at` grade ile aynı transaction'da yazılır
    (`gradeTranslation`'ın `onCorrect`'i). İkisi ya birlikte yazılır ya hiç yazılmaz.
    `quizCompletedAt` ilk tamamlanma anıdır ve bir daha değişmez. Tamamlanma için istemciden gelen
    bir istek yoktur, istemci kuyruğun boşaldığını sunucuya bildirmez.
  - `source` her zaman `section`'dır. Practice soruları aynı puanlama kodundan
    (`gradeTranslation`) geçer ama kendi giriş noktalarından gelir
    (`gradePracticeTranslationService`, `source = practice`).
- **Döndürdüğü:** `TranslationGrade` (kullanıcının çevirisi, analiz, `isCorrect`)
- **Gloss'lar:** cevap yazılırken kaynak cümledeki gloss'lu kelimelerin altı çizilidir ve popover
  yalnızca `englishLemma`'yı gösterir. Kelimenin cümlede nasıl çekileceği kullanıcıya bırakılır,
  çünkü gramer hataları `mistakes`'e yazılır. Değerlendirme ekranında beklenen çeviride de
  `englishInContext`'lerin altı çizilir ve popover "give up · vazgeçmek" gösterir. İki ekran da
  `GlossedText` (`components/shared/quiz/glossed-text.tsx`) bileşenini kullanır. Bir gloss
  öncekiyle çakışırsa altı çizilmez.
- **Yan çıkış:** sorudaki kelimeyi kaydetmek (`saveQuizGlossAction`) vocabulary akışına aittir.

## 4. Tamamlanma

```mermaid
sequenceDiagram
  participant QC as QuizCard (istemci)

  Note over QC: kuyruk boşaldı,<br/>tamamlandı ekranı hemen görünür
  QC->>QC: router.refresh()
```

- **Nerede:** `quiz-card.tsx` (`handleContinue`)
- **Okuduğu / Yazdığı:** yok. `quiz_completed_at` 3. adımda, son doğru cevabın grade'iyle yazıldı.
- **AI çağrısı:** yok
- **Not:** `router.refresh()` sunucu verisini (ve istemcinin router önbelleğini) yeniler. Son
  grade `after()` ile yazıldığı için refresh, yazma bitmeden gelirse sayfa bir an eski veriyi
  gösterebilir. Kullanıcı Continue'ya basana kadar yazma genellikle bitmiş olur.
- **Restart yok:** tamamlandı ekranında "Practice again" düğmesi yoktur. Aynı cümleleri yeniden
  çevirmek öğretici değil (beklenen çeviriler görüldü), hataları ise günlük practice tekrar eder.

## Kenar durumlar

- **Sayfa yenilenirse:** kuyruk tarayıcıda kaybolur ama sunucudan yeniden kurulur: doğru
  cevaplanmış sorular sorulmaz, yanlış cevaplanmış ve hiç cevaplanmamış sorular sırasıyla gelir.
  Yanıttan hemen sonra yenilenirse son grade henüz yazılmamış olabilir, o soru yeniden sorulur.
- **Tekrar denemeler:** yanlış cevaptan sonra verilen cevaplar `isFirstAttempt = false` ile
  kaydedilir. Doğruluk oranı yalnızca ilk denemeleri sayar. Bir sorunun birden fazla grade'i olabilir
  (yanlış, yanlış, doğru), ama doğru cevaplanan soru bir daha sorulmadığı için pratikte en fazla bir
  doğru grade'i olur.
- **Grade yazılamazsa:** `after()` içindeki transaction başarısız olursa grade de tamamlanma da
  yazılmaz. Soru sonraki ziyarette yeniden sorulur.

## Notlar

- **Cevap metni:** "Cevap metni saklanmaz" kuralı `grades` için geçerli. Hata varsa cevap
  `mistakes.user_translation` içine kopyalanır.
