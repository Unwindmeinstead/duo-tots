"use client";

/* ─── Game 13 — Draw Animals ───
   Trace the animal: the animal's own flat artwork sits on the
   board as a light silhouette guide and the child draws over its
   shape with a finger. The deck is exactly 20 animals, all drawn
   from the app's Animals lesson; each session samples five. */

import { useMemo } from "react";
import { DRAW_ANIMALS } from "@/lib/games-data";
import { TraceGame, type TraceItem } from "./draw-shared";

const ACCENT = "#FF7A59";

export function DrawAnimals({ onBack }: { onBack: () => void }) {
  const pool = useMemo<TraceItem[]>(
    () =>
      DRAW_ANIMALS.map((a) => ({
        key: `animal-${a.slug}`,
        prompt: `Draw the ${a.name.toLowerCase()}!`,
        doneText: `You drew the ${a.name.toLowerCase()}!`,
        guide: { kind: "image", src: `/images/animals/${a.slug}.svg` },
      })),
    [],
  );

  return (
    <TraceGame
      gameId="game-draw-animals"
      title="Draw animals"
      celebrationSubtitle="Draw animals complete"
      accent={ACCENT}
      aspect="square"
      pool={pool}
      onBack={onBack}
    />
  );
}
