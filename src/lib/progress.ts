import type { CategoryId } from "@/lib/vocab";

const STORAGE_KEY = "duotots-progress-v1";

export type ProgressState = {
  stars: number;
  streak: number;
  completedCategories: CategoryId[];
  practicedWords: number;
  lastPracticedOn: string | null;
  categoryStats: Record<
    CategoryId,
    {
      attempts: number;
      correct: number;
      wrong: number;
    }
  >;
  wordStats: Record<
    string,
    {
      attempts: number;
      correct: number;
      wrong: number;
      categoryId: CategoryId;
    }
  >;
};

export const initialProgress: ProgressState = {
  stars: 0,
  streak: 0,
  completedCategories: [],
  practicedWords: 0,
  lastPracticedOn: null,
  categoryStats: {} as ProgressState["categoryStats"],
  wordStats: {},
};

export const loadProgress = (): ProgressState => {
  if (typeof window === "undefined") {
    return initialProgress;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return initialProgress;
  }

  try {
    const parsed = JSON.parse(raw) as ProgressState;
    return { ...initialProgress, ...parsed };
  } catch {
    return initialProgress;
  }
};

export const saveProgress = (next: ProgressState) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};

export const recordCategoryView = (
  current: ProgressState,
  categoryId: CategoryId,
): ProgressState => {
  if (current.completedCategories.includes(categoryId)) {
    return current;
  }
  return {
    ...current,
    stars: current.stars + 1,
    completedCategories: [...current.completedCategories, categoryId],
  };
};

export const recordPracticeSuccess = (current: ProgressState): ProgressState => {
  const today = new Date().toISOString().slice(0, 10);
  const isNewDay = current.lastPracticedOn !== today;

  return {
    ...current,
    stars: current.stars + 2,
    practicedWords: current.practicedWords + 1,
    streak: isNewDay ? current.streak + 1 : current.streak,
    lastPracticedOn: today,
  };
};

export const recordPracticeAttempt = (
  current: ProgressState,
  categoryId: CategoryId,
  word: string,
  isCorrect: boolean,
): ProgressState => {
  const today = new Date().toISOString().slice(0, 10);
  const isNewDay = current.lastPracticedOn !== today;
  const existingCategory =
    current.categoryStats[categoryId] ?? { attempts: 0, correct: 0, wrong: 0 };
  const existingWord =
    current.wordStats[word] ?? { attempts: 0, correct: 0, wrong: 0, categoryId };

  const nextCategory = {
    attempts: existingCategory.attempts + 1,
    correct: existingCategory.correct + (isCorrect ? 1 : 0),
    wrong: existingCategory.wrong + (isCorrect ? 0 : 1),
  };

  const nextWord = {
    attempts: existingWord.attempts + 1,
    correct: existingWord.correct + (isCorrect ? 1 : 0),
    wrong: existingWord.wrong + (isCorrect ? 0 : 1),
    categoryId,
  };

  return {
    ...current,
    stars: current.stars + (isCorrect ? 2 : 0),
    practicedWords: current.practicedWords + (isCorrect ? 1 : 0),
    streak: isCorrect && isNewDay ? current.streak + 1 : current.streak,
    lastPracticedOn: isCorrect ? today : current.lastPracticedOn,
    categoryStats: {
      ...current.categoryStats,
      [categoryId]: nextCategory,
    },
    wordStats: {
      ...current.wordStats,
      [word]: nextWord,
    },
  };
};
