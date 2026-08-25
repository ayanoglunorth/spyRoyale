import { describe, expect, it } from 'vitest';
import { RoomManager } from './rooms.js';
import { createRoomPayload, joinRoomPayload } from './validation.js';

const categories = [{ id: 'test', name: 'Test', words: ['Bir', 'İki'] }];

describe('RoomManager', () => {
  it('rejects a room that exceeds its configured player capacity', () => {
    const manager = new RoomManager();
    const room = manager.createRoom('host', 'Host', { agentCount: 3, spyCount: 1, categories });
    manager.joinRoom(room.code, 'one', 'One');
    manager.joinRoom(room.code, 'two', 'Two');
    manager.joinRoom(room.code, 'three', 'Three');
    expect(() => manager.joinRoom(room.code, 'four', 'Four')).toThrow('Oda dolu');
  });

  it('only starts a game when the exact configured player count has joined', () => {
    const manager = new RoomManager();
    const room = manager.createRoom('host', 'Host', { agentCount: 3, spyCount: 1, categories });
    manager.joinRoom(room.code, 'one', 'One');
    manager.joinRoom(room.code, 'two', 'Two');
    expect(() => manager.startGame(room.code, 'host')).toThrow('Yeterli oyuncu yok');
  });
});

describe('network payload validation', () => {
  it('rejects oversized names and malformed room codes', () => {
    expect(() => createRoomPayload({ username: 'a'.repeat(33), agentCount: 3, spyCount: 1, categories })).toThrow('Kullanıcı adı geçersiz');
    expect(() => joinRoomPayload({ username: 'Agent', roomCode: '!!!!' })).toThrow('Oda kodu geçersiz');
  });
});
