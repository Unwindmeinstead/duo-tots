"use client";

/* ─── Game 2 — Stacking Blocks ───
   A ghost tower on the sheet shows where each block goes; the NEXT
   block's ghost gently pulses. Tap that block in the tray and it
   pops onto the tower. Wrong blocks wiggle with the gentle ding.
   The last block finishes the game.

   The tower itself is dealt fresh every playthrough (makeTower):
   6 blocks drawn from 8 shapes × 10 colours, tray shuffled — the
   old single fixed tower is gone, so there's nothing to memorize. */

import { useMemo, useState } from "react";
import { playCorrect, playGentle } from "@/lib/audio";
import { makeTower, shuffle, type StackBlock } from "@/lib/games-data";
import { ShapeSvg } from "./shapes";
import { GameCelebration, GameHeader, GameSheet, PromptRow, useGameCompletion } from "./shared";

const ACCENT = "#8B5CF6";
const TOTAL = 6;

export function StackingBlocks({ onBack }: { onBack: () => void }) {
  const [placed, setPlaced] = useState(0);
  const [wiggleId, setWiggleId] = useState<string | null>(null);
  const [justPlaced, setJustPlaced] = useState<string | null>(null);
  const [session, setSession] = useState(0);
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-stacking-blocks");

  /* The tower is dealt once per playthrough; the tray is the same
     deal shuffled. Placed blocks leave the tray. */
  const tower = useMemo(
    () => makeTower(TOTAL),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session],
  );
  const tray = useMemo(
    () => shuffle(tower),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, tower],
  );
  const needed: StackBlock | undefined = tower[placed];
  const remaining = tray.filter((b) => !tower.slice(0, placed).some((p) => p.id === b.id));

  const tapBlock = (block: StackBlock) => {
    if (!needed) return;
    if (block.id === needed.id) {
      playCorrect();
      const nextPlaced = placed + 1;
      setPlaced(nextPlaced);
      setJustPlaced(block.id);
      if (nextPlaced >= TOTAL) finish();
    } else {
      playGentle();
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
        {needed ? (
          /* The instruction line names the NEXT block to stack; the
             speaker button speaks exactly this line, and it changes
             with every block placed. */
          <PromptRow speakText={`Tap the ${needed.label}!`} accent={ACCENT}>
            Tap the <span style={{ color: needed.color }}>{needed.label}</span>!
          </PromptRow>
        ) : (
          <p className="pt-4 text-center text-[20px] font-black text-ink">You did it!</p>
        )}

        {/* Tower — ghosts below, placed blocks pop in over them */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-end pb-2 pt-4">
          <div className="flex flex-col-reverse items-center" role="img" aria-label={`Tower, ${placed} of ${TOTAL} blocks stacked`}>
            {tower.map((block, i) => {
              const isPlaced = i < placed;
              const isNext = i === placed;
              /* Six dealt blocks render at a fit scale — the dealt
                 `width` carries the narrowing rhythm, the scale
                 keeps the whole tower on one phone screen. */
              const display = Math.round(block.width * 0.55);
              const slotHeight = block.shape === "block" ? Math.round(display * 0.42) + 5 : display + 3;
              return (
                <div key={block.id} className="flex items-center justify-center" style={{ height: slotHeight }}>
                  {isPlaced ? (
                    <span className={justPlaced === block.id ? "kt-pop-in inline-flex" : "inline-flex"}>
                      <ShapeSvg shape={block.shape} color={block.color} size={display} />
                    </span>
                  ) : (
                    <span className={isNext ? "kt-pulse-soft inline-flex" : "inline-flex opacity-60"}>
                      <ShapeSvg shape={block.shape} color={block.color} size={display} mode="ghost" />
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
              <span className="text-[12px] font-bold capitalize text-soft">{block.label}</span>
            </button>
          ))}
        </div>
      </GameSheet>
    </div>
  );
}
