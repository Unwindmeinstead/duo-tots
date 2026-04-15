"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { resolveWordImage, prefetchWordImages } from "@/lib/media";
import { NavBar, ProgressBar, OptionBtn, Btn3D } from "@/components/ui";
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageState, setImageState] = useState<"loading" | "ready" | "none">("loading");
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [score, setScore] = useState(0);

  const total = category.items.length;
  const answer = category.items[round % total];
  const options = useMemo(() => pickOptions(category.items, answer), [category.items, answer]);

  useEffect(() => {
    const nextIdx = (round + 1) % total;
    const ahead = [category.items[nextIdx], category.items[(nextIdx + 1) % total]];
    prefetchWordImages(ahead.map((i) => i.imageQuery));
  }, [round, total, category.items]);

  useEffect(() => {
    let ignore = false;
    resolveWordImage(answer.imageQuery).then((result) => {
      if (!ignore) {
        if (result.imageUrl && result.source !== "fallback") {
          setImageUrl(result.imageUrl);
          setImageState("ready");
        } else {
          setImageUrl(null);
          setImageState("none");
        }
      }
    });
    return () => { ignore = true; };
  }, [answer.imageQuery]);

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
    setImageUrl(null);
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
    <div className="flex h-dvh flex-col bg-white">
      <div className="flex-shrink-0">
        <NavBar onClose="/" title={category.name} />
        <ProgressBar value={Math.min(round + 1, total)} max={total} color="orange" />
        <p className="mt-2 text-center text-xs font-extrabold uppercase tracking-widest text-[var(--ink-light)]">
          What is this?
        </p>
      </div>

      {/* Image area */}
      <div className={`relative mx-4 mt-2 flex-1 overflow-hidden rounded-2xl border-2 bg-[#f0f0f0] transition-colors ${
        feedback === "correct" ? "border-[var(--duo-green)]" : feedback === "wrong" ? "border-[var(--duo-red)]" : "border-[var(--border)]"
      }`}>
        {imageState === "loading" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <span className="text-7xl">{answer.emoji}</span>
            <div className="absolute inset-0 animate-pulse bg-[var(--border)]/30" />
          </div>
        )}
        {imageState === "none" && (
          <div className="flex h-full items-center justify-center">
            <span className="text-[8rem] leading-none">{answer.emoji}</span>
          </div>
        )}
        {imageState === "ready" && imageUrl && (
          <Image
            src={imageUrl}
            alt="Guess this word"
            fill
            className="object-contain p-1 fade-in"
            sizes="(max-width: 768px) 100vw, 700px"
          />
        )}
        {feedback === "correct" && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--duo-green)]/20 fade-in">
            <span className="rounded-2xl bg-white px-6 py-3 text-xl font-black text-[var(--duo-green-dark)] shadow-lg">
              Correct!
            </span>
          </div>
        )}
      </div>

      {/* Bottom: options + feedback */}
      <div className="flex-shrink-0 px-4 pb-[max(env(safe-area-inset-bottom,8px),8px)] pt-3">
        {!feedback && (
          <div className="grid gap-2">
            {options.map((option) => (
              <OptionBtn key={option.id} onClick={() => choose(option.word)} state={optionState(option.word)}>
                {option.emoji} {option.word}
              </OptionBtn>
            ))}
          </div>
        )}

        {feedback && (
          <>
            <div className={`mb-2 rounded-2xl p-3 text-center ${
              feedback === "correct" ? "bg-[var(--duo-green-bg)]" : "bg-red-50"
            }`}>
              <p className={`text-sm font-extrabold ${
                feedback === "correct" ? "text-[var(--duo-green-dark)]" : "text-[var(--duo-red-dark)]"
              }`}>
                {feedback === "correct" ? `+2 XP · ${score} correct so far` : `Answer: ${answer.emoji} ${answer.word}`}
              </p>
            </div>
            <Btn3D onClick={advance} color={feedback === "correct" ? "green" : "red"} className="w-full">
              Continue
            </Btn3D>
          </>
        )}

        <p className="mt-2 text-center text-xs font-bold text-[var(--ink-light)]">
          Round {(round % total) + 1}/{total} · {score} correct
        </p>
      </div>
    </div>
  );
}
