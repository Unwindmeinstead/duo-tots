import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

type PrimaryButtonProps = {
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-10 pt-6 sm:px-6">
      <div className="dashboard-surface overflow-hidden rounded-[2.2rem] p-4 sm:p-6">{children}</div>
    </main>
  );
}

export function TopBar({ children }: { children: ReactNode }) {
  return (
    <header className="rounded-[1.6rem] border border-[#d4d0bd] bg-[#f4f3e6] p-6 shadow-[0_14px_30px_-18px_rgba(61,53,34,0.35)]">
      {children}
    </header>
  );
}

export function SurfaceCard({ children, className = "" }: SurfaceCardProps) {
  return (
    <section
      className={`rounded-[1.3rem] border border-[#d7d4c1] bg-[#f8f7ec] shadow-[0_12px_24px_-18px_rgba(61,53,34,0.35)] ${className}`}
    >
      {children}
    </section>
  );
}

export function PrimaryButton({
  children,
  className = "",
  type = "button",
  onClick,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl bg-[#101028] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function ProgressChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[#d4d0bc] bg-[#efeddc] px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <p className="text-base font-bold text-slate-900">{value}</p>
    </div>
  );
}

export function BottomNav({ children }: { children: ReactNode }) {
  return (
    <footer className="sticky bottom-4 z-10 rounded-2xl border border-[#d4d0bc] bg-[#f4f2e3] p-2 shadow-[0_18px_34px_-24px_rgba(61,53,34,0.45)]">
      <div className="flex flex-wrap gap-2">{children}</div>
    </footer>
  );
}
