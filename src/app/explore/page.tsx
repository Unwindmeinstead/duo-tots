"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell, TopBar, Section, MasteryRing } from "@/components/ui";
import { CATEGORY_ICONS } from "@/components/icons";
import { categories, STAGES } from "@/lib/vocab";
import { loadProgress, getCategoryMastery } from "@/lib/progress";

const STAGE_BADGE: Record<string, string> = {
  foundation: "#1b4332",
  world: "#e76f51",
  advanced: "#6c5ce7",
};

export default function ExplorePage() {
  const [progress] = useState(() => loadProgress());

  return (
    <AppShell>
      <TopBar streak={progress.streak} xp={progress.stars} level={progress.level} dailyDone={progress.dailyDone} dailyGoal={progress.dailyGoal} wordsLearned={progress.practicedWords} totalWords={categories.reduce((n, c) => n + c.items.length, 0)} />

      <div className="px-5 pt-4 pb-2">
        <p className="text-overline">Browse</p>
        <h1 className="text-headline mt-1">Explore</h1>
        <p className="text-subtitle mt-1.5">{categories.length} topics · {categories.reduce((n, c) => n + c.items.length, 0)} words</p>
      </div>

      {STAGES.map(({ id: stageId, label }) => {
        const stageCats = categories.filter((c) => c.stage === stageId);
        if (stageCats.length === 0) return null;
        return (
          <Section key={stageId}>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-7 items-center rounded-lg px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-white" style={{ background: STAGE_BADGE[stageId] ?? "#1b4332" }}>
                {label}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {stageCats.map((cat) => {
                const CatIcon = CATEGORY_ICONS[cat.id];
                const mastery = getCategoryMastery(progress, cat.id);
                return (
                  <Link key={cat.id} href={`/lesson/${cat.id}`}
                    className="surface-soft group flex flex-col items-center gap-2.5 p-4 text-center transition-all hover:scale-[1.03] active:scale-[.97]"
                  >
                    <MasteryRing pct={mastery} color={cat.color} size={56}>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${cat.color}14`, color: cat.color }}>
                        {CatIcon && <CatIcon size={24} />}
                      </span>
                    </MasteryRing>
                    <div>
                      <p className="text-[12px] font-semibold leading-tight tracking-tight text-[var(--ink)]">{cat.name}</p>
                      {mastery > 0 && <p className="mt-0.5 text-[10px] font-semibold tabular-nums" style={{ color: cat.color }}>{mastery}%</p>}
                    </div>
                  </Link>
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
