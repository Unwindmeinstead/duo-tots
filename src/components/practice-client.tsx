"use client";

/* ─── Practice ───
   "Find the word" rounds in the reference card anatomy: the prompt
   is the hero in the blue zone, choices are big tactile picture
   tiles on the white sheet, and feedback is a sheet panel swap with
   Pip — gentle, never red, child-paced (no auto-advance). Session
   logic (sampled deck, re-queue on a miss, scoring) is unchanged. */

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { prefetchWordImages, prefetchLocalImages, resolveWordImage } from "@/lib/media";
import { getLocalImage } from "@/lib/local-images";
import { playCorrect, playGentle, speakWord } from "@/lib/audio";
import { PillButton, Sparkles } from "@/components/kit";
import { Mascot } from "@/components/mascot";
import { CATEGORY_GLYPHS, GlyphCheck, GlyphSpeaker, GlyphStar } from "@/components/glyphs";
import { COLOR_MAP, ShapeArt } from "@/components/word-visual";
import { CelebrationScreen } from "@/components/celebration";
import { loadProgress, recordPracticeAttempt, saveProgress, type ProgressState } from "@/lib/progress";
import { GREEN, GREEN_DEEP, tint } from "@/lib/theme";
import { type VocabCategory, type VocabItem } from "@/lib/vocab";

const pickOptions = (items: VocabItem[], answer: VocabItem) => {
  const pool = items.filter((i) => i.id !== answer.id);
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 2);
  return [...shuffled, answer].sort(() => Math.random() - 0.5);
};

/* ─── Tile pictures ───
   Resolved exactly like the lesson card: QC-passed local photo
   first, then the remote media pipeline for photo/vector words,
   then the static per-category art — always whole (contain over a
   blurred copy of itself, never cropped). Non-photo modes draw
   their own hero, mirroring the lesson visuals. */

function OptionPicture({ item, category }: { item: VocabItem; category: VocabCategory }) {
  const mode = category.imageMode;
  const slug = (item.assetKey ?? item.word.toLowerCase()).replace(/\s+/g, "-");
  const localSrc = getLocalImage(category.id, slug);
  const wantsRemote = !localSrc && (mode === "photo" || mode === "vector");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [staticFailed, setStaticFailed] = useState(false);

  /* Reset the fallbacks when the tile's word changes. */
  const tileKey = `${category.id}:${item.id}`;
  const [prevTileKey, setPrevTileKey] = useState(tileKey);
  if (prevTileKey !== tileKey) {
    setPrevTileKey(tileKey);
    setStaticFailed(false);
    setRemoteUrl("");
  }

  useEffect(() => {
    if (!wantsRemote) return;
    let mounted = true;
    resolveWordImage(item.imageQuery, mode === "vector" ? "vector" : "photo").then((res) => {
      if (!mounted) return;
      setRemoteUrl(res.imageUrl);
    });
    return () => {
      mounted = false;
    };
  }, [wantsRemote, item.imageQuery, mode]);

  const frame = "relative flex h-[8.5rem] w-full items-center justify-center overflow-hidden rounded-[20px]";

  if (mode === "digit") {
    return (
      <span className={frame} style={{ background: tint(category.color, 0.88) }}>
        <span
          className="font-black tabular-nums leading-none"
          style={{ color: category.color, fontSize: item.word.length >= 3 ? 40 : item.word.length === 2 ? 52 : 64 }}
        >
          {item.word}
        </span>
      </span>
    );
  }

  if (mode === "alphabet") {
    return (
      <span className={frame} style={{ background: tint(category.color, 0.88) }}>
        <span className="text-[64px] font-black uppercase leading-none tracking-tight" style={{ color: category.color }}>
          {(item.word.trim().slice(0, 1) || item.word).toUpperCase()}
        </span>
      </span>
    );
  }

  if (mode === "color") {
    return (
      <span className={frame} style={{ background: tint(category.color, 0.88) }}>
        <span
          className="h-16 w-16 rounded-full shadow-[inset_0_-6px_0_rgba(0,0,0,0.12)]"
          style={{ background: COLOR_MAP[item.word] ?? category.color }}
        />
      </span>
    );
  }

  if (mode === "shape") {
    return (
      <span className={frame} style={{ background: tint(category.color, 0.88) }}>
        <ShapeArt word={item.word} size={84} color={category.color} />
      </span>
    );
  }

  const staticSrc =
    mode === "static" && !staticFailed
      ? `/images/${category.id}/${slug}.${category.id === "actions" || category.id === "emotions" ? "png" : "svg"}`
      : "";
  const src = localSrc ?? (remoteUrl || staticSrc);

  if (src) {
    return (
      <span className={`${frame} bg-mist`}>
        <Image src={src} alt="" aria-hidden fill className="scale-110 object-cover blur-xl brightness-90 saturate-[1.15]" sizes="140px" />
        <Image
          src={src}
          alt={item.word}
          fill
          className="object-contain"
          sizes="140px"
          onError={mode === "static" && !localSrc ? () => setStaticFailed(true) : undefined}
        />
      </span>
    );
  }

  /* No picture (yet): concept words show the word itself big, like
     their lesson cards; photo words fall back to the category glyph
     while the remote lookup resolves. */
  const Glyph = CATEGORY_GLYPHS[category.id] ?? CATEGORY_GLYPHS.kid_general;
  return (
    <span className={frame} style={{ background: tint(category.color, 0.88) }}>
      {mode === "card" ? (
        <span className="px-1 text-center text-[20px] font-black leading-tight" style={{ color: category.color }}>
          {item.word}
        </span>
      ) : (
        <span style={{ color: category.color, opacity: 0.8 }}>
          <Glyph size={44} />
        </span>
      )}
    </span>
  );
}

