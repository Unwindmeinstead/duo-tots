import type { ReactElement } from "react";

type P = { className?: string; size?: number };

const d = (p: P) => ({
  width: p.size ?? 24, height: p.size ?? 24, className: p.className ?? "",
  viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

/** Category grid icons — thinner stroke, geometric, readable at 20–28px */
const cat = (p: P) => ({
  width: p.size ?? 24, height: p.size ?? 24, className: p.className ?? "",
  viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

/* ─── Navigation ─── */

export function IconHome(p: P) { return <svg {...d(p)}><path d="M3 10.5L12 3l9 7.5V20a2 2 0 01-2 2H5a2 2 0 01-2-2V10.5z" /><path d="M9 22V12h6v10" /></svg>; }
export function IconPlan(p: P) { return <svg {...d(p)}><path d="M4 6.5A2.5 2.5 0 016.5 4H12v16H6.5A2.5 2.5 0 004 22V6.5z" /><path d="M20 6.5A2.5 2.5 0 0017.5 4H12v16h5.5A2.5 2.5 0 0120 22V6.5z" /><path d="M8 8h2M8 12h2M14 10h2M14 14h2" /></svg>; }
export function IconGrid(p: P) { return <svg {...d(p)}><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></svg>; }
export function IconChart(p: P) { return <svg {...d(p)}><path d="M3 3v18h18" /><path d="M7 17V13" /><path d="M11 17V9" /><path d="M15 17V5" /><path d="M19 17V11" /></svg>; }
export function IconBack(p: P) { return <svg {...d(p)}><path d="M15 18l-6-6 6-6" /></svg>; }
export function IconX(p: P) { return <svg {...d(p)}><path d="M18 6L6 18M6 6l12 12" /></svg>; }
export function IconSettings(p: P) { return <svg {...d(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>; }
export function IconCheck(p: P) { return <svg {...d(p)}><path d="M20 6L9 17l-5-5" /></svg>; }
export function IconArrowRight(p: P) { return <svg {...d(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>; }

/* ─── Actions ─── */

export function IconVolume(p: P) { return <svg {...d(p)}><polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" stroke="none" /><path d="M15.5 8.5a5 5 0 010 7" /><path d="M19 5a10 10 0 010 14" /></svg>; }
export function IconPlay(p: P) { return <svg {...d(p)}><circle cx="12" cy="12" r="10" /><polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" /></svg>; }

/* ─── Stats ─── */

export function IconFire(p: P) {
  return (
    <svg width={p.size ?? 24} height={p.size ?? 24} viewBox="0 0 24 24" className={p.className ?? ""} fill="none">
      <path d="M12 2C8 7 4 10 4 14a8 8 0 0016 0c0-4-4-7-8-12z" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 22a4 4 0 004-4c0-2.5-4-6-4-6s-4 3.5-4 6a4 4 0 004 4z" fill="currentColor" opacity=".3" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function IconStar(p: P) {
  return (
    <svg width={p.size ?? 24} height={p.size ?? 24} viewBox="0 0 24 24" className={p.className ?? ""} fill="none">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function IconTrophy(p: P) { return <svg {...d(p)}><path d="M6 9H4a2 2 0 01-2-2V5h4" /><path d="M18 9h2a2 2 0 002-2V5h-4" /><path d="M4 5h16v4a6 6 0 01-6 6h-4a6 6 0 01-6-6V5z" /><path d="M9 21h6" /><path d="M12 15v6" /></svg>; }

/* ─── Category icons (clean geometric outlines) ─── */

export function IconCatAnimals(p: P) {
  return (
    <svg {...cat(p)}>
      <path d="M12 19.25c-2.75 0-5-1.85-5-4.25 0-2.1 2.15-3.75 5-3.75s5 1.65 5 3.75c0 2.4-2.25 4.25-5 4.25z" />
      <circle cx="8.25" cy="9.25" r="1.65" />
      <circle cx="12" cy="7.25" r="1.65" />
      <circle cx="15.75" cy="9.25" r="1.65" />
    </svg>
  );
}

export function IconCatFood(p: P) {
  return (
    <svg {...cat(p)}>
      <path d="M5 11h14" />
      <path d="M6 11c0 3.75 2.4 6.25 6 6.25s6-2.5 6-6.25" />
    </svg>
  );
}

export function IconCatToys(p: P) {
  return (
    <svg {...cat(p)}>
      <rect x="5" y="8" width="14" height="11" rx="1.5" />
      <path d="M12 8V5.5" />
      <path d="M9.5 6.5a2.5 2.5 0 015 0" />
      <path d="M9 13h6" />
    </svg>
  );
}

export function IconCatColors(p: P) {
  return (
    <svg {...cat(p)}>
      <circle cx="12" cy="12" r="7.75" />
      <circle cx="12" cy="9.25" r="1.4" />
      <circle cx="8.85" cy="14.2" r="1.4" />
      <circle cx="15.15" cy="14.2" r="1.4" />
    </svg>
  );
}

export function IconCatBody(p: P) {
  return (
    <svg {...cat(p)}>
      <circle cx="12" cy="6.5" r="2.5" />
      <path d="M12 9v7.5" />
      <path d="M8 13h8" />
      <path d="M9.5 20.5L12 15l2.5 5.5" />
    </svg>
  );
}

export function IconCatFamily(p: P) {
  return (
    <svg {...cat(p)}>
      <circle cx="8.75" cy="7.75" r="2.65" />
      <path d="M3.5 21v-2a3.75 3.75 0 013.75-3.75h1.5" />
      <circle cx="15.25" cy="7.75" r="2.65" />
      <path d="M20.5 21v-2a3.75 3.75 0 00-3.75-3.75h-1.5" />
    </svg>
  );
}

export function IconCatKidGeneral(p: P) {
  return (
    <svg {...cat(p)}>
      <path d="M5 4.5h6.5a2.5 2.5 0 012.5 2.5v12a2.5 2.5 0 00-2.5-2.5H5V4.5z" />
      <path d="M19 4.5h-6.5a2.5 2.5 0 00-2.5 2.5v12a2.5 2.5 0 012.5-2.5H19V4.5z" />
      <path d="M12 7v10" />
      <path d="M16.5 6.5l1.25 1.25M17.75 6.5L16.5 7.75" />
    </svg>
  );
}

export function IconCatPresidents(p: P) {
  return (
    <svg {...cat(p)}>
      <path d="M5 21V10l7-5 7 5v11" />
      <path d="M4 21h16" />
      <path d="M9 21v-5h6v5" />
      <path d="M10 14h4" />
    </svg>
  );
}

export function IconCatModern(p: P) {
  return (
    <svg {...cat(p)}>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <line x1="12" y1="17" x2="12" y2="17" />
      <path d="M9 7h6" />
    </svg>
  );
}

export function IconCatWorld(p: P) {
  return (
    <svg {...cat(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c3 2.5 5 6 5 9s-2 6.5-5 9c-3-2.5-5-6-5-9s2-6.5 5-9z" />
    </svg>
  );
}

export function IconCatLeader(p: P) {
  return (
    <svg {...cat(p)}>
      <path d="M5 9l2.5-2 2 3.5L12 6l2.5 4.5L17 7l2 2v10H5V9z" />
      <path d="M5 19h14" />
    </svg>
  );
}

export function IconCatMoney(p: P) {
  return (
    <svg {...cat(p)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 6v12M16.5 8H10a2.5 2.5 0 000 5h4a2.5 2.5 0 010 5H7.5" />
    </svg>
  );
}

export function IconCatFinance(p: P) {
  return (
    <svg {...cat(p)}>
      <path d="M4 20V4h16v16H4z" />
      <path d="M7 16l3.5-3.5L14 16l3-4" />
      <path d="M7 8h4M7 11h2" />
    </svg>
  );
}

export function IconCatSpace(p: P) {
  return (
    <svg {...cat(p)}>
      <path d="M12 4l4 10h4l-8 7-8-7h4l4-10z" />
      <path d="M12 14v4" />
    </svg>
  );
}

export function IconCatUniverse(p: P) {
  return (
    <svg {...cat(p)}>
      <circle cx="12" cy="12" r="2.25" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
    </svg>
  );
}

export function IconCatPhysics(p: P) {
  return (
    <svg {...cat(p)}>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M18.5 5.5l-2 2M5.5 18.5l2-2" />
    </svg>
  );
}

export function IconCatPeople(p: P) {
  return (
    <svg {...cat(p)}>
      <circle cx="9" cy="8" r="2.75" />
      <circle cx="16" cy="8" r="2.25" />
      <path d="M4 20v-1.5a4 4 0 014-4h2" />
      <path d="M14 20v-1.5a3 3 0 013-3h1" />
    </svg>
  );
}

export function IconCatActions(p: P) {
  return (
    <svg {...cat(p)}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  );
}

export function IconCatEmotions(p: P) {
  return (
    <svg {...cat(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14.5s1.25 2 3.5 2 3.5-2 3.5-2" />
      <circle cx="9" cy="9.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCatShapes(p: P) {
  return (
    <svg {...cat(p)}>
      <path d="M12 5.5L19.5 18.5H4.5L12 5.5z" />
    </svg>
  );
}

export function IconCatNumbers(p: P) {
  return (
    <svg {...cat(p)}>
      <path d="M7.75 7v9.5M5.5 16.5h4.5" />
      <ellipse cx="16.25" cy="11.75" rx="3" ry="4.85" />
    </svg>
  );
}

export function IconCatEveryday(p: P) {
  return (
    <svg {...cat(p)}>
      <path d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 19v-8.5z" />
      <path d="M9.5 21V12.5h5V21" />
    </svg>
  );
}

export function IconCatNature(p: P) {
  return (
    <svg {...cat(p)}>
      <path d="M12 22C12 22 6 17 6 11a6 6 0 1112 0c0 6-6 11-6 11z" />
      <path d="M12 22V11" />
    </svg>
  );
}

export function IconCatInventions(p: P) {
  return (
    <svg {...cat(p)}>
      <path d="M9 17h6" />
      <path d="M10 21h4" />
      <path d="M12 4a5 5 0 015 5c0 2-1 3.5-2 4.5V15H9v-1.5C8 12.5 7 11 7 9a5 5 0 015-5z" />
    </svg>
  );
}

export function IconCatLandmarks(p: P) {
  return (
    <svg {...cat(p)}>
      <path d="M4 21h16" />
      <path d="M7 21V11h2.5v10M11 21V8h2v13M15.5 21V11H18v10" />
      <path d="M7 11V9l5-4 5 4v2" />
    </svg>
  );
}

/* ─── Map category id → icon component ─── */

export const CATEGORY_ICONS: Record<string, (p: P) => ReactElement> = {
  actions: IconCatActions,
  emotions: IconCatEmotions,
  shapes: IconCatShapes,
  numbers: IconCatNumbers,
  everyday: IconCatEveryday,
  nature: IconCatNature,
  animals: IconCatAnimals,
  food: IconCatFood,
  toys: IconCatToys,
  colors: IconCatColors,
  body: IconCatBody,
  family: IconCatFamily,
  kid_general: IconCatKidGeneral,
  us_presidents: IconCatPresidents,
  modern_terms: IconCatModern,
  world_basics: IconCatWorld,
  leadership: IconCatLeader,
  money: IconCatMoney,
  finance: IconCatFinance,
  space: IconCatSpace,
  universe: IconCatUniverse,
  physics: IconCatPhysics,
  top_people: IconCatPeople,
  inventions: IconCatInventions,
  landmarks: IconCatLandmarks,
};
