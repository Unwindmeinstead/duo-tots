"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { prefetchWordImages } from "@/lib/media";
import { speakWord } from "@/lib/audio";
import { OptionBtn, BtnPrimary, LinkBtn } from "@/components/ui";
import { IconCheck, IconStar, IconX, IconArrowRight, CATEGORY_ICONS } from "@/components/icons";
import { WordVisual } from "@/components/word-visual";
import { loadProgress, recordPracticeAttempt, saveProgress, type ProgressState } from "@/lib/progress";
import type { VocabCategory, VocabItem } from "@/lib/vocab";

const pickOptions = (items: VocabItem[], answer: VocabItem) => {
  const pool = items.filter((i) => i.id !== answer.id);
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 2);
  return [...shuffled, answer].sort(() => Math.random() - 0.5);
};

export function PracticeClient({ category }: { category: VocabCategory }) {
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [audioState, setAudioState] = useState<"idle" | "playing">("idle");

  const total = category.items.length;
  const answer = category.items[round % total];
  const options = useMemo(() => pickOptions(category.items, answer), [category.items, answer]);
  const CatIcon = CATEGORY_ICONS[category.id];
  const pct = Math.round(((Math.min(round + 1, total)) / total) * 100);
  const accuracy = round > 0 ? Math.round((score / round) * 100) : 100;

  const immersive = true;

  useEffect(() => {
    if (category.imageMode !== "photo" && category.imageMode !== "vector") return;
    const nextIdx = (round + 1) % total;
    const ahead = [category.items[nextIdx], category.items[(nextIdx + 1) % total]];
    prefetchWordImages(ahead.map((i) => i.imageQuery), category.imageMode);
  }, [round, total, category.items, category.imageMode]);

  const choose = (word: string) => {
    if (feedback) return;
    setSelected(word);
    const isCorrect = word === answer.word;
    const next = recordPracticeAttempt(progress, category.id, answer.word, isCorrect);
    saveProgress(next);
    setProgress(next);
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setScore((s) => s + 1);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1200);
    }
  };

  const advance = useCallback(() => {
    const nextRound = round + 1;
    if (nextRound >= total) {
      setShowSummary(true);
      return;
    }
    setRound(nextRound);
    setFeedback(null);
    setSelected(null);
  }, [round, total]);

  const speak = async () => {
    setAudioState("playing");
    await speakWord(answer.word);
    setAudioState("idle");
  };

  const optionState = (word: string) => {
    if (!feedback) return "idle" as const;
    if (word === answer.word) return "correct" as const;
    if (word === selected) return "wrong" as const;
    return "disabled" as const;
  };

  /* ── Summary ── */
  if (showSummary) {
    const scorePct = total > 0 ? Math.round((score / total) * 100) : 0;
    const isGood = scorePct >= 70;
    return (
      <div className="flex h-dvh flex-col items-center justify-center bg-[var(--bg)] px-6 text-center">
        <div className="scale-in relative mb-6 flex h-36 w-36 items-center justify-center">
          <svg width={144} height={144} className="absolute" style={{ transform: "rotate(-90deg)" }}>
            <circle cx={72} cy={72} r={62} fill="none" stroke="var(--surface-secondary)" strokeWidth="8" />
            <circle cx={72} cy={72} r={62} fill="none" stroke={isGood ? "#1b4332" : "#e76f51"} strokeWidth="8"
              strokeDasharray={`${(scorePct / 100) * 2 * Math.PI * 62} ${2 * Math.PI * 62}`} strokeLinecap="round" />
          </svg>
          <p className="relative text-[36px] font-black" style={{ color: isGood ? "#1b4332" : "#e76f51" }}>{scorePct}%</p>
        </div>
        <h1 className="text-headline">Quiz complete</h1>
        <p className="text-subtitle mt-2">{score} of {total} correct</p>
        <div className="mt-4 grid w-full max-w-sm grid-cols-3 gap-2.5">
          <div className="rounded-[var(--radius-xl)] bg-[var(--surface)] px-3 py-3" style={{ boxShadow: "var(--shadow-xs)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">Accuracy</p>
            <p className="mt-1 text-[1.05rem] font-black text-[var(--ink)]">{scorePct}%</p>
          </div>
          <div className="rounded-[var(--radius-xl)] bg-[var(--surface)] px-3 py-3" style={{ boxShadow: "var(--shadow-xs)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">Topic</p>
            <p className="mt-1 truncate text-[1.05rem] font-black text-[var(--ink)]">{category.name}</p>
          </div>
          <div className="rounded-[var(--radius-xl)] bg-[var(--surface)] px-3 py-3" style={{ boxShadow: "var(--shadow-xs)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">XP</p>
            <p className="mt-1 text-[1.05rem] font-black text-[var(--ink)]">+{score * 2}</p>
          </div>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-white" style={{ background: "#1b4332", boxShadow: "0 4px 16px rgba(27,67,50,.25)" }}>
          <IconStar size={20} className="text-[#f0c040]" />
          <span className="text-[15px] font-bold">+{score * 2} XP earned</span>
        </div>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <BtnPrimary onClick={() => { setRound(0); setScore(0); setShowSummary(false); setFeedback(null); setSelected(null); }} color={category.color} className="w-full">
            Try Again
          </BtnPrimary>
          <LinkBtn href="/" className="w-full text-center" color="var(--ink)">Back to Home</LinkBtn>
        </div>
      </div>
    );
  }

  /* ── Quiz ── */
  return (
    <div className="flex h-dvh flex-col bg-[var(--bg)]">
      {/* Top bar — compact when visual is immersive */}
      <div className={`flex flex-shrink-0 items-center gap-2 px-4 ${immersive ? "pt-2 pb-1" : "pt-3 pb-2"}`}>
        <Link href="/" className={`surface-soft flex items-center justify-center text-[var(--ink-secondary)] transition-all active:scale-90 ${immersive ? "h-9 w-9" : "h-10 w-10"}`}>
          <IconX size={immersive ? 16 : 18} />
        </Link>
        <div className={`flex items-center rounded-[var(--radius-lg)] border border-white/15 text-white shadow-sm ${immersive ? "gap-1.5 px-3 py-1.5" : "gap-2 px-3.5 py-2"}`} style={{ background: category.color }}>
          {CatIcon && <CatIcon size={immersive ? 14 : 16} />}
          <span className={`font-semibold tracking-tight ${immersive ? "text-[11px]" : "text-[12px]"}`}>Quiz</span>
        </div>
        <div className="flex-1" />
        <div className={`surface-soft flex items-center gap-1.5 ${immersive ? "px-3 py-1.5" : "px-3.5 py-2"}`}>
          <IconStar size={14} className="text-[#f0c040]" />
          <span className={`font-semibold tabular-nums text-[var(--ink)] ${immersive ? "text-[12px]" : "text-[13px]"}`}>{score}</span>
        </div>
        <div className={`surface-soft flex items-center ${immersive ? "gap-1.5 px-3 py-1.5" : "gap-2 px-3.5 py-2"}`}>
          <span className={`font-semibold tabular-nums ${immersive ? "text-[12px]" : "text-[13px]"}`} style={{ color: category.color }}>{pct}%</span>
          <span className={`font-medium tabular-nums text-[var(--ink-tertiary)] ${immersive ? "text-[10px]" : "text-[11px]"}`}>{(round % total) + 1}/{total}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className={`px-4 ${immersive ? "pb-1" : "pb-2"}`}>
        <div className={`overflow-hidden rounded-full bg-[var(--surface-secondary)] ${immersive ? "h-1.5" : "h-3"}`}>
          <div className="progress-bar h-full rounded-full" style={{ width: `${pct}%`, background: category.color }} />
        </div>
      </div>

      <div className="px-4 pb-2">
        <div className="surface-soft flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: category.color }}>
              Quick check
            </p>
            <p className="mt-1 text-[1.1rem] font-black tracking-[-0.03em] text-[var(--ink)]">Match the picture to the word.</p>
            <p className="mt-1 text-[12px] font-medium text-[var(--ink-tertiary)]">
              {feedback ? `Answer locked in. ${round + 1 >= total ? "Results next." : "Review and continue."}` : `Running accuracy ${accuracy}%`}
            </p>
          </div>
          <button
            type="button"
            onClick={audioState === "playing" ? undefined : speak}
            disabled={audioState === "playing"}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-white transition-all active:scale-95 disabled:opacity-50"
            style={{ background: category.color, boxShadow: `0 8px 18px ${category.color}2e` }}
          >
            {CatIcon ? <CatIcon size={18} /> : <IconStar size={18} />}
          </button>
        </div>
      </div>

      {/* Question */}
      <p className={`px-4 text-center font-semibold uppercase tracking-[0.1em] ${immersive ? "py-0.5 text-[10px]" : "text-[11px]"}`} style={{ color: category.color }}>
        What is this?
      </p>

      {/* Visual card with feedback overlay */}
      <div className={`relative flex-1 min-h-0 overflow-hidden rounded-3xl transition-all ${immersive ? "mx-3 mt-1" : "mx-4 mt-2"} ${
        feedback === "correct" ? "ring-4 ring-[#1b4332]" : feedback === "wrong" ? "ring-4 ring-[#e76f51]" : ""
      }`}>
        <WordVisual
          key={answer.id}
          word={answer.word}
          imageQuery={answer.imageQuery}
          assetKey={answer.assetKey}
          imageMode={category.imageMode}
          categoryColor={category.color}
          categoryId={category.id}
          onClick={audioState === "playing" ? undefined : speak}
        />

        {/* Correct overlay */}
        {feedback === "correct" && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1b4332]/10 fade-in">
            <span className="scale-in flex items-center gap-2 rounded-2xl bg-[var(--surface)] px-6 py-3.5 text-[16px] font-bold text-[#1b4332]" style={{ boxShadow: "var(--shadow-lg)" }}>
              <IconCheck size={22} /> Correct!
            </span>
          </div>
        )}

        {/* Confetti */}
        {confetti && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} className="absolute h-2.5 w-2.5 rounded-full"
                style={{
                  background: ["#1b4332", "#f0c040", "#e76f51", "#e84393", "#6c5ce7", "#00b894"][i % 6],
                  animation: `confetti-${i % 4} 900ms ease-out forwards`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Options / Feedback */}
      <div className={`flex-shrink-0 px-4 ${immersive ? "pt-1" : "pt-3"}`} style={{ paddingBottom: "max(calc(env(safe-area-inset-bottom, 0px) + 12px), 16px)" }}>
        {!feedback && (
          <div className={`grid ${immersive ? "gap-2" : "gap-2.5"}`}>
            {options.map((option) => (
              <OptionBtn key={option.id} onClick={() => choose(option.word)} state={optionState(option.word)} className={immersive ? "min-h-12 py-3 text-[15px]" : undefined}>
                {option.word}
              </OptionBtn>
            ))}
          </div>
        )}

        {feedback && (
          <div className={`grid ${immersive ? "gap-2" : "gap-2.5"}`}>
            <div className={`flex items-center gap-3 rounded-2xl text-white ${immersive ? "p-3.5" : "p-4"}`}
              style={{ background: feedback === "correct" ? "#1b4332" : "#e76f51", boxShadow: `0 4px 16px ${feedback === "correct" ? "rgba(27,67,50,.25)" : "rgba(231,111,81,.25)"}` }}
            >
              {feedback === "correct" ? <IconCheck size={22} /> : <IconX size={22} />}
              <div className="flex-1">
                <p className="text-[15px] font-bold">{feedback === "correct" ? "Correct!" : "Not quite"}</p>
                <p className="text-[12px] font-semibold opacity-70">{feedback === "correct" ? `+2 XP · ${score} total` : `The answer was ${answer.word}`}</p>
              </div>
            </div>
            <button type="button" onClick={advance}
              className={`btn-primary flex w-full items-center justify-center gap-2 rounded-2xl font-bold text-white ${immersive ? "h-12 text-[15px]" : "h-14 text-[16px]"}`}
              style={{ background: category.color, boxShadow: `0 6px 20px ${category.color}30` }}
            >
              {round + 1 >= total ? "See Results" : "Continue"} <IconArrowRight size={18} />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes confetti-0 { to { transform: translate(-50px, -70px) rotate(150deg); opacity: 0; } }
        @keyframes confetti-1 { to { transform: translate(60px, -60px) rotate(-110deg); opacity: 0; } }
        @keyframes confetti-2 { to { transform: translate(-40px, 60px) rotate(220deg); opacity: 0; } }
        @keyframes confetti-3 { to { transform: translate(50px, 50px) rotate(-170deg); opacity: 0; } }
      `}</style>
    </div>
  );
}
