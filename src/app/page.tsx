"use client";

/* ─── Home ───
   The Kidtopia front door: royal-blue hero with Pip center stage,
   then the white sheet (wave edge) holding the daily goal, the
   next-up card, the Play Zone card and the learning path as chunky
   topic cards grouped by stage. */

import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArtTile,
  BlueHeader,
  GoalRing,
  PillButton,
  SectionHead,
  TopicCard,
  WaveSheet,
} from "@/components/kit";
import { Mascot } from "@/components/mascot";
import { GlyphChevronR, GlyphPlay, GlyphPuzzle } from "@/components/glyphs";
import { CelebrationScreen } from "@/components/celebration";
import { categories, STAGES } from "@/lib/vocab";
import { WORLD_LESSONS, worldNodeId } from "@/lib/world-book";
import {
  loadProgress,
  saveProgress,
  getNextLesson,
  getCategoryMastery,
  getLevelInfo,
  getCategoryStars,
  getDailyGoalState,
} from "@/lib/progress";
import { playCelebration, playPop, playStarChime } from "@/lib/audio";
import { tint } from "@/lib/theme";

type LevelInfo = ReturnType<typeof getLevelInfo>;

/* Stage-end landmark: a quiet wide marker that closes each stage
   group — pale wash of the stage colour, flag medallion, label. */
