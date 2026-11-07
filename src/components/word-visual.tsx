"use client";

/* ─── Word visual ───
   The picture itself, nothing else: lesson chrome (progress, word
   band, buttons) is owned by the lesson screen. This component fills
   its parent with one mode's artwork — photo (whole picture always
   visible over a blurred copy of itself), digit hero, letter hero,
   colour swatch, shape art, static art or a concept card — and
   answers a tap with a pop, a squash and a burst of sparkles. */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { resolveWordImage } from "@/lib/media";
import { getLocalImage } from "@/lib/local-images";
import { playPop } from "@/lib/audio";
import { Sparkles } from "@/components/kit";
import { CATEGORY_GLYPHS } from "@/components/glyphs";
import { deepen, tint } from "@/lib/theme";
import type { ImageMode } from "@/lib/vocab";

/** Cache-buster for the curated static PNGs (URL-keyed caches). */
const CURATED_STATIC_BITMAP_VER = "20260916-actions-full-bleed-v3";

export const COLOR_MAP: Record<string, string> = {
  Red: "#e74c3c", Blue: "#3498db", Green: "#2ecc71", Yellow: "#f1c40f",
  Orange: "#e67e22", Purple: "#9b59b6", Pink: "#e84393", White: "#ffffff",
  Black: "#1a1a2e", Brown: "#8B4513", Gold: "#daa520", Silver: "#C0C0C0",
  Gray: "#95a5a6", Cyan: "#00bcd4", Magenta: "#e91e63", Indigo: "#3f51b5",
  Turquoise: "#1abc9c", Maroon: "#800000", Navy: "#001f3f", Beige: "#f5f5dc",
};

const ONES = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

export function numberToWord(n: number): string {
  if (isNaN(n) || n < 0) return "";
  if (n < 20) return ONES[n];
  if (n === 100) return "One Hundred";
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o === 0 ? TENS[t] : `${TENS[t]}-${ONES[o]}`;
}

function parseHexRgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "").trim();
  if (h.length === 3) return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)];
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

/* ─── Shape art — twenty chunky shapes, one vivid hue each ─── */

const SHAPE_FILLS: Record<string, string> = {
  Circle: "#FF7A59", Square: "#2B7FFF", Triangle: "#34C759", Rectangle: "#FF9F2E",
  Star: "#FFC531", Heart: "#F0519B", Diamond: "#8B5CF6", Oval: "#17BEBB",
  Arrow: "#8496B8", Crescent: "#FFA826", Hexagon: "#5B6BE0", Sphere: "#38BDF8",
  Cube: "#FFA26B", Cylinder: "#3ED6A5", Cone: "#FF6FA5", Spiral: "#D64FD6",
  Cross: "#2FBF71", Pentagon: "#4FA3E0", Octagon: "#8163D6", Pyramid: "#C98A5E",
};

