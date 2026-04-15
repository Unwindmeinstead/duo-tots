"use client";

import { useState } from "react";
import { VOICE_MODE_KEY, type VoiceMode } from "@/lib/audio";
import { AppShell, TopBar, PageHeader, Section, Card, StatCard, BtnPrimary, BtnSurface } from "@/components/ui";
import { IconFire, IconStar, IconTrophy } from "@/components/icons";
import { initialProgress, loadProgress, saveProgress, type ProgressState } from "@/lib/progress";
import { categories, categoriesById, type CategoryId } from "@/lib/vocab";
import { CATEGORY_ICONS } from "@/components/icons";

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
      .filter((k) => k.startsWith("duotots-img3:") || k.startsWith("duotots-audio:"))
      .forEach((k) => window.localStorage.removeItem(k));
  };

  const areaPerformance = Object.entries(progress.categoryStats)
    .map(([catId, stats]) => ({
      id: catId as CategoryId, ...stats,
      accuracy: stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  const topWords = Object.entries(progress.wordStats)
    .map(([word, s]) => ({ word, ...s, score: s.correct - s.wrong }))
    .sort((a, b) => b.score - a.score).slice(0, 8);

  const struggles = Object.entries(progress.wordStats)
    .map(([word, s]) => ({ word, ...s }))
    .sort((a, b) => b.wrong - a.wrong || a.correct - b.correct)
    .filter((e) => e.wrong > 0).slice(0, 8);

  const totalWords = categories.reduce((n, c) => n + c.items.length, 0);

  return (
    <AppShell>
      <TopBar streak={progress.streak} xp={progress.stars} level={progress.level} dailyDone={progress.dailyDone} dailyGoal={progress.dailyGoal} wordsLearned={progress.practicedWords} totalWords={totalWords} />

      <div className="px-5 pt-4 pb-2">
        <p className="text-overline">Your journey</p>
        <h1 className="text-headline mt-1">Progress</h1>
      </div>

      <PageHeader>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<IconStar size={22} />} value={progress.stars} label="XP" bg="#1b4332" dark />
          <StatCard icon={<IconFire size={22} />} value={progress.streak} label="Streak" bg="#e76f51" dark />
          <StatCard icon={<IconTrophy size={22} />} value={progress.practicedWords} label="Words" bg="#f0c040" />
        </div>

        <div className="surface-soft mt-3 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold tracking-tight text-[var(--ink)]">Level {progress.level}</p>
            <p className="text-[12px] font-medium tabular-nums text-[var(--ink-tertiary)]">{progress.stars} / {progress.level * 50} XP</p>
          </div>
          <div className="mt-2.5 h-3 overflow-hidden rounded-full bg-[var(--surface-secondary)]">
            <div className="progress-bar h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.round((progress.stars % 50) / 50 * 100)}%` }} />
          </div>
        </div>
      </PageHeader>

      {progress.completedCategories.length > 0 && (
        <Section>
          <p className="text-overline mb-3">Visited topics</p>
          <div className="flex flex-wrap gap-2">
            {progress.completedCategories.map((id) => {
              const cat = categoriesById[id];
              if (!cat) return null;
              const CatIcon = CATEGORY_ICONS[id];
              return (
                <span key={id} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-bold text-white" style={{ background: cat.color }}>
                  {CatIcon && <CatIcon size={14} />} {cat.name}
                </span>
              );
            })}
          </div>
        </Section>
      )}

      {areaPerformance.length > 0 && (
        <Section>
          <p className="text-overline mb-3">Performance</p>
          <Card className="divide-y divide-[var(--border)]">
            {areaPerformance.map((area) => {
              const cat = categoriesById[area.id];
              if (!cat) return null;
              const CatIcon = CATEGORY_ICONS[area.id];
              return (
                <div key={area.id} className="flex items-center gap-3.5 px-4 py-3.5">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${cat.color}14`, color: cat.color }}>
                    {CatIcon && <CatIcon size={20} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold text-[var(--ink)]">{cat.name}</p>
                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-secondary)]">
                      <div className="progress-bar h-full rounded-full" style={{ width: `${area.accuracy}%`, background: cat.color }} />
                    </div>
                  </div>
                  <span className="text-[15px] font-black" style={{ color: cat.color }}>{area.accuracy}%</span>
                </div>
              );
            })}
          </Card>
        </Section>
      )}

      <Section>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-overline mb-3">Top words</p>
            <Card className="divide-y divide-[var(--border)]">
              {topWords.length === 0
                ? <p className="px-4 py-8 text-center text-[13px] text-[var(--ink-tertiary)]">Practice to see</p>
                : topWords.map((w) => (
                  <div key={w.word} className="flex items-center justify-between px-3.5 py-3">
                    <span className="text-[13px] font-bold text-[var(--ink)]">{w.word}</span>
                    <span className="rounded-lg px-2 py-1 text-[11px] font-bold text-white" style={{ background: "#00b894" }}>{w.correct}/{w.attempts}</span>
                  </div>
                ))
              }
            </Card>
          </div>
          <div>
            <p className="text-overline mb-3">Needs work</p>
            <Card className="divide-y divide-[var(--border)]">
              {struggles.length === 0
                ? <p className="px-4 py-8 text-center text-[13px] text-[var(--ink-tertiary)]">No struggles</p>
                : struggles.map((w) => (
                  <div key={w.word} className="flex items-center justify-between px-3.5 py-3">
                    <span className="text-[13px] font-bold text-[var(--ink)]">{w.word}</span>
                    <span className="rounded-lg px-2 py-1 text-[11px] font-bold text-white" style={{ background: "#e76f51" }}>{w.wrong}x</span>
                  </div>
                ))
              }
            </Card>
          </div>
        </div>
      </Section>

      <Section className="pb-8">
        <p className="text-overline mb-3">Settings</p>
        <Card className="p-5">
          <p className="mb-3 text-[14px] font-bold text-[var(--ink)]">Voice Mode</p>
          <div className="flex gap-2">
            {(["auto", "gentle", "clear"] as VoiceMode[]).map((mode) => (
              voiceMode === mode
                ? <BtnPrimary key={mode} onClick={() => setMode(mode)} className="flex-1 text-[13px] capitalize">{mode}</BtnPrimary>
                : <BtnSurface key={mode} onClick={() => setMode(mode)} className="flex-1 text-[13px] capitalize">{mode}</BtnSurface>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <BtnSurface onClick={clearMediaCache} className="flex-1 text-[13px]">Clear Cache</BtnSurface>
            <BtnPrimary color="#e76f51" onClick={reset} className="flex-1 text-[13px]">Reset All</BtnPrimary>
          </div>
        </Card>
      </Section>
    </AppShell>
  );
}
