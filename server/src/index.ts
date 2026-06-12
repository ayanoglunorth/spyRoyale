import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager, CategoryData } from './rooms.js';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const roomManager = new RoomManager();

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
  console.log(`Bağlantı: ${socket.id}`);

  socket.on('create_room', (payload: CreateRoomPayload) => {
    try {
      const { username, agentCount, spyCount, categories } = payload;

      if (!username?.trim()) {
        socket.emit('error', { message: 'Kullanıcı adı gerekli.' });
        return;
      }
      if (agentCount < 3) {
        socket.emit('error', { message: 'Minimum 3 ajan gerekli.' });
        return;
      }
      if (spyCount < 1 || spyCount > agentCount - 2) {
        socket.emit('error', { message: `Spy sayısı 1 ile ${agentCount - 2} arasında olmalı.` });
        return;
      }
      const room = roomManager.createRoom(socket.id, username.trim(), {
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
      const { roomCode, username } = payload;

      if (!roomCode?.trim()) {
        socket.emit('error', { message: 'Oda kodu gerekli.' });
        return;
      }
      if (!username?.trim()) {
        socket.emit('error', { message: 'Kullanıcı adı gerekli.' });
        return;
      }

      const room = roomManager.joinRoom(roomCode.toUpperCase(), socket.id, username.trim());
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
      const { roomCode: rawCode } = payload;
      const roomCode = rawCode.toUpperCase();
      const existing = roomManager.getRoom(roomCode);
      if (existing) {
        if (payload.categories && payload.categories.length > 0) {
          existing.settings.categories = payload.categories;
        }
        if (payload.agentCount !== undefined) {
          existing.settings.agentCount = payload.agentCount;
        }
        if (payload.spyCount !== undefined) {
          existing.settings.spyCount = payload.spyCount;
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
      const roomCode = payload.roomCode.toUpperCase();
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
      const roomCode = payload.roomCode.toUpperCase();
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
      const roomCode = payload.roomCode.toUpperCase();
      const targetId = payload.targetId;
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
      const roomCode = payload.roomCode.toUpperCase();
      const room = roomManager.getRoom(roomCode);
      if (!room) return;
      if (room.phase === 'lobby') return;

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
      const roomCode = payload.roomCode.toUpperCase();
      const room = roomManager.getRoom(roomCode);
      if (!room) return;
      const player = room.players.find((p) => p.socketId === socket.id);
      if (!player?.isHost) return;

      io.to(roomCode).emit('timer_sync', {
        action: payload.action,
        timeLeft: payload.timeLeft,
        selectedTime: payload.selectedTime,
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
