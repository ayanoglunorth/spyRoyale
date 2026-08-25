import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager, CategoryData } from './rooms.js';
import {
  LIMITS,
  createRoomPayload,
  joinRoomPayload,
  roomPayload,
  startGamePayload,
  timerPayload,
  votePayload,
} from './validation.js';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = (process.env.SERVER_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const localOrigins = ['http://localhost:8081', 'http://localhost:19006', 'http://localhost:3000'];
const trustedOrigins = new Set(isProduction ? allowedOrigins : [...localOrigins, ...allowedOrigins]);

if (isProduction && trustedOrigins.size === 0) {
  throw new Error('Production requires SERVER_ALLOWED_ORIGINS.');
}

const isAllowedOrigin = (origin?: string) => !origin || trustedOrigins.has(origin);
const corsOptions = {
  origin: (origin: string | undefined, callback: (error: Error | null, allowed?: boolean) => void) => {
    callback(null, isAllowedOrigin(origin));
  },
  methods: ['GET', 'POST'],
};

app.disable('x-powered-by');
app.use(cors(corsOptions));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions,
  maxHttpBufferSize: 100_000,
});

const roomManager = new RoomManager();
const connectionAttempts = new Map<string, number[]>();

function connectionAllowed(address: string): boolean {
  const now = Date.now();
  const timestamps = connectionAttempts.get(address) || [];
  const recent = timestamps.filter((timestamp) => now - timestamp <= LIMITS.eventWindowMs);
  if (recent.length >= 30) return false;
  recent.push(now);
  connectionAttempts.set(address, recent);
  return true;
}

app.get('/', (_req, res) => {
  res.json({ status: 'SpyRoyale server running', rooms: roomManager.getRoomCount() });
});

interface CreateRoomPayload {
  username: string;
  agentCount: number;
  spyCount: number;
  categories: CategoryData[];
}

interface JoinRoomPayload {
  roomCode: string;
  username: string;
}

interface StartGamePayload {
  roomCode: string;
  agentCount?: number;
  spyCount?: number;
  categories?: CategoryData[];
}

interface PlayerReadyPayload {
  roomCode: string;
}

interface StartVotePayload {
  roomCode: string;
}

interface CastVotePayload {
  roomCode: string;
  targetId: string;
}

interface ReturnToLobbyPayload {
  roomCode: string;
}

interface TimerActionPayload {
  roomCode: string;
  action: 'start' | 'pause' | 'resume' | 'reset';
  timeLeft?: number;
  selectedTime?: number;
}

