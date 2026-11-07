"use client";

/* ─── Game 3 — Finish the Pattern ───
   A row of 4 shapes sings a little rhythm (ABAB, AAB, AABB…); the
   5th spot is a dashed "?". Pick the shape that keeps the song
   going and it pops into place. Wrong picks wiggle — try again. */

import { useMemo, useState } from "react";
import { GlyphCheck } from "@/components/glyphs";
import { playCorrect, playPop } from "@/lib/audio";
import { PATTERNS, SHAPE_DEFS, shuffle, tileKey } from "@/lib/games-data";
import { GREEN, GREEN_DEEP } from "@/lib/theme";
import { ShapeSvg } from "./shapes";
import { ChoiceButton, GameCelebration, GameHeader, GameSheet, NextButton, useGameCompletion } from "./shared";

const ACCENT = "#34C759";
const TOTAL = PATTERNS.length;

export function FinishPattern({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wiggleKey, setWiggleKey] = useState<string | null>(null);
  const [session, setSession] = useState(0);
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-finish-pattern");

  const pattern = PATTERNS[round];
  const choices = useMemo(
    () => shuffle(pattern.choices),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round, session],
  );

  const pick = (key: string) => {
    if (solved) return;
    if (key === tileKey(pattern.answer)) {
      playCorrect();
      setSolved(true);
    } else {
      playPop();
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
    setSolved(false);
    setWiggleKey(null);
  };

  const replay = () => {
    resetCompletion();
    setSession((s) => s + 1);
    setRound(0);
    setSolved(false);
    setWiggleKey(null);
  };

  if (xpEarned !== null) {
    return (
      <GameCelebration
        title="You did it!"
        subtitle="Finish the pattern complete"
        xpEarned={xpEarned}
        accent={ACCENT}
        onReplay={replay}
      />
    );
  }

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      <GameHeader title="Finish the pattern" onBack={onBack} step={round} total={TOTAL} />
      <GameSheet>
        <p className="pt-4 text-center text-[20px] font-black text-ink">What comes next?</p>

        {/* The pattern row — 4 shown + the missing 5th */}
        <div className="flex flex-1 flex-col items-center justify-center py-6">
          <div
            className="kt-card flex w-full max-w-md items-center justify-center gap-2 px-3 py-5 sm:gap-3"
            role="img"
            aria-label={solved ? "Pattern complete" : "Pattern with one missing shape"}
          >
            {pattern.shown.map((tile, i) => (
              <span key={`${pattern.id}-${i}`} className="inline-flex shrink-0">
                <ShapeSvg shape={tile.shape} color={tile.color} size={54} />
              </span>
            ))}
            {solved ? (
              <span key={`answer-${round}-${session}`} className="kt-bounce relative inline-flex shrink-0">
                <ShapeSvg shape={pattern.answer.shape} color={pattern.answer.color} size={54} />
                <span
                  className="kt-pop-in absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full text-white"
                  style={{ background: GREEN }}
                >
                  <GlyphCheck size={19} />
                </span>
              </span>
            ) : (
              <span
                className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-[18px] border-[3px] border-dashed text-[28px] font-black text-soft"
                style={{ borderColor: ACCENT }}
              >
                ?
              </span>
            )}
          </div>
          <p className="mt-4 h-6 text-[17px] font-black" style={{ color: solved ? GREEN_DEEP : "transparent" }}>
            {solved ? "That's the pattern!" : " "}
          </p>
        </div>

        {/* Choices / next — fixed-height slot */}
        <div className="flex min-h-[104px] flex-col justify-center">
          {solved ? (
            <NextButton label={round + 1 >= TOTAL ? "Finish" : "Next"} accent={ACCENT} onClick={next} />
          ) : (
            <div className="flex gap-3">
              {choices.map((tile) => {
                const key = tileKey(tile);
                return (
                  <ChoiceButton
                    key={key}
                    label={SHAPE_DEFS[tile.shape].label}
                    wiggling={wiggleKey === key}
                    onTap={() => pick(key)}
                  >
                    <ShapeSvg shape={tile.shape} color={tile.color} size={72} />
                    <span className="text-[14px] font-bold text-soft">{SHAPE_DEFS[tile.shape].label}</span>
                  </ChoiceButton>
                );
              })}
            </div>
          )}
        </div>
      </GameSheet>
    </div>
  );
}
