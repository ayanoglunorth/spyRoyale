import CryptoJS from 'crypto-js';

const _k1 = [205, 132, 220, 6, 211, 57, 57, 27];
const _k2 = [52, 66, 60, 188, 165, 212, 194, 248];
const _k3 = [105, 150, 103, 61, 43, 16, 158, 167];
const _k4 = [22, 172, 250, 76, 233, 9, 72, 38];

export function getEncryptionKey(): CryptoJS.lib.WordArray {
  const xor = 0x5f;
  let hex = '';
  for (const arr of [_k1, _k2, _k3, _k4]) {
    for (const b of arr) {
      hex += (b ^ xor).toString(16).padStart(2, '0');
    }
  }
  return CryptoJS.enc.Hex.parse(hex);
}

export function encryptData(data: any): { iv: string; ciphertext: string } {
  try {
    const key = getEncryptionKey();
    const iv = CryptoJS.lib.WordArray.random(16);
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return {
      iv: iv.toString(CryptoJS.enc.Hex),
      ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Hex),
    };
  } catch (e) {
    throw new Error('Şifreleme hatası oluştu.');
  }
}

export function decryptData(ivHex: string, ciphertextHex: string): any {
  try {
    const key = getEncryptionKey();
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const ciphertext = CryptoJS.enc.Hex.parse(ciphertextHex);
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const json = decrypted.toString(CryptoJS.enc.Utf8);
    if (!json) throw new Error('Decryption produced empty result');
    return JSON.parse(json);
  } catch (e) {
    throw new Error('Kod çözme hatası.');
  }
}
