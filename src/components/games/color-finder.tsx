"use client";

/* ─── Game 5 — Color Finder ───
   The colour is CALLED OUT — spoken by the read-back voice and
   written big — and four big colour blobs wait below. Tap the
   blob that matches. A wrong blob wiggles with the gentle ding;
   the right one pops with a check. Every round deals a fresh
   target colour and three fresh decoys in shuffled spots, so the
   answer is never in the same place twice in a row. */

import { useMemo, useState } from "react";
import { GlyphCheck } from "@/components/glyphs";
import { playCorrect, playGentle } from "@/lib/audio";
import { makeColorRounds, type GameColor } from "@/lib/games-data";
import { GREEN, GREEN_DEEP, deepen } from "@/lib/theme";
import { ChoiceButton, GameCelebration, GameHeader, GameSheet, NextButton, PromptRow, useAutoAnnounce, useGameCompletion } from "./shared";

const ACCENT = "#D64FD6";
const TOTAL = 5;

export function ColorFinder({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [found, setFound] = useState(false);
  const [wiggleName, setWiggleName] = useState<string | null>(null);
  const [session, setSession] = useState(0);
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-color-finder");

  const rounds = useMemo(
    () => makeColorRounds(TOTAL),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session],
  );
  const { target, choices } = rounds[round];

  /* Call the colour out as each round lands — hearing the word is
     half the game. The shared hook speaks it exactly once per
     round and stays silent when the parent sound setting is off. */
  useAutoAnnounce(`Find ${target.name.toLowerCase()}!`, `${session}-${round}`);

  const pick = (color: GameColor) => {
    if (found) return;
    if (color.name === target.name) {
      playCorrect();
      setFound(true);
    } else {
      playGentle();
      setWiggleName(color.name);
      window.setTimeout(() => setWiggleName((w) => (w === color.name ? null : w)), 450);
    }
  };

  const next = () => {
    if (round + 1 >= TOTAL) {
      finish();
      return;
    }
    setRound((r) => r + 1);
    setFound(false);
    setWiggleName(null);
  };

  const replay = () => {
    resetCompletion();
    setSession((s) => s + 1);
    setRound(0);
    setFound(false);
    setWiggleName(null);
  };

  if (xpEarned !== null) {
    return (
      <GameCelebration
        title="You did it!"
        subtitle="Color finder complete"
        xpEarned={xpEarned}
        accent={ACCENT}
        onReplay={replay}
      />
    );
  }

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      <GameHeader title="Color finder" onBack={onBack} step={round} total={TOTAL} />
      <GameSheet>
        {/* The call-out: hear it, read it, then find it — the shared
            speaker button speaks the exact same string the round
            auto-speaks, and tracks the freshly dealt colour. */}
        <PromptRow speakText={`Find ${target.name.toLowerCase()}!`} accent={ACCENT} large>
          Find{" "}
          <span style={{ color: target.name === "White" ? "#7587AB" : target.hex }}>
            {target.name.toLowerCase()}
          </span>
          !
        </PromptRow>

        {/* The mystery blob — fills with the found colour */}
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <div
            className="kt-card relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64"
            aria-label={found ? `You found ${target.name}` : "Mystery colour blob"}
          >
            {found ? (
              <span key={`found-${round}-${session}`} className="kt-fly-in block">
                <span
                  className="block h-[150px] w-[150px] rounded-full"
                  style={{
                    background: target.hex,
                    border: `3px solid ${deepen(target.hex)}`,
                    boxShadow: "inset 0 -12px 0 rgba(0,0,0,0.12), inset 10px 12px 0 rgba(255,255,255,0.25)",
                  }}
                />
              </span>
            ) : (
              <span className="kt-pulse-soft flex h-[150px] w-[150px] items-center justify-center rounded-full border-[3px] border-dashed border-[#8496B8] bg-[#F2F5FC] text-[64px] font-black text-soft">
                ?
              </span>
            )}
            {found && (
              <span
                className="kt-pop-in absolute -right-2 -top-2 grid h-10 w-10 place-items-center rounded-full text-white"
                style={{ background: GREEN }}
              >
                <GlyphCheck size={21} />
              </span>
            )}
          </div>
          <p className="mt-4 h-6 text-[17px] font-black" style={{ color: found ? GREEN_DEEP : "transparent" }}>
            {found ? `Yes — that's ${target.name.toLowerCase()}!` : " "}
          </p>
        </div>

        {/* Four big blobs / next — fixed-height slot */}
        <div className="flex min-h-[104px] flex-col justify-center">
          {found ? (
            <NextButton label={round + 1 >= TOTAL ? "Finish" : "Next"} accent={ACCENT} onClick={next} />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {choices.map((color) => (
                <ChoiceButton
                  key={color.name}
                  label={color.name}
                  wiggling={wiggleName === color.name}
                  onTap={() => pick(color)}
                >
                  <span
                    className="block h-[68px] w-[68px] rounded-full"
                    style={{
                      background: color.hex,
                      border: `3px solid ${deepen(color.hex)}`,
                      boxShadow: "inset 0 -8px 0 rgba(0,0,0,0.12), inset 6px 8px 0 rgba(255,255,255,0.25)",
                    }}
                  />
                  <span className="text-[14px] font-bold text-soft">{color.name}</span>
                </ChoiceButton>
              ))}
            </div>
          )}
        </div>
      </GameSheet>
    </div>
  );
}
