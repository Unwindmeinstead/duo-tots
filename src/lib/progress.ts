import { useSyncExternalStore } from "react";
import { categories, categoriesById, type CategoryId, type VocabCategory } from "@/lib/vocab";

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
  /* ─── Gamification (additive — activity-generic) ─── */
  xp: number;
  categoryStars: Record<string, number>;
  seenWords: string[];
  dailyWords: string[];
  dailyWordsDate: string | null;
  badges: string[];
  lastActiveOn: string | null;
  levelCelebrated: number;
  soundEnabled: boolean;
};

export const initialProgress: ProgressState = {
  stars: 0, streak: 0, level: 1, dailyGoal: 5, dailyDone: 0, dailyDate: null,
  completedCategories: [], practicedWords: 0, lastPracticedOn: null,
  categoryStats: {}, wordStats: {},
  xp: 0,
  categoryStars: {},
  seenWords: [],
  dailyWords: [],
  dailyWordsDate: null,
  badges: [],
  lastActiveOn: null,
  levelCelebrated: 1,
  soundEnabled: true,
};

/* Local calendar day — streaks and daily goals must roll over at the
   child's midnight, not at UTC midnight. */
const today = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

function isConsecutiveDay(prev: string | null, curr: string): boolean {
  if (!prev) return false;
  const p = new Date(prev + "T00:00:00");
  const c = new Date(curr + "T00:00:00");
  return c.getTime() - p.getTime() === 86400000;
}

/* ─── Levels ─── */

export const LEVELS: Array<{ level: number; name: string; xp: number }> = [
  { level: 1, name: "Sprout", xp: 0 },
  { level: 2, name: "Explorer", xp: 50 },
  { level: 3, name: "Adventurer", xp: 150 },
  { level: 4, name: "Trailblazer", xp: 300 },
  { level: 5, name: "Ranger", xp: 500 },
  { level: 6, name: "Pathfinder", xp: 800 },
  { level: 7, name: "Storyteller", xp: 1200 },
  { level: 8, name: "Word Wizard", xp: 1800 },
  { level: 9, name: "Super Reader", xp: 2600 },
  { level: 10, name: "Legend", xp: 3600 },
];

export function getLevelInfo(xp: number): {
  level: number;
  name: string;
  floorXp: number;
  nextXp: number | null;
  intoLevel: number;
  span: number;
  progress: number;
} {
  const safeXp = Math.max(0, xp);
  let current = LEVELS[0];
  let next: { level: number; name: string; xp: number } | null = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (safeXp >= LEVELS[i].xp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? null;
    } else {
      break;
    }
  }
  const floorXp = current.xp;
  const nextXp = next ? next.xp : null;
  const intoLevel = safeXp - floorXp;
  const span = nextXp !== null ? nextXp - floorXp : 0;
  const progress = nextXp === null ? 1 : span > 0 ? Math.min(1, Math.max(0, intoLevel / span)) : 1;
  return { level: current.level, name: current.name, floorXp, nextXp, intoLevel, span, progress };
}

/* ─── Badges ─── */

export type BadgeIcon = "star" | "fire" | "trophy" | "check" | "play" | "grid";

export const BADGE_DEFS: Array<{ id: string; name: string; blurb: string; icon: BadgeIcon }> = [
  { id: "first-steps", name: "First Steps", blurb: "See your first word", icon: "play" },
  { id: "word-10", name: "Word Collector 10", blurb: "See 10 words", icon: "star" },
  { id: "word-50", name: "Word Collector 50", blurb: "See 50 words", icon: "star" },
  { id: "word-100", name: "Word Collector 100", blurb: "See 100 words", icon: "star" },
  { id: "word-250", name: "Word Collector 250", blurb: "See 250 words", icon: "star" },
  { id: "streak-3", name: "3-Day Streak", blurb: "Learn 3 days in a row", icon: "fire" },
  { id: "streak-7", name: "7-Day Streak", blurb: "Learn 7 days in a row", icon: "fire" },
  { id: "first-topic", name: "Topic Finisher", blurb: "Earn a star on any topic", icon: "check" },
  { id: "topic-master", name: "Topic Master", blurb: "Earn 3 stars on any topic", icon: "trophy" },
  { id: "explorer-5", name: "Explorer", blurb: "Earn stars on 5 topics", icon: "grid" },
  { id: "foundation-hero", name: "Foundation Hero", blurb: "Earn a star on every Foundation topic", icon: "trophy" },
  { id: "good-trying", name: "Super Tryer", blurb: "Try 25 quiz questions", icon: "check" },
];

