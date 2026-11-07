"use client";

/* ─── Session-ending ritual ───
   The same calm ending every time: recap chips → parent proof
   moment → offline handoff → one big guilt-free "All done". No
   timers, no autoplay, no "one more?" pressure — the app goes
   quiet. Skinned in the Kidtopia system: royal top zone with Pip,
   white sheet for the recap. */

import { useEffect } from "react";
import { Mascot } from "@/components/mascot";
import { PillButton } from "@/components/kit";
import { GlyphStar } from "@/components/glyphs";
import { playCorrect } from "@/lib/audio";

/* The learned word's OWN colour (same hexes as the lesson swatches)
   — so a colour word's proof card leads with the colour actually
   taught, not the category's accent. */
const WORD_COLORS: Record<string, string> = {
  red: "#e74c3c", blue: "#3498db", green: "#2ecc71", yellow: "#f1c40f",
  orange: "#e67e22", purple: "#9b59b6", pink: "#e84393", white: "#ffffff",
  black: "#1a1a2e", brown: "#8B4513", gold: "#daa520", silver: "#C0C0C0",
  gray: "#95a5a6", grey: "#95a5a6", cyan: "#00bcd4", magenta: "#e91e63",
  indigo: "#3f51b5", turquoise: "#1abc9c", maroon: "#800000",
  navy: "#001f3f", beige: "#f5f5dc",
};

const BASIC_COLORS = [
  "red", "blue", "green", "yellow", "orange", "purple", "pink", "white",
  "black", "brown", "gold", "silver", "gray", "grey", "cyan", "magenta",
  "indigo", "turquoise", "maroon", "navy", "beige",
];

/* Offline handoff prompt, generated from what this session actually
   covered. `words` is ordered new-first, so words[0] is the freshest
   word to carry into the room. Returns null when there is nothing to
   hand off (the card is then hidden). */
export function handoffFor(
  categoryId: string,
  words: string[],
  categoryName?: string,
): string | null {
  const first = words[0];
  const colorWord = words.find((w) => BASIC_COLORS.includes(w.toLowerCase()));
  if (categoryId === "colors" || colorWord) {
    const word = colorWord ?? first;
    return word ? `Can you find something ${word} in your room?` : null;
  }
  if (categoryId === "actions") {
    return first ? `Show me how you ${first.toLowerCase()}!` : null;
  }
  if (categoryId === "animals") {
    return first ? `Can you make the sound of a ${first}?` : null;
  }
  if (categoryId === "numbers") {
    return first ? `Can you count ${first} little fingers?` : null;
  }
  if (categoryId.startsWith("world")) {
    return `Can you tell Mama one thing about ${categoryName ?? "the world"}?`;
  }
  return first ? `Can you find a ${first} in your room?` : null;
}

export function SessionEnd({
  categoryName,
  categoryColor,
  categoryId,
  newWords,
  seenThisSession,
  onHome,
}: {
  categoryName: string;
  categoryColor: string;
  categoryId: string;
  newWords: string[];
  seenThisSession: string[];
  onHome: () => void;
}) {
  useEffect(() => {
    playCorrect();
  }, []);

  const newSet = new Set(newWords);
  const proofWord = newWords[0] ?? seenThisSession[0];
  const handoff = handoffFor(categoryId, [...newWords, ...seenThisSession], categoryName);
  /* Recap cap: at most 12 chips, new words first, then the rest in
     session order. */
  const recap = [
    ...seenThisSession.filter((w) => newSet.has(w)),
    ...seenThisSession.filter((w) => !newSet.has(w)),
  ].slice(0, 12);
  /* The proof card leads with the proof word's own colour when the
     word IS a colour; otherwise the category colour. */
  const proofColor =
    categoryId === "colors" && proofWord
      ? (WORD_COLORS[proofWord.toLowerCase()] ?? categoryColor)
      : categoryColor;
  /* Light word colours need ink text on the flat card. */
  const proofInkText =
    categoryId === "colors" &&
    proofWord != null &&
    ["white", "yellow", "beige", "silver", "gold"].includes(proofWord.toLowerCase());

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      {/* Royal top zone: Pip + the heading */}
      <div className="blue-rings flex flex-col items-center px-5 pb-2 pt-10 text-center">
        <p className="text-[13px] font-black uppercase tracking-wider text-white/65">
          {categoryName}
        </p>
        <div className="kt-pop-in mt-3" aria-hidden>
          <Mascot pose="point" size={104} ring />
        </div>
        <h1 className="mt-3 text-[28px] font-black leading-tight text-white">
          Today&apos;s words
        </h1>
        {newWords.length > 0 ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[14px] font-black text-gold">
            <GlyphStar size={15} />
            New words today
          </p>
        ) : null}
      </div>

      {/* White sheet: recap, proof, handoff, exit */}
      <div className="flex flex-1 flex-col rounded-t-[32px] bg-white px-4 pb-[max(1.5rem,var(--safe-bottom))] pt-6 min-[402px]:px-5">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center">
          {seenThisSession.length > 0 ? (
            <div className="flex flex-wrap items-start justify-center gap-2">
              {recap.map((word) => {
                const isNew = newSet.has(word);
                return (
                  <span
                    key={word}
                    className={`inline-flex min-h-[48px] items-center gap-1.5 rounded-full px-4 py-2 text-[16px] font-black ${
                      isNew ? "text-white" : "bg-mist text-ink"
                    }`}
                    style={
                      isNew
                        ? { background: categoryColor, boxShadow: `inset 0 -4px 0 rgba(0,0,0,0.12)` }
                        : undefined
                    }
                  >
                    {isNew ? <GlyphStar size={14} /> : null}
                    {word}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-[15px] font-bold text-soft">
              You explored {categoryName} today.
            </p>
          )}

          {/* Parent proof moment */}
          {proofWord ? (
            <div
              className="mt-7 w-full rounded-[28px] p-5 text-center text-white shadow-[0_12px_32px_rgba(14,42,99,0.14)]"
              style={{ background: proofColor, color: proofInkText ? "#182642" : undefined }}
            >
              <p
                className="text-[13px] font-black uppercase tracking-wider"
                style={{ color: proofInkText ? "rgba(24,38,66,0.6)" : "rgba(255,255,255,0.8)" }}
              >
                Tell Mama the new word!
              </p>
              <p className="mt-1.5 break-words text-[44px] font-black leading-none tracking-tight">
                {proofWord}
              </p>
            </div>
          ) : null}

          {/* Offline handoff */}
          {handoff ? (
            <div className="mt-4 w-full rounded-[28px] bg-cream p-5 text-center">
              <p className="text-[13px] font-black uppercase tracking-wider text-gold-deep">
                Try it together
              </p>
              <p className="mt-1.5 text-[19px] font-black leading-snug text-ink">
                {handoff}
              </p>
            </div>
          ) : null}

          {/* One big, guilt-free exit */}
          <div className="mt-auto w-full pt-8">
            <PillButton color={categoryColor} onClick={onHome} className="min-h-[68px] w-full text-[21px]">
              All done
            </PillButton>
          </div>
        </div>
      </div>
    </div>
  );
}
