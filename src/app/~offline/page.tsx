import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white p-6">
      <div className="flex max-w-sm flex-col items-center gap-5 text-center">
        <span className="text-7xl">📴</span>
        <h1 className="text-2xl font-black text-[var(--ink)]">You&apos;re Offline</h1>
        <p className="text-sm leading-relaxed text-[var(--ink-light)]">
          DuoTots saved this page for you. Reconnect to keep learning!
        </p>
        <Link
          href="/"
          className="btn-3d rounded-2xl border-b-4 border-b-[var(--duo-green-dark)] bg-[var(--duo-green)] px-8 py-3.5 text-[15px] font-extrabold uppercase tracking-wide text-white"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
