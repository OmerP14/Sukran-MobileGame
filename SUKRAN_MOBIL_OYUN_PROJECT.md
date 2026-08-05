# Şükran Mobil Oyunu — Proje ve Geliştirme Dokümanı

## 1. Proje Özeti

**Şükran**, 52 kartlık standart iskambil destesiyle oynanan, hafıza ve strateji temelli bir kart oyunudur.

Bu projenin amacı oyunu **React Native + Expo + TypeScript** kullanarak Android ve iOS için mobil uygulamaya dönüştürmektir.

İlk sürümde:

- 4 oyuncu bulunacak.
- 1 oyuncu gerçek kullanıcı olacak.
- 3 oyuncu bot olacak.
- Online çok oyunculu sistem bulunmayacak.
- Oyun internet bağlantısı olmadan çalışabilecek.
- Oyuncular aynı değerdeki 4 kartı toplamaya çalışacak.
- Kart alan oyuncunun süre dolmadan **“Şükran”** butonuna basması gerekecek.

---

## 2. Kullanılacak Teknolojiler

- React Native
- Expo
- TypeScript
- Expo Router
- Zustand
- AsyncStorage
- React Native Reanimated
- Expo Haptics
- Expo AV veya Expo Audio
- ESLint
- Prettier

İlk sürümde backend kullanılmayacak.

Tüm oyun durumu cihazda tutulacak. Ayarlar ve istatistikler AsyncStorage ile kaydedilecek.

---

## 3. Oyun Kuralları

### 3.1 Oyuncular

- Oyun 4 kişiyle oynanır.
- Oyuncular geçici olarak şu şekilde adlandırılabilir:
  - Oyuncu 1 — Gerçek kullanıcı
  - Oyuncu 2 — Bot
  - Oyuncu 3 — Bot
  - Oyuncu 4 — Bot

### 3.2 Kartların dağıtılması

- Standart 52 kartlık iskambil destesi kullanılır.
- Joker kullanılmaz.
- Her oyuncuya 13 kart dağıtılır.
- Böylece destede dağıtılmamış kart kalmaz.

### 3.3 Oyunun amacı

Amaç aynı değere sahip 4 kartı toplamaktır.

Örnek dörtlüler:

- 4 As
- 4 Papaz
- 4 Kız
- 4 Vale
- 4 Onlu

Bir oyuncu aynı değerdeki dört kartı tamamladığında bu kartlar otomatik olarak elinden çıkarılır ve oyuncunun topladığı setlere eklenir.

Oyunun sonunda en fazla dörtlü sete sahip oyuncu kazanır.

### 3.4 Kart isteme

Sırası gelen oyuncu:

1. Kart isteyeceği oyuncuyu seçer.
2. İsteyeceği kart değerini seçer.
3. Kaç kart istediğini seçer.
4. İsteği onaylar.

Bir oyuncu tek istekte aynı karttan **1, 2, 3 veya 4 adet** isteyebilir.

Örnek:

> Oyuncu 3, Oyuncu 2’den 2 adet Kız ister.

Oyuncunun istediği karttan kendi elinde bulunması zorunlu değildir.

Elinde olmayan bir kartı istemenin cezası yoktur.

### 3.5 İstenen kartların verilmesi

İstenen oyuncuda talep edilen karttan istenen sayı kadar veya daha fazla varsa, istenen sayı kadar kartı vermek zorundadır.

Örnek:

- Oyuncu 2’den 2 Kız istendi.
- Oyuncu 2’de 3 Kız var.
- Oyuncu 2 tam olarak 2 Kız verir.

İstenen oyuncuda talep edilen sayıdan daha az kart varsa, hiçbir kart vermez ve yalnızca:

> Yok.

cevabı gösterilir.

Elinde gerçekte kaç tane olduğu açıklanmaz.

Örnek:

