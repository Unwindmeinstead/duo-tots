"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { speakWord } from "@/lib/audio";
import { resolveWordImage } from "@/lib/media";
import { AppShell, BottomNav, PrimaryButton, ProgressChip, SurfaceCard, TopBar } from "@/components/ui";
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
  const [imageUrl, setImageUrl] = useState<string>(category.items[0].fallbackImage);
  const [imageState, setImageState] = useState<"loading" | "ready" | "fallback">("loading");
  const [audioState, setAudioState] = useState<"idle" | "playing">("idle");
  const [audioSource, setAudioSource] = useState<string>("none");
  const [progress] = useState<ProgressState>(() => {
    const loaded = loadProgress();
    const updated = recordCategoryView(loaded, category.id);
    saveProgress(updated);
    return updated;
  });
  const current = useMemo(() => category.items[index], [category.items, index]);

  useEffect(() => {
    let ignore = false;
    resolveWordImage(current.imageQuery, current.fallbackImage).then((result) => {
      if (!ignore) {
        setImageUrl(result.imageUrl);
        setImageState(result.source === "fallback" ? "fallback" : "ready");
      }
    });
    return () => {
      ignore = true;
    };
  }, [current.fallbackImage, current.imageQuery]);

  const speak = async () => {
    setAudioState("playing");
    const result = await speakWord(current.word);
    setAudioSource(result.source);
    setAudioState("idle");
  };

  return (
    <AppShell>
      <TopBar>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
          Lesson
        </p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">{category.name}</h1>
        <p className="mt-2 text-base text-slate-600">{category.description}</p>
        <p className="mt-3 text-sm font-medium text-slate-500">
          Card {index + 1} of {category.items.length}
        </p>
      </TopBar>

      <SurfaceCard className="overflow-hidden">
        <div className="relative h-80 w-full bg-slate-200 sm:h-[26rem]">
          {imageState === "loading" && (
            <div className="absolute inset-0 animate-pulse bg-slate-300/70" />
          )}
          <Image
            src={imageUrl}
            alt={current.word}
            fill
            className="object-cover transition duration-500"
            sizes="(max-width: 768px) 100vw, 900px"
            priority
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900/50 to-transparent" />
          {imageState === "fallback" && (
            <p className="absolute left-3 top-3 rounded-lg bg-slate-900/60 px-2 py-1 text-xs font-semibold text-white">
              Fallback image
            </p>
          )}
        </div>
        <div className="flex flex-col gap-4 p-6">
          <h2 className="text-center text-5xl font-black tracking-tight text-slate-900">
            {current.word}
          </h2>
          <PrimaryButton
            onClick={speak}
            className="h-14 text-lg font-bold"
            disabled={audioState === "playing"}
          >
            {audioState === "playing" ? "Playing..." : `Hear ${current.word}`}
          </PrimaryButton>
          <div className="flex gap-2">
            <ProgressChip label="Audio source" value={audioSource} />
            <ProgressChip label="Image state" value={imageState} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setImageState("loading");
                setIndex((prev) => (prev - 1 + category.items.length) % category.items.length);
              }}
              className="h-12 rounded-2xl bg-slate-100 text-base font-semibold text-slate-800 transition hover:bg-slate-200"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => {
                setImageState("loading");
                setIndex((prev) => (prev + 1) % category.items.length);
              }}
              className="h-12 rounded-2xl bg-indigo-500 text-base font-semibold text-white transition hover:bg-indigo-600"
            >
              Next
            </button>
          </div>
        </div>
      </SurfaceCard>

      <BottomNav>
        <p className="text-sm font-semibold text-slate-600">
          Stars earned: <span className="text-slate-900">{progress.stars}</span>
        </p>
        <div className="flex gap-2">
          <Link
            href={`/practice?category=${category.id}`}
            className="rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-600"
          >
            Practice
          </Link>
          <Link
            href="/"
            className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-200"
          >
            Home
          </Link>
        </div>
      </BottomNav>
    </AppShell>
  );
}
