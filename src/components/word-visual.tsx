"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { resolveWordImage } from "@/lib/media";
import { CATEGORY_ICONS } from "./icons";
import { getLocalIllustration } from "./local-illustrations";
import type { ImageMode } from "@/lib/vocab";

const COLOR_MAP: Record<string, string> = {
  Red: "#e74c3c", Blue: "#3498db", Green: "#2ecc71", Yellow: "#f1c40f",
  Orange: "#e67e22", Purple: "#9b59b6", Pink: "#e84393", White: "#ffffff",
  Black: "#1a1a2e", Brown: "#8B4513", Gold: "#daa520", Silver: "#C0C0C0",
  Gray: "#95a5a6", Cyan: "#00bcd4", Magenta: "#e91e63", Indigo: "#3f51b5",
  Turquoise: "#1abc9c", Maroon: "#800000", Navy: "#001f3f", Beige: "#f5f5dc",
};

function parseHexRgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "").trim();
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ];
  }
  if (h.length === 6) return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  return null;
}

/** WCAG-related luminance 0–1; higher = lighter. */
function relativeLuminanceFromHex(hex: string): number {
  const rgb = parseHexRgb(hex);
  if (!rgb) return 0.5;
  const lin = rgb.map((c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

const ONES = ["Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
  "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
const TENS = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

function numberToWord(n: number): string {
  if (isNaN(n) || n < 0) return "";
  if (n < 20) return ONES[n];
  if (n === 100) return "One Hundred";
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o === 0 ? TENS[t] : `${TENS[t]}-${ONES[o]}`;
}

const NUM_COLORS: [string, string][] = [
  ["#64748b", "#475569"], ["#ef4444", "#dc2626"], ["#f97316", "#ea580c"],
  ["#eab308", "#ca8a04"], ["#22c55e", "#16a34a"], ["#14b8a6", "#0d9488"],
  ["#3b82f6", "#2563eb"], ["#8b5cf6", "#7c3aed"], ["#ec4899", "#db2777"],
  ["#06b6d4", "#0891b2"], ["#6366f1", "#4f46e5"],
];

function numColor(n: number): [string, string] {
  return NUM_COLORS[n % NUM_COLORS.length];
}

/** Hero type: fits inside rounded card (narrow digits vs wide color words). */
function digitHeroSize(len: number): string {
  if (len >= 3) return "text-[clamp(2.5rem,16vmin,6.5rem)]";
  if (len === 2) return "text-[clamp(3rem,20vmin,8.5rem)]";
  return "text-[clamp(3.25rem,22vmin,10rem)]";
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
  Sphere:    { bg: ["#a855f7", "#9333ea"], fill: "#d8b4fe", svg: (s) => <><circle cx={s/2} cy={s/2} r={s*0.42} /><ellipse cx={s/2} cy={s/2} rx={s*0.42} ry={s*0.15} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={s*0.02} /><ellipse cx={s*0.38} cy={s*0.35} rx={s*0.08} ry={s*0.12} fill="rgba(255,255,255,0.2)" transform={`rotate(-30,${s*0.38},${s*0.35})`} /></> },
  Cube:      { bg: ["#f43f5e", "#e11d48"], fill: "#fda4af", svg: (s) => <><polygon points={`${s*0.2},${s*0.35} ${s*0.5},${s*0.18} ${s*0.8},${s*0.35} ${s*0.5},${s*0.52}`} fill="rgba(255,255,255,0.9)" /><polygon points={`${s*0.2},${s*0.35} ${s*0.5},${s*0.52} ${s*0.5},${s*0.85} ${s*0.2},${s*0.68}`} fill="rgba(255,255,255,0.6)" /><polygon points={`${s*0.8},${s*0.35} ${s*0.5},${s*0.52} ${s*0.5},${s*0.85} ${s*0.8},${s*0.68}`} fill="rgba(255,255,255,0.75)" /></> },
  Cylinder:  { bg: ["#10b981", "#059669"], fill: "#6ee7b7", svg: (s) => <><ellipse cx={s/2} cy={s*0.25} rx={s*0.35} ry={s*0.12} /><rect x={s*0.15} y={s*0.25} width={s*0.7} height={s*0.5} /><ellipse cx={s/2} cy={s*0.75} rx={s*0.35} ry={s*0.12} /><ellipse cx={s/2} cy={s*0.25} rx={s*0.35} ry={s*0.12} fill="rgba(255,255,255,0.3)" /></> },
  Cone:      { bg: ["#f59e0b", "#d97706"], fill: "#fcd34d", svg: (s) => <><polygon points={`${s/2},${s*0.1} ${s*0.85},${s*0.78} ${s*0.15},${s*0.78}`} /><ellipse cx={s/2} cy={s*0.78} rx={s*0.35} ry={s*0.12} /></> },
  Spiral:    { bg: ["#06b6d4", "#0891b2"], fill: "#67e8f9", svg: (s) => <path d={`M${s/2},${s/2} C${s*0.55},${s*0.45} ${s*0.6},${s*0.55} ${s*0.55},${s*0.6} C${s*0.48},${s*0.68} ${s*0.35},${s*0.62} ${s*0.35},${s*0.5} C${s*0.35},${s*0.35} ${s*0.5},${s*0.28} ${s*0.6},${s*0.3} C${s*0.72},${s*0.33} ${s*0.78},${s*0.5} ${s*0.72},${s*0.65} C${s*0.65},${s*0.82} ${s*0.4},${s*0.85} ${s*0.28},${s*0.72} C${s*0.15},${s*0.55} ${s*0.2},${s*0.28} ${s*0.42},${s*0.18} C${s*0.62},${s*0.1} ${s*0.85},${s*0.25} ${s*0.88},${s*0.5}`} fill="none" stroke="#67e8f9" strokeWidth={s*0.05} strokeLinecap="round" /> },
  Cross:     { bg: ["#dc2626", "#b91c1c"], fill: "#fca5a5", svg: (s) => <path d={`M${s*0.35},${s*0.1} H${s*0.65} V${s*0.35} H${s*0.9} V${s*0.65} H${s*0.65} V${s*0.9} H${s*0.35} V${s*0.65} H${s*0.1} V${s*0.35} H${s*0.35}Z`} /> },
  Pentagon:  { bg: ["#7c3aed", "#5b21b6"], fill: "#c4b5fd", svg: (s) => {
    const cx = s/2, cy = s/2, r = s*0.44;
    const pts = Array.from({ length: 5 }, (_, i) => {
      const a = (2 * Math.PI / 5) * i - Math.PI / 2;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    return <polygon points={pts} />;
  }},
  Octagon:   { bg: ["#0891b2", "#0e7490"], fill: "#67e8f9", svg: (s) => {
    const cx = s/2, cy = s/2, r = s*0.44;
    const pts = Array.from({ length: 8 }, (_, i) => {
      const a = (Math.PI / 4) * i - Math.PI / 8;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    return <polygon points={pts} />;
  }},
  Pyramid:   { bg: ["#d97706", "#92400e"], fill: "#fcd34d", svg: (s) => <><polygon points={`${s/2},${s*0.1} ${s*0.85},${s*0.78} ${s*0.15},${s*0.78}`} /><polygon points={`${s/2},${s*0.1} ${s*0.85},${s*0.78} ${s*0.6},${s*0.85}`} fill="rgba(255,255,255,0.5)" /></> },
};

type Props = {
  word: string;
  imageQuery: string;
  assetKey?: string;
  imageMode: ImageMode;
  categoryColor: string;
  categoryId: string;
  onClick?: () => void;
  className?: string;
};

const CAPTION = "shrink-0 px-3 pb-8 pt-0.5 text-center text-[clamp(1rem,3.8vw,1.75rem)] font-semibold tracking-tight";

function FallbackCard({ word, categoryColor, categoryId, onClick, className = "" }: Omit<Props, "imageQuery" | "imageMode">) {
  const CatIcon = CATEGORY_ICONS[categoryId];
  const Wrapper = onClick ? "button" : "div";
  const wrapperProps = onClick ? { type: "button" as const, onClick } : {};
  return (
    <Wrapper {...wrapperProps} className={`relative flex h-full min-h-0 w-full flex-col items-center overflow-hidden rounded-3xl transition-all active:scale-[.97] ${className}`}
      style={{
        background: `linear-gradient(160deg, ${categoryColor}18, ${categoryColor}0d)`,
        boxShadow: `0 8px 32px ${categoryColor}12`,
      }}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-40" style={{ background: `${categoryColor}14` }} />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full opacity-35" style={{ background: `${categoryColor}10` }} />
      <div className="pointer-events-none absolute right-3 top-3 opacity-[.08]">{CatIcon && <CatIcon size={72} />}</div>
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 overflow-hidden px-3 sm:px-4">
        <span className="relative flex h-[min(28vmin,120px)] w-[min(28vmin,120px)] shrink-0 items-center justify-center rounded-[1.75rem] text-[clamp(2.25rem,11vmin,4rem)] font-black text-white" style={{ background: categoryColor, boxShadow: `0 8px 28px ${categoryColor}38` }}>
          {word.charAt(0)}
        </span>
      </div>
      <p className="shrink-0 px-3 pb-1 pt-0.5 text-center text-[clamp(1rem,3.8vw,1.75rem)] font-semibold tracking-tight" style={{ color: `${categoryColor}dd` }}>{word}</p>
      <p className="shrink-0 px-3 pb-8 text-center text-[11px] font-semibold text-[var(--ink-tertiary)]">Tap to hear</p>
    </Wrapper>
  );
}

export function WordVisual({ word, imageQuery, assetKey, imageMode, categoryColor, categoryId, onClick, className = "" }: Props) {
  const fetchable = imageMode === "photo" || imageMode === "vector";
  const [state, setState] = useState<{ url: string | null; loading: boolean }>({ url: null, loading: fetchable });

  useEffect(() => {
    if (!fetchable) { setState({ url: null, loading: false }); return; }
    let ignore = false;
    setState({ url: null, loading: true });
    resolveWordImage(imageQuery, imageMode).then((r) => {
      if (ignore) return;
      const url = (r.imageUrl && r.source !== "none" && r.source !== "skip") ? r.imageUrl : null;
      setState({ url, loading: false });
    });
    return () => { ignore = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageQuery, imageMode]);

  const imageUrl = state.url;
  const loading = state.loading;

  const Wrapper = onClick ? "button" : "div";
  const wrapperProps = onClick ? { type: "button" as const, onClick } : {};

  /* ── Colors — solid swatch background (source of truth: COLOR_MAP hex); contrast from luminance ── */
  if (imageMode === "color") {
    const raw = COLOR_MAP[word] ?? categoryColor;
    const hex = raw.startsWith("#") ? raw : `#${raw}`;
    const L = relativeLuminanceFromHex(hex);
    const onLightBg = L > 0.58;
    const sz = colorHeroSize(word);
    const heroColor = onLightBg ? "#1a1a2e" : "#ffffff";
    const heroShadow = onLightBg
      ? "0 1px 2px rgba(0,0,0,.06)"
      : "0 2px 16px rgba(0,0,0,.22)";
    const subColor = onLightBg ? "rgba(26,26,46,0.5)" : "rgba(255,255,255,0.72)";
    return (
      <Wrapper {...wrapperProps} className={`relative flex h-full min-h-0 w-full flex-col items-center overflow-hidden rounded-3xl transition-all active:scale-[.97] ${className}`}
        style={{
          backgroundColor: hex,
          boxShadow: `0 10px 36px ${hex}55`,
        }}
      >
        <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden px-3 sm:px-4">
          <p className={`max-w-full text-balance text-center font-black leading-[0.88] ${sz}`}
            style={{ color: heroColor, textShadow: heroShadow }}
          >
            {word}
          </p>
        </div>
        <p className={CAPTION} style={{ color: subColor }}>
          {hex.toUpperCase()}
        </p>
      </Wrapper>
    );
  }

  /* ── Digit display — full immersive ── */
  if (imageMode === "digit") {
    const n = parseInt(word, 10);
    const bg = numColor(isNaN(n) ? 0 : n);
    const sz = digitHeroSize(word.length);
    return (
      <Wrapper {...wrapperProps} className={`relative flex h-full min-h-0 w-full flex-col items-center overflow-hidden rounded-3xl transition-all active:scale-[.97] ${className}`}
        style={{ background: `linear-gradient(160deg, ${bg[0]}18, ${bg[1]}10)`, boxShadow: `0 8px 32px ${bg[0]}12` }}
      >
        <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden px-3 sm:px-4">
          <p className={`max-w-full text-balance text-center font-black leading-[0.88] ${sz}`}
            style={{ color: bg[0], textShadow: `0 4px 24px ${bg[0]}20` }}
          >
            {word}
          </p>
        </div>
        <p className={CAPTION} style={{ color: `${bg[0]}99` }}>
          {numberToWord(n)}
        </p>
      </Wrapper>
    );
  }

  /* ── Actions — warm paper field matches illustration mats; art uses full card; light category halo only ── */
  if (imageMode === "action") {
    const slug = word.toLowerCase().replace(/\s+/g, "-");
    const src = `/images/actions/${slug}.png`;
    const paper = "linear-gradient(168deg, #faf8f5 0%, #f4efe6 42%, #ede6dc 100%)";
    const halo = `radial-gradient(ellipse 95% 70% at 90% 8%, ${categoryColor}12 0%, transparent 50%), radial-gradient(ellipse 85% 65% at 8% 92%, ${categoryColor}10 0%, transparent 48%)`;
    return (
      <Wrapper {...wrapperProps} className={`relative flex h-full min-h-0 w-full flex-col items-center overflow-hidden rounded-3xl transition-all active:scale-[.97] ${className}`}
        style={{
          background: `${halo}, ${paper}`,
          boxShadow: "0 10px 36px rgba(28,24,20,.08), inset 0 1px 0 rgba(255,255,255,.72)",
        }}
      >
        <div className="relative min-h-0 flex-1 w-full">
          <Image
            src={src}
            alt={word}
            fill
            className="object-contain object-center p-3 sm:p-5"
            sizes="(max-width: 768px) 100vw, 720px"
            priority
          />
        </div>
        <p className={CAPTION} style={{ color: `${categoryColor}cc` }}>
          {word}
        </p>
      </Wrapper>
    );
  }

  /* ── Shape display — full immersive ── */
  if (imageMode === "shape") {
    const sh = SHAPES[word];
    if (sh) {
      const svgSize = 200;
      return (
        <Wrapper {...wrapperProps} className={`relative flex h-full min-h-0 w-full flex-col items-center overflow-hidden rounded-3xl transition-all active:scale-[.97] ${className}`}
          style={{ background: `linear-gradient(160deg, ${sh.bg[0]}18, ${sh.bg[1]}10)`, boxShadow: `0 8px 32px ${sh.bg[0]}12` }}
        >
          <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden px-2">
            <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="aspect-square w-[min(88vw,58vmin,400px)] max-w-full shrink-0" fill={sh.bg[0]} style={{ filter: `drop-shadow(0 8px 24px ${sh.bg[0]}30)` }}>
              {sh.svg(svgSize)}
            </svg>
          </div>
          <p className={CAPTION} style={{ color: `${sh.bg[0]}cc` }}>
            {word}
          </p>
        </Wrapper>
      );
    }
    return <FallbackCard word={word} categoryColor={categoryColor} categoryId={categoryId} onClick={onClick} className={className} />;
  }

  /* ── Static local SVG — full immersive ── */
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
        <div className="pointer-events-none absolute -right-12 top-10 h-36 w-36 rounded-full blur-2xl" style={{ background: `${categoryColor}14` }} />
        <div className="pointer-events-none absolute -left-10 bottom-12 h-28 w-28 rounded-full blur-2xl" style={{ background: `${categoryColor}12` }} />
        <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden px-3 py-4">
          <div
            className="relative h-[min(78%,60vmin)] w-[min(92%,60vmin)] max-h-[430px] max-w-[430px] overflow-hidden rounded-[2rem] border border-white/60 p-4"
            style={{ background: frameBackground, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 16px 32px rgba(15,23,42,0.08)" }}
          >
            {localArt ? (
              <div className="h-full w-full">{localArt.art}</div>
            ) : (
              <Image src={src} alt={word} fill className="object-contain p-4" sizes="(max-width: 768px) 75vw, 500px" priority />
            )}
          </div>
        </div>
        <p className={CAPTION} style={{ color: `${categoryColor}cc` }}>
          {word}
        </p>
      </Wrapper>
    );
  }

  /* ── Concept card — same shell as Numbers (wash + hero + caption) ── */
  if (imageMode === "card") {
    const sz = colorHeroSize(word);
    return (
      <Wrapper {...wrapperProps} className={`relative flex h-full min-h-0 w-full flex-col items-center overflow-hidden rounded-3xl transition-all active:scale-[.97] ${className}`}
        style={{
          background: `linear-gradient(160deg, ${categoryColor}18, ${categoryColor}0d)`,
          boxShadow: `0 8px 32px ${categoryColor}12`,
        }}
      >
        <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden px-3 sm:px-4">
          <p className={`max-w-full text-balance text-center font-black leading-[0.88] ${sz}`}
            style={{ color: categoryColor, textShadow: `0 4px 24px ${categoryColor}25` }}
          >
            {word}
          </p>
        </div>
        <p className={CAPTION} style={{ color: `${categoryColor}99` }}>Tap to hear</p>
      </Wrapper>
    );
  }

  /* ── Photo / Vector modes ── */
  const isVector = imageMode === "vector";

  if (loading) {
    return (
      <div className={`flex h-full min-h-0 w-full flex-col items-center overflow-hidden rounded-3xl ${className}`}
        style={{
          background: `linear-gradient(160deg, ${categoryColor}12, ${categoryColor}08)`,
          boxShadow: `0 8px 32px ${categoryColor}10`,
        }}
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

  if (isVector) {
    return (
      <Wrapper {...wrapperProps} className={`relative flex h-full min-h-0 w-full flex-col items-center overflow-hidden rounded-3xl transition-all active:scale-[.97] ${className}`}
        style={{ background: `linear-gradient(160deg, ${categoryColor}12, ${categoryColor}08)`, boxShadow: `0 8px 32px ${categoryColor}10` }}
      >
        <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden px-2">
          <div className="relative h-[min(78%,58vmin)] w-[min(92%,58vmin)] max-h-[420px] max-w-[420px]">
            <Image src={imageUrl} alt={word} fill className="object-contain fade-in" sizes="(max-width: 768px) 80vw, 600px" priority />
          </div>
        </div>
        <p className={CAPTION} style={{ color: `${categoryColor}cc` }}>
          {word}
        </p>
      </Wrapper>
    );
  }

  /* ── Photo — same column layout as Numbers (wash + image + caption) ── */
  return (
    <Wrapper {...wrapperProps} className={`relative flex h-full min-h-0 w-full flex-col items-center overflow-hidden rounded-3xl transition-all active:scale-[.97] ${className}`}
      style={{
        background: `linear-gradient(160deg, ${categoryColor}12, ${categoryColor}08)`,
        boxShadow: `0 8px 32px ${categoryColor}10`,
      }}
    >
      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden px-2 sm:px-3">
        <div className="relative h-[min(78%,58vmin)] w-[min(92%,58vmin)] max-h-[420px] max-w-[420px]">
          <Image src={imageUrl} alt={word} fill className="object-contain fade-in" sizes="(max-width: 768px) 100vw, 700px" priority />
        </div>
      </div>
      <p className={CAPTION} style={{ color: `${categoryColor}cc` }}>{word}</p>
    </Wrapper>
  );
}
