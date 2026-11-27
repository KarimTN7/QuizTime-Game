import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  Check,
  Clock,
  Flame,
  Gamepad2,
  Grid2x2,
  Heart,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Trophy,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/categories';
import { QUESTION_MODES } from '../data/questionModes';
import {
  ALL_QUESTIONS,
  getUtcDateKey,
  sanitizeQuestionForClient,
  selectDailyQuestions,
  selectQuestionsForMatch,
} from '../shared/questionBank';
import {
  DifficultyLevel,
  QuestionModeId,
  SingleplayerModeId,
  TriviaQuestion,
} from '../types/game';
import { soundEngine } from '../utils/soundEngine';
import { QuestionArenaCard } from './QuestionArenaCard';

type SoloPhase = 'SETUP' | 'PLAYING' | 'PAUSED' | 'FINISHED';

export const SingleplayerPage: React.FC = () => {
  const {
    language,
    t,
    settings,
    matchDraft,
    updateMatchDraft,
    navigateTo,
    matchHistory,
    dailyCompletedToday,
    recordMatchOutcome,
    autoStartSingleplayer,
    setAutoStartSingleplayer,
  } = useApp();

  const [phase, setPhase] = useState<SoloPhase>('SETUP');
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(20);
  const [timeAttackLeft, setTimeAttackLeft] = useState(90);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  const [xpEarned, setXpEarned] = useState(0);

  const recentQuestionIdsRef = useRef<string[]>([]);

  const singleplayerModes: SingleplayerModeId[] = [
    'classic',
    'endless',
    'time_attack',
    'practice',
    'daily_challenge',
    'category_challenge',
  ];

  const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];
  const roundOptions = [5, 10, 15, 20];
  const timeOptions = [10, 15, 20, 30];

  // Available specific topics based on currently selected categories
  const availableTopics = useMemo(() => {
    const topicSet = new Set<string>();
    for (const q of ALL_QUESTIONS) {
      if (
        matchDraft.allCategoriesSelected ||
        matchDraft.selectedCategoryIds.length === 0 ||
        matchDraft.selectedCategoryIds.includes(q.categoryId)
      ) {
        topicSet.add(q.topicTag);
      }
    }
    return Array.from(topicSet);
  }, [matchDraft.allCategoriesSelected, matchDraft.selectedCategoryIds]);

  const startMatch = useCallback(() => {
    const isDaily = matchDraft.mode === 'daily_challenge';
    const isEndless = matchDraft.mode === 'endless';
    const isTimeAttack = matchDraft.mode === 'time_attack';

    const pool = isDaily
      ? selectDailyQuestions(getUtcDateKey())
      : selectQuestionsForMatch({
          allCategoriesSelected: matchDraft.allCategoriesSelected,
          selectedCategoryIds: matchDraft.selectedCategoryIds,
          selectedTopics: matchDraft.selectedTopics,
          selectedQuestionTypes: matchDraft.selectedQuestionTypes,
          difficulty: matchDraft.difficulty,
          count: isEndless || isTimeAttack ? Math.min(25, ALL_QUESTIONS.length) : matchDraft.rounds,
          excludeIds: recentQuestionIdsRef.current,
        });

    recentQuestionIdsRef.current = [
      ...recentQuestionIdsRef.current,
      ...pool.map((q) => q.id),
    ].slice(-60);

    setQuestions(pool);
    setCurrentIdx(0);
    setSelectedOption(null);
    setRevealed(false);
    setScore(0);
    setCorrectCount(0);
    setAnsweredCount(0);
    setStreak(0);
    setBestStreak(0);
    setLives(3);
    setTimeLeft(matchDraft.timeLimitSec);
    setTimeAttackLeft(Math.max(60, matchDraft.rounds * 8));
    setNewlyUnlocked([]);
    setXpEarned(0);
    setPhase('PLAYING');
  }, [matchDraft]);

  useEffect(() => {
    if (autoStartSingleplayer) {
      setAutoStartSingleplayer(false);
      startMatch();
    }
  }, [autoStartSingleplayer, setAutoStartSingleplayer, startMatch]);

  const finishMatch = useCallback(
    async (
      finalScore: number,
      finalCorrect: number,
      finalAnswered: number,
      finalBestStreak: number
    ) => {
      setPhase('FINISHED');
      soundEngine.playVictory(settings.soundVolume);

      const totalCount = Math.max(1, finalAnswered || questions.length);
      const earnedXp = Math.max(25, Math.round(finalScore * 0.12) + finalCorrect * 15);
      setXpEarned(earnedXp);

      const won = finalCorrect >= Math.ceil(totalCount * 0.5);
      const isDaily = matchDraft.mode === 'daily_challenge';
      const categorySummary = isDaily
        ? 'Daily Challenge'
        : matchDraft.allCategoriesSelected
          ? 'ALL'
          : matchDraft.selectedCategoryIds.join(', ') || 'ALL';

      const unlocked = await recordMatchOutcome(
        {
          mode: matchDraft.mode,
          isMultiplayer: false,
          categorySummary,
          score: finalScore,
          correctCount: finalCorrect,
          totalCount,
          bestStreak: finalBestStreak,
          won,
          xpEarned: earnedXp,
        },
        {
          isDaily,
          primaryCategoryId: matchDraft.selectedCategoryIds[0] || 'gaming',
        }
      );
      setNewlyUnlocked(unlocked);
    },
    [matchDraft, questions.length, recordMatchOutcome, settings.soundVolume]
  );

  const activeQuestion = questions[currentIdx] ?? null;

  // Per-question countdown timer (Classic, Endless, Daily, Category Challenge)
  useEffect(() => {
    if (phase !== 'PLAYING' || revealed || !activeQuestion) return;
    if (matchDraft.mode === 'practice' || matchDraft.mode === 'time_attack') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRevealed(true);
          setAnsweredCount((c) => c + 1);
          setStreak(0);
          soundEngine.playWrong(settings.soundVolume);
          if (matchDraft.mode === 'endless') {
            setLives((l) => Math.max(0, l - 1));
          }
          return 0;
        }
        if (prev <= 4) {
          soundEngine.playTick(settings.soundVolume);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, revealed, activeQuestion, matchDraft.mode, settings.soundVolume]);

  // Master clock for Time Attack mode
  useEffect(() => {
    if (phase !== 'PLAYING' || matchDraft.mode !== 'time_attack') return;
    const interval = setInterval(() => {
      setTimeAttackLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          void finishMatch(score, correctCount, answeredCount, bestStreak);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, matchDraft.mode, finishMatch, score, correctCount, answeredCount, bestStreak]);

  const handleSelectOption = (optionIdx: number) => {
    if (revealed || phase !== 'PLAYING' || !activeQuestion) return;

    setSelectedOption(optionIdx);
    setRevealed(true);
    const nextAnswered = answeredCount + 1;
    setAnsweredCount(nextAnswered);

    const isCorrect = optionIdx === activeQuestion.correctIndex;
    if (isCorrect) {
      const nextStreak = streak + 1;
      const nextBestStreak = Math.max(bestStreak, nextStreak);
      const timeBonus =
        matchDraft.mode === 'practice' || matchDraft.mode === 'time_attack'
          ? 25
          : Math.round(activeQuestion.points * 0.4 * (timeLeft / Math.max(1, matchDraft.timeLimitSec)));
      const streakBonus = Math.min(100, (nextStreak - 1) * 20);
      const delta = activeQuestion.points + timeBonus + streakBonus;

      setScore((s) => s + delta);
      setCorrectCount((c) => c + 1);
      setStreak(nextStreak);
      setBestStreak(nextBestStreak);
      soundEngine.playCorrect(settings.soundVolume);
    } else {
      setStreak(0);
      soundEngine.playWrong(settings.soundVolume);
      if (matchDraft.mode === 'endless') {
        const nextLives = lives - 1;
        setLives(nextLives);
        if (nextLives <= 0) {
          setTimeout(() => {
            void finishMatch(score, correctCount, nextAnswered, bestStreak);
          }, 900);
        }
      }
    }
  };

  const handleAdvance = () => {
    if (matchDraft.mode === 'endless' && lives <= 0) {
      void finishMatch(score, correctCount, answeredCount, bestStreak);
      return;
    }

    if (currentIdx + 1 >= questions.length) {
      void finishMatch(score, correctCount, answeredCount, bestStreak);
      return;
    }

    setCurrentIdx((idx) => idx + 1);
    setSelectedOption(null);
    setRevealed(false);
    setTimeLeft(matchDraft.timeLimitSec);
  };

  const toggleQuestionType = (id: QuestionModeId) => {
    const current = matchDraft.selectedQuestionTypes;
    const exists = current.includes(id);
    if (exists && current.length === 1) return;
    updateMatchDraft({
      selectedQuestionTypes: exists ? current.filter((x) => x !== id) : [...current, id],
    });
  };

  const toggleTopic = (topic: string) => {
    const current = matchDraft.selectedTopics;
    const exists = current.includes(topic);
    updateMatchDraft({
      selectedTopics: exists ? current.filter((x) => x !== topic) : [...current, topic],
    });
  };

  const selectedCategoryNames = matchDraft.selectedCategoryIds
    .map((id) => CATEGORIES.find((c) => c.id === id)?.name[language])
    .filter(Boolean);

  // ========================
  // ACTIVE GAMEPLAY OR PAUSED VIEW
  // ========================
  if ((phase === 'PLAYING' || phase === 'PAUSED') && activeQuestion) {
    const isPractice = matchDraft.mode === 'practice';
    const isTimeAttack = matchDraft.mode === 'time_attack';
    const timerDisplay = isTimeAttack ? timeAttackLeft : timeLeft;
    const timerRatio = isTimeAttack
      ? Math.max(0, Math.min(100, (timeAttackLeft / Math.max(60, matchDraft.rounds * 8)) * 100))
      : Math.max(0, Math.min(100, (timeLeft / Math.max(1, matchDraft.timeLimitSec)) * 100));

    return (
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Compact HUD */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-bold tabular-nums">
              <span className="text-[#111428] dark:text-[#F5F5FA]">
                {t.gameplay.questionOf} {currentIdx + 1} / {questions.length}
              </span>
              <span className="text-[#29C7FF]">
                {t.gameplay.scoreLabel}: {score}
              </span>
              <span className="text-[#FFB547] inline-flex items-center gap-1">
                <Flame className="w-4 h-4" />
                {streak}
              </span>
              {matchDraft.mode === 'endless' && (
                <span className="text-rose-500 inline-flex items-center gap-1">
                  <Heart className="w-4 h-4 fill-current" />
                  {lives}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isPractice && (
                <div
                  className={`px-3 py-1.5 rounded-lg font-mono-tabular text-sm font-extrabold ${
                    timerDisplay <= 5
                      ? 'bg-rose-500/15 text-rose-500'
                      : 'bg-slate-100 dark:bg-[#0B0D19] text-[#111428] dark:text-[#F5F5FA]'
                  }`}
                >
                  {timerDisplay} {t.common.secondsShort}
                </div>
              )}

              <button
                type="button"
                onClick={() => setPhase(phase === 'PAUSED' ? 'PLAYING' : 'PAUSED')}
                className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0B0D19] hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-[#111428] dark:text-[#F5F5FA] inline-flex items-center gap-1.5"
              >
                {phase === 'PAUSED' ? (
                  <Play className="w-3.5 h-3.5" />
                ) : (
                  <Pause className="w-3.5 h-3.5" />
                )}
                <span>{phase === 'PAUSED' ? t.gameplay.resumeBtn : t.gameplay.pauseBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => void finishMatch(score, correctCount, answeredCount, bestStreak)}
                className="min-h-[38px] px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold"
              >
                {t.gameplay.quitBtn}
              </button>
            </div>
          </div>

          {!isPractice && (
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-[#0B0D19] overflow-hidden">
              <div
                className="h-full bg-[#8057FF] transition-all duration-300"
                style={{ width: `${timerRatio}%` }}
              />
            </div>
          )}
        </div>

        {/* Pause Curtain vs Active Question */}
        {phase === 'PAUSED' ? (
          <div className="p-10 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 text-center space-y-4">
            <h2 className="text-xl font-bold text-[#111428] dark:text-[#F5F5FA]">
              {t.gameplay.pausedTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-[#9399B2] max-w-md mx-auto">
              {t.gameplay.pausedBody}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPhase('PLAYING')}
                className="min-h-[44px] px-6 py-2.5 rounded-lg bg-[#8057FF] text-white text-sm font-bold inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>{t.gameplay.resumeBtn}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <QuestionArenaCard
              question={sanitizeQuestionForClient(activeQuestion)}
              selectedOptionIndex={selectedOption}
              locked={revealed}
              onSelectOption={handleSelectOption}
              reveal={
                revealed
                  ? {
                      correctIndex: activeQuestion.correctIndex,
                      explanation: activeQuestion.explanation,
                    }
                  : null
              }
              streakCount={streak}
            />

            {revealed && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAdvance}
                  className="min-h-[46px] px-7 py-3 rounded-xl bg-[#8057FF] hover:bg-[#6D42F5] text-white text-sm font-bold transition-colors"
                >
                  {currentIdx + 1 >= questions.length || (matchDraft.mode === 'endless' && lives <= 0)
                    ? t.gameplay.finishMatch
                    : t.gameplay.nextQuestion}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ========================
  // FINAL RESULTS SCREEN
  // ========================
  if (phase === 'FINISHED') {
    const denom = Math.max(1, answeredCount || questions.length);
    const accuracy = Math.round((correctCount / denom) * 100);

    return (
      <div className="max-w-2xl mx-auto rounded-2xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#FFB547]/15 text-[#FFB547] flex items-center justify-center mx-auto">
            <Trophy className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111428] dark:text-[#F5F5FA]">
            {t.gameplay.resultsTitle}
          </h1>
          <div className="text-4xl font-extrabold text-[#8057FF] font-mono-tabular pt-1">
            {score} {t.common.pointsShort}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/8 text-center">
            <div className="text-xl font-extrabold text-[#29C7FF] font-mono-tabular">
              {accuracy}%
            </div>
            <div className="text-xs text-slate-500 dark:text-[#9399B2] mt-1">
              {t.gameplay.accuracyLabel}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/8 text-center">
            <div className="text-xl font-extrabold text-[#FFB547] font-mono-tabular">
              {bestStreak}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#9399B2] mt-1">
              {t.gameplay.bestStreakLabel}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/8 text-center">
            <div className="text-xl font-extrabold text-emerald-500 font-mono-tabular">
              +{xpEarned}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#9399B2] mt-1">
              {t.gameplay.xpEarnedLabel}
            </div>
          </div>
        </div>

        {newlyUnlocked.length > 0 && (
          <div className="p-4 rounded-xl bg-[#FFB547]/10 border border-[#FFB547]/30 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#FFB547]">
              <Award className="w-4 h-4" />
              <span>{t.gameplay.unlockedAchievementsLabel}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-[#111428] dark:text-[#F5F5FA]">
              {newlyUnlocked.map((id) => (
                <span key={id}>{t.profilePage.achievements[id]?.title ?? id}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={startMatch}
            className="min-h-[46px] px-6 py-3 rounded-xl bg-[#8057FF] hover:bg-[#6D42F5] text-white text-sm font-bold inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.gameplay.playAgain}</span>
          </button>

          <button
            type="button"
            onClick={() => setPhase('SETUP')}
            className="min-h-[46px] px-5 py-3 rounded-xl bg-slate-100 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/10 text-sm font-semibold text-[#111428] dark:text-[#F5F5FA]"
          >
            {t.gameplay.backToSetup}
          </button>
        </div>
      </div>
    );
  }

  // ========================
  // SETUP VIEW
  // ========================
  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111428] dark:text-[#F5F5FA]">
            {t.singleplayerPage.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#9399B2] max-w-2xl">
            {t.singleplayerPage.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={startMatch}
          className="min-h-[48px] px-7 py-3 rounded-xl bg-[#8057FF] hover:bg-[#6D42F5] text-white text-sm font-extrabold transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <Gamepad2 className="w-5 h-5 shrink-0" />
          <span>{t.singleplayerPage.startMatchNow}</span>
        </button>
      </header>

      {matchDraft.mode === 'daily_challenge' && dailyCompletedToday && (
        <div className="p-4 rounded-xl bg-[#FFB547]/10 border border-[#FFB547]/30 text-sm text-[#111428] dark:text-[#F5F5FA]">
          {t.singleplayerPage.dailyAlreadyDone}
        </div>
      )}

      {/* 6 Singleplayer Modes */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#111428] dark:text-[#F5F5FA]">
          {t.singleplayerPage.modesHeading}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {singleplayerModes.map((modeId) => {
            const active = matchDraft.mode === modeId;
            const info = t.singleplayerPage.modes[modeId];
            return (
              <button
                key={modeId}
                type="button"
                onClick={() => updateMatchDraft({ mode: modeId })}
                className={`text-start p-5 rounded-xl border transition-colors duration-150 ${
                  active
                    ? 'bg-[#8057FF] text-white border-[#8057FF]'
                    : 'bg-white dark:bg-[#12162A] text-[#111428] dark:text-[#F5F5FA] border-slate-200 dark:border-white/8 hover:border-[#8057FF]/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-bold">{info.name}</span>
                  {active && <Check className="w-4 h-4 shrink-0" />}
                </div>
                <p
                  className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${
                    active ? 'text-white/90' : 'text-slate-600 dark:text-[#9399B2]'
                  }`}
                >
                  {info.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Match Parameters */}
      <section className="p-6 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-white/8">
          <Sliders className="w-4 h-4 text-[#29C7FF]" />
          <h2 className="text-lg font-bold text-[#111428] dark:text-[#F5F5FA]">
            {t.singleplayerPage.configHeading}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-[#9399B2] mb-2.5">
              {t.singleplayerPage.difficultyLabel}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {difficulties.map((diff) => {
                const active = matchDraft.difficulty === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => updateMatchDraft({ difficulty: diff })}
                    className={`min-h-[40px] px-3 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-[#8057FF] text-white'
                        : 'bg-slate-100 dark:bg-[#0B0D19] text-slate-700 dark:text-[#9399B2] border border-slate-200 dark:border-white/8'
                    }`}
                  >
                    {t.singleplayerPage.difficulties[diff]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-[#9399B2] mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>{t.singleplayerPage.roundsLabel}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {roundOptions.map((count) => {
                const active = matchDraft.rounds === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => updateMatchDraft({ rounds: count })}
                    className={`min-h-[40px] px-2 py-2 rounded-lg text-xs font-mono-tabular font-bold transition-colors ${
                      active
                        ? 'bg-[#29C7FF] text-[#0B0D19]'
                        : 'bg-slate-100 dark:bg-[#0B0D19] text-slate-700 dark:text-[#9399B2] border border-slate-200 dark:border-white/8'
                    }`}
                  >
                    {count}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-[#9399B2] mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{t.singleplayerPage.timeLimitLabel}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {timeOptions.map((sec) => {
                const active = matchDraft.timeLimitSec === sec;
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => updateMatchDraft({ timeLimitSec: sec })}
                    className={`min-h-[40px] px-2 py-2 rounded-lg text-xs font-mono-tabular font-bold transition-colors ${
                      active
                        ? 'bg-[#FFB547] text-[#0B0D19]'
                        : 'bg-slate-100 dark:bg-[#0B0D19] text-slate-700 dark:text-[#9399B2] border border-slate-200 dark:border-white/8'
                    }`}
                  >
                    {sec}s
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Question Types */}
        <div className="pt-5 border-t border-slate-100 dark:border-white/8">
          <div className="text-xs font-semibold text-slate-500 dark:text-[#9399B2] mb-3">
            {t.singleplayerPage.questionTypesLabel}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {QUESTION_MODES.map((qm) => {
              const active = matchDraft.selectedQuestionTypes.includes(qm.id);
              return (
                <button
                  key={qm.id}
                  type="button"
                  onClick={() => toggleQuestionType(qm.id)}
                  className={`min-h-[42px] px-4 py-2.5 rounded-lg text-start text-xs font-semibold border transition-colors flex items-center justify-between gap-2 ${
                    active
                      ? 'bg-[#8057FF]/12 border-[#8057FF] text-[#111428] dark:text-[#F5F5FA]'
                      : 'bg-slate-50 dark:bg-[#0B0D19] border-slate-200 dark:border-white/8 text-slate-500 dark:text-[#9399B2]'
                  }`}
                >
                  <span className="truncate">{qm.name[language]}</span>
                  {active && <Check className="w-3.5 h-3.5 text-[#8057FF] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Categories & Specific Game/Topic Filter */}
        <div className="pt-5 border-t border-slate-100 dark:border-white/8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-[#9399B2]">
                {t.singleplayerPage.categoriesLabel}
              </div>
              <div className="text-sm font-bold text-[#111428] dark:text-[#F5F5FA] mt-1">
                {matchDraft.allCategoriesSelected
                  ? t.singleplayerPage.allCategoriesBadge
                  : selectedCategoryNames.length > 0
                    ? selectedCategoryNames.join(' · ')
                    : t.singleplayerPage.allCategoriesBadge}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('categories')}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#0B0D19] hover:bg-slate-200 dark:hover:bg-[#171C36] text-[#111428] dark:text-[#F5F5FA] border border-slate-200 dark:border-white/10 text-xs font-bold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
            >
              <Grid2x2 className="w-3.5 h-3.5 text-[#29C7FF]" />
              <span>{t.singleplayerPage.changeCategories}</span>
            </button>
          </div>

          {availableTopics.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-[#9399B2] mb-2">
                {t.singleplayerPage.specificTopicsLabel}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateMatchDraft({ selectedTopics: [] })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    matchDraft.selectedTopics.length === 0
                      ? 'bg-[#29C7FF] text-[#0B0D19]'
                      : 'bg-slate-100 dark:bg-[#0B0D19] text-slate-600 dark:text-[#9399B2]'
                  }`}
                >
                  {t.singleplayerPage.allTopicsBtn}
                </button>
                {availableTopics.map((topic) => {
                  const active = matchDraft.selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-[#8057FF] text-white'
                          : 'bg-slate-100 dark:bg-[#0B0D19] text-slate-600 dark:text-[#9399B2] hover:text-[#111428] dark:hover:text-white'
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-white/8 flex justify-end">
          <button
            type="button"
            onClick={startMatch}
            className="min-h-[48px] px-8 py-3 rounded-xl bg-[#8057FF] hover:bg-[#6D42F5] text-white text-sm font-extrabold transition-colors inline-flex items-center gap-2"
          >
            <Gamepad2 className="w-5 h-5" />
            <span>{t.singleplayerPage.startMatchNow}</span>
          </button>
        </div>
      </section>

      {/* Personal Match History */}
      {matchHistory.length > 0 && (
        <section className="p-6 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/8 space-y-4">
          <h2 className="text-base font-bold text-[#111428] dark:text-[#F5F5FA]">
            {t.singleplayerPage.recentHistoryHeading}
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-white/8">
            {matchHistory.slice(0, 6).map((m) => (
              <div
                key={m.id}
                className="py-3 flex flex-wrap items-center justify-between gap-3 text-sm"
              >
                <div>
                  <span className="font-bold text-[#111428] dark:text-[#F5F5FA]">{m.mode}</span>
                  <span className="text-xs text-slate-500 dark:text-[#9399B2] ms-2">
                    · {m.categorySummary}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono-tabular">
                  <span className="text-[#29C7FF]">
                    {m.correctCount}/{m.totalCount}
                  </span>
                  <span className="font-bold text-[#FFB547]">
                    {m.score} {t.common.pointsShort}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
