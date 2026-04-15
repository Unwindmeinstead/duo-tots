"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { speakWord } from "@/lib/audio";
import { resolveWordImage } from "@/lib/media";
import { AppShell, TopBar, Card, Btn, BottomBar, NavLink, Tag } from "@/components/ui";
import {
  loadProgress,
  recordCategoryView,
  saveProgress,
  type ProgressState,
} from "@/lib/progress";
import type { VocabCategory } from "@/lib/vocab";

export function LessonClient({ category }: { category: VocabCategory }) {
  const [index, setIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState<string>(category.items[0].fallbackImage);
  const [imageState, setImageState] = useState<"loading" | "ready" | "fallback">("loading");
  const [audioState, setAudioState] = useState<"idle" | "playing">("idle");
  const [progress] = useState<ProgressState>(() => {
    const loaded = loadProgress();
    const updated = recordCategoryView(loaded, category.id);
    saveProgress(updated);
    return updated;
  });
  const current = useMemo(() => category.items[index], [category.items, index]);
  const total = category.items.length;

  useEffect(() => {
    let ignore = false;
    resolveWordImage(current.imageQuery, current.fallbackImage).then((result) => {
      if (!ignore) {
        setImageUrl(result.imageUrl);
        setImageState(result.source === "fallback" ? "fallback" : "ready");
      }
    });
    return () => { ignore = true; };
  }, [current.fallbackImage, current.imageQuery]);

  const speak = async () => {
    setAudioState("playing");
    await speakWord(current.word);
    setAudioState("idle");
  };

  const go = (dir: -1 | 1) => {
    setImageState("loading");
    setIndex((prev) => (prev + dir + total) % total);
  };

  return (
    <AppShell>
      <TopBar label="Lesson" title={category.name} subtitle={category.description}>
        <div className="mt-4 flex items-center gap-3">
          <Tag color="teal">{index + 1} / {total}</Tag>
          <Tag color="yellow">{progress.stars} stars</Tag>
        </div>
      </TopBar>

      <Card accent="teal" className="overflow-hidden">
        <div className="relative aspect-[4/3] w-full bg-[var(--card)]">
          {imageState === "loading" && (
            <div className="absolute inset-0 animate-pulse bg-[var(--border-light)]" />
          )}
          <Image
            src={imageUrl}
            alt={current.word}
            fill
            className="object-cover transition-opacity duration-500"
            style={{ opacity: imageState === "loading" ? 0.3 : 1 }}
            sizes="(max-width: 768px) 100vw, 900px"
            priority
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
          {imageState === "fallback" && (
            <span className="absolute left-3 top-3 rounded-lg bg-black/50 px-2 py-1 text-[10px] font-semibold text-white/80">
              Fallback
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <h2 className="text-center text-[clamp(2rem,7vw,3.2rem)] font-black leading-none tracking-tight text-[var(--ink)]">
            {current.word}
          </h2>

          <Btn onClick={speak} disabled={audioState === "playing"} variant="dark" className="h-14 text-base">
            {audioState === "playing" ? "Playing..." : `Hear "${current.word}"`}
          </Btn>

          <div className="grid grid-cols-2 gap-3">
            <Btn onClick={() => go(-1)} variant="soft" className="h-12">Previous</Btn>
            <Btn onClick={() => go(1)} variant="accent" className="h-12">Next</Btn>
          </div>
        </div>
      </Card>

      <BottomBar>
        <NavLink href={`/practice?category=${category.id}`} variant="accent">Practice Quiz</NavLink>
        <NavLink href="/" variant="soft">Home</NavLink>
      </BottomBar>
    </AppShell>
  );
}
