"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { IconHome, IconGrid, IconChart, IconX, IconFire, IconStar, IconCheck, IconTrophy, IconArrowRight } from "./icons";

/* ─── Tab Bar ─── */

const TABS = [
  { href: "/", label: "Learn", Icon: IconHome },
  { href: "/explore", label: "Explore", Icon: IconGrid },
  { href: "/progress", label: "Stats", Icon: IconChart },
] as const;

export function TabBar() {
  const pathname = usePathname();
  const hide = pathname.startsWith("/lesson") || pathname.startsWith("/practice");
  if (hide) return null;
  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)]" style={{ paddingBottom: "var(--safe-bottom)" }}>
      <div className="mx-auto flex max-w-lg">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={`relative flex flex-1 flex-col items-center gap-1 pb-2 pt-3.5 text-[10px] font-semibold tracking-[0.06em] uppercase transition-colors ${active ? "text-[var(--accent)]" : "text-[var(--ink-tertiary)]"}`}
            >
              <Icon size={22} />
              <span>{label}</span>
              {active && <span className="absolute -top-[0.5px] left-1/2 h-[3px] w-9 -translate-x-1/2 rounded-b-full bg-[var(--coral)]" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ─── Floating Metric Pills ─── */

function MetricRing({ pct, color, size = 38, children }: { pct: number; color: string; size?: number; children: React.ReactNode }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}22`} strokeWidth="3" />
        {pct > 0 && <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3.5" strokeDasharray={`${(pct / 100) * c} ${c}`} strokeLinecap="round" className="transition-all duration-700" />}
      </svg>
      <span className="relative">{children}</span>
    </div>
  );
}

export function TopBar({ streak, xp, level, dailyDone, dailyGoal, wordsLearned, totalWords }: {
  streak?: number; xp?: number; level?: number; dailyDone?: number; dailyGoal?: number; wordsLearned?: number; totalWords?: number;
}) {
  const dailyPct = dailyGoal && dailyGoal > 0 ? Math.min(100, Math.round(((dailyDone ?? 0) / dailyGoal) * 100)) : 0;
  const levelPct = level ? Math.round(((xp ?? 0) % 50) / 50 * 100) : 0;
  const wordsPct = totalWords && totalWords > 0 ? Math.min(100, Math.round(((wordsLearned ?? 0) / totalWords) * 100)) : 0;

  const pills = [
    { pct: Math.min(100, (streak ?? 0) * 15), color: "#e76f51", icon: <IconFire size={16} />, value: `${streak ?? 0}`, sub: "streak" },
    { pct: dailyPct, color: "#00b894", icon: <IconCheck size={14} />, value: `${dailyDone ?? 0}/${dailyGoal ?? 5}`, sub: "today" },
    { pct: levelPct, color: "#6c5ce7", icon: <IconStar size={15} />, value: `Lv ${level ?? 1}`, sub: `${xp ?? 0} xp` },
    { pct: wordsPct, color: "#daa520", icon: <IconTrophy size={14} />, value: `${wordsLearned ?? 0}`, sub: "words" },
  ];

  return (
    <div className="px-4 pt-3 pb-1">
      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
        {pills.map((p, i) => (
          <Link key={i} href="/progress"
            className="surface-soft flex items-center gap-2 px-3 py-2.5 transition-all hover:scale-[1.02] active:scale-[.98]"
          >
            <MetricRing pct={p.pct} color={p.color}>
              <span style={{ color: p.color }}>{p.icon}</span>
            </MetricRing>
            <div className="pr-0.5">
              <p className="text-[13px] font-semibold leading-none tracking-tight text-[var(--ink)]">{p.value}</p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">{p.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Sub NavBar (lesson/practice) ─── */

export function NavBar({ title, onClose, right }: { title?: string; onClose?: string; right?: ReactNode }) {
  return (
    <header className="flex h-12 items-center gap-2 px-3">
      {onClose && (
        <Link href={onClose} className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-secondary)] transition-colors hover:bg-black/5 active:scale-90">
          <IconX size={18} />
        </Link>
      )}
      {title && <p className="flex-1 truncate text-center text-[14px] font-bold text-[var(--ink-secondary)]">{title}</p>}
      {!title && <span className="flex-1" />}
      {right ?? <span className="w-9" />}
    </header>
  );
}

/* ─── Progress Bar ─── */

export function ProgressBar({ value, max, color }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mx-4 h-2 overflow-hidden rounded-full bg-[var(--surface-secondary)]">
      <div className="progress-bar h-full rounded-full" style={{ width: `${pct}%`, background: color || "var(--accent)" }} />
    </div>
  );
}

/* ─── App Shell ─── */

export function AppShell({ children, noTabs }: { children: ReactNode; noTabs?: boolean }) {
  return (
    <div
      className="min-h-dvh bg-[var(--bg)]"
      style={{
        backgroundImage: "radial-gradient(circle at top, rgba(255,255,255,.42), transparent 34%), linear-gradient(180deg, rgba(255,255,255,.2), transparent 28%)",
        paddingBottom: noTabs ? undefined : "calc(var(--tab-height) + var(--safe-bottom))",
      }}
    >
      <div className="mx-auto w-full max-w-2xl">{children}</div>
    </div>
  );
}

/* ─── Sections ─── */

export function PageHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 pb-3 pt-5 ${className}`}>{children}</div>;
}

