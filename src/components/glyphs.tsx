/* ─── Kidtopia glyphs ───
   One fresh icon family for the whole app: solid fills, round caps,
   chunky proportions — drawn for the royal-blue / white-sheet world.
   Every glyph is a 24×24 currentColor drawing. */

import type { ReactElement } from "react";

type P = { size?: number; className?: string };

function base(p: P) {
  return {
    width: p.size ?? 24,
    height: p.size ?? 24,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    className: p.className,
    "aria-hidden": true,
    focusable: false,
  } as const;
}

/* ─── Chrome / UI ─── */

export function GlyphHome(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12 3.2 2.8 11.1c-.6.5-.2 1.5.6 1.5H5v7.6c0 .8.6 1.4 1.4 1.4h3.9v-6.4h3.4v6.4h3.9c.8 0 1.4-.6 1.4-1.4v-7.6h1.6c.8 0 1.2-1 .6-1.5L12 3.2Z" />
    </svg>
  );
}

export function GlyphApps(p: P) {
  return (
    <svg {...base(p)}>
      <rect x="3.5" y="3.5" width="7.4" height="7.4" rx="2.4" />
      <rect x="13.1" y="3.5" width="7.4" height="7.4" rx="3.7" />
      <rect x="3.5" y="13.1" width="7.4" height="7.4" rx="3.7" />
      <rect x="13.1" y="13.1" width="7.4" height="7.4" rx="2.4" />
    </svg>
  );
}

export function GlyphPlay(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M8.2 5.4c0-1.1 1.2-1.8 2.2-1.3l9 5.3c.9.5.9 1.7 0 2.2l-9 5.3c-1 .6-2.2-.1-2.2-1.3V5.4Z" />
    </svg>
  );
}

export function GlyphChart(p: P) {
  return (
    <svg {...base(p)}>
      <rect x="4" y="12.5" width="4.4" height="7.5" rx="2.2" />
      <rect x="9.8" y="8" width="4.4" height="12" rx="2.2" />
      <rect x="15.6" y="4" width="4.4" height="16" rx="2.2" />
    </svg>
  );
}

export function GlyphChevronL(p: P) {
  return (
    <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </svg>
  );
}

export function GlyphChevronR(p: P) {
  return (
    <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
    </svg>
  );
}

export function GlyphCheck(p: P) {
  return (
    <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="m4.5 12.8 5 5L19.5 6.5" />
    </svg>
  );
}

export function GlyphStar(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12 2.6c.6 0 1.1.3 1.3.9l2 4.6 5 .5c1.1.1 1.5 1.4.7 2.1l-3.8 3.4 1.1 4.9c.2 1-1 1.8-1.9 1.2L12 17.4l-4.4 2.8c-.9.6-2.1-.2-1.9-1.2l1.1-4.9L3 10.7c-.8-.7-.3-2 .7-2.1l5-.5 2-4.6c.2-.6.7-.9 1.3-.9Z" />
    </svg>
  );
}

export function GlyphFlame(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12.9 2.3c.2-.4.9-.4 1.1 0 .9 1.9 2.2 3.4 3.4 4.9 1.4 1.8 2.6 3.6 2.6 6a8 8 0 1 1-16 0c0-2.2.9-4 2-5.7.3-.4 1-.3 1.2.2.3.9.8 1.7 1.5 2.3.2-2.9 1.5-6.2 4.2-8.7Z" />
    </svg>
  );
}

export function GlyphTrophy(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M6 3.5h12V5h3.2c.5 0 .9.4.8 1-.3 3-2 5.3-4.6 5.7A6 6 0 0 1 13 15.9v2.6h3.4c.7 0 1.2.5 1.2 1.2S16.9 21 16.2 21H7.8c-.7 0-1.3-.6-1.3-1.3s.6-1.2 1.3-1.2H11v-2.6a6 6 0 0 1-4.4-4.2C4 11.3 2.3 9 2 6c-.1-.6.3-1 .8-1H6V3.5ZM4.4 7c.3 1.5 1 2.7 2 3.4A9 9 0 0 1 6 7H4.4Zm15.2 0H18a9 9 0 0 1-.4 3.4c1-.7 1.7-1.9 2-3.4Z" />
    </svg>
  );
}

