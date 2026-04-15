"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { speakWord } from "@/lib/audio";
import { resolveWordImage } from "@/lib/media";
import { AppShell, NavBar, ProgressBar, Section, Btn3D } from "@/components/ui";
import { IconVolume } from "@/components/icons";
import {
  loadProgress,
  recordCategoryView,
  saveProgress,
} from "@/lib/progress";
import type { VocabCategory } from "@/lib/vocab";

export function LessonClient({ category }: { category: VocabCategory }) {
  const [index, setIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState<string>(category.items[0].fallbackImage);
  const [imageState, setImageState] = useState<"loading" | "ready" | "fallback">("loading");
  const [audioState, setAudioState] = useState<"idle" | "playing">("idle");

  useState(() => {
    const loaded = loadProgress();
    const updated = recordCategoryView(loaded, category.id);
    saveProgress(updated);
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
    <AppShell noTabs>
      <NavBar onClose="/" title={category.name}
        right={
          <button type="button" onClick={speak} disabled={audioState === "playing"}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--duo-blue)] transition hover:bg-blue-50 disabled:opacity-40"
          >
            <IconVolume size={22} />
          </button>
        }
      />
      <ProgressBar value={index + 1} max={total} />

      <Section className="mt-4">
        <div className="overflow-hidden rounded-3xl border-2 border-[var(--border)] bg-[var(--surface-hover)]">
          <div className="relative aspect-[4/3] w-full">
            {imageState === "loading" && (
              <div className="absolute inset-0 animate-pulse bg-[var(--border)]" />
            )}
            <Image
              src={imageUrl}
              alt={current.word}
              fill
              className="object-cover transition-opacity duration-500"
              style={{ opacity: imageState === "loading" ? 0.2 : 1 }}
              sizes="(max-width: 768px) 100vw, 700px"
              priority
            />
          </div>
        </div>
      </Section>

      <Section>
        <h2 className="text-center text-[clamp(2.2rem,8vw,3.5rem)] font-black leading-none tracking-tight text-[var(--ink)]">
          {current.word}
        </h2>
      </Section>

      <Section>
        <Btn3D onClick={speak} disabled={audioState === "playing"} color="blue" className="mb-3 w-full">
          {audioState === "playing" ? "Playing..." : `Hear "${current.word}"`}
        </Btn3D>
        <div className="grid grid-cols-2 gap-3">
          <Btn3D onClick={() => go(-1)} color="white" className="w-full">Previous</Btn3D>
          <Btn3D onClick={() => go(1)} color="green" className="w-full">Next</Btn3D>
        </div>
      </Section>

      <Section className="pb-6">
        <div className="flex justify-center">
          <a
            href={`/practice?category=${category.id}`}
            className="text-sm font-extrabold uppercase tracking-wide text-[var(--duo-green)] underline-offset-4 hover:underline"
          >
            Skip to quiz →
          </a>
        </div>
      </Section>
    </AppShell>
  );
}
