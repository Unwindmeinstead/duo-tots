import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-6xl">📴</p>
      <h1 className="text-3xl font-black text-slate-900">You are offline</h1>
      <p className="text-slate-600">
        DuoTots saved this page so your child can keep learning once internet returns.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-indigo-500 px-4 py-3 text-base font-semibold text-white hover:bg-indigo-600"
      >
        Try Home Again
      </Link>
    </main>
  );
}
