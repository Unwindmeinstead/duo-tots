"use client";

/* ─── Lesson ───
   One category as a deck of full-stage cards. The word visual is a
   big rounded card whose own bottom band carries the word and the
   pill actions (Previous · Practice · Next) INSIDE the photo —
   variant A (Grey's pick, 2026-11-07).
   FRAME FIX (Grey, 2026-11-08, from his phone screenshot): this
   page frame was the one surface the Kidtopia rebuild never
   migrated — it still painted the pre-redesign full-screen blue
   stage (bg-royal + rings) with an external chrome band (white
   back disc, chunky gold progress bar, "1 / 20" pill) floating
   above a low, centred card. Now the frame matches the rest of
   the app: the clean neutral paper background, ONE hairline of
   progress at the very top, and the card filling the stage under
   it — back arrow, speaker badge and the n/N counter ride INSIDE
   the card (CardChrome, lesson-card.tsx). The deck logic —
   blocked bursts for new words, record-once semantics, the
   completion celebration — is unchanged. */

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { playCelebration, playStarChime, speakWord } from "@/lib/audio";
import { prefetchWordImages, prefetchLocalImages } from "@/lib/media";
import { getLocalImage } from "@/lib/local-images";
import { getSentence } from "@/lib/sentences";
import { WordVisual, deckKeepsTapMotion } from "@/components/word-visual";
import { CelebrationScreen } from "@/components/celebration";
import { SentenceCard } from "@/components/sentence-card";
import { SessionEnd } from "@/components/session-end";
import { PillButton } from "@/components/kit";
import { CardChrome } from "@/components/lesson-card";
import { useScrollLock } from "@/lib/scroll-lock";
import { GlyphChevronL, GlyphChevronR } from "@/components/glyphs";
import { GOLD, INK } from "@/lib/theme";
import {
  getCategoryStars,
  getNextLesson,
  loadProgress,
  recordCategoryView,
  recordWordSeen,
  saveProgress,
  type ProgressState,
} from "@/lib/progress";
import type { VocabCategory, VocabItem } from "@/lib/vocab";

/* seenWords shape is owned by progress.ts — accept a per-category list, a
   flat id list, or a keyed record so the completion gate works either way. */
function allWordsSeen(state: ProgressState, category: VocabCategory): boolean {
  const raw = state.seenWords as unknown;
  if (Array.isArray(raw)) {
    const flat = new Set(raw as string[]);
    return category.items.every(
      (item) => flat.has(item.id) || flat.has(`${category.id}:${item.id}`) || flat.has(`${category.id}/${item.id}`),
    );
  }
  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    const perCategory = record[category.id];
    if (Array.isArray(perCategory)) {
      const seen = new Set(perCategory as string[]);
      return category.items.every((item) => seen.has(item.id));
    }
    if (perCategory && typeof perCategory === "object") {
      const seen = perCategory as Record<string, unknown>;
      return category.items.every((item) => Boolean(seen[item.id]));
    }
    return category.items.every(
      (item) => Boolean(record[item.id]) || Boolean(record[`${category.id}:${item.id}`]),
    );
  }
  return false;
}

/* ─── Deck of steps (blocked bursts for new words) ───
   A step is one screen: a word card, or the word's sentence card.
   Built once per category from the progress loaded at mount — an item
   is NEW when its id is not in the flat seenWords list. The first
   up-to-3 NEW items (in category order) get a blocked burst:
   word → word again ("Say it!") → sentence (when one exists) → word.
   Every other item gets a word step plus its sentence step right
   after, when a sentence exists. */
type DeckStep = {
  kind: "word" | "sentence";
  item: VocabItem;
  sentence?: string;
  sayIt?: boolean;
};

function buildDeck(category: VocabCategory, state: ProgressState): DeckStep[] {
  const seenIds = new Set(state.seenWords);
  const burstIds = new Set(
    category.items
      .filter((item) => !seenIds.has(item.id))
      .slice(0, 3)
      .map((item) => item.id),
  );
  const deck: DeckStep[] = [];
  for (const item of category.items) {
    const sentence = getSentence(category.id, item.id, item.word) ?? undefined;
    if (burstIds.has(item.id)) {
      deck.push({ kind: "word", item });
      deck.push({ kind: "word", item, sayIt: true });
      if (sentence) deck.push({ kind: "sentence", item, sentence });
      deck.push({ kind: "word", item });
    } else {
      deck.push({ kind: "word", item });
      if (sentence) deck.push({ kind: "sentence", item, sentence });
    }
  }
  return deck;
}

const slugOf = (item: VocabItem) =>
  (item.assetKey ?? item.word.toLowerCase()).replace(/\s+/g, "-");

