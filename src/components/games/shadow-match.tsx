"use client";

/* ─── Game 8 — Shadow Match ───
   A big dark silhouette sits on the sheet; below it, three shapes
   in full colour. Which one casts that shadow? Targets are dealt
   from the whole shape pool with fresh colours and shuffled
   spots every round — the shadow is the only clue, and it never
   points at the same seat twice in a row by habit. */

import { useMemo, useState } from "react";
import { GlyphCheck } from "@/components/glyphs";
import { playCorrect, playGentle } from "@/lib/audio";
import { SHAPE_DEFS, makeShadowRounds, tileKey, type ShapeTile } from "@/lib/games-data";
import { GREEN, GREEN_DEEP } from "@/lib/theme";
import { ShapeSvg } from "./shapes";
import { ChoiceButton, GameCelebration, GameHeader, GameSheet, NextButton, useGameCompletion } from "./shared";

const ACCENT = "#8163D6";
const SHADOW = "#2A3350";
const TOTAL = 5;

export function ShadowMatch({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [matched, setMatched] = useState(false);
  const [wiggleKey, setWiggleKey] = useState<string | null>(null);
  const [session, setSession] = useState(0);
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-shadow-match");

  const rounds = useMemo(
    () => makeShadowRounds(TOTAL),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session],
  );
  const { target, choices } = rounds[round];

  const pick = (tile: ShapeTile) => {
    if (matched) return;
    if (tile.shape === target.shape) {
      playCorrect();
      setMatched(true);
    } else {
      playGentle();
      const key = tileKey(tile);
      setWiggleKey(key);
      window.setTimeout(() => setWiggleKey((w) => (w === key ? null : w)), 450);
    }
  };

  const next = () => {
    if (round + 1 >= TOTAL) {
      finish();
      return;
    }
    setRound((r) => r + 1);
    setMatched(false);
    setWiggleKey(null);
  };

  const replay = () => {
    resetCompletion();
    setSession((s) => s + 1);
    setRound(0);
    setMatched(false);
    setWiggleKey(null);
  };

  if (xpEarned !== null) {
    return (
      <GameCelebration
        title="You did it!"
        subtitle="Shadow match complete"
        xpEarned={xpEarned}
        accent={ACCENT}
        onReplay={replay}
      />
    );
  }

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      <GameHeader title="Shadow match" onBack={onBack} step={round} total={TOTAL} />
      <GameSheet>
        <p className="pt-4 text-center text-[20px] font-black text-ink">Which one makes this shadow?</p>

        {/* The silhouette — in full colour once matched */}
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <div
            className="kt-card relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64"
            aria-label={matched ? "Shadow matched" : "A shadow to match"}
          >
            {matched ? (
              <span key={`matched-${round}-${session}`} className="kt-fly-in inline-flex">
                <ShapeSvg shape={target.shape} color={target.color} size={160} />
              </span>
            ) : (
              <span className="kt-pulse-soft inline-flex">
                <ShapeSvg shape={target.shape} color={SHADOW} size={160} />
              </span>
            )}
            {matched && (
              <span
                className="kt-pop-in absolute -right-2 -top-2 grid h-10 w-10 place-items-center rounded-full text-white"
                style={{ background: GREEN }}
              >
                <GlyphCheck size={21} />
              </span>
            )}
          </div>
          <p className="mt-4 h-6 text-[17px] font-black" style={{ color: matched ? GREEN_DEEP : "transparent" }}>
            {matched ? `It's the ${SHAPE_DEFS[target.shape].label.toLowerCase()}!` : " "}
          </p>
        </div>

        {/* Choices / next — fixed-height slot */}
        <div className="flex min-h-[104px] flex-col justify-center">
          {matched ? (
            <NextButton label={round + 1 >= TOTAL ? "Finish" : "Next"} accent={ACCENT} onClick={next} />
          ) : (
            <div className="flex gap-3">
              {choices.map((tile) => (
                <ChoiceButton
                  key={tileKey(tile)}
                  label={SHAPE_DEFS[tile.shape].label}
                  wiggling={wiggleKey === tileKey(tile)}
                  onTap={() => pick(tile)}
                >
                  <ShapeSvg shape={tile.shape} color={tile.color} size={76} />
                  <span className="text-[14px] font-bold text-soft">{SHAPE_DEFS[tile.shape].label}</span>
                </ChoiceButton>
              ))}
            </div>
          )}
        </div>
      </GameSheet>
    </div>
  );
}
