import { categories, type CategoryId, type VocabCategory } from "@/lib/vocab";

const STORAGE_KEY = "duotots-progress-v2";

export type ProgressState = {
  stars: number;
  streak: number;
  level: number;
  dailyGoal: number;
  dailyDone: number;
  dailyDate: string | null;
  completedCategories: CategoryId[];
  practicedWords: number;
  lastPracticedOn: string | null;
  categoryStats: Record<string, { attempts: number; correct: number; wrong: number }>;
  wordStats: Record<string, { attempts: number; correct: number; wrong: number; categoryId: CategoryId }>;
};

export const initialProgress: ProgressState = {
  stars: 0, streak: 0, level: 1, dailyGoal: 5, dailyDone: 0, dailyDate: null,
  completedCategories: [], practicedWords: 0, lastPracticedOn: null,
  categoryStats: {}, wordStats: {},
};

const today = () => new Date().toISOString().slice(0, 10);

function isConsecutiveDay(prev: string | null, curr: string): boolean {
  if (!prev) return false;
  const p = new Date(prev + "T00:00:00");
  const c = new Date(curr + "T00:00:00");
  return c.getTime() - p.getTime() === 86400000;
}

export const loadProgress = (): ProgressState => {
  if (typeof window === "undefined") return initialProgress;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const v1 = window.localStorage.getItem("duotots-progress-v1");
    if (v1) {
      try { const p = JSON.parse(v1) as ProgressState; return { ...initialProgress, ...p }; } catch { /* ignore */ }
    }
    return initialProgress;
  }
  try { return { ...initialProgress, ...JSON.parse(raw) as ProgressState }; } catch { return initialProgress; }
};

export const saveProgress = (next: ProgressState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};

export const recordCategoryView = (current: ProgressState, categoryId: CategoryId): ProgressState => {
  if (current.completedCategories.includes(categoryId)) return current;
  return { ...current, stars: current.stars + 1, completedCategories: [...current.completedCategories, categoryId] };
};

export const recordPracticeAttempt = (
  current: ProgressState, categoryId: CategoryId, word: string, isCorrect: boolean,
): ProgressState => {
  const d = today();
  const isNewDay = current.lastPracticedOn !== d;
  const ec = current.categoryStats[categoryId] ?? { attempts: 0, correct: 0, wrong: 0 };
  const ew = current.wordStats[word] ?? { attempts: 0, correct: 0, wrong: 0, categoryId };
  const newStars = current.stars + (isCorrect ? 2 : 0);
  const newLevel = Math.floor(newStars / 50) + 1;
  const dailyReset = current.dailyDate !== d;
  return {
    ...current,
    stars: newStars,
    level: newLevel,
    practicedWords: current.practicedWords + (isCorrect ? 1 : 0),
    streak: isNewDay
      ? (isCorrect ? (isConsecutiveDay(current.lastPracticedOn, d) ? current.streak + 1 : 1) : 0)
      : current.streak,
    lastPracticedOn: isCorrect ? d : current.lastPracticedOn,
    dailyDate: d,
    dailyDone: (dailyReset ? 0 : current.dailyDone) + (isCorrect ? 1 : 0),
    categoryStats: { ...current.categoryStats, [categoryId]: { attempts: ec.attempts + 1, correct: ec.correct + (isCorrect ? 1 : 0), wrong: ec.wrong + (isCorrect ? 0 : 1) } },
    wordStats: { ...current.wordStats, [word]: { attempts: ew.attempts + 1, correct: ew.correct + (isCorrect ? 1 : 0), wrong: ew.wrong + (isCorrect ? 0 : 1), categoryId } },
  };
};

/* ─── Guided Learning Engine ─── */

export type Recommendation = { category: VocabCategory; reason: string };

export function getNextLesson(progress: ProgressState): Recommendation {
  const catAccuracy = (id: string) => {
    const s = progress.categoryStats[id];
    if (!s || s.attempts === 0) return -1;
    return s.correct / s.attempts;
  };

  const weakCats = categories
    .filter((c) => { const a = catAccuracy(c.id); return a >= 0 && a < 0.7; })
    .sort((a, b) => catAccuracy(a.id) - catAccuracy(b.id));
  if (weakCats.length > 0) return { category: weakCats[0], reason: "Needs practice" };

  const unseen = categories.filter((c) => !progress.completedCategories.includes(c.id));
  if (unseen.length > 0) return { category: unseen[0], reason: "New topic" };

  const leastPracticed = [...categories].sort((a, b) =>
    (progress.categoryStats[a.id]?.attempts ?? 0) - (progress.categoryStats[b.id]?.attempts ?? 0)
  );
  return { category: leastPracticed[0], reason: "Review" };
}

export function getCategoryMastery(progress: ProgressState, categoryId: CategoryId): number {
  const s = progress.categoryStats[categoryId];
  if (!s || s.attempts === 0) return 0;
  return Math.round((s.correct / s.attempts) * 100);
}
