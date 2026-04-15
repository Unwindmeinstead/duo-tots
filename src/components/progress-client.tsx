"use client";

import { useState } from "react";
import { VOICE_MODE_KEY, type VoiceMode } from "@/lib/audio";
import { AppShell, NavBar, PageHeader, Section, Card, StatBubble, Btn3D } from "@/components/ui";
import { IconFire, IconStar } from "@/components/icons";
import { initialProgress, loadProgress, saveProgress, type ProgressState } from "@/lib/progress";
import { categoriesById, type CategoryId } from "@/lib/vocab";

export function ProgressClient() {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [voiceMode, setVoiceMode] = useState<VoiceMode>(() => {
    if (typeof window === "undefined") return "auto";
    return (window.localStorage.getItem(VOICE_MODE_KEY) as VoiceMode | null) ?? "auto";
  });

  const reset = () => { saveProgress(initialProgress); setProgress(initialProgress); };

  const setMode = (mode: VoiceMode) => {
    if (typeof window !== "undefined") window.localStorage.setItem(VOICE_MODE_KEY, mode);
    setVoiceMode(mode);
  };

  const clearMediaCache = () => {
    if (typeof window === "undefined") return;
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith("duotots-image:") || k.startsWith("duotots-audio:"))
      .forEach((k) => window.localStorage.removeItem(k));
  };

  const areaPerformance = Object.entries(progress.categoryStats)
    .map(([catId, stats]) => ({
      id: catId as CategoryId,
      ...stats,
      accuracy: stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  const topWords = Object.entries(progress.wordStats)
    .map(([word, s]) => ({ word, ...s, score: s.correct - s.wrong }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const struggles = Object.entries(progress.wordStats)
    .map(([word, s]) => ({ word, ...s }))
    .sort((a, b) => b.wrong - a.wrong || a.correct - b.correct)
    .filter((e) => e.wrong > 0)
    .slice(0, 8);

  return (
    <AppShell>
      <NavBar title="Stats" />

      <PageHeader>
        <div className="grid grid-cols-3 gap-3">
          <StatBubble icon={<IconStar size={28} />} value={progress.stars} label="XP" color="gold" />
          <StatBubble icon={<IconFire size={28} />} value={progress.streak} label="Streak" color="orange" />
          <StatBubble icon="📚" value={progress.practicedWords} label="Words" color="blue" />
        </div>
      </PageHeader>

      {progress.completedCategories.length > 0 && (
        <Section>
          <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-[var(--ink-light)]">
            Completed Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {progress.completedCategories.map((id) => (
              <span key={id} className="rounded-xl bg-[var(--duo-green-bg)] px-3 py-1.5 text-sm font-bold text-[var(--duo-green-dark)]">
                {categoriesById[id].icon} {categoriesById[id].name}
              </span>
            ))}
          </div>
        </Section>
      )}

      {areaPerformance.length > 0 && (
        <Section>
          <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-[var(--ink-light)]">
            Performance by Topic
          </h3>
          <Card className="divide-y divide-[var(--border)]">
            {areaPerformance.map((area) => (
              <div key={area.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xl">{categoriesById[area.id].icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[var(--ink)]">{categoriesById[area.id].name}</p>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
                    <div
                      className="h-full rounded-full bg-[var(--duo-green)] progress-bar"
                      style={{ width: `${area.accuracy}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-extrabold text-[var(--ink)]">{area.accuracy}%</span>
              </div>
            ))}
          </Card>
        </Section>
      )}

      <Section>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-[var(--ink-light)]">
              Top Words
            </h3>
            <Card className="divide-y divide-[var(--border)]">
              {topWords.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-[var(--ink-light)]">Practice to see stats</p>
              ) : (
                topWords.map((w) => (
                  <div key={w.word} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm font-bold text-[var(--ink)]">{w.word}</span>
                    <span className="text-xs font-extrabold text-[var(--duo-green)]">{w.correct}/{w.attempts}</span>
                  </div>
                ))
              )}
            </Card>
          </div>
          <div>
            <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-[var(--ink-light)]">
              Needs Work
            </h3>
            <Card className="divide-y divide-[var(--border)]">
              {struggles.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-[var(--ink-light)]">No struggles yet</p>
              ) : (
                struggles.map((w) => (
                  <div key={w.word} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm font-bold text-[var(--ink)]">{w.word}</span>
                    <span className="text-xs font-extrabold text-[var(--duo-red)]">{w.wrong}x wrong</span>
                  </div>
                ))
              )}
            </Card>
          </div>
        </div>
      </Section>

      <Section>
        <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-[var(--ink-light)]">
          Parent Settings
        </h3>
        <Card className="p-4">
          <p className="mb-3 text-sm font-bold text-[var(--ink)]">Voice Mode</p>
          <div className="flex gap-2">
            {(["auto", "gentle", "clear"] as VoiceMode[]).map((mode) => (
              <Btn3D
                key={mode}
                color={voiceMode === mode ? "blue" : "white"}
                onClick={() => setMode(mode)}
                className="flex-1 text-xs"
              >
                {mode}
              </Btn3D>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Btn3D color="white" onClick={clearMediaCache} className="flex-1 text-xs">
              Clear Cache
            </Btn3D>
            <Btn3D color="red" onClick={reset} className="flex-1 text-xs">
              Reset All
            </Btn3D>
          </div>
        </Card>
      </Section>

      <div className="h-8" />
    </AppShell>
  );
}
