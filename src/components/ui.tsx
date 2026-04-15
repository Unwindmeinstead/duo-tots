import Link from "next/link";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-5 sm:py-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_28px_52px_-28px_var(--shadow)] sm:gap-5 sm:p-6">
        {children}
      </div>
    </div>
  );
}

export function TopBar({ label, title, subtitle, children }: {
  label: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <header className="rounded-[1.4rem] bg-[var(--card-alt)] p-5 sm:p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent-coral)]">{label}</p>
      <h1 className="mt-1.5 text-[clamp(1.6rem,5vw,2.4rem)] font-black leading-[1.1] tracking-tight text-[var(--ink)]">
        {title}
      </h1>
      {subtitle && <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[var(--ink-soft)]">{subtitle}</p>}
      {children}
    </header>
  );
}

export function Card({ children, className = "", accent }: {
  children: ReactNode;
  className?: string;
  accent?: "pink" | "yellow" | "green" | "teal" | "coral";
}) {
  const accentBorder = accent ? {
    pink: "border-[var(--accent-pink)]",
    yellow: "border-[var(--accent-yellow)]",
    green: "border-[var(--accent-green)]",
    teal: "border-[var(--accent-teal)]",
    coral: "border-[var(--accent-coral)]",
  }[accent] : "border-[var(--border-light)]";

  return (
    <section className={`rounded-[1.2rem] border bg-[var(--card-alt)] shadow-[0_8px_20px_-14px_var(--shadow)] ${accentBorder} ${className}`}>
      {children}
    </section>
  );
}

export function StatChip({ label, value, color }: {
  label: string;
  value: string | number;
  color: "pink" | "yellow" | "green" | "teal" | "coral";
}) {
  const colorMap = {
    pink: "bg-[var(--accent-pink)]",
    yellow: "bg-[var(--accent-yellow)]",
    green: "bg-[var(--accent-green)]",
    teal: "bg-[var(--accent-teal)]",
    coral: "bg-[var(--accent-coral)]",
  };
  return (
    <div className={`rounded-2xl ${colorMap[color]} p-4`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-black/50">{label}</p>
      <p className="mt-0.5 text-2xl font-black text-[var(--ink)]">{value}</p>
    </div>
  );
}

export function Btn({ children, className = "", onClick, disabled, variant = "dark" }: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "dark" | "soft" | "accent";
}) {
  const styles = {
    dark: "bg-[var(--accent-dark)] text-white hover:brightness-125",
    soft: "bg-[var(--card)] text-[var(--ink-soft)] hover:bg-[var(--border-light)]",
    accent: "bg-[var(--accent-teal)] text-[var(--ink)] hover:brightness-110",
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function NavLink({ href, children, variant = "dark" }: {
  href: string;
  children: ReactNode;
  variant?: "dark" | "soft" | "accent";
}) {
  const styles = {
    dark: "bg-[var(--accent-dark)] text-white hover:brightness-125",
    soft: "bg-[var(--card)] text-[var(--ink-soft)] hover:bg-[var(--border-light)]",
    accent: "bg-[var(--accent-teal)] text-[var(--ink)] hover:brightness-110",
  };
  return (
    <Link href={href} className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${styles[variant]}`}>
      {children}
    </Link>
  );
}

export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <footer className="flex flex-wrap items-center gap-2 rounded-[1.2rem] bg-[var(--card)] p-3">
      {children}
    </footer>
  );
}

export function Tag({ children, color = "pink" }: { children: ReactNode; color?: "pink" | "yellow" | "green" | "teal" | "coral" }) {
  const colorMap = {
    pink: "bg-[var(--accent-pink)]/60 text-[#6b2040]",
    yellow: "bg-[var(--accent-yellow)]/60 text-[#5c4a10]",
    green: "bg-[var(--accent-green)]/60 text-[#1a5030]",
    teal: "bg-[var(--accent-teal)]/60 text-[#1a4a44]",
    coral: "bg-[var(--accent-coral)]/60 text-[#5c2016]",
  };
  return (
    <span className={`inline-block rounded-lg px-2.5 py-1 text-xs font-bold ${colorMap[color]}`}>
      {children}
    </span>
  );
}
