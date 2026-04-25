"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { resolveWordImage } from "@/lib/media";
import { CATEGORY_ICONS, IconBack } from "./icons";
import { getLocalIllustration } from "./local-illustrations";
import type { ImageMode } from "@/lib/vocab";

const CAPTION = "text-center text-[13px] font-semibold tracking-tight pb-3 pt-2";

/** Bust PWA / browser caches for curated PNGs (precache + static-image-assets use URL-only keys). Bump when assets change. */
const CURATED_STATIC_BITMAP_VER = "20260416-portrait-v2";

function mediaLessonTapHint(categoryId: string): string {
  if (categoryId === "actions") return "Tap action · swipe for more";
  return "Tap picture · swipe for more";
}

interface WordVisualProps {
  word: string;
  imageQuery: string;
  assetKey?: string;
  imageMode: ImageMode;
  categoryColor: string;
  categoryId: string;
  onClick?: () => void;
  className?: string;
  immersive?: boolean;
  /** Immersive lesson: progress pill, swipe on hero, prev + quiz in footer (all topics when enabled from lesson) */
  immersiveLessonChrome?: {
    current: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
    quizHref: string;
  };
}

export function WordVisual({
  word,
  imageQuery,
  assetKey,
  imageMode,
  categoryColor,
  categoryId,
  onClick,
  className = "",
  immersive = false,
  immersiveLessonChrome,
}: WordVisualProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(imageMode === "photo" || imageMode === "vector");
  const swipeStart = useRef<{ x: number; y: number; id: number } | null>(null);
  const swipeSuppressClick = useRef(false);

  useEffect(() => {
    if (imageMode !== "photo" && imageMode !== "vector") return;
    let mounted = true;
    setLoading(true);
    const mediaMode = imageMode === "vector" ? "vector" : "photo";
    resolveWordImage(imageQuery, mediaMode).then((res) => {
      if (!mounted) return;
      setImageUrl(res.imageUrl);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [imageQuery, imageMode, word, categoryId]);

  const wrapperProps = onClick ? { onClick, role: "button", tabIndex: 0 } as const : {};

  const ichrome = immersiveLessonChrome;
  const onImmersivePointerDown = (e: React.PointerEvent) => {
    if (!ichrome || e.button !== 0) return;
    swipeStart.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const onImmersivePointerUp = (e: React.PointerEvent) => {
    if (!ichrome || !swipeStart.current || e.pointerId !== swipeStart.current.id) return;
    const dx = e.clientX - swipeStart.current.x;
    const dy = e.clientY - swipeStart.current.y;
    swipeStart.current = null;
    const min = 56;
    if (Math.abs(dx) < min || Math.abs(dx) < Math.abs(dy) * 1.15) return;
    swipeSuppressClick.current = true;
    if (dx < 0) ichrome.onNext();
    else ichrome.onPrev();
  };
  const onImmersivePointerCancel = () => {
    swipeStart.current = null;
  };
  const onImmersiveHeroClick = () => {
    if (swipeSuppressClick.current) {
      swipeSuppressClick.current = false;
      return;
    }
    onClick?.();
  };
  const immersiveShell = `relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl bg-[var(--bg)] shadow-[var(--shadow-sm)] ring-1 ring-[color:var(--border)] ${className}`;

  /* ── Digit mode (Numbers) — same flat fill as app page (--bg); numeral stays the focal point ── */
  if (imageMode === "digit") {
    const n = parseInt(word, 10);
    const sz = digitHeroSize(word.length);
    const wordLabel = isNaN(n) ? "" : numberToWord(n);

    const digitHero = (
      <span
        className={`select-none font-black tabular-nums tracking-tighter leading-none ${sz}`}
        style={{
          color: "var(--ink)",
          textShadow: "0 1px 0 rgba(255,255,255,.55), 0 10px 28px rgba(40,35,25,.08)",
        }}
      >
        {word}
      </span>
    );

    if (ichrome) {
      return (
        <div className={immersiveShell}>
          <div className="pointer-events-none absolute right-2 top-2 z-10 sm:right-3 sm:top-3" aria-hidden>
            <span className="inline-flex items-baseline gap-px rounded-full border border-[color:var(--border)] bg-[var(--surface)] px-1.5 py-0.5 pl-2 shadow-[var(--shadow-xs)]">
              <span className="text-[10px] font-semibold tabular-nums text-[var(--ink-secondary)]">{ichrome.current}</span>
              <span className="text-[9px] font-medium text-[var(--ink-tertiary)]">/</span>
              <span className="text-[10px] font-semibold tabular-nums text-[var(--ink-secondary)]">{ichrome.total}</span>
            </span>
          </div>

          <div
            className="relative flex min-h-0 flex-1 touch-manipulation items-center justify-center px-1 sm:px-3"
            onPointerDown={onImmersivePointerDown}
            onPointerUp={onImmersivePointerUp}
            onPointerCancel={onImmersivePointerCancel}
            onPointerLeave={(e) => { if (e.buttons === 0) swipeStart.current = null; }}
          >
            <button
              type="button"
              onClick={onImmersiveHeroClick}
              className="flex min-h-0 w-full flex-1 flex-col items-center justify-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--border-solid)]"
            >
              {digitHero}
            </button>
          </div>

          <div
            className="relative z-10 flex shrink-0 items-end justify-between gap-2 border-t border-[color:var(--border)] bg-transparent px-2.5 pt-2.5 sm:px-3 sm:pt-3"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
          >
            <button
              type="button"
              aria-label="Previous card"
              onClick={(e) => { e.stopPropagation(); ichrome.onPrev(); }}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] text-[var(--ink-secondary)] shadow-[var(--shadow-xs)] transition-transform active:scale-95"
            >
              <IconBack size={20} />
            </button>
            <div className="min-w-0 flex-1 px-1 text-center">
              {wordLabel ? (
                <p className="mx-auto max-w-[min(100%,18rem)] text-[clamp(0.9rem,3.4vmin,1.2rem)] font-semibold leading-snug tracking-[0.03em] text-[var(--ink-secondary)]">
                  {wordLabel}
                </p>
              ) : null}
              <p className="mt-0.5 text-[11px] font-semibold text-[var(--ink-tertiary)]">Tap number · swipe for more</p>
            </div>
            <Link
              href={ichrome.quizHref}
              className="flex h-11 min-w-[3.25rem] flex-shrink-0 items-center justify-center rounded-2xl border border-white/50 px-3 text-[12px] font-bold tracking-tight text-white shadow-md transition-transform active:scale-95"
              style={{ background: categoryColor, boxShadow: `0 6px 16px ${categoryColor}35` }}
            >
              Quiz
            </Link>
          </div>
        </div>
      );
    }

    return (
      <Wrapper {...wrapperProps} className={immersiveShell}>
        <div className="relative flex min-h-0 flex-1 items-center justify-center px-1 sm:px-3">
          {digitHero}
        </div>

        <div className="relative shrink-0 px-4 pb-5 pt-2 sm:pb-6">
          {wordLabel ? (
            <p className="mx-auto max-w-[min(100%,24rem)] text-center text-[clamp(1rem,4vmin,1.35rem)] font-semibold leading-snug tracking-[0.04em] text-[var(--ink-secondary)]">
              {wordLabel}
            </p>
          ) : null}
          <p className={`${CAPTION} mt-1 pb-0 text-[var(--ink-tertiary)]`}>Tap to hear</p>
        </div>
      </Wrapper>
    );
  }

  /* ── Alphabet mode (A–Z) — same immersive lesson shell and hero scale as Numbers ── */
  if (imageMode === "alphabet") {
    const letter = (word.trim().slice(0, 1) || word).toUpperCase();
    const sz = digitHeroSize(1);
    const wordLabel = letter ? `Letter ${letter}` : "";

    const letterHero = (
      <span
        className={`select-none font-black uppercase tracking-tight leading-none ${sz}`}
        style={{
          color: "var(--ink)",
          textShadow: "0 1px 0 rgba(255,255,255,.55), 0 10px 28px rgba(40,35,25,.08)",
        }}
      >
        {letter}
      </span>
    );

    if (ichrome) {
      return (
        <div className={immersiveShell}>
          <div className="pointer-events-none absolute right-2 top-2 z-10 sm:right-3 sm:top-3" aria-hidden>
            <span className="inline-flex items-baseline gap-px rounded-full border border-[color:var(--border)] bg-[var(--surface)] px-1.5 py-0.5 pl-2 shadow-[var(--shadow-xs)]">
              <span className="text-[10px] font-semibold tabular-nums text-[var(--ink-secondary)]">{ichrome.current}</span>
              <span className="text-[9px] font-medium text-[var(--ink-tertiary)]">/</span>
              <span className="text-[10px] font-semibold tabular-nums text-[var(--ink-secondary)]">{ichrome.total}</span>
            </span>
          </div>

          <div
            className="relative flex min-h-0 flex-1 touch-manipulation items-center justify-center px-1 sm:px-3"
            onPointerDown={onImmersivePointerDown}
            onPointerUp={onImmersivePointerUp}
            onPointerCancel={onImmersivePointerCancel}
            onPointerLeave={(e) => { if (e.buttons === 0) swipeStart.current = null; }}
          >
            <button
              type="button"
              onClick={onImmersiveHeroClick}
              className="flex min-h-0 w-full flex-1 flex-col items-center justify-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--border-solid)]"
            >
              {letterHero}
            </button>
          </div>

          <div
            className="relative z-10 flex shrink-0 items-end justify-between gap-2 border-t border-[color:var(--border)] bg-transparent px-2.5 pt-2.5 sm:px-3 sm:pt-3"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
          >
            <button
              type="button"
              aria-label="Previous card"
              onClick={(e) => { e.stopPropagation(); ichrome.onPrev(); }}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] text-[var(--ink-secondary)] shadow-[var(--shadow-xs)] transition-transform active:scale-95"
            >
              <IconBack size={20} />
            </button>
            <div className="min-w-0 flex-1 px-1 text-center">
              <p className="mx-auto max-w-[min(100%,18rem)] text-[clamp(0.9rem,3.4vmin,1.2rem)] font-semibold leading-snug tracking-[0.03em] text-[var(--ink-secondary)]">
                {wordLabel}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-[var(--ink-tertiary)]">Tap letter · swipe for more</p>
            </div>
            <Link
              href={ichrome.quizHref}
              className="flex h-11 min-w-[3.25rem] flex-shrink-0 items-center justify-center rounded-2xl border border-white/50 px-3 text-[12px] font-bold tracking-tight text-white shadow-md transition-transform active:scale-95"
              style={{ background: categoryColor, boxShadow: `0 6px 16px ${categoryColor}35` }}
            >
              Quiz
            </Link>
          </div>
        </div>
      );
    }

    return (
      <Wrapper {...wrapperProps} className={immersiveShell}>
        <div className="relative flex min-h-0 flex-1 items-center justify-center px-1 sm:px-3">
          {letterHero}
        </div>

        <div className="relative shrink-0 px-4 pb-5 pt-2 sm:pb-6">
          <p className="mx-auto max-w-[min(100%,24rem)] text-center text-[clamp(1rem,4vmin,1.35rem)] font-semibold leading-snug tracking-[0.04em] text-[var(--ink-secondary)]">
            {wordLabel}
          </p>
          <p className={`${CAPTION} mt-1 pb-0 text-[var(--ink-tertiary)]`}>Tap to hear</p>
        </div>
      </Wrapper>
    );
  }

  /* ── Color mode (Colors) — full-bleed swatch; lesson chrome uses --bg shell + inset swatch ── */
  if (imageMode === "color") {
    const hex = COLOR_MAP[word] ?? categoryColor;
    const dark = relativeLuminanceFromHex(hex) < 0.5;
    const sz = colorHeroSize(word);
    const colorSwatch = (
      <div
        className="flex min-h-[min(52vh,400px)] w-full max-w-[min(92%,420px)] items-center justify-center rounded-2xl shadow-[var(--shadow-sm)] ring-1 ring-black/10"
        style={{ background: hex, boxShadow: `0 12px 40px ${hex}40` }}
      >
        <p className={`max-w-full px-4 text-center font-black leading-[0.9] ${sz}`} style={{ color: dark ? "#ffffff" : "#1a1a2e", textShadow: dark ? "0 2px 10px rgba(0,0,0,0.2)" : "none" }}>
          {word}
        </p>
      </div>
    );

    if (ichrome) {
      return (
        <div className={immersiveShell}>
          <div className="pointer-events-none absolute right-2 top-2 z-10 sm:right-3 sm:top-3" aria-hidden>
            <span className="inline-flex items-baseline gap-px rounded-full border border-[color:var(--border)] bg-[var(--surface)] px-1.5 py-0.5 pl-2 shadow-[var(--shadow-xs)]">
              <span className="text-[10px] font-semibold tabular-nums text-[var(--ink-secondary)]">{ichrome.current}</span>
              <span className="text-[9px] font-medium text-[var(--ink-tertiary)]">/</span>
              <span className="text-[10px] font-semibold tabular-nums text-[var(--ink-secondary)]">{ichrome.total}</span>
            </span>
          </div>

          <div
            className="relative flex min-h-0 flex-1 touch-manipulation items-center justify-center px-2 py-2 sm:px-4"
            onPointerDown={onImmersivePointerDown}
            onPointerUp={onImmersivePointerUp}
            onPointerCancel={onImmersivePointerCancel}
            onPointerLeave={(e) => { if (e.buttons === 0) swipeStart.current = null; }}
          >
            <button
              type="button"
              onClick={onImmersiveHeroClick}
              aria-label={`Hear ${word}`}
              className="flex min-h-0 w-full flex-1 flex-col items-center justify-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--border-solid)]"
            >
              {colorSwatch}
            </button>
          </div>

          <div
            className="relative z-10 flex shrink-0 items-end justify-between gap-2 border-t border-[color:var(--border)] bg-transparent px-2.5 pt-2.5 sm:px-3 sm:pt-3"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
          >
            <button
              type="button"
              aria-label="Previous card"
              onClick={(e) => { e.stopPropagation(); ichrome.onPrev(); }}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] text-[var(--ink-secondary)] shadow-[var(--shadow-xs)] transition-transform active:scale-95"
            >
              <IconBack size={20} />
            </button>
            <div className="min-w-0 flex-1 px-1 text-center">
              <p className="mx-auto max-w-[min(100%,18rem)] text-[clamp(1rem,3.8vmin,1.35rem)] font-bold leading-snug tracking-[-0.02em] text-[var(--ink)]">
                {word}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-[var(--ink-tertiary)]">Tap color · swipe for more</p>
            </div>
            <Link
              href={ichrome.quizHref}
              className="flex h-11 min-w-[3.25rem] flex-shrink-0 items-center justify-center rounded-2xl border border-white/50 px-3 text-[12px] font-bold tracking-tight text-white shadow-md transition-transform active:scale-95"
              style={{ background: categoryColor, boxShadow: `0 6px 16px ${categoryColor}35` }}
            >
              Quiz
            </Link>
          </div>
        </div>
      );
    }

    return (
      <Wrapper {...wrapperProps} className={`relative flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden rounded-3xl ${className}`}
        style={{ background: hex, boxShadow: `0 12px 40px ${hex}50` }}
      >
        <p className={`max-w-full px-4 text-center font-black leading-[0.9] ${sz}`} style={{ color: dark ? "#ffffff" : "#1a1a2e", textShadow: dark ? "0 2px 10px rgba(0,0,0,0.2)" : "none" }}>
          {word}
        </p>
      </Wrapper>
    );
  }

  /* ── Shape mode (Shapes) — SVG pops on app bg; lesson chrome matches Numbers flow ── */
  if (imageMode === "shape") {
    const sh = SHAPES[word] ?? SHAPES["Circle"];
    const size = 220;
    const shapeSvg = (
      <svg viewBox={`0 0 ${size} ${size}`} className="fade-in aspect-square h-auto w-[min(76vmin,400px)] max-w-full shrink-0 drop-shadow-[0_12px_28px_rgba(15,23,42,.12)]">
        {sh.svg(size)}
      </svg>
    );

    if (ichrome) {
      return (
        <div className={immersiveShell}>
          <div className="pointer-events-none absolute right-2 top-2 z-10 sm:right-3 sm:top-3" aria-hidden>
            <span className="inline-flex items-baseline gap-px rounded-full border border-[color:var(--border)] bg-[var(--surface)] px-1.5 py-0.5 pl-2 shadow-[var(--shadow-xs)]">
              <span className="text-[10px] font-semibold tabular-nums text-[var(--ink-secondary)]">{ichrome.current}</span>
              <span className="text-[9px] font-medium text-[var(--ink-tertiary)]">/</span>
              <span className="text-[10px] font-semibold tabular-nums text-[var(--ink-secondary)]">{ichrome.total}</span>
            </span>
          </div>

          <div
            className="relative flex min-h-0 flex-1 touch-manipulation items-center justify-center px-2 sm:px-4"
            onPointerDown={onImmersivePointerDown}
            onPointerUp={onImmersivePointerUp}
            onPointerCancel={onImmersivePointerCancel}
            onPointerLeave={(e) => { if (e.buttons === 0) swipeStart.current = null; }}
          >
            <button
              type="button"
              onClick={onImmersiveHeroClick}
              aria-label={`Hear ${word}`}
              className="flex min-h-0 w-full flex-1 flex-col items-center justify-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--border-solid)]"
            >
              {shapeSvg}
            </button>
          </div>

          <div
            className="relative z-10 flex shrink-0 items-end justify-between gap-2 border-t border-[color:var(--border)] bg-transparent px-2.5 pt-2.5 sm:px-3 sm:pt-3"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
          >
            <button
              type="button"
              aria-label="Previous card"
              onClick={(e) => { e.stopPropagation(); ichrome.onPrev(); }}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] text-[var(--ink-secondary)] shadow-[var(--shadow-xs)] transition-transform active:scale-95"
            >
              <IconBack size={20} />
            </button>
            <div className="min-w-0 flex-1 px-1 text-center">
              <p className="mx-auto max-w-[min(100%,18rem)] text-[clamp(1rem,3.8vmin,1.35rem)] font-bold leading-snug tracking-[-0.02em] text-[var(--ink)]">
                {word}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-[var(--ink-tertiary)]">Tap shape · swipe for more</p>
            </div>
            <Link
              href={ichrome.quizHref}
              className="flex h-11 min-w-[3.25rem] flex-shrink-0 items-center justify-center rounded-2xl border border-white/50 px-3 text-[12px] font-bold tracking-tight text-white shadow-md transition-transform active:scale-95"
              style={{ background: categoryColor, boxShadow: `0 6px 16px ${categoryColor}35` }}
            >
              Quiz
            </Link>
          </div>
        </div>
      );
    }

    return (
      <Wrapper {...wrapperProps} className={immersiveShell}>
        <div className="flex min-h-0 w-full flex-1 items-center justify-center px-2">
          {shapeSvg}
        </div>
        <p className={CAPTION} style={{ color: "var(--ink-secondary)" }}>{word}</p>
      </Wrapper>
    );
  }

  /* ── Photo / Vector + lesson chrome: flat --bg card (Vecteezy/Pixabay when configured) ── */
  if ((imageMode === "vector" || imageMode === "photo") && ichrome) {
    if (loading) {
      return (
        <div className={`flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden ${immersiveShell}`}>
          <div className="spinner" />
          <p className="mt-3 text-[13px] font-semibold text-[var(--ink-tertiary)]">Loading...</p>
        </div>
      );
    }

    if (!imageUrl) {
      return (
        <div className={immersiveShell}>
          <div className="pointer-events-none absolute right-2 top-2 z-10 sm:right-3 sm:top-3" aria-hidden>
            <span className="inline-flex items-baseline gap-px rounded-full border border-[color:var(--border)] bg-[var(--surface)] px-1.5 py-0.5 pl-2 shadow-[var(--shadow-xs)]">
              <span className="text-[10px] font-semibold tabular-nums text-[var(--ink-secondary)]">{ichrome.current}</span>
              <span className="text-[9px] font-medium text-[var(--ink-tertiary)]">/</span>
              <span className="text-[10px] font-semibold tabular-nums text-[var(--ink-secondary)]">{ichrome.total}</span>
            </span>
          </div>

          <div
            className="relative flex min-h-0 flex-1 touch-manipulation items-center justify-center px-2 sm:px-4"
            onPointerDown={onImmersivePointerDown}
            onPointerUp={onImmersivePointerUp}
            onPointerCancel={onImmersivePointerCancel}
            onPointerLeave={(e) => { if (e.buttons === 0) swipeStart.current = null; }}
          >
            <button
              type="button"
              onClick={onImmersiveHeroClick}
              aria-label={`Hear ${word}`}
              className="flex min-h-0 w-full max-w-[min(92%,400px)] flex-1 flex-col items-center justify-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--border-solid)]"
            >
              <FallbackCard word={word} categoryColor={categoryColor} categoryId={categoryId} onClick={undefined} className="min-h-[min(52vh,320px)] w-full border-0 shadow-none ring-0" />
            </button>
          </div>

          <div
            className="relative z-10 flex shrink-0 items-end justify-between gap-2 border-t border-[color:var(--border)] bg-transparent px-2.5 pt-2.5 sm:px-3 sm:pt-3"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
          >
            <button
              type="button"
              aria-label="Previous card"
              onClick={(e) => { e.stopPropagation(); ichrome.onPrev(); }}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] text-[var(--ink-secondary)] shadow-[var(--shadow-xs)] transition-transform active:scale-95"
            >
              <IconBack size={20} />
            </button>
            <div className="min-w-0 flex-1 px-1 text-center">
              <p className="mx-auto max-w-[min(100%,18rem)] text-[clamp(1rem,3.8vmin,1.35rem)] font-bold leading-snug tracking-[-0.02em] text-[var(--ink)]">
                {word}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-[var(--ink-tertiary)]">{mediaLessonTapHint(categoryId)}</p>
            </div>
            <Link
              href={ichrome.quizHref}
              className="flex h-11 min-w-[3.25rem] flex-shrink-0 items-center justify-center rounded-2xl border border-white/50 px-3 text-[12px] font-bold tracking-tight text-white shadow-md transition-transform active:scale-95"
              style={{ background: categoryColor, boxShadow: `0 6px 16px ${categoryColor}35` }}
            >
              Quiz
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className={immersiveShell}>
        <div className="pointer-events-none absolute right-2 top-2 z-10 sm:right-3 sm:top-3" aria-hidden>
          <span className="inline-flex items-baseline gap-px rounded-full border border-[color:var(--border)] bg-[var(--surface)] px-1.5 py-0.5 pl-2 shadow-[var(--shadow-xs)]">
            <span className="text-[10px] font-semibold tabular-nums text-[var(--ink-secondary)]">{ichrome.current}</span>
            <span className="text-[9px] font-medium text-[var(--ink-tertiary)]">/</span>
            <span className="text-[10px] font-semibold tabular-nums text-[var(--ink-secondary)]">{ichrome.total}</span>
          </span>
        </div>

        <div
          className="relative flex min-h-0 flex-1 touch-manipulation items-center justify-center px-2 py-2 sm:px-4"
          onPointerDown={onImmersivePointerDown}
          onPointerUp={onImmersivePointerUp}
          onPointerCancel={onImmersivePointerCancel}
          onPointerLeave={(e) => { if (e.buttons === 0) swipeStart.current = null; }}
        >
          <button
            type="button"
            onClick={onImmersiveHeroClick}
            aria-label={`Hear ${word}`}
            className="flex min-h-0 w-full flex-1 flex-col items-center justify-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--border-solid)]"
          >
            <div className="relative h-[min(58vh,440px)] w-full max-w-[min(92%,420px)] shrink-0 overflow-hidden rounded-2xl bg-[var(--surface)] shadow-[var(--shadow-xs)] ring-1 ring-[color:var(--border)]">
              {/* Must stay `absolute` only — a trailing `relative` breaks inset stretching and collapses height for next/image fill. */}
              <div className="absolute inset-3 sm:inset-4">
                <Image
                  src={imageUrl}
                  alt={word}
                  fill
                  className="object-contain fade-in"
                  sizes="(max-width: 768px) 92vw, 420px"
                  priority
                />
              </div>
            </div>
          </button>
        </div>

        <div
          className="relative z-10 flex shrink-0 items-end justify-between gap-2 border-t border-[color:var(--border)] bg-transparent px-2.5 pt-2.5 sm:px-3 sm:pt-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
        >
          <button
            type="button"
            aria-label="Previous card"
            onClick={(e) => { e.stopPropagation(); ichrome.onPrev(); }}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] text-[var(--ink-secondary)] shadow-[var(--shadow-xs)] transition-transform active:scale-95"
          >
            <IconBack size={20} />
          </button>
          <div className="min-w-0 flex-1 px-1 text-center">
            <p className="mx-auto max-w-[min(100%,18rem)] text-[clamp(1rem,3.8vmin,1.35rem)] font-bold leading-snug tracking-[-0.02em] text-[var(--ink)]">
              {word}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-[var(--ink-tertiary)]">{mediaLessonTapHint(categoryId)}</p>
          </div>
          <Link
            href={ichrome.quizHref}
            className="flex h-11 min-w-[3.25rem] flex-shrink-0 items-center justify-center rounded-2xl border border-white/50 px-3 text-[12px] font-bold tracking-tight text-white shadow-md transition-transform active:scale-95"
            style={{ background: categoryColor, boxShadow: `0 6px 16px ${categoryColor}35` }}
          >
            Quiz
          </Link>
        </div>
      </div>
    );
  }

  /* ── Static local art (SVG or Actions PNG in /public/images/{category}/) ── */
  if (imageMode === "static") {
    const key = (assetKey ?? word.toLowerCase()).replace(/\s+/g, "-");
    const localArt = getLocalIllustration(categoryId, key);
    const ext = categoryId === "actions" || categoryId === "emotions" ? "png" : "svg";
    const isCuratedPng = categoryId === "actions" || categoryId === "emotions";
    const src =
      `/images/${categoryId}/${key}.${ext}`
      + (isCuratedPng ? `?v=${encodeURIComponent(CURATED_STATIC_BITMAP_VER)}` : "");
    const cardBackground = localArt?.background ?? `linear-gradient(180deg, ${categoryColor}1a 0%, #ffffff 100%)`;
    const cardShadow = localArt?.shadow ?? `0 18px 40px ${categoryColor}18`;
    const frameBackground = localArt?.frame ?? "rgba(255,255,255,0.78)";
    /* Curated PNGs: portrait 9:16 box with explicit h/w (next/image fill + w-auto in flex caused half-black). Native img + object-contain centers subject; --bg fills any gutter. */
    const staticArtInner = (
      <>
        <div className="pointer-events-none absolute inset-x-6 top-5 h-20 rounded-full blur-3xl" style={{ background: `${categoryColor}16` }} />
        <div className={`relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden ${isCuratedPng ? "px-2 py-2" : "px-2 py-2"}`}>
          {isCuratedPng && !localArt ? (
            <div
              className="relative mx-auto shrink-0 overflow-hidden rounded-2xl bg-[var(--bg)]"
              style={{
                height: "min(88vh, 900px)",
                width: "min(520px, 92vw, calc(min(88vh, 900px) * 9 / 16))",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- avoid next/image fill sizing bugs with large static PNGs in flex */}
              <img
                src={src}
                alt={word}
                decoding="async"
                fetchPriority="high"
                className="block h-full w-full object-contain object-center fade-in"
              />
            </div>
          ) : (
            <div
              className="relative h-[min(78%,64vmin)] w-[min(96%,72vmin)] max-h-[480px] max-w-[480px] overflow-hidden rounded-[2rem] border border-[color:var(--border)] p-2 shadow-[var(--shadow-xs)] sm:p-3"
              style={{ background: frameBackground }}
            >
              {localArt ? <div className="h-full w-full">{localArt.art}</div> : (
                <Image src={src} alt={word} fill className="object-contain p-2 sm:p-3" sizes="(max-width: 768px) 88vw, 520px" priority />
              )}
            </div>
          )}
        </div>
      </>
    );

    if (ichrome) {
      return (
        <div className={immersiveShell}>
          <div className="pointer-events-none absolute right-2 top-2 z-10 sm:right-3 sm:top-3" aria-hidden>
            <span className="inline-flex items-baseline gap-px rounded-full border border-[color:var(--border)] bg-[var(--surface)] px-1.5 py-0.5 pl-2 shadow-[var(--shadow-xs)]">
              <span className="text-[10px] font-semibold tabular-nums text-[var(--ink-secondary)]">{ichrome.current}</span>
              <span className="text-[9px] font-medium text-[var(--ink-tertiary)]">/</span>
              <span className="text-[10px] font-semibold tabular-nums text-[var(--ink-secondary)]">{ichrome.total}</span>
            </span>
          </div>

          <div
            className="relative flex min-h-0 flex-1 touch-manipulation flex-col items-center justify-center"
            onPointerDown={onImmersivePointerDown}
            onPointerUp={onImmersivePointerUp}
            onPointerCancel={onImmersivePointerCancel}
            onPointerLeave={(e) => { if (e.buttons === 0) swipeStart.current = null; }}
          >
            <button
              type="button"
              onClick={onImmersiveHeroClick}
              aria-label={`Hear ${word}`}
              className="relative flex min-h-0 w-full flex-1 flex-col items-center justify-center rounded-2xl px-2 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--border-solid)]"
            >
              {staticArtInner}
            </button>
          </div>

          <div
            className="relative z-10 flex shrink-0 items-end justify-between gap-2 border-t border-[color:var(--border)] bg-transparent px-2.5 pt-2.5 sm:px-3 sm:pt-3"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
          >
            <button
              type="button"
              aria-label="Previous card"
              onClick={(e) => { e.stopPropagation(); ichrome.onPrev(); }}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] text-[var(--ink-secondary)] shadow-[var(--shadow-xs)] transition-transform active:scale-95"
            >
              <IconBack size={20} />
            </button>
            <div className="min-w-0 flex-1 px-1 text-center">
              <p className="mx-auto max-w-[min(100%,18rem)] text-[clamp(1rem,3.8vmin,1.35rem)] font-bold leading-snug tracking-[-0.02em] text-[var(--ink)]">
                {word}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-[var(--ink-tertiary)]">{mediaLessonTapHint(categoryId)}</p>
            </div>
            <Link
              href={ichrome.quizHref}
              className="flex h-11 min-w-[3.25rem] flex-shrink-0 items-center justify-center rounded-2xl border border-white/50 px-3 text-[12px] font-bold tracking-tight text-white shadow-md transition-transform active:scale-95"
              style={{ background: categoryColor, boxShadow: `0 6px 16px ${categoryColor}35` }}
            >
              Quiz
            </Link>
          </div>
        </div>
      );
    }

    return (
      <Wrapper {...wrapperProps} className={`relative flex h-full min-h-0 w-full flex-col items-center overflow-hidden rounded-3xl transition-all active:scale-[.97] ${className}`}
        style={{ background: cardBackground, boxShadow: cardShadow }}
      >
        {staticArtInner}
        <p className={CAPTION} style={{ color: `${categoryColor}cc` }}>{word}</p>
      </Wrapper>
    );
  }

  /* ── Concept card ── */
  if (imageMode === "card") {
    const sz = colorHeroSize(word);
    const cardHero = (
      <div
        className="flex min-h-[min(48vh,380px)] w-full max-w-[min(92%,420px)] flex-col items-center justify-center overflow-hidden rounded-2xl px-3 ring-1 ring-[color:var(--border)]"
        style={{ background: `linear-gradient(160deg, ${categoryColor}18, ${categoryColor}0d)`, boxShadow: `0 8px 32px ${categoryColor}12` }}
      >
        <p className={`max-w-full text-balance text-center font-black leading-[0.88] ${sz}`} style={{ color: categoryColor, textShadow: `0 4px 24px ${categoryColor}25` }}>{word}</p>
      </div>
    );

    if (ichrome) {
      return (
        <div className={immersiveShell}>
          <div className="pointer-events-none absolute right-2 top-2 z-10 sm:right-3 sm:top-3" aria-hidden>
            <span className="inline-flex items-baseline gap-px rounded-full border border-[color:var(--border)] bg-[var(--surface)] px-1.5 py-0.5 pl-2 shadow-[var(--shadow-xs)]">
              <span className="text-[10px] font-semibold tabular-nums text-[var(--ink-secondary)]">{ichrome.current}</span>
              <span className="text-[9px] font-medium text-[var(--ink-tertiary)]">/</span>
              <span className="text-[10px] font-semibold tabular-nums text-[var(--ink-secondary)]">{ichrome.total}</span>
            </span>
          </div>

          <div
            className="relative flex min-h-0 flex-1 touch-manipulation items-center justify-center px-2 py-2 sm:px-4"
            onPointerDown={onImmersivePointerDown}
            onPointerUp={onImmersivePointerUp}
            onPointerCancel={onImmersivePointerCancel}
            onPointerLeave={(e) => { if (e.buttons === 0) swipeStart.current = null; }}
          >
            <button
              type="button"
              onClick={onImmersiveHeroClick}
              aria-label={`Hear ${word}`}
              className="flex min-h-0 w-full flex-1 flex-col items-center justify-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--border-solid)]"
            >
              {cardHero}
            </button>
          </div>

          <div
            className="relative z-10 flex shrink-0 items-end justify-between gap-2 border-t border-[color:var(--border)] bg-transparent px-2.5 pt-2.5 sm:px-3 sm:pt-3"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
          >
            <button
              type="button"
              aria-label="Previous card"
              onClick={(e) => { e.stopPropagation(); ichrome.onPrev(); }}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] text-[var(--ink-secondary)] shadow-[var(--shadow-xs)] transition-transform active:scale-95"
            >
              <IconBack size={20} />
            </button>
            <div className="min-w-0 flex-1 px-1 text-center">
              <p className="mx-auto max-w-[min(100%,18rem)] text-[clamp(1rem,3.8vmin,1.35rem)] font-bold leading-snug tracking-[-0.02em] text-[var(--ink)]">
                {word}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-[var(--ink-tertiary)]">Tap word · swipe for more</p>
            </div>
            <Link
              href={ichrome.quizHref}
              className="flex h-11 min-w-[3.25rem] flex-shrink-0 items-center justify-center rounded-2xl border border-white/50 px-3 text-[12px] font-bold tracking-tight text-white shadow-md transition-transform active:scale-95"
              style={{ background: categoryColor, boxShadow: `0 6px 16px ${categoryColor}35` }}
            >
              Quiz
            </Link>
          </div>
        </div>
      );
    }

    return (
      <Wrapper {...wrapperProps} className={`relative flex h-full min-h-0 w-full flex-col items-center overflow-hidden rounded-3xl transition-all active:scale-[.97] ${className}`}
        style={{ background: `linear-gradient(160deg, ${categoryColor}18, ${categoryColor}0d)`, boxShadow: `0 8px 32px ${categoryColor}12` }}
      >
        <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden px-3">
          <p className={`max-w-full text-balance text-center font-black leading-[0.88] ${sz}`} style={{ color: categoryColor, textShadow: `0 4px 24px ${categoryColor}25` }}>{word}</p>
        </div>
        <p className={CAPTION} style={{ color: `${categoryColor}99` }}>Tap to hear</p>
      </Wrapper>
    );
  }

  /* ── Photo / Vector modes (lesson chrome handled above) ── */
  const isVertical = immersive;

  if (loading) {
    return (
      <div className={`flex h-full min-h-0 w-full flex-col items-center overflow-hidden rounded-3xl ${className}`}
        style={{ background: `linear-gradient(160deg, ${categoryColor}12, ${categoryColor}08)`, boxShadow: `0 8px 32px ${categoryColor}10` }}
      >
        <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-3">
          <div className="spinner" />
          <p className="text-[13px] font-semibold text-[var(--ink-tertiary)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return <FallbackCard word={word} categoryColor={categoryColor} categoryId={categoryId} onClick={onClick} className={className} />;
  }

  /* ── Vertical Immersive Mode (e.g. Emotions when immersive) ── */
  if (isVertical) {
    return (
      <Wrapper {...wrapperProps} className={`relative flex h-full min-h-0 w-full flex-col items-center overflow-hidden rounded-3xl transition-all active:scale-[.98] ${className}`}
        style={{ background: `linear-gradient(180deg, ${categoryColor}08 0%, ${categoryColor}15 100%)`, boxShadow: `0 12px 40px ${categoryColor}20` }}
      >
        <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden p-3">
          {/* Vertical portrait container - taller than wide */}
          <div className="relative h-full w-auto aspect-[3/4] max-h-full max-w-[min(85%,380px)] overflow-hidden rounded-2xl shadow-2xl">
            <Image 
              src={imageUrl} 
              alt={word} 
              fill 
              className="object-cover fade-in" 
              sizes="(max-width: 768px) 85vw, 380px" 
              priority 
              style={{ objectPosition: 'center 30%' }}
            />
            {/* Gradient overlay for depth */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>
        </div>
        {/* Word label - floating style */}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-center text-[22px] font-black tracking-tight text-white drop-shadow-lg" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            {word}
          </p>
        </div>
      </Wrapper>
    );
  }

  /* ── Standard Photo/Vector Mode ── */
  return (
    <Wrapper {...wrapperProps} className={`relative flex h-full min-h-0 w-full flex-col items-center overflow-hidden rounded-3xl transition-all active:scale-[.97] ${className}`}
      style={{ background: `linear-gradient(160deg, ${categoryColor}12, ${categoryColor}08)`, boxShadow: `0 8px 32px ${categoryColor}10` }}
    >
      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden px-1 sm:px-2">
        <div className="relative h-[min(88%,70vmin)] w-[min(98%,70vmin)] max-h-[520px] max-w-[520px]">
          <Image src={imageUrl} alt={word} fill className="object-contain fade-in" sizes="(max-width: 768px) 100vw, 700px" priority />
        </div>
      </div>
      <p className={CAPTION} style={{ color: `${categoryColor}cc` }}>{word}</p>
    </Wrapper>
  );
}

/* ── Helper Components ── */

function Wrapper({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) {
  return <div {...props}>{children}</div>;
}

function FallbackCard({ word, categoryColor, categoryId, onClick, className }: { word: string; categoryColor: string; categoryId: string; onClick?: () => void; className?: string }) {
  const CatIcon = CATEGORY_ICONS[categoryId];
  return (
    <div onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}
      className={`flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden rounded-3xl ${className}`}
      style={{ background: `linear-gradient(160deg, ${categoryColor}15, ${categoryColor}08)`, boxShadow: `0 8px 32px ${categoryColor}10` }}
    >
      <div className="flex flex-col items-center gap-3 px-4">
        {CatIcon && (
          <span className="inline-flex" style={{ color: categoryColor, opacity: 0.8 }}>
            <CatIcon size={48} />
          </span>
        )}
        <p className="text-[18px] font-bold text-[var(--ink)]">{word}</p>
      </div>
    </div>
  );
}

/* ── Utility Functions ── */

const ONES = ["Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine", "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
const TENS = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

function numberToWord(n: number): string {
  if (isNaN(n) || n < 0) return "";
  if (n < 20) return ONES[n];
  if (n === 100) return "One Hundred";
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o === 0 ? TENS[t] : `${TENS[t]}-${ONES[o]}`;
}

function digitHeroSize(len: number): string {
  if (len >= 3) return "text-[clamp(6.25rem,46vmin,16.5rem)]";
  if (len === 2) return "text-[clamp(7rem,56vmin,20rem)]";
  return "text-[clamp(7.75rem,66vmin,24rem)]";
}

function colorHeroSize(word: string): string {
  const n = word.length;
  if (n > 8) return "text-[clamp(1.65rem,7vmin,3.1rem)]";
  if (n > 6) return "text-[clamp(1.85rem,8vmin,3.6rem)]";
  if (n > 4) return "text-[clamp(2rem,9vmin,4.25rem)]";
  if (n > 2) return "text-[clamp(2.15rem,10vmin,5rem)]";
  if (n === 2) return "text-[clamp(2.35rem,11vmin,5.75rem)]";
  return "text-[clamp(2.5rem,12vmin,6.5rem)]";
}

function parseHexRgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "").trim();
  if (h.length === 3) {
    return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)];
  }
  if (h.length === 6) return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  return null;
}