function ringPoints(n: number, r: number, offsetDeg: number, cx = 110, cy = 110): string {
  return Array.from({ length: n }, (_, i) => {
    const a = ((offsetDeg + (360 / n) * i) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

function starPoints(cx = 110, cy = 110, R = 96, r = 43): string {
  return Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (Math.PI / 5) * i;
    const rad = i % 2 === 0 ? R : r;
    return `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

export function ShapeArt({
  word,
  size = 220,
  color,
}: {
  word: string;
  size?: number;
  /** Uniform colour override (practice tiles); default: the shape's own hue. */
  color?: string;
}) {
  const fill = color ?? SHAPE_FILLS[word] ?? "#2B7FFF";
  const deep = deepen(fill);
  let art: React.ReactNode;
  switch (word) {
    case "Square":
      art = <rect x="28" y="28" width="164" height="164" rx="22" fill={fill} />;
      break;
    case "Triangle":
      art = <polygon points="110,20 200,192 20,192" fill={fill} stroke={fill} strokeWidth="14" strokeLinejoin="round" />;
      break;
    case "Rectangle":
      art = <rect x="16" y="60" width="188" height="100" rx="20" fill={fill} />;
      break;
    case "Star":
      art = <polygon points={starPoints()} fill={fill} stroke={fill} strokeWidth="10" strokeLinejoin="round" />;
      break;
    case "Heart":
      art = <path d="M110 192C42 132 18 80 50 46 72 23 100 32 110 66 120 32 148 23 170 46 202 80 178 132 110 192Z" fill={fill} />;
      break;
    case "Diamond":
      art = <polygon points="110,12 202,110 110,208 18,110" fill={fill} />;
      break;
    case "Oval":
      art = <ellipse cx="110" cy="110" rx="98" ry="68" fill={fill} />;
      break;
    case "Arrow":
      art = <polygon points="110,16 204,110 148,110 148,200 72,200 72,110 16,110" fill={fill} />;
      break;
    case "Crescent":
      art = (
        <path
          fillRule="evenodd"
          d="M152 16 A94 94 0 1 0 152 204 A76 94 0 1 1 152 16Z"
          fill={fill}
        />
      );
      break;
    case "Hexagon":
      art = <polygon points={ringPoints(6, 94, 0)} fill={fill} />;
      break;
    case "Sphere":
      art = (
        <>
          <circle cx="110" cy="110" r="92" fill={fill} />
          <ellipse cx="76" cy="70" rx="32" ry="18" fill="#FFFFFF" opacity="0.4" transform="rotate(-24 76 70)" />
        </>
      );
      break;
    case "Cube":
      art = (
        <>
          <polygon points="110,16 194,58 110,100 26,58" fill={fill} />
          <polygon points="110,16 194,58 110,100 26,58" fill="#FFFFFF" opacity="0.22" />
          <polygon points="26,58 110,100 110,196 26,154" fill={fill} />
          <polygon points="194,58 110,100 110,196 194,154" fill={fill} />
          <polygon points="194,58 110,100 110,196 194,154" fill="#000000" opacity="0.16" />
        </>
      );
      break;
    case "Cylinder":
      art = (
        <>
          <rect x="56" y="50" width="108" height="120" fill={fill} />
          <ellipse cx="110" cy="170" rx="54" ry="18" fill={deep} />
          <ellipse cx="110" cy="50" rx="54" ry="18" fill={fill} />
          <ellipse cx="110" cy="50" rx="54" ry="18" fill="#FFFFFF" opacity="0.25" />
        </>
      );
      break;
    case "Cone":
      art = (
        <>
          <polygon points="110,18 198,180 22,180" fill={fill} />
          <ellipse cx="110" cy="180" rx="88" ry="15" fill={deep} />
        </>
      );
      break;
    case "Spiral":
      art = (
        <path
          d="M110 110 m0 -10 a10 10 0 0 1 10 10 a20 20 0 0 1 -20 20 a32 32 0 0 1 -32 -32 a46 46 0 0 1 46 -46 a62 62 0 0 1 62 62 a80 80 0 0 1 -80 80"
          fill="none"
          stroke={fill}
          strokeWidth="14"
          strokeLinecap="round"
        />
      );
      break;
    case "Cross":
      art = (
        <path
          d="M88 22 h44 v66 h66 v44 h-66 v66 H88 v-66 H22 V88 h66 Z"
          fill={fill}
        />
      );
      break;
    case "Pentagon":
      art = <polygon points={ringPoints(5, 94, -90)} fill={fill} />;
      break;
    case "Octagon":
      art = <polygon points={ringPoints(8, 94, -22.5)} fill={fill} />;
      break;
    case "Pyramid":
      art = (
        <>
          <polygon points="110,22 202,194 18,194" fill={fill} />
          <polygon points="110,22 202,194 110,194" fill="#000000" opacity="0.14" />
        </>
      );
      break;
    default:
      art = <circle cx="110" cy="110" r="92" fill={fill} />;
  }
  return (
    <svg
      viewBox="0 0 220 220"
      width={size}
      height={size}
      aria-hidden
      className="drop-shadow-[0_14px_24px_rgba(14,42,99,0.18)]"
    >
      {art}
    </svg>
  );
}

/* ─── The visual itself ─── */

export interface WordVisualProps {
  word: string;
  imageQuery: string;
  assetKey?: string;
  imageMode: ImageMode;
  categoryColor: string;
  categoryId: string;
  /** Deck-step index — changing it restarts the tap reaction. */
  stepKey?: number;
  onTap?: () => void;
}

export function WordVisual({
  word,
  imageQuery,
  assetKey,
  imageMode,
  categoryColor,
  categoryId,
  stepKey,
  onTap,
}: WordVisualProps) {
  /* A QC-passed local photo wins over every other source. */
  const slug = (assetKey ?? word.toLowerCase()).replace(/\s+/g, "-");
  const localSrc = getLocalImage(categoryId, slug);
  const wantsRemote = !localSrc && (imageMode === "photo" || imageMode === "vector");
  const [imageUrl, setImageUrl] = useState(localSrc ?? "");
  const [loading, setLoading] = useState(wantsRemote);
  const [burstKey, setBurstKey] = useState(0);
  const [reacting, setReacting] = useState(false);
  const reactTimerRef = useRef<number | null>(null);

  /* Reset when the card's word/mode changes (adjust-state-in-render). */
  const cardKey = `${categoryId}:${word}:${imageMode}`;
  const [prevCardKey, setPrevCardKey] = useState(cardKey);
  if (prevCardKey !== cardKey) {
    setPrevCardKey(cardKey);
    setImageUrl(localSrc ?? "");
    setLoading(wantsRemote);
    setBurstKey(0);
    setReacting(false);
  }
  const [prevStepKey, setPrevStepKey] = useState(stepKey);
  if (prevStepKey !== stepKey) {
    setPrevStepKey(stepKey);
    setBurstKey(0);
    setReacting(false);
  }

  useEffect(
    () => () => {
      if (reactTimerRef.current !== null) window.clearTimeout(reactTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!wantsRemote) return;
    let mounted = true;
    const mediaMode = imageMode === "vector" ? "vector" : "photo";
    resolveWordImage(imageQuery, mediaMode).then((res) => {
      if (!mounted) return;
      setImageUrl(res.imageUrl);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [imageQuery, imageMode, wantsRemote]);

  const triggerReaction = () => {
    playPop();
    setBurstKey((k) => k + 1);
    if (reactTimerRef.current !== null) window.clearTimeout(reactTimerRef.current);
    setReacting(false);
    requestAnimationFrame(() => {
      setReacting(true);
      reactTimerRef.current = window.setTimeout(() => setReacting(false), 560);
    });
    onTap?.();
  };

  const frameCls = "relative h-full w-full overflow-hidden rounded-[30px]";

  /* ── Digit hero: the numeral on a saturated tile, dots to count ── */
  if (imageMode === "digit") {
    const n = parseInt(word, 10);
    const sz =
      word.length >= 3
        ? "text-[clamp(4.5rem,30vmin,11rem)]"
        : word.length === 2
          ? "text-[clamp(5.5rem,38vmin,14rem)]"
          : "text-[clamp(6rem,44vmin,16rem)]";
    const label = isNaN(n) ? "" : numberToWord(n);
    return (
      <button type="button" onClick={triggerReaction} aria-label={`Hear ${label || word}`} className={`${frameCls} block`} style={{ background: categoryColor, boxShadow: `inset 0 -10px 0 ${deepen(categoryColor)}` }}>
        <span className={`flex h-full flex-col items-center justify-center px-4 ${reacting ? "kt-squash" : ""}`}>
          <span key={burstKey} className={`flex flex-col items-center ${burstKey > 0 ? "kt-bounce" : ""}`}>
            <span className={`select-none font-black tabular-nums leading-none tracking-tighter text-white ${sz}`}>
              {word}
            </span>
            {label && (
              <span className="mt-3 text-[clamp(1.3rem,5vmin,1.8rem)] font-black text-white/85">
                {label}
              </span>
            )}
            {!isNaN(n) && n >= 1 && n <= 20 && (
              <span key={`dots-${stepKey ?? 0}`} className="mt-5 flex max-w-[min(78vw,24rem)] flex-wrap items-center justify-center gap-2" aria-hidden>
                {Array.from({ length: n }, (_, i) => (
                  <span
                    key={i}
                    className="kt-pop-in h-4 w-4 rounded-full bg-white"
                    style={{ animationDelay: `${i * 70}ms`, animationFillMode: "backwards" }}
                  />
                ))}
              </span>
            )}
          </span>
        </span>
        <Sparkles burstKey={burstKey} />
      </button>
    );
  }

  /* ── Letter hero ── */
  if (imageMode === "alphabet") {
    const letter = (word.trim().slice(0, 1) || word).toUpperCase();
    return (
      <button type="button" onClick={triggerReaction} aria-label={`Hear letter ${letter}`} className={`${frameCls} block`} style={{ background: categoryColor, boxShadow: `inset 0 -10px 0 ${deepen(categoryColor)}` }}>
        <span className={`flex h-full flex-col items-center justify-center ${reacting ? "kt-squash" : ""}`}>
          <span key={burstKey} className={burstKey > 0 ? "kt-bounce" : ""}>
            <span className="select-none text-[clamp(7rem,58vmin,20rem)] font-black uppercase leading-none tracking-tight text-white">
              {letter}
            </span>
          </span>
          <span className="mt-2 text-[clamp(1.3rem,5vmin,1.8rem)] font-black text-white/85">
            Letter {letter}
          </span>
        </span>
        <Sparkles burstKey={burstKey} />
      </button>
    );
  }

  /* ── Colour swatch: the colour IS the stage, word lives on it ── */
  if (imageMode === "color") {
    const hex = COLOR_MAP[word] ?? categoryColor;
    const dark = relativeLuminanceFromHex(hex) < 0.5;
    const len = word.length;
    const sz =
      len > 8 ? "text-[clamp(2.2rem,10vmin,4rem)]"
      : len > 5 ? "text-[clamp(2.6rem,12vmin,5rem)]"
      : "text-[clamp(3rem,14vmin,6rem)]";
    return (
      <button type="button" onClick={triggerReaction} aria-label={`Hear ${word}`} className={`${frameCls} block`} style={{ background: hex }}>
        <span className={`flex h-full items-center justify-center ${reacting ? "kt-squash" : ""}`}>
          <span key={burstKey} className={burstKey > 0 ? "kt-bounce" : ""}>
            <span
              className={`select-none px-4 text-center font-black leading-none ${sz}`}
              style={{ color: dark ? "#FFFFFF" : "#182642", textShadow: dark ? "0 3px 14px rgba(0,0,0,0.25)" : "none" }}
            >
              {word}
            </span>
          </span>
        </span>
        <Sparkles burstKey={burstKey} />
      </button>
    );
  }

  /* ── Shape art on a clean white stage ── */
  if (imageMode === "shape") {
    return (
      <button type="button" onClick={triggerReaction} aria-label={`Hear ${word}`} className={`${frameCls} block bg-white`}>
        <span className={`flex h-full items-center justify-center ${reacting ? "kt-squash" : ""}`}>
          <span key={burstKey} className={burstKey > 0 ? "kt-bounce" : ""}>
            <ShapeArt word={word} size={Math.min(300, 220)} />
          </span>
        </span>
        <Sparkles burstKey={burstKey} />
      </button>
    );
  }

  /* ── Static per-category art (only when no rebuilt photo exists) ── */
  if (imageMode === "static" && !localSrc) {
    const key = slug;
    const ext = categoryId === "actions" || categoryId === "emotions" ? "png" : "svg";
    const isCuratedPng = ext === "png";
    const src = `/images/${categoryId}/${key}.${ext}${isCuratedPng ? `?v=${encodeURIComponent(CURATED_STATIC_BITMAP_VER)}` : ""}`;
    const isActionArt = categoryId === "actions";
    return (
      <button type="button" onClick={triggerReaction} aria-label={`Hear ${word}`} className={`${frameCls} block`} style={{ background: tint(categoryColor, 0.9) }}>
        <span className={`block h-full w-full ${reacting ? "kt-squash" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={word}
            className={`h-full w-full ${isActionArt ? "object-cover" : "object-contain p-4"}`}
            draggable={false}
          />
        </span>
        <Sparkles burstKey={burstKey} />
      </button>
    );
  }

  /* ── Concept card (no photo exists for the word) ── */
  if (imageMode === "card" && !localSrc) {
    const len = word.length;
    const sz =
      len > 10 ? "text-[clamp(2rem,9vmin,3.6rem)]"
      : len > 6 ? "text-[clamp(2.4rem,11vmin,4.4rem)]"
      : "text-[clamp(2.8rem,13vmin,5.4rem)]";
    return (
      <button type="button" onClick={triggerReaction} aria-label={`Hear ${word}`} className={`${frameCls} block`} style={{ background: tint(categoryColor, 0.88) }}>
        <span className={`flex h-full items-center justify-center px-5 ${reacting ? "kt-squash" : ""}`}>
          <span key={burstKey} className={burstKey > 0 ? "kt-bounce" : ""}>
            <span className={`block select-none text-balance text-center font-black leading-[0.95] ${sz}`} style={{ color: categoryColor }}>
              {word}
            </span>
          </span>
        </span>
        <Sparkles burstKey={burstKey} />
      </button>
    );
  }

  /* ── Photo / vector: blurred fill + whole photo, never cropped ── */
  if (loading) {
    return (
      <div className={`${frameCls} grid place-items-center`} style={{ background: tint(categoryColor, 0.88) }}>
        <div className="kt-spinner" />
      </div>
    );
  }

  if (!imageUrl) {
    const Glyph = CATEGORY_GLYPHS[categoryId] ?? CATEGORY_GLYPHS.kid_general;
    return (
      <button type="button" onClick={triggerReaction} aria-label={`Hear ${word}`} className={`${frameCls} block`} style={{ background: tint(categoryColor, 0.88) }}>
        <span className={`flex h-full flex-col items-center justify-center gap-3 ${reacting ? "kt-squash" : ""}`}>
          <span style={{ color: categoryColor }}>
            <Glyph size={72} />
          </span>
          <span className="text-[24px] font-black text-ink">{word}</span>
        </span>
        <Sparkles burstKey={burstKey} />
      </button>
    );
  }

  return (
    <button type="button" onClick={triggerReaction} aria-label={`Hear ${word}`} className={`${frameCls} block bg-white`}>
      <span className={`absolute inset-0 block ${reacting ? "kt-squash" : ""}`}>
        <Image
          src={imageUrl}
          alt=""
          aria-hidden
          fill
          className="pointer-events-none scale-110 object-cover blur-2xl brightness-[.82] saturate-[1.15]"
          sizes="(max-width: 768px) 100vw, 768px"
        />
        <span className="pointer-events-none absolute inset-0 bg-black/10" aria-hidden />
        <Image
          src={imageUrl}
          alt={word}
          fill
          className="kt-fade-in object-contain"
          sizes="(max-width: 768px) 100vw, 768px"
          priority
        />
      </span>
      <Sparkles burstKey={burstKey} />
    </button>
  );
}