export function GlyphSpeaker(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M4 9.2c-.8 0-1.4.6-1.4 1.4v2.8c0 .8.6 1.4 1.4 1.4h2.6L12 19.4c.6.6 1.7.2 1.7-.7V5.3c0-.9-1-1.3-1.7-.7L6.6 9.2H4Z" />
      <path d="M16.8 9.2a4 4 0 0 1 0 5.6c-.5.5-1.3.5-1.8 0s-.5-1.3 0-1.8a1.5 1.5 0 0 0 0-2.1c-.5-.5-.5-1.3 0-1.8.5-.4 1.3-.4 1.8.1Z" />
      <path d="M19.2 6.8a7.4 7.4 0 0 1 0 10.4c-.5.5-1.3.5-1.8 0a1.3 1.3 0 0 1 0-1.8 4.9 4.9 0 0 0 0-6.9c-.5-.5-.5-1.3 0-1.8.5-.5 1.3-.5 1.8.1Z" />
    </svg>
  );
}

export function GlyphGear(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Zm9.2 4.9c.5-.1.8-.6.7-1.1l-.4-2.2c-.1-.5-.5-.8-1-.8-.9 0-1.5-.4-1.9-1.1-.3-.5-.2-1 .1-1.5l1.2-1.9c.3-.4.2-1-.2-1.3l-1.9-1.3c-.4-.3-1-.2-1.4.2-.6.7-1.4.9-2.2.6-.5-.2-.8-.7-.9-1.3L13 1.3C12.9.8 12.5.5 12 .5s-.9.3-1 .8l-.3 2.2c-.1.6-.4 1-1 1.3-.7.3-1.5.1-2.1-.6-.4-.4-1-.5-1.4-.2L4.3 5.3c-.4.3-.5.9-.2 1.3l1.2 1.9c.3.5.4 1 .1 1.5-.4.7-1 1.1-1.9 1.1-.5 0-.9.3-1 .8l-.4 2.2c-.1.5.2 1 .7 1.1l2.2.4c.5.1.9.5 1 1 .2.8 0 1.6-.5 2.2-.3.4-.3 1 .1 1.3l1.8 1.4c.4.3 1 .3 1.4-.1.6-.7 1.4-.9 2.1-.6.6.2.9.7 1 1.3l.3 2.2c.1.5.5.8 1 .8s.9-.3 1-.8l.3-2.2c.1-.6.4-1.1 1-1.3.7-.3 1.5-.1 2.1.6.4.4 1 .4 1.4.1l1.8-1.4c.4-.3.4-.9.1-1.3-.5-.6-.7-1.4-.5-2.2.1-.5.5-.9 1-1l2.2-.4Z" transform="scale(0.92) translate(1 1)" />
    </svg>
  );
}

export function GlyphBook(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M5 3.5A1.5 1.5 0 0 1 6.5 2H20v17.5H6.7c-.9 0-1.7.7-1.7 1.7V3.5Zm0 17.5c0-.9.7-1.7 1.7-1.7H20v2.2H6.5c-.9 0-1.5-.6-1.5-.5Z" transform="translate(0 .5)" />
    </svg>
  );
}

export function GlyphPuzzle(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M10 3.5c0-1 .8-1.7 1.7-1.5.8.1 1.3.8 1.3 1.5 0 .3.2.5.5.5H16a2 2 0 0 1 2 2v2.5c-.7 0-1.2-.5-1.5-1.2-.2-.6-.8-1-1.5-1-1 0-1.9.9-1.9 2s.8 2 1.9 2c.7 0 1.3-.4 1.5-1 .2-.7.8-1.2 1.5-1.2v2.4c0 1.1-.9 2-2 2h-2.5c0-.7-.5-1.2-1.2-1.5-.6-.2-1-1-1-1.8 0-1-.8-1.9-1.8-1.9-1.1 0-2 .9-2 2 0 .7.4 1.4 1 1.7.7.3 1.2.8 1.2 1.5H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2.5c.3 0 .5-.2.5-.5Z" transform="translate(.5 1) scale(.94)" />
    </svg>
  );
}