function effectiveStarsMap(state: ProgressState): Record<string, number> {
  const map: Record<string, number> = { ...state.categoryStars };
  for (const id of state.completedCategories) {
    if (map[id] === undefined) map[id] = 1;
  }
  return map;
}

export function computeBadges(state: ProgressState): string[] {
  const earned: string[] = [];
  const seenCount = state.seenWords.length;
  if (seenCount >= 1) earned.push("first-steps");
  if (seenCount >= 10) earned.push("word-10");
  if (seenCount >= 50) earned.push("word-50");
  if (seenCount >= 100) earned.push("word-100");
  if (seenCount >= 250) earned.push("word-250");
  if (state.streak >= 3) earned.push("streak-3");
  if (state.streak >= 7) earned.push("streak-7");

  const eff = effectiveStarsMap(state);
  const starredTopics = Object.values(eff).filter((v) => v > 0).length;
  const maxStars = Object.values(eff).reduce((m, v) => Math.max(m, v), 0);
  if (starredTopics >= 1) earned.push("first-topic");
  if (maxStars >= 3) earned.push("topic-master");
  if (starredTopics >= 5) earned.push("explorer-5");

  const foundationCats = categories.filter((c) => c.stage === "foundation");
  if (foundationCats.length > 0 && foundationCats.every((c) => (eff[c.id] ?? 0) >= 1)) {
    earned.push("foundation-hero");
  }

  const totalAttempts = Object.values(state.categoryStats).reduce((sum, s) => sum + s.attempts, 0);
  if (totalAttempts >= 25) earned.push("good-trying");

  return earned;
}

function syncBadges(state: ProgressState): ProgressState {
  const computed = computeBadges(state);
  const merged = Array.from(new Set([...state.badges, ...computed]));
  if (merged.length === state.badges.length && merged.every((b) => state.badges.includes(b))) {
    return state;
  }
  return { ...state, badges: merged };
}

/* ─── Activity / streak ─── */

export function touchActivity(state: ProgressState): ProgressState {
  const d = today();
  let next = state;
  if (state.lastActiveOn !== d) {
    const streak = isConsecutiveDay(state.lastActiveOn, d) ? state.streak + 1 : 1;
    next = { ...next, streak, lastActiveOn: d, lastPracticedOn: d };
  }
  if (next.dailyWordsDate !== d) {
    next = { ...next, dailyWords: [], dailyWordsDate: d };
  }
  return next;
}

/* ─── Category stars / daily goal helpers ─── */

export function getCategoryStars(state: ProgressState, id: string): number {
  return state.categoryStars[id] ?? (state.completedCategories.includes(id as CategoryId) ? 1 : 0);
}

export function totalCategoryStars(state: ProgressState): number {
  return categories.reduce((sum, c) => sum + getCategoryStars(state, c.id), 0);
}

export function getDailyGoalState(state: ProgressState): { done: number; goal: number; met: boolean } {
  const done = state.dailyWordsDate === today() ? state.dailyWords.length : 0;
  const goal = state.dailyGoal;
  return { done, goal, met: done >= goal };
}

/* ─── Generic completion hook ─── */

