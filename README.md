# SpyRoyale

SpyRoyale, aynı cihazda veya Socket.IO tabanlı çok oyunculu odalarda oynanabilen, Türkçe bir sosyal çıkarım oyunudur. Oyuncular gizli rollerine göre ipuçları verir; ekip doğru kişiyi bulmaya çalışırken casuslar oyunun yönünü değiştirmeye çalışır.

## Özellikler

- Yerel ve çevrim içi oyun akışları
- Oda kodu ile çok oyunculu lobi, rol dağıtımı ve oylama
- Özelleştirilebilir kategori ve kelime listeleri
- Sürümlü kategori paylaşım kodları
- Expo ile Android, iOS ve web hedefleri

## Mimari

İstemci Expo/React Native ile `src/` altında bulunur. Gerçek zamanlı oyun durumu, ayrı bir Express ve Socket.IO sunucusunda (`server/`) yalnızca bellekte tutulur. Sunucu kalıcı veri deposu, kullanıcı hesabı veya ödeme altyapısı kullanmaz.

## Gereksinimler

- Node.js 22 LTS veya üzeri
- npm 10 veya üzeri
- Mobil geliştirme için Expo Go ya da uygun yerel geliştirme ortamı

## Yerel kurulum

```bash
git clone https://github.com/ayanoglunorth/spyRoyale.git
cd spyRoyale
npm ci
npm --prefix server ci
Copy-Item .env.example .env
```

Bir terminalde gerçek zamanlı sunucuyu, diğerinde Expo istemcisini çalıştırın:

```bash
npm run server
npm start
```

Web hedefi için `npm run web`, üretim web çıktısı için `npm run build:web` kullanılır.

## Yapılandırma

`.env.example` yalnızca örnek değerler içerir. `EXPO_PUBLIC_` ile başlayan değerler istemci derlemesine dahil edilir; bunlara gizli bilgi koymayın.

| Değişken | Amaç |
| --- | --- |
| `EXPO_PUBLIC_SERVER_URL` | Socket.IO sunucu adresi; varsayılan `http://localhost:3001` |
| `EXPO_PUBLIC_SUPPORT_EMAIL` | İsteğe bağlı destek e-postası; boşsa iletişim formu gizlenir |
| `SERVER_ALLOWED_ORIGINS` | Üretimde izinli tarayıcı origin’lerinin virgülle ayrılmış listesi |
| `NODE_ENV` | Üretimde `production`; allowlist zorunludur |

Sunucu çevresel değişkenlerini barındırma sağlayıcısında veya `server/.env` içinde tanımlayın. Lokal örnek değerleri üretimde kullanmayın.

## Güvenlik notları

- Sunucu, olay yüklerini ve oyun sınırlarını doğrular; üretimde wildcard CORS kullanılmaz.
- Oda verisi bellektedir ve sunucu yeniden başlatıldığında silinir.
- Kategori paylaşım kodları taşınabilirlik içindir; şifreli değildir ve hassas içerik taşımamalıdır.
- Gizli anahtarlar, sertifikalar, `.env` dosyaları, günlükler ve derleme çıktıları sürüm kontrolüne alınmaz.

Güvenlik açığı bildirmek için [SECURITY.md](SECURITY.md) dosyasındaki süreci kullanın.

## Kalite kontrolleri

```bash
npm run lint
npm run typecheck
npm run test:server
npm run audit:prod
npm --prefix server audit --omit=dev --audit-level=high
```

GitHub Actions; lint, tür denetimi, sunucu testleri, bağımlılık denetimi ve gizli bilgi taramasını her push ve pull request’te çalıştırır.

## Dağıtım sınırları

`npm run deploy` yalnızca Firebase Hosting statik web çıktısını dağıtır. Socket.IO sunucusu ayrı bir Node.js barındırma ortamına dağıtılmalıdır; HTTPS, `NODE_ENV=production` ve açık bir `SERVER_ALLOWED_ORIGINS` listesi gerekir.

## Katkı ve lisans

Katkı süreci için [CONTRIBUTING.md](CONTRIBUTING.md) dosyasına bakın. Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.
