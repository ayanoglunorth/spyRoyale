import crypto from 'crypto';

type Role = 'agent' | 'spy';

export interface CategoryData {
  id: string;
  name: string;
  words: string[];
}

const DEFAULT_CATEGORIES: CategoryData[] = [
  {
    id: 'default-meyve',
    name: 'Meyveler',
    words: ['Elma', 'Armut', 'Muz', 'Çilek', 'Karpuz', 'Üzüm', 'Portakal', 'Kiraz', 'Şeftali', 'Ananas', 'Kivi', 'Mandalina', 'Nar', 'Ayva', 'Erik', 'Kayısı', 'İncir', 'Dut', 'Ahududu', 'Yaban Mersini'],
  },
  {
    id: 'default-hayvan',
    name: 'Hayvanlar',
    words: ['Köpek', 'Kedi', 'Aslan', 'Fil', 'Kaplan', 'Zürafa', 'Tavşan', 'Kurt', 'Ayı', 'Maymun', 'Yılan', 'Kartal', 'Baykuş', 'Yunus', 'Balina', 'Penguen', 'Deve', 'At', 'İnek', 'Koyun'],
  },
  {
    id: 'default-ulke',
    name: 'Ülkeler',
    words: ['Türkiye', 'Almanya', 'Fransa', 'İtalya', 'İspanya', 'Japonya', 'Brezilya', 'Mısır', 'Avustralya', 'Kanada', 'İngiltere', 'Rusya', 'Çin', 'Hindistan', 'Meksika', 'Arjantin', 'İsveç', 'Norveç', 'Yunanistan', 'Hollanda'],
  },
  {
    id: 'default-meslek',
    name: 'Meslekler',
    words: ['Doktor', 'Öğretmen', 'Mühendis', 'Aşçı', 'Polis', 'İtfaiyeci', 'Pilot', 'Dalgıç', 'Astronot', 'Hakem', 'Mimar', 'Avukat', 'Eczacı', 'Dişçi', 'Veteriner', 'Psikolog', 'Şoför', 'Çiftçi', 'Ressam', 'Yazar'],
  },
];

export interface PlayerData {
  id: string;
  socketId: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isEliminated: boolean;
  role?: Role;
  word?: string;
  categoryName?: string;
}

export interface RoomSettings {
  agentCount: number;
  spyCount: number;
  categories: CategoryData[];
}

export type GamePhase = 'lobby' | 'reveal' | 'play' | 'vote' | 'result' | 'finished';

export interface Room {
  code: string;
  hostId: string;
  players: PlayerData[];
  settings: RoomSettings;
  phase: GamePhase;
  selectedCategory: CategoryData | null;
  agentWord: string;
  spyWord: string;
  votes: Map<string, string>;
  voteTimer: ReturnType<typeof setTimeout> | null;
  roundCount: number;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function selectTwoDifferentWords(words: string[]): { word1: string; word2: string } {
  if (words.length < 2) {
    throw new Error('Seçilen kategoride yeterli kelime yok (en az 2).');
  }
  const firstIndex = Math.floor(Math.random() * words.length);
  const word1 = words[firstIndex];
  let word2: string;
  do {
    const secondIndex = Math.floor(Math.random() * words.length);
    word2 = words[secondIndex];
  } while (word1 === word2);
  return { word1, word2 };
}

export class RoomManager {
  private rooms = new Map<string, Room>();

  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  createRoom(socketId: string, username: string, settings: RoomSettings): Room {
    if (!settings.categories || settings.categories.length === 0) {
      settings.categories = DEFAULT_CATEGORIES;
    }
    let code: string;
    do {
      code = this.generateCode();
    } while (this.rooms.has(code));

    const player: PlayerData = {
      id: crypto.randomUUID(),
      socketId,
      name: username,
      isHost: true,
      isReady: false,
      isEliminated: false,
    };

    const room: Room = {
      code,
      hostId: player.id,
      players: [player],
      settings,
      phase: 'lobby',
      selectedCategory: null,
      agentWord: '',
      spyWord: '',
      votes: new Map(),
      voteTimer: null,
      roundCount: 0,
    };

    this.rooms.set(code, room);
    return room;
  }

