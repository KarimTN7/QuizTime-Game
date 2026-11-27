import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Crown,
  Flame,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  Play,
  Radio,
  RotateCcw,
  Send,
  Unlock,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { signInWithGoogle } from '../services/firebaseClient';
import { sendFriendOrRoomRequest } from '../services/profileService';
import {
  createOrMatchmakeFirestoreRoom,
  joinFirestoreRoom,
  kickFirestorePlayer,
  leaveFirestoreRoom,
  sendFirestoreChat,
  startFirestoreMatch,
  submitFirestoreAnswer,
  subscribeFirestoreRoom,
  toggleFirestoreReady,
  updateFirestoreRoomSettings,
} from '../services/realtimeRoomService';
import {
  MultiplayerPlaylist,
  MultiplayerRoomSnapshot,
} from '../types/game';
import { stripBasePath, withBasePath } from '../utils/basePath';
import { soundEngine } from '../utils/soundEngine';
import { PlayerAvatar } from './PlayerAvatar';
import { QuestionArenaCard } from './QuestionArenaCard';

function getSessionPlayerId(): string {
  const key = 'quiztime_ws_player_id';
  try {
    const existing = window.sessionStorage.getItem(key) || window.sessionStorage.getItem('sijal_ws_player_id');
    if (existing) return existing;
    const next = `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    window.sessionStorage.setItem(key, next);
    return next;
  } catch {
    return `p_${Math.random().toString(36).slice(2, 9)}`;
  }
}

type RealtimeTransport = 'ws' | 'firestore';

export const MultiplayerPage: React.FC = () => {
  const {
    language,
    t,
    settings,
    matchDraft,
    userProfile,
    firebaseUser,
    friendRequests,
    pendingJoinRoomCode,
    setPendingJoinRoomCode,
    recordMatchOutcome,
  } = useApp();

  const [sessionPlayerId] = useState<string>(getSessionPlayerId);
  const [transport, setTransport] = useState<RealtimeTransport | null>(null);
  const [guestName, setGuestName] = useState<string>(() => {
    return userProfile?.displayName || (language === 'ar' ? 'لاعب' : 'Player');
  });
  const [joinCode, setJoinCode] = useState('');
  const [room, setRoom] = useState<MultiplayerRoomSnapshot | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [clockTick, setClockTick] = useState(Date.now());
  const [invitedUids, setInvitedUids] = useState<Record<string, boolean>>({});
  const [signingIn, setSigningIn] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const firestoreUnsubRef = useRef<(() => void) | null>(null);
  const recordedMatchKeyRef = useRef<string | null>(null);

  const playerId = transport === 'firestore' && firebaseUser ? firebaseUser.uid : sessionPlayerId;

  // Resolve real-time transport: dedicated WS server (Express / VITE_WS_URL) vs Vercel Firestore Rooms
  useEffect(() => {
    const envWsUrl = (import.meta.env.VITE_WS_URL as string | undefined)?.trim();
    if (envWsUrl) {
      setTransport('ws');
      return;
    }

    let cancelled = false;
    fetch(withBasePath('/api/health'), { cache: 'no-store' })
      .then((r) =>
        r.ok && r.headers.get('content-type')?.includes('application/json') ? r.json() : null
      )
      .then((data: { realtimeWs?: boolean } | null) => {
        if (!cancelled) {
          setTransport(data?.realtimeWs ? 'ws' : 'firestore');
        }
      })
      .catch(() => {
        if (!cancelled) setTransport('firestore');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (userProfile?.displayName) {
      setGuestName(userProfile.displayName);
    }
  }, [userProfile?.displayName]);

  const effectiveName = (userProfile?.displayName || guestName || 'Player').trim().slice(0, 30);
  const effectiveAvatar = userProfile?.avatarId || 'prism_violet';

  // Accepted friends from Firestore
  const acceptedFriends = useMemo(() => {
    if (!firebaseUser) return [];
    const friends: { uid: string; name: string; avatarId: string }[] = [];
    const seen = new Set<string>();
    for (const req of friendRequests) {
      if (req.kind === 'friend_request' && req.status === 'accepted') {
        const otherUid = req.fromUid === firebaseUser.uid ? req.toUid : req.fromUid;
        if (!seen.has(otherUid)) {
          seen.add(otherUid);
          friends.push({
            uid: otherUid,
            name: req.fromUid === firebaseUser.uid ? otherUid.slice(0, 8) : req.fromName,
            avatarId: req.fromAvatarId,
          });
        }
      }
    }
    return friends;
  }, [firebaseUser, friendRequests]);

  const mapErrorCode = useCallback(
    (codeOrMessage: string) => {
      if (codeOrMessage.includes('ROOM_NOT_FOUND')) return t.multiplayerPage.roomNotFound;
      if (codeOrMessage.includes('ROOM_LOCKED')) return t.multiplayerPage.roomLocked;
      if (codeOrMessage.includes('ROOM_FULL')) return t.multiplayerPage.roomFull;
      if (codeOrMessage.includes('MATCH_IN_PROGRESS')) return t.multiplayerPage.matchInProgressErr;
      return codeOrMessage || t.multiplayerPage.connectingError;
    },
    [
      t.multiplayerPage.connectingError,
      t.multiplayerPage.matchInProgressErr,
      t.multiplayerPage.roomFull,
      t.multiplayerPage.roomLocked,
      t.multiplayerPage.roomNotFound,
    ]
  );

  const connectAndSendWs = useCallback(
    (payload: Record<string, unknown>) => {
      setWsError(null);
      setConnecting(true);

      const envWsUrl = (import.meta.env.VITE_WS_URL as string | undefined)?.trim();
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = envWsUrl || `${protocol}//${window.location.host}/ws`;

      const sendPayload = (socket: WebSocket) => {
        socket.send(JSON.stringify(payload));
      };

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        sendPayload(wsRef.current);
        setConnecting(false);
        return;
      }

      if (wsRef.current) {
        wsRef.current.close();
      }

      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setConnecting(false);
        sendPayload(socket);
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as Record<string, unknown>;
          if (msg.type === 'room:joined' || msg.type === 'room:state') {
            const nextRoom = msg.room as MultiplayerRoomSnapshot;
            setRoom(nextRoom);
            setWsError(null);
          } else if (msg.type === 'room:kicked') {
            setRoom(null);
            setWsError(t.multiplayerPage.kickedNotice);
          } else if (msg.type === 'error') {
            setConnecting(false);
            const code = String(msg.code || msg.message || '');
            setWsError(mapErrorCode(code));
          }
        } catch {
          // Ignore malformed frame
        }
      };

      socket.onerror = () => {
        setConnecting(false);
        setWsError(t.multiplayerPage.connectingError);
      };

      socket.onclose = () => {
        setConnecting(false);
      };
    },
    [mapErrorCode, t.multiplayerPage.connectingError, t.multiplayerPage.kickedNotice]
  );

  const attachFirestoreRoom = useCallback(
    (code: string, uid: string) => {
      if (firestoreUnsubRef.current) {
        firestoreUnsubRef.current();
        firestoreUnsubRef.current = null;
      }
      firestoreUnsubRef.current = subscribeFirestoreRoom({
        roomCode: code,
        currentUid: uid,
        onSnapshotUpdate: (snapshot) => {
          setRoom(snapshot);
          setConnecting(false);
          setWsError(null);
        },
        onKickedOrMissing: () => {
          setRoom(null);
          setConnecting(false);
          setWsError(t.multiplayerPage.kickedNotice);
          if (firestoreUnsubRef.current) {
            firestoreUnsubRef.current();
            firestoreUnsubRef.current = null;
          }
        },
        onError: (err) => {
          setConnecting(false);
          setWsError(mapErrorCode(err.message));
        },
      });
    },
    [mapErrorCode, t.multiplayerPage.kickedNotice]
  );

  // Clean up WebSocket & Firestore listeners on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (firestoreUnsubRef.current) {
        firestoreUnsubRef.current();
        firestoreUnsubRef.current = null;
      }
    };
  }, []);

  // Reset selected option when round changes
  useEffect(() => {
    setSelectedOption(null);
  }, [room?.currentRound, room?.state]);

  // Countdown UI tick synced to phaseEndsAt
  useEffect(() => {
    if (!room?.phaseEndsAt) return;
    const interval = setInterval(() => {
      setClockTick(Date.now());
    }, 250);
    return () => clearInterval(interval);
  }, [room?.phaseEndsAt]);

  // Play reveal SFX on round results & record finished match
  useEffect(() => {
    if (!room) return;
    if (room.state === 'ROUND_RESULTS') {
      const me = room.players.find((p) => p.playerId === playerId);
      if (me?.lastAnswerCorrect === true) {
        soundEngine.playCorrect(settings.soundVolume);
      } else if (me?.lastAnswerCorrect === false) {
        soundEngine.playWrong(settings.soundVolume);
      }
    } else if (room.state === 'FINISHED') {
      soundEngine.playVictory(settings.soundVolume);
      const matchKey = `${room.code}_${room.totalRounds}_${room.players.map((p) => p.score).join('_')}`;
      if (recordedMatchKeyRef.current !== matchKey) {
        recordedMatchKeyRef.current = matchKey;
        const sorted = [...room.players].sort((a, b) => b.score - a.score);
        const me = room.players.find((p) => p.playerId === playerId);
        if (me) {
          const won = sorted[0]?.playerId === playerId;
          const xpEarned = Math.max(30, Math.round(me.score * 0.15) + (won ? 80 : 20));
          void recordMatchOutcome(
            {
              mode: room.playlist === 'private' ? 'private_multiplayer' : room.playlist,
              isMultiplayer: true,
              categorySummary: room.settings.allCategoriesSelected
                ? 'ALL'
                : room.settings.selectedCategoryIds.join(', ') || 'ALL',
              score: me.score,
              correctCount: Math.round(me.score / 130),
              totalCount: room.totalRounds,
              bestStreak: me.streak,
              won,
              xpEarned,
            },
            {
              primaryCategoryId: room.settings.selectedCategoryIds[0] || 'gaming',
              wasHost: me.isHost,
            }
          );
        }
      }
    }
  }, [room, playerId, settings.soundVolume, recordMatchOutcome]);

  const handleCreateRoom = useCallback(
    async (playlist: MultiplayerPlaylist) => {
      if (!transport) return;
      if (transport === 'ws') {
        connectAndSendWs({
          type: playlist === 'private' ? 'room:create' : 'room:matchmake',
          playerId,
          uid: firebaseUser?.uid,
          name: effectiveName,
          avatarId: effectiveAvatar,
          playlist,
          settings: {
            allCategoriesSelected: matchDraft.allCategoriesSelected,
            selectedCategoryIds: matchDraft.selectedCategoryIds,
            selectedTopics: matchDraft.selectedTopics,
            selectedQuestionTypes: matchDraft.selectedQuestionTypes,
            difficulty: matchDraft.difficulty,
            rounds: matchDraft.rounds,
            timeLimitSec: matchDraft.timeLimitSec,
          },
        });
        return;
      }

      if (!firebaseUser) {
        setWsError(t.multiplayerPage.signInForLiveRooms);
        return;
      }

      setWsError(null);
      setConnecting(true);
      try {
        const code = await createOrMatchmakeFirestoreRoom({
          uid: firebaseUser.uid,
          name: effectiveName,
          avatarId: effectiveAvatar,
          playlist,
          settings: {
            allCategoriesSelected: matchDraft.allCategoriesSelected,
            selectedCategoryIds: matchDraft.selectedCategoryIds,
            selectedTopics: matchDraft.selectedTopics,
            selectedQuestionTypes: matchDraft.selectedQuestionTypes,
            difficulty: matchDraft.difficulty,
            rounds: matchDraft.rounds,
            timeLimitSec: matchDraft.timeLimitSec,
          },
        });
        attachFirestoreRoom(code, firebaseUser.uid);
      } catch (err) {
        setConnecting(false);
        setWsError(mapErrorCode(err instanceof Error ? err.message : String(err)));
      }
    },
    [
      transport,
      connectAndSendWs,
      playerId,
      firebaseUser,
      effectiveName,
      effectiveAvatar,
      matchDraft,
      t.multiplayerPage.signInForLiveRooms,
      attachFirestoreRoom,
      mapErrorCode,
    ]
  );

  const handleJoinByCode = useCallback(
    async (codeToJoin: string) => {
      const clean = codeToJoin.trim().toUpperCase();
      if (!clean || !transport) return;

      if (transport === 'ws') {
        connectAndSendWs({
          type: 'room:join',
          code: clean,
          playerId,
          uid: firebaseUser?.uid,
          name: effectiveName,
          avatarId: effectiveAvatar,
        });
        return;
      }

      if (!firebaseUser) {
        setWsError(t.multiplayerPage.signInForLiveRooms);
        return;
      }

      setWsError(null);
      setConnecting(true);
      try {
        const joinedCode = await joinFirestoreRoom({
          code: clean,
          uid: firebaseUser.uid,
          name: effectiveName,
          avatarId: effectiveAvatar,
        });
        attachFirestoreRoom(joinedCode, firebaseUser.uid);
      } catch (err) {
        setConnecting(false);
        setWsError(mapErrorCode(err instanceof Error ? err.message : String(err)));
      }
    },
    [
      transport,
      connectAndSendWs,
      playerId,
      firebaseUser,
      effectiveName,
      effectiveAvatar,
      t.multiplayerPage.signInForLiveRooms,
      attachFirestoreRoom,
      mapErrorCode,
    ]
  );

  // Handle incoming ?room=CODE or PlayHub triggers once transport is ready
  useEffect(() => {
    if (!pendingJoinRoomCode || !transport) return;
    if (transport === 'firestore' && !firebaseUser) return;
    const code = pendingJoinRoomCode;
    setPendingJoinRoomCode(null);
    if (code === '__CREATE_PRIVATE__') {
      void handleCreateRoom('private');
    } else {
      setJoinCode(code);
      void handleJoinByCode(code);
    }
  }, [
    pendingJoinRoomCode,
    transport,
    firebaseUser,
    setPendingJoinRoomCode,
    handleCreateRoom,
    handleJoinByCode,
  ]);

  const sendRoomAction = useCallback(
    async (payload: Record<string, unknown>) => {
      if (transport === 'ws') {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify(payload));
        }
        return;
      }

      if (!room || !firebaseUser) return;
      const actionType = payload.type as string;
      try {
        if (actionType === 'room:ready') {
          const me = room.players.find((p) => p.playerId === firebaseUser.uid);
          if (me) await toggleFirestoreReady(room.code, firebaseUser.uid, !me.ready);
        } else if (actionType === 'room:update_settings') {
          const patch = (payload.settings as Partial<typeof room.settings>) || {};
          await updateFirestoreRoomSettings(room.code, { ...room.settings, ...patch });
        } else if (actionType === 'room:kick') {
          const targetId = String(payload.targetPlayerId || '');
          if (targetId) await kickFirestorePlayer(room.code, targetId);
        } else if (actionType === 'room:start' || actionType === 'room:rematch') {
          await startFirestoreMatch(room.code, room.settings, room.players);
        } else if (actionType === 'room:answer') {
          await submitFirestoreAnswer({
            roomCode: room.code,
            uid: firebaseUser.uid,
            roundIndex: Math.max(0, room.currentRound - 1),
            optionIndex: Number(payload.optionIndex),
          });
        } else if (actionType === 'room:chat') {
          await sendFirestoreChat({
            roomCode: room.code,
            senderId: firebaseUser.uid,
            senderName: effectiveName,
            text: String(payload.text || ''),
            kind: (payload.kind as 'chat' | 'reaction') || 'chat',
          });
        }
      } catch (err) {
        setWsError(mapErrorCode(err instanceof Error ? err.message : String(err)));
      }
    },
    [transport, room, firebaseUser, effectiveName, mapErrorCode]
  );

  const handleLeaveRoom = async () => {
    if (transport === 'ws') {
      void sendRoomAction({ type: 'room:leave' });
    } else if (room && firebaseUser) {
      if (firestoreUnsubRef.current) {
        firestoreUnsubRef.current();
        firestoreUnsubRef.current = null;
      }
      const me = room.players.find((p) => p.playerId === firebaseUser.uid);
      await leaveFirestoreRoom(
        room.code,
        firebaseUser.uid,
        room.players,
        Boolean(me?.isHost)
      ).catch(() => undefined);
    }
    setRoom(null);
    if (
      window.location.search.includes('room=') ||
      stripBasePath(window.location.pathname).toLowerCase().startsWith('join/')
    ) {
      window.history.replaceState(null, '', withBasePath('/multiplayer'));
    }
  };

  const handleCopyInvite = async () => {
    if (!room) return;
    const url = `${window.location.origin}${withBasePath('/multiplayer')}?room=${room.code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    void sendRoomAction({ type: 'room:chat', kind: 'chat', text: chatInput.trim() });
    setChatInput('');
  };

  const handleInviteFriend = async (friendUid: string) => {
    if (!userProfile || !room) return;
    setInvitedUids((prev) => ({ ...prev, [friendUid]: true }));
    await sendFriendOrRoomRequest({
      fromProfile: userProfile,
      toUid: friendUid,
      kind: 'room_invite',
      roomCode: room.code,
    });
  };

  const handleGoogleLoginForRooms = async () => {
    setWsError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setWsError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setSigningIn(false);
    }
  };

  // ========================
  // IN-ROOM LIVE EXPERIENCE
  // ========================
  if (room) {
    const me = room.players.find((p) => p.playerId === playerId);
    const isHost = me?.isHost ?? false;
    const secondsLeft =
      room.phaseEndsAt !== null ? Math.max(0, Math.ceil((room.phaseEndsAt - clockTick) / 1000)) : 0;
    const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

    return (
      <div className="space-y-6">
        {/* Room Header Bar */}
        <header className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-[#9399B2]">
                {t.multiplayerPage.lobbyRoomCode}
              </div>
              <div className="text-2xl font-extrabold font-mono-tabular tracking-widest text-[#29C7FF]">
                {room.code}
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleCopyInvite()}
              className="min-h-[40px] px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-[#0B0D19] hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-bold text-[#111428] dark:text-[#F5F5FA] inline-flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? t.multiplayerPage.copiedLink : t.multiplayerPage.copyInviteLink}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isHost && (room.state === 'WAITING' || room.state === 'FINISHED') && (
              <button
                type="button"
                onClick={() =>
                  void sendRoomAction({
                    type: 'room:update_settings',
                    settings: { locked: !room.settings.locked },
                  })
                }
                className="min-h-[40px] px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/10 text-xs font-semibold text-[#111428] dark:text-[#F5F5FA] inline-flex items-center gap-1.5"
              >
                {room.settings.locked ? <Lock className="w-3.5 h-3.5 text-[#FFB547]" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>
                  {room.settings.locked
                    ? t.multiplayerPage.unlockRoomBtn
                    : t.multiplayerPage.lockRoomBtn}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => void handleLeaveRoom()}
              className="min-h-[40px] px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.multiplayerPage.leaveRoomBtn}</span>
            </button>
          </div>
        </header>

        {/* STARTING COUNTDOWN */}
        {room.state === 'STARTING' && (
          <div className="p-12 rounded-2xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 text-center space-y-3">
            <div className="text-6xl font-extrabold font-mono-tabular text-[#8057FF]">
              {Math.max(1, secondsLeft)}
            </div>
            <h2 className="text-xl font-bold text-[#111428] dark:text-[#F5F5FA]">
              {t.gameplay.matchStarting}
            </h2>
          </div>
        )}

        {/* IN PROGRESS OR ROUND RESULTS */}
        {(room.state === 'IN_PROGRESS' || room.state === 'ROUND_RESULTS') &&
          room.currentQuestion && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-4">
                <div className="p-4 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
                  <div className="text-sm font-bold text-[#111428] dark:text-[#F5F5FA] tabular-nums">
                    {t.gameplay.questionOf} {room.currentRound} / {room.totalRounds}
                  </div>
                  <div
                    className={`px-3.5 py-1.5 rounded-lg font-mono-tabular text-sm font-extrabold ${
                      secondsLeft <= 5
                        ? 'bg-rose-500/15 text-rose-500'
                        : 'bg-slate-100 dark:bg-[#0B0D19] text-[#29C7FF]'
                    }`}
                  >
                    {secondsLeft} {t.common.secondsShort}
                  </div>
                </div>

                <QuestionArenaCard
                  question={room.currentQuestion}
                  selectedOptionIndex={selectedOption}
                  locked={Boolean(me?.hasAnsweredCurrent) || room.state === 'ROUND_RESULTS'}
                  onSelectOption={(idx) => {
                    if (room.state !== 'IN_PROGRESS' || me?.hasAnsweredCurrent) return;
                    setSelectedOption(idx);
                    void sendRoomAction({ type: 'room:answer', optionIndex: idx });
                  }}
                  reveal={
                    room.state === 'ROUND_RESULTS' && room.roundReveal
                      ? {
                          correctIndex: room.roundReveal.correctIndex,
                          explanation: room.roundReveal.explanation,
                        }
                      : null
                  }
                  streakCount={me?.streak ?? 0}
                />

                {room.state === 'IN_PROGRESS' && me?.hasAnsweredCurrent && (
                  <div className="p-3.5 rounded-xl bg-[#8057FF]/12 border border-[#8057FF]/35 text-xs sm:text-sm font-semibold text-[#111428] dark:text-[#F5F5FA] text-center">
                    {t.gameplay.answeredBadge} · {t.gameplay.waitingOthers}
                  </div>
                )}

                {room.state === 'ROUND_RESULTS' && room.roundReveal?.roundWinnerName && (
                  <div className="p-3.5 rounded-xl bg-[#FFB547]/12 border border-[#FFB547]/35 text-xs sm:text-sm font-bold text-[#FFB547] text-center">
                    {t.gameplay.roundWinner}: {room.roundReveal.roundWinnerName}
                  </div>
                )}
              </div>

              {/* Live Scoreboard Sidebar */}
              <aside className="lg:col-span-4 p-5 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-[#111428] dark:text-[#F5F5FA]">
                  {t.multiplayerPage.playersHeading}
                </h3>
                <div className="divide-y divide-slate-100 dark:divide-white/8">
                  {sortedPlayers.map((p, idx) => (
                    <div key={p.playerId} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono-tabular text-xs text-slate-400 w-4">
                          {idx + 1}
                        </span>
                        <PlayerAvatar avatarId={p.avatarId} size="sm" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#111428] dark:text-[#F5F5FA] truncate">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-[#9399B2]">
                            {room.state === 'IN_PROGRESS'
                              ? p.hasAnsweredCurrent
                                ? t.gameplay.answeredBadge
                                : '...'
                              : p.lastPointsEarned > 0
                                ? `+${p.lastPointsEarned}`
                                : ''}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono-tabular text-sm font-extrabold text-[#29C7FF]">
                        {p.score}
                      </span>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          )}

        {/* WAITING LOBBY OR FINISHED PODIUM */}
        {(room.state === 'WAITING' || room.state === 'FINISHED') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-6">
              {room.state === 'FINISHED' && (
                <section className="p-6 rounded-xl bg-white dark:bg-[#12162A] border border-[#FFB547]/40 space-y-4">
                  <div className="flex items-center gap-2 text-[#FFB547]">
                    <Crown className="w-5 h-5" />
                    <h2 className="text-lg font-extrabold">{t.multiplayerPage.podiumTitle}</h2>
                  </div>

                  <div className="space-y-2.5">
                    {sortedPlayers.map((p, idx) => (
                      <div
                        key={p.playerId}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/8 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono-tabular text-base font-extrabold text-[#FFB547] w-6">
                            #{idx + 1}
                          </span>
                          <PlayerAvatar avatarId={p.avatarId} size="sm" />
                          <span className="text-sm font-bold text-[#111428] dark:text-[#F5F5FA]">
                            {p.name}
                          </span>
                        </div>
                        <span className="font-mono-tabular text-base font-extrabold text-[#29C7FF]">
                          {p.score} {t.common.pointsShort}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Player Roster */}
              <section className="p-6 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-[#111428] dark:text-[#F5F5FA]">
                    {t.multiplayerPage.playersHeading} ({room.players.length}/{room.settings.maxPlayers})
                  </h2>
                  <span className="text-xs font-mono-tabular text-slate-500 dark:text-[#9399B2]">
                    {room.settings.rounds} {t.singleplayerPage.roundsLabel} · {room.settings.timeLimitSec}s
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-white/8">
                  {room.players.map((p) => (
                    <div key={p.playerId} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <PlayerAvatar avatarId={p.avatarId} size="sm" />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-[#111428] dark:text-[#F5F5FA] flex items-center gap-2 truncate">
                            <span>{p.name}</span>
                            {p.isHost && (
                              <span className="text-[11px] font-semibold text-[#FFB547]">
                                · {t.multiplayerPage.hostBadge}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-[#9399B2]">
                            {p.ready ? t.multiplayerPage.readyBadge : t.multiplayerPage.notReadyBadge}
                          </div>
                        </div>
                      </div>

                      {isHost && p.playerId !== playerId && (
                        <button
                          type="button"
                          onClick={() =>
                            void sendRoomAction({ type: 'room:kick', targetPlayerId: p.playerId })
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>{t.multiplayerPage.kickPlayer}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Lobby Action Controls */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/8 flex flex-wrap items-center gap-3">
                  {!isHost && (
                    <button
                      type="button"
                      onClick={() => void sendRoomAction({ type: 'room:ready' })}
                      className={`min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        me?.ready
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 dark:bg-[#0B0D19] text-[#111428] dark:text-[#F5F5FA] border border-slate-200 dark:border-white/10'
                      }`}
                    >
                      {t.multiplayerPage.toggleReady}
                    </button>
                  )}

                  {isHost && (
                    <button
                      type="button"
                      onClick={() =>
                        void sendRoomAction({
                          type: room.state === 'FINISHED' ? 'room:rematch' : 'room:start',
                        })
                      }
                      className="min-h-[46px] px-6 py-3 rounded-xl bg-[#8057FF] hover:bg-[#6D42F5] text-white text-sm font-extrabold inline-flex items-center gap-2 transition-colors"
                    >
                      {room.state === 'FINISHED' ? (
                        <RotateCcw className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      <span>
                        {room.state === 'FINISHED'
                          ? t.multiplayerPage.rematchBtn
                          : t.multiplayerPage.startMatchBtn}
                      </span>
                    </button>
                  )}
                </div>
              </section>

              {/* Invite Registered Friends Directly */}
              {acceptedFriends.length > 0 && (
                <section className="p-5 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/8 space-y-3">
                  <h3 className="text-sm font-bold text-[#111428] dark:text-[#F5F5FA] flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[#29C7FF]" />
                    <span>{t.multiplayerPage.inviteFriendTitle}</span>
                  </h3>
                  <div className="space-y-2">
                    {acceptedFriends.map((f) => (
                      <div key={f.uid} className="flex items-center justify-between gap-2 text-sm">
                        <span className="font-semibold text-[#111428] dark:text-[#F5F5FA]">
                          {f.name}
                        </span>
                        <button
                          type="button"
                          disabled={Boolean(invitedUids[f.uid])}
                          onClick={() => void handleInviteFriend(f.uid)}
                          className="px-3 py-1.5 rounded-lg bg-[#8057FF] disabled:opacity-50 text-white text-xs font-bold"
                        >
                          {invitedUids[f.uid]
                            ? t.multiplayerPage.invitedSent
                            : t.multiplayerPage.sendInviteBtn}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Room Chat & Quick Reactions */}
            <aside className="lg:col-span-5 p-5 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 flex flex-col h-[420px]">
              <h3 className="text-sm font-bold text-[#111428] dark:text-[#F5F5FA] pb-3 border-b border-slate-100 dark:border-white/8">
                {t.multiplayerPage.chatTitle}
              </h3>

              <div className="flex-1 overflow-y-auto py-3 space-y-2 text-xs sm:text-sm">
                {room.chat.map((msg) => (
                  <div
                    key={msg.id}
                    className={
                      msg.kind === 'system'
                        ? 'text-xs text-slate-400 dark:text-[#9399B2] italic'
                        : 'text-[#111428] dark:text-[#F5F5FA]'
                    }
                  >
                    {msg.kind !== 'system' && (
                      <span className="font-bold text-[#29C7FF] me-1.5">{msg.senderName}:</span>
                    )}
                    <span>{msg.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 py-2 border-t border-slate-100 dark:border-white/8">
                {['🔥', '👏', '⚡', '🎯'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() =>
                      void sendRoomAction({ type: 'room:chat', kind: 'reaction', text: emoji })
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0B0D19] hover:bg-slate-200 dark:hover:bg-white/10 text-sm"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  maxLength={140}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t.multiplayerPage.chatPlaceholder}
                  className="flex-1 min-w-0 min-h-[40px] px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/10 text-xs text-[#111428] dark:text-[#F5F5FA] focus:outline-none focus:ring-2 focus:ring-[#8057FF]"
                />
                <button
                  type="submit"
                  className="min-h-[40px] px-3.5 py-2 rounded-lg bg-[#8057FF] text-white text-xs font-bold inline-flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.multiplayerPage.sendChat}</span>
                </button>
              </form>
            </aside>
          </div>
        )}
      </div>
    );
  }

  // ========================
  // LOBBY ENTRY VIEW (Create, Join, Matchmake)
  // ========================
  const requiresAuthForRooms = transport === 'firestore' && !firebaseUser;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111428] dark:text-[#F5F5FA]">
          {t.multiplayerPage.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-[#9399B2] max-w-2xl">
          {t.multiplayerPage.subtitle}
        </p>
      </header>

      {wsError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/35 text-sm font-semibold text-rose-600 dark:text-rose-400">
          {wsError}
        </div>
      )}

      {requiresAuthForRooms && (
        <section className="p-5 rounded-xl bg-white dark:bg-[#12162A] border border-[#8057FF]/45 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm font-medium text-[#111428] dark:text-[#F5F5FA]">
            {t.multiplayerPage.signInForLiveRooms}
          </p>
          <button
            type="button"
            disabled={signingIn}
            onClick={() => void handleGoogleLoginForRooms()}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#8057FF] hover:bg-[#6D42F5] disabled:opacity-60 text-white text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <LogIn className="w-4 h-4 shrink-0" />
            <span>{t.multiplayerPage.signInNowBtn}</span>
          </button>
        </section>
      )}

      {/* Player Name input (auto-filled if signed in) */}
      <section className="p-5 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <PlayerAvatar avatarId={effectiveAvatar} size="md" />
          <label
            htmlFor="mp-display-name"
            className="text-sm font-bold text-[#111428] dark:text-[#F5F5FA]"
          >
            {t.multiplayerPage.displayNameLabel}
          </label>
        </div>

        <input
          id="mp-display-name"
          type="text"
          maxLength={30}
          disabled={Boolean(userProfile)}
          value={effectiveName}
          onChange={(e) => setGuestName(e.target.value)}
          className="flex-1 max-w-xs min-h-[42px] px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/10 text-sm font-semibold text-[#111428] dark:text-[#F5F5FA] disabled:opacity-75"
        />
      </section>

      {/* Create Private vs Join Room */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-[#8057FF]/15 text-[#8057FF] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#111428] dark:text-[#F5F5FA]">
              {t.multiplayerPage.createPrivateTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-[#9399B2] leading-relaxed">
              {t.multiplayerPage.createPrivateDesc}
            </p>
          </div>

          <button
            type="button"
            disabled={!transport || connecting || requiresAuthForRooms}
            onClick={() => void handleCreateRoom('private')}
            className="min-h-[46px] px-6 py-3 rounded-xl bg-[#8057FF] hover:bg-[#6D42F5] disabled:opacity-60 text-white text-sm font-extrabold transition-colors w-full sm:w-fit"
          >
            {connecting ? t.common.loading : t.multiplayerPage.createPrivateBtn}
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleJoinByCode(joinCode);
          }}
          className="p-6 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-5"
        >
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-[#29C7FF]/15 text-[#29C7FF] flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#111428] dark:text-[#F5F5FA]">
              {t.multiplayerPage.joinRoomTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-[#9399B2] leading-relaxed">
              {t.multiplayerPage.joinRoomDesc}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              maxLength={10}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder={t.multiplayerPage.joinRoomPlaceholder}
              className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/12 text-sm font-mono-tabular uppercase tracking-widest text-[#111428] dark:text-[#F5F5FA] focus:outline-none focus:ring-2 focus:ring-[#29C7FF]"
            />
            <button
              type="submit"
              disabled={!transport || connecting || !joinCode.trim() || requiresAuthForRooms}
              className="min-h-[46px] px-6 py-3 rounded-xl bg-[#29C7FF] hover:bg-[#14B5EE] disabled:opacity-50 text-[#0B0D19] text-sm font-extrabold transition-colors whitespace-nowrap"
            >
              {t.multiplayerPage.joinRoomBtn}
            </button>
          </div>
        </form>
      </section>

      {/* Public Matchmaking */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-[#FFB547]" />
          <h2 className="text-lg font-bold text-[#111428] dark:text-[#F5F5FA]">
            {t.multiplayerPage.matchmakingTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['quick', 'competitive', 'casual'] as const).map((playlist) => {
            const info = t.multiplayerPage.matchmakingModes[playlist];
            return (
              <button
                key={playlist}
                type="button"
                disabled={!transport || connecting || requiresAuthForRooms}
                onClick={() => void handleCreateRoom(playlist)}
                className="text-start p-5 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 hover:border-[#FFB547] disabled:opacity-60 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-bold text-[#111428] dark:text-[#F5F5FA]">
                    {info.title}
                  </span>
                  <Flame className="w-4 h-4 text-[#FFB547] shrink-0" />
                </div>
                <p className="text-xs text-slate-600 dark:text-[#9399B2] leading-relaxed">
                  {info.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