export function completeActivity(
  state: ProgressState,
  nodeId: string,
  stars: number,
  xpBonus = 30,
): ProgressState {
  const clamped = Math.min(3, Math.max(0, Math.floor(stars)));
  const existing = state.categoryStars[nodeId] ?? 0;
  const isTransition = existing === 0 && clamped > 0;
  let next = touchActivity(state);
  const newStarsValue = Math.max(existing, clamped);
  next = {
    ...next,
    categoryStars: { ...next.categoryStars, [nodeId]: newStarsValue },
    xp: next.xp + (isTransition ? xpBonus : 0),
  };
  next = { ...next, level: getLevelInfo(next.xp).level };
  next = syncBadges(next);
  return next;
}

/* ─── Word seen ─── */

export function recordWordSeen(
  state: ProgressState,
  categoryId: CategoryId,
  itemId: string,
): ProgressState {
  let next = touchActivity(state);
  const isNew = !next.seenWords.includes(itemId);
  const xpGain = isNew ? 5 : 1;
  const seenWords = isNew ? [...next.seenWords, itemId] : next.seenWords;
  const dailyWords = next.dailyWords.includes(itemId)
    ? next.dailyWords
    : [...next.dailyWords, itemId];
  next = { ...next, xp: next.xp + xpGain, seenWords, dailyWords };

  const cat = categoriesById[categoryId];
  if (cat) {
    const allSeen = cat.items.every((item) => seenWords.includes(item.id));
    if (allSeen) {
      const existing = next.categoryStars[categoryId] ?? 0;
      if (existing < 1) {
        next = {
          ...next,
          categoryStars: { ...next.categoryStars, [categoryId]: 1 },
          xp: next.xp + 20,
        };
      }
    }
  }

  next = { ...next, level: getLevelInfo(next.xp).level };
  next = syncBadges(next);
  return next;
}

/* A streak only survives if the last activity was today or yesterday. */
const withStreakDecay = (p: ProgressState): ProgressState => {
  const activityDate = p.lastActiveOn ?? p.lastPracticedOn;
  if (!activityDate || p.streak === 0) return p;
  const d = today();
  if (activityDate === d || isConsecutiveDay(activityDate, d)) return p;
  return { ...p, streak: 0 };
};

function deriveProgress(p: ProgressState): ProgressState {
  try {
    let next = p;
    // Fill categoryStars fallback from completedCategories (>=1 each, only where unset)
    const needsFallback = next.completedCategories.some((id) => next.categoryStars[id] === undefined);
    if (needsFallback) {
      const categoryStars = { ...next.categoryStars };
      for (const id of next.completedCategories) {
        if (categoryStars[id] === undefined) categoryStars[id] = 1;
      }
      next = { ...next, categoryStars };
    }
    // Badges: union with computed
    const computed = computeBadges(next);
    if (computed.some((b) => !next.badges.includes(b))) {
      next = { ...next, badges: Array.from(new Set([...next.badges, ...computed])) };
    }
    // Level from XP
    if (next.xp > 0) {
      const xpLevel = getLevelInfo(next.xp).level;
      if (xpLevel > next.level) next = { ...next, level: xpLevel };
    }
    return next;
  } catch {
    return p;
  }
}

export const loadProgress = (): ProgressState => {
  if (typeof window === "undefined") return initialProgress;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const v1 = window.localStorage.getItem("duotots-progress-v1");
    if (v1) {
      try { const p = JSON.parse(v1) as ProgressState; return withStreakDecay(deriveProgress({ ...initialProgress, ...p })); } catch { /* ignore */ }
    }
    return initialProgress;
  }
  try { return withStreakDecay(deriveProgress({ ...initialProgress, ...JSON.parse(raw) as ProgressState })); } catch { return initialProgress; }
};

export const saveProgress = (next: ProgressState) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* storage full/blocked — progress is best-effort, never crash a tap */ }
  window.dispatchEvent(new Event(PROGRESS_CHANGED_EVENT));
};

/* ── External-store binding (useProgress) ─────────────────────────
   Browsing surfaces render progress values as text, so their first
   client render must match the server HTML exactly. Reading
   localStorage in a useState initializer breaks that — the server
   can only render initialProgress (React #418, audit failure #5) —
   and adopting the stored value via setState-in-effect trips the
   React Compiler lint rule. useSyncExternalStore is the sanctioned
   bridge: the server snapshot is initialProgress; right after
   hydration React swaps in the client snapshot (the stored state,
   cached by raw string so its reference is stable between reads);
   saveProgress notifies subscribers, so writers never need a local
   setState mirror. */
