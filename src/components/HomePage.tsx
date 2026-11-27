import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Gamepad2,
  Grid2x2,
  Play,
  Sparkles,
  Trophy,
  Users,
  Volume2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/categories';
import { QUESTION_MODES } from '../data/questionModes';
import { fetchGlobalLeaderboard } from '../services/profileService';
import { PublicUserProfile, QuestionModeId } from '../types/game';
import { CategoryIcon } from './CategoryIcon';
import { ImageWithFallback } from './ImageWithFallback';
import { PlayerAvatar } from './PlayerAvatar';
import heroArtwork from '../assets/images/hero_arena_artwork_1795510800340.jpg';
import dailyEmblem from '../assets/images/daily_challenge_emblem_1795510802015.jpg';
import singleplayerArt from '../assets/images/mode_singleplayer_art_1795510800845.jpg';
import multiplayerArt from '../assets/images/mode_multiplayer_art_1795510802449.jpg';

export const HomePage: React.FC = () => {
  const {
    language,
    isRtl,
    t,
    navigateTo,
    updateMatchDraft,
    openPlayHub,
    setAutoStartSingleplayer,
    dailyCompletedToday,
    firebaseUser,
    userProfile,
    matchHistory,
  } = useApp();

  const [activeModeId, setActiveModeId] = useState<QuestionModeId>('guess_the_game');
  const [topPlayers, setTopPlayers] = useState<PublicUserProfile[]>([]);
  const [loadingLeaders, setLoadingLeaders] = useState(false);

  const DirectionalArrow = isRtl ? ArrowLeft : ArrowRight;
  const featuredCategories = CATEGORIES.filter((cat) => cat.featured);
  const activeMode = QUESTION_MODES.find((m) => m.id === activeModeId) ?? QUESTION_MODES[0];

  useEffect(() => {
    if (!firebaseUser) {
      setTopPlayers([]);
      return;
    }
    let mounted = true;
    setLoadingLeaders(true);
    fetchGlobalLeaderboard()
      .then((list) => {
        if (mounted) setTopPlayers(list.slice(0, 5));
      })
      .catch(() => {
        if (mounted) setTopPlayers([]);
      })
      .finally(() => {
        if (mounted) setLoadingLeaders(false);
      });
    return () => {
      mounted = false;
    };
  }, [firebaseUser]);

  const handleOpenDailyChallenge = () => {
    updateMatchDraft({ mode: 'daily_challenge' });
    setAutoStartSingleplayer(true);
    navigateTo('singleplayer');
  };

  return (
    <div className="space-y-12">
      {/* Hero Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-center py-2">
          <p className="text-xs sm:text-sm font-semibold text-[#29C7FF] tracking-wide mb-3">
            {t.home.heroEyebrow}
          </p>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.18] text-[#111428] dark:text-[#F5F5FA] max-w-2xl"
            style={{ textWrap: 'balance' }}
          >
            {t.home.heroTitle}
          </h1>
          <p className="mt-4 text-base text-slate-600 dark:text-[#9399B2] leading-relaxed max-w-xl">
            {t.home.heroLead}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openPlayHub}
              className="min-h-[48px] px-7 py-3 rounded-lg bg-[#8057FF] hover:bg-[#6D42F5] text-white text-sm sm:text-base font-extrabold transition-colors duration-150 inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29C7FF]"
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span>{t.home.startPlayingCta}</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('singleplayer')}
              className="min-h-[48px] px-5 py-3 rounded-lg bg-white dark:bg-[#12162A] hover:bg-slate-50 dark:hover:bg-[#171C36] text-[#111428] dark:text-[#F5F5FA] border border-slate-200 dark:border-white/12 text-sm font-semibold transition-colors duration-150 inline-flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8057FF]"
            >
              <Gamepad2 className="w-4 h-4 text-[#8057FF] shrink-0" />
              <span>{t.home.playSingleplayer}</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('multiplayer')}
              className="min-h-[48px] px-5 py-3 rounded-lg bg-white dark:bg-[#12162A] hover:bg-slate-50 dark:hover:bg-[#171C36] text-[#111428] dark:text-[#F5F5FA] border border-slate-200 dark:border-white/12 text-sm font-semibold transition-colors duration-150 inline-flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29C7FF]"
            >
              <Users className="w-4 h-4 text-[#29C7FF] shrink-0" />
              <span>{t.home.playMultiplayer}</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('categories')}
              className="min-h-[44px] px-3 py-2 text-sm font-semibold text-slate-700 dark:text-[#9399B2] hover:text-[#8057FF] dark:hover:text-[#29C7FF] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>{t.home.browseAllCategories}</span>
              <DirectionalArrow className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="h-full min-h-[240px] lg:min-h-[340px] rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-[#12162A] relative">
            <ImageWithFallback
              src={heroArtwork}
              alt={t.brandName}
              fallbackTitle={t.brandName}
              priority
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#0B0D19]/80 via-transparent to-transparent pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      {/* 4-Column Structural Platform Metrics Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/8">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#111428] dark:text-[#F5F5FA] tabular-nums">
            {t.home.statsStrip.categoriesValue}
          </div>
          <div className="text-xs sm:text-sm text-slate-500 dark:text-[#9399B2] mt-1">
            {t.home.statsStrip.categoriesTitle}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/8">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#29C7FF] tabular-nums">
            {t.home.statsStrip.subcategoriesValue}
          </div>
          <div className="text-xs sm:text-sm text-slate-500 dark:text-[#9399B2] mt-1">
            {t.home.statsStrip.subcategoriesTitle}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/8">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#8057FF] tabular-nums">
            {t.home.statsStrip.modesValue}
          </div>
          <div className="text-xs sm:text-sm text-slate-500 dark:text-[#9399B2] mt-1">
            {t.home.statsStrip.modesTitle}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/8">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#FFB547] tabular-nums">
            {t.home.statsStrip.languagesValue}
          </div>
          <div className="text-xs sm:text-sm text-slate-500 dark:text-[#9399B2] mt-1">
            {t.home.statsStrip.languagesTitle}
          </div>
        </div>
      </section>

      {/* Daily Challenge Spotlight + Mode Previews */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 bg-[#0B0D19]">
            <ImageWithFallback
              src={dailyEmblem}
              alt={t.home.dailySection.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold text-[#FFB547]">{t.home.dailySection.kicker}</span>
              {dailyCompletedToday && (
                <span className="text-xs font-semibold text-emerald-500 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.home.dailySection.completedToday}</span>
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-[#111428] dark:text-[#F5F5FA]">
              {t.home.dailySection.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-[#9399B2] mt-2 leading-relaxed">
              {t.home.dailySection.description}
            </p>
            <div className="mt-3 text-xs text-slate-500 dark:text-[#9399B2]">
              {t.home.dailySection.meta}
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleOpenDailyChallenge}
                className="min-h-[42px] px-4 py-2 rounded-lg bg-[#FFB547] hover:bg-[#F0A432] text-[#0B0D19] text-xs sm:text-sm font-bold transition-colors inline-flex items-center gap-2 whitespace-nowrap"
              >
                <Trophy className="w-4 h-4 shrink-0" />
                <span>{t.home.dailySection.action}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Singleplayer vs Multiplayer Quick Entry Cards */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <button
            type="button"
            onClick={() => navigateTo('singleplayer')}
            className="group text-start p-4 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 hover:border-[#8057FF]/60 transition-colors flex items-center gap-4"
          >
            <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-[#0B0D19] border border-slate-200 dark:border-white/8">
              <ImageWithFallback
                src={singleplayerArt}
                alt={t.nav.singleplayer}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-[#111428] dark:text-[#F5F5FA] group-hover:text-[#8057FF] transition-colors">
                {t.nav.singleplayer}
              </div>
              <div className="text-xs text-slate-500 dark:text-[#9399B2] mt-1 line-clamp-2">
                {t.singleplayerPage.subtitle}
              </div>
            </div>
            <DirectionalArrow className="w-4 h-4 text-slate-400 dark:text-[#9399B2] shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => navigateTo('multiplayer')}
            className="group text-start p-4 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 hover:border-[#29C7FF]/60 transition-colors flex items-center gap-4"
          >
            <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-[#0B0D19] border border-slate-200 dark:border-white/8">
              <ImageWithFallback
                src={multiplayerArt}
                alt={t.nav.multiplayer}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-[#111428] dark:text-[#F5F5FA] group-hover:text-[#29C7FF] transition-colors">
                {t.nav.multiplayer}
              </div>
              <div className="text-xs text-slate-500 dark:text-[#9399B2] mt-1 line-clamp-2">
                {t.multiplayerPage.subtitle}
              </div>
            </div>
            <DirectionalArrow className="w-4 h-4 text-slate-400 dark:text-[#9399B2] shrink-0" />
          </button>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#111428] dark:text-[#F5F5FA]">
              {t.home.featuredCategories.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-[#9399B2] mt-1">
              {t.home.featuredCategories.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('categories')}
            className="text-sm font-semibold text-[#8057FF] dark:text-[#29C7FF] hover:underline inline-flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
          >
            <Grid2x2 className="w-4 h-4 shrink-0" />
            <span>{t.home.featuredCategories.openExplorer}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredCategories.map((cat) => {
            const subCount = cat.clusters.reduce((sum, c) => sum + c.items.length, 0);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigateTo('categories', cat.id)}
                className="group text-start p-5 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/8 hover:border-[#8057FF]/60 transition-colors duration-150 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat.accentHex}1A`,
                        color: cat.accentHex,
                      }}
                    >
                      <CategoryIcon iconKey={cat.iconKey} className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono-tabular text-slate-500 dark:text-[#9399B2]">
                      #{String(cat.index).padStart(2, '0')} · {subCount} {t.common.subcategoriesLabel}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#111428] dark:text-[#F5F5FA] group-hover:text-[#8057FF] dark:group-hover:text-[#29C7FF] transition-colors">
                    {cat.name[language]}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9399B2] mt-1.5 line-clamp-2 leading-relaxed">
                    {cat.description[language]}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/6 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-[#9399B2]">
                  <span className="truncate">
                    {cat.clusters[0]?.items
                      .slice(0, 3)
                      .map((item) => item[language])
                      .join(' · ')}
                  </span>
                  <DirectionalArrow className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-[#8057FF] dark:group-hover:text-[#29C7FF] transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Popular Question Modes (Interactive Selector + Inspector) */}
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-[#111428] dark:text-[#F5F5FA]">
            {t.home.questionModes.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-[#9399B2] mt-1">
            {t.home.questionModes.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUESTION_MODES.map((mode) => {
              const isSelected = mode.id === activeMode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setActiveModeId(mode.id)}
                  className={`text-start p-4 rounded-xl border transition-colors duration-150 ${
                    isSelected
                      ? 'bg-[#8057FF] text-white border-[#8057FF]'
                      : 'bg-white dark:bg-[#12162A] text-[#111428] dark:text-[#F5F5FA] border-slate-200 dark:border-white/8 hover:border-[#8057FF]/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold">{mode.name[language]}</span>
                    <span
                      className={`text-xs font-mono-tabular ${
                        isSelected ? 'text-white/85' : 'text-slate-500 dark:text-[#9399B2]'
                      }`}
                    >
                      {mode.defaultTimeSec} {t.common.secondsShort}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-1.5 ${
                      isSelected ? 'text-white/85' : 'text-slate-500 dark:text-[#9399B2]'
                    }`}
                  >
                    {mode.tagline[language]}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-5 p-6 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-white/8">
              <div>
                <h3 className="text-lg font-bold text-[#111428] dark:text-[#F5F5FA]">
                  {activeMode.name[language]}
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#9399B2] mt-0.5">
                  {activeMode.tagline[language]}
                </p>
              </div>
              {activeMode.id === 'guess_the_sound' ? (
                <Volume2 className="w-5 h-5 text-[#29C7FF] shrink-0" />
              ) : (
                <Sparkles className="w-5 h-5 text-[#8057FF] shrink-0" />
              )}
            </div>

            <p className="text-sm text-slate-600 dark:text-[#9399B2] leading-relaxed mt-4">
              {activeMode.description[language]}
            </p>

            <div className="mt-5">
              <div className="text-xs font-semibold text-[#111428] dark:text-[#F5F5FA] mb-2">
                {t.home.questionModes.mechanicsHeading}
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-[#9399B2]">
                {activeMode.mechanics.map((mech, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#29C7FF] shrink-0" />
                    <span>{mech[language]}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/8 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-[#9399B2] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t.home.questionModes.timeLabel}</span>
                </div>
                <div className="text-base font-bold text-[#111428] dark:text-[#F5F5FA] mt-0.5 tabular-nums">
                  {activeMode.defaultTimeSec} {t.common.secondsShort}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-[#9399B2]">
                  {t.home.questionModes.pointsLabel}
                </div>
                <div className="text-base font-bold text-[#FFB547] mt-0.5 tabular-nums">
                  {activeMode.basePoints} {t.common.pointsShort}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Global Leaderboard Preview + Player Stats & Match Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-white/8">
              <div>
                <h2 className="text-lg font-bold text-[#111428] dark:text-[#F5F5FA]">
                  {t.home.communitySplit.leaderboardTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#9399B2] mt-0.5">
                  {t.home.communitySplit.leaderboardSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('leaderboard')}
                className="text-xs font-semibold text-[#8057FF] dark:text-[#29C7FF] hover:underline whitespace-nowrap"
              >
                {t.home.communitySplit.viewLeaderboard}
              </button>
            </div>

            {!firebaseUser ? (
              <div className="py-6 space-y-4">
                <p className="text-sm text-slate-600 dark:text-[#9399B2] leading-relaxed">
                  {t.home.communitySplit.leaderboardSignInPrompt}
                </p>
                <button
                  type="button"
                  onClick={() => navigateTo('profile')}
                  className="min-h-[40px] px-4 py-2 rounded-lg bg-[#8057FF] hover:bg-[#6D42F5] text-white text-xs font-bold whitespace-nowrap"
                >
                  {t.nav.signIn}
                </button>
              </div>
            ) : loadingLeaders ? (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-[#9399B2]">
                {t.common.loading}
              </div>
            ) : topPlayers.length === 0 ? (
              <div className="py-6">
                <h3 className="text-sm font-bold text-[#111428] dark:text-[#F5F5FA]">
                  {t.home.communitySplit.leaderboardEmptyTitle}
                </h3>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/6 mt-2">
                {topPlayers.map((player, index) => (
                  <div key={player.uid} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 text-xs font-mono-tabular font-bold text-slate-500 dark:text-[#9399B2]">
                        #{index + 1}
                      </span>
                      <PlayerAvatar avatarId={player.avatarId} size="sm" />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-[#111428] dark:text-[#F5F5FA] truncate">
                          {player.displayName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-[#9399B2] tabular-nums">
                          {t.profilePage.levelLabel} {player.level}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-extrabold text-[#FFB547] font-mono-tabular shrink-0">
                      {player.totalScore} {t.common.pointsShort}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-white/8">
              <div>
                <h2 className="text-lg font-bold text-[#111428] dark:text-[#F5F5FA]">
                  {t.home.communitySplit.activityTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#9399B2] mt-0.5">
                  {t.home.communitySplit.activitySubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('profile')}
                className="text-xs font-semibold text-[#8057FF] dark:text-[#29C7FF] hover:underline whitespace-nowrap"
              >
                {t.home.communitySplit.viewProfile}
              </button>
            </div>

            {userProfile ? (
              <div className="pt-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/8">
                    <div className="text-[11px] text-slate-500 dark:text-[#9399B2]">
                      {t.profilePage.levelLabel}
                    </div>
                    <div className="text-lg font-extrabold text-[#8057FF] tabular-nums">
                      {userProfile.level}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/8">
                    <div className="text-[11px] text-slate-500 dark:text-[#9399B2]">
                      {t.profilePage.xpLabel}
                    </div>
                    <div className="text-lg font-extrabold text-[#29C7FF] tabular-nums">
                      {userProfile.xp}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/8">
                    <div className="text-[11px] text-slate-500 dark:text-[#9399B2]">
                      {t.profilePage.winsLabel}
                    </div>
                    <div className="text-lg font-extrabold text-emerald-500 tabular-nums">
                      {userProfile.wins}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/8">
                    <div className="text-[11px] text-slate-500 dark:text-[#9399B2]">
                      {t.profilePage.bestScoreLabel}
                    </div>
                    <div className="text-lg font-extrabold text-[#FFB547] tabular-nums">
                      {userProfile.bestScore}
                    </div>
                  </div>
                </div>

                {matchHistory.length > 0 && (
                  <div className="divide-y divide-slate-100 dark:divide-white/6">
                    {matchHistory.slice(0, 3).map((m) => (
                      <div key={m.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                        <span className="font-semibold text-[#111428] dark:text-[#F5F5FA] truncate">
                          {m.mode} · {m.categorySummary}
                        </span>
                        <span className="font-mono-tabular font-bold text-[#FFB547] shrink-0">
                          {m.score} {t.common.pointsShort}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : matchHistory.length > 0 ? (
              <div className="pt-4 space-y-3">
                <div className="divide-y divide-slate-100 dark:divide-white/6">
                  {matchHistory.slice(0, 3).map((m) => (
                    <div key={m.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                      <span className="font-semibold text-[#111428] dark:text-[#F5F5FA] truncate">
                        {m.mode} · {m.correctCount}/{m.totalCount}
                      </span>
                      <span className="font-mono-tabular font-bold text-[#FFB547] shrink-0">
                        {m.score} {t.common.pointsShort}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('profile')}
                  className="text-xs font-bold text-[#8057FF] dark:text-[#29C7FF] hover:underline"
                >
                  {t.nav.signIn}
                </button>
              </div>
            ) : (
              <div className="py-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#111428] dark:text-[#F5F5FA]">
                    {t.home.communitySplit.activityEmptyTitle}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-[#9399B2] mt-1.5 leading-relaxed">
                    {t.home.communitySplit.activityEmptyBody}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openPlayHub}
                  className="min-h-[40px] px-4 py-2 rounded-lg bg-[#8057FF] hover:bg-[#6D42F5] text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span>{t.home.startPlayingCta}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
