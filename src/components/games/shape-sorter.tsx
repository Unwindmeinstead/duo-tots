"use client";

/* ─── Game 1 — Shape Sorter ───
   A big dashed "hole" on the sheet shows the shape to find; three
   chunky shapes sit below. The right one flies in and fills the
   hole with colour. A wrong one just wiggles — tap again, no
   penalty, no fail state. */

import { useMemo, useState } from "react";
import { GlyphCheck } from "@/components/glyphs";
import { playCorrect, playPop } from "@/lib/audio";
import { SHAPE_DEFS, SORTER_ROUNDS, shuffle, sorterChoices, type ShapeId } from "@/lib/games-data";
import { GREEN, GREEN_DEEP } from "@/lib/theme";
import { ShapeSvg } from "./shapes";
import { ChoiceButton, GameCelebration, GameHeader, GameSheet, NextButton, useGameCompletion } from "./shared";

const ACCENT = "#FF9F2E";
const TOTAL = SORTER_ROUNDS.length;

export function ShapeSorter({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [filled, setFilled] = useState(false);
  const [wiggleId, setWiggleId] = useState<ShapeId | null>(null);
  const [session, setSession] = useState(0);
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-shape-sorter");

  const target = SORTER_ROUNDS[round];
  const targetDef = SHAPE_DEFS[target];
  /* Choices reshuffle every round (and every replay via `session`). */
  const choices = useMemo(
    () => shuffle(sorterChoices(target)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [target, session],
  );

  const pick = (shape: ShapeId) => {
    if (filled) return;
    if (shape === target) {
      playCorrect();
      setFilled(true);
    } else {
      playPop();
      setWiggleId(shape);
      window.setTimeout(() => setWiggleId((w) => (w === shape ? null : w)), 450);
    }
  };

  const next = () => {
    if (round + 1 >= TOTAL) {
      finish();
      return;
    }
    setRound((r) => r + 1);
    setFilled(false);
    setWiggleId(null);
  };

  const replay = () => {
    resetCompletion();
    setSession((s) => s + 1);
    setRound(0);
    setFilled(false);
    setWiggleId(null);
  };

  if (xpEarned !== null) {
    return (
      <GameCelebration
        title="You did it!"
        subtitle="Shape sorter complete"
        xpEarned={xpEarned}
        accent={ACCENT}
        onReplay={replay}
      />
    );
  }

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      <GameHeader title="Shape sorter" onBack={onBack} step={round} total={TOTAL} />
      <GameSheet>
        <p className="pt-4 text-center text-[20px] font-black text-ink">
          Find the {targetDef.label.toLowerCase()}!
        </p>

        {/* The hole — dashed ghost until the right shape fills it */}
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <div
            className="kt-card relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64"
            aria-label={filled ? `${targetDef.label} matched` : `Empty ${targetDef.label.toLowerCase()} hole`}
          >
            {filled ? (
              <span key={`filled-${round}-${session}`} className="kt-fly-in inline-flex">
                <ShapeSvg shape={target} color={targetDef.color} size={168} />
              </span>
            ) : (
              <span className="kt-pulse-soft inline-flex">
                <ShapeSvg shape={target} color={targetDef.color} size={168} mode="ghost" />
              </span>
            )}
            {filled && (
              <span
                className="kt-pop-in absolute -right-2 -top-2 grid h-10 w-10 place-items-center rounded-full text-white"
                style={{ background: GREEN }}
              >
                <GlyphCheck size={21} />
              </span>
            )}
          </div>
          <p className="mt-4 h-6 text-[17px] font-black" style={{ color: filled ? GREEN_DEEP : "transparent" }}>
            {filled ? "You found it!" : " "}
          </p>
        </div>

        {/* Choices / next — fixed-height slot so the swap never jumps */}
        <div className="flex min-h-[104px] flex-col justify-center">
          {filled ? (
            <NextButton label={round + 1 >= TOTAL ? "Finish" : "Next"} accent={ACCENT} onClick={next} />
          ) : (
            <div className="flex gap-3">
              {choices.map((shape) => (
                <ChoiceButton
                  key={shape}
                  label={SHAPE_DEFS[shape].label}
                  wiggling={wiggleId === shape}
                  onTap={() => pick(shape)}
                >
                  <ShapeSvg shape={shape} color={SHAPE_DEFS[shape].color} size={76} />
                  <span className="text-[14px] font-bold text-soft">{SHAPE_DEFS[shape].label}</span>
                </ChoiceButton>
              ))}
            </div>
          )}
        </div>
      </GameSheet>
    </div>
  );
}
