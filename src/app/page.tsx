"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell, Section, MasteryRing, LinkBtn } from "@/components/ui";
import { IconArrowRight, IconFire, IconStar, IconTrophy, IconCheck, CATEGORY_ICONS } from "@/components/icons";
import { categories, STAGES } from "@/lib/vocab";
import { loadProgress, getNextLesson, getCategoryMastery } from "@/lib/progress";

const STAGE_BADGE: Record<string, { bg: string; text: string }> = {
  foundation: { bg: "#1b4332", text: "#fff" },
  world: { bg: "#e76f51", text: "#fff" },
  advanced: { bg: "#6c5ce7", text: "#fff" },
};

function ProgressRing({ pct, color, size, stroke, children }: { pct: number; color: string; size: number; stroke: number; children: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}18`} strokeWidth={stroke} />
        {pct > 0 && <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${(pct / 100) * c} ${c}`} strokeLinecap="round" className="transition-all duration-700" />}
      </svg>
      <span className="relative">{children}</span>
    </div>
  );
}

export default function Home() {
  const [progress] = useState(() => loadProgress());
  const rec = getNextLesson(progress);
  const totalWords = categories.reduce((n, c) => n + c.items.length, 0);
  const RecIcon = CATEGORY_ICONS[rec.category.id];
  const dailyPct = progress.dailyGoal > 0 ? Math.min(100, Math.round((progress.dailyDone / progress.dailyGoal) * 100)) : 0;
  const levelPct = Math.round(((progress.stars % 50) / 50) * 100);
  const wordsPct = totalWords > 0 ? Math.min(100, Math.round((progress.practicedWords / totalWords) * 100)) : 0;

  return (
    <AppShell>
      {/* ── Top stats panel ── */}
      <div className="surface-elevated mx-4 mt-4 p-5">
        {/* Row 1: greeting + level */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-overline">Welcome back</p>
            <h1 className="text-display mt-1">
              Let&apos;s learn <span className="text-[var(--accent)]">today</span>
            </h1>
          </div>
          <Link href="/progress" className="flex flex-col items-center rounded-2xl px-3 py-2 transition-all hover:bg-[var(--surface-secondary)]">
            <ProgressRing pct={levelPct} color="#6c5ce7" size={44} stroke={4}>
              <span className="text-[12px] font-semibold tabular-nums text-[#6c5ce7]">{progress.level}</span>
            </ProgressRing>
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">Level</span>
          </Link>
        </div>

        {/* Row 2: four inline metric chips */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          <Link href="/progress" className="flex flex-col items-center rounded-xl bg-[var(--bg)] py-2.5 transition-all hover:scale-[1.03]">
            <span className="flex items-center gap-1">
              <IconFire size={14} className="text-[#e76f51]" />
              <span className="text-[15px] font-semibold tabular-nums text-[var(--ink)]">{progress.streak}</span>
            </span>
            <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">Streak</span>
          </Link>
          <Link href="/progress" className="flex flex-col items-center rounded-xl bg-[var(--bg)] py-2.5 transition-all hover:scale-[1.03]">
            <span className="flex items-center gap-1">
              <IconStar size={14} className="text-[#daa520]" />
              <span className="text-[15px] font-semibold tabular-nums text-[var(--ink)]">{progress.stars}</span>
            </span>
            <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">XP</span>
          </Link>
          <Link href="/progress" className="flex flex-col items-center rounded-xl bg-[var(--bg)] py-2.5 transition-all hover:scale-[1.03]">
            <span className="flex items-center gap-1">
              <IconCheck size={14} className="text-[#00b894]" />
              <span className="text-[15px] font-semibold tabular-nums text-[var(--ink)]">{progress.dailyDone}<span className="text-[var(--ink-tertiary)]">/{progress.dailyGoal}</span></span>
            </span>
            <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">Today</span>
          </Link>
          <Link href="/progress" className="flex flex-col items-center rounded-xl bg-[var(--bg)] py-2.5 transition-all hover:scale-[1.03]">
            <span className="flex items-center gap-1">
              <IconTrophy size={14} className="text-[#e84393]" />
              <span className="text-[15px] font-semibold tabular-nums text-[var(--ink)]">{progress.practicedWords}</span>
            </span>
            <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">Words</span>
          </Link>
        </div>

        {/* Row 3: daily progress bar */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--bg)]">
              <div className="progress-bar h-full rounded-full bg-[#00b894]" style={{ width: `${dailyPct}%` }} />
            </div>
          </div>
          <span className="text-[11px] font-semibold tabular-nums" style={{ color: dailyPct >= 100 ? "#00b894" : "var(--ink-tertiary)" }}>
            {dailyPct >= 100 ? "Done!" : `${dailyPct}%`}
          </span>
        </div>

        {/* Row 4: words mastered bar */}
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--bg)]">
              <div className="progress-bar h-full rounded-full bg-[#6c5ce7]" style={{ width: `${wordsPct}%` }} />
            </div>
          </div>
          <span className="text-[11px] font-semibold tabular-nums text-[var(--ink-tertiary)]">{wordsPct}% vocab</span>
        </div>
      </div>

      {/* ── Guided lesson hero ── */}
      <div className="px-4 pt-4 pb-1">
        <Link href={`/lesson/${rec.category.id}`}
          className="group relative flex overflow-hidden rounded-[var(--radius-2xl)] border border-white/10 p-5 text-white transition-all hover:scale-[1.01] active:scale-[.98]"
          style={{ background: "linear-gradient(145deg, #1b4332 0%, #143328 100%)", boxShadow: "0 12px 40px rgba(27,67,50,.28)" }}
        >
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/5" />
          <div className="relative flex-1">
            <p className="inline-block rounded-full bg-[var(--coral)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]">{rec.reason}</p>
            <h2 className="mt-2 text-[1.25rem] font-extrabold leading-tight tracking-tight">{rec.category.name}</h2>
            <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-white/72">{rec.category.description}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-lg)] bg-white/14 px-4 py-2.5 text-[13px] font-semibold backdrop-blur-md transition-all group-hover:bg-white/22">
              Continue <IconArrowRight size={16} />
            </div>
          </div>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[.06]">
            {RecIcon && <RecIcon size={120} />}
          </span>
        </Link>
      </div>

      {/* ── Topic count ── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-1">
        <p className="text-caption font-medium text-[var(--ink-secondary)]">{categories.length} topics · {totalWords} words</p>
      </div>

      {/* ── Categories by stage ── */}
      {STAGES.map(({ id: stageId, label }) => {
        const stageCats = categories.filter((c) => c.stage === stageId);
        if (stageCats.length === 0) return null;
        const badge = STAGE_BADGE[stageId] ?? STAGE_BADGE.foundation;
        return (
          <Section key={stageId}>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-7 items-center rounded-lg px-3 text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ background: badge.bg, color: badge.text }}>
                {label}
              </span>
              <span className="text-[12px] font-medium text-[var(--ink-tertiary)]">{stageCats.length} topics</span>
            </div>
            <div className="grid gap-2.5">
              {stageCats.map((cat) => {
                const CatIcon = CATEGORY_ICONS[cat.id];
                const mastery = getCategoryMastery(progress, cat.id);
                return (
                  <Link key={cat.id} href={`/lesson/${cat.id}`}
                    className="surface-soft group flex items-center gap-4 p-4 transition-all hover:scale-[1.01] active:scale-[.98]"
                  >
                    <MasteryRing pct={mastery} color={cat.color} size={58}>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${cat.color}14`, color: cat.color }}>
                        {CatIcon && <CatIcon size={24} />}
                      </span>
                    </MasteryRing>
                    <div className="min-w-0 flex-1">
                      <p className="text-title">{cat.name}</p>
                      <p className="mt-0.5 text-caption font-medium">
                        {cat.items.length} words{mastery > 0 ? ` · ${mastery}% mastered` : ""}
                      </p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--ink-tertiary)] transition-all group-hover:bg-[var(--surface-secondary)] group-hover:text-[var(--ink)]">
                      <IconArrowRight size={16} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </Section>
        );
      })}

      <Section className="pb-8">
        <LinkBtn href="/progress" className="w-full text-center">View All Stats</LinkBtn>
      </Section>
    </AppShell>
  );
}
