"use client";

import Link from "next/link";
import { useState } from "react";
import { initialProgress, loadProgress, saveProgress, type ProgressState } from "@/lib/progress";
import { categoriesById } from "@/lib/vocab";

export function ProgressClient() {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  const reset = () => {
    saveProgress(initialProgress);
    setProgress(initialProgress);
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8 sm:px-6">
      <header className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Progress</p>
        <h1 className="mt-1 text-4xl font-black text-slate-900">Your Childs Learning</h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-amber-100 p-5">
          <p className="text-sm text-amber-700">Stars</p>
          <p className="text-3xl font-black text-amber-900">{progress.stars}</p>
        </div>
        <div className="rounded-2xl bg-indigo-100 p-5">
          <p className="text-sm text-indigo-700">Daily streak</p>
          <p className="text-3xl font-black text-indigo-900">{progress.streak}</p>
        </div>
        <div className="rounded-2xl bg-emerald-100 p-5">
          <p className="text-sm text-emerald-700">Words practiced</p>
          <p className="text-3xl font-black text-emerald-900">{progress.practicedWords}</p>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900">Completed Categories</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {progress.completedCategories.length === 0 ? (
            <li className="rounded-xl bg-slate-100 p-4 text-slate-600">No categories yet.</li>
          ) : (
            progress.completedCategories.map((id) => (
              <li key={id} className="rounded-xl bg-slate-100 p-4 text-slate-800">
                {categoriesById[id].icon} {categoriesById[id].name}
              </li>
            ))
          )}
        </ul>
      </section>

      <footer className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-xl bg-indigo-500 px-4 py-3 text-base font-semibold text-white hover:bg-indigo-600"
        >
          Back Home
        </Link>
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-slate-100 px-4 py-3 text-base font-semibold text-slate-800 hover:bg-slate-200"
        >
          Parent Reset
        </button>
      </footer>
    </main>
  );
}
