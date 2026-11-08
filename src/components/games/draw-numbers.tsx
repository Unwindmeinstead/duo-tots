"use client";

/* ─── Game 12 — Draw Numbers ───
   Trace-to-build the numbers 1–20: a big dashed number waits on
   the board and the child draws over it with a finger. Each
   session samples five fresh numbers from the full deck of 20. */

import { useMemo } from "react";
import { DRAW_NUMBERS } from "@/lib/games-data";
import { TraceGame, type TraceItem } from "./draw-shared";

const ACCENT = "#8B5CF6";

export function DrawNumbers({ onBack }: { onBack: () => void }) {
  const pool = useMemo<TraceItem[]>(
    () =>
      DRAW_NUMBERS.map((n) => ({
        key: `number-${n}`,
        prompt: `Draw the number ${n}!`,
        doneText: `You drew the number ${n}!`,
        guide: { kind: "text", text: String(n) },
      })),
    [],
  );

  return (
    <TraceGame
      gameId="game-draw-numbers"
      title="Draw numbers"
      celebrationSubtitle="Draw numbers complete"
      accent={ACCENT}
      aspect="square"
      pool={pool}
      onBack={onBack}
    />
  );
}
