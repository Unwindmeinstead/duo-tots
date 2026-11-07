"use client";

/* ─── World index ───
   "How the World Works", Book 1: fourteen little lessons as big
   image cards on the white sheet — cover art, number badge, title,
   the say-it line, and a Start / Play-again pill. */

import Link from "next/link";
import { BlueHeader, PillButton, SectionHead, WaveSheet } from "@/components/kit";
import { GlyphStar } from "@/components/glyphs";
import { getCategoryStars, useProgress } from "@/lib/progress";
import { WORLD_LESSONS, worldNodeId } from "@/lib/world-book";
import { playPop } from "@/lib/audio";
import { GOLD } from "@/lib/theme";

export default function WorldPage() {
  /* Progress comes from the external store (useProgress): the first
     render matches the server HTML, then the stored state swaps in
     — no localStorage read in an initializer, no hydration error
     (audit failure #5). */
  const progress = useProgress();
  const doneCount = WORLD_LESSONS.filter(
    (l) => getCategoryStars(progress, worldNodeId(l.id)) > 0,
  ).length;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col bg-royal">
      <BlueHeader streak={progress.streak} xp={progress.xp ?? 0} />

      <div className="blue-rings px-5 pb-1 pt-1">
        <p className="text-[13px] font-black uppercase tracking-wider text-white/60">
          How the world works · Book 1
        </p>
        <h1 className="mt-0.5 text-[32px] font-black leading-tight tracking-tight text-white">
          World lessons
        </h1>
        <p className="mt-1 text-[15px] font-bold text-white/70">
          One big idea, one thing to say, one thing to see, one thing to do.
        </p>
      </div>

      <WaveSheet className="px-4 pb-[var(--tab-float-space)] pt-5 min-[402px]:px-5">
        <div className="mx-auto w-full max-w-md">
          <SectionHead
            title="Book 1"
            sub={`${doneCount} of ${WORLD_LESSONS.length} done`}
          />
          <div className="mt-4 flex flex-col gap-3.5">
            {WORLD_LESSONS.map((lesson, i) => {
              const stars = getCategoryStars(progress, worldNodeId(lesson.id));
              const isDone = stars > 0;
              return (
                <Link
                  key={lesson.id}
                  href={`/world/${lesson.id}`}
                  onClick={() => playPop()}
                  className="kt-card flex items-center gap-3.5 p-3.5"
                >
                  <span
                    className="relative block h-[80px] w-[120px] shrink-0 overflow-hidden"
                    style={{ borderRadius: 18, background: lesson.color }}
                  >
                    {/* LANDSCAPE thumbnail (Grey's reversal, Nov 7):
                        same fixed 120×80 (3:2) tile as the home
                        Foundation rows; lesson.thumb is a true 1200×800
                        landscape composition, so nothing clips. The
                        vertical cover still serves the in-lesson card. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={lesson.thumb}
                      alt=""
                      className="absolute inset-0 block h-full w-full object-cover"
                      draggable={false}
                      loading={i > 5 ? "lazy" : undefined}
                    />
                    {isDone && (
                      <span
                        className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white text-gold-deep"
                        aria-label="Done"
                      >
                        <GlyphStar size={13} />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start gap-2">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-royal text-[13px] font-black text-white">
                        {i + 1}
                      </span>
                      <span className="line-clamp-2 text-[16px] font-black leading-snug tracking-tight text-ink">
                        {lesson.title}
                      </span>
                    </span>
                    <span className="mt-1 line-clamp-2 block text-[13px] font-bold leading-snug text-soft">
                      {lesson.sayIt}
                    </span>
                  </span>
                  <PillButton
                    small
                    color={isDone ? GOLD : lesson.color}
                    ink={isDone ? "#182642" : "#FFFFFF"}
                    className="pointer-events-none min-h-11 shrink-0 self-end px-4 text-[14px]"
                  >
                    {isDone ? "Play again" : "Start"}
                  </PillButton>
                </Link>
              );
            })}
          </div>
        </div>
      </WaveSheet>
    </main>
  );
}
