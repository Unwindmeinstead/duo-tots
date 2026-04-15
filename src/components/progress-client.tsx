"use client";

import { useState } from "react";
import { VOICE_MODE_KEY, type VoiceMode } from "@/lib/audio";
import { AppShell, TopBar, Card, Btn, BottomBar, NavLink, StatChip, Tag } from "@/components/ui";
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
    .slice(0, 6);

  const struggles = Object.entries(progress.wordStats)
    .map(([word, s]) => ({ word, ...s }))
    .sort((a, b) => b.wrong - a.wrong || a.correct - b.correct)
    .filter((e) => e.wrong > 0)
    .slice(0, 6);

  return (
    <AppShell>
      <TopBar label="Dashboard" title="Learning Progress" subtitle="Track what your child knows, where they struggle, and how far they've come." />

      <div className="grid grid-cols-3 gap-2.5">
        <StatChip label="Stars" value={progress.stars} color="yellow" />
        <StatChip label="Streak" value={progress.streak} color="teal" />
        <StatChip label="Words" value={progress.practicedWords} color="green" />
      </div>

      {progress.completedCategories.length > 0 && (
        <Card accent="green" className="p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--ink-muted)]">Completed Topics</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {progress.completedCategories.map((id) => (
              <Tag key={id} color="green">{categoriesById[id].icon} {categoriesById[id].name}</Tag>
            ))}
          </div>
        </Card>
      )}

      {areaPerformance.length > 0 && (
        <Card accent="teal" className="p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--ink-muted)]">Learning Areas</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {areaPerformance.map((area) => (
              <div key={area.id} className="flex items-center gap-3 rounded-xl bg-[var(--card)] p-3">
                <span className="text-xl leading-none">{categoriesById[area.id].icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[var(--ink)]">{categoriesById[area.id].name}</p>
                  <p className="text-xs text-[var(--ink-muted)]">{area.accuracy}% accuracy · {area.attempts} tries</p>
                </div>
                <div className="h-8 w-8 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border-light)" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="16" fill="none"
                      stroke="var(--accent-teal)" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${area.accuracy} ${100 - area.accuracy}`}
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Card accent="green" className="p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--ink-muted)]">Top Known Words</h2>
          {topWords.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--ink-muted)]">No word data yet.</p>
          ) : (
            <div className="mt-3 grid gap-1.5">
              {topWords.map((w) => (
                <div key={w.word} className="flex items-center justify-between rounded-xl bg-[var(--card)] px-3 py-2.5">
                  <span className="text-sm font-semibold text-[var(--ink)]">{w.word}</span>
                  <span className="text-xs font-medium text-[var(--accent-green)]">{w.correct}/{w.attempts}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card accent="coral" className="p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--ink-muted)]">Needs Practice</h2>
          {struggles.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--ink-muted)]">No struggles recorded.</p>
          ) : (
            <div className="mt-3 grid gap-1.5">
              {struggles.map((w) => (
                <div key={w.word} className="flex items-center justify-between rounded-xl bg-[var(--card)] px-3 py-2.5">
                  <span className="text-sm font-semibold text-[var(--ink)]">{w.word}</span>
                  <span className="text-xs font-medium text-[var(--accent-coral)]">{w.wrong} wrong</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--ink-muted)]">Parent Settings</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["auto", "gentle", "clear"] as VoiceMode[]).map((mode) => (
            <Btn
              key={mode}
              variant={voiceMode === mode ? "dark" : "soft"}
              onClick={() => setMode(mode)}
            >
              Voice: {mode}
            </Btn>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn variant="soft" onClick={clearMediaCache}>Refresh Cache</Btn>
          <Btn variant="soft" onClick={reset}>Reset All Progress</Btn>
        </div>
      </Card>

      <BottomBar>
        <NavLink href="/" variant="dark">Home</NavLink>
      </BottomBar>
    </AppShell>
  );
}
