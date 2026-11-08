"use client";

/* ─── Sentence card ───
   Shown after a word card in a lesson: the same photo, one tiny
   spoken sentence ("The boy is running."). Tap anywhere = the
   sentence is spoken once, with the standard reaction (pop, squash,
   sparkles). The photo is never cropped — it sits whole inside the
   universal lesson shell (lesson-card.tsx), the same box as the
   word card it follows.
   No-bounce rule (Grey, 2026-11-07): when the deck is a photo deck
   the caller passes noBounce — pop + sparkles + speech stay, the
   photo never squashes. See deckKeepsTapMotion in word-visual.
   Variant A (Grey's pick, 2026-11-07): the lesson controls ride
   INSIDE the photo's bottom band, stacked under the sentence — the
   sentence keeps its own lines, the control row sits below it, and
   the two never share a row. The root is a div, not a <button>, so
   the band's real buttons never nest inside another button. */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { playPop } from "@/lib/audio";
import { Sparkles } from "@/components/kit";
import { CardShell, CardStage } from "@/components/lesson-card";
import { GlyphSpeaker } from "@/components/glyphs";

export interface SentenceCardProps {
  word: string;
  sentence: string;
  categoryColor: string;
  /** Resolved local photo for the word (may be null → colour backdrop). */
  imageSrc?: string | null;
  onSpeak?: () => void;
  /** Photo decks: tap keeps pop + sparkles + speech, no card motion. */
  noBounce?: boolean;
  /** Lesson controls (prev · Practice · Next) for the in-photo band. */
  footer?: ReactNode;
  /** In-card top chrome (back · speaker · counter) — CardChrome from
      lesson-card.tsx, shared with the word cards (frame fix, Grey,
      2026-11-08). */
  chrome?: ReactNode;
}

export function SentenceCard({
  word,
  sentence,
  categoryColor,
  imageSrc,
  onSpeak,
  noBounce = false,
  footer,
  chrome,
}: SentenceCardProps) {
  const [burstKey, setBurstKey] = useState(0);
  const [reacting, setReacting] = useState(false);
  const reactTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (reactTimerRef.current !== null) window.clearTimeout(reactTimerRef.current);
    },
    [],
  );

  const handleTap = () => {
    playPop();
    setBurstKey((k) => k + 1);
    if (!noBounce) {
      if (reactTimerRef.current !== null) window.clearTimeout(reactTimerRef.current);
      setReacting(false);
      requestAnimationFrame(() => {
        setReacting(true);
        reactTimerRef.current = window.setTimeout(() => setReacting(false), 560);
      });
    }
    onSpeak?.();
  };

  /* The word pill rides under the shared chrome row (back · speaker
     · counter own the card's top edge since the 2026-11-08 frame
     fix) — same right edge, one row down, so nothing overlaps. */
  const wordPill = (
    <span className="absolute right-3 top-[4.25rem] inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-black text-ink ring-1 ring-black/10">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: categoryColor }} aria-hidden />
      {word}
    </span>
  );

  /* Bottom band: sentence on its own lines, speaker disc under it,
     then the control row — stacked, never side by side (variant A). */
  const band = (
    <span className="absolute inset-x-0 bottom-0 block bg-gradient-to-t from-black/70 via-black/40 to-transparent px-4 pb-4 pt-20">
      <span className="block text-[30px] font-black leading-[1.15] tracking-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.45)]">
        {sentence}
      </span>
      <span className="mt-3 inline-flex items-center">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-white"
          style={{ background: categoryColor }}
          aria-hidden
        >
          <GlyphSpeaker size={22} />
        </span>
        {/* Speaker disc only — no "Tap to hear" wording (Grey, 2026-11-07). */}
      </span>
      {footer ? (
        <span className="mt-3 block" onClick={(e) => e.stopPropagation()}>
          {footer}
        </span>
      ) : null}
    </span>
  );

  /* Universal shell (Grey, 2026-11-07): the sentence card is the
     SAME box as the word card it follows — same outer dimensions,
     same bottom band — so a deck never changes shape mid-lesson.
     The photo sits whole inside the shell (contain over a blurred
     copy of itself), never cropped. */
  return (
    <CardStage onClick={handleTap} ariaLabel={sentence} className="text-left">
      <CardShell
        chrome={chrome}
        className={`${imageSrc && reacting ? "kt-squash" : ""}`}
        style={imageSrc ? undefined : { background: categoryColor }}
      >
        {imageSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
              draggable={false}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt=""
              className="absolute inset-0 h-full w-full object-contain"
              draggable={false}
            />
          </>
        ) : (
          <span
            className={`absolute inset-0 block ${reacting ? "kt-bounce" : ""}`}
            aria-hidden
          />
        )}
        {wordPill}
        {band}
        <Sparkles burstKey={burstKey} />
      </CardShell>
    </CardStage>
  );
}