export function GlyphGlobe(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Zm5.9 4.2h-2.6a16 16 0 0 0-1.2-2.4c1.6.5 2.9 1.3 3.8 2.4ZM12 4.3c.8 1 1.6 2.6 1.9 4.5H10c.4-1.9 1.2-3.5 2-4.5ZM4.5 14.3a7.8 7.8 0 0 1 0-4.6h3.2c-.1.7-.1 1.5-.1 2.3s0 1.6.1 2.3H4.5Zm1.6 2.9h2.6c.3.9.7 1.7 1.2 2.4-1.6-.4-2.9-1.2-3.8-2.4ZM8.7 6.7H6.1c.9-1 2.2-1.9 3.8-2.4-.5.7-.9 1.5-1.2 2.4ZM12 19.7c-.8-1-1.6-2.6-1.9-4.5h3.9c-.4 1.9-1.2 3.5-2 4.5Zm2.1-6.5H9.9A18 18 0 0 1 9.8 12c0-.8 0-1.6.1-2.3h4.2c.1.7.1 1.5.1 2.3s0 1.6-.1 2.3Zm.9 6.4c.5-.7.9-1.5 1.2-2.4h2.6c-.9 1.2-2.2 2-3.8 2.4Zm1.3-5.3c.1-.7.1-1.5.1-2.3s0-1.6-.1-2.3h3.2a7.8 7.8 0 0 1 0 4.6h-3.2Z" />
    </svg>
  );
}

/* ─── Category glyphs — one bold pictogram per topic ─── */

function TextGlyph({ p, label, y = 17, size = 11 }: { p: P; label: string; y?: number; size?: number }) {
  return (
    <svg {...base(p)}>
      <text x="12" y={y} textAnchor="middle" fontSize={size} fontWeight={900} fill="currentColor" stroke="none" fontFamily="inherit">
        {label}
      </text>
    </svg>
  );
}

export function GlyphCatNumbers(p: P) { return <TextGlyph p={p} label="123" size={10} y={16.5} />; }
export function GlyphCatAlphabets(p: P) { return <TextGlyph p={p} label="Aa" size={12} y={17} />; }
export function GlyphCatMoney(p: P) { return <TextGlyph p={p} label="$" size={15} y={18.5} />; }

export function GlyphCatShapes(p: P) {
  return (
    <svg {...base(p)}>
      <circle cx="8.6" cy="8.6" r="5.2" />
      <path d="M15.4 3.8 20.6 14H10.2l5.2-10.2Z" />
      <rect x="5" y="14.6" width="6.4" height="6.4" rx="1.6" />
      <path d="m16.9 15.2.9 1.9 2.1.2-1.6 1.4.5 2.1-1.9-1.1-1.9 1.1.5-2.1-1.6-1.4 2.1-.2.9-1.9Z" />
    </svg>
  );
}

export function GlyphCatActions(p: P) {
  return (
    <svg {...base(p)} fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="15.6" cy="4.4" r="2.3" stroke="none" />
      <path d="M7 12.2 10.8 8l3.2 1.4 2.8 1" fill="none" strokeWidth="2.6" />
      <path d="M10.8 8 9.4 13l-3 5.4M13.8 9.6l.6 3.8 3.4 3" fill="none" strokeWidth="2.6" />
    </svg>
  );
}

export function GlyphCatEmotions(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12 2.8a9.2 9.2 0 1 0 0 18.4 9.2 9.2 0 0 0 0-18.4ZM8.6 9.4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.8 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 18.4c-2.3 0-4.2-1.3-5-3.2-.2-.6.5-1.1 1-.7 1.1 1 2.5 1.5 4 1.5s2.9-.5 4-1.5c.5-.4 1.2.1 1 .7-.8 1.9-2.7 3.2-5 3.2Z" />
    </svg>
  );
}

export function GlyphCatEveryday(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M6.4 3.5a1.6 1.6 0 0 1 1.6 1.6v4.3h8V5.1a1.6 1.6 0 1 1 3.2 0v6.2c.9.5 1.5 1.4 1.5 2.5V18a1.6 1.6 0 0 1-3.2 0v-1.2H6.4V18a1.6 1.6 0 0 1-3.2 0v-4.2c0-1.1.6-2 1.5-2.5V5.1c0-.9.7-1.6 1.7-1.6ZM7.9 11.2h8.2c.3 0 .6.3.6.6v2.4H7.3v-2.4c0-.3.3-.6.6-.6Z" />
    </svg>
  );
}

export function GlyphCatNature(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12 2.8c.5 0 .9.2 1.2.6l2.6 3.2h1.4c.8 0 1.3.9.8 1.6l-2.3 3h1.5c.8 0 1.3 1 .7 1.6l-2.9 3.5v3.4a1.3 1.3 0 0 1-2.6 0v-3.4L9.5 12.8c-.6-.6-.1-1.6.7-1.6h1.5l-2.3-3c-.5-.7 0-1.6.8-1.6h1.4l2.6-3.2c.3-.4.7-.6 1.8-.6Z" transform="translate(-1.7 0)" />
    </svg>
  );
}