export function PracticeClient({ category }: { category: VocabCategory }) {
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [xpAtMount] = useState(progress.xp);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [wiggleWord, setWiggleWord] = useState<string | null>(null);
  const [audioState, setAudioState] = useState<"idle" | "playing">("idle");

  /* A session is a shuffled sample, never the whole category — a
     toddler session must be finishable. */
  const [deck, setDeck] = useState<VocabItem[]>(() =>
    [...category.items].sort(() => Math.random() - 0.5).slice(0, Math.min(10, category.items.length)),
  );
  const total = deck.length;
  /* Summary is scored against the session's original size: a missed
     question that re-queues and is later answered correctly counts
     as learned, not as an extra question. */
  const [sessionTotal] = useState(total);
  const answer = deck[round % total];
  const options = useMemo(() => pickOptions(category.items, answer), [category.items, answer]);
  const Glyph = CATEGORY_GLYPHS[category.id] ?? CATEGORY_GLYPHS.kid_general;
  /* Progress pips mirror rounds answered (right or warmly wrong) —
     never a score. A re-queued miss grows the deck, so a wrong
     answer fills proportionally less. */
  const answeredCount = round + (feedback ? 1 : 0);

  const promptLine =
    category.id === "numbers"
      ? "Find the number!"
      : category.id === "shapes"
        ? "Find the shape!"
        : category.id === "alphabets"
          ? "Find the letter!"
          : category.id === "actions"
            ? "Find the action!"
            : "Find the picture!";

  useEffect(() => {
    const nextIdx = (round + 1) % total;
    const ahead = [deck[nextIdx], deck[(nextIdx + 1) % total]];
    const slugOf = (i: VocabItem) => (i.assetKey ?? i.word.toLowerCase()).replace(/\s+/g, "-");
    prefetchLocalImages(ahead.map((i) => getLocalImage(category.id, slugOf(i))));
    if (category.imageMode !== "photo" && category.imageMode !== "vector") return;
    const remoteAhead = ahead.filter((i) => !getLocalImage(category.id, slugOf(i)));
    if (remoteAhead.length > 0) {
      const mode = category.imageMode === "vector" ? "vector" : "photo";
      prefetchWordImages(remoteAhead.map((i) => i.imageQuery), mode);
    }
  }, [round, total, deck, category.imageMode, category.id]);

  const choose = (word: string) => {
    if (feedback) return;
    setSelected(word);
    const isCorrect = word === answer.word;
    const next = recordPracticeAttempt(progress, category.id, answer.word, isCorrect);
    saveProgress(next);
    setProgress(next);
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      playCorrect();
      setScore((s) => s + 1);
      setBurstKey((k) => k + 1);
    } else {
      /* A gentle descending bloop — informing, never scolding. The
         picked tile wiggles once, warmly, and the missed question
         re-queues at the end of this same deck; no penalty. */
      playGentle();
      setWiggleWord(word);
      window.setTimeout(() => setWiggleWord((w) => (w === word ? null : w)), 450);
      setDeck((prev) => [...prev, answer]);
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
    setBurstKey(0);
    setWiggleWord(null);
  }, [round, total]);

  const resetDeck = useCallback(() => {
    setDeck([...category.items].sort(() => Math.random() - 0.5).slice(0, Math.min(10, category.items.length)));
    setRound(0);
    setScore(0);
    setShowSummary(false);
    setFeedback(null);
    setSelected(null);
    setBurstKey(0);
    setWiggleWord(null);
  }, [category.items]);

  const speak = async () => {
    setAudioState("playing");
    await speakWord(answer.word);
    setAudioState("idle");
  };

  /* ── Summary ── */
  if (showSummary) {
    return (
      <CelebrationScreen
        title="You did it!"
        subtitle={`${score} of ${sessionTotal} found`}
        stars={score === sessionTotal ? 3 : sessionTotal > 0 && score / sessionTotal >= 0.6 ? 2 : 1}
        xpEarned={progress.xp - xpAtMount}
        keepGoingLabel="Play again"
        accent={category.color}
        onKeepGoing={resetDeck}
        homeHref="/"
      />
    );
  }

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      {/* ── Blue zone: category, title, pips, the prompt hero ── */}
      <div className="blue-rings px-4 pb-5 pt-[max(0.9rem,env(safe-area-inset-top))] min-[402px]:px-5">
        <header className="mx-auto flex w-full max-w-md items-center gap-3.5">
          <span
            className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-white"
            style={{ background: category.color, boxShadow: "inset 0 -5px 0 rgba(0,0,0,0.15)" }}
            aria-hidden
          >
            <Glyph size={30} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[21px] font-black text-white">{category.name}</h1>
            <div className="mt-2 flex items-center gap-1.5" role="img" aria-label={`${answeredCount} of ${total} done`}>
              {Array.from({ length: total }).map((_, i) => (
                <span
                  key={i}
                  className="h-[10px] w-6 rounded-full transition-all duration-300"
                  style={{ background: i < answeredCount ? "#FFC531" : "rgba(255,255,255,0.25)" }}
                />
              ))}
            </div>
          </div>
        </header>

        <div className="mt-4 text-center">
          <p className="text-[16px] font-black text-white/70">{promptLine}</p>
          <div className="relative mt-1 inline-flex max-w-full items-center justify-center gap-3">
            <button
              type="button"
              onClick={audioState === "playing" ? undefined : speak}
              disabled={audioState === "playing"}
              aria-label={`Hear the word ${answer.word}`}
              className="min-w-0 truncate text-[44px] font-black leading-tight tracking-tight text-white transition-transform active:scale-95 disabled:opacity-60"
            >
              {answer.word}
            </button>
            <button
              type="button"
              onClick={audioState === "playing" ? undefined : speak}
              disabled={audioState === "playing"}
              aria-label="Hear the word"
              className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gold text-ink shadow-[0_10px_22px_rgba(14,42,99,0.18)] transition-transform active:scale-90 disabled:opacity-50"
            >
              <GlyphSpeaker size={26} />
            </button>
            {feedback === "correct" && <Sparkles burstKey={burstKey} />}
          </div>
        </div>
      </div>

      {/* ── White sheet: choices + feedback ── */}
      <div className="flex flex-1 flex-col rounded-t-[32px] bg-white px-4 pt-5 min-[402px]:px-5" style={{ paddingBottom: "max(calc(env(safe-area-inset-bottom, 0px) + 14px), 18px)" }}>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
          <div className="flex flex-1 flex-col justify-center">
          <div className="grid grid-cols-3 gap-3" key={`${round}-${answer.id}`}>
            {options.map((option) => {
              const isAnswerTile = option.word === answer.word;
              const isPicked = option.word === selected;
              const showCorrect = feedback !== null && isAnswerTile;
              const showWrongPick = feedback === "wrong" && isPicked && !isAnswerTile;
              const dimmed = feedback !== null && !isAnswerTile && !isPicked;
              const wiggling = wiggleWord === option.word;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-label={option.word}
                  onClick={() => choose(option.word)}
                  className={`kt-card relative flex min-h-[12rem] flex-col items-center justify-center gap-1.5 px-2 py-3 ${
                    wiggling ? "kt-wiggle" : showCorrect ? (feedback === "correct" ? "kt-pop-in" : "kt-pulse-soft") : ""
                  } ${dimmed ? "opacity-60" : ""}`}
                  style={{
                    background: showCorrect ? tint(GREEN, 0.86) : showWrongPick ? "#FFF3D6" : "#FFFFFF",
                  }}
                >
                  <OptionPicture item={option} category={category} />
                  <span className="max-w-full truncate text-[14px] font-black text-ink">{option.word}</span>
                  {showCorrect && (
                    <span className="kt-pop-in absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full text-white" style={{ background: GREEN }}>
                      <GlyphCheck size={20} />
                    </span>
                  )}
                  {showWrongPick && (
                    <span className="kt-pop-in absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-gold text-ink" aria-hidden>
                      <GlyphStar size={19} />
                    </span>
                  )}
                  {feedback === "correct" && isAnswerTile && <Sparkles burstKey={burstKey} />}
                </button>
              );
            })}
          </div>

          </div>

          {/* Feedback panel + child-paced advance */}
          <div className="mt-auto pt-5">
            {feedback ? (
              <div className="flex flex-col gap-3">
                <div
                  className="kt-pop-in flex min-h-[60px] items-center gap-3 rounded-[24px] px-4 py-2.5"
                  style={{ background: feedback === "correct" ? tint(GREEN, 0.86) : "#FFF3D6" }}
                >
                  <span className="shrink-0" aria-hidden>
                    <Mascot pose={feedback === "correct" ? "celebrate" : "point"} size={52} />
                  </span>
                  <p
                    className="min-w-0 flex-1 break-words text-[17px] font-black leading-snug"
                    style={{ color: feedback === "correct" ? GREEN_DEEP : "#B07E00" }}
                  >
                    {feedback === "correct" ? "You found it!" : "Good try!"}
                    {feedback === "wrong" && (
                      <span className="ml-2 text-[14.5px] font-bold text-soft">{`The answer is ${answer.word}.`}</span>
                    )}
                  </p>
                </div>
                <PillButton
                  color={feedback === "wrong" ? "#FFC531" : GREEN}
                  ink={feedback === "wrong" ? "#182642" : "#FFFFFF"}
                  onClick={advance}
                  className="min-h-[64px] w-full text-[20px]"
                >
                  {round + 1 >= total ? "Finish" : feedback === "wrong" ? "Got it" : "Continue"}
                </PillButton>
              </div>
            ) : (
              <div className="h-[148px]" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
