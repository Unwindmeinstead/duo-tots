"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell, TopBar, Section, PageIntro, StageBadge, TopicTile, SpotlightCard, MiniStat } from "@/components/ui";
import { CATEGORY_ICONS } from "@/components/icons";
import { categories, STAGES } from "@/lib/vocab";
import { loadProgress, getCategoryMastery, getNextLesson } from "@/lib/progress";

const STAGE_BADGE: Record<string, string> = {
  foundation: "#1b4332",
  world: "#e76f51",
  advanced: "#6c5ce7",
};

export default function ExplorePage() {
  const [progress] = useState(() => loadProgress());
  const totalWords = categories.reduce((n, c) => n + c.items.length, 0);
  const nextLesson = getNextLesson(progress);
  const startedCount = categories.filter((cat) => getCategoryMastery(progress, cat.id) > 0).length;
  const completedStrong = categories.filter((cat) => getCategoryMastery(progress, cat.id) >= 80).length;

  return (
    <AppShell>
      <TopBar streak={progress.streak} xp={progress.stars} level={progress.level} dailyDone={progress.dailyDone} dailyGoal={progress.dailyGoal} wordsLearned={progress.practicedWords} totalWords={totalWords} />
      <PageIntro eyebrow="Browse" title="Explore" subtitle={`${categories.length} topics · ${totalWords} words`} />

      <Section className="pt-2">
        <SpotlightCard
          eyebrow="Map the library"
          title={`Next up: ${nextLesson.category.name}`}
          description="Every topic is still one tap away, but this page now surfaces where you’ve already built momentum and where the next gap is."
          accent="#e76f51"
        >
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <MiniStat label="Started" value={startedCount} tone="dark" />
            <MiniStat label="Strong" value={completedStrong} tone="dark" />
            <MiniStat label="Goal" value={`${progress.dailyDone}/${progress.dailyGoal}`} tone="dark" />
          </div>
          <Link
            href={`/lesson/${nextLesson.category.id}`}
            className="mt-4 inline-flex items-center rounded-[var(--radius-xl)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--coral)] transition-all hover:scale-[1.02] active:scale-[.98]"
          >
            Jump into recommended topic
          </Link>
        </SpotlightCard>
      </Section>

      {STAGES.map(({ id: stageId, label }) => {
        const stageCats = categories.filter((c) => c.stage === stageId);
        if (stageCats.length === 0) return null;
        const masteredCount = stageCats.filter((cat) => getCategoryMastery(progress, cat.id) >= 80).length;
        return (
          <Section key={stageId}>
            <StageBadge label={label} color={STAGE_BADGE[stageId] ?? "#1b4332"} meta={`${stageCats.length} topics · ${masteredCount} strong`} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {stageCats.map((cat) => {
                const CatIcon = CATEGORY_ICONS[cat.id];
                const mastery = getCategoryMastery(progress, cat.id);
                return (
                  <TopicTile
                    key={cat.id}
                    href={`/lesson/${cat.id}`}
                    color={cat.color}
                    label={cat.name}
                    icon={CatIcon ? <CatIcon size={24} /> : null}
                    mastery={mastery}
                  />
                );
              })}
            </div>
          </Section>
        );
      })}
      <div className="h-6" />
    </AppShell>
  );
}