function StageLandmark({ label, color }: { label: string; color: string }) {
  return (
    <div
      aria-hidden
      className="flex items-center justify-center gap-3 rounded-[24px] px-4 py-3.5"
      style={{ background: tint(color, 0.9) }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill={color} aria-hidden>
        <path d="M6.5 3.2a1 1 0 0 1 2 .3c1.4-.6 2.6.2 4 .2 1.2 0 2.4-.5 3.5-.2.5.1.9.6.9 1.1v5.2c0 .6-.5 1-1 .9-1.3-.4-2.5.2-3.9.2-1.5 0-2.7-.8-4-.2v9.6a1.2 1.2 0 0 1-2.4 0V3.9c0-.4.4-.7.9-.7Z" />
      </svg>
      <span className="text-[14px] font-black uppercase tracking-wide text-ink">
        {label}
      </span>
    </div>
  );
}

export default function Home() {
  const [progress, setProgress] = useState(() => loadProgress());
  const [showLevelUp, setShowLevelUp] = useState<LevelInfo | null>(null);
  const levelCheckedRef = useRef(false);

  const xp = progress.xp ?? 0;
  const dailyState = getDailyGoalState(progress);
  const goalMet = dailyState.met;

  const rec = getNextLesson(progress);
  const recMastery = getCategoryMastery(progress, rec.category.id);
  const remainingWords = Math.max(dailyState.goal - dailyState.done, 0);
  const lessonLine = goalMet
    ? `${rec.category.items.length} words${recMastery > 0 ? ` · ${recMastery}% mastered` : ""} · Goal done`
    : `${rec.category.items.length} words${recMastery > 0 ? ` · ${recMastery}% mastered` : ""} · ${remainingWords} more for today's goal`;

  /* Path nodes derive from the catalog in stage order. When the
     next-up hero IS the path's first topic, the path does not repeat
     it underneath — the hero card is that topic's entry point.
     currentId is computed on the unfiltered list, so the excluded
     tile never renders a START bubble; the hero carries the call. */
  const orderedCats = STAGES.flatMap((s) => categories.filter((c) => c.stage === s.id));
  const heroDupId = rec.category.id === orderedCats[0]?.id ? rec.category.id : null;
  const pathGroups = STAGES.map((s) => ({
    stage: s,
    cats: categories.filter((c) => c.stage === s.id && c.id !== heroDupId),
    count: categories.filter((c) => c.stage === s.id).length,
  }));
  const currentId = orderedCats.find((c) => getCategoryStars(progress, c.id) === 0)?.id;

  /* Exactly one current stop on the whole screen: the first
     unstarred category; world lessons become current only when
     every category already has a star. */
  const worldCurrentId = currentId
    ? undefined
    : WORLD_LESSONS.find((l) => getCategoryStars(progress, worldNodeId(l.id)) === 0)?.id;

  /* Level-up celebration: fires once on mount when the saved
     levelCelebrated marker is behind the level the XP already earns. */
  useEffect(() => {
    if (levelCheckedRef.current) return;
    levelCheckedRef.current = true;
    const info = getLevelInfo(progress.xp ?? 0);
    if (info.level > (progress.levelCelebrated ?? 1)) {
      setShowLevelUp(info);
      playCelebration();
      playStarChime();
    }
    // Mount-only check against the initially loaded progress snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const collectLevelUp = () => {
    if (!showLevelUp) return;
    playPop();
    const next = { ...progress, levelCelebrated: showLevelUp.level };
    saveProgress(next);
    setProgress(next);
    setShowLevelUp(null);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col bg-royal">
      <BlueHeader streak={progress.streak} xp={xp} />

      {/* ── Hero: headline + Pip center stage, melting into the blue ── */}
      <div className="blue-rings relative px-5 pb-0 pt-1">
        <h1 className="text-[32px] font-black leading-[1.08] tracking-tight text-white">
          Let&apos;s learn
          <br />
          and play!
        </h1>
        <p className="mt-1.5 text-[15px] font-bold text-white/70">
          Pick a card and let&apos;s go
        </p>
        <div className="pointer-events-none relative z-0 mx-auto -mb-16 mt-1 w-[min(320px,84vw)]">
          <Mascot
            pose="hero"
            size={320}
            className="[mask-image:radial-gradient(ellipse_72%_72%_at_50%_46%,black_58%,transparent_76%)]"
          />
        </div>
      </div>

      <div className="relative z-10">
        <WaveSheet className="px-4 pb-[var(--tab-float-space)] pt-5 min-[402px]:px-5">
          <div className="mx-auto flex w-full max-w-md flex-col gap-7">
            {/* ── Daily goal ── */}
            <div className="kt-card flex items-center gap-4 p-4">
              <GoalRing done={dailyState.done} goal={dailyState.goal} />
              <div className="min-w-0 flex-1">
                <p className="text-[19px] font-black text-ink">
                  {goalMet ? "Daily goal done" : "Daily goal"}
                </p>
                <p className="mt-0.5 text-[14.5px] font-bold text-soft">
                  {dailyState.done} of {dailyState.goal} words today
                </p>
              </div>
              {goalMet && (
                <span className="rounded-full bg-cream px-3 py-1.5 text-[13px] font-black text-gold-deep">
                  Great job!
                </span>
              )}
            </div>

            {/* ── Next up ── */}
            <section aria-label="Next lesson">
              <SectionHead title="Next up" sub={rec.reason} />
              <Link
                href={`/lesson/${rec.category.id}`}
                onClick={() => playPop()}
                className="kt-card mt-3 flex items-center gap-3.5 p-3.5"
              >
                <ArtTile category={rec.category} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[19px] font-black leading-tight text-ink">
                    {rec.category.name}
                  </span>
                  <span className="mt-0.5 block text-[13.5px] font-bold leading-snug text-soft">
                    {lessonLine}
                  </span>
                </span>
                <PillButton small color={rec.category.color} className="pointer-events-none shrink-0 self-end">
                  Start
                </PillButton>
              </Link>
            </section>

            {/* ── Play Zone ── */}
            <Link
              href="/play"
              onClick={() => playPop()}
              className="flex items-center gap-4 rounded-[28px] bg-royal-deep p-4 text-white shadow-[0_12px_32px_rgba(14,42,99,0.14)]"
              aria-label="Play games"
            >
              <span className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-[22px] bg-white/15">
                <GlyphPuzzle size={36} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[20px] font-black leading-tight">
                  Play Zone
                </span>
                <span className="mt-0.5 block text-[13.5px] font-bold text-white/70">
                  Sort, stack, match and fix
                </span>
              </span>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-royal">
                <GlyphPlay size={22} />
              </span>
            </Link>

            {/* ── Learning path by stage (+ World after Foundation) ── */}
            {pathGroups.map((group) => {
              if (group.cats.length === 0) return null;
              return (
                <Fragment key={group.stage.id}>
                  <section aria-label={group.stage.label}>
                    <SectionHead
                      title={group.stage.label}
                      sub={`${group.count} topics`}
                    />
                    <div className="mt-3.5 flex flex-col gap-4">
                      {group.cats.map((cat) => (
                        <TopicCard
                          key={cat.id}
                          category={cat}
                          stars={getCategoryStars(progress, cat.id)}
                          mastery={getCategoryMastery(progress, cat.id)}
                          current={cat.id === currentId}
                          done={getCategoryStars(progress, cat.id) >= 3}
                        />
                      ))}
                      <StageLandmark
                        label={group.stage.label}
                        color={categories.find((c) => c.stage === group.stage.id)?.color ?? group.cats[0].color}
                      />
                    </div>
                  </section>

                  {group.stage.id === "foundation" && WORLD_LESSONS.length > 0 && (
                    <section aria-label="How the World Works">
                      <SectionHead
                        title="How the World Works"
                        sub={`${WORLD_LESSONS.length} little lessons about real life`}
                      />
                      <div className="mt-3.5 flex flex-col gap-4">
                        {WORLD_LESSONS.map((lesson) => {
                          const stars = getCategoryStars(progress, worldNodeId(lesson.id));
                          return (
                            <div key={lesson.id} className="relative">
                              {lesson.id === worldCurrentId && (
                                <span className="kt-bob absolute -top-4 left-24 z-10 rounded-full bg-gold px-3.5 py-1 text-[13px] font-black text-ink shadow-[0_8px_20px_rgba(14,42,99,0.18)]">
                                  START
                                </span>
                              )}
                              <Link
                                href={`/world/${lesson.id}`}
                                onClick={() => playPop()}
                                className="kt-card flex items-center gap-3.5 p-3.5"
                              >
                                <span
                                  className="grid h-[84px] w-[84px] shrink-0 place-items-center overflow-hidden text-white"
                                  style={{
                                    borderRadius: 24,
                                    background: lesson.color,
                                    boxShadow: `inset 0 -6px 0 rgba(0,0,0,0.12)`,
                                  }}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={lesson.image}
                                    alt=""
                                    className="h-full w-full object-contain"
                                    draggable={false}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                  />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-[18px] font-black leading-tight text-ink">
                                    {lesson.title}
                                  </span>
                                  <span className="mt-0.5 line-clamp-2 block text-[13.5px] font-bold leading-snug text-soft">
                                    {lesson.bigIdea}
                                  </span>
                                </span>
                                <PillButton small color={lesson.color} className="pointer-events-none shrink-0 self-end">
                                  {stars > 0 ? "Again" : "Start"}
                                </PillButton>
                              </Link>
                            </div>
                          );
                        })}
                        <StageLandmark label="How the World Works" color={WORLD_LESSONS[0].color} />
                      </div>
                    </section>
                  )}
                </Fragment>
              );
            })}

            {/* ── Footer shortcuts ── */}
            <div className="grid grid-cols-2 gap-3 pb-2">
              <PillButton href="/explore" className="w-full">
                All topics
              </PillButton>
              <Link
                href="/progress"
                className="btn-led inline-flex min-h-[60px] items-center justify-center gap-1 rounded-full bg-mist px-6 text-[19px] font-black text-ink"
                style={{ "--btn": "#E8EEFB", "--btn-deep": "#C9D6F2", "--btn-ink": "#182642" } as CSSProperties}
              >
                Progress <GlyphChevronR size={20} />
              </Link>
            </div>
          </div>
        </WaveSheet>
      </div>

      {/* ── Level-up celebration ── */}
      {showLevelUp && (
        <CelebrationScreen
          stars={3}
          title={`Level ${showLevelUp.level}`}
          subtitle={`You're ${/^[aeiou]/i.test(showLevelUp.name) ? "an" : "a"} ${showLevelUp.name} now`}
          xpEarned={xp}
          onKeepGoing={collectLevelUp}
          keepGoingLabel="Collect"
        />
      )}
    </main>
  );
}
