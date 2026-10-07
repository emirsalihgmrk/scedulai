# ScedulAI Roadmap

> Ürün fikirleri ve öncelik sırası. Uygulama detayı içermez; her madde ayrı ayrı tasarlanıp planlanacak.

## Teşhis

Bugünkü akış: **Program (YouTube kanalı) → Bölüm (video) → Quiz (çeviri) → AI geri bildirimi.**
Tek seferlik ve lineer. Eksikler:

1. **Hafıza döngüsü yok** — öğrenilen şey tekrar karşına çıkmıyor (Practice sayfası boş).
2. **Kişiselleştirme yok** — quiz sadece dil çiftine göre; seviye ve hatalar hiçbir şeyi etkilemiyor.
3. **Geri gelme sebebi yok** — günlük hedef, hatırlatma, görünür ilerleme yok.

Rekabet avantajı modelde değil, **kullanıcının hata ve kelime verisinde**.

**Konumlandırma:** Language Reactor / Lingopie pasif izleme, Duolingo yapay cümleler sunuyor.
ScedulAI → _"Gerçek videolardan, aktif üretimle ve hatalarını hatırlayan bir öğretmenle öğren."_

**Hedef döngü:** Onboarding → Video (etkileşimli) → Quiz → Hatalar & kelimeler → Practice (tekrar) → Hatırlatma → tekrar Practice

---

## Süre tahminleri

**Varsayımlar:**

- Tek geliştirici, **tam zamanlı odaklı hafta ≈ 30–35 saat** verimli çalışma. Yarı zamanlı (~15 saat/hafta) çalışılıyorsa süreleri **~2× al**.
- Süreler tasarım, geliştirme, AI prompt + eval, migration, temel test ve cilayı kapsar. İçerik küratörlüğü (video seçimi, program yazımı) ayrıca zaman alır.
- Tek kişilik projelerde tahminler sistematik olarak kısa çıkar; toplamlara **%25 tampon** eklendi.

| Faz                             | Tahmini süre                             | Kümülatif (orta değer) |
| ------------------------------- | ---------------------------------------- | ---------------------- |
| 1 — Kullanıcıyı tanı            | 3–4 hafta                                | ~1 ay                  |
| 2 — Hafıza döngüsü              | 5–7 hafta                                | ~2,5 ay                |
| 3 — Alışkanlık                  | 3–4 hafta                                | ~3,5 ay                |
| Production hazırlığı + ödeme    | 3–5 hafta                                | **~4,5 ay → Launch**   |
| 4 — Video: izlemekten çalışmaya | 4–6 hafta                                | ~5,5 ay                |
| 5 — Soru tipleri & adaptif quiz | 7–10 hafta                               | ~7,5 ay                |
| 6 — Öğrenme yolları             | 4–6 hafta (+ sürekli içerik)             | ~8,5 ay                |
| 7 — Pro özellikleri             | 4–6 hafta                                | ~10 ay                 |
| 8 — B2B sınıf planı             | 6–8 hafta                                | ~11,5 ay               |
| **Toplam**                      | **39–56 hafta (+%25 tampon ≈ 12–16 ay)** |                        |

### Launch çizgisi

Her şeyi bitirmeden yayına çıkılmalı. **Faz 1 + 2 + 3 + Production hazırlığı (ödeme dahil) ≈ 4–5 ay** sonunda
ürün "her gün geri gelinecek" hale gelir ve para almaya hazırdır. Sonraki fazların sırası gerçek kullanıcı
verisine göre yeniden belirlenmeli (ör. kullanıcılar kendi videolarını çok istiyorsa Faz 7 öne çekilir).

---

## Faz 1 — Temel: kullanıcıyı tanı · _3–4 hafta_

- [x] **Onboarding:** ana dil, hedef dil, seviye, hedef (iş / seyahat / sınav / eğlence), günlük süre · _~1 hafta_
- [x] **Kısa seviye testi** → tahmini CEFR seviyesi · _1–1,5 hafta_ (soru havuzu + puanlama mantığı asıl iş)
- [ ] **Bölümlere CEFR etiketi** (konuşma hızı + kelime sıklığıyla otomatik) → "Senin seviyene uygun videolar" · _0,5–1 hafta_
- [ ] **Kayıtsız demo:** landing'de tek cümle çevir → AI geri bildirimini gör → kayıt ol · _~0,5 hafta_ (kötüye kullanım limiti dahil)

## Faz 2 — Hafıza döngüsü (ürünün kalbi) · _5–7 hafta_