export function GlyphCatAnimals(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M7.1 5.2c1.1-.2 2.2.8 2.6 2.2.4 1.4-.2 2.7-1.3 2.9-1.1.2-2.2-.8-2.6-2.2-.4-1.4.2-2.7 1.3-2.9Zm9.8 0c1.1.2 1.7 1.5 1.3 2.9-.4 1.4-1.5 2.4-2.6 2.2-1.1-.2-1.7-1.5-1.3-2.9.4-1.4 1.5-2.4 2.6-2.2ZM12 11.4c2.9 0 5.8 2.7 5.8 5.5 0 1.8-1.3 3-3.2 3-1 0-1.7-.4-2.6-.4s-1.6.4-2.6.4c-1.9 0-3.2-1.2-3.2-3 0-2.8 2.9-5.5 5.8-5.5ZM4.6 9.4c1-.1 2 .7 2.3 1.9.3 1.2-.2 2.3-1.2 2.5-1 .1-2-.7-2.3-1.9-.3-1.2.2-2.4 1.2-2.5Zm14.8 0c1 .1 1.5 1.3 1.2 2.5-.3 1.2-1.3 2-2.3 1.9-1-.2-1.5-1.3-1.2-2.5.3-1.2 1.3-2 2.3-1.9Z" />
    </svg>
  );
}

export function GlyphCatFood(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12.4 7.2c.3-2.3 1.9-4 4.2-4.4.4-.1.7.4.5.7-.7 2.1-2.2 3.4-4.4 3.8 2.4.3 4.8 2.7 4.8 6.2 0 4-2.6 7.9-4.4 7.9-.4 0-.7-.2-1.1-.2s-.7.2-1.1.2c-1.8 0-4.4-3.9-4.4-7.9 0-4 2.9-6.6 5.9-6.3Z" />
    </svg>
  );
}

export function GlyphCatToys(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12 2.8a9.2 9.2 0 1 0 0 18.4 9.2 9.2 0 0 0 0-18.4ZM4.1 10.2a13 13 0 0 1 7-1.9c3 0 5.9 1 8.2 2.8-.4.9-1 1.8-1.7 2.6a11.4 11.4 0 0 0-6.5-2.1c-2.4 0-4.7.7-6.6 2-.2-1-.3-2.2-.4-3.4Z" />
    </svg>
  );
}

export function GlyphCatColors(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12.6 2.7c.5-.1.9.4.8.9-.4 2.2.6 3.9 2.3 5.2 1.9 1.5 3.4 3.4 3.4 5.9a7.1 7.1 0 1 1-14.2 0c0-2.5 1.5-4.4 3.4-5.9 1.9-1.5 3.3-3.6 4.3-6.1Z" />
    </svg>
  );
}

export function GlyphCatBody(p: P) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="5.4" r="3" />
      <path d="M12 9.2c2.8 0 4.4 1.4 4.4 3.6v3.4c0 .8-.7 1.5-1.5 1.3-.6-.1-.9-.6-.9-1.2V13h-.6v7.2a1.6 1.6 0 0 1-3.2 0v-5.9h-.4v5.9a1.6 1.6 0 0 1-3.2 0V13h-.6v3.3c0 .6-.3 1.1-.9 1.2-.8.2-1.5-.5-1.5-1.3v-3.4c0-2.2 1.6-3.6 4.4-3.6Z" transform="translate(1.2 0)" />
    </svg>
  );
}

export function GlyphCatFamily(p: P) {
  return (
    <svg {...base(p)}>
      <circle cx="8.2" cy="7" r="3.2" />
      <circle cx="16.6" cy="8.6" r="2.4" />
      <path d="M8.2 11.4c2.9 0 4.8 1.6 4.8 4v2.9a1.5 1.5 0 0 1-3 0v-2.6h-.5v5a1.5 1.5 0 0 1-3 0v-5H6v2.6a1.5 1.5 0 0 1-3 0v-2.9c0-2.4 2-4 5.2-4Z" transform="translate(0 -.3)" />
      <path d="M16.6 12.3c2.2 0 3.7 1.3 3.7 3.2v2.3a1.3 1.3 0 0 1-2.6 0v-2h-.4v3.9a1.3 1.3 0 0 1-2.6 0v-3.9h-.4v2a1.3 1.3 0 0 1-2.6 0v-2.3c0-1.9 1.6-3.2 4.9-3.2Z" />
    </svg>
  );
}