- Oyuncu 2’den 2 Kız istendi.
- Oyuncu 2’de yalnızca 1 Kız var.
- Oyuncu 2 kart vermez.
- Ekranda yalnızca “Yok” mesajı görünür.
- Oyuncu 2’de 1 Kız bulunduğu açıklanmaz.

İstenen oyuncuda talep edilen karttan hiç yoksa da aynı şekilde “Yok” cevabı verilir.

### 3.6 Başarılı istekte sıra

Kart isteyen oyuncu talep ettiği kartları başarıyla alırsa **Şükran aşaması** başlar.

Oyuncu zamanında “Şükran” derse veya butona basarsa sırası devam eder ve yeniden kart isteyebilir.

### 3.7 Başarısız istekte sıra

İstenen oyuncu “Yok” cevabı verirse sıra kart istenen oyuncuya geçer.

Örnek:

- Oyuncu 1, Oyuncu 3’ten 2 As istedi.
- Oyuncu 3’te yeterli sayıda As yok.
- Oyuncu 3 “Yok” der.
- Yeni sıra Oyuncu 3’e geçer.

---

## 4. Şükran Mekaniği

### 4.1 İlk sürüm

İlk sürümde ses tanıma kullanılmayacak.

Başarılı bir kart transferinden hemen sonra ekranın ortasında büyük bir:

> ŞÜKRAN

butonu gösterilecek.

Oyuncunun butona basması için varsayılan olarak **3 saniyesi** olacak.

### 4.2 Başarılı Şükran

Oyuncu süre dolmadan butona basarsa:

- Hafif titreşim çalışır.
- “Şükran!” geri bildirimi gösterilir.
- Oyuncunun sırası devam eder.
- Oyuncu yeniden bir oyuncudan kart isteyebilir.

### 4.3 Şükran’ı unutma

Oyuncu süre içinde butona basmazsa:

- “Şükran demeyi unuttun!” mesajı gösterilir.
- Oyuncunun sırası sona erer.
- Sıra, kartların alındığı oyuncuya geçer.

### 4.4 Botlarda Şükran

Botların da Şükran’ı unutma ihtimali bulunmalıdır.

Zorluk seviyesine göre unutma ihtimali:

- Kolay bot: %20
- Normal bot: %8
- Zor bot: %2

Bot başarılı olduğunda kısa bir beklemeden sonra “Şükran!” balonu gösterilir.

Bot unuttuğunda “Şükran demeyi unuttu” bildirimi gösterilir ve sıra kartı veren oyuncuya geçer.

### 4.5 Gelecekte eklenebilecek modlar

Daha sonraki sürümlerde şu seçenekler eklenebilir:

- Mikrofon ile gerçekten “Şükran” deme
- Ekranda buton göstermeyen zor mod
- Ekranın herhangi bir yerine çift dokunma
- Ayarlanabilir Şükran süresi
- Refleks modu
- Yanlış kelime algılama sistemi

---

## 5. Oyun Sonu

Oyunda toplam 13 farklı kart değeri vardır.

Tüm dörtlü setler tamamlandığında oyun sona erer.

Oyun sonunda:

- Her oyuncunun topladığı dörtlü sayısı gösterilir.
- En fazla dörtlüyü toplayan oyuncu kazanır.
- Eşitlik varsa birden fazla kazanan gösterilebilir.

Sonuç ekranında:

- Kazanan
- Oyuncuların set sayıları
- Toplam hamle sayısı
- Başarılı kart istekleri
- Başarısız kart istekleri
- Şükran unutma sayısı
- Yeniden oyna butonu
- Ana menü butonu

bulunmalıdır.

---

## 6. İlk Sürüm Ekranları

### 6.1 Açılış ekranı

- Oyun logosu
- Kısa yükleme animasyonu
- Ana menüye geçiş

### 6.2 Ana menü

- Oyuna Başla
- Nasıl Oynanır?
- Ayarlar
- İstatistikler

### 6.3 Oyun ayarları