  joinRoom(roomCode: string, socketId: string, username: string): Room {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) {
      throw new Error('Oda bulunamadı. Kodu kontrol edin.');
    }
    if (room.phase !== 'lobby') {
      throw new Error('Oyun zaten başlamış, bu odaya katılamazsınız.');
    }

    const player: PlayerData = {
      id: crypto.randomUUID(),
      socketId,
      name: username,
      isHost: false,
      isReady: false,
      isEliminated: false,
    };

    room.players.push(player);
    return room;
  }

  leaveRoom(roomCode: string, playerId: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    room.players = room.players.filter((p) => p.id !== playerId);

    if (room.players.length === 0) {
      this.rooms.delete(roomCode);
      return;
    }

    if (room.hostId === playerId) {
      const newHost = room.players[0];
      newHost.isHost = true;
      room.hostId = newHost.id;
    }
  }

  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode);
  }

  getRoomBySocketId(socketId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.some((p) => p.socketId === socketId)) {
        return room;
      }
    }
    return undefined;
  }

  startGame(roomCode: string, hostSocketId: string): {
    players: PlayerData[];
  } {
    const room = this.rooms.get(roomCode);
    if (!room) throw new Error('Oda bulunamadı.');
    if (room.phase !== 'lobby') throw new Error('Oyun zaten başlamış.');

    const host = room.players.find((p) => p.socketId === hostSocketId);
    if (!host?.isHost) throw new Error('Sadece host oyunu başlatabilir.');

    const { agentCount, spyCount, categories } = room.settings;
    const totalPlayers = agentCount + spyCount;

    if (room.players.length < totalPlayers) {
      throw new Error(`Yeterli oyuncu yok. Beklenen: ${totalPlayers}, Mevcut: ${room.players.length}`);
    }
    if (room.players.length < 4) {
      throw new Error('Minimum 4 oyuncu gereklidir.');
    }
    if (!categories || categories.length === 0) {
      room.settings.categories = [...DEFAULT_CATEGORIES];
    }
    const cats = room.settings.categories;
    const randomCatIndex = Math.floor(Math.random() * cats.length);
    const selectedCategory = cats[randomCatIndex];

    const { word1, word2 } = selectTwoDifferentWords(selectedCategory.words);
    const agentWord = Math.random() < 0.5 ? word1 : word2;
    const spyWord = agentWord === word1 ? word2 : word1;

    const shuffledPlayers = shuffleArray(room.players);
    const roles: Role[] = [];
    for (let i = 0; i < agentCount; i++) roles.push('agent');
    for (let i = 0; i < spyCount; i++) roles.push('spy');
    const shuffledRoles = shuffleArray(roles);

    shuffledPlayers.forEach((player, index) => {
      const role = shuffledRoles[index];
      player.role = role;
      player.word = role === 'agent' ? agentWord : spyWord;
      player.categoryName = selectedCategory.name;
      player.isReady = false;
      player.isEliminated = false;
    });

    room.selectedCategory = selectedCategory;
    room.agentWord = agentWord;
    room.spyWord = spyWord;
    room.phase = 'reveal';
    room.votes = new Map();

    return { players: room.players };
  }

  setPlayerReady(roomCode: string, playerId: string): PlayerData[] {
    const room = this.rooms.get(roomCode);
    if (!room) throw new Error('Oda bulunamadı.');

    const player = room.players.find((p) => p.id === playerId);
    if (!player) throw new Error('Oyuncu bulunamadı.');

    player.isReady = true;
    return room.players;
  }

  areAllPlayersReady(roomCode: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room) return false;
    return room.players.every((p) => p.isReady);
  }

  startVote(roomCode: string, hostPlayerId: string): {
    eligiblePlayers: PlayerData[];
  } {
    const room = this.rooms.get(roomCode);
    if (!room) throw new Error('Oda bulunamadı.');
    if (room.hostId !== hostPlayerId) throw new Error('Sadece host oylama başlatabilir.');
    if (room.phase !== 'play') throw new Error('Oyun aşamasında değil.');

    room.phase = 'vote';
    room.votes = new Map();

    const eligiblePlayers = room.players.filter((p) => !p.isEliminated);
    return { eligiblePlayers };
  }

  castVote(roomCode: string, voterId: string, targetId: string): {
    voteCount: number;
    totalVoters: number;
    allVoted: boolean;
    result?: VoteResultData;
  } {
    const room = this.rooms.get(roomCode);
    if (!room) throw new Error('Oda bulunamadı.');
    if (room.phase !== 'vote') throw new Error('Oylama aşamasında değil.');

    const voter = room.players.find((p) => p.id === voterId);
    if (!voter || voter.isEliminated) throw new Error('Oy kullanamazsınız.');

    const target = room.players.find((p) => p.id === targetId);
    if (!target || target.isEliminated) throw new Error('Geçersiz hedef.');

    if (voter.id === target.id) throw new Error('Kendinize oy veremezsiniz.');

    room.votes.set(voterId, targetId);

    const eligibleVoters = room.players.filter((p) => !p.isEliminated);
    const voteCount = room.votes.size;
    const allVoted = voteCount >= eligibleVoters.length;

    if (allVoted) {
      const result = this.tallyVotes(room);
      return { voteCount, totalVoters: eligibleVoters.length, allVoted, result };
    }

    return { voteCount, totalVoters: eligibleVoters.length, allVoted: false };
  }

  private tallyVotes(room: Room): VoteResultData {
    const tally = new Map<string, number>();
    for (const targetId of room.votes.values()) {
      tally.set(targetId, (tally.get(targetId) || 0) + 1);
    }

    let maxVotes = 0;
    const topCandidates: string[] = [];
    for (const [targetId, count] of tally) {
      if (count > maxVotes) {
        maxVotes = count;
        topCandidates.length = 0;
        topCandidates.push(targetId);
      } else if (count === maxVotes) {
        topCandidates.push(targetId);
      }
    }

    const eliminatedId = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    const eliminatedPlayer = room.players.find((p) => p.id === eliminatedId)!;

    eliminatedPlayer.isEliminated = true;

    const isSpy = eliminatedPlayer.role === 'spy';
    let gameOver = false;
    let winner: 'agents' | 'spies' | null = null;

    if (!isSpy) {
      gameOver = true;
      winner = 'spies';
    } else {
      const remainingSpies = room.players.filter((p) => !p.isEliminated && p.role === 'spy').length;
      if (remainingSpies === 0) {
        gameOver = true;
        winner = 'agents';
      }
    }

    const result: VoteResultData = {
      eliminatedPlayer: { id: eliminatedPlayer.id, name: eliminatedPlayer.name },
      role: eliminatedPlayer.role!,
      gameOver,
      winner,
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        isEliminated: p.isEliminated,
        isHost: p.isHost,
        role: gameOver ? p.role : undefined,
      })),
    };

    if (gameOver) {
      room.phase = 'finished';
    } else {
      room.phase = 'result';
      room.voteTimer = setTimeout(() => {
        if (room.phase === 'result') {
          room.phase = 'play';
          room.votes = new Map();
        }
      }, 5000);
    }

    return result;
  }

  setPhase(roomCode: string, phase: GamePhase): void {
    const room = this.rooms.get(roomCode);
    if (room) room.phase = phase;
  }

  resetToLobby(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) throw new Error('Oda bulunamadı.');

    if (room.voteTimer) {
      clearTimeout(room.voteTimer);
      room.voteTimer = null;
    }

    for (const player of room.players) {
      player.role = undefined;
      player.word = undefined;
      player.categoryName = undefined;
      player.isReady = false;
      player.isEliminated = false;
    }

    room.phase = 'lobby';
    room.selectedCategory = null;
    room.agentWord = '';
    room.spyWord = '';
    room.votes = new Map();
    room.roundCount = 0;
  }

  deleteRoom(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (room?.voteTimer) clearTimeout(room.voteTimer);
    this.rooms.delete(roomCode);
  }

  getRoomCount(): number {
    return this.rooms.size;
  }
}

export interface VoteResultData {
  eliminatedPlayer: { id: string; name: string };
  role: Role;
  gameOver: boolean;
  winner: 'agents' | 'spies' | null;
  players: Array<{
    id: string;
    name: string;
    isEliminated: boolean;
    role?: Role;
  }>;
}
