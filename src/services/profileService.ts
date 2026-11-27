import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { AVATAR_CATALOG } from '../components/PlayerAvatar';
import {
  FriendRequestRecord,
  MatchResultSummary,
  PublicUserProfile,
} from '../types/game';
import { db, handleFirestoreError, OperationType } from './firebaseClient';

export const ACHIEVEMENT_DEFS = [
  { id: 'first_victory', xpBonus: 100 },
  { id: 'gaming_expert', xpBonus: 150 },
  { id: 'perfect_round', xpBonus: 200 },
  { id: 'speed_master', xpBonus: 150 },
  { id: 'trivia_legend', xpBonus: 300 },
  { id: 'daily_player', xpBonus: 120 },
  { id: 'category_master', xpBonus: 150 },
  { id: 'party_host', xpBonus: 120 },
] as const;

export function calculateLevelFromXp(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1);
}

export function getUnlockedAvatarsForLevel(level: number): string[] {
  return AVATAR_CATALOG.filter((a) => a.unlockLevel <= level).map((a) => a.id);
}

export async function ensureUserProfile(user: User): Promise<PublicUserProfile> {
  const publicPath = `users/${user.uid}`;
  const privatePath = `users/${user.uid}/private/info`;
  const userRef = doc(db, 'users', user.uid);
  const privateRef = doc(db, 'users', user.uid, 'private', 'info');

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as PublicUserProfile;
      return {
        ...data,
        achievements: Array.isArray(data.achievements) ? data.achievements : [],
        unlockedAvatars:
          Array.isArray(data.unlockedAvatars) && data.unlockedAvatars.length > 0
            ? data.unlockedAvatars
            : ['prism_violet', 'zap_cyan', 'gamepad_slate', 'shield_amber'],
      };
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, publicPath);
  }

  const rawName = (user.displayName || user.email?.split('@')[0] || 'Player').trim();
  const safeName = rawName.length >= 2 ? rawName.slice(0, 40) : `Player_${user.uid.slice(0, 4)}`;

  const initialProfile: PublicUserProfile = {
    uid: user.uid,
    displayName: safeName,
    avatarId: 'prism_violet',
    level: 1,
    xp: 0,
    totalScore: 0,
    totalMatches: 0,
    wins: 0,
    losses: 0,
    bestScore: 0,
    currentStreak: 0,
    achievements: [],
    unlockedAvatars: ['prism_violet', 'zap_cyan', 'gamepad_slate', 'shield_amber'],
  };

  try {
    await setDoc(userRef, {
      ...initialProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, publicPath);
  }

  try {
    await setDoc(privateRef, {
      uid: user.uid,
      email: (user.email || '').slice(0, 160),
      notificationsEnabled: true,
      profilePublic: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, privatePath);
  }

  return initialProfile;
}

export async function updateProfileIdentity(
  uid: string,
  displayName: string,
  avatarId: string
): Promise<void> {
  const safeName = displayName.trim().slice(0, 40);
  if (safeName.length < 2) {
    throw new Error('Display name must be at least 2 characters.');
  }
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      displayName: safeName,
      avatarId,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function recordMatchAndUpdateProgression(
  profile: PublicUserProfile,
  match: Omit<MatchResultSummary, 'id' | 'playedAt'>,
  options?: {
    isDaily?: boolean;
    dailyDateKey?: string;
    primaryCategoryId?: string;
    wasHost?: boolean;
  }
): Promise<{ updatedProfile: PublicUserProfile; newlyUnlocked: string[] }> {
  const todayUtc = new Date().toISOString().slice(0, 10);
  const yesterdayUtc = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let nextStreak = profile.currentStreak;
  if (profile.lastPlayedDate === todayUtc) {
    nextStreak = Math.max(1, profile.currentStreak);
  } else if (profile.lastPlayedDate === yesterdayUtc) {
    nextStreak = profile.currentStreak + 1;
  } else {
    nextStreak = 1;
  }

  const nextTotalMatches = profile.totalMatches + 1;
  const nextWins = profile.wins + (match.won ? 1 : 0);
  const nextLosses = profile.losses + (match.won ? 0 : 1);
  const nextBestScore = Math.max(profile.bestScore, match.score);
  const nextTotalScore = profile.totalScore + match.score;

  // Evaluate achievements
  const currentAch = new Set(profile.achievements);
  const newlyUnlocked: string[] = [];
  const unlock = (id: string) => {
    if (!currentAch.has(id)) {
      currentAch.add(id);
      newlyUnlocked.push(id);
    }
  };

  if (match.won) unlock('first_victory');
  if (match.totalCount >= 5 && match.correctCount === match.totalCount) unlock('perfect_round');
  if (options?.primaryCategoryId === 'gaming' && match.correctCount >= 4) unlock('gaming_expert');
  if (match.bestStreak >= 5) unlock('speed_master');
  if (options?.isDaily) unlock('daily_player');
  if (match.mode === 'category_challenge' && match.won) unlock('category_master');
  if (options?.wasHost) unlock('party_host');

  const bonusXp = newlyUnlocked.reduce((acc, id) => {
    const def = ACHIEVEMENT_DEFS.find((a) => a.id === id);
    return acc + (def?.xpBonus ?? 50);
  }, 0);

  const nextXp = profile.xp + match.xpEarned + bonusXp;
  const nextLevel = calculateLevelFromXp(nextXp);
  if (nextLevel >= 5) unlock('trivia_legend');

  const unlockedAvatars = Array.from(
    new Set([...profile.unlockedAvatars, ...getUnlockedAvatarsForLevel(nextLevel)])
  ).slice(0, 40);

  const updatedProfile: PublicUserProfile = {
    ...profile,
    level: nextLevel,
    xp: nextXp,
    totalScore: nextTotalScore,
    totalMatches: nextTotalMatches,
    wins: nextWins,
    losses: nextLosses,
    bestScore: nextBestScore,
    currentStreak: nextStreak,
    lastPlayedDate: todayUtc,
    favoriteCategory: options?.primaryCategoryId || profile.favoriteCategory || 'gaming',
    achievements: Array.from(currentAch).slice(0, 40),
    unlockedAvatars,
  };

  // Persist user profile update
  const userPath = `users/${profile.uid}`;
  try {
    await updateDoc(doc(db, 'users', profile.uid), {
      level: updatedProfile.level,
      xp: updatedProfile.xp,
      totalScore: updatedProfile.totalScore,
      totalMatches: updatedProfile.totalMatches,
      wins: updatedProfile.wins,
      losses: updatedProfile.losses,
      bestScore: updatedProfile.bestScore,
      currentStreak: updatedProfile.currentStreak,
      lastPlayedDate: updatedProfile.lastPlayedDate,
      favoriteCategory: updatedProfile.favoriteCategory,
      achievements: updatedProfile.achievements,
      unlockedAvatars: updatedProfile.unlockedAvatars,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, userPath);
  }

  // Persist match history entry
  const matchId = `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const historyPath = `users/${profile.uid}/matchHistory/${matchId}`;
  try {
    await setDoc(doc(db, 'users', profile.uid, 'matchHistory', matchId), {
      ownerId: profile.uid,
      mode: match.mode.slice(0, 40),
      isMultiplayer: match.isMultiplayer,
      categorySummary: match.categorySummary.slice(0, 120),
      score: match.score,
      correctCount: match.correctCount,
      totalCount: Math.max(1, match.totalCount),
      won: match.won,
      xpEarned: match.xpEarned + bonusXp,
      playedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, historyPath);
  }

  // If Daily Challenge, also submit official daily leaderboard entry (1 per day)
  if (options?.isDaily && options.dailyDateKey) {
    const dailyPath = `dailyChallenges/${options.dailyDateKey}/entries/${profile.uid}`;
    const dailyRef = doc(db, 'dailyChallenges', options.dailyDateKey, 'entries', profile.uid);
    try {
      const existing = await getDoc(dailyRef);
      if (!existing.exists()) {
        await setDoc(dailyRef, {
          userId: profile.uid,
          displayName: profile.displayName,
          avatarId: profile.avatarId,
          score: match.score,
          correctCount: match.correctCount,
          totalCount: Math.max(1, match.totalCount),
          completedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, dailyPath);
    }
  }

  return { updatedProfile, newlyUnlocked };
}

export async function fetchMatchHistory(uid: string): Promise<MatchResultSummary[]> {
  const path = `users/${uid}/matchHistory`;
  try {
    const q = query(
      collection(db, 'users', uid, 'matchHistory'),
      where('ownerId', '==', uid),
      orderBy('playedAt', 'desc'),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      const playedAtTs = data.playedAt as { toDate?: () => Date } | undefined;
      return {
        id: d.id,
        mode: String(data.mode || 'classic'),
        isMultiplayer: Boolean(data.isMultiplayer),
        categorySummary: String(data.categorySummary || 'ALL'),
        score: Number(data.score || 0),
        correctCount: Number(data.correctCount || 0),
        totalCount: Number(data.totalCount || 1),
        bestStreak: Number(data.bestStreak || 0),
        won: Boolean(data.won),
        xpEarned: Number(data.xpEarned || 0),
        playedAt: playedAtTs?.toDate ? playedAtTs.toDate().toISOString() : new Date().toISOString(),
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function fetchGlobalLeaderboard(): Promise<PublicUserProfile[]> {
  const path = 'users';
  try {
    const q = query(
      collection(db, 'users'),
      where('totalScore', '>=', 0),
      orderBy('totalScore', 'desc'),
      limit(25)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as PublicUserProfile);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function fetchDailyLeaderboard(dateKey: string): Promise<
  Array<{
    userId: string;
    displayName: string;
    avatarId: string;
    score: number;
    correctCount: number;
    totalCount: number;
  }>
> {
  const path = `dailyChallenges/${dateKey}/entries`;
  try {
    const q = query(
      collection(db, 'dailyChallenges', dateKey, 'entries'),
      where('score', '>=', 0),
      orderBy('score', 'desc'),
      limit(25)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        userId: String(data.userId),
        displayName: String(data.displayName),
        avatarId: String(data.avatarId),
        score: Number(data.score || 0),
        correctCount: Number(data.correctCount || 0),
        totalCount: Number(data.totalCount || 10),
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function hasCompletedDailyToday(uid: string, dateKey: string): Promise<boolean> {
  const path = `dailyChallenges/${dateKey}/entries/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'dailyChallenges', dateKey, 'entries', uid));
    return snap.exists();
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function searchPlayersByName(searchTerm: string): Promise<PublicUserProfile[]> {
  const path = 'users';
  const term = searchTerm.trim().toLowerCase();
  if (!term) return [];
  try {
    const q = query(collection(db, 'users'), where('totalScore', '>=', 0), limit(50));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => d.data() as PublicUserProfile)
      .filter(
        (u) =>
          u.displayName.toLowerCase().includes(term) ||
          u.uid.toLowerCase().startsWith(term)
      )
      .slice(0, 10);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function sendFriendOrRoomRequest(params: {
  fromProfile: PublicUserProfile;
  toUid: string;
  kind: 'friend_request' | 'room_invite';
  roomCode?: string;
}) {
  const reqId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const path = `friendRequests/${reqId}`;
  try {
    await setDoc(doc(db, 'friendRequests', reqId), {
      fromUid: params.fromProfile.uid,
      toUid: params.toUid,
      fromName: params.fromProfile.displayName,
      fromAvatarId: params.fromProfile.avatarId,
      kind: params.kind,
      ...(params.roomCode ? { roomCode: params.roomCode } : {}),
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function fetchFriendRequests(uid: string): Promise<FriendRequestRecord[]> {
  const path = 'friendRequests';
  try {
    const [incomingSnap, outgoingSnap] = await Promise.all([
      getDocs(query(collection(db, 'friendRequests'), where('toUid', '==', uid), limit(30))),
      getDocs(query(collection(db, 'friendRequests'), where('fromUid', '==', uid), limit(30))),
    ]);

    const combined = new Map<string, FriendRequestRecord>();
    for (const d of [...incomingSnap.docs, ...outgoingSnap.docs]) {
      const data = d.data();
      combined.set(d.id, {
        id: d.id,
        fromUid: String(data.fromUid),
        toUid: String(data.toUid),
        fromName: String(data.fromName),
        fromAvatarId: String(data.fromAvatarId),
        kind: (data.kind as 'friend_request' | 'room_invite') || 'friend_request',
        roomCode: data.roomCode ? String(data.roomCode) : undefined,
        status: (data.status as 'pending' | 'accepted' | 'declined') || 'pending',
      });
    }
    return Array.from(combined.values());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function respondToFriendRequest(
  requestId: string,
  status: 'accepted' | 'declined'
): Promise<void> {
  const path = `friendRequests/${requestId}`;
  try {
    await updateDoc(doc(db, 'friendRequests', requestId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function removeFriendRequest(requestId: string): Promise<void> {
  const path = `friendRequests/${requestId}`;
  try {
    await deleteDoc(doc(db, 'friendRequests', requestId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
