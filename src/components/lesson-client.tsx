"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  loadProgress,
  recordCategoryView,
  saveProgress,
  type ProgressState,
} from "@/lib/progress";
import type { VocabCategory } from "@/lib/vocab";

type LessonClientProps = {
  category: VocabCategory;
};

export function LessonClient({ category }: LessonClientProps) {
  const [index, setIndex] = useState(0);
  const [progress] = useState<ProgressState>(() => {
    const loaded = loadProgress();
    const updated = recordCategoryView(loaded, category.id);
    saveProgress(updated);
    return updated;
  });
  const current = useMemo(() => category.items[index], [category.items, index]);

  const speak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(current.word);
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8 sm:px-6">
      <header className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Lesson</p>
        <h1 className="mt-1 text-4xl font-black text-slate-900">{category.name}</h1>
        <p className="mt-2 text-base text-slate-600">{category.description}</p>
        <p className="mt-3 text-sm text-slate-500">
          Card {index + 1} of {category.items.length}
        </p>
      </header>

      <article className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="relative h-72 w-full sm:h-96">
          <Image
            src={current.image}
            alt={current.word}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 900px"
            priority
          />
        </div>
        <div className="flex flex-col gap-4 p-6">
          <h2 className="text-center text-5xl font-black text-slate-900">{current.word}</h2>
          <button
            type="button"
            onClick={speak}
            className="h-14 rounded-2xl bg-emerald-500 text-xl font-bold text-white transition hover:bg-emerald-600"
          >
            Hear {current.word}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev - 1 + category.items.length) % category.items.length)}
              className="h-12 rounded-2xl bg-slate-100 text-lg font-semibold text-slate-800 transition hover:bg-slate-200"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev + 1) % category.items.length)}
              className="h-12 rounded-2xl bg-indigo-500 text-lg font-semibold text-white transition hover:bg-indigo-600"
            >
              Next
            </button>
          </div>
        </div>
      </article>

      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-600">
          Stars earned: <span className="text-slate-900">{progress.stars}</span>
        </p>
        <div className="flex gap-2">
          <Link
            href={`/practice?category=${category.id}`}
            className="rounded-xl bg-violet-500 px-4 py-3 text-base font-semibold text-white hover:bg-violet-600"
          >
            Practice
          </Link>
          <Link
            href="/"
            className="rounded-xl bg-slate-100 px-4 py-3 text-base font-semibold text-slate-800 hover:bg-slate-200"
          >
            Home
          </Link>
        </div>
      </footer>
    </main>
  );
}
