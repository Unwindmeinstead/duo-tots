"use client";

/* ─── Play hub (/play) ───
   Ten big game cards on the white sheet, in the reference card
   anatomy: each game carries its own matte-clay thumbnail (the
   game's idea at a glance), bold name, soft label, star row,
   play pill. Tapping one swaps the view to that game (single
   route, state-selected); the game's back disc returns here, and
   the mirror (header + stars) refreshes on return. While a game
   is in play the floating tab bar steps aside. */

import { useEffect, useState, type ComponentType, type CSSProperties } from "react";
import { BlueHeader, StarRow, WaveSheet } from "@/components/kit";
import { playPop } from "@/lib/audio";
import { getCategoryStars, useProgress } from "@/lib/progress";
import { deepen } from "@/lib/theme";
import { useScrollLock } from "@/lib/scroll-lock";
import type { GameId } from "@/lib/games-data";
import { ShapeSorter } from "./shape-sorter";
import { StackingBlocks } from "./stacking-blocks";
import { FinishPattern } from "./finish-pattern";
import { FixIt } from "./fix-it";
import { ColorFinder } from "./color-finder";
import { OddOneOut } from "./odd-one-out";
import { CountingFun } from "./counting-fun";
import { ShadowMatch } from "./shadow-match";
import { BigSmall } from "./big-small";
import { AnimalPick } from "./animal-pick";

type GameDef = {
  id: GameId;
  name: string;
  label: string;
  color: string;
  thumb: string;
  Component: ComponentType<{ onBack: () => void }>;
};

const GAMES: GameDef[] = [
  {
    id: "game-shape-sorter",
    name: "Shape sorter",
    label: "Find the shape that fits",
    color: "#FF9F2E",
    thumb: "/images/play/shape-sorter.webp",
    Component: ShapeSorter,
  },
  {
    id: "game-stacking-blocks",
    name: "Stacking blocks",
    label: "Stack the tower up high",
    color: "#8B5CF6",
    thumb: "/images/play/stacking-blocks.webp",
    Component: StackingBlocks,
  },
  {
    id: "game-finish-pattern",
    name: "Finish the pattern",
    label: "Complete the pattern",
    color: "#34C759",
    thumb: "/images/play/finish-pattern.webp",
    Component: FinishPattern,
  },
  {
    id: "game-fix-it",
    name: "Fix it",
    label: "Find the missing part",
    color: "#2B7FFF",
    thumb: "/images/play/fix-it.webp",
    Component: FixIt,
  },
  {
    id: "game-color-finder",
    name: "Color finder",
    label: "Hear the color, tap it",
    color: "#D64FD6",
    thumb: "/images/play/color-finder.webp",
    Component: ColorFinder,
  },
  {
    id: "game-odd-one-out",
    name: "Odd one out",
    label: "Spot the different one",
    color: "#17BEBB",
    thumb: "/images/play/odd-one-out.webp",
    Component: OddOneOut,
  },
  {
    id: "game-counting-fun",
    name: "Counting fun",
    label: "Count them, tap the number",
    color: "#FF6FA5",
    thumb: "/images/play/counting-fun.webp",
    Component: CountingFun,
  },
  {
    id: "game-shadow-match",
    name: "Shadow match",
    label: "Who makes this shadow?",
    color: "#8163D6",
    thumb: "/images/play/shadow-match.webp",
    Component: ShadowMatch,
  },
  {
    id: "game-big-small",
    name: "Big and small",
    label: "Tap the big one, tap the small",
    color: "#FF7A59",
    thumb: "/images/play/big-small.webp",
    Component: BigSmall,
  },
  {
    id: "game-animal-pick",
    name: "Animal pick",
    label: "Hear the animal, tap its photo",
    color: "#34C759",
    thumb: "/images/play/animal-pick.webp",
    Component: AnimalPick,
  },
];

export function PlayHub() {
  const [selected, setSelected] = useState<GameId | null>(null);
  /* Progress comes from the external store (useProgress): the first
     render matches the server HTML, then the stored state swaps in
     — no localStorage read in an initializer, no hydration error
     (audit failure #5). Games save through saveProgress, which
     notifies the store, so the mirror below is always current. */
  const progress = useProgress();

  /* A game in play is a one-screen stage: lock the document so
     the page can't scroll or rubber-band under the game. The hub
     list itself is long and keeps normal scrolling — the lock
     engages only while a game is selected. */
  useScrollLock(selected !== null);

  /* While a game is in play the shell tab bar hides (the flag on
     <html> drives the rule in globals.css), giving the game the
     full viewport including the tab strip's space. */
  useEffect(() => {
    if (selected === null) return;
    document.documentElement.dataset.gameActive = "true";
    return () => {
      delete document.documentElement.dataset.gameActive;
    };
  }, [selected]);

  /* Coming back to the list needs no manual refresh — the game's
     own saveProgress already notified the store. */
  const goBackToList = () => {
    setSelected(null);
  };

  const active = GAMES.find((g) => g.id === selected);
  if (active) {
    const ActiveGame = active.Component;
    return <ActiveGame onBack={goBackToList} />;
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col bg-royal">
      <BlueHeader streak={progress.streak} xp={progress.xp ?? 0} />

      <div className="blue-rings px-5 pb-1 pt-1">
        <h1 className="text-[32px] font-black leading-tight tracking-tight text-white">
          Play Zone
        </h1>
        <p className="mt-1 text-[15px] font-bold text-white/70">Pick a game.</p>
      </div>

      <WaveSheet className="px-4 pb-[var(--tab-float-space)] pt-5 min-[402px]:px-5">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
          {GAMES.map(({ id, name, label, color, thumb }) => {
            const stars = getCategoryStars(progress, id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  playPop();
                  setSelected(id);
                }}
                aria-label={`${name} — ${label}`}
                className="kt-card flex items-center gap-3.5 p-3.5 text-left"
              >
                <span
                  className="block h-[84px] w-[84px] shrink-0 overflow-hidden"
                  style={{
                    borderRadius: 24,
                    background: color,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb}
                    alt=""
                    width={84}
                    height={84}
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[19px] font-black leading-tight text-ink">
                    {name}
                  </span>
                  <span className="mt-0.5 block text-[13.5px] font-bold leading-snug text-soft">
                    {label}
                  </span>
                  <span className="mt-1.5 block">
                    <StarRow value={stars} />
                  </span>
                </span>
                {/* A span wearing the pill's clothes, NOT a PillButton:
                    this whole row is a <button>, and a real <button>
                    inside it is invalid nesting — the HTML parser
                    re-parents it in the server HTML and hydration
                    fails (React #418, audit failure #5). The pill is
                    decorative (pointer-events-none); the row is the
                    one and only button. */}
                <span
                  aria-hidden
                  className="btn-led pointer-events-none inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-end rounded-full px-5 text-[16px] font-black"
                  style={
                    {
                      "--btn": color,
                      "--btn-deep": deepen(color),
                      "--btn-ink": "#FFFFFF",
                    } as CSSProperties
                  }
                >
                  Play
                </span>
              </button>
            );
          })}
        </div>
      </WaveSheet>
    </main>
  );
}
