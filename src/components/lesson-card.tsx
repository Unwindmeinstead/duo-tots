"use client";

/* ─── Universal lesson card shell ───
   ONE geometry for every lesson deck (Grey's order, 2026-11-07):
   before this, tile decks (Numbers, Alphabet, Shapes, Colours)
   filled the whole stage while photo decks shrink-wrapped to the
   photo's own aspect — so a Numbers card towered over the Nature
   Tree card and its buttons sat ~28px from the screen's bottom edge
   while the Tree's floated ~135px up (and a wide photo's ~308px).

   The rule now: every card — photo, digit hero, letter hero, colour
   swatch, shape art, static art, concept card, sentence card —
   renders inside this shell. Same outer box on a given device,
   same bottom band position, same button inset. The shell's aspect
   is 2:3, the aspect of the rebuilt portrait photos (900×1350), so
   portrait photos fill it edge-to-edge exactly; wider photos sit
   whole inside it (contain, over a blurred copy of themselves). */

import type { CSSProperties, ReactNode } from "react";

/** Card aspect — width : height, matching the portrait photo rebuild. */
export const LESSON_CARD_ASPECT = "2 / 3";
/** Card corner radius (px) — the Kidtopia 30px card curve. */
export const LESSON_CARD_RADIUS = 30;
/** Bottom inset of the button row inside every card (px), and the
    band's horizontal padding — identical on every deck. */
export const LESSON_CARD_BAND_INSET = 16;

/**
 * Stage-filling tap root: centres the shell in the lesson stage and
 * carries the card's tap target (role / aria / onClick live here so
 * the band's real buttons never nest inside another button).
 */
export function CardStage({
  children,
  onClick,
  ariaLabel,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex h-full w-full items-center justify-center ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * The fixed-geometry card box. Width follows the stage; height is
 * the width at the universal aspect, clamped by the stage height.
 * Content modes fill it absolutely / by flex centring; the bottom
 * band anchors to its bottom edge — the same place on every card.
 */
export function CardShell({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`relative block max-h-full shrink-0 overflow-hidden ${className}`}
      style={{
        aspectRatio: LESSON_CARD_ASPECT,
        borderRadius: LESSON_CARD_RADIUS,
        /* Size from the stage's HEIGHT as well as its width. On a
           short stage (a desktop window: height < 1.5 × max-w-2xl)
           a bare `w-full` box prices its height off the full column
           width (672px → 1008px tall) and the stage's
           align-items:center then centres a box the stage cannot
           hold — its top half spills off-screen and the card reads
           as a giant square-ish slab, not the tall 2:3 photo card
           (desktop render bug, Grey, 2026-11-07). Capping the width
           at (stage height × 2/3) keeps the whole 2:3 box inside
           the stage at every viewport; on phones (tall stages) the
           cap never binds and the width-driven size is unchanged.
           `shrink-0` stops the stage's flex row from re-squashing
           the box when the cap and the column width disagree. */
        width: "min(100%, calc((100dvh - 9rem) * 2 / 3))",
        marginInline: "auto",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * The card's bottom band for the lesson controls (Previous ·
 * Practice · Next): pinned to the shell's bottom edge with the
 * universal inset, click-shielded so pressing a control never
 * triggers the card's tap-to-speak.
 */
export function CardBand({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <div
      className="absolute inset-x-0 bottom-0"
      style={{
        paddingLeft: LESSON_CARD_BAND_INSET,
        paddingRight: LESSON_CARD_BAND_INSET,
        paddingBottom: LESSON_CARD_BAND_INSET,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}
