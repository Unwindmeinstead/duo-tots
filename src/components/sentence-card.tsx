"use client";

/* ─── Sentence card ───
   Shown after a word card in a lesson: the same photo, one tiny
   spoken sentence ("The boy is running."). Tap anywhere = the
   sentence is spoken once, with the standard reaction (pop, squash,
   sparkles). The photo is never cropped — a blurred copy of itself
   fills the frame behind it. */

import { useEffect, useRef, useState } from "react";
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
}

export function SentenceCard({
  word,
  sentence,
  categoryColor,
  imageSrc,
  onSpeak,
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

  return (
    <button
      type="button"
      onClick={handleTap}
      className="relative flex h-full w-full items-center justify-center text-left"
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
          <span className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-black text-ink shadow-[0_8px_20px_rgba(14,42,99,0.18)]">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: categoryColor }} aria-hidden />
        {word}
      </span>

          <span className="absolute inset-x-0 bottom-0 block bg-gradient-to-t from-black/70 via-black/40 to-transparent px-5 pb-5 pt-20">
        <span className="block text-[30px] font-black leading-[1.15] tracking-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.45)]">
          {sentence}
        </span>
        <span className="mt-3 inline-flex items-center gap-3">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-white"
            style={{ background: categoryColor }}
            aria-hidden
          >
            <GlyphSpeaker size={22} />
          </span>
          <span className="text-[14px] font-black text-white">Tap to hear</span>
        </span>
      </span>
        </span>
      ) : (
        <>
          <span
            className={`absolute inset-0 block ${reacting ? "kt-bounce" : ""}`}
            style={{ background: categoryColor }}
          />
          <span className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-black text-ink shadow-[0_8px_20px_rgba(14,42,99,0.18)]">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: categoryColor }} aria-hidden />
        {word}
      </span>

          <span className="absolute inset-x-0 bottom-0 block bg-gradient-to-t from-black/70 via-black/40 to-transparent px-5 pb-5 pt-20">
        <span className="block text-[30px] font-black leading-[1.15] tracking-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.45)]">
          {sentence}
        </span>
        <span className="mt-3 inline-flex items-center gap-3">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-white"
            style={{ background: categoryColor }}
            aria-hidden
          >
            <GlyphSpeaker size={22} />
          </span>
          <span className="text-[14px] font-black text-white">Tap to hear</span>
        </span>
      </span>
        </>
      )}

      <Sparkles burstKey={burstKey} />
    </button>
  );
}
