"use client";

/* ─── Play hub (/play) ───
   Ten big game cards on the white sheet, in the reference card
   anatomy: saturated art tile, bold name, soft label, star row,
   play pill. Tapping one swaps the view to that game (single
   route, state-selected); the game's back disc returns here, and
   the mirror (header + stars) refreshes on return. While a game
   is in play the floating tab bar steps aside. */

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { BlueHeader, PillButton, StarRow, WaveSheet } from "@/components/kit";
import { GlyphGear, GlyphPuzzle } from "@/components/glyphs";
import { playPop } from "@/lib/audio";
import { getCategoryStars, loadProgress, type ProgressState } from "@/lib/progress";
import type { GameId } from "@/lib/games-data";
import { ShapeSvg } from "./shapes";
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
  icon: ReactNode;
  Component: ComponentType<{ onBack: () => void }>;
};

const GAMES: GameDef[] = [
  {
    id: "game-shape-sorter",
    name: "Shape sorter",
    label: "Find the shape that fits",
    color: "#FF9F2E",
    icon: <ShapeSvg shape="star" color="#FFFFFF" size={44} />,
    Component: ShapeSorter,
  },
  {
    id: "game-stacking-blocks",
    name: "Stacking blocks",
    label: "Stack the tower up high",
    color: "#8B5CF6",
    icon: (
      <svg width={46} height={46} viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden>
        <rect x="7" y="3.5" width="10" height="4.6" rx="1.8" />
        <rect x="5" y="9.7" width="14" height="4.6" rx="1.8" />
        <rect x="3" y="15.9" width="18" height="4.6" rx="1.8" />
      </svg>
    ),
    Component: StackingBlocks,
  },
  {
    id: "game-finish-pattern",
    name: "Finish the pattern",
    label: "Complete the pattern",
    color: "#34C759",
    icon: <GlyphPuzzle size={40} />,
    Component: FinishPattern,
  },
  {
    id: "game-fix-it",
    name: "Fix it",
    label: "Find the missing part",
    color: "#2B7FFF",
    icon: <GlyphGear size={40} />,
    Component: FixIt,
  },
  {
    id: "game-color-finder",
    name: "Color finder",
    label: "Hear the color, tap it",
    color: "#D64FD6",
    icon: (
      <svg width={46} height={46} viewBox="0 0 24 24" aria-hidden>
        <circle cx="9" cy="9" r="5.5" fill="#FFFFFF" opacity="0.95" />
        <circle cx="15.5" cy="9" r="5.5" fill="#FFFFFF" opacity="0.6" />
        <circle cx="12.2" cy="15" r="5.5" fill="#FFFFFF" opacity="0.8" />
      </svg>
    ),
    Component: ColorFinder,
  },
  {
    id: "game-odd-one-out",
    name: "Odd one out",
    label: "Spot the different one",
    color: "#17BEBB",
    icon: (
      <svg width={46} height={46} viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden>
        <circle cx="7" cy="7" r="3" />
        <circle cx="17" cy="7" r="3" />
        <circle cx="7" cy="17" r="3" />
        <polygon points="17,13.8 18.2,16.3 20.9,16.6 18.9,18.5 19.4,21.2 17,19.8 14.6,21.2 15.1,18.5 13.1,16.6 15.8,16.3" />
      </svg>
    ),
    Component: OddOneOut,
  },
  {
    id: "game-counting-fun",
    name: "Counting fun",
    label: "Count them, tap the number",
    color: "#FF6FA5",
    icon: <span className="text-[25px] font-black tracking-tight text-white">123</span>,
    Component: CountingFun,
  },
  {
    id: "game-shadow-match",
    name: "Shadow match",
    label: "Who makes this shadow?",
    color: "#8163D6",
    icon: <ShapeSvg shape="star" color="#2A3350" size={44} />,
    Component: ShadowMatch,
  },
  {
    id: "game-big-small",
    name: "Big and small",
    label: "Tap the big one, tap the small",
    color: "#FF7A59",
    icon: (
      <span className="flex items-end gap-1.5">
        <ShapeSvg shape="square" color="#FFFFFF" size={40} />
        <ShapeSvg shape="square" color="#FFFFFF" size={22} />
      </span>
    ),
    Component: BigSmall,
  },
  {
    id: "game-animal-pick",
    name: "Animal pick",
    label: "Hear the animal, tap its photo",
    color: "#34C759",
    icon: (
      <svg width={46} height={46} viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden>
        <circle cx="6.2" cy="8.6" r="2.1" />
        <circle cx="10.4" cy="5.4" r="2.3" />
        <circle cx="15" cy="5.4" r="2.3" />
        <circle cx="19" cy="8.8" r="2.1" />
        <path d="M12.6 11.4c3.2 0 5.9 2.5 5.9 5.2 0 1.9-1.5 3.1-3.4 3.1-1.1 0-1.7-.4-2.5-.4s-1.4.4-2.5.4c-1.9 0-3.4-1.2-3.4-3.1 0-2.7 2.7-5.2 5.9-5.2Z" />
      </svg>
    ),
    Component: AnimalPick,
  },
];

export function PlayHub() {
  const [selected, setSelected] = useState<GameId | null>(null);
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

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

  /* Coming back to the list refreshes the mirror — a game may have
     just been completed. */
  const goBackToList = () => {
    setProgress(loadProgress());
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
          {GAMES.map(({ id, name, label, color, icon }) => {
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
                  className="grid h-[84px] w-[84px] shrink-0 place-items-center text-white"
                  style={{
                    borderRadius: 24,
                    background: color,
                    boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.12)",
                  }}
                >
                  {icon}
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
                <PillButton small color={color} className="pointer-events-none shrink-0 self-end">
                  Play
                </PillButton>
              </button>
            );
          })}
        </div>
      </WaveSheet>
    </main>
  );
}
