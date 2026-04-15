import type { CategoryId } from "@/lib/vocab";

const STORAGE_KEY = "duotots-progress-v1";

export type ProgressState = {
  stars: number;
  streak: number;
  completedCategories: CategoryId[];
  practicedWords: number;
  lastPracticedOn: string | null;
};

export const initialProgress: ProgressState = {
  stars: 0,
  streak: 0,
  completedCategories: [],
  practicedWords: 0,
  lastPracticedOn: null,
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
