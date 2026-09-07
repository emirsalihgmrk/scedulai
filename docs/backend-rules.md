# Backend Katman Kuralları

> **Not:** Aşağıdaki örneklerde geçen modül ve metot isimleri (`Document`, `Project` vb.)
> temsilidir; projedeki gerçek modülleri yansıtmaz.

Veri akışı tek yönlüdür:

```
db/schema.ts · db/types.ts  →  schemas/  →  dal/  →  services/  →  actions/  →  client
```

- **DAL, Service'i çağırmaz.** Pages/Actions → Services → DAL yönünde ilerlenir.
- **Auth ve iş mantığı yalnızca Service katmanındadır.** DAL ve Actions bunları içermez.

---

## Temel Veritabanı Dosyaları

- **`db/schema.ts`** — Drizzle ORM tabloları ve ilişkileri.
- **`db/types.ts`** — Yalnızca üretilmiş **ham** tip ve şemalar; daraltma veya iş kuralı içermez:
  - `$inferSelect` ile ham row tipleri: `<Modül>Row` (Örn: `QuizRow`).
  - `drizzle-zod` ile ham insert/update şemaları: `create<Modül>RowSchema` / `update<Modül>RowSchema`.

---

## 1. Şemalar (`src/schemas/<modül>.ts`)

Public DTO kontratıdır. Üst katmanlar (özellikle UI) `db/schema` veya `db/types`'ı **doğrudan import etmez**; tipleri buradan alır.

### Sorgu Tipleri (Query Types)

- `db/types.ts` içindeki ham `<Modül>Row` tiplerinden `Pick`/`Omit` ve ilişki bileşimiyle türetilir.
- **İsimlendirme:**
  - Tek tablo yansıması: `<Modül>` (Örn: `Question`).
  - İlişki içeren bileşik tip: `<Modül>With<İlişki>` (Örn: `QuizWithQuestions`, `ProjectWithDocuments`).

### Mutasyon Şemaları ve Tipleri (Mutation Schemas & Types)

- Ham `create<Modül>RowSchema` / `update<Modül>RowSchema` şemaları ihtiyaca göre
  `.pick()` / `.omit()` / `.partial()` ile **daraltılır**.
  > Bu bir *alan daraltma*dır; Zod'un `.refine()` metoduyla (özel doğrulama) karıştırılmamalıdır.
- Daraltılmış şemalar birleşerek, ilgili işlemin DAL katmanı için **en geniş** halini oluşturur:
  ```ts
  // archiveDocumentSchema + publishDocumentSchema → updateDocumentSchema
  const updateDocumentSchema = z.object({
    ...publishDocumentSchema.shape,
    ...archiveDocumentSchema.shape,
  });
  ```
- Her şemadan `z.infer` ile bir TypeScript tipi türetilir.

### İsimlendirme

| Öğe   | Kural                        | Örnek                  |
| ----- | ---------------------------- | ---------------------- |
| Şema  | `<işlem><Modül>Schema` (camelCase) | `updateDocumentSchema` |
| Tip   | `<İşlem><Modül>Input` (PascalCase) | `UpdateDocumentInput`  |

---

## 2. Veri Erişim Katmanı (`src/dal/<modül>/{queries,mutations}.ts`)

Ham Drizzle sorguları. İş mantığı ve auth **içermez**.

### Ortak Kurallar (`queries.ts` + `mutations.ts`)

- **İsimlendirme:** Metot isimleri jeneriktir — DAL, "hangi tabloda hangi operasyon" olduğunu söyler, "ne için" yapıldığını değil.
  - ❌ `getDocumentInfo`, `submitDocumentInfo`
  - ✅ `getDocument`, `createDocument`, `updateDocument`
- **Değişkenler:** Sorgu sonucu bir değişkene atanıyorsa tekil satır için `row`, dizi için `rows`.
- **Gövde:** Yalnızca **tek bir** DB işlemi çalıştırılır; iş mantığı içermez.
- **"Bulunamadı" dönüşü:** `undefined` (Drizzle-native). `null` **kullanılmaz** — DAL genelinde sorgu ve mutasyonlar tutarlıdır.

### `queries.ts`

- **Parametreler:** Yalnızca sorgu için kesinlikle gerekli olanlar geçilir.
- **Dönüş Tipi:** `schemas/<modül>.ts`'teki ilgili sorgu tipi:
  - Tek satır → `<QueryType> | undefined` (Örn: `ProjectWithDocuments | undefined`)
  - Dizi → `<QueryType>[]` (Örn: `ProjectWithDocuments[]`)
