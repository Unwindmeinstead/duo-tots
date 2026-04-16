"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { resolveWordImage } from "@/lib/media";
import { CATEGORY_ICONS, IconBack } from "./icons";
import { getLocalIllustration } from "./local-illustrations";
import type { ImageMode } from "@/lib/vocab";

const CAPTION = "text-center text-[13px] font-semibold tracking-tight pb-3 pt-2";

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
  /** Numbers lesson: progress pill, swipe on hero, prev + quiz in footer */
  digitLessonChrome?: {
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
  digitLessonChrome,
}: WordVisualProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(imageMode === "photo" || imageMode === "vector" || imageMode === "action");
  const swipeStart = useRef<{ x: number; y: number; id: number } | null>(null);
  const swipeSuppressClick = useRef(false);

  useEffect(() => {
    if (imageMode !== "photo" && imageMode !== "vector" && imageMode !== "action") return;
    let mounted = true;
    setLoading(true);
    resolveWordImage(imageQuery, imageMode === "vector" ? "vector" : "photo").then((res) => {
      if (!mounted) return;
      setImageUrl(res.imageUrl);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [imageQuery, imageMode]);

  const wrapperProps = onClick ? { onClick, role: "button", tabIndex: 0 } as const : {};

  /* ── Digit mode (Numbers) — same flat fill as app page (--bg); numeral stays the focal point ── */
  if (imageMode === "digit") {
    const n = parseInt(word, 10);
    const sz = digitHeroSize(word.length);
    const wordLabel = isNaN(n) ? "" : numberToWord(n);
    const chrome = digitLessonChrome;
    const shell = `relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl bg-[var(--bg)] shadow-[var(--shadow-sm)] ring-1 ring-[color:var(--border)] ${className}`;

    const onSwipePointerDown = (e: React.PointerEvent) => {
      if (!chrome || e.button !== 0) return;
      swipeStart.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    };
    const onSwipePointerUp = (e: React.PointerEvent) => {
      if (!chrome || !swipeStart.current || e.pointerId !== swipeStart.current.id) return;
      const dx = e.clientX - swipeStart.current.x;
      const dy = e.clientY - swipeStart.current.y;
      swipeStart.current = null;
      const min = 56;
      if (Math.abs(dx) < min || Math.abs(dx) < Math.abs(dy) * 1.15) return;
      swipeSuppressClick.current = true;
      if (dx < 0) chrome.onNext();
      else chrome.onPrev();
    };
    const onSwipePointerCancel = () => {
      swipeStart.current = null;
    };
    const onHeroClick = () => {
      if (swipeSuppressClick.current) {
        swipeSuppressClick.current = false;
        return;
      }
      onClick?.();
    };

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

    if (chrome) {
      return (
        <div className={shell}>
          <div className="pointer-events-none absolute right-2 top-2 z-10 sm:right-3 sm:top-3" aria-hidden>
            <span className="inline-flex items-baseline gap-px rounded-full border border-[color:var(--border)] bg-[var(--surface)] px-1.5 py-0.5 pl-2 shadow-[var(--shadow-xs)]">
              <span className="text-[10px] font-semibold tabular-nums text-[var(--ink-secondary)]">{chrome.current}</span>
              <span className="text-[9px] font-medium text-[var(--ink-tertiary)]">/</span>
              <span className="text-[10px] font-semibold tabular-nums text-[var(--ink-secondary)]">{chrome.total}</span>
            </span>
          </div>

          <div
            className="relative flex min-h-0 flex-1 touch-manipulation items-center justify-center px-1 sm:px-3"
            onPointerDown={onSwipePointerDown}
            onPointerUp={onSwipePointerUp}
            onPointerCancel={onSwipePointerCancel}
            onPointerLeave={(e) => { if (e.buttons === 0) swipeStart.current = null; }}
          >
            <button
              type="button"
              onClick={onHeroClick}
              className="flex min-h-0 w-full flex-1 flex-col items-center justify-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
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
              aria-label="Previous number"
              onClick={(e) => { e.stopPropagation(); chrome.onPrev(); }}
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
              href={chrome.quizHref}
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
      <Wrapper {...wrapperProps} className={shell}>
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

  /* ── Color mode (Colors) ── */
  if (imageMode === "color") {
    const hex = COLOR_MAP[word] ?? categoryColor;
    const dark = relativeLuminanceFromHex(hex) < 0.5;
    const sz = colorHeroSize(word);
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

  /* ── Shape mode (Shapes) ── */
  if (imageMode === "shape") {
    const sh = SHAPES[word] ?? SHAPES["Circle"];
    const size = 220;
    return (
      <Wrapper {...wrapperProps} className={`relative flex h-full min-h-0 w-full flex-col items-center overflow-hidden rounded-3xl ${className}`}
        style={{ background: `linear-gradient(180deg, ${sh.bg[0]}25 0%, ${sh.bg[1]}15 100%)`, boxShadow: `0 8px 32px ${sh.bg[0]}30` }}
      >
        <div className="flex min-h-0 w-full flex-1 items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="fade-in">
            {sh.svg(size)}
          </svg>
        </div>
        <p className={CAPTION} style={{ color: `${sh.bg[0]}cc` }}>{word}</p>
      </Wrapper>
    );
  }

  /* ── Static local SVG ── */
  if (imageMode === "static") {
    const key = assetKey ?? word.toLowerCase();
    const localArt = getLocalIllustration(categoryId, key);
    const src = `/images/${categoryId}/${key}.svg`;
    const cardBackground = localArt?.background ?? `linear-gradient(180deg, ${categoryColor}1a 0%, #ffffff 100%)`;
    const cardShadow = localArt?.shadow ?? `0 18px 40px ${categoryColor}18`;
    const frameBackground = localArt?.frame ?? "rgba(255,255,255,0.78)";
    return (
      <Wrapper {...wrapperProps} className={`relative flex h-full min-h-0 w-full flex-col items-center overflow-hidden rounded-3xl transition-all active:scale-[.97] ${className}`}
        style={{ background: cardBackground, boxShadow: cardShadow }}
      >
        <div className="pointer-events-none absolute inset-x-6 top-5 h-20 rounded-full blur-3xl" style={{ background: `${categoryColor}16` }} />
        <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden px-2 py-2">
          <div className="relative h-[min(88%,72vmin)] w-[min(98%,72vmin)] max-h-[520px] max-w-[520px] overflow-hidden rounded-[2rem] border border-white/60 p-2 sm:p-3" style={{ background: frameBackground }}>
            {localArt ? <div className="h-full w-full">{localArt.art}</div> : <Image src={src} alt={word} fill className="object-contain p-2 sm:p-3" sizes="(max-width: 768px) 88vw, 520px" priority />}
          </div>
        </div>
        <p className={CAPTION} style={{ color: `${categoryColor}cc` }}>{word}</p>
      </Wrapper>
    );
  }

  /* ── Concept card ── */
  if (imageMode === "card") {
    const sz = colorHeroSize(word);
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

  /* ── Action / Photo / Vector modes ── */
  const isVertical = immersive || imageMode === "action";
  const isVector = imageMode === "vector";

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

  /* ── Vertical Immersive Mode (Actions) ── */
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
