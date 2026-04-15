"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  loadProgress,
  recordPracticeSuccess,
  saveProgress,
  type ProgressState,
} from "@/lib/progress";
import type { VocabCategory, VocabItem } from "@/lib/vocab";

type PracticeClientProps = {
  category: VocabCategory;
};

const pickOptions = (items: VocabItem[], answer: VocabItem) => {
  const pool = items.filter((item) => item.id !== answer.id);
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 2);
  return [...shuffled, answer].sort(() => Math.random() - 0.5);
};

export function PracticeClient({ category }: PracticeClientProps) {
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  const answer = category.items[round % category.items.length];
  const options = useMemo(
    () => pickOptions(category.items, answer),
    [category.items, answer],
  );

  const choose = (word: string) => {
    if (word === answer.word) {
      const next = recordPracticeSuccess(progress);
      saveProgress(next);
      setProgress(next);
      setFeedback("Great job!");
      setTimeout(() => {
        setRound((current) => current + 1);
        setFeedback(null);
      }, 700);
      return;
    }
    setFeedback("Try again!");
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8 sm:px-6">
      <header className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Practice</p>
        <h1 className="mt-1 text-4xl font-black text-slate-900">{category.name}</h1>
        <p className="mt-2 text-base text-slate-600">
          Tap the correct word for the picture.
        </p>
      </header>

      <article className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="relative h-72 w-full sm:h-96">
          <Image
            src={answer.image}
            alt={answer.word}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 900px"
          />
        </div>
        <div className="grid gap-3 p-6">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => choose(option.word)}
              className="h-14 rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-800 hover:bg-indigo-200"
            >
              {option.word}
            </button>
          ))}
        </div>
      </article>

      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-600">
          {feedback ?? "Keep practicing for stars!"}
        </p>
        <p className="text-sm font-semibold text-slate-700">
          Stars: {progress.stars} · Streak: {progress.streak}
        </p>
        <div className="flex gap-2">
          <Link
            href={`/lesson/${category.id}`}
            className="rounded-xl bg-emerald-500 px-4 py-3 text-base font-semibold text-white hover:bg-emerald-600"
          >
            Back to Lesson
          </Link>
          <Link
            href="/progress"
            className="rounded-xl bg-slate-100 px-4 py-3 text-base font-semibold text-slate-800 hover:bg-slate-200"
          >
            View Progress
          </Link>
        </div>
      </footer>
    </main>
  );
}
