"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { resolveWordImage } from "@/lib/media";
import { AppShell, BottomNav, ProgressChip, SurfaceCard, TopBar } from "@/components/ui";
import {
  loadProgress,
  recordPracticeAttempt,
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
  const [imageUrl, setImageUrl] = useState<string>(category.items[0].fallbackImage);
  const [imageState, setImageState] = useState<"loading" | "ready" | "fallback">("loading");
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  const answer = category.items[round % category.items.length];
  const options = useMemo(
    () => pickOptions(category.items, answer),
    [category.items, answer],
  );

  useEffect(() => {
    let ignore = false;
    resolveWordImage(answer.imageQuery, answer.fallbackImage).then((result) => {
      if (!ignore) {
        setImageUrl(result.imageUrl);
        setImageState(result.source === "fallback" ? "fallback" : "ready");
      }
    });
    return () => {
      ignore = true;
    };
  }, [answer.fallbackImage, answer.imageQuery]);

  const choose = (word: string) => {
    if (word === answer.word) {
      const next = recordPracticeAttempt(progress, category.id, answer.word, true);
      saveProgress(next);
      setProgress(next);
      setFeedback("Great job!");
      setTimeout(() => {
        setImageState("loading");
        setRound((current) => current + 1);
        setFeedback(null);
      }, 700);
      return;
    }
    const next = recordPracticeAttempt(progress, category.id, answer.word, false);
    saveProgress(next);
    setProgress(next);
    setFeedback("Try again!");
  };

  return (
    <AppShell>
      <TopBar>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
          Practice
        </p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">{category.name}</h1>
        <p className="mt-2 text-base text-slate-600">
          Tap the correct word for the picture.
        </p>
      </TopBar>

      <SurfaceCard className={`overflow-hidden ${feedback === "Great job!" ? "card-pop" : ""}`}>
        <div className="relative h-80 w-full bg-slate-200 sm:h-[26rem]">
          {imageState === "loading" && (
            <div className="absolute inset-0 animate-pulse bg-slate-300/70" />
          )}
          <Image
            src={imageUrl}
            alt={answer.word}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 900px"
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900/50 to-transparent" />
          {imageState === "fallback" && (
            <p className="absolute left-3 top-3 rounded-lg bg-slate-900/60 px-2 py-1 text-xs font-semibold text-white">
              Fallback image
            </p>
          )}
        </div>
        <div className="grid gap-3 p-6">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => choose(option.word)}
              className="h-14 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 text-lg font-bold text-indigo-900 transition hover:from-indigo-100 hover:to-violet-100"
            >
              {option.word}
            </button>
          ))}
        </div>
      </SurfaceCard>

      <BottomNav>
        <p className={`text-sm font-semibold text-slate-600 transition ${feedback ? "scale-105" : ""}`}>
          {feedback ?? "Keep practicing for stars!"}
        </p>
        <div className="flex gap-2">
          <ProgressChip label="Stars" value={progress.stars} />
          <ProgressChip label="Streak" value={progress.streak} />
        </div>
        <div className="flex gap-2">
          <Link
            href={`/lesson/${category.id}`}
            className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Back to Lesson
          </Link>
          <Link
            href="/progress"
            className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-200"
          >
            View Progress
          </Link>
        </div>
      </BottomNav>
    </AppShell>
  );
}