type Phase = "deck" | "celebrate" | "goodbye";

export function LessonClient({ category }: { category: VocabCategory }) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("deck");
  /* One-screen stage: the deck (word + sentence cards) and the
     celebration never scroll — the document locks so a vertical
     drag can't slide the page around under the tap animation.
     The goodbye recap is a summary page and may outgrow short
     screens, so the lock releases for that phase. */
  useScrollLock(phase !== "goodbye");
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  /* Deck is built once, from the progress snapshot loaded at mount —
     later progress updates never rebuild it. */
  const [deck, setDeck] = useState<DeckStep[]>(() => buildDeck(category, progress));
  const [sessionSeen, setSessionSeen] = useState<string[]>([]);
  const [sessionNew, setSessionNew] = useState<string[]>([]);
  const progressRef = useRef(progress);
  const xpAtMount = useRef(progress.xp);
  const celebratedRef = useRef(false);
  /* Completion is ARMED here, never fired: the record effect below
     runs on the last unseen word's first step — firing the
     celebration there would replace that word's card in the same
     commit it mounts, so the final card could never be seen.
     Instead the celebration fires from go(1) when the learner
     advances past the deck's last step. */
  const pendingCelebrateRef = useRef(false);
  const mountedCategoryRef = useRef(category.id);
  /* recordWordSeen fires once per item — on its first word step only. */
  const recordedRef = useRef<Set<string>>(new Set());

  const applyProgress = (next: ProgressState) => {
    progressRef.current = next;
    saveProgress(next);
    setProgress(next);
  };

  /* Record the category view once on mount. If this instance is ever
     reused for another category (no remount), reset the per-category
     guards so the new category can celebrate on its own merits. */
  useEffect(() => {
    if (mountedCategoryRef.current !== category.id) {
      mountedCategoryRef.current = category.id;
      celebratedRef.current = false;
      pendingCelebrateRef.current = false;
      recordedRef.current = new Set();
      xpAtMount.current = progressRef.current.xp;
      setDeck(buildDeck(category, progressRef.current));
      setStepIndex(0);
      setPhase("deck");
      setSessionSeen([]);
      setSessionNew([]);
    }
    applyProgress(recordCategoryView(progressRef.current, category.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.id]);

  const step = deck[stepIndex] ?? deck[0];
  const current = step?.item;
  const itemIndex = useMemo(
    () => (current ? category.items.findIndex((item) => item.id === current.id) : 0),
    [category.items, current],
  );
  const total = category.items.length;
  /* The progress bar follows the deck; the n/N counter keeps item semantics. */
  const pct = deck.length > 0 ? Math.round(((stepIndex + 1) / deck.length) * 100) : 100;

  /* Record every word shown — on its first word step only, including
     the first card on mount — and arm the completion celebration the
     moment the last unseen word completes the category (it fires
     when the learner advances past the final card; see go). */
  useEffect(() => {
    if (!step || !current || step.kind !== "word") return;
    if (recordedRef.current.has(current.id)) return;
    recordedRef.current.add(current.id);
    const stateBefore = progressRef.current;
    const isNew = !stateBefore.seenWords.includes(current.id);
    const next = recordWordSeen(stateBefore, category.id, current.id);
    const before = getCategoryStars(stateBefore, category.id);
    const after = getCategoryStars(next, category.id);
    /* getCategoryStars falls back to 1 for any *viewed* category via
       completedCategories, and the mount view-record above runs before
       this effect — so the before===0 gate alone can never fire. Also
       accept the raw categoryStars 0→≥1 transition, which
       recordWordSeen performs exactly when the last unseen word is seen. */
    const rawBefore = stateBefore.categoryStars[category.id] ?? 0;
    const rawAfter = next.categoryStars[category.id] ?? 0;
    const transitioned = (before === 0 && after >= 1) || (rawBefore === 0 && rawAfter >= 1);
    applyProgress(next);
    setSessionSeen((prev) => (prev.includes(current.word) ? prev : [...prev, current.word]));
    if (isNew) {
      setSessionNew((prev) => (prev.includes(current.word) ? prev : [...prev, current.word]));
    }
    if (transitioned && allWordsSeen(next, category) && !celebratedRef.current) {
      /* Arm only — go(1) fires the celebration once the learner
         steps past the final card, so the card that completed the
         category stays on screen like every other card. */
      pendingCelebrateRef.current = true;
    }
  }, [stepIndex, step, current, category]);

  useEffect(() => {
    const ahead = category.items.slice(itemIndex + 1, itemIndex + 4);
    if (ahead.length === 0) return;
    /* Local rebuilt photos first; the remote API only warms words without one. */
    prefetchLocalImages(ahead.map((i) => getLocalImage(category.id, slugOf(i))));
    if (category.imageMode !== "photo" && category.imageMode !== "vector") return;
    const remoteAhead = ahead.filter((i) => !getLocalImage(category.id, slugOf(i)));
    if (remoteAhead.length > 0) {
      const mode = category.imageMode === "vector" ? "vector" : "photo";
      prefetchWordImages(remoteAhead.map((i) => i.imageQuery), mode);
    }
  }, [itemIndex, category.items, category.imageMode, category.id]);

  const speak = async () => {
    if (!current) return;
    await speakWord(step?.kind === "sentence" && step.sentence ? step.sentence : current.word);
  };

  /* The lesson controls, rendered by the card itself inside the
     photo's bottom band (variant A, Grey's pick 2026-11-07). ONE
     pill family (frame fix, Grey, 2026-11-08): Prev used to be a
     small dark glass disc while Practice/Next were big pills —
     now all three are the same ledge pill at the same size; Prev
     and Practice are white, Next keeps the gold accent. The card
     wraps this node in a click-shield so pressing a control never
     speaks the word. */
  const cardControls = (
    <div className="flex items-center gap-2.5">
      <PillButton small color="#FFFFFF" ink={INK} onClick={() => go(-1)} className="shrink-0" label="Previous card">
        <GlyphChevronL size={19} /> Prev
      </PillButton>
      <div className="flex-1" />
      <PillButton small color="#FFFFFF" ink="#1748AC" href={`/practice?category=${category.id}`} className="shrink-0">
        Practice
      </PillButton>
      <PillButton small color={GOLD} ink="#182642" onClick={() => go(1)} className="shrink-0">
        Next <GlyphChevronR size={19} />
      </PillButton>
    </div>
  );

  /* In-card top chrome (frame fix, Grey, 2026-11-08): back arrow,
     speaker badge and the compact n/N counter ride INSIDE the
     card — the external band that used to carry them is gone. The
     speaker speaks exactly what a card tap speaks (the sentence on
     sentence steps, the word otherwise). */
  const cardChrome = (
    <CardChrome
      backHref="/"
      counter={`${itemIndex + 1}/${total}`}
      onSpeak={() => void speak()}
    />
  );

  /* Prev/Next walk deck steps. Advancing past the last step ends the
     session: with the completion celebration if it was armed by the
     record effect (the star was earned during this walk), otherwise
     with the goodbye ritual; going back from the first step wraps. */
  const go = (dir: -1 | 1) => {
    if (deck.length === 0) return;
    if (dir === 1 && stepIndex >= deck.length - 1) {
      if (pendingCelebrateRef.current && !celebratedRef.current) {
        celebratedRef.current = true;
        pendingCelebrateRef.current = false;
        playCelebration();
        playStarChime();
        setPhase("celebrate");
        return;
      }
      setPhase("goodbye");
      return;
    }
    setStepIndex((prev) =>
      dir === 1
        ? Math.min(prev + 1, deck.length - 1)
        : (prev - 1 + deck.length) % deck.length,
    );
  };

  /* ── Swipe on the stage (word steps): horizontal lock with a
     non-passive touchmove so the browser never hijacks the gesture. */
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swipeLocked = useRef(false);
  const swipeSuppressClick = useRef(false);
  const swipeNodeRef = useRef<HTMLDivElement | null>(null);
  const isSentenceStep = step?.kind === "sentence";

  const handleNativeTouchMove = (e: TouchEvent) => {
    if (!swipeStart.current || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - swipeStart.current.x);
    const dy = Math.abs(t.clientY - swipeStart.current.y);
    if (swipeLocked.current) {
      e.preventDefault();
      return;
    }
    if (dx < 8 && dy < 8) return;
    if (dx > dy * 0.8) {
      swipeLocked.current = true;
      e.preventDefault();
    }
  };

  const swipeRef = (node: HTMLDivElement | null) => {
    if (swipeNodeRef.current) {
      swipeNodeRef.current.removeEventListener("touchmove", handleNativeTouchMove);
    }
    swipeNodeRef.current = node;
    if (node) {
      node.addEventListener("touchmove", handleNativeTouchMove, { passive: false });
    }
  };

  const onStageTouchStart = (e: React.TouchEvent) => {
    if (isSentenceStep || e.touches.length !== 1) return;
    const t = e.touches[0];
    swipeStart.current = { x: t.clientX, y: t.clientY };
    swipeLocked.current = false;
  };
  const onStageTouchCancel = () => {
    swipeStart.current = null;
    swipeLocked.current = false;
  };
  const onStageTouchEnd = (e: React.TouchEvent) => {
    if (isSentenceStep || !swipeStart.current) return;
    const start = swipeStart.current;
    const t = e.changedTouches[0];
    swipeStart.current = null;
    swipeLocked.current = false;
    if (!t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
    swipeSuppressClick.current = true;
    if (dx < 0) go(1);
    else go(-1);
  };
  const onStageMouseDown = (e: React.MouseEvent) => {
    if (isSentenceStep || e.button !== 0) return;
    swipeStart.current = { x: e.clientX, y: e.clientY };
    swipeLocked.current = false;
  };
  const onStageMouseUp = (e: React.MouseEvent) => {
    if (isSentenceStep || !swipeStart.current) return;
    const start = swipeStart.current;
    swipeStart.current = null;
    swipeLocked.current = false;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
    swipeSuppressClick.current = true;
    if (dx < 0) go(1);
    else go(-1);
  };

  if (phase === "celebrate") {
    return (
      <CelebrationScreen
        title="You did it!"
        subtitle={`${category.name} complete`}
        stars={getCategoryStars(progress, category.id)}
        xpEarned={progress.xp - xpAtMount.current}
        keepGoingLabel="Next topic"
        accent={category.color}
        onKeepGoing={() => {
          const nextId = getNextLesson(progress).category.id;
          router.push(nextId === category.id ? "/" : `/lesson/${nextId}`);
        }}
        onFinish={() => setPhase("goodbye")}
        homeHref="/"
      />
    );
  }

  if (phase === "goodbye" || !step || !current) {
    return (
      <SessionEnd
        categoryName={category.name}
        categoryColor={category.color}
        categoryId={category.id}
        newWords={sessionNew}
        seenThisSession={sessionSeen}
        onHome={() => router.push("/")}
      />
    );
  }

  return (
    <div
      className="flex h-dvh min-h-dvh flex-col overflow-hidden bg-paper"
      style={{
        overscrollBehavior: "none",
        touchAction: "none",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* ── Progress: ONE minimal hairline at the very top ──
          (frame fix, Grey, 2026-11-08). The chunky bar, the white
          counter pill and the external back disc that used to live
          in a band here are gone — back, speaker and counter ride
          inside the card (CardChrome); this hairline is the only
          chrome left outside it. */}
      <div
        className="h-[3px] w-full shrink-0 bg-ink/10"
        role="img"
        aria-label={`Card ${itemIndex + 1} of ${total}`}
      >
        <div
          className="kt-bar h-full bg-gold"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* ── Stage ──
          The card fills the stage: it starts right under the
          hairline (a slim 8px breath) and runs to the screen's
          bottom edge (safe-area padded) — the dead space the old
          blue frame left above and below the card is reclaimed. */}
      <div
        className="relative mx-auto min-h-0 w-full max-w-2xl flex-1 px-3 pt-2"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
      >
        {step.sayIt ? (
          <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center">
            <span className="kt-pulse-soft inline-flex items-center rounded-full bg-gold px-4 py-2 text-[15px] font-black text-ink shadow-[0_10px_22px_rgba(14,42,99,0.18)]">
              Say it!
            </span>
          </div>
        ) : null}

        <div
          ref={swipeRef}
          className="relative h-full touch-none"
          onTouchStart={onStageTouchStart}
          onTouchEnd={onStageTouchEnd}
          onTouchCancel={onStageTouchCancel}
          onMouseDown={onStageMouseDown}
          onMouseUp={onStageMouseUp}
          onClickCapture={(e) => {
            if (swipeSuppressClick.current) {
              swipeSuppressClick.current = false;
              e.stopPropagation();
              e.preventDefault();
            }
          }}
        >
          {isSentenceStep ? (
            <SentenceCard
              key={`sentence-${stepIndex}`}
              word={current.word}
              sentence={step.sentence ?? ""}
              categoryColor={category.color}
              imageSrc={getLocalImage(category.id, slugOf(current)) ?? null}
              onSpeak={speak}
              noBounce={!deckKeepsTapMotion(category.imageMode)}
              footer={cardControls}
              chrome={cardChrome}
            />
          ) : (
            <WordVisual
              key={current.id}
              word={current.word}
              imageQuery={current.imageQuery}
              assetKey={current.assetKey}
              imageMode={category.imageMode}
              categoryColor={category.color}
              categoryId={category.id}
              stepKey={stepIndex}
              onTap={speak}
              footer={cardControls}
              chrome={cardChrome}
            />
          )}
        </div>
      </div>
    </div>
  );
}