- Bot zorluk seviyesi
- Şükran süresi
- Ses açık/kapalı
- Titreşim açık/kapalı
- Kart sıralama seçeneği

### 6.4 Oyun masası

Ekranda:

- Üstte Bot 2
- Solda Bot 1
- Sağda Bot 3
- Altta gerçek oyuncu
- Her oyuncunun elindeki kart sayısı
- Her oyuncunun topladığı set sayısı
- Sırası gelen oyuncu göstergesi
- Son yapılan hamle bilgisi
- Gerçek oyuncunun kartları

bulunmalıdır.

Rakiplerin kartlarının yalnızca arka yüzü gösterilmelidir.

### 6.5 Kart isteme paneli

Gerçek oyuncunun sırası geldiğinde:

1. Rakip seçimi
2. Kart değeri seçimi
3. Adet seçimi
4. “Kart İste” butonu

gösterilmelidir.

Kart değerleri:

- As
- 2
- 3
- 4
- 5
- 6
- 7
- 8
- 9
- 10
- Vale
- Kız
- Papaz

Adet seçenekleri:

- 1
- 2
- 3
- 4

### 6.6 Şükran ekran katmanı

Başarılı kart transferinde oyunun üzerinde modal veya overlay açılmalıdır.

İçerik:

- Geri sayım
- Büyük ŞÜKRAN butonu
- Hafif animasyon
- Süre çubuğu

Bu ekran açıkken diğer oyun kontrolleri devre dışı olmalıdır.

### 6.7 Sonuç ekranı

- Kazanan bilgisi
- Sıralama
- Oyun istatistikleri
- Yeniden Oyna
- Ana Menü

---

## 7. Veri Modelleri

```ts
export type Suit = "hearts" | "diamonds" | "clubs" | "spades";

export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type PlayerType = "human" | "bot";

export type BotDifficulty = "easy" | "normal" | "hard";

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  hand: Card[];
  completedSets: Rank[];
  botDifficulty?: BotDifficulty;
}

export interface CardRequest {
  requesterId: string;
  targetPlayerId: string;
  rank: Rank;
  amount: 1 | 2 | 3 | 4;
}

export interface LastMove {
  requesterId: string;
  targetPlayerId: string;
  rank: Rank;
  requestedAmount: number;
  success: boolean;
  transferredAmount: number;
  forgotSukran?: boolean;
}

export type GamePhase =
  | "setup"
  | "dealing"
  | "waiting_for_request"
  | "resolving_request"
  | "waiting_for_sukran"
  | "bot_turn"
  | "game_over";

export interface GameState {
  players: Player[];
  currentPlayerId: string;
  phase: GamePhase;
  lastMove?: LastMove;
  sukranTargetPlayerId?: string;
  turnNumber: number;
  winnerIds: string[];
}
```

---

## 8. Temel Oyun Fonksiyonları

Aşağıdaki fonksiyonlar oyun mantığından ayrılmış saf TypeScript fonksiyonları olarak yazılmalıdır.

```ts
createDeck(): Card[]
shuffleDeck(deck: Card[]): Card[]
dealCards(deck: Card[], players: Player[]): Player[]
requestCards(state: GameState, request: CardRequest): GameState
resolveCardRequest(state: GameState, request: CardRequest): GameState
confirmSukran(state: GameState): GameState
handleSukranTimeout(state: GameState): GameState
findCompletedSets(hand: Card[]): Rank[]
removeCompletedSets(player: Player): Player
getNextTurnAfterFailedRequest(targetPlayerId: string): string
checkGameOver(state: GameState): boolean
calculateWinners(state: GameState): string[]
```

Oyun kuralları React bileşenlerinin içine yazılmamalıdır.

Tüm temel kurallar `src/game/` klasöründe tutulmalıdır.

---

## 9. Kart İsteme Algoritması

Bir kart isteği işlendiğinde:

