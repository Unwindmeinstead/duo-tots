"use client";

/* ─── Explore ───
   Every topic in the reference card anatomy, grouped by stage on
   the white sheet. The royal hero card at the top carries the
   next-up lesson and the three honest stats (started / mastered /
   daily goal) — all derived from the same store fields Home and
   Progress read. */

import { useState } from "react";
import {
  BlueHeader,
  PillButton,
  SectionHead,
  TopicCard,
  WaveSheet,
} from "@/components/kit";
import { categories, STAGES } from "@/lib/vocab";
import {
  loadProgress,
  getCategoryMastery,
  getCategoryStars,
  getNextLesson,
  getDailyGoalState,
} from "@/lib/progress";

export default function ExplorePage() {
  const [progress] = useState(() => loadProgress());
  const totalWords = categories.reduce((n, c) => n + c.items.length, 0);
  const nextLesson = getNextLesson(progress);

  const xp = progress.xp ?? 0;
  const dailyState = getDailyGoalState(progress);

  const startedCount = categories.filter((cat) => getCategoryMastery(progress, cat.id) > 0).length;
  const masteredCount = categories.filter((cat) => getCategoryMastery(progress, cat.id) >= 80).length;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col bg-royal">
      <BlueHeader streak={progress.streak} xp={xp} />

      <div className="blue-rings px-5 pb-1 pt-1">
        <h1 className="text-[32px] font-black leading-tight tracking-tight text-white">
          Explore
        </h1>
        <p className="mt-1 text-[15px] font-bold text-white/70">
          {categories.length} topics · {totalWords} words to discover
        </p>
      </div>

      <WaveSheet className="px-4 pb-[var(--tab-float-space)] pt-5 min-[402px]:px-5">
        <div className="mx-auto flex w-full max-w-md flex-col gap-8">
          {/* ── Next-up hero card ── */}
          <div className="rounded-[28px] bg-royal-deep p-5 text-white shadow-[0_12px_32px_rgba(14,42,99,0.14)]">
            <p className="text-[13px] font-black uppercase tracking-wider text-white/60">
              Next up
            </p>
            <h2 className="mt-1 text-[26px] font-black leading-tight">
              {nextLesson.category.name}
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: "Started", value: String(startedCount) },
                { label: "Mastered", value: String(masteredCount) },
                { label: "Daily goal", value: `${dailyState.done}/${dailyState.goal}` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-[18px] bg-white/10 px-3 py-2.5">
                  <p className="text-[12px] font-black uppercase tracking-wide text-white/60">
                    {stat.label}
                  </p>
                  <p className="mt-0.5 text-[19px] font-black tabular-nums">{stat.value}</p>
                </div>
              ))}
            </div>
            <PillButton
              href={`/lesson/${nextLesson.category.id}`}
              color="#FFFFFF"
              ink="#1748AC"
              className="mt-4 w-full"
            >
              Start {nextLesson.category.name}
            </PillButton>
          </div>

          {/* ── Stage sections ── */}
          {STAGES.map(({ id: stageId, label }) => {
            const stageCats = categories.filter((c) => c.stage === stageId);
            if (stageCats.length === 0) return null;
            const mastered = stageCats.filter((cat) => getCategoryMastery(progress, cat.id) >= 80).length;
            return (
              <section key={stageId} aria-label={label}>
                <SectionHead
                  title={label}
                  sub={`${stageCats.length} topics · ${mastered} mastered`}
                />
                <div className="mt-3.5 flex flex-col gap-4">
                  {stageCats.map((cat) => (
                    <TopicCard
                      key={cat.id}
                      category={cat}
                      stars={getCategoryStars(progress, cat.id)}
                      mastery={getCategoryMastery(progress, cat.id)}
                      done={getCategoryStars(progress, cat.id) >= 3}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </WaveSheet>
    </main>
  );
}
