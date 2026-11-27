import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocket, WebSocketServer } from 'ws';
import {
  sanitizeQuestionForClient,
  selectQuestionsForMatch,
} from './src/shared/questionBank.ts';
import type {
  MultiplayerPlaylist,
  MultiplayerRoomSnapshot,
  RoomChatMessage,
  RoomPlayerState,
  RoomSettings,
  RoomState,
  TriviaQuestion,
} from './src/types/game.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

interface InternalPlayer extends RoomPlayerState {
  ws: WebSocket | null;
  lastChatAt: number;
}

interface InternalRoom {
  code: string;
  playlist: MultiplayerPlaylist;
  state: RoomState;
  hostPlayerId: string;
  settings: RoomSettings;
  players: Map<string, InternalPlayer>;
  questions: TriviaQuestion[];
  usedQuestionIds: string[];
  currentRound: number; // 0-indexed while active
  phaseEndsAt: number | null;
  roundStartedAt: number;
  roundAnswers: Map<string, { optionIndex: number; submittedAt: number; pointsEarned: number; correct: boolean }>;
  roundWinnerName: string | null;
  chat: RoomChatMessage[];
  phaseTimer: NodeJS.Timeout | null;
  lastActivityAt: number;
}

const rooms = new Map<string, InternalRoom>();
const socketToMember = new Map<WebSocket, { roomCode: string; playerId: string }>();

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRoomCode(): string {
  for (let attempt = 0; attempt < 25; attempt++) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    if (!rooms.has(code)) return code;
  }
  return `S${Date.now().toString(36).slice(-5).toUpperCase()}`;
}

function sanitizeText(input: unknown, maxLen: number, fallback = ''): string {
  if (typeof input !== 'string') return fallback;
  const cleaned = input.replace(/[\u0000-\u001F\u007F]/g, '').trim();
  return cleaned.slice(0, maxLen) || fallback;
}

function clampInt(val: unknown, min: number, max: number, fallback: number): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function normalizeSettings(partial?: Partial<RoomSettings>): RoomSettings {
  const validTypes = [
    'guess_the_game',
    'true_false',
    'guess_the_logo',
    'guess_the_sound',
    'who_am_i',
    'speed_round',
  ] as const;

  const selectedTypes = Array.isArray(partial?.selectedQuestionTypes)
    ? partial!.selectedQuestionTypes.filter((t): t is (typeof validTypes)[number] =>
        (validTypes as readonly string[]).includes(t)
      )
    : [...validTypes];

  const selectedCatIds = Array.isArray(partial?.selectedCategoryIds)
    ? partial!.selectedCategoryIds.filter((c) => typeof c === 'string').slice(0, 22)
    : [];

  const selectedTopics = Array.isArray(partial?.selectedTopics)
    ? partial!.selectedTopics.filter((t) => typeof t === 'string').slice(0, 20)
    : [];

  const diff = partial?.difficulty;
  const validDiff =
    diff === 'easy' || diff === 'medium' || diff === 'hard' || diff === 'expert' || diff === 'mixed'
      ? diff
      : 'mixed';

  return {
    allCategoriesSelected:
      typeof partial?.allCategoriesSelected === 'boolean'
        ? partial.allCategoriesSelected
        : selectedCatIds.length === 0,
    selectedCategoryIds: selectedCatIds,
    selectedTopics,
    selectedQuestionTypes: selectedTypes.length > 0 ? selectedTypes : [...validTypes],
    difficulty: validDiff,
    rounds: clampInt(partial?.rounds, 3, 20, 8),
    timeLimitSec: clampInt(partial?.timeLimitSec, 10, 45, 20),
    locked: Boolean(partial?.locked),
    maxPlayers: clampInt(partial?.maxPlayers, 2, 16, 10),
  };
}

