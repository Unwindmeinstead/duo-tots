"use client";

/* ─── World index ───
   "How the World Works", Book 1: fourteen little lessons as big
   image cards on the white sheet — cover art, number badge, title,
   the say-it line, and a Start / Play-again pill. */

import Link from "next/link";
import { useState } from "react";
import { BlueHeader, PillButton, SectionHead, WaveSheet } from "@/components/kit";
import { GlyphStar } from "@/components/glyphs";
import { getCategoryStars, loadProgress } from "@/lib/progress";
import { WORLD_LESSONS, worldNodeId } from "@/lib/world-book";
import { playPop } from "@/lib/audio";
import { GOLD } from "@/lib/theme";

export default function WorldPage() {
  const [progress] = useState(() => loadProgress());
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
          <div className="mt-4 grid grid-cols-2 gap-3.5">
            {WORLD_LESSONS.map((lesson, i) => {
              const stars = getCategoryStars(progress, worldNodeId(lesson.id));
              const isDone = stars > 0;
              return (
                <Link
                  key={lesson.id}
                  href={`/world/${lesson.id}`}
                  onClick={() => playPop()}
                  className="kt-card flex h-full flex-col overflow-hidden"
                >
                  <div className="relative shrink-0">
                    {/* The card top IS the photo at the uniform 2:3
                        blueprint shape — every World cover is a true
                        900×1350 portrait, so the fixed aspect box keeps
                        all fourteen cards identical and nothing clips. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={lesson.image}
                      alt=""
                      className="block aspect-[2/3] w-full object-cover"
                      draggable={false}
                      loading={i > 5 ? "lazy" : undefined}
                    />
                    {isDone && (
                      <span
                        className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white text-gold-deep"
                        aria-label="Done"
                      >
                        <GlyphStar size={17} />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-3.5">
                    <div className="flex items-start gap-2">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-royal text-[13px] font-black text-white">
                        {i + 1}
                      </span>
                      <p className="text-[15.5px] font-black leading-snug tracking-tight text-ink">
                        {lesson.title}
                      </p>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[13px] font-bold leading-snug text-soft">
                      {lesson.sayIt}
                    </p>
                    <span className="mt-auto pt-3">
                      <PillButton
                        small
                        color={isDone ? GOLD : lesson.color}
                        ink={isDone ? "#182642" : "#FFFFFF"}
                        className="pointer-events-none min-h-11 px-4 text-[14px]"
                      >
                        {isDone ? "Play again" : "Start"}
                      </PillButton>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </WaveSheet>
    </main>
  );
}