export function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-3 ${className}`}>{children}</div>;
}

export function PageIntro({ eyebrow, title, subtitle, className = "", actions }: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <div className={`px-5 pt-4 pb-2 ${className}`}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-overline">{eyebrow}</p>
          <h1 className="text-headline mt-1">{title}</h1>
          {subtitle && <p className="text-subtitle mt-1.5 max-w-[34rem]">{subtitle}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}

export function StageBadge({ label, color, meta }: { label: string; color: string; meta?: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="flex h-7 items-center rounded-lg px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-white" style={{ background: color }}>
        {label}
      </span>
      {meta && <span className="text-[12px] font-medium text-[var(--ink-tertiary)]">{meta}</span>}
    </div>
  );
}

export function SpotlightCard({
  eyebrow,
  title,
  description,
  accent,
  children,
  className = "",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  accent: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[var(--radius-2xl)] border px-5 py-5 text-white ${className}`}
      style={{
        borderColor: `${accent}26`,
        background: `linear-gradient(145deg, ${accent} 0%, color-mix(in srgb, ${accent} 74%, #101010) 100%)`,
        boxShadow: `0 18px 40px ${accent}24`,
      }}
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.24),transparent_68%)]" />
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/8 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-black/10 blur-2xl" />
      <div className="relative">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">{eyebrow}</p>
        <h2 className="mt-2 text-[1.5rem] font-black leading-tight tracking-[-0.03em]">{title}</h2>
        {description && <p className="mt-2 max-w-[34rem] text-[13px] font-medium leading-relaxed text-white/76">{description}</p>}
        {children}
      </div>
    </div>
  );
}

export function MiniStat({
  label,
  value,
  tone = "light",
}: {
  label: string;
  value: string | number;
  tone?: "light" | "dark";
}) {
  return (
    <div className={`rounded-[var(--radius-xl)] px-3.5 py-3 ${tone === "dark" ? "bg-white/12 text-white" : "bg-[var(--surface)] text-[var(--ink)]"}`}>
      <p className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${tone === "dark" ? "text-white/62" : "text-[var(--ink-tertiary)]"}`}>{label}</p>
      <p className="mt-1 text-[1.1rem] font-black leading-none tracking-[-0.03em]">{value}</p>
    </div>
  );
}

export function TopicRowCard({
  href,
  color,
  label,
  meta,
  icon,
  mastery,
}: {
  href: string;
  color: string;
  label: string;
  meta: string;
  icon: ReactNode;
  mastery: number;
}) {
  return (
    <Link href={href} className="surface-soft group flex items-center gap-4 p-4 transition-all hover:scale-[1.01] active:scale-[.98]">
      <MasteryRing pct={mastery} color={color} size={58}>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}14`, color }}>
          {icon}
        </span>
      </MasteryRing>
      <div className="min-w-0 flex-1">
        <p className="text-title">{label}</p>
        <p className="mt-0.5 text-caption font-medium">{meta}</p>
      </div>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--ink-tertiary)] transition-all group-hover:bg-[var(--surface-secondary)] group-hover:text-[var(--ink)]">
        <IconArrowRight size={16} />
      </span>
    </Link>
  );
}