1. İsteği yapan oyuncu ile hedef oyuncunun farklı olduğu doğrulanır.
2. İstenen adet 1–4 arasında doğrulanır.
3. Hedef oyuncunun elindeki ilgili değere sahip kartlar bulunur.
4. Hedef oyuncuda istenen sayı kadar kart varsa:
   - Tam istenen sayı kadar kart transfer edilir.
   - Hedef oyuncudan kartlar çıkarılır.
   - İsteyen oyuncuya kartlar eklenir.
   - Yeni oluşan dörtlüler kontrol edilir.
   - Tamamlanan setler kapatılır.
   - Oyun bitmediyse Şükran aşaması başlatılır.
5. Hedef oyuncuda istenen sayıdan az kart varsa:
   - Hiçbir kart transfer edilmez.
   - “Yok” sonucu oluşturulur.
   - Sıra hedef oyuncuya geçer.
6. Hedef oyuncunun gerçek kart sayısı kullanıcıya açıklanmaz.

---

## 10. Dörtlü Kapatma

Bir oyuncunun elinde aynı değerde 4 kart oluştuğunda sistem otomatik olarak:

1. Dört kartı oyuncunun elinden çıkarır.
2. İlgili kart değerini `completedSets` listesine ekler.
3. Masada kısa bir kapatma animasyonu oynatır.
4. “4 Kız tamamlandı” benzeri bildirim gösterir.

Bir kart değerinin bir oyunda yalnızca bir kez dörtlü olarak tamamlanması mümkündür.

---

## 11. Bot Yapay Zekâsı

İlk sürümde harici yapay zekâ servisi veya dil modeli kullanılmayacaktır.

Botlar kurallı algoritmayla çalışacaktır.

### 11.1 Bot hafızası

Botlar şu olayları hatırlayabilir:

- Hangi oyuncu hangi kartı istedi?
- İstek başarılı mıydı?
- Bir oyuncu hangi karttan “Yok” dedi?
- Hangi dörtlüler kapatıldı?
- Bir oyuncunun yakın zamanda aldığı kartlar

### 11.2 Kolay bot

- Çoğunlukla rastgele hedef seçer.
- Çoğunlukla rastgele kart değeri seçer.
- Hafızayı çok az kullanır.
- Sık Şükran unutabilir.

### 11.3 Normal bot

- Geçmiş istekleri kısmen hatırlar.
- Bir oyuncunun yakın zamanda aldığı kartları istemeyi dener.
- Kendi elinde çok bulunan değerleri tamamlamaya çalışır.
- Orta düzeyde hata yapar.

### 11.4 Zor bot

- Tüm açık oyun geçmişini kullanır.
- Kartların olası dağılımını tahmin eder.
- Kendi elinde 2 veya 3 bulunan değerlere öncelik verir.
- Rakibin toplamakta olduğu kartları engellemeye çalışır.
- Çok düşük Şükran unutma ihtimaline sahiptir.

### 11.5 Bot hamlesi

```ts
export interface BotDecision {
  targetPlayerId: string;
  rank: Rank;
  amount: 1 | 2 | 3 | 4;
}
```

```ts
chooseBotMove(
  state: GameState,
  botPlayerId: string,
  difficulty: BotDifficulty
): BotDecision
```

Bot kararından önce 700–1400 ms arasında rastgele bekleme kullanılabilir.

---

## 12. Zustand Store Yapısı

Önerilen store eylemleri:

```ts
interface GameStore extends GameState {
  startGame: (difficulty: BotDifficulty) => void;
  resetGame: () => void;
  submitCardRequest: (request: CardRequest) => void;
  confirmSukran: () => void;
  handleSukranTimeout: () => void;
  runBotTurn: () => Promise<void>;
  completeGame: () => void;
}
```

Store yalnızca koordinasyon sağlamalıdır.

Asıl kurallar saf fonksiyonlarda bulunmalıdır.

---

## 13. Önerilen Klasör Yapısı

