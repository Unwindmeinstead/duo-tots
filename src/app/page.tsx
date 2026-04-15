import Link from "next/link";
import { categories } from "@/lib/vocab";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">DuoTots</p>
        <h1 className="mt-1 text-4xl font-black text-slate-900 sm:text-5xl">
          Visual Word Adventures
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Tap a category, learn words with real pictures, then practice for stars.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/lesson/${category.id}`}
            className="rounded-3xl bg-white p-5 shadow-sm transition hover:scale-[1.01] hover:shadow-md"
          >
            <p className="text-3xl">{category.icon}</p>
            <h2 className="mt-3 text-2xl font-black text-slate-900">{category.name}</h2>
            <p className="mt-2 text-base text-slate-600">{category.description}</p>
            <p className="mt-3 text-sm font-semibold text-indigo-600">
              Start lesson ({category.items.length} words)
            </p>
          </Link>
        ))}
      </section>

      <footer className="flex justify-end">
        <Link
          href="/progress"
          className="rounded-xl bg-indigo-500 px-4 py-3 text-base font-semibold text-white hover:bg-indigo-600"
        >
          View Progress
        </Link>
      </footer>
    </main>
  );
}
