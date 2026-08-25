import type { CategoryData } from './rooms.js';

export const LIMITS = {
  username: 32,
  roomCode: 4,
  maxPlayers: 12,
  maxCategories: 25,
  categoryName: 48,
  maxWords: 100,
  wordLength: 64,
  eventWindowMs: 60_000,
  eventsPerWindow: 80,
} as const;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function text(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string') throw new Error(`${field} geçersiz.`);
  const normalized = value.trim();
  if (!normalized || normalized.length > max) throw new Error(`${field} geçersiz.`);
  return normalized;
}

export function roomCode(value: unknown): string {
  const code = text(value, 'Oda kodu', LIMITS.roomCode).toUpperCase();
  if (!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/.test(code)) {
    throw new Error('Oda kodu geçersiz.');
  }
  return code;
}

export function integer(value: unknown, field: string, min: number, max: number): number {
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
    throw new Error(`${field} geçersiz.`);
  }
  return value as number;
}

export function categories(value: unknown): CategoryData[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > LIMITS.maxCategories) {
    throw new Error('Kategoriler geçersiz.');
  }
  return value.map((category, index) => {
    if (!record(category)) throw new Error(`Kategori ${index + 1} geçersiz.`);
    const words = category.words;
    if (!Array.isArray(words) || words.length < 2 || words.length > LIMITS.maxWords) {
      throw new Error(`Kategori ${index + 1} en az iki kelime içermelidir.`);
    }
    return {
      id: text(category.id, 'Kategori kimliği', 64),
      name: text(category.name, 'Kategori adı', LIMITS.categoryName),
      words: words.map((word) => text(word, 'Kategori kelimesi', LIMITS.wordLength)),
    };
  });
}

export function createRoomPayload(value: unknown) {
  if (!record(value)) throw new Error('Oda oluşturma isteği geçersiz.');
  const agentCount = integer(value.agentCount, 'Ajan sayısı', 3, LIMITS.maxPlayers - 1);
  const spyCount = integer(value.spyCount, 'Casus sayısı', 1, agentCount - 2);
  return {
    username: text(value.username, 'Kullanıcı adı', LIMITS.username),
    agentCount,
    spyCount,
    categories: value.categories === undefined ? [] : categories(value.categories),
  };
}

export function joinRoomPayload(value: unknown) {
  if (!record(value)) throw new Error('Odaya katılma isteği geçersiz.');
  return { roomCode: roomCode(value.roomCode), username: text(value.username, 'Kullanıcı adı', LIMITS.username) };
}

export function startGamePayload(value: unknown) {
  if (!record(value)) throw new Error('Oyunu başlatma isteği geçersiz.');
  const payload: { roomCode: string; agentCount?: number; spyCount?: number; categories?: CategoryData[] } = { roomCode: roomCode(value.roomCode) };
  if (value.agentCount !== undefined || value.spyCount !== undefined) {
    const agentCount = integer(value.agentCount, 'Ajan sayısı', 3, LIMITS.maxPlayers - 1);
    payload.agentCount = agentCount;
    payload.spyCount = integer(value.spyCount, 'Casus sayısı', 1, agentCount - 2);
  }
  if (value.categories !== undefined) payload.categories = categories(value.categories);
  return payload;
}

export function roomPayload(value: unknown) {
  if (!record(value)) throw new Error('İstek geçersiz.');
  return { roomCode: roomCode(value.roomCode) };
}

export function votePayload(value: unknown) {
  const payload = roomPayload(value);
  if (!record(value)) throw new Error('Oy isteği geçersiz.');
  return { ...payload, targetId: text(value.targetId, 'Oy hedefi', 64) };
}

export function timerPayload(value: unknown) {
  const payload = roomPayload(value);
  if (!record(value) || !['start', 'pause', 'resume', 'reset'].includes(String(value.action))) {
    throw new Error('Sayaç işlemi geçersiz.');
  }
  return {
    ...payload,
    action: value.action as 'start' | 'pause' | 'resume' | 'reset',
    timeLeft: value.timeLeft === undefined ? undefined : integer(value.timeLeft, 'Kalan süre', 0, 86_400),
    selectedTime: value.selectedTime === undefined ? undefined : integer(value.selectedTime, 'Seçilen süre', 1, 86_400),
  };
}
