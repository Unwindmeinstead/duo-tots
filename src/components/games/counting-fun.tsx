"use client";

/* ─── Game 7 — Counting Fun ───
   A scatter of shapes appears — count them, then tap the number.
   The count (1–10), the shape, its colour, the scatter's tilts
   and the answer tiles are all dealt fresh every round, and the
   count never repeats back-to-back: the child has to actually
   count, every single time. Getting it right speaks the number
   word back as a mirror. */

import { useMemo, useState } from "react";
import { playCorrect, playGentle, speakWord } from "@/lib/audio";
import { NUMBER_WORDS, makeCountRounds } from "@/lib/games-data";
import { GREEN_DEEP } from "@/lib/theme";
import { ShapeSvg } from "./shapes";
import { ChoiceButton, GameCelebration, GameHeader, GameSheet, NextButton, PromptRow, useGameCompletion, useAutoAnnounce } from "./shared";

const ACCENT = "#FF6FA5";
const TOTAL = 5;

export function CountingFun({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wiggleNum, setWiggleNum] = useState<number | null>(null);
  const [session, setSession] = useState(0);
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-counting-fun");

  const rounds = useMemo(
    () => makeCountRounds(TOTAL),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session],
  );
  const current = rounds[round];
  useAutoAnnounce(`How many ${current.tile.shape}s do you see?`, `${session}-${round}`);

  const pick = (n: number) => {
    if (solved) return;
    if (n === current.count) {
      playCorrect();
      void speakWord(NUMBER_WORDS[n - 1]);
      setSolved(true);
    } else {
      playGentle();
      setWiggleNum(n);
      window.setTimeout(() => setWiggleNum((w) => (w === n ? null : w)), 450);
    }
  };

  const next = () => {
    if (round + 1 >= TOTAL) {
      finish();
      return;
    }
    setRound((r) => r + 1);
    setSolved(false);
    setWiggleNum(null);
  };

  const replay = () => {
    resetCompletion();
    setSession((s) => s + 1);
    setRound(0);
    setSolved(false);
    setWiggleNum(null);
  };

  if (xpEarned !== null) {
    return (
      <GameCelebration
        title="You did it!"
        subtitle="Counting fun complete"
        xpEarned={xpEarned}
        accent={ACCENT}
        onReplay={replay}
      />
    );
  }

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      <GameHeader title="Counting fun" onBack={onBack} step={round} total={TOTAL} />
      <GameSheet>
        <PromptRow speakText={`How many ${current.tile.shape}s do you see?`} accent={ACCENT}>
          How many {current.tile.shape}s do you see?
        </PromptRow>

        {/* The scatter — count the shapes */}
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <div
            className="kt-card flex w-full max-w-md flex-wrap items-center justify-center gap-x-4 gap-y-3 px-5 py-6"
            role="img"
            aria-label={solved ? `${current.count} ${current.tile.shape}s` : "Some shapes to count"}
          >
            {Array.from({ length: current.count }, (_, i) => (
              <span
                key={`${round}-${session}-${i}`}
                className="kt-pop-in inline-flex"
                style={{ transform: `rotate(${current.tilts[i]}deg)`, animationDelay: `${i * 45}ms` }}
              >
                <ShapeSvg shape={current.tile.shape} color={current.tile.color} size={52} />
              </span>
            ))}
          </div>
          <p className="mt-4 h-6 text-[17px] font-black capitalize" style={{ color: solved ? GREEN_DEEP : "transparent" }}>
            {solved ? `Yes — ${NUMBER_WORDS[current.count - 1]}!` : " "}
          </p>
        </div>

        {/* Numeral choices / next — fixed-height slot */}
        <div className="flex min-h-[104px] flex-col justify-center">
          {solved ? (
            <NextButton label={round + 1 >= TOTAL ? "Finish" : "Next"} accent={ACCENT} onClick={next} />
          ) : (
            <div className="flex gap-3">
              {current.choices.map((n) => (
                <ChoiceButton
                  key={n}
                  label={`Number ${n}`}
                  wiggling={wiggleNum === n}
                  onTap={() => pick(n)}
                >
                  <span className="text-[46px] font-black leading-none text-ink">{n}</span>
                  <span className="text-[13px] font-bold capitalize text-soft">{NUMBER_WORDS[n - 1]}</span>
                </ChoiceButton>
              ))}
            </div>
          )}
        </div>
      </GameSheet>
    </div>
  );
}
