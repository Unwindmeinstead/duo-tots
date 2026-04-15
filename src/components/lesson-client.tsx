"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { speakWord } from "@/lib/audio";
import { resolveWordImage } from "@/lib/media";
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
    <div className="flex h-dvh flex-col bg-white">
      {/* Fixed top: NavBar + progress */}
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

      {/* Image — fills remaining space, shows full image */}
      <div className="relative mx-4 mt-3 flex-1 overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-[#f0f0f0]">
        {imageState === "loading" && (
          <div className="absolute inset-0 z-10 animate-pulse bg-[var(--border)]" />
        )}
        <Image
          src={imageUrl}
          alt={current.word}
          fill
          className="object-contain p-1 transition-opacity duration-500"
          style={{ opacity: imageState === "loading" ? 0.15 : 1 }}
          sizes="(max-width: 768px) 100vw, 700px"
          priority
        />
      </div>

      {/* Bottom section: word + buttons — always visible */}
      <div className="flex-shrink-0 px-4 pb-[max(env(safe-area-inset-bottom,8px),8px)] pt-3">
        <h2 className="mb-3 text-center text-3xl font-black tracking-tight text-[var(--ink)]">
          {current.word}
        </h2>

        <Btn3D onClick={speak} disabled={audioState === "playing"} color="blue" className="mb-2 w-full">
          {audioState === "playing" ? "Playing..." : `Hear "${current.word}"`}
        </Btn3D>

        <div className="grid grid-cols-2 gap-2">
          <Btn3D onClick={() => go(-1)} color="white" className="w-full">Previous</Btn3D>
          <Btn3D onClick={() => go(1)} color="green" className="w-full">Next</Btn3D>
        </div>

        <div className="mt-2 flex justify-center">
          <a
            href={`/practice?category=${category.id}`}
            className="py-2 text-sm font-extrabold uppercase tracking-wide text-[var(--duo-green)] underline-offset-4 hover:underline"
          >
            Skip to quiz →
          </a>
        </div>
      </div>
    </div>
  );
}