```txt
sukran-game/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── game.tsx
│   ├── rules.tsx
│   ├── settings.tsx
│   ├── statistics.tsx
│   └── result.tsx
├── src/
│   ├── components/
│   │   ├── PlayingCard.tsx
│   │   ├── PlayerSeat.tsx
│   │   ├── OpponentHand.tsx
│   │   ├── HumanHand.tsx
│   │   ├── CardRequestPanel.tsx
│   │   ├── SukranOverlay.tsx
│   │   ├── TurnIndicator.tsx
│   │   ├── CompletedSet.tsx
│   │   └── GameMessage.tsx
│   ├── game/
│   │   ├── deck.ts
│   │   ├── rules.ts
│   │   ├── request.ts
│   │   ├── sets.ts
│   │   ├── turn.ts
│   │   ├── game-over.ts
│   │   └── bot-ai.ts
│   ├── store/
│   │   ├── game-store.ts
│   │   └── settings-store.ts
│   ├── types/
│   │   └── game.ts
│   ├── constants/
│   │   ├── cards.ts
│   │   └── config.ts
│   ├── utils/
│   │   ├── random.ts
│   │   └── storage.ts
│   └── assets/
│       ├── cards/
│       ├── sounds/
│       └── images/
├── __tests__/
│   ├── deck.test.ts
│   ├── request.test.ts
│   ├── sets.test.ts
│   ├── turn.test.ts
│   └── game-over.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 14. Tasarım Yönü

- Koyu yeşil veya lacivert oyun masası
- Altın veya krem detaylar
- Modern ama iskambil hissini koruyan arayüz
- Büyük ve okunabilir kart değerleri
- Tek elle kullanılabilir kontroller
- Gereksiz metin yerine simgeler ve kısa geri bildirimler
- Oyuncunun kendi kartları ekranın altında yatay kaydırılabilir biçimde gösterilmeli
- Aynı değerdeki kartlar yan yana gruplanmalı
- Kartların sırası varsayılan olarak değere göre düzenlenmeli

İlk sürümde özel çizilmiş kart görselleri yerine kodla oluşturulan basit kart bileşenleri kullanılabilir.

---

## 15. Ses ve Titreşimler

Önerilen geri bildirimler:

- Kart dağıtma sesi
- Kart transfer sesi
- Başarılı Şükran sesi
- Şükran unutma sesi
- Dörtlü kapatma sesi
- Oyun kazanma sesi
- Başarılı işlemde hafif titreşim
- Şükran süresi dolduğunda güçlü titreşim

Ses ve titreşim ayarlardan kapatılabilmelidir.

---

## 16. Kaydedilecek İstatistikler

AsyncStorage ile:

- Toplam oynanan oyun
- Toplam galibiyet
- Galibiyet oranı
- Toplam tamamlanan dörtlü
- Toplam başarılı istek
- Toplam başarısız istek
- Toplam Şükran unutma
- En iyi oyun skoru

saklanabilir.

---

## 17. Test Edilmesi Gereken Kurallar

Aşağıdaki durumlar için unit test yazılmalıdır:

1. Deste 52 benzersiz kart üretir.
2. Her oyuncuya tam 13 kart dağıtılır.
3. Başarılı kart isteğinde doğru sayıda kart aktarılır.
4. Hedefte yeterli kart yoksa hiçbir kart aktarılmaz.
5. Hedefte 1 kart varken 2 kart istenirse “Yok” sonucu oluşur.
6. Başarısız istekte sıra hedef oyuncuya geçer.
7. Şükran zamanında söylenirse aynı oyuncunun sırası devam eder.
8. Şükran unutulursa sıra kartı veren oyuncuya geçer.
9. Dört aynı değer oluştuğunda set otomatik kapatılır.
10. Oyun tüm 13 set tamamlanınca biter.
11. En fazla sete sahip oyuncu kazanır.
12. Eşitlikte birden fazla kazanan döndürülür.
13. Rakiplerin gizli kartları kullanıcı arayüzünde görünmez.
14. Botlar geçerli hedef, değer ve adet seçer.

---

## 18. Geliştirme Aşamaları

### Aşama 1 — Proje kurulumu

- Expo TypeScript projesi oluştur.
- Expo Router kur.
- Zustand kur.
- ESLint ve Prettier ayarla.
- Temel klasör yapısını oluştur.

### Aşama 2 — Oyun motoru

- Kart tiplerini oluştur.
- Deste üret.
- Desteyi karıştır.
- Kartları dağıt.
- Kart isteme mantığını yaz.
- Sıra mantığını yaz.
- Dörtlü kapatma sistemini yaz.
- Oyun sonunu yaz.
- Unit testleri ekle.

### Aşama 3 — Temel arayüz

- Ana menü
- Oyun masası
- Oyuncu alanları
- Kart gösterimi
- Kart isteme paneli
- Sonuç ekranı

### Aşama 4 — Şükran sistemi

- Overlay
- 3 saniyelik sayaç
- Buton
- Timeout
- Sıra değişimi
- Titreşim
- Ses

### Aşama 5 — Botlar

- Kolay bot
- Normal bot
- Zor bot
- Bot hafızası
- Bot hamle animasyonu

### Aşama 6 — Cilalama

- Kart animasyonları
- Sesler
- Ayarlar
- İstatistikler
- Hata düzeltmeleri
- Android cihaz testi
- iPhone cihaz testi

### Aşama 7 — Yayın

- Uygulama ikonu
- Splash screen
- Android build
- iOS build
- Gizlilik metni
- Play Store hazırlığı
- App Store hazırlığı

---

## 19. İlk Kurulum Komutları

```bash
npx create-expo-app@latest sukran-game --template blank-typescript
cd sukran-game

