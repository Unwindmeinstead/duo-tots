"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { speakWord } from "@/lib/audio";
import { resolveWordImage, prefetchWordImages } from "@/lib/media";
import { NavBar, ProgressBar, Btn3D } from "@/components/ui";
import { IconVolume } from "@/components/icons";
import {
  loadProgress,
  recordCategoryView,
  saveProgress,
} from "@/lib/progress";
import type { VocabCategory } from "@/lib/vocab";

export function LessonClient({ category }: { category: VocabCategory }) {
  const [index, setIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageState, setImageState] = useState<"loading" | "ready" | "none">("loading");
  const [audioState, setAudioState] = useState<"idle" | "playing">("idle");

  useState(() => {
    const loaded = loadProgress();
    const updated = recordCategoryView(loaded, category.id);
    saveProgress(updated);
  });

  const current = useMemo(() => category.items[index], [category.items, index]);
  const total = category.items.length;

  useEffect(() => {
    const ahead = category.items.slice(index + 1, index + 4);
    if (ahead.length > 0) {
      prefetchWordImages(ahead.map((i) => i.imageQuery));
    }
  }, [index, category.items]);

  useEffect(() => {
    let ignore = false;
    resolveWordImage(current.imageQuery).then((result) => {
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
  }, [current.imageQuery]);

  const speak = async () => {
    setAudioState("playing");
    await speakWord(current.word);
    setAudioState("idle");
  };

  const go = (dir: -1 | 1) => {
    setImageState("loading");
    setImageUrl(null);
    setIndex((prev) => (prev + dir + total) % total);
  };

  return (
    <div className="flex h-dvh flex-col bg-white">
      <div className="flex-shrink-0">
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
      </div>

      {/* Image area */}
      <div className="relative mx-4 mt-3 flex-1 overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-[#f0f0f0]">
        {imageState === "loading" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <span className="text-7xl">{current.emoji}</span>
            <div className="absolute inset-0 animate-pulse bg-[var(--border)]/30" />
          </div>
        )}
        {imageState === "none" && (
          <div className="flex h-full items-center justify-center">
            <span className="text-[8rem] leading-none">{current.emoji}</span>
          </div>
        )}
        {imageState === "ready" && imageUrl && (
          <Image
            src={imageUrl}
            alt={current.word}
            fill
            className="object-contain p-1 fade-in"
            sizes="(max-width: 768px) 100vw, 700px"
            priority
          />
        )}
      </div>

      {/* Bottom controls */}
      <div className="flex-shrink-0 px-4 pb-[max(env(safe-area-inset-bottom,8px),8px)] pt-3">
        <h2 className="mb-3 text-center text-3xl font-black tracking-tight text-[var(--ink)]">
          {current.emoji} {current.word}
        </h2>

        <Btn3D onClick={speak} disabled={audioState === "playing"} color="blue" className="mb-2 w-full">
          {audioState === "playing" ? "Playing..." : `Hear "${current.word}"`}
        </Btn3D>

        <div className="grid grid-cols-2 gap-2">
          <Btn3D onClick={() => go(-1)} color="white" className="w-full">Previous</Btn3D>
          <Btn3D onClick={() => go(1)} color="green" className="w-full">Next</Btn3D>
        </div>

        <div className="mt-2 flex justify-center">
          <a href={`/practice?category=${category.id}`}
            className="py-2 text-sm font-extrabold uppercase tracking-wide text-[var(--duo-green)] underline-offset-4 hover:underline"
          >
            Skip to quiz →
          </a>
        </div>
      </div>
    </div>
  );
}
