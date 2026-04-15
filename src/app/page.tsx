"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell, Section, LinkBtn, PageIntro, StageBadge, TopicRowCard, TopBar, SpotlightCard, MiniStat } from "@/components/ui";
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

  return (
    <AppShell>
      <TopBar streak={progress.streak} xp={progress.stars} level={progress.level} dailyDone={progress.dailyDone} dailyGoal={progress.dailyGoal} wordsLearned={progress.practicedWords} totalWords={totalWords} />
      <PageIntro eyebrow="Daily learning" title="Keep the momentum" subtitle={`${categories.length} topics · ${totalWords} words · ${dailyPct >= 100 ? "goal complete" : `${progress.dailyGoal - progress.dailyDone} to go today`}`} />

      <Section className="pt-2">
        <SpotlightCard
          eyebrow={progress.dailyDone >= progress.dailyGoal ? "Daily goal complete" : "Today's focus"}
          title={progress.dailyDone >= progress.dailyGoal ? "You’ve already hit today’s target." : `Build a quick win with ${rec.category.name}.`}
          description={progress.dailyDone >= progress.dailyGoal
            ? "Keep browsing, reinforce a weak topic, or jump into a short quiz while the streak is alive."
            : `You’ve opened ${openedTopics} topics so far. One short session keeps the streak healthy and moves your next lesson forward.`}
          accent="#1b4332"
        >
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <MiniStat label="Opened" value={`${openedTopics}/${categories.length}`} tone="dark" />
            <MiniStat label="Goal" value={`${progress.dailyDone}/${progress.dailyGoal}`} tone="dark" />
            <MiniStat label="Best" value={strongestCategory ? `${strongestCategory.cat.name} ${strongestCategory.mastery}%` : "Start"} tone="dark" />
          </div>
        </SpotlightCard>
      </Section>

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
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-white/70">
              <span className="rounded-full bg-white/10 px-2.5 py-1">{rec.category.items.length} words</span>
              <span className="rounded-full bg-white/10 px-2.5 py-1">
                {getCategoryMastery(progress, rec.category.id) > 0 ? `${getCategoryMastery(progress, rec.category.id)}% mastery` : "Fresh topic"}
              </span>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-lg)] bg-white/14 px-4 py-2.5 text-[13px] font-semibold backdrop-blur-md transition-all group-hover:bg-white/22">
              Continue <IconArrowRight size={16} />
            </div>
          </div>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[.06]">
            {RecIcon && <RecIcon size={120} />}
          </span>
        </Link>
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
