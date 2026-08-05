# Ses Dosyaları

Bunlar oyuna bağlandı (bkz. `src/utils/sound.ts`) ve `Ayarlar > Ses` kapalıyken
çalmıyor.

Şu an nerede tetikleniyor ve yaklaşık süresi:

- `card-deal.mp3` (~2sn) — dağıtma animasyonu (4sn) başladığı an **iki kere**
  art arda çalar, tüm dağıtma boyunca sessiz kalmasın diye (tek tek her kart
  için değil).
- `request-submit.mp3` (~0.5sn) — "Kart İste" gönderildiğinde, ama SADECE
  sonuç başarılıysa (sonuç zaten senkron biliniyor). "Yok" çıkarsa bu ses
  çalmaz, sadece `request-fail` çalar — ikisi üst üste binip çakışmasın diye.
  Botlar kendi istekleri için bu sesi hiç tetiklemiyor.
- `request-success.mp3` (~0.6sn, "sıra bende") — ARTIK bir kart alma sesi
  DEĞİL — sadece sıra size gerçekten YENİDEN geldiğinde (biri oynadı, biri
  oynadı, ... sonra size geldi) bir kere çalar. Şükran'ı onaylayıp aynı
  sıranızda art arda kart alıyorsanız tekrar çalmaz — sadece turun ilk
  hamlesinde. Botların birbirinden kart alması artık hiç ses çıkarmıyor
  (bilerek — dörtlü tamamlasa da tamamlamasa da sessiz, aşağıya bakın).
- `request-fail.mp3` (~0.65sn, "kart yok") — negatif-sonuç sesi: bir istek
  "Yok" ile sonuçlandığında, Şükran süresi dolup unutulduğunda, YA DA kart
  isteme süresi dolup kimseden istemediğinizde — ama sadece sıra BAŞKASINA
  geçtiğinde. Sıra doğrudan insana geçiyorsa bu ses ÇALMAZ, onun yerine
  yukarıdaki "sıra bende" sesi çalar (ikisi aynı anda çalıp kafa
  karıştırmasın diye).
- `sukran-appear.mp3` (~1.2sn, dingi) — SADECE ŞÜKRAN butonu belirince çalar.
  Artık "sıra bende" için kullanılmıyor (`request-success` onun yerini aldı).
- `sukran-timeout.mp3` (~1.1sn, gerçek tik-tak sesi) — istek süresi son birkaç
  saniyeye girince, **urgency bitene kadar tekrar tekrar loop'lanır** (~950ms'de
  bir) — tek seferlik değil, çünkü uyarı penceresi (oda tipine göre 2-7sn)
  klipten çok daha uzun sürebiliyor.
- `sukran-confirm.mp3` (~0.2sn) — ŞÜKRAN'a basıldığında.
- `game-win.mp3` (~3sn) / `game-lose.mp3` (~2sn) — oyun bitip kazanınca/kaybedince.
- `ui-tap.mp3` (~0.2sn) — lobi hamburger menüsü, menü öğeleri, masa kartları, "Masayı Kur ve Başla", geri/çıkış butonları, oyun içi ⚙ ikonu.

Not: `set-complete.mp3` (dörtlü tamamlandı sesiydi, hiç duyulmadığı için
kaldırıldı) ve `shufflecard.mp3` (`card-deal.mp3`'ün kaynağıydı) klasörden de
silindi — artık burada listelenen dosyaların hepsi gerçekten kullanılıyor.

## Opsiyonel, henüz eklenmedi

- `table-ambience.mp3` — oyun ekranında loop'lanabilir hafif arkaplan sesi (opsiyonel).

## Yeni dosya eklerken

- İsimler **aynen** korunmalı — `src/utils/sound.ts`'teki `require(...)` yolları bunlara bağlı.
- `card-deal` dışındaki tüm sesler tek seferlik efekt olduğu için kısa tutulmalı
  (yarım saniyeyi geçmemeleri iyi olur).
