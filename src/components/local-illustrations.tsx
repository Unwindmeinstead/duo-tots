import type { ReactNode } from "react";

type LocalArt = {
  background: string;
  frame: string;
  shadow: string;
  art: ReactNode;
};

const baseFrame = "rgba(255,255,255,0.78)";

function shine(id: string) {
  return (
    <>
      <radialGradient id={`${id}-glow`} cx="50%" cy="35%" r="70%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
        <stop offset="45%" stopColor="rgba(255,255,255,0.65)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
      <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#1f2937" floodOpacity="0.16" />
      </filter>
    </>
  );
}

function stage(fill = "rgba(15,23,42,0.12)") {
  return <ellipse cx="100" cy="168" rx="54" ry="15" fill={fill} />;
}

function scene(children: ReactNode, accent: string) {
  const id = accent.replace(/[^a-z0-9]/gi, "").toLowerCase() || "art";
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <defs>{shine(id)}</defs>
      <circle cx="100" cy="96" r="76" fill={`url(#${id}-glow)`} />
      {children}
    </svg>
  );
}

const EVERYDAY_ART: Record<string, LocalArt> = {
  chair: {
    background: "linear-gradient(180deg, #fff8ef 0%, #fde7c8 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(194, 120, 39, 0.16)",
    art: scene(
      <>
        {stage("rgba(180,83,9,0.16)")}
        <g filter="url(#c67827-shadow)">
          <rect x="64" y="54" width="56" height="52" rx="14" fill="#c97316" />
          <rect x="58" y="42" width="68" height="18" rx="9" fill="#ea580c" />
          <rect x="74" y="104" width="12" height="48" rx="6" fill="#7c2d12" />
          <rect x="114" y="104" width="12" height="48" rx="6" fill="#7c2d12" />
          <rect x="60" y="76" width="12" height="74" rx="6" fill="#9a3412" />
          <rect x="128" y="76" width="12" height="74" rx="6" fill="#9a3412" />
        </g>
      </>,
      "#c67827",
    ),
  },
  table: {
    background: "linear-gradient(180deg, #fff7ed 0%, #fee2c5 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(180, 83, 9, 0.15)",
    art: scene(
      <>
        {stage("rgba(180,83,9,0.15)")}
        <g filter="url(#b45309-shadow)">
          <rect x="44" y="62" width="112" height="20" rx="10" fill="#d97706" />
          <rect x="54" y="82" width="14" height="68" rx="7" fill="#92400e" />
          <rect x="132" y="82" width="14" height="68" rx="7" fill="#92400e" />
          <rect x="72" y="82" width="14" height="68" rx="7" fill="#b45309" />
          <rect x="114" y="82" width="14" height="68" rx="7" fill="#b45309" />
        </g>
      </>,
      "#b45309",
    ),
  },
  door: {
    background: "linear-gradient(180deg, #eef2ff 0%, #dbeafe 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(59, 130, 246, 0.14)",
    art: scene(
      <>
        {stage("rgba(30,64,175,0.14)")}
        <g filter="url(#3b82f6-shadow)">
          <rect x="56" y="34" width="88" height="128" rx="18" fill="#1d4ed8" />
          <rect x="68" y="48" width="64" height="100" rx="12" fill="#60a5fa" />
          <rect x="80" y="60" width="16" height="34" rx="6" fill="#bfdbfe" />
          <rect x="104" y="60" width="16" height="34" rx="6" fill="#bfdbfe" />
          <rect x="80" y="102" width="16" height="34" rx="6" fill="#bfdbfe" />
          <rect x="104" y="102" width="16" height="34" rx="6" fill="#bfdbfe" />
          <circle cx="124" cy="98" r="5" fill="#fde68a" />
        </g>
      </>,
      "#3b82f6",
    ),
  },
  window: {
    background: "linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(96, 165, 250, 0.16)",
    art: scene(
      <>
        {stage("rgba(30,64,175,0.12)")}
        <g filter="url(#60a5fa-shadow)">
          <rect x="46" y="44" width="108" height="108" rx="22" fill="#93c5fd" />
          <rect x="58" y="56" width="84" height="84" rx="14" fill="#eff6ff" />
          <path d="M100 56v84M58 98h84" stroke="#60a5fa" strokeWidth="10" strokeLinecap="round" />
          <circle cx="82" cy="80" r="10" fill="#fcd34d" />
          <circle cx="114" cy="84" r="11" fill="#ffffff" />
          <circle cx="126" cy="84" r="9" fill="#ffffff" />
          <circle cx="118" cy="76" r="8" fill="#ffffff" />
        </g>
      </>,
      "#60a5fa",
    ),
  },
  bed: {
    background: "linear-gradient(180deg, #fff1f2 0%, #ffe4e6 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(244, 63, 94, 0.16)",
    art: scene(
      <>
        {stage("rgba(190,24,93,0.14)")}
        <g filter="url(#f43f5e-shadow)">
          <rect x="42" y="98" width="118" height="32" rx="16" fill="#fb7185" />
          <rect x="52" y="74" width="30" height="30" rx="12" fill="#fbcfe8" />
          <rect x="84" y="76" width="60" height="24" rx="12" fill="#ffffff" />
          <rect x="44" y="130" width="10" height="26" rx="5" fill="#9f1239" />
          <rect x="148" y="130" width="10" height="26" rx="5" fill="#9f1239" />
          <rect x="36" y="70" width="12" height="44" rx="6" fill="#be123c" />
        </g>
      </>,
      "#f43f5e",
    ),
  },
  clock: {
    background: "linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(251, 146, 60, 0.15)",
    art: scene(
      <>
        {stage("rgba(194,65,12,0.12)")}
        <g filter="url(#fb923c-shadow)">
          <circle cx="100" cy="96" r="48" fill="#fed7aa" />
          <circle cx="100" cy="96" r="38" fill="#fff7ed" />
          <path d="M100 96V74" stroke="#1f2937" strokeWidth="8" strokeLinecap="round" />
          <path d="M100 96L118 108" stroke="#1f2937" strokeWidth="8" strokeLinecap="round" />
          <circle cx="100" cy="96" r="6" fill="#1f2937" />
          <path d="M100 48v-8M100 152v-8M52 96h-8M156 96h-8" stroke="#ea580c" strokeWidth="6" strokeLinecap="round" />
        </g>
      </>,
      "#fb923c",
    ),
  },
  lamp: {
    background: "linear-gradient(180deg, #fefce8 0%, #fef3c7 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(234, 179, 8, 0.18)",
    art: scene(
      <>
        {stage("rgba(202,138,4,0.15)")}
        <g filter="url(#eab308-shadow)">
          <path d="M62 82h76L122 40H78z" fill="#facc15" />
          <rect x="94" y="82" width="12" height="46" rx="6" fill="#9ca3af" />
          <path d="M76 142h48l-10 10H86z" fill="#6b7280" />
          <circle cx="100" cy="88" r="10" fill="#fff7ae" opacity="0.9" />
        </g>
      </>,
      "#eab308",
    ),
  },
  cup: {
    background: "linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(124, 58, 237, 0.14)",
    art: scene(
      <>
        {stage("rgba(109,40,217,0.12)")}
        <g filter="url(#7c3aed-shadow)">
          <path d="M66 62h52v40c0 18-10 32-26 32s-26-14-26-32z" fill="#8b5cf6" />
          <path d="M118 70h12c10 0 16 7 16 15c0 10-8 18-18 18h-8" fill="none" stroke="#7c3aed" strokeWidth="10" strokeLinecap="round" />
          <path d="M78 52c0 8-8 10-8 18m22-18c0 8-8 10-8 18m22-18c0 8-8 10-8 18" stroke="#c4b5fd" strokeWidth="6" strokeLinecap="round" opacity="0.95" />
        </g>
      </>,
      "#7c3aed",
    ),
  },
  plate: {
    background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(71, 85, 105, 0.14)",
    art: scene(
      <>
        {stage("rgba(71,85,105,0.12)")}
        <g filter="url(#475569-shadow)">
          <circle cx="100" cy="98" r="50" fill="#e2e8f0" />
          <circle cx="100" cy="98" r="34" fill="#ffffff" />
          <circle cx="100" cy="98" r="46" fill="none" stroke="#cbd5e1" strokeWidth="8" />
        </g>
      </>,
      "#475569",
    ),
  },
  spoon: {
    background: "linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(148, 163, 184, 0.16)",
    art: scene(
      <>
        {stage("rgba(71,85,105,0.12)")}
        <g filter="url(#94a3b8-shadow)" transform="rotate(-28 100 100)">
          <ellipse cx="88" cy="82" rx="24" ry="18" fill="#cbd5e1" />
          <rect x="94" y="82" width="12" height="64" rx="6" fill="#94a3b8" />
          <ellipse cx="88" cy="82" rx="16" ry="10" fill="#e2e8f0" opacity="0.9" />
        </g>
      </>,
      "#94a3b8",
    ),
  },
  shoe: {
    background: "linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(37, 99, 235, 0.16)",
    art: scene(
      <>
        {stage("rgba(29,78,216,0.15)")}
        <g filter="url(#2563eb-shadow)">
          <path d="M46 118c20 0 22-26 38-26c10 0 18 14 24 18c10 7 24 5 36 16v12H46c-8 0-14-6-14-14s6-6 14-6" fill="#2563eb" />
          <path d="M90 94c4 6 10 13 18 17" stroke="#dbeafe" strokeWidth="7" strokeLinecap="round" />
          <path d="M78 100h18M72 110h20M66 120h20" stroke="#bfdbfe" strokeWidth="6" strokeLinecap="round" />
          <path d="M46 136h98" stroke="#1e3a8a" strokeWidth="8" strokeLinecap="round" />
        </g>
      </>,
      "#2563eb",
    ),
  },
  shirt: {
    background: "linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(14, 165, 233, 0.16)",
    art: scene(
      <>
        {stage("rgba(14,116,144,0.12)")}
        <g filter="url(#0ea5e9-shadow)">
          <path d="M78 52l22 12l22-12l18 20l-16 12v52H76V84L60 72z" fill="#38bdf8" />
          <path d="M88 58l12 12l12-12" fill="#ffffff" />
          <path d="M90 84h20M90 100h20M90 116h20" stroke="#e0f2fe" strokeWidth="8" strokeLinecap="round" />
        </g>
      </>,
      "#0ea5e9",
    ),
  },
  hat: {
    background: "linear-gradient(180deg, #fff7ed 0%, #fed7aa 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(234, 88, 12, 0.16)",
    art: scene(
      <>
        {stage("rgba(154,52,18,0.15)")}
        <g filter="url(#ea580c-shadow)">
          <path d="M64 104c0-22 16-38 36-38s36 16 36 38" fill="#fb923c" />
          <path d="M44 112c12-8 34-12 56-12s44 4 56 12c-7 10-27 16-56 16s-49-6-56-16" fill="#ea580c" />
          <path d="M76 90h48" stroke="#fdba74" strokeWidth="8" strokeLinecap="round" />
        </g>
      </>,
      "#ea580c",
    ),
  },
  bag: {
    background: "linear-gradient(180deg, #fef2f2 0%, #fecaca 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(220, 38, 38, 0.14)",
    art: scene(
      <>
        {stage("rgba(185,28,28,0.13)")}
        <g filter="url(#dc2626-shadow)">
          <rect x="56" y="70" width="88" height="76" rx="18" fill="#ef4444" />
          <path d="M78 76c0-16 10-28 22-28s22 12 22 28" fill="none" stroke="#991b1b" strokeWidth="10" strokeLinecap="round" />
          <rect x="70" y="86" width="60" height="40" rx="10" fill="#fca5a5" opacity="0.72" />
        </g>
      </>,
      "#dc2626",
    ),
  },
  key: {
    background: "linear-gradient(180deg, #fefce8 0%, #fde68a 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(217, 119, 6, 0.16)",
    art: scene(
      <>
        {stage("rgba(180,83,9,0.12)")}
        <g filter="url(#d97706-shadow)" transform="rotate(-18 100 100)">
          <circle cx="86" cy="90" r="22" fill="#f59e0b" />
          <circle cx="86" cy="90" r="10" fill="#fff7ed" />
          <rect x="100" y="84" width="46" height="12" rx="6" fill="#d97706" />
          <rect x="126" y="96" width="10" height="14" rx="2" fill="#d97706" />
          <rect x="140" y="96" width="10" height="10" rx="2" fill="#d97706" />
        </g>
      </>,
      "#d97706",
    ),
  },
  telephone: {
    background: "linear-gradient(180deg, #ecfeff 0%, #bae6fd 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(2, 132, 199, 0.18)",
    art: scene(
      <>
        {stage("rgba(12,74,110,0.14)")}
        <g filter="url(#0284c7-shadow)">
          <rect x="68" y="82" width="64" height="56" rx="18" fill="#0ea5e9" />
          <rect x="84" y="96" width="32" height="28" rx="10" fill="#e0f2fe" opacity="0.85" />
          <path d="M70 88c0-22 14-40 30-40s30 18 30 40" fill="none" stroke="#0369a1" strokeWidth="12" strokeLinecap="round" />
          <circle cx="84" cy="108" r="3" fill="#0369a1" />
          <circle cx="100" cy="108" r="3" fill="#0369a1" />
          <circle cx="116" cy="108" r="3" fill="#0369a1" />
        </g>
      </>,
      "#0284c7",
    ),
  },
  mirror: {
    background: "linear-gradient(180deg, #f5f3ff 0%, #ddd6fe 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(109, 40, 217, 0.14)",
    art: scene(
      <>
        {stage("rgba(91,33,182,0.12)")}
        <g filter="url(#6d28d9-shadow)">
          <rect x="60" y="44" width="80" height="96" rx="30" fill="#8b5cf6" />
          <rect x="70" y="54" width="60" height="76" rx="24" fill="#dbeafe" />
          <path d="M82 66c10-10 24-12 36-6" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
          <rect x="90" y="140" width="20" height="22" rx="8" fill="#7c3aed" />
        </g>
      </>,
      "#6d28d9",
    ),
  },
  soap: {
    background: "linear-gradient(180deg, #ecfeff 0%, #ccfbf1 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(20, 184, 166, 0.16)",
    art: scene(
      <>
        {stage("rgba(13,148,136,0.12)")}
        <g filter="url(#14b8a6-shadow)">
          <rect x="58" y="78" width="84" height="50" rx="24" fill="#5eead4" />
          <rect x="70" y="88" width="60" height="30" rx="15" fill="#ccfbf1" opacity="0.75" />
          <circle cx="74" cy="72" r="10" fill="#ffffff" opacity="0.9" />
          <circle cx="92" cy="60" r="8" fill="#ffffff" opacity="0.85" />
          <circle cx="108" cy="68" r="6" fill="#ffffff" opacity="0.8" />
        </g>
      </>,
      "#14b8a6",
    ),
  },
  towel: {
    background: "linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(249, 115, 22, 0.16)",
    art: scene(
      <>
        {stage("rgba(194,65,12,0.12)")}
        <g filter="url(#f97316-shadow)" transform="rotate(-10 100 100)">
          <rect x="56" y="60" width="88" height="82" rx="18" fill="#fb923c" />
          <path d="M72 72v58M92 72v58M112 72v58M132 72v58" stroke="#ffedd5" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
        </g>
      </>,
      "#f97316",
    ),
  },
  hairbrush: {
    background: "linear-gradient(180deg, #fff7ed 0%, #fed7aa 100%)",
    frame: baseFrame,
    shadow: "0 24px 40px rgba(124, 45, 18, 0.16)",
    art: scene(
      <>
        {stage("rgba(120,53,15,0.12)")}
        <g filter="url(#7c2d12-shadow)" transform="rotate(28 100 104)">
          <rect x="78" y="64" width="44" height="60" rx="18" fill="#f59e0b" />
          <rect x="92" y="118" width="16" height="42" rx="8" fill="#92400e" />
          <path d="M84 64v-18M92 64V44M100 64V42M108 64V44M116 64v-18" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
          <rect x="88" y="80" width="24" height="24" rx="10" fill="#fde68a" opacity="0.72" />
        </g>
      </>,
      "#7c2d12",
    ),
  },
};

export function getLocalIllustration(categoryId: string, assetKey: string): LocalArt | null {
  if (categoryId === "everyday") return EVERYDAY_ART[assetKey] ?? null;
  return null;
}