const PROGRESS_CHANGED_EVENT = "duotots-progress-changed";
let progressSnapshotCache: { raw: string | null; state: ProgressState } | null = null;

const subscribeProgress = (onChange: () => void): (() => void) => {
  window.addEventListener(PROGRESS_CHANGED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(PROGRESS_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

const getProgressSnapshot = (): ProgressState => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (progressSnapshotCache && progressSnapshotCache.raw === raw) return progressSnapshotCache.state;
  const state = loadProgress();
  progressSnapshotCache = { raw, state };
  return state;
};

const getServerProgressSnapshot = (): ProgressState => initialProgress;

export const useProgress = (): ProgressState =>
  useSyncExternalStore(subscribeProgress, getProgressSnapshot, getServerProgressSnapshot);

export const recordCategoryView = (current: ProgressState, categoryId: CategoryId): ProgressState => {
  const touched = touchActivity(current);
  if (touched.completedCategories.includes(categoryId)) return touched;
  return { ...touched, stars: touched.stars + 1, completedCategories: [...touched.completedCategories, categoryId] };
};

export const recordPracticeAttempt = (
  current: ProgressState, categoryId: CategoryId, word: string, isCorrect: boolean,
): ProgressState => {
  const d = today();
  const base = touchActivity(current);
  const ec = base.categoryStats[categoryId] ?? { attempts: 0, correct: 0, wrong: 0 };
  const ew = base.wordStats[word] ?? { attempts: 0, correct: 0, wrong: 0, categoryId };
  const newStars = base.stars + (isCorrect ? 2 : 0);
  const xpGain = isCorrect ? 10 : 2;
  const newXp = base.xp + xpGain;
  const dailyReset = base.dailyDate !== d;

  const newCategoryStats = {
    ...base.categoryStats,
    [categoryId]: { attempts: ec.attempts + 1, correct: ec.correct + (isCorrect ? 1 : 0), wrong: ec.wrong + (isCorrect ? 0 : 1) },
  };
  const newWordStats = {
    ...base.wordStats,
    [word]: { attempts: ew.attempts + 1, correct: ew.correct + (isCorrect ? 1 : 0), wrong: ew.wrong + (isCorrect ? 0 : 1), categoryId },
  };

  // Recompute categoryStars from accuracy once there are enough attempts; max-only, never decreases.
  const categoryStars = { ...base.categoryStars };
  const catStat = newCategoryStats[categoryId];
  if (catStat && catStat.attempts >= 5) {
    const accuracy = catStat.correct / catStat.attempts;
    const earned = accuracy >= 0.9 ? 3 : accuracy >= 0.6 ? 2 : 0;
    if (earned > 0) {
      categoryStars[categoryId] = Math.max(categoryStars[categoryId] ?? 0, earned);
    }
  }
  const cat = categoriesById[categoryId];
  if (cat && cat.items.every((item) => base.seenWords.includes(item.id))) {
    categoryStars[categoryId] = Math.max(categoryStars[categoryId] ?? 0, 1);
  }

  let next: ProgressState = {
    ...base,
    stars: newStars,
    xp: newXp,
    level: getLevelInfo(newXp).level,
    practicedWords: base.practicedWords + (isCorrect ? 1 : 0),
    dailyDate: d,
    dailyDone: (dailyReset ? 0 : base.dailyDone) + (isCorrect ? 1 : 0),
    categoryStats: newCategoryStats,
    wordStats: newWordStats,
    categoryStars,
  };
  next = syncBadges(next);
  // syncBadges may have returned a new object; ensure level stays synced (badges don't affect XP)
  if (next.level !== getLevelInfo(next.xp).level) {
    next = { ...next, level: getLevelInfo(next.xp).level };
  }
  return next;
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
