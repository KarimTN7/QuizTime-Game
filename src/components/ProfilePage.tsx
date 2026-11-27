import React, { useState } from 'react';
import {
  Award,
  Check,
  Flame,
  Lock,
  LogIn,
  LogOut,
  Search,
  Trophy,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  logoutFirebaseUser,
  registerWithEmail,
  signInWithEmail,
  signInWithGoogle,
} from '../services/firebaseClient';
import {
  ACHIEVEMENT_DEFS,
  removeFriendRequest,
  respondToFriendRequest,
  searchPlayersByName,
  sendFriendOrRoomRequest,
  updateProfileIdentity,
} from '../services/profileService';
import { PublicUserProfile } from '../types/game';
import { AVATAR_CATALOG, PlayerAvatar } from './PlayerAvatar';

export const ProfilePage: React.FC = () => {
  const {
    language,
    t,
    firebaseUser,
    userProfile,
    authLoading,
    matchHistory,
    friendRequests,
    refreshProfileAndSocial,
    navigateTo,
    setPendingJoinRoomCode,
  } = useApp();

  const [authTab, setAuthTab] = useState<'email' | 'register'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  const [friendSearch, setFriendSearch] = useState('');
  const [searchResults, setSearchResults] = useState<PublicUserProfile[]>([]);
  const [searching, setSearching] = useState(false);

  const activeName = editName || userProfile?.displayName || '';
  const activeAvatar = editAvatar || userProfile?.avatarId || 'prism_violet';

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);
    try {
      if (authTab === 'email') {
        await signInWithEmail(email.trim(), password);
      } else {
        await registerWithEmail(email.trim(), password, registerName.trim() || 'Player');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      if (msg.includes('operation-not-allowed')) {
        setAuthError(t.profilePage.emailProviderHelp);
      } else {
        setAuthError(msg);
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setProfileSaving(true);
    setProfileSavedMsg(false);
    try {
      await updateProfileIdentity(userProfile.uid, activeName, activeAvatar);
      await refreshProfileAndSocial();
      setProfileSavedMsg(true);
      setTimeout(() => setProfileSavedMsg(false), 2500);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSearchPlayers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendSearch.trim()) return;
    setSearching(true);
    try {
      const res = await searchPlayersByName(friendSearch);
      setSearchResults(res.filter((u) => u.uid !== firebaseUser?.uid));
    } finally {
      setSearching(false);
    }
  };

  if (authLoading) {
    return (
      <div className="p-10 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 text-center text-sm text-slate-500 dark:text-[#9399B2]">
        {t.common.loading}
      </div>
    );
  }

  // ========================
  // UNAUTHENTICATED VIEW
  // ========================
  if (!firebaseUser || !userProfile) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111428] dark:text-[#F5F5FA]">
            {t.profilePage.signInTitle}
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#9399B2]">
            {t.profilePage.signInDesc}
          </p>
        </header>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 space-y-6">
          {authError && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/35 text-xs sm:text-sm text-rose-600 dark:text-rose-400">
              {authError}
            </div>
          )}

          <button
            type="button"
            disabled={authBusy}
            onClick={() => void handleGoogleSignIn()}
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#8057FF] hover:bg-[#6D42F5] disabled:opacity-60 text-white text-sm font-extrabold transition-colors inline-flex items-center justify-center gap-2.5"
          >
            <LogIn className="w-4 h-4" />
            <span>{t.profilePage.googleSignInBtn}</span>
          </button>

          <div className="border-t border-slate-200 dark:border-white/8 pt-5 space-y-4">
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#0B0D19]">
              <button
                type="button"
                onClick={() => setAuthTab('email')}
                className={`py-2 rounded-md text-xs font-bold transition-colors ${
                  authTab === 'email'
                    ? 'bg-[#8057FF] text-white'
                    : 'text-slate-600 dark:text-[#9399B2]'
                }`}
              >
                {t.profilePage.emailTab}
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('register')}
                className={`py-2 rounded-md text-xs font-bold transition-colors ${
                  authTab === 'register'
                    ? 'bg-[#8057FF] text-white'
                    : 'text-slate-600 dark:text-[#9399B2]'
                }`}
              >
                {t.profilePage.registerTab}
              </button>
            </div>

            <form onSubmit={(e) => void handleEmailAuth(e)} className="space-y-3">
              {authTab === 'register' && (
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={30}
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder={t.profilePage.usernamePlaceholder}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/10 text-sm text-[#111428] dark:text-[#F5F5FA]"
                />
              )}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.profilePage.emailPlaceholder}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/10 text-sm text-[#111428] dark:text-[#F5F5FA]"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.profilePage.passwordPlaceholder}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/10 text-sm text-[#111428] dark:text-[#F5F5FA]"
              />
              <button
                type="submit"
                disabled={authBusy}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/15 text-white text-sm font-bold transition-colors"
              >
                {authTab === 'email'
                  ? t.profilePage.emailSubmitBtn
                  : t.profilePage.registerSubmitBtn}
              </button>
            </form>

            <p className="text-[11px] text-slate-500 dark:text-[#9399B2]">
              {t.profilePage.emailProviderHelp}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========================
  // AUTHENTICATED PROFILE DASHBOARD
  // ========================
  const nextLevelXp = Math.pow(userProfile.level, 2) * 100;
  const prevLevelXp = Math.pow(userProfile.level - 1, 2) * 100;
  const levelProgress = Math.max(
    0,
    Math.min(
      100,
      Math.round(((userProfile.xp - prevLevelXp) / Math.max(100, nextLevelXp - prevLevelXp)) * 100)
    )
  );

  const incomingRequests = friendRequests.filter(
    (r) => r.toUid === firebaseUser.uid && r.status === 'pending'
  );
  const acceptedFriends = friendRequests.filter(
    (r) => r.kind === 'friend_request' && r.status === 'accepted'
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <PlayerAvatar avatarId={userProfile.avatarId} size="lg" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111428] dark:text-[#F5F5FA]">
              {userProfile.displayName}
            </h1>
            <div className="text-xs font-mono-tabular text-slate-500 dark:text-[#9399B2] mt-1">
              {t.profilePage.levelLabel} {userProfile.level} · {userProfile.xp} XP · ID:{' '}
              {userProfile.uid.slice(0, 8)}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void logoutFirebaseUser()}
          className="min-h-[42px] px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold inline-flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.profilePage.signOutBtn}</span>
        </button>
      </header>

      {/* XP Bar & Stats Strip */}
      <section className="p-6 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#111428] dark:text-[#F5F5FA]">
              {t.profilePage.levelLabel} {userProfile.level}
            </span>
            <span className="font-mono-tabular text-[#29C7FF]">
              {userProfile.xp} / {nextLevelXp} XP
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-[#0B0D19] overflow-hidden">
            <div className="h-full bg-[#8057FF]" style={{ width: `${levelProgress}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-2 border-t border-slate-100 dark:border-white/8">
          <div>
            <div className="text-xl font-extrabold text-[#111428] dark:text-[#F5F5FA] tabular-nums">
              {userProfile.totalScore}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#9399B2]">
              {t.leaderboardPage.columns.score}
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-emerald-500 tabular-nums">
              {userProfile.wins}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#9399B2]">
              {t.profilePage.winsLabel}
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-rose-500 tabular-nums">
              {userProfile.losses}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#9399B2]">
              {t.profilePage.lossesLabel}
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#29C7FF] tabular-nums">
              {userProfile.bestScore}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#9399B2]">
              {t.profilePage.bestScoreLabel}
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#FFB547] tabular-nums inline-flex items-center gap-1">
              <Flame className="w-4 h-4" />
              {userProfile.currentStreak}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#9399B2]">
              {t.profilePage.streakLabel}
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#8057FF] tabular-nums">
              {userProfile.achievements.length}/{ACHIEVEMENT_DEFS.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#9399B2]">
              {t.profilePage.achievementsHeading}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Identity & Avatar Customization */}
        <section className="lg:col-span-6 p-6 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 space-y-5">
          <h2 className="text-base font-bold text-[#111428] dark:text-[#F5F5FA]">
            {t.profilePage.editProfileTitle}
          </h2>

          <form onSubmit={(e) => void handleSaveProfile(e)} className="space-y-4">
            <input
              type="text"
              minLength={2}
              maxLength={40}
              value={activeName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full min-h-[42px] px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/10 text-sm font-semibold text-[#111428] dark:text-[#F5F5FA]"
            />

            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-[#9399B2] mb-2.5">
                {t.profilePage.chooseAvatar}
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {AVATAR_CATALOG.map((av) => {
                  const unlocked =
                    userProfile.unlockedAvatars.includes(av.id) ||
                    userProfile.level >= av.unlockLevel;
                  const selected = activeAvatar === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => setEditAvatar(av.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-colors relative ${
                        selected
                          ? 'border-[#8057FF] bg-[#8057FF]/10'
                          : 'border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-[#0B0D19] disabled:opacity-45'
                      }`}
                    >
                      <PlayerAvatar avatarId={av.id} size="sm" />
                      <span className="text-[10px] font-semibold text-center truncate w-full text-[#111428] dark:text-[#F5F5FA]">
                        {unlocked
                          ? av.label[language]
                          : `${t.profilePage.lockedAvatarLvl} ${av.unlockLevel}`}
                      </span>
                      {!unlocked && (
                        <Lock className="w-3 h-3 text-slate-400 absolute top-1.5 end-1.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={profileSaving}
                className="min-h-[42px] px-5 py-2 rounded-lg bg-[#8057FF] hover:bg-[#6D42F5] text-white text-xs font-bold"
              >
                {t.profilePage.saveProfileBtn}
              </button>
              {profileSavedMsg && (
                <span className="text-xs font-bold text-emerald-500 inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {t.profilePage.profileSaved}
                </span>
              )}
            </div>
          </form>
        </section>

        {/* Friends & Room Invites */}
        <section className="lg:col-span-6 p-6 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 space-y-5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#29C7FF]" />
            <h2 className="text-base font-bold text-[#111428] dark:text-[#F5F5FA]">
              {t.profilePage.friendsHeading}
            </h2>
          </div>

          <form onSubmit={(e) => void handleSearchPlayers(e)} className="flex gap-2">
            <input
              type="text"
              value={friendSearch}
              onChange={(e) => setFriendSearch(e.target.value)}
              placeholder={t.profilePage.searchFriendsPlaceholder}
              className="flex-1 min-w-0 min-h-[40px] px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/10 text-xs text-[#111428] dark:text-[#F5F5FA]"
            />
            <button
              type="submit"
              disabled={searching}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-[#29C7FF] text-[#0B0D19] text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t.profilePage.searchBtn}</span>
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 dark:border-white/8 pt-3">
              {searchResults.map((u) => (
                <div key={u.uid} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <PlayerAvatar avatarId={u.avatarId} size="sm" />
                    <span className="font-bold text-[#111428] dark:text-[#F5F5FA]">
                      {u.displayName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      void sendFriendOrRoomRequest({
                        fromProfile: userProfile,
                        toUid: u.uid,
                        kind: 'friend_request',
                      }).then(() => refreshProfileAndSocial())
                    }
                    className="px-3 py-1.5 rounded-lg bg-[#8057FF] text-white font-bold inline-flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t.profilePage.addFriendBtn}</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {incomingRequests.length > 0 && (
            <div className="space-y-2.5 border-t border-slate-100 dark:border-white/8 pt-3">
              <div className="text-xs font-bold text-[#FFB547]">
                {t.profilePage.pendingRequestsHeading}
              </div>
              {incomingRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <PlayerAvatar avatarId={req.fromAvatarId} size="sm" />
                    <span className="font-bold text-[#111428] dark:text-[#F5F5FA]">
                      {req.fromName}
                      {req.kind === 'room_invite' && req.roomCode ? ` · ${req.roomCode}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {req.kind === 'room_invite' && req.roomCode ? (
                      <button
                        type="button"
                        onClick={() => {
                          void respondToFriendRequest(req.id, 'accepted');
                          setPendingJoinRoomCode(req.roomCode!);
                          navigateTo('multiplayer');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#8057FF] text-white font-bold"
                      >
                        {t.profilePage.joinInviteBtn}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          void respondToFriendRequest(req.id, 'accepted').then(() =>
                            refreshProfileAndSocial()
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-bold"
                      >
                        {t.profilePage.acceptBtn}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        void respondToFriendRequest(req.id, 'declined').then(() =>
                          refreshProfileAndSocial()
                        )
                      }
                      className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-[#9399B2]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {acceptedFriends.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 dark:border-white/8 pt-3">
              {acceptedFriends.map((req) => (
                <div key={req.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#111428] dark:text-[#F5F5FA]">
                    {req.fromUid === firebaseUser.uid ? req.toUid.slice(0, 10) : req.fromName}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      void removeFriendRequest(req.id).then(() => refreshProfileAndSocial())
                    }
                    className="text-rose-500 hover:underline font-semibold"
                  >
                    {t.profilePage.removeFriendBtn}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Achievements + Match History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 p-6 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/8 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/8">
            <Award className="w-4 h-4 text-[#FFB547]" />
            <h2 className="text-base font-bold text-[#111428] dark:text-[#F5F5FA]">
              {t.profilePage.achievementsHeading}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACHIEVEMENT_DEFS.map((def) => {
              const unlocked = userProfile.achievements.includes(def.id);
              const copy = t.profilePage.achievements[def.id];
              return (
                <div
                  key={def.id}
                  className={`p-3 rounded-lg border ${
                    unlocked
                      ? 'bg-[#FFB547]/10 border-[#FFB547]/40'
                      : 'bg-slate-50 dark:bg-[#0B0D19] border-slate-200 dark:border-white/8 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#111428] dark:text-[#F5F5FA]">
                      {copy?.title ?? def.id}
                    </span>
                    {unlocked && <Trophy className="w-3.5 h-3.5 text-[#FFB547] shrink-0" />}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-[#9399B2] mt-1">
                    {copy?.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-6 p-6 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/8 space-y-4">
          <h2 className="text-base font-bold text-[#111428] dark:text-[#F5F5FA] pb-3 border-b border-slate-100 dark:border-white/8">
            {t.profilePage.historyHeading}
          </h2>

          {matchHistory.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-[#9399B2] py-4">
              {t.profilePage.noHistory}
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/8">
              {matchHistory.slice(0, 10).map((m) => (
                <div key={m.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-[#111428] dark:text-[#F5F5FA]">
                      {m.mode} · {m.categorySummary}
                    </div>
                    <div className="text-slate-500 dark:text-[#9399B2]">
                      {m.correctCount}/{m.totalCount} · +{m.xpEarned} XP
                    </div>
                  </div>
                  <span className="font-mono-tabular font-bold text-[#29C7FF]">
                    {m.score} {t.common.pointsShort}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
