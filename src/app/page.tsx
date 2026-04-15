import Link from "next/link";
import { AppShell, SurfaceCard, TopBar } from "@/components/ui";
import { categories } from "@/lib/vocab";

export default function Home() {
  return (
    <AppShell>
      <TopBar>
        <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-pink-300/40 blur-2xl" />
        <div className="pointer-events-none absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-emerald-300/30 blur-2xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">DuoTots</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Premium Visual Learning
        </h1>
        <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
          A clean, app-like vocabulary journey with real images, better voice playback,
          and joyful practice loops.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-[#f6c9d8] p-3">
            <p className="text-xs text-slate-700">Focus</p>
            <p className="text-xl font-black text-slate-900">Vocabulary</p>
          </div>
          <div className="rounded-xl bg-[#f8d58f] p-3">
            <p className="text-xs text-slate-700">Mode</p>
            <p className="text-xl font-black text-slate-900">Tap + Hear</p>
          </div>
          <div className="rounded-xl bg-[#bde4d6] p-3">
            <p className="text-xs text-slate-700">Style</p>
            <p className="text-xl font-black text-slate-900">Dashboard</p>
          </div>
        </div>
        </div>
      </TopBar>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <SurfaceCard key={category.id}>
            <Link
              href={`/lesson/${category.id}`}
              className="block p-5 transition hover:-translate-y-0.5"
            >
              <p className="text-3xl">{category.icon}</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">{category.name}</h2>
              <p className="mt-2 text-base text-slate-600">{category.description}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-rose-500">
                Start lesson ({category.items.length} words)
              </p>
            </Link>
          </SurfaceCard>
        ))}
      </section>

      <footer className="flex justify-end">
        <Link
          href="/progress"
          className="rounded-xl bg-[#101028] px-4 py-3 text-base font-semibold text-white hover:brightness-110"
        >
          View Progress
        </Link>
      </footer>
    </AppShell>
  );
}
