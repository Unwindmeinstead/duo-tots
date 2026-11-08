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
   same bottom band position, same button inset.

   FRAME FIX (Grey, 2026-11-08, from his own phone screenshot): the
   shell used to be a strict 2:3 box vertically centred under a big
   external chrome band on a full-screen blue stage — ~25% of the
   phone was dead blue above the card. The band is gone (progress is
   a hairline; back / speaker / counter ride INSIDE the card via
   CardChrome below) and the shell now FILLS its stage: full stage
   height, stage width — capped on short/wide screens so the box
   keeps a sane portrait proportion there. Portrait photos (2:3)
   sit whole inside it (contain, over a blurred copy of themselves)
   exactly as before; nothing is ever cropped. */

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { GlyphChevronL, GlyphSpeaker } from "@/components/glyphs";

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
 * The fixed-geometry card box. The shell FILLS its stage (frame
 * fix, Grey, 2026-11-08): height is the stage's full height and the
 * width follows the stage, capped at (viewport height × 2/3) so a
 * short/wide screen (a desktop window) still gets a portrait card
 * instead of a giant slab — the cap that used to keep the 2:3 box
 * inside the stage, kept for width only. On phones the cap never
 * binds: the card starts right under the hairline and runs to the
 * stage's bottom edge. Content modes fill it absolutely / by flex
 * centring; the bottom band anchors to its bottom edge — the same
 * place on every card. `chrome` (CardChrome) renders last, inside
 * the card's top edge, above every content mode.
 */
export function CardShell({
  children,
  chrome,
  className = "",
  style,
}: {
  children: ReactNode;
  chrome?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`relative block max-h-full shrink-0 overflow-hidden ${className}`}
      style={{
        borderRadius: LESSON_CARD_RADIUS,
        /* No drop shadow — flat is the Kidtopia law (Grey, 2026-11-07). */
        height: "100%",
        width: "min(100%, calc((100dvh - 3.5rem) * 2 / 3))",
        marginInline: "auto",
        ...style,
      }}
    >
      {children}
      {chrome}
    </div>
  );
}

/**
 * In-card top chrome (Grey's standing rulings, enforced 2026-11-08):
 * a small back arrow INSIDE the card's top-left, a speaker badge in
 * the top corner (tap = hear the word), and the "n/20" counter chip
 * inside the top-right. There is NO chrome outside the card anymore
 * — no external back disc, no progress bar, no counter pill. Chips
 * are flat white with a hairline ring so they read on any photo and
 * on the white Shapes card alike; each chip stops click propagation
 * so pressing one never also triggers the card's tap-to-speak.
 */
export function CardChrome({
  backHref,
  counter,
  onSpeak,
  extra,
}: {
  backHref?: string;
  /** Compact in-photo counter, e.g. "3/20". */
  counter?: string;
  onSpeak?: () => void;
  /** Extra node stacked under the top-right chips (sentence word pill). */
  extra?: ReactNode;
}) {
  const chip =
    "grid h-11 w-11 place-items-center rounded-full bg-white text-ink ring-1 ring-black/10";
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between p-3">
      <span
        className="pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {backHref ? (
          <Link href={backHref} aria-label="Back to home" className={chip}>
            <GlyphChevronL size={22} />
          </Link>
        ) : null}
      </span>
      <span className="flex flex-col items-end gap-2">
        <span className="flex items-center gap-2">
          {onSpeak ? (
            <span
              className="pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Hear it"
                onClick={onSpeak}
                className={`${chip} transition-transform active:scale-95`}
              >
                <GlyphSpeaker size={20} />
              </button>
            </span>
          ) : null}
          {counter ? (
            <span className="pointer-events-auto flex h-11 items-center rounded-full bg-white px-3 text-[15px] font-black tabular-nums text-ink ring-1 ring-black/10">
              {counter}
            </span>
          ) : null}
        </span>
        {extra}
      </span>
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
