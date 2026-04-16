"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { speakWord } from "@/lib/audio";
import { prefetchWordImages } from "@/lib/media";
import { IconVolume, IconBack, IconArrowRight, IconX, CATEGORY_ICONS } from "@/components/icons";
import { WordVisual } from "@/components/word-visual";
import { loadProgress, recordCategoryView, saveProgress } from "@/lib/progress";
import type { VocabCategory } from "@/lib/vocab";

export function LessonClient({ category }: { category: VocabCategory }) {
  const [index, setIndex] = useState(0);
  const [audioState, setAudioState] = useState<"idle" | "playing">("idle");

  useEffect(() => {
    const loaded = loadProgress();
    const updated = recordCategoryView(loaded, category.id);
    saveProgress(updated);
  }, [category.id]);

  const current = useMemo(() => category.items[index], [category.items, index]);
  const total = category.items.length;
  const CatIcon = CATEGORY_ICONS[category.id];
  const pct = Math.round(((index + 1) / total) * 100);
  const remaining = total - index - 1;
  const isNumbers = category.id === "numbers";

  useEffect(() => {
    if (category.imageMode !== "photo" && category.imageMode !== "vector") return;
    const ahead = category.items.slice(index + 1, index + 4);
    if (ahead.length > 0) prefetchWordImages(ahead.map((i) => i.imageQuery), category.imageMode);
  }, [index, category.items, category.imageMode]);

  const speak = async () => {
    setAudioState("playing");
    await speakWord(current.word);
    setAudioState("idle");
  };

  const go = (dir: -1 | 1) => {
    setIndex((prev) => (prev + dir + total) % total);
  };

  /* Same compact chrome as Numbers for every category */
  const immersive = true;

  return (
    <div className="flex h-dvh min-h-dvh flex-col overflow-hidden bg-[var(--bg)]">
      {/* Top bar — compact for immersive modes */}
      <div className={`grid flex-shrink-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-2 px-4 ${immersive ? "pt-2 pb-1" : "pt-3 pb-2"}`}>
        <Link href="/" className="surface-soft flex h-9 w-9 items-center justify-center text-[var(--ink-secondary)] transition-all active:scale-90">
          <IconX size={16} />
        </Link>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5 rounded-[var(--radius-lg)] border border-white/15 px-3 py-1.5 text-white shadow-sm" style={{ background: category.color }}>
            {CatIcon && <CatIcon size={14} />}
            <span className="truncate text-[11px] font-semibold tracking-tight">{category.name}</span>
          </div>
          <div className="surface-soft flex items-center gap-1.5 px-3 py-1.5">
            <span className="text-[12px] font-semibold tabular-nums" style={{ color: category.color }}>{pct}%</span>
            {!isNumbers ? (
              <span className="text-[10px] font-medium tabular-nums text-[var(--ink-tertiary)]">{index + 1}/{total}</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className={`px-4 ${immersive ? "pb-1" : "pb-2"}`}>
        <div className={`${immersive ? "h-1.5" : "h-3"} overflow-hidden rounded-full bg-[var(--surface-secondary)]`}>
          <div className="progress-bar h-full rounded-full" style={{ width: `${pct}%`, background: category.color }} />
        </div>
      </div>

      {!isNumbers ? (
        <div className="px-4 pb-2">
          <div className="surface-soft flex items-start justify-between gap-2.5 px-3.5 py-2.5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: category.color }}>
                Current word
              </p>
              <h1 className="mt-1 break-words text-[1.15rem] font-black leading-tight tracking-[-0.03em] text-[var(--ink)] sm:text-[1.3rem]">{current.word}</h1>
              <p className="mt-1 text-[12px] font-medium text-[var(--ink-tertiary)]">
                {remaining > 0 ? `${remaining} more in ${category.name}` : "Last card in this topic"}
              </p>
            </div>
            <button
              type="button"
              onClick={speak}
              disabled={audioState === "playing"}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-white transition-all active:scale-95 disabled:opacity-50 sm:h-12 sm:w-12"
              style={{ background: category.color, boxShadow: `0 8px 18px ${category.color}2e` }}
            >
              <IconVolume size={18} />
            </button>
          </div>
        </div>
      ) : null}

      {/* Word title card — hidden for immersive modes */}
      {!immersive && (
        <div className="mx-4 mb-3 rounded-[var(--radius-xl)] border border-white/15 p-4 text-center text-white shadow-md" style={{ background: `linear-gradient(160deg, ${category.color}, ${category.color}dd)` }}>
          <h1 className="text-[32px] font-extrabold leading-none tracking-tight">{current.word}</h1>
          <button type="button" onClick={speak} disabled={audioState === "playing"}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/18 px-4 py-1.5 text-[12px] font-semibold backdrop-blur-md transition-all hover:bg-white/28 active:scale-95 disabled:opacity-50"
          >
            <IconVolume size={16} /> Tap to hear
          </button>
        </div>
      )}

      {/* Visual area — extra height for Numbers baseline stage */}
      <div className={`flex-1 ${isNumbers ? "min-h-[56vh]" : "min-h-[42vh]"} ${immersive ? "mx-2 mb-1 pt-1" : "mx-4"}`}>
        <WordVisual
          key={current.id}
          word={current.word}
          imageQuery={current.imageQuery}
          assetKey={current.assetKey}
          imageMode={category.imageMode}
          categoryColor={category.color}
          categoryId={category.id}
          onClick={speak}
          immersive={immersive}
          digitLessonChrome={isNumbers
            ? {
                current: index + 1,
                total,
                onPrev: () => go(-1),
                onNext: () => go(1),
                quizHref: `/practice?category=${category.id}`,
              }
            : undefined}
        />
      </div>

      {/* Bottom controls — Numbers uses swipe + in-card Quiz; other topics keep bar */}
      {!isNumbers ? (
        <div className={`flex flex-shrink-0 items-center gap-3 px-4 ${immersive ? "pt-2" : "pt-3"}`} style={{ paddingBottom: "max(calc(env(safe-area-inset-bottom, 0px) + 8px), 12px)" }}>
          <button type="button" onClick={() => go(-1)}
            className={`surface-soft flex ${immersive ? "h-12 w-12" : "h-14 w-14"} flex-shrink-0 items-center justify-center text-[var(--ink-secondary)] transition-all hover:bg-[var(--surface-secondary)] active:scale-90`}
          >
            <IconBack size={20} />
          </button>
          <button type="button" onClick={() => go(1)}
            className={`btn-primary flex ${immersive ? "h-12" : "h-14"} flex-1 items-center justify-center gap-2 rounded-[var(--radius-xl)] text-[15px] font-semibold tracking-tight text-white transition-all`}
            style={{ background: category.color, boxShadow: `0 6px 20px ${category.color}28` }}
          >
            Next <IconArrowRight size={18} />
          </button>
          <Link href={`/practice?category=${category.id}`}
            className={`surface-soft flex ${immersive ? "h-12" : "h-14"} min-w-[4.5rem] flex-shrink-0 items-center justify-center gap-1.5 px-3 text-[13px] font-semibold tracking-tight text-[var(--ink)] transition-all hover:bg-[var(--surface-secondary)] active:scale-95`}
          >
            Quiz
          </Link>
        </div>
      ) : (
        <div className="flex-shrink-0" style={{ minHeight: "max(8px, env(safe-area-inset-bottom, 0px))" }} aria-hidden />
      )}
    </div>
  );
}
