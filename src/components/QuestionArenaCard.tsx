import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Play,
  RotateCcw,
  Volume2,
  XCircle,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BilingualText, ClientTriviaQuestion } from '../types/game';
import { soundEngine } from '../utils/soundEngine';
import { LogoPuzzleVisual } from './LogoPuzzleVisual';

interface QuestionArenaCardProps {
  question: ClientTriviaQuestion;
  selectedOptionIndex: number | null;
  locked: boolean;
  onSelectOption: (index: number) => void;
  reveal?: {
    correctIndex: number;
    explanation: BilingualText;
  } | null;
  streakCount?: number;
}

export const QuestionArenaCard: React.FC<QuestionArenaCardProps> = ({
  question,
  selectedOptionIndex,
  locked,
  onSelectOption,
  reveal = null,
  streakCount = 0,
}) => {
  const { language, settings, t } = useApp();
  const [revealedHintsCount, setRevealedHintsCount] = useState(1);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);

  // Reset hint count & auto-trigger sound cue cleanly on new question
  useEffect(() => {
    setRevealedHintsCount(1);
    setHasPlayedAudio(false);
    if (question.questionType === 'guess_the_sound' && question.soundKey && settings.soundVolume > 0) {
      const timer = setTimeout(() => {
        soundEngine.playCue(question.soundKey!, settings.soundVolume);
        setHasPlayedAudio(true);
      }, 250);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [question.id, question.questionType, question.soundKey, settings.soundVolume]);

  const handlePlayCue = () => {
    if (!question.soundKey) return;
    soundEngine.playCue(question.soundKey, settings.soundVolume || 70);
    setHasPlayedAudio(true);
  };

  const hints = question.hints ?? [];
  const visibleHints = hints.slice(0, revealedHintsCount);

  return (
    <div className="rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 p-5 sm:p-7 space-y-6">
      {/* Question Header Metadata (Clean inline text, zero pill clutter) */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-[#9399B2]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[#29C7FF]">
            {question.subcategory[language]}
          </span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">
            {t.singleplayerPage.difficulties[question.difficulty]}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular">
            +{question.points} {t.common.pointsShort}
          </span>
        </div>

        {question.questionType === 'speed_round' && streakCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFB547] tabular-nums">
            <Zap className="w-3.5 h-3.5" />
            <span>
              {t.gameplay.comboMultiplier} ×{Math.min(3, 1 + streakCount * 0.25).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Main Prompt */}
      <h2 className="text-lg sm:text-2xl font-bold leading-snug text-[#111428] dark:text-[#F5F5FA]">
        {question.prompt[language]}
      </h2>

      {/* Type-Specific Visuals / Hints / Audio */}
      {question.questionType === 'guess_the_logo' && question.logoKey && (
        <LogoPuzzleVisual logoKey={question.logoKey} />
      )}

      {question.questionType === 'guess_the_sound' && (
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#8057FF]/15 text-[#8057FF] flex items-center justify-center shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#111428] dark:text-[#F5F5FA]">
                  {hasPlayedAudio ? t.gameplay.replaySound : t.gameplay.playSound}
                </div>
                {question.soundCaption && (
                  <div className="text-xs text-slate-500 dark:text-[#9399B2]">
                    {t.gameplay.soundFallbackLabel}: {question.soundCaption[language]}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlayCue}
              className="min-h-[42px] px-4 py-2 rounded-lg bg-[#8057FF] hover:bg-[#6D42F5] text-white text-xs font-bold inline-flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              {hasPlayedAudio ? (
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Play className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{hasPlayedAudio ? t.gameplay.replaySound : t.gameplay.playSound}</span>
            </button>
          </div>
        </div>
      )}

      {(question.questionType === 'guess_the_game' || question.questionType === 'who_am_i') &&
        hints.length > 0 && (
          <div className="space-y-2.5 pt-1">
            {visibleHints.map((hint, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/8 flex items-start gap-2.5 text-sm text-slate-700 dark:text-[#F5F5FA]/90"
              >
                <Lightbulb className="w-4 h-4 text-[#FFB547] shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono-tabular text-xs font-bold text-[#FFB547] me-2">
                    {t.gameplay.hintIndex} {idx + 1}:
                  </span>
                  <span>{hint[language]}</span>
                </div>
              </div>
            ))}

            {!locked && revealedHintsCount < hints.length && (
              <button
                type="button"
                onClick={() => setRevealedHintsCount((c) => Math.min(hints.length, c + 1))}
                className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0B0D19] hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-[#29C7FF] inline-flex items-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>
                  {t.gameplay.revealHint} ({revealedHintsCount}/{hints.length})
                </span>
              </button>
            )}
          </div>
        )}

      {/* Answer Options */}
      <div
        className={`grid gap-3 ${
          question.questionType === 'true_false'
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2'
        }`}
      >
        {question.options.map((opt, idx) => {
          const isSelected = selectedOptionIndex === idx;
          const isRevealedCorrect = reveal !== null && reveal.correctIndex === idx;
          const isRevealedWrongSelected =
            reveal !== null && isSelected && reveal.correctIndex !== idx;

          let cardClass =
            'bg-slate-50 dark:bg-[#0B0D19] border-slate-200 dark:border-white/10 text-[#111428] dark:text-[#F5F5FA] hover:border-[#8057FF]';

          if (isRevealedCorrect) {
            cardClass =
              'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300';
          } else if (isRevealedWrongSelected) {
            cardClass = 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300';
          } else if (isSelected) {
            cardClass = 'bg-[#8057FF] border-[#8057FF] text-white';
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={locked}
              onClick={() => onSelectOption(idx)}
              className={`min-h-[54px] px-4 py-3.5 rounded-xl border text-start text-sm sm:text-base font-bold transition-colors duration-150 flex items-center justify-between gap-3 disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29C7FF] ${cardClass}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono-tabular text-xs opacity-75 shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="break-words">{opt[language]}</span>
              </div>

              {isRevealedCorrect && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              {isRevealedWrongSelected && <XCircle className="w-5 h-5 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Answer Explanation Reveal */}
      {reveal && (
        <div
          className={`p-4 rounded-xl border space-y-1 ${
            selectedOptionIndex === reveal.correctIndex
              ? 'bg-emerald-500/10 border-emerald-500/35'
              : 'bg-rose-500/10 border-rose-500/35'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            {selectedOptionIndex === reveal.correctIndex ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-emerald-700 dark:text-emerald-300">
                  {t.gameplay.correctFeedback}
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-rose-700 dark:text-rose-300">
                  {selectedOptionIndex === null
                    ? t.gameplay.timeUpFeedback
                    : t.gameplay.wrongFeedback}
                </span>
              </>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-[#F5F5FA]/90 leading-relaxed">
            {reveal.explanation[language]}
          </p>
        </div>
      )}
    </div>
  );
};