function relativeLuminanceFromHex(hex: string): number {
  const rgb = parseHexRgb(hex);
  if (!rgb) return 0.5;
  const lin = rgb.map((c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/* ── Shape SVGs ── */
type ShapeEntry = { bg: [string, string]; fill: string; svg: (s: number) => React.ReactNode };

const SHAPES: Record<string, ShapeEntry> = {
  Circle:    { bg: ["#ef4444", "#dc2626"], fill: "#fca5a5", svg: (s) => <circle cx={s/2} cy={s/2} r={s*0.42} /> },
  Square:    { bg: ["#3b82f6", "#2563eb"], fill: "#93c5fd", svg: (s) => <rect x={s*0.1} y={s*0.1} width={s*0.8} height={s*0.8} rx={s*0.04} /> },
  Triangle:  { bg: ["#22c55e", "#16a34a"], fill: "#86efac", svg: (s) => <polygon points={`${s/2},${s*0.08} ${s*0.92},${s*0.92} ${s*0.08},${s*0.92}`} /> },
  Rectangle: { bg: ["#f97316", "#ea580c"], fill: "#fdba74", svg: (s) => <rect x={s*0.05} y={s*0.2} width={s*0.9} height={s*0.6} rx={s*0.04} /> },
  Star:      { bg: ["#eab308", "#ca8a04"], fill: "#fde047", svg: (s) => {
    const cx = s/2, cy = s/2, R = s*0.45, r = s*0.2;
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = (Math.PI / 2 * -1) + (Math.PI / 5) * i;
      const rad = i % 2 === 0 ? R : r;
      return `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
    }).join(" ");
    return <polygon points={pts} />;
  }},
  Heart:     { bg: ["#ec4899", "#db2777"], fill: "#f9a8d4", svg: (s) => <path d={`M${s/2},${s*0.85} C${s*0.15},${s*0.55} ${s*0.05},${s*0.25} ${s*0.25},${s*0.15} C${s*0.35},${s*0.1} ${s*0.45},${s*0.15} ${s/2},${s*0.3} C${s*0.55},${s*0.15} ${s*0.65},${s*0.1} ${s*0.75},${s*0.15} C${s*0.95},${s*0.25} ${s*0.85},${s*0.55} ${s/2},${s*0.85}Z`} /> },
  Diamond:   { bg: ["#8b5cf6", "#7c3aed"], fill: "#c4b5fd", svg: (s) => <polygon points={`${s/2},${s*0.05} ${s*0.92},${s/2} ${s/2},${s*0.95} ${s*0.08},${s/2}`} /> },
  Oval:      { bg: ["#14b8a6", "#0d9488"], fill: "#5eead4", svg: (s) => <ellipse cx={s/2} cy={s/2} rx={s*0.45} ry={s*0.32} /> },
  Arrow:     { bg: ["#64748b", "#475569"], fill: "#cbd5e1", svg: (s) => <polygon points={`${s*0.5},${s*0.08} ${s*0.92},${s*0.5} ${s*0.65},${s*0.5} ${s*0.65},${s*0.92} ${s*0.35},${s*0.92} ${s*0.35},${s*0.5} ${s*0.08},${s*0.5}`} /> },
  Crescent:  { bg: ["#6366f1", "#4f46e5"], fill: "#a5b4fc", svg: (s) => <path d={`M${s*0.6},${s*0.08} A${s*0.42},${s*0.42} 0 1,0 ${s*0.6},${s*0.92} A${s*0.32},${s*0.42} 0 1,1 ${s*0.6},${s*0.08}Z`} /> },
  Hexagon:   { bg: ["#0ea5e9", "#0284c7"], fill: "#7dd3fc", svg: (s) => {
    const cx = s/2, cy = s/2, r = s*0.44;
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    return <polygon points={pts} />;
  }},
  Sphere:    { bg: ["#a855f7", "#9333ea"], fill: "#d8b4fe", svg: (s) => <><circle cx={s/2} cy={s/2} r={s*0.42} /><ellipse cx={s/2} cy={s/2} rx={s*0.42} ry={s*0.15} fill="white" opacity="0.25" /></> },
  Cube:      { bg: ["#ec4899", "#db2777"], fill: "#f9a8d4", svg: (s) => <><rect x={s*0.25} y={s*0.25} width={s*0.5} height={s*0.5} rx={s*0.02} /><rect x={s*0.15} y={s*0.15} width={s*0.5} height={s*0.5} rx={s*0.02} fillOpacity="0.7" /></> },
  Cylinder:  { bg: ["#f59e0b", "#d97706"], fill: "#fde68a", svg: (s) => <><ellipse cx={s/2} cy={s*0.25} rx={s*0.3} ry={s*0.12} /><rect x={s*0.2} y={s*0.25} width={s*0.6} height={s*0.5} /><ellipse cx={s/2} cy={s*0.75} rx={s*0.3} ry={s*0.12} /></> },
  Cone:      { bg: ["#10b981", "#059669"], fill: "#a7f3d0", svg: (s) => <><polygon points={`${s/2},${s*0.1} ${s*0.15},${s*0.85} ${s*0.85},${s*0.85}`} /><ellipse cx={s/2} cy={s*0.85} rx={s*0.35} ry={s*0.1} /></> },
  Spiral:    { bg: ["#8b5cf6", "#7c3aed"], fill: "none", svg: (s) => <path d={`M${s/2},${s/2} m0,${-s*0.35} a${s*0.35},${s*0.35} 0 1,1 0,${s*0.7} a${s*0.25},${s*0.25} 0 1,0 0,${-s*0.5} a${s*0.15},${s*0.15} 0 1,1 0,${s*0.3}`} stroke="currentColor" strokeWidth={s*0.03} /> },
  Cross:     { bg: ["#ef4444", "#dc2626"], fill: "#fca5a5", svg: (s) => <><rect x={s*0.4} y={s*0.15} width={s*0.2} height={s*0.7} rx={s*0.02} /><rect x={s*0.15} y={s*0.4} width={s*0.7} height={s*0.2} rx={s*0.02} /></> },
  Pentagon:  { bg: ["#3b82f6", "#2563eb"], fill: "#93c5fd", svg: (s) => {
    const cx = s/2, cy = s/2, r = s*0.42;
    const pts = Array.from({ length: 5 }, (_, i) => {
      const a = (Math.PI * 2 * i / 5) - Math.PI / 2;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    return <polygon points={pts} />;
  }},
  Octagon:   { bg: ["#10b981", "#059669"], fill: "#a7f3d0", svg: (s) => {
    const cx = s/2, cy = s/2, r = s*0.42;
    const pts = Array.from({ length: 8 }, (_, i) => {
      const a = (Math.PI * 2 * i / 8) - Math.PI / 8;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    return <polygon points={pts} />;
  }},
  Pyramid:   { bg: ["#f59e0b", "#d97706"], fill: "#fde68a", svg: (s) => <><polygon points={`${s/2},${s*0.1} ${s*0.1},${s*0.8} ${s*0.9},${s*0.8}`} /><line x1={s/2} y1={s*0.1} x2={s/2} y2={s*0.8} stroke="rgba(0,0,0,0.1)" strokeWidth={s*0.02} /></> },
};

const COLOR_MAP: Record<string, string> = {
  Red: "#e74c3c", Blue: "#3498db", Green: "#2ecc71", Yellow: "#f1c40f",
  Orange: "#e67e22", Purple: "#9b59b6", Pink: "#e84393", White: "#ffffff",
  Black: "#1a1a2e", Brown: "#8B4513", Gold: "#daa520", Silver: "#C0C0C0",
  Gray: "#95a5a6", Cyan: "#00bcd4", Magenta: "#e91e63", Indigo: "#3f51b5",
  Turquoise: "#1abc9c", Maroon: "#800000", Navy: "#001f3f", Beige: "#f5f5dc",
};