- Ham dönüş, sorgu tipiyle birebir eşleşmiyorsa yalnızca veri **eşleme (mapping)** yapılabilir — başka mantık yok.

### `mutations.ts`

- **Operasyon:** Gövde tek bir `create` / `update` / `delete` / `upsert` içerir.
- **Parametreler:**
  - Gövde için tek bir `input` parametresi alınır.
  - İlişki alanları (`id`, `slug` vb.) `input` içine dahil **edilmez**; ayrı parametre olarak geçilir.
  - `input` tipi, daraltılmış şemaların birleşiminden oluşan **en geniş** tiptir (Örn: `UpdateDocumentInput`).
  - Transaction gerektiren metotlar opsiyonel bir `tx?` parametresi alır. DAL kendi transaction'ını **başlatmaz**; gerekirse Service `db.transaction` açar ve `tx`'i ilgili metotlara aktarır.
- **Dönüş Tipi:**
  - Tek → `<Type> | undefined` (Örn: `{ id: string } | undefined`), Dizi → `<Type>[]`, gerekiyorsa `void`.
  - ⚠️ `onConflictDoNothing` + destructure edilmiş `returning()`, çakışmada boş dizi döndürür → değer `undefined` olur. Dönüş tipini buna göre (`| undefined`) tanımla.

---

## 3. Servis Katmanı (`src/services/<modül>.ts`)

İş mantığı ve auth burada uygulanır. DAL'ı çağırır; Pages/Actions Service'i çağırır.

### İsimlendirme

- `<fiil><Modül>Service` (Örn: `getQuizService`, `submitAnswerService`).
- DAL jenerik bir fiil kullandığında, Service bu işi semantik olarak somutlaştırabilir:
  DAL `updateDocument` → Service `publishDocumentService` / `archiveDocumentService`.

### Dönüş Tipi (sorgu ve mutasyon ortak)

- Tek obje → `<SchemaType> | null`
- Dizi → `<SchemaType>[]`
- Ya da `void`.

> Katman sınırı kuralı: DAL içeride `undefined` kullanır; Service bunu dış DTO kontratında
> `?? null` ile `null`'a eşler. Böylece `undefined`/`null` ayrımı keyfi değil, katman sınırına dayanır.
> Auth zorunluysa `null` döndürmek yerine `AppError` fırlatılır (aşağıdaki akış).

### Gövde Akışı (hem sorgu hem mutasyon)

1. **Kullanıcı kontrolü** (`getCurrentUser` — `@/services/auth`):
   - Hem kayıtlı hem anonim erişim (kullanıcı bilgisi gerekiyorsa):
     ```ts
     const user = await getCurrentUser();
     ```
   - Yalnızca kayıtlı kullanıcı:
     ```ts
     const user = await getCurrentUser();
     if (!user) throw new AppError("Unauthorized");
     ```
2. **İş mantığı** — varsa kurallar işletilir.
3. **Doğrulama** — güvenilmeyen kullanıcı girdisi ilgili (daraltılmış) şema ile doğrulanır
   (`safeParse` → başarısızsa `AppError`).
4. **DAL çağrısı.**

- Mutasyonlarda Service'e geçilen `input` tipi, DAL'daki geniş tip değil; o spesifik işleme **daraltılmış** tiptir.
- Çok adımlı yazma işlemleri `db.transaction(async (tx) => …)` içinde yürütülür; `tx` ilgili DAL metotlarına geçilir.

---

## 4. Server Actions (`src/actions/<modül>.ts`)

- Dosya başında `"use server"`.
- **Amaç:** Client ↔ Service köprüsü. İş mantığı **içermez**.
- **İşleyiş:** Servisi aynı parametrelerle `try/catch` içinde çağırır:
  - Başarı → `{ ok: true, data }`
  - Hata → `toActionFailure(error)` (`@/lib/action`)
  - Sonuç, standart `ActionResult<T>` nesnesidir.

---

## Hızlı İsimlendirme Referansı

| Katman            | Sorgu                         | Mutasyon                                    |
| ----------------- | ----------------------------- | ------------------------------------------- |
| `db/types.ts`     | `QuizRow`                     | `createQuizRowSchema` / `updateQuizRowSchema` |
| `schemas/`        | `QuizWithQuestions`           | `updateDocumentSchema` / `UpdateDocumentInput` |
| `dal/`            | `getQuiz` → `… \| undefined`   | `createQuiz` → `… \| undefined`              |
| `services/`       | `getQuizService` → `… \| null` | `publishDocumentService` → `… \| null`       |
| `actions/`        | —                             | `submitAnswerAction` → `ActionResult<T>`     |