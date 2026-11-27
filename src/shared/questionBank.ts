import type {
  ClientTriviaQuestion,
  DifficultyLevel,
  QuestionModeId,
  TriviaQuestion,
} from '../types/game.ts';
import { EXTRA_VERIFIED_QUESTIONS } from './questionsExtra.ts';
import { GAMING_AND_MEDIA_QUESTIONS } from './questionsGaming.ts';
import { WORLD_AND_KNOWLEDGE_QUESTIONS } from './questionsWorld.ts';

export const ALL_QUESTIONS: TriviaQuestion[] = [
  ...GAMING_AND_MEDIA_QUESTIONS,
  ...WORLD_AND_KNOWLEDGE_QUESTIONS,
  ...EXTRA_VERIFIED_QUESTIONS,
];

export interface QuestionSelectionOptions {
  allCategoriesSelected: boolean;
  selectedCategoryIds: string[];
  selectedTopics?: string[];
  selectedQuestionTypes: QuestionModeId[];
  difficulty: DifficultyLevel | 'mixed';
  count: number;
  excludeIds?: string[];
  seedString?: string;
}

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededShuffle<T>(items: T[], seed?: string): T[] {
  const arr = [...items];
  let state = seed ? hashSeed(seed) : Math.floor(Math.random() * 0xffffffff);
  const nextRand = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function selectQuestionsForMatch(opts: QuestionSelectionOptions): TriviaQuestion[] {
  const excluded = new Set(opts.excludeIds ?? []);

  // Tier 1: strict match (category + topic + type + difficulty + not excluded)
  const matchesCategory = (q: TriviaQuestion) =>
    opts.allCategoriesSelected ||
    opts.selectedCategoryIds.length === 0 ||
    opts.selectedCategoryIds.includes(q.categoryId);

  const matchesTopic = (q: TriviaQuestion) =>
    !opts.selectedTopics ||
    opts.selectedTopics.length === 0 ||
    opts.selectedTopics.some(
      (t) =>
        t.toLowerCase() === q.topicTag.toLowerCase() ||
        t.toLowerCase() === q.subcategory.en.toLowerCase() ||
        t.toLowerCase() === q.subcategory.ar.toLowerCase()
    );

  const matchesType = (q: TriviaQuestion) =>
    opts.selectedQuestionTypes.length === 0 ||
    opts.selectedQuestionTypes.includes(q.questionType);

  const matchesDifficulty = (q: TriviaQuestion) =>
    opts.difficulty === 'mixed' || q.difficulty === opts.difficulty;

  const picked: TriviaQuestion[] = [];
  const pickedIds = new Set<string>();

  const addFromPool = (pool: TriviaQuestion[]) => {
    const shuffled = seededShuffle(pool, opts.seedString);
    for (const q of shuffled) {
      if (picked.length >= opts.count) break;
      if (!pickedIds.has(q.id)) {
        picked.push(q);
        pickedIds.add(q.id);
      }
    }
  };

  // Priority 1: Exact category + topic + type + difficulty + unseen
  addFromPool(
    ALL_QUESTIONS.filter(
      (q) =>
        !excluded.has(q.id) &&
        matchesCategory(q) &&
        matchesTopic(q) &&
        matchesType(q) &&
        matchesDifficulty(q)
    )
  );

  // Priority 2: Relax difficulty within selected categories & topics
  if (picked.length < opts.count) {
    addFromPool(
      ALL_QUESTIONS.filter(
        (q) => !excluded.has(q.id) && matchesCategory(q) && matchesTopic(q) && matchesType(q)
      )
    );
  }

  // Priority 3: Relax topic within selected categories
  if (picked.length < opts.count) {
    addFromPool(
      ALL_QUESTIONS.filter((q) => !excluded.has(q.id) && matchesCategory(q) && matchesType(q))
    );
  }

  // Priority 4: Relax type within selected categories
  if (picked.length < opts.count) {
    addFromPool(ALL_QUESTIONS.filter((q) => !excluded.has(q.id) && matchesCategory(q)));
  }

  // Priority 5: Fill remaining from all unseen questions across categories
  if (picked.length < opts.count) {
    addFromPool(ALL_QUESTIONS.filter((q) => !excluded.has(q.id)));
  }

  // Priority 6: If user exhausted entire bank, allow previously seen questions
  if (picked.length < opts.count) {
    addFromPool(ALL_QUESTIONS);
  }

  return picked;
}

export function selectDailyQuestions(utcDateKey: string): TriviaQuestion[] {
  return selectQuestionsForMatch({
    allCategoriesSelected: true,
    selectedCategoryIds: [],
    selectedQuestionTypes: [
      'guess_the_game',
      'true_false',
      'guess_the_logo',
      'guess_the_sound',
      'who_am_i',
      'speed_round',
    ],
    difficulty: 'mixed',
    count: 10,
    seedString: `quiztime_daily_${utcDateKey}`,
  });
}

export function sanitizeQuestionForClient(q: TriviaQuestion): ClientTriviaQuestion {
  return {
    id: q.id,
    categoryId: q.categoryId,
    subcategory: q.subcategory,
    topicTag: q.topicTag,
    questionType: q.questionType,
    difficulty: q.difficulty,
    prompt: q.prompt,
    options: q.options,
    hints: q.hints,
    logoKey: q.logoKey,
    soundKey: q.soundKey,
    soundCaption: q.soundCaption,
    points: q.points,
  };
}

export function getAvailableGamingTopics(): string[] {
  const seen = new Set<string>();
  for (const q of ALL_QUESTIONS) {
    if (q.categoryId === 'gaming') {
      seen.add(q.topicTag);
    }
  }
  return Array.from(seen);
}

export function getUtcDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}