npx expo install expo-router react-native-safe-area-context react-native-screens
npx expo install expo-haptics
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-reanimated
npm install zustand

npx expo start
```

Expo Router kurulumu sırasında güncel Expo dokümantasyonuna göre gerekli `package.json`, giriş dosyası ve Babel ayarlarını yapılandır.

---

## 20. Claude İçin Ana Geliştirme Talimatı

Aşağıdaki metni Claude Code veya başka bir kodlama ajanına ver:

```txt
Bu repoda React Native, Expo, Expo Router ve TypeScript kullanarak “Şükran” isimli mobil iskambil oyununu geliştireceksin.

Önce bu dokümanın tamamını oku ve kuralları değiştirmeden uygula.

Temel gereksinimler:

- Oyun 4 oyunculu olacak.
- 1 gerçek oyuncu ve 3 bot bulunacak.
- 52 kartın tamamı dağıtılacak ve her oyuncuya 13 kart verilecek.
- Oyuncu istediği rakipten istediği kart değerini 1–4 adet isteyebilecek.
- Oyuncunun istediği karttan kendi elinde bulunması gerekmeyecek.
- Hedef oyuncuda istenen sayı kadar kart varsa tam istenen sayı aktarılacak.
- Hedef oyuncuda istenenden daha az kart varsa hiçbir kart aktarılmayacak ve yalnızca “Yok” sonucu oluşacak.
- Başarısız istekte sıra hedef oyuncuya geçecek.
- Başarılı istekte Şükran aşaması başlayacak.
- Gerçek oyuncunun 3 saniye içinde ŞÜKRAN butonuna basması gerekecek.
- Basarsa sırası devam edecek.
- Basmazsa sıra kartı veren oyuncuya geçecek.
- Aynı değerde 4 kart tamamlanınca set otomatik kapatılacak.
- En çok seti toplayan oyuncu kazanacak.
- İlk sürüm tamamen offline çalışacak.
- Backend ve online multiplayer ekleme.
- Oyun kurallarını React bileşenlerinin içine yazma.
- Saf TypeScript oyun motoru oluştur.
- Zustand yalnızca state koordinasyonu için kullanılsın.
- Kritik oyun kuralları için unit test yaz.
- Strict TypeScript kullan.
- any kullanmaktan kaçın.
- Büyük bileşenleri küçük parçalara ayır.
- Kod okunabilir ve modüler olsun.