export function GlyphCatKidGeneral(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M9 3.2C9 2.2 9.9 1.5 12 1.5s3 .7 3 1.7v1h1.6A3.4 3.4 0 0 1 20 7.6v11a3.4 3.4 0 0 1-3.4 3.4H7.4A3.4 3.4 0 0 1 4 18.6v-11A3.4 3.4 0 0 1 7.4 4.2H9v-1Zm2 .9h2v-.9h-2v.9ZM8.2 13.2a1.8 1.8 0 0 1 1.8-1.8h4a1.8 1.8 0 0 1 1.8 1.8v3a1.8 1.8 0 0 1-1.8 1.8h-4a1.8 1.8 0 0 1-1.8-1.8v-3Z" />
    </svg>
  );
}

export function GlyphCatPresidents(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M6.5 3.2a1 1 0 0 1 2 .3c1.4-.6 2.6.2 4 .2 1.2 0 2.4-.5 3.5-.2.5.1.9.6.9 1.1v5.2c0 .6-.5 1-1 .9-1.3-.4-2.5.2-3.9.2-1.5 0-2.7-.8-4-.2v9.6a1.2 1.2 0 0 1-2.4 0V3.9c0-.4.4-.7.9-.7Z" />
    </svg>
  );
}

export function GlyphCatModern(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M11 2.2a1.3 1.3 0 0 1 2 0v1.6h2.6A3.4 3.4 0 0 1 19 7.2v6.1a3.4 3.4 0 0 1-3.4 3.4H8.4A3.4 3.4 0 0 1 5 13.3V7.2A3.4 3.4 0 0 1 8.4 3.8H11V2.2ZM8.8 8.6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm6.4 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM3.8 9a1.2 1.2 0 0 1 1.2 1.2v2.1a1.2 1.2 0 1 1-2.4 0v-2.1C2.6 9.5 3.1 9 3.8 9Zm16.4 0c.7 0 1.2.5 1.2 1.2v2.1a1.2 1.2 0 1 1-2.4 0v-2.1c0-.7.5-1.2 1.2-1.2ZM8 18.4h8c.8 0 1.4.6 1.4 1.4v.6a1.4 1.4 0 0 1-2.8 0v-.4H9.4v.4a1.4 1.4 0 0 1-2.8 0v-.6c0-.8.6-1.4 1.4-1.4Z" />
    </svg>
  );
}

export function GlyphCatWorld(p: P) { return <GlyphGlobe {...p} />; }

export function GlyphCatLeader(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M3.4 17.6c-.7 0-1.2-.7-1-1.4L4 7.6c.2-.8 1.2-1 1.7-.4l2.9 3.4L11 5c.4-.8 1.6-.8 2 0l2.4 5.6 2.9-3.4c.5-.6 1.5-.4 1.7.4l1.6 8.6c.2.7-.3 1.4-1 1.4H3.4Zm.6 2.2h16a1.2 1.2 0 1 1 0 2.4H4a1.2 1.2 0 1 1 0-2.4Z" />
    </svg>
  );
}

export function GlyphCatFinance(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12 2.6 2.8 8c-.7.4-.4 1.4.4 1.4h17.6c.8 0 1.1-1 .4-1.4L12 2.6ZM4.5 11.2c0-.6.4-1 1-1h1.5c.6 0 1 .4 1 1v6.3H4.5v-6.3Zm5.2 0c0-.6.5-1 1-1h1.5c.6 0 1 .4 1 1v6.3H9.7v-6.3Zm5.3 0c0-.6.4-1 1-1h1.5c.6 0 1 .4 1 1v6.3H15v-6.3ZM3.5 19.2h17c.6 0 1 .5 1 1s-.4 1.2-1 1.2h-17c-.6 0-1-.6-1-1.2s.4-1 1-1Z" />
    </svg>
  );
}

export function GlyphCatSpace(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12 2.2c.4 0 .8.2 1.1.5 2 2.3 3.1 5.3 3.1 8.5l3 3.6c.4.5.1 1.3-.6 1.4l-2.7.3a13 13 0 0 1-1.3 2.5l-.5 3.1c-.1.5-.8.6-1.1.2L12 20.9l-1 1.4c-.3.4-1 .3-1.1-.2l-.5-3.1a13 13 0 0 1-1.3-2.5l-2.7-.3c-.7-.1-1-.9-.6-1.4l3-3.6c0-3.2 1.1-6.2 3.1-8.5.3-.3.7-.5 1.1-.5Zm0 4.4a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Z" />
    </svg>
  );
}

