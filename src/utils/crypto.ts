import { decode, encode } from 'base-64';

export interface SharedCategory {
  version: 1;
  name: string;
  words: string[];
  icon: string;
}

const PREFIX = 'SPYROYALE:1:';

// This format supports portable sharing; it deliberately provides no secrecy.
const encodeUtf8 = (value: string) => encode(unescape(encodeURIComponent(value)));
const decodeUtf8 = (value: string) => decodeURIComponent(escape(decode(value)));

export function encodeSharedCategory(category: Omit<SharedCategory, 'version'>): string {
  return `${PREFIX}${encodeUtf8(JSON.stringify({ version: 1, ...category }))}`;
}

export function decodeSharedCategory(value: string): SharedCategory {
  if (!value.trim().startsWith(PREFIX)) throw new Error('Desteklenmeyen kategori kodu.');
  const data: unknown = JSON.parse(decodeUtf8(value.trim().slice(PREFIX.length)));
  if (!data || typeof data !== 'object') throw new Error('Kategori verisi geçersiz.');
  const category = data as Partial<SharedCategory>;
  if (category.version !== 1 || typeof category.name !== 'string' || !Array.isArray(category.words) || typeof category.icon !== 'string') {
    throw new Error('Kategori verisi geçersiz.');
  }
  if (!category.name.trim() || category.name.length > 48 || category.words.length < 2 || category.words.length > 100 || category.words.some((word) => typeof word !== 'string' || !word.trim() || word.length > 64)) {
    throw new Error('Kategori verisi sınırların dışında.');
  }
  return { version: 1, name: category.name.trim(), words: category.words.map((word) => word.trim()), icon: category.icon };
}