export function TopicTile({
  href,
  color,
  label,
  icon,
  mastery,
}: {
  href: string;
  color: string;
  label: string;
  icon: ReactNode;
  mastery: number;
}) {
  return (
    <Link href={href} className="surface-soft group flex flex-col items-center gap-3 p-4 text-center transition-all hover:scale-[1.03] active:scale-[.97]">
      <MasteryRing pct={mastery} color={color} size={56}>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}14`, color }}>
          {icon}
        </span>
      </MasteryRing>
      <div>
        <p className="text-[12px] font-semibold leading-tight tracking-tight text-[var(--ink)]">{label}</p>
        <p className="mt-1 text-[10px] font-semibold tabular-nums" style={{ color: mastery > 0 ? color : "var(--ink-tertiary)" }}>
          {mastery > 0 ? `${mastery}% mastered` : "Start"}
        </p>
      </div>
    </Link>
  );
}

/* ─── Primary Button ─── */

export function BtnPrimary({ children, className = "", onClick, disabled, color }: {
  children: ReactNode; className?: string; onClick?: () => void; disabled?: boolean; color?: string;
}) {
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      className={`btn-primary flex items-center justify-center rounded-[var(--radius-xl)] px-6 py-3.5 text-[15px] font-semibold tracking-tight text-white outline-none ring-offset-2 ring-offset-[var(--bg)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      style={{ background: color || "var(--accent)", boxShadow: "var(--shadow-sm)" }}
    >{children}</button>
  );
}

/* ─── Surface Button ─── */

export function BtnSurface({ children, className = "", onClick, disabled }: {
  children: ReactNode; className?: string; onClick?: () => void; disabled?: boolean;
}) {
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      className={`btn-surface flex items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-solid)] bg-[var(--surface)] px-6 py-3.5 text-[15px] font-semibold tracking-tight text-[var(--ink)] outline-none ring-offset-2 ring-offset-[var(--bg)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      style={{ boxShadow: "var(--shadow-xs)" }}
    >{children}</button>
  );
}

/* ─── Link Button ─── */

export function LinkBtn({ children, href, color, className = "" }: {
  children: ReactNode; href: string; color?: string; className?: string;
}) {
  return (
    <Link href={href}
      className={`btn-primary inline-flex items-center justify-center rounded-[var(--radius-xl)] px-6 py-3.5 text-[15px] font-semibold tracking-tight text-white ${className}`}
      style={{ background: color || "var(--accent)", boxShadow: "var(--shadow-sm)" }}
    >{children}</Link>
  );
}

/* ─── Stat Card (colored) ─── */

export function StatCard({ icon, value, label, bg, dark }: { icon: ReactNode; value: string | number; label: string; bg?: string; dark?: boolean }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-xl)] border p-5" style={{ background: bg || "var(--surface)", borderColor: dark ? "transparent" : "var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <span className={dark ? "text-white/70" : "text-[var(--ink-tertiary)]"}>{icon}</span>
      <p className={`mt-2 text-[26px] font-extrabold tracking-tight tabular-nums ${dark ? "text-white" : "text-[var(--ink)]"}`}>{value}</p>
      <p className={`mt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${dark ? "text-white/55" : "text-[var(--ink-tertiary)]"}`}>{label}</p>
    </div>
  );
}

/* ─── Card ─── */

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`surface-soft overflow-hidden ${className}`}>{children}</div>;
}

/* ─── Option Button (quiz) ─── */

export function OptionBtn({ children, onClick, state = "idle", className = "" }: {
  children: ReactNode; onClick?: () => void; state?: "idle" | "correct" | "wrong" | "disabled"; className?: string;
}) {
  const s: Record<string, string> = {
    idle: "border-[var(--border-solid)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--ink-muted)] hover:bg-[var(--surface-secondary)] active:scale-[.99]",
    correct: "border-[var(--teal)] bg-[var(--teal-bg)] text-[var(--green-dark)]",
    wrong: "border-[var(--coral)] bg-[var(--coral-bg)] text-[var(--coral-dark)]",
    disabled: "border-[var(--border-solid)] bg-[var(--surface-secondary)] text-[var(--ink-tertiary)] cursor-not-allowed",
  };
  return (
    <button type="button" onClick={state === "idle" ? onClick : undefined}
      className={`btn-surface w-full rounded-[var(--radius-xl)] border-2 px-5 py-4 text-left text-[16px] font-semibold tracking-tight whitespace-normal break-words transition-all ${s[state]} ${className}`.trim()}
      style={{ boxShadow: state === "idle" ? "var(--shadow-xs)" : undefined }}
    >{children}</button>
  );
}

/* ─── Mastery Ring ─── */

export function MasteryRing({ pct, color, size = 60, children }: {
  pct: number; color: string; size?: number; children: ReactNode;
}) {
  const sw = size > 48 ? 4 : 3;
  const r = (size - sw * 2) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}18`} strokeWidth={sw} />
        {pct > 0 && (
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
            strokeDasharray={`${(pct / 100) * c} ${c}`} strokeLinecap="round" className="transition-all duration-700" />
        )}
      </svg>
      <span className="relative">{children}</span>
    </div>
  );
}
