"use client";

/* ─── Game 1 — Shape Sorter ───
   A big dashed "hole" on the sheet shows the shape to find; three
   chunky shapes sit below. The right one flies in and fills the
   hole with colour. A wrong one just wiggles with the gentle
   companion ding — tap again, no penalty, no fail state.

   Every game is dealt fresh (makeSorterRounds): random target
   shapes in random colours, random distractors, shuffled spots —
   there is no fixed round order to memorize. */

import { useMemo, useState } from "react";
import { GlyphCheck } from "@/components/glyphs";
import { playCorrect, playGentle } from "@/lib/audio";
import { makeSorterRounds, tileKey, type ShapeTile } from "@/lib/games-data";
import { GREEN, GREEN_DEEP } from "@/lib/theme";
import { ShapeSvg } from "./shapes";
import { ChoiceButton, GameCelebration, GameHeader, GameSheet, NextButton, PromptRow, useGameCompletion, useAutoAnnounce } from "./shared";

const ACCENT = "#FF9F2E";
const TOTAL = 5;

export function ShapeSorter({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [filled, setFilled] = useState(false);
  const [wiggleKey, setWiggleKey] = useState<string | null>(null);
  const [session, setSession] = useState(0);
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-shape-sorter");

  /* The whole game is dealt once per playthrough (and re-dealt on
     replay via `session`) — rounds never repeat a target shape. */
  const rounds = useMemo(
    () => makeSorterRounds(TOTAL),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session],
  );
  const { target, choices } = rounds[round];
  /* The exact on-screen prompt — the speaker button speaks THIS
     string, so it tracks the freshly dealt target every round. */
  const shapeWord = target.shape === "block" ? "block" : target.shape;
  const promptText = `Find the ${target.colorName.toLowerCase()} ${shapeWord}!`;
  useAutoAnnounce(promptText, `${session}-${round}`);

  const pick = (tile: ShapeTile) => {
    if (filled) return;
    if (tile.shape === target.shape) {
      playCorrect();
      setFilled(true);
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
    setFilled(false);
    setWiggleKey(null);
  };

  const replay = () => {
    resetCompletion();
    setSession((s) => s + 1);
    setRound(0);
    setFilled(false);
    setWiggleKey(null);
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
        <PromptRow speakText={promptText} accent={ACCENT}>
          Find the {target.colorName.toLowerCase()} {shapeWord}!
        </PromptRow>

        {/* The hole — dashed ghost until the right shape fills it */}
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <div
            className="kt-card relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64"
            aria-label={filled ? "Shape matched" : "Empty shape hole"}
          >
            {filled ? (
              <span key={`filled-${round}-${session}`} className="kt-fly-in inline-flex">
                <ShapeSvg shape={target.shape} color={target.color} size={168} />
              </span>
            ) : (
              <span className="kt-pulse-soft inline-flex">
                <ShapeSvg shape={target.shape} color={target.color} size={168} mode="ghost" />
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
              {choices.map((tile) => (
                <ChoiceButton
                  key={tileKey(tile)}
                  label={`${tile.colorName} ${tile.shape}`}
                  wiggling={wiggleKey === tileKey(tile)}
                  onTap={() => pick(tile)}
                >
                  <ShapeSvg shape={tile.shape} color={tile.color} size={76} />
                  <span className="text-[14px] font-bold capitalize text-soft">{tile.shape}</span>
                </ChoiceButton>
              ))}
            </div>
          )}
        </div>
      </GameSheet>
    </div>
  );
}
