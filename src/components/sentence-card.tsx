"use client";

/* ─── Sentence card ───
   Shown after a word card in a lesson: the same photo, one tiny
   spoken sentence ("The boy is running."). Tap anywhere = the
   sentence is spoken once, with the standard reaction (pop, squash,
   sparkles). The photo is never cropped — it renders at its own
   aspect ratio, as large as the stage allows.
   Variant A (Grey's pick, 2026-11-07): the lesson controls ride
   INSIDE the photo's bottom band, stacked under the sentence — the
   sentence keeps its own lines, the control row sits below it, and
   the two never share a row. The root is a div, not a <button>, so
   the band's real buttons never nest inside another button. */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { playPop } from "@/lib/audio";
import { Sparkles } from "@/components/kit";
import { GlyphSpeaker } from "@/components/glyphs";

export interface SentenceCardProps {
  word: string;
  sentence: string;
  categoryColor: string;
  /** Resolved local photo for the word (may be null → colour backdrop). */
  imageSrc?: string | null;
  onSpeak?: () => void;
  /** Lesson controls (prev · Practice · Next) for the in-photo band. */
  footer?: ReactNode;
}

export function SentenceCard({
  word,
  sentence,
  categoryColor,
  imageSrc,
  onSpeak,
  footer,
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
    if (reactTimerRef.current !== null) window.clearTimeout(reactTimerRef.current);
    setReacting(false);
    requestAnimationFrame(() => {
      setReacting(true);
      reactTimerRef.current = window.setTimeout(() => setReacting(false), 560);
    });
    onSpeak?.();
  };

  const wordPill = (
    <span className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-black text-ink shadow-[0_8px_20px_rgba(14,42,99,0.18)]">
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

  return (
    <div
      role="button"
      onClick={handleTap}
      className="relative flex h-full w-full cursor-pointer items-center justify-center text-left"
      aria-label={sentence}
    >
      {imageSrc ? (
        <span className={`relative block max-h-full max-w-full overflow-hidden rounded-[30px] shadow-[0_18px_44px_rgba(14,42,99,0.30)] ${reacting ? "kt-squash" : ""}`}>
          {/* The card IS the photo — whole picture, never cropped. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt=""
            className="block max-h-full max-w-full"
            draggable={false}
          />
          {wordPill}
          {band}
        </span>
      ) : (
        <>
          <span
            className={`absolute inset-0 block ${reacting ? "kt-bounce" : ""}`}
            style={{ background: categoryColor }}
          />
          {wordPill}
          {band}
        </>
      )}

      <Sparkles burstKey={burstKey} />
    </div>
  );
}
