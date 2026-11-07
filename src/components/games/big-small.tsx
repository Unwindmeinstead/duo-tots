"use client";

/* ─── Game 9 — Big and Small ───
   Two copies of one shape side by side, one big and one small.
   The ask flips between BIG and SMALL and the big copy's seat is
   re-dealt every round — the word can't be memorized and neither
   can the side. A wrong tap wiggles with the gentle companion
   ding; there is no fail state. Rounds are dealt fresh by
   makeBigSmallRounds from the full 20-shape pool. */

import { useMemo, useState } from "react";
import { GlyphCheck } from "@/components/glyphs";
import { playCorrect, playGentle } from "@/lib/audio";
import { makeBigSmallRounds, tileKey } from "@/lib/games-data";
import { GREEN, GREEN_DEEP } from "@/lib/theme";
import { ShapeSvg } from "./shapes";
import { ChoiceButton, GameCelebration, GameHeader, GameSheet, NextButton, PromptRow, useGameCompletion, useAutoAnnounce } from "./shared";

const ACCENT = "#FF7A59";
const TOTAL = 5;
const BIG = 148;
const SMALL = 76;

export function BigSmall({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [found, setFound] = useState(false);
  const [wiggleSeat, setWiggleSeat] = useState<number | null>(null);
  const [session, setSession] = useState(0);
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-big-small");

  const rounds = useMemo(
    () => makeBigSmallRounds(TOTAL),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session],
  );
  const { tile, askBig, bigFirst } = rounds[round];
  useAutoAnnounce(`Tap the ${askBig ? "BIG" : "SMALL"} one!`, `${session}-${round}`);

  /* Seats in display order: [isBig, isBig] — the big copy's seat
     comes from the deal, never from habit. */
  const seats = bigFirst ? [true, false] : [false, true];

  const pick = (seat: number, isBig: boolean) => {
    if (found) return;
    if (isBig === askBig) {
      playCorrect();
      setFound(true);
    } else {
      playGentle();
      setWiggleSeat(seat);
      window.setTimeout(() => setWiggleSeat((w) => (w === seat ? null : w)), 450);
    }
  };

  const next = () => {
    if (round + 1 >= TOTAL) {
      finish();
      return;
    }
    setRound((r) => r + 1);
    setFound(false);
    setWiggleSeat(null);
  };

  const replay = () => {
    resetCompletion();
    setSession((s) => s + 1);
    setRound(0);
    setFound(false);
    setWiggleSeat(null);
  };

  if (xpEarned !== null) {
    return (
      <GameCelebration
        title="You did it!"
        subtitle="Big and small complete"
        xpEarned={xpEarned}
        accent={ACCENT}
        onReplay={replay}
      />
    );
  }

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      <GameHeader title="Big and small" onBack={onBack} step={round} total={TOTAL} />
      <GameSheet>
        <PromptRow speakText={`Tap the ${askBig ? "BIG" : "SMALL"} one!`} accent={ACCENT} large>
          Tap the <span style={{ color: ACCENT }}>{askBig ? "BIG" : "SMALL"}</span> one!
        </PromptRow>

        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <p className="h-6 text-[17px] font-black" style={{ color: found ? GREEN_DEEP : "transparent" }}>
            {found ? `That's the ${askBig ? "big" : "small"} one!` : " "}
          </p>
        </div>

        <div className="flex min-h-[104px] flex-col justify-center">
          {found ? (
            <NextButton label={round + 1 >= TOTAL ? "Finish" : "Next"} accent={ACCENT} onClick={next} />
          ) : (
            <div className="flex items-end gap-3" key={`${session}-${round}-${tileKey(tile)}`}>
              {seats.map((isBig, seat) => (
                <ChoiceButton
                  key={seat}
                  label={`${isBig ? "Big" : "Small"} ${tile.shape}`}
                  wiggling={wiggleSeat === seat}
                  onTap={() => pick(seat, isBig)}
                >
                  <span className="flex h-[160px] items-center justify-center">
                    <ShapeSvg shape={tile.shape} color={tile.color} size={isBig ? BIG : SMALL} />
                  </span>
                  <span className="text-[14px] font-bold capitalize text-soft">
                    {isBig ? "Big" : "Small"}
                  </span>
                </ChoiceButton>
              ))}
            </div>
          )}
        </div>

        {found && (
          <span
            className="kt-pop-in pointer-events-none absolute right-6 top-24 grid h-10 w-10 place-items-center rounded-full text-white"
            style={{ background: GREEN }}
          >
            <GlyphCheck size={21} />
          </span>
        )}
      </GameSheet>
    </div>
  );
}
