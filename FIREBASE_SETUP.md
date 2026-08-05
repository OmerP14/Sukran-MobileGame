# Firebase Kurulumu (Faz 1 — Gerçek Hesaplar + Arkadaşlar)

Bu adımları siz yapmalısınız (Google hesabı gerektiriyor, konsoldan yapılıyor).

## 1. Proje oluştur

1. https://console.firebase.google.com → **Add project** → bir isim verin
   (örn. "Sukran Mobil Oyun"). Google Analytics'i kapatabilirsiniz, gerekli değil.

## 2. Web app kaydet (config almak için)

1. Proje içinde ⚙ (Project settings) → **Your apps** → `</>` (Web) simgesi.
2. Bir takma ad girip kaydedin — Firebase Hosting'i işaretlemenize gerek yok.
3. Size gösterilen `firebaseConfig` objesindeki değerleri kopyalayın.
4. Repo kökünde `.env.example`'ı `.env.local` olarak kopyalayıp değerleri
   doldurun (bu dosya zaten `.gitignore`'da, commit'lenmez):

   ```
   cp .env.example .env.local
   ```

## 3. Anonymous Authentication'ı aç

1. Sol menüden **Build → Authentication → Get started**.
2. **Sign-in method** sekmesinde **Anonymous**'u etkinleştirin.

## 4. Firestore veritabanını oluştur

1. **Build → Firestore Database → Create database**.
2. **Production mode** seçin (kurallar zaten `firestore.rules`'ta hazır).
3. Bölge olarak Türkiye'ye yakın bir tanesini seçin (örn. `eur3` / Frankfurt).

## 5. Güvenlik kurallarını yapıştır

1. Firestore → **Rules** sekmesi.
2. Bu repodaki `firestore.rules` dosyasının tamamını kopyalayıp yapıştırın.
3. **Publish**.

## 6. (İlk aramada) Composite index uyarısı

Arkadaş arama (`displayNameLower` üzerinde prefix arama + `isGuest` filtresi)
ilk çalıştığında Firestore büyük ihtimalle konsolda/terminal hata mesajında
"bu sorgu için bir index gerekiyor" diyip **doğrudan tıklanabilir bir link**
verecek — o linke tıklayıp "Create Index" demeniz yeterli, birkaç dakika
içinde hazır olur. Bu normal bir Firestore geliştirme deneyimi, kod tarafında
yapılacak bir şey yok.

## Test

`npm start` ile uygulamayı açın:
- **Misafir Girişi** → eskisi gibi çalışmalı.
- **Hesap Oluştur** → bir isim girin → lobiye düşmeli.
- Aynı ismi başka bir hesapla denerseniz "Bu isim daha önce alınmış" hatası
  almalısınız.
- Hamburger menü → **Arkadaşlar** → başka bir (test) hesabın adını arayın →
  **İstek Gönder**. O hesaba geçip (misafir/başka isimle tekrar giriş yapıp)
  **Arkadaşlar**'da gelen isteği **Kabul Et**. İki hesapta da birbirini
  arkadaş listesinde görmelisiniz.
- Bir misafiri aramayı deneyin → sonuçlarda hiç çıkmamalı.