Çalışma sırası:

1. Mevcut repoyu incele.
2. Eksik bağımlılıkları ve klasörleri belirle.
3. Önce veri modellerini ve saf oyun motorunu oluştur.
4. Oyun motoru için testleri yaz.
5. Ardından Zustand store oluştur.
6. Sonra temel ekranları ve bileşenleri oluştur.
7. Şükran sayacını ve sıra mantığını bağla.
8. Bot algoritmalarını ekle.
9. Uygulamayı çalıştır ve TypeScript/lint/test hatalarını düzelt.
10. Yapılan işleri README içinde açıkla.

Her aşamadan sonra projeyi çalıştırılabilir halde bırak.

Bir kural konusunda belirsizlik yaşarsan bu dokümandaki açıklamayı esas al. Dokümanda belirtilmeyen küçük UX kararlarında mantıklı ve mobil uyumlu tercihler yap.
```

---

## 21. Claude’a Verilecek İlk Görev

Projeyi boş oluşturduktan sonra Claude’a ilk olarak şunu gönder:

```txt
PROJECT.md dosyasını baştan sona oku.

Şimdilik yalnızca projenin temelini ve oyun motorunu oluştur:

- Gerekli klasör yapısını kur.
- Oyun veri tiplerini yaz.
- 52 kartlık benzersiz deste üret.
- Fisher–Yates ile deste karıştır.
- 4 oyuncuya 13’er kart dağıt.
- Kart isteme ve transfer kurallarını uygula.
- Başarısız istekte sıra değişimini uygula.
- Şükran başarılı ve timeout durumlarını uygula.
- Dörtlü kapatma sistemini uygula.
- Oyun sonu ve kazanan hesabını uygula.
- Tüm kritik kurallar için unit test yaz.

Henüz detaylı arayüz veya animasyon yapma.

İşin sonunda:
- TypeScript kontrolünü çalıştır.
- Testleri çalıştır.
- Hataları düzelt.
- Oluşturduğun dosyaları ve mimariyi özetle.
```

---

## 22. MVP Tamamlanma Kriterleri

İlk oynanabilir sürüm aşağıdaki şartları sağlamalıdır:

- Uygulama Expo Go üzerinde açılır.
- Yeni oyun başlatılabilir.
- Kartlar doğru şekilde dağıtılır.
- Oyuncunun kartları görünür.
- Rakip kartları gizlidir.
- Oyuncu hedef, kart değeri ve adet seçebilir.
- Kart isteği kurallara uygun işlenir.
- “Yok” durumunda sıra doğru kişiye geçer.
- Başarılı transferden sonra Şükran sayacı açılır.
- Şükran’a basılırsa oyuncu devam eder.
- Süre dolarsa sıra kartı veren oyuncuya geçer.
- Botlar geçerli hamle yapar.
- Dörtlüler otomatik kapatılır.
- Oyun doğru zamanda biter.
- Kazanan doğru hesaplanır.
- Uygulamada çökme oluşturan bilinen hata kalmaz.

---

## 23. MVP Sonrası Özellikler

İlk sürüm tamamlandıktan sonra:

- Aynı telefonda arkadaşlarla paslaşmalı oyun
- Online oda sistemi
- Arkadaş daveti
- Sesli “Şükran” algılama
- Oyuncu profilleri
- Avatarlar
- Liderlik tablosu
- Günlük görevler
- Başarımlar
- Farklı masa temaları
- Kart destesi temaları
- Reklam kaldırma satın alımı
- Özel oyun kuralları
- 2 veya 3 oyunculu alternatif modlar

eklenebilir.
