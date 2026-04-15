type IconProps = { className?: string; size?: number };

const defaults = (p: IconProps) => ({
  width: p.size ?? 24,
  height: p.size ?? 24,
  className: p.className ?? "",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function IconHome(p: IconProps) {
  const d = defaults(p);
  return (
    <svg {...d}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

export function IconGrid(p: IconProps) {
  const d = defaults(p);
  return (
    <svg {...d}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function IconPlay(p: IconProps) {
  const d = defaults(p);
  return (
    <svg {...d}>
      <circle cx="12" cy="12" r="9" />
      <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconChart(p: IconProps) {
  const d = defaults(p);
  return (
    <svg {...d}>
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="6" width="4" height="15" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  );
}

export function IconBack(p: IconProps) {
  const d = defaults(p);
  return (
    <svg {...d}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function IconX(p: IconProps) {
  const d = defaults(p);
  return (
    <svg {...d}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function IconVolume(p: IconProps) {
  const d = defaults(p);
  return (
    <svg {...d}>
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" stroke="none" />
      <path d="M15.5 8.5a5 5 0 010 7" />
      <path d="M18 5a9 9 0 010 14" />
    </svg>
  );
}

export function IconSettings(p: IconProps) {
  const d = defaults(p);
  return (
    <svg {...d}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

export function IconFire(p: IconProps) {
  return (
    <svg width={p.size ?? 24} height={p.size ?? 24} viewBox="0 0 24 24" className={p.className ?? ""}>
      <path
        d="M12 2C8 7 4 10 4 14a8 8 0 0016 0c0-4-4-7-8-12z"
        fill="var(--duo-orange)"
        stroke="var(--duo-orange-dark)"
        strokeWidth="1.5"
      />
      <path
        d="M12 22a4 4 0 004-4c0-2.5-4-6-4-6s-4 3.5-4 6a4 4 0 004 4z"
        fill="var(--duo-gold)"
        stroke="var(--duo-orange-dark)"
        strokeWidth="1"
      />
    </svg>
  );
}

export function IconStar(p: IconProps) {
  return (
    <svg width={p.size ?? 24} height={p.size ?? 24} viewBox="0 0 24 24" className={p.className ?? ""}>
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill="var(--duo-gold)"
        stroke="var(--duo-orange-dark)"
        strokeWidth="1.2"
      />
    </svg>
  );
}
