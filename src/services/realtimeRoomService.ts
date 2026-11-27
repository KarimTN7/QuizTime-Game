import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  ALL_QUESTIONS,
  sanitizeQuestionForClient,
  selectQuestionsForMatch,
} from '../shared/questionBank';
import {
  MultiplayerPlaylist,
  MultiplayerRoomSnapshot,
  QuestionModeId,
  RoomChatMessage,
  RoomPlayerState,
  RoomSettings,
  RoomState,
} from '../types/game';
import { db, handleFirestoreError, OperationType } from './firebaseClient';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

function normalizeSettings(partial?: Partial<RoomSettings>): RoomSettings {
  const defaultTypes: QuestionModeId[] = [
    'guess_the_game',
    'true_false',
    'guess_the_logo',
    'guess_the_sound',
    'who_am_i',
    'speed_round',
  ];
  return {
    maxPlayers: Math.min(16, Math.max(2, Number(partial?.maxPlayers ?? 8))),
    rounds: Math.min(20, Math.max(3, Number(partial?.rounds ?? 8))),
    timeLimitSec: Math.min(60, Math.max(8, Number(partial?.timeLimitSec ?? 20))),
    difficulty: partial?.difficulty || 'medium',
    allCategoriesSelected: partial?.allCategoriesSelected ?? true,
    selectedCategoryIds: Array.isArray(partial?.selectedCategoryIds)
      ? partial.selectedCategoryIds.slice(0, 30)
      : [],
    selectedTopics: Array.isArray(partial?.selectedTopics)
      ? partial.selectedTopics.slice(0, 50)
      : [],
    selectedQuestionTypes:
      Array.isArray(partial?.selectedQuestionTypes) && partial.selectedQuestionTypes.length > 0
        ? partial.selectedQuestionTypes.slice(0, 10)
        : defaultTypes,
    locked: Boolean(partial?.locked ?? false),
  };
}

interface FirestoreRoomDoc {
  code: string;
  playlist: MultiplayerPlaylist;
  state: RoomState;
  hostUid: string;
  currentRound: number;
  totalRounds: number;
  phaseEndsAt: number | null;
  roundStartedAt: number;
  questionIds: string[];
  settings: RoomSettings;
  roundReveal?: {
    correctIndex: number;
    explanationAr: string;
    explanationEn: string;
    roundWinnerName: string | null;
  } | null;
}

interface FirestorePlayerDoc {
  roomCode: string;
  uid: string;
  name: string;
  avatarId: string;
  score: number;
  streak: number;
  ready: boolean;
  isHost: boolean;
  hasAnsweredCurrent: boolean;
  lastPointsEarned: number;
  lastAnswerCorrect: boolean | null;
}

interface FirestoreAnswerDoc {
  roomCode: string;
  uid: string;
  roundIndex: number;
  optionIndex: number;
  clientTimeMs: number;
}

