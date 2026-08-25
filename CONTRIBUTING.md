# Katkı Rehberi

Katkılar issue veya pull request yoluyla kabul edilir. Büyük davranış değişiklikleri için önce hedefi açıklayan bir issue açın.

## Geliştirme akışı

1. `main` dalından kısa ömürlü bir dal oluşturun.
2. Davranış değişikliğini kapsayan test ekleyin veya güncelleyin.
3. Pull request’ten önce `npm run lint`, `npm run typecheck` ve `npm run test:server` komutlarını çalıştırın.
4. Ortam değişkenleri, kişisel veri, gizli anahtar veya oluşturulmuş çıktı eklemeyin.

Kod, mevcut TypeScript kurallarına uygun, küçük ve gözden geçirilebilir değişiklikler halinde gönderilmelidir.