- [ ] **Hata defteri:** AI `mistakes` çıktısı kategorilere ayrılır (zaman, artikel, edat, kelime sırası, kelime seçimi, yazım…); kullanıcı kategori bazlı hata geçmişini görür · _1–1,5 hafta_ (prompt değişikliği + eval'lerin yenilenmesi + eski cevapların migrasyonu)
- [ ] **Kelime/ifade bankası:** transkriptten kelime/ifade kaydet; kart, videodaki cümle ve zaman damgasıyla gelir · _~1,5 hafta_
- [ ] **Aralıklı tekrar (SRS, ör. FSRS)** kelime kartları için · _~1 hafta_ (hazır kütüphaneyle; sıfırdan yazılmamalı)
- [ ] **Practice sayfası = günlük kişisel oturum:** vadesi gelen kartlar + en zayıf hata kategorisinden 3–5 yeni cümle · _1,5–2 hafta_
- [ ] **Tekrar deneme:** soru başına tek cevap yerine deneme geçmişi ("hatayı gör → tekrar dene") · _0,5–1 hafta_ (mevcut tekil cevap kısıtı değişir)

## Faz 3 — Alışkanlık · _3–4 hafta_

- [ ] Günlük hedef (dakika veya kart), seri (streak), seri dondurma · _~1 hafta_ (saat dilimi kenar durumları sanıldığından zor)
- [ ] İlerleme paneli: dinleme saati, öğrenilen kelime, kategori bazlı doğruluk trendi, tahmini CEFR · _1–1,5 hafta_
- [ ] Hatırlatma e-postası (Resend) / PWA push bildirimi · _~1 hafta_ (zamanlanmış iş altyapısı + abonelikten çıkma)
- [ ] Haftalık rapor e-postası: "Edat hatalarında %30 iyileştin, şu 3 ifade hâlâ zorluyor" · _~0,5 hafta_

> Oyunlaştırma dozunda kalmalı — değer önerisi "gerçek içerikle ciddi öğrenme".

## Faz 4 — Video: izlemekten çalışmaya

- [ ] **Senkron etkileşimli transkript:** aktif cümle vurgusu, cümleye tıkla → atla, cümleyi döngüye al, hız ayarı
- [ ] **Kelimeye tıkla → bağlamsal anlam** (sözlük değil, o cümledeki anlam) + tek tıkla bankaya ekle
- [ ] **Video öncesi ısınma:** 5–8 kilit kelime/ifade önceden gösterilir
- [ ] **Shadowing modu:** dinle, tekrarla, kaydet

## Faz 5 — Soru tipleri ve adaptif quiz

| Tip                             | Öğrettiği                 | Seviye |
| ------------------------------- | ------------------------- | ------ |
| Dikte (dinle, yaz)              | Dinleme + yazım           | Tümü   |
| Dinleme anlama (çoktan seçmeli) | Genel anlama              | Tümü   |
| Cümle sıralama                  | Söz dizimi                | A1–A2  |
| Bağlamda anlam                  | Deyim / kalıp             | B1+    |
| Yeniden ifade et (paraphrase)   | Üretim                    | B2+    |
| Video özeti yaz (AI puanlı)     | Serbest yazma, bölüm sonu | B1+    |
| Sesli cevap (speech-to-text)    | Konuşma                   | Tümü   |

- [ ] Yukarıdaki tipler kademeli olarak eklenir
- [ ] Seviyeye göre soru tipi karışımı
- [ ] **Adaptif katman:** ortak temel quiz (maliyet için) + zayıf kategorilere göre 2–3 kişisel soru

## Faz 6 — Programlar = öğrenme yolları

- [ ] Program bir kanal değil bir **hedef** ("İş İngilizcesi", "Seyahat", "IELTS Dinleme", "Teknoloji konuşmaları"); kanallar içerik kaynağı olarak kalır
- [ ] Her bölümün **öğrenme hedefi:** bir dilbilgisi noktası + bir kelime seti
- [ ] **Mini ders kartları:** bir hata kategorisi tekrarlandığında 1–2 dk açıklama + 3 alıştırma
- [ ] Program sonu değerlendirme + tamamlama belgesi / paylaşılabilir rozet

## Faz 7 — Pro özellikleri

- [ ] **Kendi videonu getir:** YouTube linki → transkript + quiz + kelime listesi (aynı video için içerik önbelleklenir)
- [ ] **AI öğretmen:** geri bildirimde "Neden yanlış?" → o cümle üzerine kısa sohbet (mesaj limiti)
- [ ] Anki / CSV dışa aktarma
- [ ] Gelişmiş istatistikler

## Faz 8 — B2B: Sınıf / Kurum planı

- [ ] Öğretmen hesabı: sınıf oluştur, program ata
- [ ] Öğrenci ilerlemesi ve **sınıfın ortak hata kategorileri** paneli
- [ ] Kurum faturalandırması (koltuk başı)

> Dil kursları ve okullar bireysel kullanıcılardan daha istikrarlı gelir sağlar; mevcut admin rolü zemin oluşturur.

---

## Gelir modeli

| Plan  | İçerik                                                                               | Fiyat fikri                |
| ----- | ------------------------------------------------------------------------------------ | -------------------------- |
| Free  | Günlük sınırlı quiz, sınırlı kelime kaydı, küratörlü programlar                      | $0                         |
| Pro   | Sınırsız analiz, kendi videonu getir, AI öğretmen, gelişmiş istatistik, dışa aktarma | $6–9/ay (yıllıkta indirim) |
| Sınıf | Pro + öğretmen paneli                                                                | Koltuk başı                |

> Mevcut $2/ay, AI maliyetini ve değer algısını karşılamaz.

## Production hazırlığı (fazlardan bağımsız, sürekli)

- [ ] Kullanıcı başına AI maliyet takibi ve limitler (`ai_traces` üzerine panel)
- [ ] Rate limiting ve kötüye kullanım koruması
- [ ] Hukuki: YouTube içerik/transkript kullanım şartları, KVKK/GDPR, hesap silme ve veri dışa aktarma
- [ ] SEO: her video için açık "X ile İngilizce öğren" sayfası (transkript önizlemesi + örnek sorular)
- [ ] Boş durumlar, hata durumları, mobil uyum / PWA
- [ ] Arayüzün birden çok dile çevrilmesi (i18n)