export async function createOrMatchmakeFirestoreRoom(params: {
  uid: string;
  name: string;
  avatarId: string;
  playlist: MultiplayerPlaylist;
  settings?: Partial<RoomSettings>;
}): Promise<string> {
  const safeName = params.name.trim().slice(0, 30) || 'Player';
  const safeAvatar = params.avatarId.trim().slice(0, 40) || 'prism_violet';

  if (params.playlist !== 'private') {
    try {
      const q = query(
        collection(db, 'rooms'),
        where('playlist', '==', params.playlist),
        where('state', '==', 'WAITING'),
        limit(10)
      );
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        const roomData = d.data() as FirestoreRoomDoc;
        if (!roomData.settings.locked) {
          const playersSnap = await getDocs(
            query(collection(db, 'rooms', roomData.code, 'players'), where('roomCode', '==', roomData.code))
          );
          if (playersSnap.size < roomData.settings.maxPlayers) {
            await joinFirestoreRoom({
              code: roomData.code,
              uid: params.uid,
              name: safeName,
              avatarId: safeAvatar,
            });
            return roomData.code;
          }
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'rooms');
    }
  }

  let code = generateRoomCode();
  for (let i = 0; i < 6; i++) {
    const existing = await getDoc(doc(db, 'rooms', code));
    if (!existing.exists()) break;
    code = generateRoomCode();
  }

  const normalized = normalizeSettings(params.settings);
  const roomPath = `rooms/${code}`;
  try {
    await setDoc(doc(db, 'rooms', code), {
      code,
      playlist: params.playlist,
      state: 'WAITING',
      hostUid: params.uid,
      currentRound: 0,
      totalRounds: normalized.rounds,
      phaseEndsAt: null,
      roundStartedAt: 0,
      questionIds: [],
      settings: normalized,
      roundReveal: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, roomPath);
  }

  const playerPath = `rooms/${code}/players/${params.uid}`;
  try {
    await setDoc(doc(db, 'rooms', code, 'players', params.uid), {
      roomCode: code,
      uid: params.uid,
      name: safeName,
      avatarId: safeAvatar,
      score: 0,
      streak: 0,
      ready: true,
      isHost: true,
      hasAnsweredCurrent: false,
      lastPointsEarned: 0,
      lastAnswerCorrect: null,
      joinedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, playerPath);
  }

  return code;
}

export async function joinFirestoreRoom(params: {
  code: string;
  uid: string;
  name: string;
  avatarId: string;
}): Promise<string> {
  const code = params.code.trim().toUpperCase().slice(0, 10);
  const roomPath = `rooms/${code}`;
  let snap;
  try {
    snap = await getDoc(doc(db, 'rooms', code));
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, roomPath);
  }

  if (!snap.exists()) {
    throw new Error('ROOM_NOT_FOUND');
  }

  const roomData = snap.data() as FirestoreRoomDoc;
  const playerPath = `rooms/${code}/players/${params.uid}`;
  const existingPlayer = await getDoc(doc(db, 'rooms', code, 'players', params.uid));

  if (existingPlayer.exists()) {
    try {
      await updateDoc(doc(db, 'rooms', code, 'players', params.uid), {
        name: params.name.trim().slice(0, 30) || 'Player',
        avatarId: params.avatarId || 'prism_violet',
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, playerPath);
    }
    return code;
  }

  if (roomData.settings.locked) {
    throw new Error('ROOM_LOCKED');
  }
  if (roomData.state !== 'WAITING' && roomData.state !== 'FINISHED') {
    throw new Error('MATCH_IN_PROGRESS');
  }

  const playersSnap = await getDocs(
    query(collection(db, 'rooms', code, 'players'), where('roomCode', '==', code))
  );
  if (playersSnap.size >= roomData.settings.maxPlayers) {
    throw new Error('ROOM_FULL');
  }

  try {
    await setDoc(doc(db, 'rooms', code, 'players', params.uid), {
      roomCode: code,
      uid: params.uid,
      name: params.name.trim().slice(0, 30) || 'Player',
      avatarId: params.avatarId || 'prism_violet',
      score: 0,
      streak: 0,
      ready: false,
      isHost: roomData.hostUid === params.uid,
      hasAnsweredCurrent: false,
      lastPointsEarned: 0,
      lastAnswerCorrect: null,
      joinedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, playerPath);
  }

  await sendFirestoreChat({
    roomCode: code,
    senderId: params.uid,
    senderName: params.name.trim().slice(0, 30) || 'Player',
    text: `${params.name.trim().slice(0, 30) || 'Player'} joined`,
    kind: 'system',
  });

  return code;
}

export async function toggleFirestoreReady(roomCode: string, uid: string, nextReady: boolean): Promise<void> {
  const path = `rooms/${roomCode}/players/${uid}`;
  try {
    await updateDoc(doc(db, 'rooms', roomCode, 'players', uid), {
      ready: nextReady,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function updateFirestoreRoomSettings(
  roomCode: string,
  settings: RoomSettings
): Promise<void> {
  const path = `rooms/${roomCode}`;
  try {
    await updateDoc(doc(db, 'rooms', roomCode), {
      settings,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function kickFirestorePlayer(roomCode: string, targetUid: string): Promise<void> {
  const path = `rooms/${roomCode}/players/${targetUid}`;
  try {
    await deleteDoc(doc(db, 'rooms', roomCode, 'players', targetUid));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function leaveFirestoreRoom(
  roomCode: string,
  uid: string,
  remainingPlayers: RoomPlayerState[],
  isHost: boolean
): Promise<void> {
  const others = remainingPlayers.filter((p) => p.playerId !== uid);
  if (isHost && others.length > 0) {
    const nextHost = others[0];
    try {
      await updateDoc(doc(db, 'rooms', roomCode), {
        hostUid: nextHost.playerId,
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'rooms', roomCode, 'players', nextHost.playerId), {
        isHost: true,
        updatedAt: serverTimestamp(),
      });
    } catch {
      // Best-effort host migration
    }
  }

  try {
    await deleteDoc(doc(db, 'rooms', roomCode, 'players', uid));
    if (others.length === 0 && isHost) {
      await deleteDoc(doc(db, 'rooms', roomCode));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `rooms/${roomCode}/players/${uid}`);
  }
}

export async function startFirestoreMatch(
  roomCode: string,
  settings: RoomSettings,
  players: RoomPlayerState[]
): Promise<void> {
  const selected = selectQuestionsForMatch({
    allCategoriesSelected: settings.allCategoriesSelected,
    selectedCategoryIds: settings.selectedCategoryIds,
    selectedTopics: settings.selectedTopics,
    selectedQuestionTypes: settings.selectedQuestionTypes,
    difficulty: settings.difficulty,
    count: settings.rounds,
  });

  // Clear previous answers
  const prevAnswers = await getDocs(
    query(collection(db, 'rooms', roomCode, 'answers'), where('roomCode', '==', roomCode))
  );
  const batch = writeBatch(db);
  for (const d of prevAnswers.docs) {
    batch.delete(d.ref);
  }
  for (const p of players) {
    batch.update(doc(db, 'rooms', roomCode, 'players', p.playerId), {
      score: 0,
      streak: 0,
      hasAnsweredCurrent: false,
      lastPointsEarned: 0,
      lastAnswerCorrect: null,
      updatedAt: serverTimestamp(),
    });
  }
  batch.update(doc(db, 'rooms', roomCode), {
    state: 'STARTING',
    currentRound: 0,
    totalRounds: selected.length,
    questionIds: selected.map((q) => q.id),
    phaseEndsAt: Date.now() + 2800,
    roundStartedAt: 0,
    roundReveal: null,
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `rooms/${roomCode}`);
  }
}

export async function submitFirestoreAnswer(params: {
  roomCode: string;
  uid: string;
  roundIndex: number;
  optionIndex: number;
}): Promise<void> {
  const answerId = `${params.roundIndex}_${params.uid}`;
  const answerPath = `rooms/${params.roomCode}/answers/${answerId}`;
  try {
    await setDoc(doc(db, 'rooms', params.roomCode, 'answers', answerId), {
      roomCode: params.roomCode,
      uid: params.uid,
      roundIndex: params.roundIndex,
      optionIndex: params.optionIndex,
      clientTimeMs: Date.now(),
      submittedAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'rooms', params.roomCode, 'players', params.uid), {
      hasAnsweredCurrent: true,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, answerPath);
  }
}

export async function sendFirestoreChat(params: {
  roomCode: string;
  senderId: string;
  senderName: string;
  text: string;
  kind: 'chat' | 'reaction' | 'system';
}): Promise<void> {
  const msgId = `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const path = `rooms/${params.roomCode}/chat/${msgId}`;
  try {
    await setDoc(doc(db, 'rooms', params.roomCode, 'chat', msgId), {
      roomCode: params.roomCode,
      senderId: params.senderId,
      senderName: params.senderName.slice(0, 40),
      text: params.text.slice(0, 160),
      kind: params.kind,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export function subscribeFirestoreRoom(params: {
  roomCode: string;
  currentUid: string;
  onSnapshotUpdate: (snapshot: MultiplayerRoomSnapshot) => void;
  onKickedOrMissing: () => void;
  onError: (err: Error) => void;
}): () => void {
  const { roomCode, currentUid, onSnapshotUpdate, onKickedOrMissing, onError } = params;

  let roomDoc: FirestoreRoomDoc | null = null;
  let playerDocs: FirestorePlayerDoc[] = [];
  let answerDocs: FirestoreAnswerDoc[] = [];
  let chatMsgs: RoomChatMessage[] = [];
  let sawSelfInRoom = false;
  let lifecycleTimer: number | null = null;
  let transitioning = false;

  const clearTimer = () => {
    if (lifecycleTimer !== null) {
      window.clearTimeout(lifecycleTimer);
      lifecycleTimer = null;
    }
  };

  const emitSnapshot = () => {
    if (!roomDoc) return;
    const isActiveRound =
      roomDoc.state === 'IN_PROGRESS' || roomDoc.state === 'ROUND_RESULTS';
    const qId = isActiveRound ? roomDoc.questionIds[roomDoc.currentRound] : undefined;
    const fullQuestion = qId ? ALL_QUESTIONS.find((q) => q.id === qId) : undefined;

    const snapshot: MultiplayerRoomSnapshot = {
      code: roomDoc.code,
      playlist: roomDoc.playlist,
      state: roomDoc.state,
      hostPlayerId: roomDoc.hostUid,
      currentRound: roomDoc.state === 'WAITING' ? 0 : roomDoc.currentRound + 1,
      totalRounds: roomDoc.totalRounds,
      phaseEndsAt: roomDoc.phaseEndsAt ?? null,
      serverTime: Date.now(),
      settings: roomDoc.settings,
      players: playerDocs.map((p) => ({
        playerId: p.uid,
        uid: p.uid,
        name: p.name,
        avatarId: p.avatarId,
        score: p.score,
        streak: p.streak,
        ready: p.ready,
        isHost: p.isHost,
        connected: true,
        hasAnsweredCurrent: p.hasAnsweredCurrent,
        lastPointsEarned: p.lastPointsEarned,
        lastAnswerCorrect: p.lastAnswerCorrect,
      })),
      currentQuestion: fullQuestion ? sanitizeQuestionForClient(fullQuestion) : null,
      roundReveal: roomDoc.roundReveal
        ? {
            correctIndex: roomDoc.roundReveal.correctIndex,
            explanation: {
              ar: roomDoc.roundReveal.explanationAr,
              en: roomDoc.roundReveal.explanationEn,
            },
            roundWinnerName: roomDoc.roundReveal.roundWinnerName ?? null,
          }
        : null,
      chat: chatMsgs,
    };

    onSnapshotUpdate(snapshot);
  };

  const advanceRoundToInProgress = async (nextRoundIdx: number) => {
    if (!roomDoc || transitioning) return;
    transitioning = true;
    try {
      const now = Date.now();
      const batch = writeBatch(db);
      for (const p of playerDocs) {
        batch.update(doc(db, 'rooms', roomCode, 'players', p.uid), {
          hasAnsweredCurrent: false,
          lastPointsEarned: 0,
          lastAnswerCorrect: null,
          updatedAt: serverTimestamp(),
        });
      }
      batch.update(doc(db, 'rooms', roomCode), {
        state: 'IN_PROGRESS',
        currentRound: nextRoundIdx,
        roundStartedAt: now,
        phaseEndsAt: now + roomDoc.settings.timeLimitSec * 1000,
        roundReveal: null,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
    } catch (err) {
      console.error('Host advanceRound failed:', err);
    } finally {
      transitioning = false;
    }
  };

  const revealRoundResults = async () => {
    if (!roomDoc || transitioning || roomDoc.state !== 'IN_PROGRESS') return;
    transitioning = true;
    try {
      const qId = roomDoc.questionIds[roomDoc.currentRound];
      const q = ALL_QUESTIONS.find((item) => item.id === qId);
      if (!q) return;

      const roundAnswers = answerDocs.filter((a) => a.roundIndex === roomDoc!.currentRound);
      let winnerName: string | null = null;
      let fastestMs = Number.POSITIVE_INFINITY;
      const totalDurationMs = Math.max(1000, roomDoc.settings.timeLimitSec * 1000);

      const batch = writeBatch(db);
      for (const p of playerDocs) {
        const ans = roundAnswers.find((a) => a.uid === p.uid);
        if (ans && ans.optionIndex === q.correctIndex) {
          const elapsed = Math.max(0, ans.clientTimeMs - roomDoc.roundStartedAt);
          const ratio = Math.max(0, Math.min(1, 1 - elapsed / totalDurationMs));
          const speedBonus = Math.round(q.points * 0.5 * ratio);
          const nextStreak = p.streak + 1;
          const streakBonus = Math.min(100, (nextStreak - 1) * 20);
          const pts = q.points + speedBonus + streakBonus;
          if (ans.clientTimeMs < fastestMs) {
            fastestMs = ans.clientTimeMs;
            winnerName = p.name;
          }
          batch.update(doc(db, 'rooms', roomCode, 'players', p.uid), {
            score: p.score + pts,
            streak: nextStreak,
            hasAnsweredCurrent: true,
            lastPointsEarned: pts,
            lastAnswerCorrect: true,
            updatedAt: serverTimestamp(),
          });
        } else {
          batch.update(doc(db, 'rooms', roomCode, 'players', p.uid), {
            streak: 0,
            hasAnsweredCurrent: Boolean(ans),
            lastPointsEarned: 0,
            lastAnswerCorrect: ans ? false : null,
            updatedAt: serverTimestamp(),
          });
        }
      }

      batch.update(doc(db, 'rooms', roomCode), {
        state: 'ROUND_RESULTS',
        phaseEndsAt: Date.now() + 3600,
        roundReveal: {
          correctIndex: q.correctIndex,
          explanationAr: q.explanation.ar.slice(0, 500),
          explanationEn: q.explanation.en.slice(0, 500),
          roundWinnerName: winnerName,
        },
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
    } catch (err) {
      console.error('Host revealRoundResults failed:', err);
    } finally {
      transitioning = false;
    }
  };

  const finishMatch = async () => {
    if (!roomDoc || transitioning) return;
    transitioning = true;
    try {
      await updateDoc(doc(db, 'rooms', roomCode), {
        state: 'FINISHED',
        phaseEndsAt: null,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Host finishMatch failed:', err);
    } finally {
      transitioning = false;
    }
  };

  const scheduleHostAutomation = () => {
    clearTimer();
    if (!roomDoc || roomDoc.hostUid !== currentUid) return;

    const now = Date.now();
    if (roomDoc.state === 'STARTING') {
      const waitMs = Math.max(200, (roomDoc.phaseEndsAt ?? now + 2000) - now);
      lifecycleTimer = window.setTimeout(() => {
        void advanceRoundToInProgress(0);
      }, waitMs);
    } else if (roomDoc.state === 'IN_PROGRESS') {
      const allAnswered =
        playerDocs.length > 0 && playerDocs.every((p) => p.hasAnsweredCurrent);
      if (allAnswered) {
        lifecycleTimer = window.setTimeout(() => {
          void revealRoundResults();
        }, 650);
      } else {
        const waitMs = Math.max(200, (roomDoc.phaseEndsAt ?? now + 15000) - now);
        lifecycleTimer = window.setTimeout(() => {
          void revealRoundResults();
        }, waitMs);
      }
    } else if (roomDoc.state === 'ROUND_RESULTS') {
      const waitMs = Math.max(200, (roomDoc.phaseEndsAt ?? now + 3500) - now);
      lifecycleTimer = window.setTimeout(() => {
        if (!roomDoc) return;
        const nextIdx = roomDoc.currentRound + 1;
        if (nextIdx >= roomDoc.totalRounds) {
          void finishMatch();
        } else {
          void advanceRoundToInProgress(nextIdx);
        }
      }, waitMs);
    }
  };

  const unsubRoom = onSnapshot(
    doc(db, 'rooms', roomCode),
    (snap) => {
      if (!snap.exists()) {
        onKickedOrMissing();
        return;
      }
      roomDoc = snap.data() as FirestoreRoomDoc;
      emitSnapshot();
      scheduleHostAutomation();
    },
    (err) => {
      onError(err);
    }
  );

  const unsubPlayers = onSnapshot(
    query(collection(db, 'rooms', roomCode, 'players'), where('roomCode', '==', roomCode)),
    (snap) => {
      playerDocs = snap.docs.map((d) => d.data() as FirestorePlayerDoc);
      const present = playerDocs.some((p) => p.uid === currentUid);
      if (present) sawSelfInRoom = true;
      else if (sawSelfInRoom) {
        onKickedOrMissing();
        return;
      }
      emitSnapshot();
      scheduleHostAutomation();
    },
    (err) => {
      onError(err);
    }
  );

  const unsubAnswers = onSnapshot(
    query(collection(db, 'rooms', roomCode, 'answers'), where('roomCode', '==', roomCode)),
    (snap) => {
      answerDocs = snap.docs.map((d) => d.data() as FirestoreAnswerDoc);
      scheduleHostAutomation();
    },
    (err) => {
      onError(err);
    }
  );

  const unsubChat = onSnapshot(
    query(
      collection(db, 'rooms', roomCode, 'chat'),
      where('roomCode', '==', roomCode),
      limit(50)
    ),
    (snap) => {
      chatMsgs = snap.docs
        .map((d) => {
          const data = d.data();
          const ts = data.createdAt as { toMillis?: () => number } | undefined;
          return {
            id: d.id,
            senderId: String(data.senderId),
            senderName: String(data.senderName),
            text: String(data.text),
            kind: (data.kind as 'chat' | 'reaction' | 'system') || 'chat',
            createdAt: ts?.toMillis ? ts.toMillis() : Date.now(),
          };
        })
        .sort((a, b) => a.createdAt - b.createdAt)
        .slice(-40);
      emitSnapshot();
    },
    (err) => {
      onError(err);
    }
  );

  return () => {
    clearTimer();
    unsubRoom();
    unsubPlayers();
    unsubAnswers();
    unsubChat();
  };
}