function buildSnapshot(room: InternalRoom): MultiplayerRoomSnapshot {
  const activeQ =
    room.state === 'IN_PROGRESS' || room.state === 'ROUND_RESULTS'
      ? room.questions[room.currentRound] ?? null
      : null;

  const reveal =
    room.state === 'ROUND_RESULTS' && activeQ
      ? {
          correctIndex: activeQ.correctIndex,
          explanation: activeQ.explanation,
          roundWinnerName: room.roundWinnerName,
        }
      : null;

  return {
    code: room.code,
    playlist: room.playlist,
    state: room.state,
    hostPlayerId: room.hostPlayerId,
    settings: room.settings,
    players: Array.from(room.players.values()).map((p) => ({
      playerId: p.playerId,
      uid: p.uid,
      name: p.name,
      avatarId: p.avatarId,
      score: p.score,
      streak: p.streak,
      ready: p.ready,
      isHost: p.isHost,
      connected: p.connected,
      hasAnsweredCurrent: p.hasAnsweredCurrent,
      lastPointsEarned: p.lastPointsEarned,
      lastAnswerCorrect: p.lastAnswerCorrect,
    })),
    currentRound: room.state === 'WAITING' || room.state === 'STARTING' ? 0 : room.currentRound + 1,
    totalRounds: room.questions.length || room.settings.rounds,
    phaseEndsAt: room.phaseEndsAt,
    serverTime: Date.now(),
    currentQuestion: activeQ ? sanitizeQuestionForClient(activeQ) : null,
    roundReveal: reveal,
    chat: room.chat.slice(-30),
  };
}

function sendJson(ws: WebSocket | null, payload: unknown) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify(payload));
}

function broadcastRoom(room: InternalRoom) {
  const snapshot = buildSnapshot(room);
  const msg = JSON.stringify({ type: 'room:state', room: snapshot });
  for (const player of room.players.values()) {
    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(msg);
    }
  }
}

