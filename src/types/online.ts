export interface LobbyPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isEliminated: boolean;
}

export interface MyRole {
  role: 'agent' | 'spy';
  word: string;
  categoryName: string;
}

export interface VoteResultData {
  eliminatedPlayer: { id: string; name: string };
  role: 'agent' | 'spy';
  gameOver: boolean;
  winner: 'agents' | 'spies' | null;
  players: Array<{
    id: string;
    name: string;
    isEliminated: boolean;
    isHost: boolean;
    role?: 'agent' | 'spy';
  }>;
}

export interface RoomCreatedPayload {
  roomCode: string;
  hostId: string;
  players: LobbyPlayer[];
}

export interface RoomJoinedPayload {
  roomCode: string;
  hostId: string;
  players: LobbyPlayer[];
  settings: { agentCount: number; spyCount: number };
}

export interface GameStartedPayload {
  players: Array<{ id: string; name: string; isHost: boolean; isReady: boolean; isEliminated: boolean }>;
}

export interface VoteStartedPayload {
  eligiblePlayers: Array<{ id: string; name: string }>;
}

export interface VoteUpdatePayload {
  count: number;
  total: number;
}

export interface CategoryData {
  id: string;
  name: string;
  words: string[];
}
