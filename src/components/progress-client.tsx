"use client";

import Link from "next/link";
import { useState } from "react";
import { VOICE_MODE_KEY, type VoiceMode } from "@/lib/audio";
import { AppShell, BottomNav, ProgressChip, SurfaceCard, TopBar } from "@/components/ui";
import { initialProgress, loadProgress, saveProgress, type ProgressState } from "@/lib/progress";
import { categoriesById, type CategoryId } from "@/lib/vocab";

export function ProgressClient() {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [voiceMode, setVoiceMode] = useState<VoiceMode>(() => {
    if (typeof window === "undefined") {
      return "auto";
    }
    return (window.localStorage.getItem(VOICE_MODE_KEY) as VoiceMode | null) ?? "auto";
  });

  const reset = () => {
    saveProgress(initialProgress);
    setProgress(initialProgress);
  };

  const setMode = (mode: VoiceMode) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VOICE_MODE_KEY, mode);
    }
    setVoiceMode(mode);
  };

  const clearMediaCache = () => {
    if (typeof window === "undefined") {
      return;
    }
    const keys = Object.keys(window.localStorage).filter(
      (key) => key.startsWith("duotots-image:") || key.startsWith("duotots-audio:"),
    );
    keys.forEach((key) => window.localStorage.removeItem(key));
  };

  const areaPerformance = Object.entries(progress.categoryStats)
    .map(([categoryId, stats]) => {
      const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
      return {
        categoryId: categoryId as CategoryId,
        ...stats,
        accuracy,
      };
    })
    .sort((a, b) => b.accuracy - a.accuracy);

  const topKnownWords = Object.entries(progress.wordStats)
    .map(([word, stats]) => ({
      word,
      ...stats,
      score: stats.correct - stats.wrong,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const struggleWords = Object.entries(progress.wordStats)
    .map(([word, stats]) => ({
      word,
      ...stats,
    }))
    .sort((a, b) => b.wrong - a.wrong || a.correct - b.correct)
    .filter((entry) => entry.wrong > 0)
    .slice(0, 6);

  return (
    <AppShell>
      <TopBar>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
          Progress
        </p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">Learning Dashboard</h1>
      </TopBar>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 p-5 shadow-sm">
          <p className="text-sm text-amber-700">Stars</p>
          <p className="text-3xl font-black text-amber-900">{progress.stars}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 shadow-sm">
          <p className="text-sm text-indigo-700">Daily streak</p>
          <p className="text-3xl font-black text-indigo-900">{progress.streak}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 shadow-sm">
          <p className="text-sm text-emerald-700">Words practiced</p>
          <p className="text-3xl font-black text-emerald-900">{progress.practicedWords}</p>
        </div>
      </section>

      <SurfaceCard className="p-6">
        <h2 className="text-2xl font-black text-slate-900">Completed Categories</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {progress.completedCategories.length === 0 ? (
            <li className="rounded-xl bg-slate-100 p-4 text-slate-600">No categories yet.</li>
          ) : (
            progress.completedCategories.map((id) => (
              <li key={id} className="rounded-xl bg-slate-100 p-4 text-slate-800">
                {categoriesById[id].icon} {categoriesById[id].name}
              </li>
            ))
          )}
        </ul>
      </SurfaceCard>

      <SurfaceCard className="p-6">
        <h2 className="text-xl font-black text-slate-900">Learning Areas</h2>
        <p className="mt-1 text-sm text-slate-600">Tap practice across categories and watch confidence grow.</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {areaPerformance.length === 0 ? (
            <li className="rounded-xl bg-slate-100 p-4 text-slate-600">
              No area analytics yet. Start a practice round.
            </li>
          ) : (
            areaPerformance.map((area) => (
              <li key={area.categoryId} className="rounded-xl bg-slate-100 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {categoriesById[area.categoryId].icon} {categoriesById[area.categoryId].name}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Accuracy {area.accuracy}% · Attempts {area.attempts} · Struggles {area.wrong}
                </p>
              </li>
            ))
          )}
        </ul>
      </SurfaceCard>

      <section className="grid gap-4 sm:grid-cols-2">
        <SurfaceCard className="p-6">
          <h2 className="text-xl font-black text-slate-900">What They Know</h2>
          <ul className="mt-3 grid gap-2">
            {topKnownWords.length === 0 ? (
              <li className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600">No word mastery yet.</li>
            ) : (
              topKnownWords.map((item) => (
                <li key={item.word} className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
                  {item.word} · Correct {item.correct}/{item.attempts}
                </li>
              ))
            )}
          </ul>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <h2 className="text-xl font-black text-slate-900">Current Struggles</h2>
          <ul className="mt-3 grid gap-2">
            {struggleWords.length === 0 ? (
              <li className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
                No repeated struggle words right now.
              </li>
            ) : (
              struggleWords.map((item) => (
                <li key={item.word} className="rounded-lg bg-rose-50 p-3 text-sm text-rose-900">
                  {item.word} · Wrong {item.wrong}/{item.attempts}
                </li>
              ))
            )}
          </ul>
        </SurfaceCard>
      </section>

      <SurfaceCard className="p-6">
        <h2 className="text-xl font-black text-slate-900">Parent Settings</h2>
        <p className="mt-1 text-sm text-slate-600">
          Choose a speaking style and refresh cached media whenever needed.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["auto", "gentle", "clear"] as VoiceMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setMode(mode)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                voiceMode === mode
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-100 text-slate-800 hover:bg-slate-200"
              }`}
            >
              Voice: {mode}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={clearMediaCache}
            className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-200"
          >
            Refresh image/audio cache
          </button>
        </div>
      </SurfaceCard>

      <BottomNav>
        <div className="flex gap-2">
          <ProgressChip label="Words practiced" value={progress.practicedWords} />
          <ProgressChip label="Completed sets" value={progress.completedCategories.length} />
        </div>
        <Link
          href="/"
          className="rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-600"
        >
          Back Home
        </Link>
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-200"
        >
          Parent Reset
        </button>
      </BottomNav>
    </AppShell>
  );
}
