"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { resolveWordImage } from "@/lib/media";
import { AppShell, TopBar, Card, BottomBar, NavLink, StatChip } from "@/components/ui";
import {
  loadProgress,
  recordPracticeAttempt,
  saveProgress,
  type ProgressState,
} from "@/lib/progress";
import type { VocabCategory, VocabItem } from "@/lib/vocab";

const pickOptions = (items: VocabItem[], answer: VocabItem) => {
  const pool = items.filter((item) => item.id !== answer.id);
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 2);
  return [...shuffled, answer].sort(() => Math.random() - 0.5);
};

export function PracticeClient({ category }: { category: VocabCategory }) {
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(category.items[0].fallbackImage);
  const [imageState, setImageState] = useState<"loading" | "ready" | "fallback">("loading");
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  const answer = category.items[round % category.items.length];
  const options = useMemo(() => pickOptions(category.items, answer), [category.items, answer]);

  useEffect(() => {
    let ignore = false;
    resolveWordImage(answer.imageQuery, answer.fallbackImage).then((result) => {
      if (!ignore) {
        setImageUrl(result.imageUrl);
        setImageState(result.source === "fallback" ? "fallback" : "ready");
      }
    });
    return () => { ignore = true; };
  }, [answer.fallbackImage, answer.imageQuery]);

  const choose = (word: string) => {
    if (feedback) return;
    const isCorrect = word === answer.word;
    const next = recordPracticeAttempt(progress, category.id, answer.word, isCorrect);
    saveProgress(next);
    setProgress(next);
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setTimeout(() => {
        setImageState("loading");
        setRound((c) => c + 1);
        setFeedback(null);
      }, 800);
    } else {
      setTimeout(() => setFeedback(null), 600);
    }
  };

  return (
    <AppShell>
      <TopBar label="Practice" title={category.name} subtitle="Tap the word that matches the picture." />

      <Card
        accent="coral"
        className={`overflow-hidden transition-transform ${feedback === "correct" ? "card-pop" : ""}`}
      >
        <div className="relative aspect-[4/3] w-full bg-[var(--card)]">
          {imageState === "loading" && (
            <div className="absolute inset-0 animate-pulse bg-[var(--border-light)]" />
          )}
          <Image
            src={imageUrl}
            alt="Guess this word"
            fill
            className="object-cover transition-opacity duration-500"
            style={{ opacity: imageState === "loading" ? 0.3 : 1 }}
            sizes="(max-width: 768px) 100vw, 900px"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

          {feedback && (
            <div className={`absolute inset-0 flex items-center justify-center ${
              feedback === "correct" ? "bg-green-500/20" : "bg-red-400/20"
            }`}>
              <span className="rounded-2xl bg-white/90 px-6 py-3 text-2xl font-black text-[var(--ink)]">
                {feedback === "correct" ? "Correct!" : "Try again"}
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-2.5 p-5 sm:p-6">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => choose(option.word)}
              className="h-14 rounded-2xl border border-[var(--border-light)] bg-[var(--card-alt)] text-lg font-bold text-[var(--ink)] transition-all hover:bg-[var(--card)] active:scale-[0.98]"
            >
              {option.word}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2.5">
        <StatChip label="Stars" value={progress.stars} color="yellow" />
        <StatChip label="Streak" value={progress.streak} color="teal" />
        <StatChip label="Practiced" value={progress.practicedWords} color="green" />
      </div>

      <BottomBar>
        <NavLink href={`/lesson/${category.id}`} variant="soft">Back to Lesson</NavLink>
        <NavLink href="/progress" variant="dark">Dashboard</NavLink>
      </BottomBar>
    </AppShell>
  );
}