io.on('connection', (socket) => {
  if (!connectionAllowed(socket.handshake.address)) {
    socket.emit('error', { message: 'Çok fazla bağlantı denemesi.' });
    socket.disconnect(true);
    return;
  }
  const eventTimestamps: number[] = [];
  socket.use(([event], next) => {
    const now = Date.now();
    while (eventTimestamps.length && now - eventTimestamps[0] > LIMITS.eventWindowMs) eventTimestamps.shift();
    if (eventTimestamps.length >= LIMITS.eventsPerWindow) {
      socket.emit('error', { message: 'Çok fazla istek gönderildi. Lütfen bekleyin.' });
      return next(new Error('Rate limit exceeded'));
    }
    eventTimestamps.push(now);
    next();
  });

  console.log(`Bağlantı: ${socket.id}`);

  socket.on('create_room', (payload: CreateRoomPayload) => {
    try {
      const { username, agentCount, spyCount, categories } = createRoomPayload(payload);
      const room = roomManager.createRoom(socket.id, username, {
        agentCount,
        spyCount,
        categories: categories || [],
      });

      socket.join(room.code);

      const publicPlayers = room.players.map((p) => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isReady: p.isReady,
        isEliminated: p.isEliminated,
      }));

      socket.emit('room_created', {
        roomCode: room.code,
        hostId: room.hostId,
        players: publicPlayers,
      });

      console.log(`Oda oluşturuldu: ${room.code} - ${username}`);
    } catch (err: any) {
      socket.emit('error', { message: err.message || 'Oda oluşturulamadı.' });
    }
  });

  socket.on('join_room', (payload: JoinRoomPayload) => {
    try {
      const { roomCode, username } = joinRoomPayload(payload);
      const room = roomManager.joinRoom(roomCode, socket.id, username);
      socket.join(room.code);

      const publicPlayers = room.players.map((p) => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isReady: p.isReady,
        isEliminated: p.isEliminated,
      }));

      socket.emit('room_joined', {
        roomCode: room.code,
        hostId: room.hostId,
        players: publicPlayers,
        settings: {
          agentCount: room.settings.agentCount,
          spyCount: room.settings.spyCount,
        },
      });

      socket.to(room.code).emit('player_joined', { players: publicPlayers });

      console.log(`${username} odaya katıldı: ${room.code}`);
    } catch (err: any) {
      socket.emit('error', { message: err.message || 'Odaya katılınamadı.' });
    }
  });

  socket.on('start_game', (payload: StartGamePayload) => {
    try {
      const validated = startGamePayload(payload);
      const roomCode = validated.roomCode;
      const existing = roomManager.getRoom(roomCode);
      if (existing) {
        const hostPlayer = existing.players.find((player) => player.socketId === socket.id);
        if (!hostPlayer?.isHost) throw new Error('Sadece host oyun ayarlarını değiştirebilir.');
        if (validated.categories && validated.categories.length > 0) {
          existing.settings.categories = validated.categories;
        }
        if (validated.agentCount !== undefined) {
          existing.settings.agentCount = validated.agentCount;
        }
        if (validated.spyCount !== undefined) {
          existing.settings.spyCount = validated.spyCount;
        }
      }
      roomManager.startGame(roomCode, socket.id);
      const room = roomManager.getRoom(roomCode)!;

      for (const player of room.players) {
        const playerSocket = io.sockets.sockets.get(player.socketId);
        if (playerSocket) {
          playerSocket.emit('your_role', {
            role: player.role,
            word: player.word,
            categoryName: player.categoryName,
          });
        }
      }

      const publicPlayers = room.players.map((p) => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isReady: p.isReady,
        isEliminated: p.isEliminated,
      }));

      io.to(roomCode).emit('game_started', { players: publicPlayers });
      console.log(`Oyun başladı: ${roomCode}`);
    } catch (err: any) {
      socket.emit('error', { message: err.message || 'Oyun başlatılamadı.' });
    }
  });

  socket.on('player_ready', (payload: PlayerReadyPayload) => {
    try {
      const { roomCode } = roomPayload(payload);
      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      const player = room.players.find((p) => p.socketId === socket.id);
      if (!player) return;

      roomManager.setPlayerReady(roomCode, player.id);

      io.to(roomCode).emit('player_status', {
        players: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          isHost: p.isHost,
          isReady: p.isReady,
          isEliminated: p.isEliminated,
        })),
      });

      if (roomManager.areAllPlayersReady(roomCode)) {
        roomManager.setPhase(roomCode, 'play');
        io.to(roomCode).emit('all_ready');
        console.log(`Tüm oyuncular hazır: ${roomCode}`);
      }
    } catch (err) {
      // Silently handle
    }
  });

  socket.on('start_vote', (payload: StartVotePayload) => {
    try {
      const { roomCode } = roomPayload(payload);
      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      const hostPlayer = room.players.find((p) => p.socketId === socket.id);
      if (!hostPlayer?.isHost) return;

      const { eligiblePlayers } = roomManager.startVote(roomCode, hostPlayer.id);

      io.to(roomCode).emit('vote_started', {
        eligiblePlayers: eligiblePlayers.map((p) => ({ id: p.id, name: p.name })),
      });

      console.log(`Oylama başladı: ${roomCode}`);
    } catch (err: any) {
      socket.emit('error', { message: err.message || 'Oylama başlatılamadı.' });
    }
  });

  socket.on('cast_vote', (payload: CastVotePayload) => {
    try {
      const { roomCode, targetId } = votePayload(payload);
      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      const voter = room.players.find((p) => p.socketId === socket.id);
      if (!voter) return;

      const result = roomManager.castVote(roomCode, voter.id, targetId);

      io.to(roomCode).emit('vote_update', {
        count: result.voteCount,
        total: result.totalVoters,
      });

      if (result.allVoted && result.result) {
        io.to(roomCode).emit('vote_result', result.result);
        console.log(`Oylama sonucu: ${roomCode} - ${result.result.eliminatedPlayer.name} elendi`);
      }
    } catch (err: any) {
      socket.emit('error', { message: err.message || 'Oy kullanılamadı.' });
    }
  });

  socket.on('return_to_lobby', (payload: ReturnToLobbyPayload) => {
    try {
      const { roomCode } = roomPayload(payload);
      const room = roomManager.getRoom(roomCode);
      if (!room) return;
      if (room.phase === 'lobby') return;
      if (!room.players.some((player) => player.socketId === socket.id)) return;

      roomManager.resetToLobby(roomCode);

      io.to(roomCode).emit('returned_to_lobby', {
        players: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          isHost: p.isHost,
          isReady: p.isReady,
          isEliminated: p.isEliminated,
        })),
        settings: {
          agentCount: room.settings.agentCount,
          spyCount: room.settings.spyCount,
        },
      });

      console.log(`Lobiye dönüldü: ${roomCode}`);
    } catch (err: any) {
      socket.emit('error', { message: err.message || 'Lobiye dönülemedi.' });
    }
  });

  socket.on('timer_action', (payload: TimerActionPayload) => {
    try {
      const { roomCode, action, timeLeft, selectedTime } = timerPayload(payload);
      const room = roomManager.getRoom(roomCode);
      if (!room) return;
      const player = room.players.find((p) => p.socketId === socket.id);
      if (!player?.isHost) return;

      io.to(roomCode).emit('timer_sync', {
        action,
        timeLeft,
        selectedTime,
      });
    } catch {
      // Silently handle
    }
  });

  socket.on('disconnect', () => {
    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player) return;

    roomManager.leaveRoom(room.code, player.id);
    socket.to(room.code).emit('player_left', {
      playerId: player.id,
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isReady: p.isReady,
        isEliminated: p.isEliminated,
      })),
      newHostId: room.hostId,
    });

    if (room.phase === 'lobby' && room.players.length === 0) {
      roomManager.deleteRoom(room.code);
    }

    console.log(`Oyuncu ayrıldı: ${player.name} - ${room.code}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🎮 SpyRoyale sunucusu port ${PORT}'de çalışıyor`);
});

export { roomManager };
