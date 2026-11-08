"use client";

/* ─── World lesson ───
   "How the World Works" step-through: 5 beats per lesson (big idea
   → say it → see it → do it → one question), skinned in the
   Kidtopia system — blue-zone header with pips, big rounded stage
   cards, one pill to move on. Completion goes through the generic
   completeActivity hook only — no progress edits. */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PillButton, Pips, RoundButton, Sparkles } from "@/components/kit";
import { GlyphChevronL, GlyphChevronR, GlyphSpeaker, GlyphStar } from "@/components/glyphs";
import { CelebrationScreen } from "@/components/celebration";
import { playCelebration, playPop, playStarChime, speakWord } from "@/lib/audio";
import {
  completeActivity,
  getCategoryStars,
  loadProgress,
  saveProgress,
  type ProgressState,
} from "@/lib/progress";
import { worldNodeId, type WorldLesson } from "@/lib/world-book";
import { WorldScene, hasWorldScene } from "@/components/world-scenes";
import { useScrollLock } from "@/lib/scroll-lock";

const STEP_LABELS = ["Big idea", "Say it", "See it", "Do it", "One question"] as const;
const TOTAL_STEPS = 5;

export function WorldLessonClient({
  lesson,
  nextLessonId,
  lessonNumber,
}: {
  lesson: WorldLesson;
  nextLessonId: string | null;
  lessonNumber: number;
}) {
  const router = useRouter();
  /* One-screen stage: all five beats fit the viewport, so the
     document locks — no scrolling under the tap animations. */
  useScrollLock();
  const [step, setStep] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [done, setDone] = useState<ProgressState | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  /* Tap-reaction counters — each increment replays the motion + burst. */
  const [sayBurst, setSayBurst] = useState(0);
  const [sayBounce, setSayBounce] = useState(0);
  const [seeBurst, setSeeBurst] = useState(0);

  const color = lesson.color;
  const isLast = step === TOTAL_STEPS - 1;

  const speak = async (text: string) => {
    if (speaking) return;
    setSpeaking(true);
    await speakWord(text);
    setSpeaking(false);
  };

  /* Say-it stage tap: pop + bounce + sparkles + the phrase spoken. */
  const onSayTap = () => {
    playPop();
    setSayBurst((b) => b + 1);
    setSayBounce((b) => b + 1);
    void speak(lesson.sayIt);
  };

  /* See-it photo tap: pop + sparkles + the say-it phrase spoken.
     No squash on the photo — photo cards never bounce on tap
     (Grey's no-bounce rule, 2026-11-07; same as the word decks). */
  const onSeeTap = () => {
    playPop();
    setSeeBurst((b) => b + 1);
    void speak(lesson.sayIt);
  };

  const goNext = () => {
    playPop();
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    /* Finish: record completion via the generic hook, then celebrate. */
    const state = loadProgress();
    const next = completeActivity(state, worldNodeId(lesson.id), 2);
    saveProgress(next);
    playCelebration();
    playStarChime();
    setXpEarned(next.xp - state.xp);
    setDone(next);
  };

  if (done) {
    return (
      <CelebrationScreen
        title="You did it!"
        subtitle={`${lesson.title} complete`}
        stars={getCategoryStars(done, worldNodeId(lesson.id))}
        xpEarned={xpEarned}
        keepGoingLabel="Next lesson"
        accent={lesson.color}
        onKeepGoing={() => {
          playPop();
          router.push(nextLessonId ? `/world/${nextLessonId}` : "/world");
        }}
        homeHref="/world"
        exitLabel="All lessons"
      />
    );
  }

  const stageCard = "kt-card flex h-full flex-col items-center justify-center px-6 py-8 text-center";

  return (
    <div
      className="blue-rings flex h-dvh flex-col overflow-hidden bg-royal"
      style={{ overscrollBehavior: "none", touchAction: "none" }}
    >
      {/* Header — back disc, title, step pips */}
      <header className="flex shrink-0 items-center gap-3 px-4 pb-2 pt-[max(0.8rem,env(safe-area-inset-top))] min-[402px]:px-5">
        <RoundButton href="/world" label="Back to all world lessons">
          <GlyphChevronL size={26} />
        </RoundButton>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[21px] font-black text-white">{lesson.title}</h1>
          <p className="mt-0.5 text-[13.5px] font-bold text-white/70">
            Lesson {lessonNumber} · {STEP_LABELS[step]}
          </p>
          <div className="mt-2">
            <Pips step={step} total={TOTAL_STEPS} />
          </div>
        </div>
      </header>

      {/* Step body */}
      <div className="relative mx-auto min-h-0 w-full max-w-2xl flex-1 px-3 pb-2">
        {step === 0 && (
          <div className={`${stageCard} kt-pop-in`}>
            <span
              className="rounded-full px-3.5 py-1.5 text-[13px] font-black text-white"
              style={{ background: color }}
            >
              Big idea
            </span>
            <p className="mt-6 max-w-md text-[clamp(1.6rem,6.5vmin,2.4rem)] font-black leading-[1.2] tracking-tight text-ink">
              {lesson.bigIdea}
            </p>
            <div className="mt-8">
              <PillButton color={color} onClick={() => void speak(lesson.bigIdea)} disabled={speaking} label="Hear the big idea">
                <GlyphSpeaker size={21} />
              </PillButton>
            </div>
          </div>
        )}

        {step === 1 && (
          <button
            type="button"
            onClick={onSayTap}
            disabled={speaking}
            aria-label={`Hear: ${lesson.sayIt}`}
            className="relative flex h-full w-full flex-col items-center justify-center rounded-[30px] px-6 py-8 text-center shadow-[0_12px_32px_rgba(14,42,99,0.14)] disabled:opacity-70"
            style={{ background: color }}
          >
            <Sparkles burstKey={sayBurst} />
            <span className="flex flex-col items-center">
              <span className="rounded-full bg-white/25 px-3.5 py-1.5 text-[13px] font-black text-white">
                Say it
              </span>
              <span
                key={sayBounce}
                className={`${sayBounce > 0 ? "kt-bounce " : ""}mt-6 max-w-md text-[clamp(1.9rem,8vmin,3rem)] font-black leading-[1.15] tracking-tight text-white`}
              >
                {lesson.sayIt}
              </span>
            </span>
          </button>
        )}

        {step === 2 && (
          <div
            role="button"
            onClick={onSeeTap}
            aria-label={`See it: ${lesson.title}. Tap to hear: ${lesson.sayIt}`}
            className="kt-pop-in relative flex h-full w-full cursor-pointer items-center justify-center text-left"
          >
            {/* The card IS the photo — whole picture, never cropped.
                Variant A (Grey's pick, 2026-11-07): the title and this
                step's controls ride INSIDE the photo's bottom band,
                stacked — title on its own line (never truncated), the
                speaker pill and the Next pill on the row under it. The
                below-stage Next pill hides on this step; the band's
                pill is the same goNext. Root is a div so the pill's
                real button never nests inside another button. */}
            <span className="relative block max-h-full max-w-full overflow-hidden rounded-[30px]">
              {/* Animated lessons (2026-11-08): the scene IS the card
                  — same 2:3 stage, same chrome, the concept in motion.
                  Lessons without a scene keep their photo card. */}
              {hasWorldScene(lesson.id) ? (
                <WorldScene lessonId={lesson.id} />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={lesson.image}
                  alt={lesson.title}
                  className="block max-h-full max-w-full"
                  draggable={false}
                />
              )}
              <span className="absolute inset-x-0 bottom-0 block bg-gradient-to-t from-black/75 via-black/40 to-transparent px-4 pb-4 pt-14">
                <span className="block text-[24px] font-black leading-tight tracking-tight text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.45)]">
                  {lesson.title}
                </span>
                <span className="mt-3 flex items-center gap-2.5">
                  <span className="inline-flex items-center rounded-full bg-white px-3.5 py-2.5 text-ink shadow-[0_10px_22px_rgba(14,42,99,0.18)]" aria-hidden>
                    <GlyphSpeaker size={18} />
                  </span>
                  <span className="flex-1" />
                  <span onClick={(e) => e.stopPropagation()}>
                    <PillButton small color="#FFFFFF" ink="#1748AC" onClick={goNext}>
                      Next <GlyphChevronR size={18} />
                    </PillButton>
                  </span>
                </span>
              </span>
            </span>
            <Sparkles burstKey={seeBurst} />
          </div>
        )}

        {step === 3 && (
          <div className={`${stageCard} kt-pop-in`}>
            <span
              className="grid h-24 w-24 place-items-center text-white"
              style={{ background: color, borderRadius: 26, boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.12)" }}
              aria-hidden
            >
              <GlyphStar size={44} />
            </span>
            <p className="mt-6 max-w-md text-[clamp(1.4rem,5.5vmin,1.9rem)] font-black leading-[1.35] tracking-tight text-ink">
              {lesson.doIt}
            </p>
          </div>
        )}

        {step === 4 && (
          <div className={`${stageCard} kt-pop-in`}>
            <p className="max-w-md text-[clamp(1.6rem,6.5vmin,2.4rem)] font-black leading-[1.25] tracking-tight text-ink">
              {lesson.question}
            </p>
            <p className="mt-5 max-w-xs text-[14.5px] font-bold leading-relaxed text-soft">
              Every answer is a good answer. Wonder about it together.
            </p>
          </div>
        )}
      </div>

      {/* One way forward — child-paced, it waits. On the see-it step
          the pill rides inside the photo's band instead (variant A),
          so this below-stage pill hides and the stage keeps the room. */}
      {step !== 2 && (
        <div
          className="mx-auto w-full max-w-2xl shrink-0 px-4 pt-2 min-[402px]:px-5"
          style={{ paddingBottom: "max(0.9rem, env(safe-area-inset-bottom, 0px))" }}
        >
          <PillButton color="#FFFFFF" ink="#1748AC" onClick={goNext} className="min-h-[64px] w-full text-[20px]">
            {isLast ? "Finish" : "Next"}
            {!isLast && <GlyphChevronR size={20} />}
          </PillButton>
        </div>
      )}
    </div>
  );
}