export function GlyphCatUniverse(p: P) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="5.4" />
      <path d="M21.9 9.6c.5 1.5-1.4 3.7-5 5.4-4.3 2-9.4 2.6-12.4 1.5-1-.4-1.6-1-1.7-1.6-.1-.5.4-.9.9-.8.4 0 .7.3.9.6.6.5 3.1.9 6.6.2 3.9-.8 7.4-2.6 8.6-4.2.3-.4.4-.8.3-1-.1-.5.3-1 .8-1 .6 0 1 .4 1.1.9Z" transform="rotate(-14 12 12)" />
    </svg>
  );
}

export function GlyphCatPhysics(p: P) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 5.2c4.9 0 8.9 3 8.9 6.8s-4 6.8-8.9 6.8-8.9-3-8.9-6.8 4-6.8 8.9-6.8Zm0 1.8c-3.9 0-7 2.2-7 5s3.1 5 7 5 7-2.2 7-5-3.1-5-7-5Z" transform="rotate(-24 12 12)" />
      <path d="M12 5.2c4.9 0 8.9 3 8.9 6.8s-4 6.8-8.9 6.8-8.9-3-8.9-6.8 4-6.8 8.9-6.8Zm0 1.8c-3.9 0-7 2.2-7 5s3.1 5 7 5 7-2.2 7-5-3.1-5-7-5Z" transform="rotate(52 12 12)" />
    </svg>
  );
}

export function GlyphCatPeople(p: P) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="7.2" r="3.6" />
      <path d="M12 12.2c3.6 0 6 2 6 4.8v2.6a1.6 1.6 0 0 1-3.2 0v-2.4h-.5v4.5a1.7 1.7 0 0 1-3.4 0v-4.5h-.4v4.5a1.7 1.7 0 0 1-3.4 0v-4.5H6.6v2.4a1.6 1.6 0 0 1-3.2 0V17c0-2.8 2.4-4.8 8.6-4.8Z" transform="translate(-.8 -.4)" />
    </svg>
  );
}

export function GlyphCatInventions(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12 2.5a7 7 0 0 1 4 12.7c-.6.4-1 1-1 1.7v.3H9v-.3c0-.7-.4-1.3-1-1.7A7 7 0 0 1 12 2.5ZM9 18.7h6v.7a2.3 2.3 0 0 1-4.6 0h2.2-2.2a2.3 2.3 0 0 1-1.4-2v-.7Z" transform="translate(0 -.3)" />
    </svg>
  );
}

export function GlyphCatLandmarks(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12 2.4c.5 0 .9.3 1 .8l3.7 15.6c.2.7-.4 1.4-1.1 1.4h-1.9l-.7-3.4H11l-.7 3.4H8.4c-.7 0-1.3-.7-1.1-1.4L11 3.2c.1-.5.5-.8 1-.8Zm0 6.7-.8 5h1.6l-.8-5ZM5 20.2h14a1.1 1.1 0 1 1 0 2.2H5a1.1 1.1 0 1 1 0-2.2Z" />
    </svg>
  );
}

export function GlyphCatPowerWords(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M13.2 2.4c.6-.1 1.1.5.9 1.1L12.4 10h5.3c.7 0 1.1.8.7 1.4l-7.3 9.7c-.5.6-1.5.2-1.4-.6l1.2-6.9H5.6c-.7 0-1.1-.8-.7-1.4l7.3-9.4c.2-.3.6-.4 1-.4Z" />
    </svg>
  );
}

export const CATEGORY_GLYPHS: Record<string, (p: P) => ReactElement> = {
  numbers: GlyphCatNumbers,
  shapes: GlyphCatShapes,
  alphabets: GlyphCatAlphabets,
  actions: GlyphCatActions,
  emotions: GlyphCatEmotions,
  everyday: GlyphCatEveryday,
  nature: GlyphCatNature,
  animals: GlyphCatAnimals,
  food: GlyphCatFood,
  toys: GlyphCatToys,
  colors: GlyphCatColors,
  body: GlyphCatBody,
  family: GlyphCatFamily,
  kid_general: GlyphCatKidGeneral,
  us_presidents: GlyphCatPresidents,
  modern_terms: GlyphCatModern,
  world_basics: GlyphCatWorld,
  leadership: GlyphCatLeader,
  money: GlyphCatMoney,
  finance: GlyphCatFinance,
  space: GlyphCatSpace,
  universe: GlyphCatUniverse,
  physics: GlyphCatPhysics,
  top_people: GlyphCatPeople,
  inventions: GlyphCatInventions,
  landmarks: GlyphCatLandmarks,
  power_words: GlyphCatPowerWords,
};