function addSystemChat(room: InternalRoom, text: string) {
  room.chat.push({
    id: `sys_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    senderId: 'system',
    senderName: 'QuizTime',
    text,
    kind: 'system',
    createdAt: Date.now(),
  });
  if (room.chat.length > 50) {
    room.chat = room.chat.slice(-40);
  }
}

function clearPhaseTimer(room: InternalRoom) {
  if (room.phaseTimer) {
    clearTimeout(room.phaseTimer);
    room.phaseTimer = null;
  }
}

function startMatchLifecycle(room: InternalRoom) {
  clearPhaseTimer(room);
  room.lastActivityAt = Date.now();

  const picked = selectQuestionsForMatch({
    allCategoriesSelected: room.settings.allCategoriesSelected,
    selectedCategoryIds: room.settings.selectedCategoryIds,
    selectedTopics: room.settings.selectedTopics,
    selectedQuestionTypes: room.settings.selectedQuestionTypes,
    difficulty: room.settings.difficulty,
    count: room.settings.rounds,
    excludeIds: room.usedQuestionIds,
  });

  room.questions = picked;
  room.usedQuestionIds = [...room.usedQuestionIds, ...picked.map((q) => q.id)].slice(-80);
  room.currentRound = 0;
  room.roundAnswers.clear();
  room.roundWinnerName = null;

  for (const p of room.players.values()) {
    p.score = 0;
    p.streak = 0;
    p.hasAnsweredCurrent = false;
    p.lastPointsEarned = 0;
    p.lastAnswerCorrect = null;
  }

  room.state = 'STARTING';
  room.phaseEndsAt = Date.now() + 3000;
  broadcastRoom(room);

  room.phaseTimer = setTimeout(() => {
    beginRound(room);
  }, 3000);
}

function beginRound(room: InternalRoom) {
  clearPhaseTimer(room);
  if (!rooms.has(room.code) || room.players.size === 0) return;

  if (room.currentRound >= room.questions.length) {
    finishMatch(room);
    return;
  }

  room.state = 'IN_PROGRESS';
  room.roundAnswers.clear();
  room.roundWinnerName = null;
  const durationMs = room.settings.timeLimitSec * 1000;
  room.roundStartedAt = Date.now();
  room.phaseEndsAt = room.roundStartedAt + durationMs;

  for (const p of room.players.values()) {
    p.hasAnsweredCurrent = false;
    p.lastPointsEarned = 0;
    p.lastAnswerCorrect = null;
  }

  broadcastRoom(room);

  room.phaseTimer = setTimeout(() => {
    revealRoundResults(room);
  }, durationMs);
}

function revealRoundResults(room: InternalRoom) {
  clearPhaseTimer(room);
  if (!rooms.has(room.code) || room.state !== 'IN_PROGRESS') return;

  // Players who didn't answer lose streak
  for (const p of room.players.values()) {
    if (!p.hasAnsweredCurrent) {
      p.streak = 0;
      p.lastPointsEarned = 0;
      p.lastAnswerCorrect = false;
    }
  }

  // Determine fastest/highest scorer in this round
  let bestPoints = 0;
  let winnerName: string | null = null;
  for (const [playerId, ans] of room.roundAnswers.entries()) {
    if (ans.correct && ans.pointsEarned > bestPoints) {
      bestPoints = ans.pointsEarned;
      winnerName = room.players.get(playerId)?.name ?? null;
    }
  }

  room.roundWinnerName = winnerName;
  room.state = 'ROUND_RESULTS';
  room.phaseEndsAt = Date.now() + 4500;
  broadcastRoom(room);

  room.phaseTimer = setTimeout(() => {
    room.currentRound += 1;
    if (room.currentRound >= room.questions.length) {
      finishMatch(room);
    } else {
      beginRound(room);
    }
  }, 4500);
}

function finishMatch(room: InternalRoom) {
  clearPhaseTimer(room);
  room.state = 'FINISHED';
  room.phaseEndsAt = null;
  for (const p of room.players.values()) {
    p.ready = p.isHost;
  }
  broadcastRoom(room);
}

function removePlayerFromRoom(room: InternalRoom, playerId: string, reason?: string) {
  const removed = room.players.get(playerId);
  if (!removed) return;
  room.players.delete(playerId);

  if (room.players.size === 0) {
    clearPhaseTimer(room);
    rooms.delete(room.code);
    return;
  }

  if (removed.isHost) {
    const nextHost =
      Array.from(room.players.values()).find((p) => p.connected) ||
      Array.from(room.players.values())[0];
    if (nextHost) {
      nextHost.isHost = true;
      nextHost.ready = true;
      room.hostPlayerId = nextHost.playerId;
      addSystemChat(room, `${nextHost.name} is now host`);
    }
  }

  if (reason) {
    addSystemChat(room, `${removed.name} ${reason}`);
  }
  broadcastRoom(room);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'QuizTime', realtimeWs: true, activeRooms: rooms.size });
  });

  app.get('/api/rooms/:code', (req, res) => {
    const code = sanitizeText(req.params.code, 10).toUpperCase();
    const room = rooms.get(code);
    if (!room) {
      res.status(404).json({ exists: false });
      return;
    }
    res.json({
      exists: true,
      code: room.code,
      state: room.state,
      locked: room.settings.locked,
      playerCount: room.players.size,
      maxPlayers: room.settings.maxPlayers,
      playlist: room.playlist,
    });
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    ws.on('message', (raw) => {
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(raw.toString()) as Record<string, unknown>;
      } catch {
        sendJson(ws, { type: 'error', message: 'Invalid JSON payload' });
        return;
      }

      const type = data.type;
      const now = Date.now();

      if (type === 'room:create' || type === 'room:matchmake') {
        const playerId = sanitizeText(data.playerId, 64) || `p_${Math.random().toString(36).slice(2, 10)}`;
        const name = sanitizeText(data.name, 30, 'Player');
        const avatarId = sanitizeText(data.avatarId, 40, 'prism_violet');
        const uid = typeof data.uid === 'string' ? sanitizeText(data.uid, 128) : undefined;
        const playlist: MultiplayerPlaylist =
          data.playlist === 'quick' || data.playlist === 'competitive' || data.playlist === 'casual'
            ? data.playlist
            : 'private';

        // Detach from any previous room
        const prev = socketToMember.get(ws);
        if (prev) {
          const prevRoom = rooms.get(prev.roomCode);
          if (prevRoom) removePlayerFromRoom(prevRoom, prev.playerId);
          socketToMember.delete(ws);
        }

        // For matchmaking, look for open WAITING room in same playlist
        if (type === 'room:matchmake') {
          const openRoom = Array.from(rooms.values()).find(
            (r) =>
              r.playlist === playlist &&
              r.state === 'WAITING' &&
              !r.settings.locked &&
              r.players.size < r.settings.maxPlayers
          );
          if (openRoom) {
            const member: InternalPlayer = {
              playerId,
              uid,
              name,
              avatarId,
              score: 0,
              streak: 0,
              ready: true,
              isHost: false,
              connected: true,
              hasAnsweredCurrent: false,
              lastPointsEarned: 0,
              lastAnswerCorrect: null,
              ws,
              lastChatAt: 0,
            };
            openRoom.players.set(playerId, member);
            openRoom.lastActivityAt = now;
            socketToMember.set(ws, { roomCode: openRoom.code, playerId });
            addSystemChat(openRoom, `${name} joined`);
            sendJson(ws, { type: 'room:joined', playerId, room: buildSnapshot(openRoom) });
            broadcastRoom(openRoom);
            return;
          }
        }

        const code = generateRoomCode();
        const settings = normalizeSettings(data.settings as Partial<RoomSettings> | undefined);
        const room: InternalRoom = {
          code,
          playlist,
          state: 'WAITING',
          hostPlayerId: playerId,
          settings,
          players: new Map(),
          questions: [],
          usedQuestionIds: [],
          currentRound: 0,
          phaseEndsAt: null,
          roundStartedAt: 0,
          roundAnswers: new Map(),
          roundWinnerName: null,
          chat: [],
          phaseTimer: null,
          lastActivityAt: now,
        };

        room.players.set(playerId, {
          playerId,
          uid,
          name,
          avatarId,
          score: 0,
          streak: 0,
          ready: true,
          isHost: true,
          connected: true,
          hasAnsweredCurrent: false,
          lastPointsEarned: 0,
          lastAnswerCorrect: null,
          ws,
          lastChatAt: 0,
        });

        rooms.set(code, room);
        socketToMember.set(ws, { roomCode: code, playerId });
        sendJson(ws, { type: 'room:joined', playerId, room: buildSnapshot(room) });
        return;
      }

      if (type === 'room:join') {
        const code = sanitizeText(data.code, 10).toUpperCase();
        const playerId = sanitizeText(data.playerId, 64) || `p_${Math.random().toString(36).slice(2, 10)}`;
        const name = sanitizeText(data.name, 30, 'Player');
        const avatarId = sanitizeText(data.avatarId, 40, 'prism_violet');
        const uid = typeof data.uid === 'string' ? sanitizeText(data.uid, 128) : undefined;

        const room = rooms.get(code);
        if (!room) {
          sendJson(ws, { type: 'error', code: 'ROOM_NOT_FOUND', message: 'Room not found' });
          return;
        }

        const existingPlayer = room.players.get(playerId);
        if (existingPlayer) {
          existingPlayer.ws = ws;
          existingPlayer.connected = true;
          existingPlayer.name = name;
          existingPlayer.avatarId = avatarId;
          socketToMember.set(ws, { roomCode: code, playerId });
          sendJson(ws, { type: 'room:joined', playerId, room: buildSnapshot(room) });
          broadcastRoom(room);
          return;
        }

        if (room.settings.locked) {
          sendJson(ws, { type: 'error', code: 'ROOM_LOCKED', message: 'Room is locked by host' });
          return;
        }

        if (room.players.size >= room.settings.maxPlayers) {
          sendJson(ws, { type: 'error', code: 'ROOM_FULL', message: 'Room is full' });
          return;
        }

        if (room.state !== 'WAITING' && room.state !== 'FINISHED') {
          sendJson(ws, {
            type: 'error',
            code: 'MATCH_IN_PROGRESS',
            message: 'Match already in progress',
          });
          return;
        }

        room.players.set(playerId, {
          playerId,
          uid,
          name,
          avatarId,
          score: 0,
          streak: 0,
          ready: false,
          isHost: false,
          connected: true,
          hasAnsweredCurrent: false,
          lastPointsEarned: 0,
          lastAnswerCorrect: null,
          ws,
          lastChatAt: 0,
        });
        room.lastActivityAt = now;
        socketToMember.set(ws, { roomCode: code, playerId });
        addSystemChat(room, `${name} joined`);
        sendJson(ws, { type: 'room:joined', playerId, room: buildSnapshot(room) });
        broadcastRoom(room);
        return;
      }

      // All following actions require membership in a room
      const membership = socketToMember.get(ws);
      if (!membership) {
        sendJson(ws, { type: 'error', message: 'Not in a room' });
        return;
      }
      const room = rooms.get(membership.roomCode);
      if (!room) return;
      const player = room.players.get(membership.playerId);
      if (!player) return;
      room.lastActivityAt = now;

      if (type === 'room:leave') {
        socketToMember.delete(ws);
        removePlayerFromRoom(room, player.playerId, 'left');
        return;
      }

      if (type === 'room:ready') {
        if (room.state !== 'WAITING' && room.state !== 'FINISHED') return;
        player.ready = !player.ready;
        broadcastRoom(room);
        return;
      }

      if (type === 'room:update_settings') {
        if (!player.isHost) return;
        if (room.state !== 'WAITING' && room.state !== 'FINISHED') return;
        room.settings = normalizeSettings({
          ...room.settings,
          ...(data.settings as Partial<RoomSettings>),
        });
        broadcastRoom(room);
        return;
      }

      if (type === 'room:kick') {
        if (!player.isHost) return;
        const targetId = sanitizeText(data.targetPlayerId, 64);
        if (!targetId || targetId === player.playerId) return;
        const target = room.players.get(targetId);
        if (target?.ws) {
          sendJson(target.ws, { type: 'room:kicked' });
          socketToMember.delete(target.ws);
        }
        removePlayerFromRoom(room, targetId, 'was removed');
        return;
      }

      if (type === 'room:start' || type === 'room:rematch') {
        if (!player.isHost) return;
        if (room.state === 'IN_PROGRESS' || room.state === 'STARTING' || room.state === 'ROUND_RESULTS') {
          return;
        }
        startMatchLifecycle(room);
        return;
      }

      if (type === 'room:end') {
        if (!player.isHost) return;
        finishMatch(room);
        return;
      }

      if (type === 'room:answer') {
        if (room.state !== 'IN_PROGRESS') return;
        if (room.phaseEndsAt !== null && now > room.phaseEndsAt + 400) return;
        if (player.hasAnsweredCurrent || room.roundAnswers.has(player.playerId)) return;

        const q = room.questions[room.currentRound];
        if (!q) return;

        const optionIndex = Number(data.optionIndex);
        if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= q.options.length) {
          return;
        }

        const isCorrect = optionIndex === q.correctIndex;
        let pointsEarned = 0;

        if (isCorrect) {
          const totalDurationMs = Math.max(1000, room.settings.timeLimitSec * 1000);
          const elapsedMs = Math.max(0, now - room.roundStartedAt);
          const remainingRatio = Math.max(0, Math.min(1, 1 - elapsedMs / totalDurationMs));
          const speedBonus = Math.round(q.points * 0.5 * remainingRatio);
          player.streak += 1;
          const streakBonus = Math.min(100, (player.streak - 1) * 20);
          pointsEarned = q.points + speedBonus + streakBonus;
          player.score += pointsEarned;
        } else {
          player.streak = 0;
        }

        player.hasAnsweredCurrent = true;
        player.lastPointsEarned = pointsEarned;
        player.lastAnswerCorrect = isCorrect;
        room.roundAnswers.set(player.playerId, {
          optionIndex,
          submittedAt: now,
          pointsEarned,
          correct: isCorrect,
        });

        broadcastRoom(room);

        // If every connected player answered, reveal early
        const connectedPlayers = Array.from(room.players.values()).filter((p) => p.connected);
        if (connectedPlayers.length > 0 && connectedPlayers.every((p) => p.hasAnsweredCurrent)) {
          clearPhaseTimer(room);
          room.phaseTimer = setTimeout(() => {
            revealRoundResults(room);
          }, 750);
        }
        return;
      }

      if (type === 'room:chat') {
        if (now - player.lastChatAt < 750) return; // Rate limit spam
        const text = sanitizeText(data.text, 160);
        if (!text) return;
        player.lastChatAt = now;
        const kind = data.kind === 'reaction' ? 'reaction' : 'chat';
        room.chat.push({
          id: `msg_${now}_${Math.random().toString(36).slice(2, 6)}`,
          senderId: player.playerId,
          senderName: player.name,
          text,
          kind,
          createdAt: now,
        });
        if (room.chat.length > 50) {
          room.chat = room.chat.slice(-40);
        }
        broadcastRoom(room);
      }
    });

    ws.on('close', () => {
      const membership = socketToMember.get(ws);
      if (!membership) return;
      socketToMember.delete(ws);

      const room = rooms.get(membership.roomCode);
      if (!room) return;
      const player = room.players.get(membership.playerId);
      if (!player) return;

      player.ws = null;
      player.connected = false;

      // In WAITING room, remove cleanly after brief grace period if still disconnected
      if (room.state === 'WAITING') {
        setTimeout(() => {
          const r = rooms.get(membership.roomCode);
          const p = r?.players.get(membership.playerId);
          if (r && p && !p.connected) {
            removePlayerFromRoom(r, p.playerId, 'disconnected');
          }
        }, 4000);
      } else {
        // Reassign host if active host dropped mid-match
        if (player.isHost) {
          const nextHost = Array.from(room.players.values()).find((p) => p.connected);
          if (nextHost) {
            player.isHost = false;
            nextHost.isHost = true;
            room.hostPlayerId = nextHost.playerId;
          }
        }
        broadcastRoom(room);
      }
    });
  });

  // Periodic stale room cleanup
  setInterval(() => {
    const cutoff = Date.now() - 30 * 60 * 1000;
    for (const [code, room] of rooms.entries()) {
      const anyConnected = Array.from(room.players.values()).some((p) => p.connected);
      if ((!anyConnected && room.lastActivityAt < Date.now() - 60_000) || room.lastActivityAt < cutoff) {
        clearPhaseTimer(room);
        rooms.delete(code);
      }
    }
  }, 60_000);

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`QuizTime server running on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
