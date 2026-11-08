"use client";

/* ─── Game 14 — Draw Words ───
   Trace short words on the game card: the whole word waits in big
   dashed capitals and the child draws over it with a finger. The
   deck is exactly 20 short words, every one already a word in the
   app's vocabulary; each session samples five fresh words. */

import { useMemo } from "react";
import { DRAW_WORDS } from "@/lib/games-data";
import { TraceGame, type TraceItem } from "./draw-shared";

const ACCENT = "#D64FD6";

export function DrawWords({ onBack }: { onBack: () => void }) {
  const pool = useMemo<TraceItem[]>(
    () =>
      DRAW_WORDS.map((word) => ({
        key: `word-${word}`,
        prompt: `Trace the word ${word}!`,
        doneText: `You traced ${word}!`,
        guide: { kind: "text", text: word.toUpperCase() },
      })),
    [],
  );

  return (
    <TraceGame
      gameId="game-draw-words"
      title="Draw words"
      celebrationSubtitle="Draw words complete"
      accent={ACCENT}
      aspect="wide"
      pool={pool}
      onBack={onBack}
    />
  );
}
