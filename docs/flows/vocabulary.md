# Vocabulary akışı

- **Giriş noktaları:**
  - Transcript: `app/(app)/programs/[programSlug]/[sectionSlug]/_components/transcript-card/save-phrase-popover.tsx`
  - Quiz: `app/(app)/programs/[programSlug]/[sectionSlug]/_components/quiz-card.tsx`
  - Practice: `app/(app)/practice/session/_components/session-card.tsx`
  - Liste: `app/(app)/vocabulary/_components/vocabulary-list.tsx`
  - Tekrar: `app/(app)/practice/session/_components/words-step/index.tsx`
- **Okuduğu tablolar:** `user`, `learning_profiles`, `sections`, `videos`, `transcripts`, `quizzes`,
  `practices`, `questions`, `vocabulary_items`, `vocabulary_cards`
- **Yazdığı tablolar:** `vocabulary_items`, `vocabulary_cards`, `vocabulary_reviews` (silmede
  cascade ile kart ve tekrar geçmişi de silinir)
- **AI görevleri:** `definePhrase` (yalnızca transcript'ten kayıtta)

## 1. Kelime kaydetme

```mermaid
flowchart LR
  T["Transcript satırı"] -- "saveTranscriptPhraseAction<br/>AI tanımlar, varsa günceller" --> I[("vocabulary_items")]
  Q["Quiz sorusundaki gloss"] -- "saveQuizGlossAction<br/>AI yok, varsa dokunmaz" --> I
  P["Practice sorusundaki gloss"] -- "savePracticeGlossAction<br/>AI yok, varsa dokunmaz" --> I
```

### Transcript'ten kelime kaydetme

```mermaid
sequenceDiagram
  actor U as Kullanıcı
  participant SP as SavePhrasePopover (istemci)
  participant A as saveTranscriptPhraseAction
  participant S as saveTranscriptPhraseService
  participant AI as definePhrase (AI)
  participant DB

  Note over SP: kayıt düğmesi yalnızca giriş yapmış kullanıcıya görünür
  U->>SP: satırdaki düğmeyle popover'ı açar, kelimeleri seçer
  Note over SP: ilk dokunuş bir kelime seçer, ikincisi aralık yapar (en çok 6 kelime)<br/>baştaki ve sondaki noktalama atılır
  U->>SP: Save
  SP->>A: sectionId, lineIndex, phrase
  A->>S: sectionId, lineIndex, phrase
  S->>DB: user
  S->>S: girdiyi Zod ile doğrula
  S->>DB: sections → videos
  S->>DB: transcripts (satırlar)
  break video ya da satır yoksa, ya da seçilen kelimeler satırda geçmiyorsa
    S-->>SP: AppError → popover'da hata
  end
  S->>AI: seçilen kelimeler, satır, ana dil
  AI-->>S: phrase (sözlük biçimi), meaning (ana dilde)
  S->>DB: UPSERT vocabulary_items (aynı kullanıcı + phrase varsa günceller)
  S-->>A: phrase + meaning
  A-->>SP: ActionResult
  SP-->>U: "give up · vazgeçmek"
```

- **Nerede:** `save-phrase-popover.tsx` (`handleSave`) → `saveTranscriptPhraseAction`
  (`actions/vocabulary.ts`) → `saveTranscriptPhraseService` (`services/vocabulary.ts`) →
  `definePhrase` (`ai/tasks/define-phrase.ts`)
- **Okuduğu tablolar:** `user`, `sections`, `videos`, `transcripts`
- **Yazdığı tablolar:** `vocabulary_items`
- **AI çağrısı:** var, `definePhrase`. Seçilen kelimeleri sözlük biçimine çevirir ("giving up" →
  "give up") ve o cümledeki anlamını ana dilde verir.
- **Dallanmalar:**
  - Kullanıcı yoksa (`Unauthorized`), section'ın videosu yoksa, `lineIndex`'te satır yoksa
    (`Not found`) ya da seçilen kelimeler satırda bütün kelimeler olarak geçmiyorsa hata döner.
    Son kontrol `matchPhrase` ile yapılır ve büyük/küçük harfe bakmaz.
  - Kelime zaten kayıtlıysa yeni satır açılmaz, var olan güncellenir: `meaning`, `context`,
    `contextPhrase`, `video_id` ve `time_seconds` yeni kayıttan gelir. Kelimenin tekrar takvimi
    (`vocabulary_cards`) ayrı tabloda durduğu için sıfırlanmaz.
- **Döndürdüğü:** `PhraseDefinition` (sözlük biçimi ve ana dildeki anlamı). Popover'da gösterilir.

### Quiz ya da practice sorusundan kelime kaydetme (gloss)

Gloss, AI'ın soru üretirken cümledeki kelimelere eklediği ipucudur. Soru cümlesinde altı çizili
kelimenin üstüne gelince anlamı ve kaydet düğmesi görünür. Quiz ve practice aynı bileşenleri ve
aynı kayıt fonksiyonunu (`saveGloss`) kullanır. Fark yalnızca sorunun nereden doğrulandığındadır.

```mermaid
sequenceDiagram
  actor U as Kullanıcı
  participant SS as SourceSentence (istemci)
  participant A as action
  participant S as service
  participant DB

  U->>SS: gloss'un üstüne gelir, kaydet'e basar
  alt quiz sorusu
    SS->>A: saveQuizGlossAction(sectionId, questionId, phrase)
    A->>S: saveQuizGlossService
    par
      S->>DB: user + learning_profiles, quiz + questions
    and
      S->>DB: sections → videos
    end
  else practice sorusu
    SS->>A: savePracticeGlossAction(questionId, phrase)
    A->>S: savePracticeGlossService
    S->>DB: bugünkü practice + questions (son 20 saat)
  end
  break soru bulunamazsa, tipi translation değilse ya da gloss soruda yoksa
    S-->>SS: AppError
  end
  Note over S: saveGloss: phrase = gloss.meaning (İngilizce)<br/>meaning = gloss.phrase (ana dil)<br/>context = sorunun beklenen İngilizce çevirisi
  S->>DB: INSERT vocabulary_items (aynı phrase varsa hiçbir şey yapma)
  S-->>A: ok
  A-->>SS: ActionResult
  SS-->>U: kaydedildi işareti
```

- **Nerede:**
  - Quiz: `quiz-card.tsx` → `question-step.tsx` → `answer-input.tsx` / `graded-question.tsx` →
    `source-sentence.tsx` (`SaveGlossButton`) → `saveQuizGlossAction` (`actions/vocabulary.ts`) →
    `saveQuizGlossService` (`services/vocabulary.ts`)
  - Practice: `session-card.tsx` → aynı bileşenler → `savePracticeGlossAction` →
    `savePracticeGlossService`
  - İkisi de sonunda `saveGloss` fonksiyonunu çağırır.
  - Hangi action'ın çağrılacağına bileşenler değil, `onSaveGloss` prop'unu veren üst bileşen
    (`quiz-card.tsx` ya da `session-card.tsx`) karar verir.
- **Okuduğu tablolar:**
  - Quiz: `user`, `learning_profiles`, `quizzes`, `questions`, `sections`, `videos`
  - Practice: `user`, `practices`, `questions`
- **Yazdığı tablolar:** `vocabulary_items`
- **AI çağrısı:** yok. Gloss'un çevirisi soru üretilirken zaten hazırlanmış.
- **Dallanmalar:**
  - Kullanıcı yoksa hata döner (`Unauthorized`).
  - Soru, kullanıcının bu section için gördüğü quiz'de (quiz) ya da bugünkü practice setinde
    (practice) yoksa hata döner (`Not found`).
  - Soru tipi `translation` değilse hata döner. Şu an başka soru tipi yok.
  - İstenen gloss sorunun `glosses` listesinde yoksa hata döner (`Not found`).
  - Kelime zaten kayıtlıysa **hiçbir şey değişmez** ve yine başarılı döner. Var olan kaydın
    bağlamı bir videodan gelmiş olabilir, gloss onu ezmemeli.
- **Döndürdüğü:** veri yok. İstemci yalnızca başarılı olup olmadığını öğrenir.

### Kaynağa göre kaydın alanları

| Alan                 | Transcript                         | Quiz gloss                                          | Practice gloss            |
| -------------------- | ---------------------------------- | --------------------------------------------------- | ------------------------- |
| `phrase` (İngilizce) | AI'ın verdiği sözlük biçimi        | `gloss.meaning`                                     | `gloss.meaning`           |
| `meaning` (ana dil)  | AI'ın verdiği anlam                | `gloss.phrase`                                      | `gloss.phrase`            |
| `context`            | transcript satırı                  | sorunun beklenen çevirisi                           | sorunun beklenen çevirisi |
| `context_phrase`     | seçilen kelimeler (her zaman dolu) | sözlük biçimi cümlede aynen geçiyorsa o, yoksa null | aynı                      |
| `video_id`           | section'ın videosu                 | section'ın videosu (varsa)                          | null                      |
| `time_seconds`       | satırın zamanı                     | null                                                | null                      |
| Tekrar kaydedilirse  | günceller                          | değiştirmez                                         | değiştirmez               |

---

**Notlar**

- `context_phrase` transcript kaydında her zaman doludur, çünkü kullanıcı kelimeleri cümlenin
  içinden seçer ve cümlede geçtikleri zaten doğrulanmıştır. Gloss'ta da cümle elimizde, ama
  İngilizce kelime sözlük biçiminde gelir. Cümle "gave up" diyorsa "give up" orada bulunamaz ve
  `context_phrase` null kalır.
- `video_id` transcript'ten ve quiz'den kayıtta dolu (quiz section'ın videosunu kullanır),
  practice'ten kayıtta boştur. `time_seconds` yalnızca transcript'ten kayıtta doludur. Şemadaki
  `vocabulary_items_time_needs_video_check` kısıtı, video olmadan zaman kaydedilmesini engeller.
- **Gözlem:** transcript'ten kayıt yalnızca giriş yapmayı ister. Quiz gloss'u ise
  `getQuizService` üzerinden öğrenme profilini de ister.

## 2. Kelime listesi

### Görüntüleme

```mermaid
sequenceDiagram
  actor U as Kullanıcı
  participant VL as VocabularyList (sunucu)
  participant S as service
  participant DB

  U->>VL: /vocabulary
  Note over VL: Suspense içinde, veri gelene kadar VocabularyListFallback görünür
  par
    VL->>S: getCurrentUserService
    S->>DB: user
  and
    VL->>S: getVocabularyItemsService
    Note over S: kullanıcı yoksa DB'ye gitmeden [] döner
    S->>DB: vocabulary_items + videos.title (en yeni önce)
  end
  alt kullanıcı yok
    VL-->>U: EmptyState: giriş yap
  else kelime yok
    VL-->>U: EmptyState: henüz kelime yok
  else
    VL-->>U: kelime kartları
  end
```

- **Nerede:** `page.tsx` → `vocabulary-list.tsx` (`VocabularyList`) → `getCurrentUserService`
  (`services/auth.ts`) ve `getVocabularyItemsService` (`services/vocabulary.ts`)
- **Okuduğu tablolar:** `user`, `vocabulary_items`, `videos`
- **Yazdığı tablolar:** yok
- **AI çağrısı:** yok
- **Dallanmalar:**
  - Kullanıcı yoksa giriş yapmaya çağıran `EmptyState` gösterilir.
  - Kullanıcının kayıtlı kelimesi yoksa kelimenin nereden kaydedileceğini anlatan `EmptyState`
    gösterilir.
- **Döndürdüğü:** `VocabularyItemListItem[]`, en yeni kayıt önce. Her kartta `phrase`, `meaning`,
  `context`, varsa videonun başlığı ve `time_seconds`, bir de kayıt tarihi görünür.
  `contextPhrase` de gelir ama bu sayfada kullanılmaz (tekrar kartında kelimeyi gizlemek içindir).

### Silme

```mermaid
sequenceDiagram
  actor U as Kullanıcı
  participant B as DeleteVocabularyItemButton (istemci)
  participant A as deleteVocabularyItemAction
  participant S as deleteVocabularyItemService
  participant DB

  U->>B: karttaki çöp kutusuna basar
  Note over B: onay sorulmaz, istek sürerken düğme kilitlenir ve yükleniyor ikonu döner
  B->>A: vocabularyItemId
  A->>S: vocabularyItemId
  S->>DB: user
  break kullanıcı yoksa
    S-->>B: AppError → düğme eski hâline döner
  end
  S->>DB: DELETE vocabulary_items (id + kullanıcı)
  Note over DB: cascade: vocabulary_cards, vocabulary_reviews
  S-->>A: ok
  A-->>B: ActionResult
  B->>B: router.refresh()
  B-->>U: liste kelime olmadan yeniden çizilir
```

- **Nerede:** `vocabulary-list.tsx` (her kartta) → `delete-vocabulary-item-button.tsx`
  (`handleDelete`) → `deleteVocabularyItemAction` (`actions/vocabulary.ts`) →
  `deleteVocabularyItemService` (`services/vocabulary.ts`)
- **Okuduğu tablolar:** `user`
- **Yazdığı tablolar:** `vocabulary_items` (DB cascade ile `vocabulary_cards` ve
  `vocabulary_reviews` da silinir)
- **AI çağrısı:** yok
- **Dallanmalar:**
  - Kullanıcı yoksa hata döner (`Unauthorized`). İstemci hatayı göstermez, düğme yalnızca eski
    hâline döner.
  - Silme yalnızca kullanıcının kendi kaydını hedefler. Kayıt yoksa ya da başkasınınsa hiçbir satır
    silinmez ama yine başarılı döner (`Not found` yok).
- **Döndürdüğü:** veri yok. Başarılıysa istemci `router.refresh()` ile sayfayı yeniden ister, liste
  sunucudan güncel hâliyle gelir.
- **Not:** kelime yeniden kaydedilirse kartı olmadığı için "yeni" olarak başlar.

## 3. Kelime tekrarı (günlük session)

Kaydedilen kelimeler `/practice/session`'ın ilk adımında tekrar edilir. Cevap istemcide kontrol
edilir, sunucuya yalnızca puan (`rating`) gider. Kelimeler bitince session cümlelere geçer (günlük
session akışı).

### Kelimelerin seçilmesi

```mermaid
sequenceDiagram
  actor U as Kullanıcı
  participant DS as DailySession (sunucu)
  participant S as service
  participant DB

  U->>DS: /practice/session
  par
    DS->>S: getCurrentUserService
    S->>DB: user
  and
    DS->>S: getDueVocabularyItemsService
    S->>DB: vocabulary_cards (due ≤ şimdi, en eski vade önce, en çok 50)<br/>+ vocabulary_items + videos.title
  and
    DS->>S: getNewVocabularyItemsService
    S->>DB: kartı olmayan vocabulary_items (en eski kayıt önce, en çok 10)<br/>+ videos.title
  and
    DS->>S: getPracticeService, getPracticeTargetService
    Note over S: cümle adımı için, günlük session akışında
  end
  alt kullanıcı yok
    DS-->>U: EmptyState: giriş yap
  else kelime yok ve cümle yok
    DS-->>U: EmptyState: hepsi bitti
  else
    DS-->>U: SessionCard (önce vadesi gelenler, sonra yeniler)
  end
```

- **Nerede:** `daily-session.tsx` → `getDueVocabularyItemsService` ve
  `getNewVocabularyItemsService` (`services/vocabulary.ts`) → `session-card.tsx`
- **Okuduğu tablolar:** `user`, `vocabulary_cards`, `vocabulary_items`, `videos`
- **Yazdığı tablolar:** yok
- **AI çağrısı:** yok
- **Dallanmalar:**
  - Kullanıcı yoksa giriş yapmaya çağıran `EmptyState` gösterilir.
  - Ne vadesi gelen ne yeni kelime varsa ve cümle adımı da yoksa "All caught up" gösterilir.
  - Kelime varsa session kelimelerle başlar, yoksa doğrudan cümlelere geçer.
- **Döndürdüğü:** `items` (önce vadesi gelenler, çünkü unutulmakta olanlar onlar) ve `newItemIds`
  (yalnızca "New word" rozeti için).

### Bir kelimenin tekrarı

```mermaid
sequenceDiagram
  actor U as Kullanıcı
  participant W as WordsStep (istemci)
  participant A as reviewVocabularyItemAction
  participant S as reviewVocabularyItemService
  participant DB

  Note over W: kuyruk = kelimelerin id'leri, baştaki sorulur
  W->>U: PromptStep: anlam + kelimesi gizlenmiş cümle
  U->>W: İngilizcesini yazar, Check
  W->>W: isCorrectAnswer (phrase ya da contextPhrase ile)
  W->>U: ResultStep: sonuç, kelime, tam cümle, video
  alt doğru, Continue
    U->>W: good
  else yanlış, Continue
    U->>W: again
  else yanlış, I was right
    U->>W: good
  end
  opt kelimenin bu session'daki ilk cevabıysa
    W-)A: vocabularyItemId, rating (sonucu beklenmez)
    A->>S: vocabularyItemId, rating
    S->>DB: user
    S->>DB: vocabulary_items + vocabulary_cards (kullanıcının kelimesi ve kartı)
    break kullanıcı yoksa ya da kelime onun değilse
      S-->>W: AppError → kelimelerin üstünde hata
    end
    S->>S: scheduleReview (FSRS), kart yoksa boş karttan başlar
    S->>DB: transaction: UPSERT vocabulary_cards + INSERT vocabulary_reviews
  end
  alt good
    W->>W: kelime kuyruktan çıkar
  else again
    W->>W: kelime kuyruğun sonuna gider
  end
  Note over W: kuyruk boşalınca onComplete → cümleler ya da DoneStep
```

- **Nerede:** `session-card.tsx` → `words-step/index.tsx` (`handleContinue`) → `prompt-step.tsx` /
  `result-step.tsx` (kontrol `words-step/utils.ts`) → `reviewVocabularyItemAction`
  (`actions/vocabulary.ts`) → `reviewVocabularyItemService` (`services/vocabulary.ts`) →
  `scheduleReview` (`lib/fsrs.ts`)
- **Okuduğu tablolar:** `user`, `vocabulary_items`, `vocabulary_cards`
- **Yazdığı tablolar:** `vocabulary_cards` (kelimenin ilk tekrarında oluşur, sonra güncellenir),
  `vocabulary_reviews` (her tekrarda bir satır: `rating` ve tekrardan önceki `state`, kart yoksa
  `new`; cevap metni saklanmaz)
- **AI çağrısı:** yok
- **Kartın ön yüzü:** anlam (`meaning`) ve cümle (`context`). Cümledeki `contextPhrase` kelime
  başına bir boşlukla gizlenir. `contextPhrase` null ise ya da cümlede bulunamazsa cümle cevabı
  ele vereceği için cevaptan sonraya bırakılır.
- **Kontrol:** büyük/küçük harf, noktalama ve kıvrık kesme işareti yok sayılır. Cevap `phrase`
  (sözlük biçimi) ya da `contextPhrase` (cümledeki biçim) ile aynıysa doğrudur: "give up" da
  "gave up" da kabul edilir.
- **Puan:**

  | Sonuç                   | `rating` | Kuyruk         |
  | ----------------------- | -------- | -------------- |
  | Doğru, Continue         | `good`   | çıkar          |
  | Yanlış, Continue        | `again`  | sona gider     |
  | Yanlış, "I was right"   | `good`   | çıkar          |

  "I was right", kontrolün ayırt edemediği eş anlamlı ya da yazım hatası içindir. `hard` ve `easy`
  hiç gönderilmez.

- **Dallanmalar:**
  - Kullanıcı yoksa (`Unauthorized`) ya da kelime yoksa veya başkasınınsa (`Not found`) hata
    döner. Hata kelimeler adımının üstünde ve `DoneStep`'te gösterilir, akış durmaz.
  - Yanlış cevaplanan kelime session'ın sonunda yeniden sorulur ama sunucuya yalnızca ilk cevap
    gider (`reviewedRef`). Tekrar sorma yalnızca alıştırmadır.
- **Döndürdüğü:** veri yok.

---

**Notlar**

- FSRS yalnızca uzun vadeli planlıyor (`enable_short_term: false`). Bu modda kart her puandan
  sonra `review` durumuna geçer: `learning` ve `relearning` hiç oluşmaz, `again` de kelimeyi en
  erken ertesi güne planlar.
