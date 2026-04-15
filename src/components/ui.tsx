"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { IconHome, IconGrid, IconChart, IconBack, IconX } from "./icons";

/* ─── Tab Bar (fixed bottom, persistent across all routes) ─── */

const TABS = [
  { href: "/", label: "Home", Icon: IconHome },
  { href: "/explore", label: "Explore", Icon: IconGrid },
  { href: "/progress", label: "Stats", Icon: IconChart },
] as const;

export function TabBar() {
  const pathname = usePathname();
  const isLesson = pathname.startsWith("/lesson") || pathname.startsWith("/practice");

  if (isLesson) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-[var(--border)] bg-white"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold tracking-wide transition-colors ${
                active ? "text-[var(--duo-green)]" : "text-[var(--ink-light)]"
              }`}
            >
              <Icon size={26} />
              <span>{label}</span>
              {active && (
                <span className="mt-0.5 h-[3px] w-6 rounded-full bg-[var(--duo-green)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ─── NavBar (sticky top bar with back/close + title) ─── */

export function NavBar({ title, backHref, onClose, right }: {
  title?: string;
  backHref?: string;
  onClose?: string;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 bg-white/95 px-4 backdrop-blur-sm">
      {backHref && (
        <Link href={backHref} className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--ink-light)] transition hover:bg-[var(--surface-hover)]">
          <IconBack size={24} />
        </Link>
      )}
      {onClose && (
        <Link href={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--ink-light)] transition hover:bg-[var(--surface-hover)]">
          <IconX size={24} />
        </Link>
      )}
      {title && (
        <h1 className="flex-1 truncate text-center text-[15px] font-extrabold uppercase tracking-wide text-[var(--ink)]">
          {title}
        </h1>
      )}
      {!title && <span className="flex-1" />}
      {right ?? <span className="w-10" />}
    </header>
  );
}

/* ─── Progress Bar (Duolingo-style thin bar below NavBar) ─── */

export function ProgressBar({ value, max, color = "green" }: {
  value: number;
  max: number;
  color?: "green" | "blue" | "orange" | "purple";
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const colorMap = {
    green: "bg-[var(--duo-green)]",
    blue: "bg-[var(--duo-blue)]",
    orange: "bg-[var(--duo-orange)]",
    purple: "bg-[var(--duo-purple)]",
  };
  return (
    <div className="mx-4 h-3 overflow-hidden rounded-full bg-[var(--border)]">
      <div
        className={`progress-bar h-full rounded-full ${colorMap[color]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ─── App Shell (edge-to-edge on mobile, centered on desktop) ─── */

export function AppShell({ children, noTabs }: { children: ReactNode; noTabs?: boolean }) {
  return (
    <div className="min-h-dvh bg-white" style={noTabs ? undefined : { paddingBottom: "calc(var(--tab-height) + var(--safe-bottom))" }}>
      <div className="mx-auto w-full max-w-2xl">
        {children}
      </div>
    </div>
  );
}

/* ─── Page Header (hero section below NavBar) ─── */

export function PageHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-5 py-4 ${className}`}>
      {children}
    </div>
  );
}

/* ─── Section (padded content block) ─── */

export function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-3 ${className}`}>{children}</div>;
}

/* ─── 3D Button (Duolingo signature press effect) ─── */

export function Btn3D({ children, className = "", onClick, disabled, color = "green" }: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  color?: "green" | "blue" | "orange" | "red" | "white" | "gray";
}) {
  const styles = {
    green: "bg-[var(--duo-green)] border-b-[var(--duo-green-dark)] text-white",
    blue: "bg-[var(--duo-blue)] border-b-[var(--duo-blue-dark)] text-white",
    orange: "bg-[var(--duo-orange)] border-b-[var(--duo-orange-dark)] text-white",
    red: "bg-[var(--duo-red)] border-b-[var(--duo-red-dark)] text-white",
    white: "bg-white border-b-[var(--border-dark)] text-[var(--ink)] border-2 border-[var(--border)]",
    gray: "bg-[var(--surface-hover)] border-b-[var(--border-dark)] text-[var(--ink-light)]",
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`btn-3d rounded-2xl px-6 py-3.5 text-[15px] font-extrabold tracking-wide uppercase transition-all disabled:cursor-not-allowed disabled:opacity-40 ${styles[color]} ${className}`}
    >
      {children}
    </button>
  );
}

/* ─── Link styled as 3D Button ─── */

export function LinkBtn3D({ children, href, color = "green", className = "" }: {
  children: ReactNode;
  href: string;
  color?: "green" | "blue" | "orange" | "white" | "gray";
  className?: string;
}) {
  const styles = {
    green: "bg-[var(--duo-green)] border-b-[var(--duo-green-dark)] text-white",
    blue: "bg-[var(--duo-blue)] border-b-[var(--duo-blue-dark)] text-white",
    orange: "bg-[var(--duo-orange)] border-b-[var(--duo-orange-dark)] text-white",
    white: "bg-white border-b-[var(--border-dark)] text-[var(--ink)] border-2 border-[var(--border)]",
    gray: "bg-[var(--surface-hover)] border-b-[var(--border-dark)] text-[var(--ink-light)]",
  };
  return (
    <Link
      href={href}
      className={`btn-3d inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-[15px] font-extrabold tracking-wide uppercase ${styles[color]} ${className}`}
    >
      {children}
    </Link>
  );
}

/* ─── Stat Bubble (XP, streak, etc.) ─── */

export function StatBubble({ icon, value, label, color = "green" }: {
  icon: ReactNode;
  value: string | number;
  label: string;
  color?: "green" | "blue" | "orange" | "gold" | "purple";
}) {
  const bgMap = {
    green: "bg-[var(--duo-green-bg)]",
    blue: "bg-blue-50",
    orange: "bg-orange-50",
    gold: "bg-amber-50",
    purple: "bg-purple-50",
  };
  return (
    <div className={`flex flex-col items-center rounded-2xl ${bgMap[color]} p-4`}>
      <span className="text-2xl">{icon}</span>
      <p className="mt-1 text-2xl font-black text-[var(--ink)]">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--ink-light)]">{label}</p>
    </div>
  );
}

/* ─── Card (white with border, Duolingo style) ─── */

export function Card({ children, className = "" }: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border-2 border-[var(--border)] bg-white ${className}`}>
      {children}
    </div>
  );
}

/* ─── Option Button (quiz answer, Duolingo style) ─── */

export function OptionBtn({ children, onClick, state = "idle" }: {
  children: ReactNode;
  onClick?: () => void;
  state?: "idle" | "correct" | "wrong" | "disabled";
}) {
  const stateStyles = {
    idle: "border-2 border-[var(--border)] bg-white text-[var(--ink)] hover:bg-[var(--surface-hover)] active:border-b-0 active:mt-1",
    correct: "border-2 border-[var(--duo-green)] bg-[var(--duo-green-bg)] text-[var(--duo-green-dark)]",
    wrong: "border-2 border-[var(--duo-red)] bg-red-50 text-[var(--duo-red-dark)]",
    disabled: "border-2 border-[var(--border)] bg-[var(--surface-hover)] text-[var(--ink-light)] cursor-not-allowed",
  };
  return (
    <button
      type="button"
      onClick={state === "idle" ? onClick : undefined}
      className={`btn-3d w-full rounded-2xl border-b-4 border-b-[var(--border-dark)] px-5 py-4 text-left text-[17px] font-bold transition-all ${stateStyles[state]}`}
    >
      {children}
    </button>
  );
}
