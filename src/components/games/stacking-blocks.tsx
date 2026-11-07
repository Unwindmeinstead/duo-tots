"use client";

/* ─── Game 2 — Stacking Blocks ───
   A ghost tower on the sheet shows where each block goes; the NEXT
   block's ghost gently pulses. Tap that block in the tray and it
   pops onto the tower. Wrong blocks wiggle. The last block
   finishes the game. */

import { useMemo, useState } from "react";
import { playCorrect, playPop } from "@/lib/audio";
import { STACK_BLOCKS, shuffle, type StackBlock } from "@/lib/games-data";
import { ShapeSvg } from "./shapes";
import { GameCelebration, GameHeader, GameSheet, useGameCompletion } from "./shared";

const ACCENT = "#8B5CF6";
const TOTAL = STACK_BLOCKS.length;

export function StackingBlocks({ onBack }: { onBack: () => void }) {
  const [placed, setPlaced] = useState(0);
  const [wiggleId, setWiggleId] = useState<string | null>(null);
  const [justPlaced, setJustPlaced] = useState<string | null>(null);
  const [session, setSession] = useState(0);
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-stacking-blocks");

  /* The tray is shuffled once per playthrough; placed blocks leave it. */
  const tray = useMemo(
    () => shuffle(STACK_BLOCKS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session],
  );
  const needed: StackBlock | undefined = STACK_BLOCKS[placed];
  const remaining = tray.filter((b) => !STACK_BLOCKS.slice(0, placed).some((p) => p.id === b.id));

  const tapBlock = (block: StackBlock) => {
    if (!needed) return;
    if (block.id === needed.id) {
      playCorrect();
      const nextPlaced = placed + 1;
      setPlaced(nextPlaced);
      setJustPlaced(block.id);
      if (nextPlaced >= TOTAL) finish();
    } else {
      playPop();
      setWiggleId(block.id);
      window.setTimeout(() => setWiggleId((w) => (w === block.id ? null : w)), 450);
    }
  };

  const replay = () => {
    resetCompletion();
    setSession((s) => s + 1);
    setPlaced(0);
    setWiggleId(null);
    setJustPlaced(null);
  };

  if (xpEarned !== null) {
    return (
      <GameCelebration
        title="You did it!"
        subtitle="Stacking blocks complete"
        xpEarned={xpEarned}
        accent={ACCENT}
        onReplay={replay}
      />
    );
  }

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      <GameHeader title="Stacking blocks" onBack={onBack} step={placed} total={TOTAL} />
      <GameSheet>
        <p className="pt-4 text-center text-[20px] font-black text-ink">
          {needed ? (
            <>
              Tap the <span style={{ color: needed.color }}>{needed.label.toLowerCase()}</span>!
            </>
          ) : (
            "You did it!"
          )}
        </p>

        {/* Tower — ghosts below, placed blocks pop in over them */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-end pb-2 pt-4">
          <div className="flex flex-col-reverse items-center" role="img" aria-label={`Tower, ${placed} of ${TOTAL} blocks stacked`}>
            {STACK_BLOCKS.map((block, i) => {
              const isPlaced = i < placed;
              const isNext = i === placed;
              const slotHeight = block.shape === "block" ? Math.round(block.width * 0.42) + 6 : block.width + 4;
              return (
                <div key={block.id} className="flex items-center justify-center" style={{ height: slotHeight }}>
                  {isPlaced ? (
                    <span className={justPlaced === block.id ? "kt-pop-in inline-flex" : "inline-flex"}>
                      <ShapeSvg shape={block.shape} color={block.color} size={block.width} />
                    </span>
                  ) : (
                    <span className={isNext ? "kt-pulse-soft inline-flex" : "inline-flex opacity-60"}>
                      <ShapeSvg shape={block.shape} color={block.color} size={block.width} mode="ghost" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {/* Ground */}
          <div className="mt-1 h-3 w-64 max-w-full rounded-full bg-[#34C759] opacity-50" />
        </div>

        {/* Tray of blocks still to stack */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {remaining.map((block) => (
            <button
              key={block.id}
              type="button"
              aria-label={block.label}
              onClick={() => tapBlock(block)}
              className={`kt-card flex min-h-[104px] min-w-[96px] flex-col items-center justify-center gap-1 px-3 py-2 transition-transform active:scale-95 ${
                wiggleId === block.id ? "kt-wiggle" : ""
              }`}
            >
              <ShapeSvg shape={block.shape} color={block.color} size={block.shape === "block" ? 84 : 58} />
              <span className="text-[12px] font-bold text-soft">{block.label}</span>
            </button>
          ))}
        </div>
      </GameSheet>
    </div>
  );
}
