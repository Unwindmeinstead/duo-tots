"use client";

/* ─── Game 11 — Draw Letters ───
   Trace-to-build the alphabet: a big dashed letter waits on the
   board and the child draws over it with a finger. The deck is
   the full A–Z (26); each session samples five fresh letters. */

import { useMemo } from "react";
import { DRAW_LETTERS } from "@/lib/games-data";
import { TraceGame, type TraceItem } from "./draw-shared";

const ACCENT = "#F24949";

export function DrawLetters({ onBack }: { onBack: () => void }) {
  const pool = useMemo<TraceItem[]>(
    () =>
      DRAW_LETTERS.map((letter) => ({
        key: `letter-${letter}`,
        prompt: `Draw the letter ${letter}!`,
        doneText: `You drew the letter ${letter}!`,
        guide: { kind: "text", text: letter },
      })),
    [],
  );

  return (
    <TraceGame
      gameId="game-draw-letters"
      title="Draw letters"
      celebrationSubtitle="Draw letters complete"
      accent={ACCENT}
      aspect="square"
      pool={pool}
      onBack={onBack}
    />
  );
}
