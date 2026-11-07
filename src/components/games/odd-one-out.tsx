"use client";

/* ─── Game 6 — Odd One Out ───
   Six tiles in a grid: five are twins, one is different — another
   shape, another colour, or both. Tap the different one. Every
   round re-deals the tile, the kind of difference, and the odd
   one's seat (never the same seat twice in a row), so spotting
   the difference is the only way to win — position memory gets
   a child nowhere. */

import { useMemo, useState } from "react";
import { GlyphCheck } from "@/components/glyphs";
import { playCorrect, playGentle } from "@/lib/audio";
import { makeOddRounds } from "@/lib/games-data";
import { GREEN, GREEN_DEEP } from "@/lib/theme";
import { ShapeSvg } from "./shapes";
import { GameCelebration, GameHeader, GameSheet, NextButton, PromptRow, useGameCompletion, useAutoAnnounce } from "./shared";

const ACCENT = "#17BEBB";
const TOTAL = 5;

export function OddOneOut({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [found, setFound] = useState(false);
  const [wiggleIdx, setWiggleIdx] = useState<number | null>(null);
  const [session, setSession] = useState(0);
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-odd-one-out");

  const rounds = useMemo(
    () => makeOddRounds(TOTAL),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session],
  );
  const { tiles, oddIndex } = rounds[round];
  useAutoAnnounce("Tap the one that's different!", `${session}-${round}`);

  const pick = (idx: number) => {
    if (found) return;
    if (idx === oddIndex) {
      playCorrect();
      setFound(true);
    } else {
      playGentle();
      setWiggleIdx(idx);
      window.setTimeout(() => setWiggleIdx((w) => (w === idx ? null : w)), 450);
    }
  };

  const next = () => {
    if (round + 1 >= TOTAL) {
      finish();
      return;
    }
    setRound((r) => r + 1);
    setFound(false);
    setWiggleIdx(null);
  };

  const replay = () => {
    resetCompletion();
    setSession((s) => s + 1);
    setRound(0);
    setFound(false);
    setWiggleIdx(null);
  };

  if (xpEarned !== null) {
    return (
      <GameCelebration
        title="You did it!"
        subtitle="Odd one out complete"
        xpEarned={xpEarned}
        accent={ACCENT}
        onReplay={replay}
      />
    );
  }

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      <GameHeader title="Odd one out" onBack={onBack} step={round} total={TOTAL} />
      <GameSheet>
        <PromptRow speakText="Tap the one that's different!" accent={ACCENT}>
          Tap the one that&apos;s different!
        </PromptRow>

        {/* The grid — five twins and one odd tile */}
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <div className="grid w-full max-w-md grid-cols-3 gap-3">
            {tiles.map((tile, i) => {
              const isOdd = i === oddIndex;
              return (
                <button
                  key={`${round}-${session}-${i}`}
                  type="button"
                  aria-label={found && isOdd ? "The different one" : "A tile"}
                  onClick={() => pick(i)}
                  className={`kt-card relative flex min-h-[104px] items-center justify-center px-2 py-3 transition-transform active:scale-95 ${
                    wiggleIdx === i ? "kt-wiggle" : ""
                  }`}
                >
                  <span className={found && isOdd ? "kt-pop-in inline-flex" : "inline-flex"}>
                    <ShapeSvg shape={tile.shape} color={tile.color} size={64} />
                  </span>
                  {found && isOdd && (
                    <span
                      className="kt-pop-in absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full text-white"
                      style={{ background: GREEN }}
                    >
                      <GlyphCheck size={19} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-4 h-6 text-[17px] font-black" style={{ color: found ? GREEN_DEEP : "transparent" }}>
            {found ? "You spotted it!" : " "}
          </p>
        </div>

        {/* Next — fixed-height slot so the swap never jumps */}
        <div className="flex min-h-[104px] flex-col justify-center">
          {found ? (
            <NextButton label={round + 1 >= TOTAL ? "Finish" : "Next"} accent={ACCENT} onClick={next} />
          ) : (
            <p className="text-center text-[15px] font-bold text-soft">Five are twins. One is not.</p>
          )}
        </div>
      </GameSheet>
    </div>
  );
}
