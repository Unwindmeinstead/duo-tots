import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-3 py-8">
      <div className="flex flex-col items-center gap-5 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-10 text-center shadow-[0_28px_52px_-28px_var(--shadow)]">
        <span className="text-6xl">📴</span>
        <h1 className="text-3xl font-black tracking-tight text-[var(--ink)]">You&apos;re Offline</h1>
        <p className="max-w-xs text-[15px] leading-relaxed text-[var(--ink-soft)]">
          DuoTots saved this page for you. Reconnect and pick up right where you left off.
        </p>
        <Link
          href="/"
          className="rounded-xl bg-[var(--accent-dark)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-125"
        >
          Try Home Again
        </Link>
      </div>
    </div>
  );
}
