"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell, TopBar, PageIntro, Section, Card, SpotlightCard, MiniStat, LinkBtn } from "@/components/ui";
import { CATEGORY_ICONS, IconArrowRight, IconPlan } from "@/components/icons";
import { categories } from "@/lib/vocab";
import { getCategoryMastery, getNextLesson, loadProgress } from "@/lib/progress";
import { dailyRituals, getPhaseCategories, learningPhases, learningPrinciples, weeklyCadence } from "@/lib/learning-plan";

export function LearningPlanClient() {
  const [progress] = useState(() => loadProgress());
  const totalWords = categories.reduce((sum, category) => sum + category.items.length, 0);
  const recommendation = getNextLesson(progress);
  const bestCategory = useMemo(() => (
    categories
      .map((category) => ({ category, mastery: getCategoryMastery(progress, category.id) }))
      .filter((entry) => entry.mastery > 0)
      .sort((a, b) => b.mastery - a.mastery)[0]
  ), [progress]);

  return (
    <AppShell>
      <TopBar
        streak={progress.streak}
        xp={progress.stars}
        level={progress.level}
        dailyDone={progress.dailyDone}
        dailyGoal={progress.dailyGoal}
        wordsLearned={progress.practicedWords}
        totalWords={totalWords}
      />

      <PageIntro
        eyebrow="Learning System"
        title="Science-backed plan"
        subtitle="A compact operating system for teaching toddlers: short lessons, interactive talk, retrieval, and spaced review."
      />

      <Section className="pt-2">
        <SpotlightCard
          eyebrow="Operating model"
          title="Teach less at once. Repeat more often. Talk through every picture."
          description="The app should feel like a premium learning product, but the teaching model still has to stay simple enough for a busy adult to run daily."
          accent="#1b4332"
        >
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <MiniStat label="Daily" value="8-11 min" tone="dark" />
            <MiniStat label="Core loop" value="Learn Quiz Review" tone="dark" />
            <MiniStat label="Next" value={recommendation.category.name} tone="dark" />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/lesson/${recommendation.category.id}`}
              className="inline-flex items-center gap-2 rounded-[var(--radius-xl)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--accent)] transition-all hover:scale-[1.02] active:scale-[.98]"
            >
              Start recommended lesson <IconArrowRight size={16} />
            </Link>
            <Link
              href={bestCategory ? `/practice?category=${bestCategory.category.id}` : "/explore"}
              className="inline-flex items-center gap-2 rounded-[var(--radius-xl)] border border-white/18 bg-white/8 px-4 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-white/12 active:scale-[.98]"
            >
              {bestCategory ? `Review ${bestCategory.category.name}` : "Browse topics"}
            </Link>
          </div>
        </SpotlightCard>
      </Section>

      <Section>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--green-bg)] text-[var(--accent)]">
            <IconPlan size={18} />
          </span>
          <div>
            <p className="text-title">Five rules for durable learning</p>
            <p className="text-caption">These are the habits the product should reinforce everywhere.</p>
          </div>
        </div>
        <div className="grid gap-3">
          {learningPrinciples.map((principle) => (
            <Card key={principle.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-title">{principle.title}</p>
                  <p className="text-subtitle mt-1.5">{principle.summary}</p>
                </div>
                <span className="rounded-full bg-[var(--surface-secondary)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
                  Evidence
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1.1fr_.9fr]">
                <div className="rounded-[var(--radius-xl)] bg-[var(--surface-secondary)] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">What to do</p>
                  <p className="mt-1 text-[13px] font-medium leading-relaxed text-[var(--ink-secondary)]">{principle.action}</p>
                </div>
                <div className="rounded-[var(--radius-xl)] border border-[var(--border)] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">Source</p>
                  <p className="mt-1 text-[12px] font-medium leading-relaxed text-[var(--ink-secondary)]">{principle.evidence}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mb-3">
          <p className="text-title">Daily routine</p>
          <p className="text-subtitle mt-1">A premium product still needs a concrete ritual parents can actually repeat.</p>
        </div>
        <div className="grid gap-3">
          {dailyRituals.map((ritual) => (
            <Card key={ritual.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-title">{ritual.title}</p>
                <span className="rounded-full bg-[var(--coral-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--coral-dark)]">
                  {ritual.duration}
                </span>
              </div>
              <p className="text-subtitle mt-2">{ritual.outcome}</p>
              <div className="mt-4 grid gap-2">
                {ritual.steps.map((step) => (
                  <div key={step} className="rounded-[var(--radius-xl)] bg-[var(--surface-secondary)] px-4 py-3 text-[13px] font-medium text-[var(--ink-secondary)]">
                    {step}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mb-3">
          <p className="text-title">Weekly cadence</p>
          <p className="text-subtitle mt-1">Use novelty early in the week, then shift toward retrieval and real-world transfer.</p>
        </div>
        <Card className="overflow-hidden">
          <div className="grid divide-y divide-[var(--border)]">
            {weeklyCadence.map((item) => (
              <div key={item.day} className="grid gap-2 px-4 py-3.5 sm:grid-cols-[96px_120px_1fr] sm:items-start sm:gap-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">{item.day}</p>
                <p className="text-[13px] font-bold text-[var(--ink)]">{item.focus}</p>
                <p className="text-[13px] font-medium leading-relaxed text-[var(--ink-secondary)]">{item.move}</p>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section className="pb-4">
        <div className="mb-3">
          <p className="text-title">Pathways by phase</p>
          <p className="text-subtitle mt-1">The content library should feel intentionally sequenced, not like a flat topic list.</p>
        </div>
        <div className="grid gap-3">
          {learningPhases.map((phase) => (
            <Card key={phase.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-title">{phase.title}</p>
                  <p className="text-subtitle mt-1">{phase.description}</p>
                </div>
                <span className="rounded-full bg-[var(--surface-secondary)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
                  {phase.cadence}
                </span>
              </div>
              <div className="mt-4 rounded-[var(--radius-xl)] bg-[var(--surface-secondary)] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">Target</p>
                <p className="mt-1 text-[13px] font-medium leading-relaxed text-[var(--ink-secondary)]">{phase.target}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {getPhaseCategories(phase.categoryIds).map((category) => {
                  if (!category) return null;
                  const Icon = CATEGORY_ICONS[category.id];
                  return (
                    <Link
                      key={category.id}
                      href={`/lesson/${category.id}`}
                      className="inline-flex items-center gap-2 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[12px] font-semibold text-[var(--ink)] transition-all hover:bg-[var(--surface-secondary)]"
                    >
                      {Icon && <Icon size={14} />}
                      {category.name}
                    </Link>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pb-8">
        <div className="grid gap-3 sm:grid-cols-2">
          <LinkBtn href={`/lesson/${recommendation.category.id}`} className="w-full text-center">
            Start Today&apos;s Lesson
          </LinkBtn>
          <LinkBtn href="/explore" className="w-full text-center" color="#e76f51">
            Build Your Topic Mix
          </LinkBtn>
        </div>
      </Section>
    </AppShell>
  );
}
