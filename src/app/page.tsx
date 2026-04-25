"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell, Section, LinkBtn, PageIntro, StageBadge, TopicRowCard, TopBar, MiniStat } from "@/components/ui";
import { IconArrowRight, CATEGORY_ICONS } from "@/components/icons";
import { categories, STAGES } from "@/lib/vocab";
import { loadProgress, getNextLesson, getCategoryMastery } from "@/lib/progress";

const STAGE_BADGE: Record<string, { bg: string; text: string }> = {
  foundation: { bg: "#1b4332", text: "#fff" },
  world: { bg: "#e76f51", text: "#fff" },
  advanced: { bg: "#6c5ce7", text: "#fff" },
};

export default function Home() {
  const [progress] = useState(() => loadProgress());
  const rec = getNextLesson(progress);
  const totalWords = categories.reduce((n, c) => n + c.items.length, 0);
  const openedTopics = progress.completedCategories.length;
  const strongestCategory = categories
    .map((cat) => ({ cat, mastery: getCategoryMastery(progress, cat.id) }))
    .filter((entry) => entry.mastery > 0)
    .sort((a, b) => b.mastery - a.mastery)[0];
  const foundationCount = categories.filter((cat) => cat.stage === "foundation").length;
  const RecIcon = CATEGORY_ICONS[rec.category.id];
  const dailyPct = progress.dailyGoal > 0 ? Math.min(100, Math.round((progress.dailyDone / progress.dailyGoal) * 100)) : 0;
  const goalMet = progress.dailyDone >= progress.dailyGoal;
  const recMastery = getCategoryMastery(progress, rec.category.id);
  const lessonLine = goalMet
    ? "Daily goal met — tap for a quick session or browse topics."
    : `${rec.category.items.length} words · ${recMastery > 0 ? `${recMastery}% progress` : "New"} · ${progress.dailyGoal - progress.dailyDone} answers to goal`;

  return (
    <AppShell>
      <TopBar streak={progress.streak} xp={progress.stars} level={progress.level} dailyDone={progress.dailyDone} dailyGoal={progress.dailyGoal} wordsLearned={progress.practicedWords} totalWords={totalWords} />
      <PageIntro eyebrow="Daily learning" title="Keep the momentum" subtitle={`${categories.length} topics · ${totalWords} words · ${dailyPct >= 100 ? "goal complete" : `${progress.dailyGoal - progress.dailyDone} to go today`}`} />

      {/* One compact card: next lesson + optional stats (details) */}
      <div className="px-5 pt-2 pb-1">
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
          <Link
            href={`/lesson/${rec.category.id}`}
            className="group flex items-center gap-3 p-3.5 transition-colors hover:bg-[var(--surface-secondary)] active:bg-[var(--surface-secondary)]"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: `${rec.category.color}18`, color: rec.category.color }}
            >
              {RecIcon ? <RecIcon size={22} /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">{goalMet ? "Daily goal" : "Next up"} · {rec.reason}</p>
              <h2 className="mt-0.5 truncate text-[1.05rem] font-extrabold leading-tight tracking-tight text-[var(--ink)]">{rec.category.name}</h2>
              <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-snug text-[var(--ink-secondary)]">{lessonLine}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-full border border-[color:var(--border)] bg-[var(--bg)] px-3 py-2 text-[12px] font-semibold text-[var(--ink)] shadow-[var(--shadow-xs)] transition-transform group-hover:translate-x-0.5 group-active:scale-95">
              Start <IconArrowRight size={15} className="text-[var(--ink-secondary)]" />
            </span>
          </Link>

          <details className="group border-t border-[color:var(--border)] bg-[var(--bg)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3.5 py-2.5 text-[11px] font-semibold text-[var(--ink-secondary)] transition-colors hover:text-[var(--ink)] [&::-webkit-details-marker]:hidden">
              <span>Today and library</span>
              <IconArrowRight size={14} className="shrink-0 text-[var(--ink-tertiary)] transition-transform group-open:rotate-90" />
            </summary>
            <div className="border-t border-[color:var(--border)] px-3 pb-3 pt-2">
              <p className="mb-2.5 text-[12px] leading-relaxed text-[var(--ink-secondary)]">
                {goalMet
                  ? "Nice work on today’s goal. Peek at stats or run another topic while your streak is hot."
                  : `You’ve opened ${openedTopics} of ${categories.length} topics. One short lesson keeps momentum and chips away at the daily goal.`}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <MiniStat label="Opened" value={`${openedTopics}/${categories.length}`} tone="light" />
                <MiniStat label="Today" value={`${progress.dailyDone}/${progress.dailyGoal}`} tone="light" />
                <div title={strongestCategory ? strongestCategory.cat.name : undefined}>
                  <MiniStat label="Top topic" value={strongestCategory ? `${strongestCategory.mastery}%` : "—"} tone="light" />
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* ── Categories by stage ── */}
      {STAGES.map(({ id: stageId, label }) => {
        const stageCats = categories.filter((c) => c.stage === stageId);
        if (stageCats.length === 0) return null;
        const badge = STAGE_BADGE[stageId] ?? STAGE_BADGE.foundation;
        return (
          <Section key={stageId}>
            <StageBadge label={label} color={badge.bg} meta={`${stageCats.length} topics`} />
            {stageId === "foundation" && (
              <div className="mb-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[13px] font-medium text-[var(--ink-secondary)]" style={{ boxShadow: "var(--shadow-xs)" }}>
                Start with the foundation path. It covers {foundationCount} essential toddler-first topics before the world and advanced tracks open up.
              </div>
            )}
            <div className="grid gap-2.5">
              {stageCats.map((cat) => {
                const CatIcon = CATEGORY_ICONS[cat.id];
                const mastery = getCategoryMastery(progress, cat.id);
                return (
                  <TopicRowCard
                    key={cat.id}
                    href={`/lesson/${cat.id}`}
                    color={cat.color}
                    label={cat.name}
                    meta={`${cat.items.length} words${mastery > 0 ? ` · ${mastery}% mastered` : ""}`}
                    icon={CatIcon ? <CatIcon size={24} /> : null}
                    mastery={mastery}
                  />
                );
              })}
            </div>
          </Section>
        );
      })}

      <Section className="pb-8">
        <div className="grid gap-3 sm:grid-cols-2">
          <LinkBtn href="/explore" className="w-full text-center">Browse All Topics</LinkBtn>
          <LinkBtn href="/progress" className="w-full text-center" color="#e76f51">View All Stats</LinkBtn>
        </div>
      </Section>
    </AppShell>
  );
}
