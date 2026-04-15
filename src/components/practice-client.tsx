"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { resolveWordImage } from "@/lib/media";
import { AppShell, NavBar, ProgressBar, Section, OptionBtn, Btn3D } from "@/components/ui";
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
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(category.items[0].fallbackImage);
  const [imageState, setImageState] = useState<"loading" | "ready" | "fallback">("loading");
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [score, setScore] = useState(0);

  const total = category.items.length;
  const answer = category.items[round % total];
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
    setSelected(word);
    const isCorrect = word === answer.word;
    const next = recordPracticeAttempt(progress, category.id, answer.word, isCorrect);
    saveProgress(next);
    setProgress(next);
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) setScore((s) => s + 1);
  };

  const advance = () => {
    setImageState("loading");
    setRound((c) => c + 1);
    setFeedback(null);
    setSelected(null);
  };

  const optionState = (word: string) => {
    if (!feedback) return "idle" as const;
    if (word === answer.word) return "correct" as const;
    if (word === selected) return "wrong" as const;
    return "disabled" as const;
  };

  return (
    <AppShell noTabs>
      <NavBar onClose="/" title={category.name} />
      <ProgressBar value={Math.min(round + 1, total)} max={total} color="orange" />

      <Section className="mt-4">
        <p className="mb-3 text-center text-sm font-extrabold uppercase tracking-widest text-[var(--ink-light)]">
          What is this?
        </p>
        <div className={`overflow-hidden rounded-3xl border-2 bg-[var(--surface-hover)] transition-colors ${
          feedback === "correct" ? "border-[var(--duo-green)]" : feedback === "wrong" ? "border-[var(--duo-red)]" : "border-[var(--border)]"
        }`}>
          <div className="relative aspect-[4/3] w-full">
            {imageState === "loading" && (
              <div className="absolute inset-0 animate-pulse bg-[var(--border)]" />
            )}
            <Image
              src={imageUrl}
              alt="Guess this word"
              fill
              className="object-cover transition-opacity duration-500"
              style={{ opacity: imageState === "loading" ? 0.2 : 1 }}
              sizes="(max-width: 768px) 100vw, 700px"
            />
            {feedback === "correct" && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--duo-green)]/20 fade-in">
                <span className="rounded-2xl bg-white px-6 py-3 text-2xl font-black text-[var(--duo-green-dark)] shadow-lg">
                  Correct!
                </span>
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-2.5">
          {options.map((option) => (
            <OptionBtn key={option.id} onClick={() => choose(option.word)} state={optionState(option.word)}>
              {option.word}
            </OptionBtn>
          ))}
        </div>
      </Section>

      {feedback && (
        <Section>
          <div className={`rounded-2xl p-4 ${
            feedback === "correct" ? "bg-[var(--duo-green-bg)]" : "bg-red-50"
          }`}>
            <p className={`text-center text-sm font-extrabold ${
              feedback === "correct" ? "text-[var(--duo-green-dark)]" : "text-[var(--duo-red-dark)]"
            }`}>
              {feedback === "correct" ? `+2 XP · ${score} correct so far` : `The answer is "${answer.word}"`}
            </p>
          </div>
          <Btn3D
            onClick={advance}
            color={feedback === "correct" ? "green" : "red"}
            className="mt-3 w-full"
          >
            Continue
          </Btn3D>
        </Section>
      )}

      <Section className="pb-6">
        <div className="flex justify-center gap-6 text-sm font-bold text-[var(--ink-light)]">
          <span>Round {(round % total) + 1}/{total}</span>
          <span>·</span>
          <span>{score} correct</span>
        </div>
      </Section>
    </AppShell>
  );
}
