"use client";

/* ─── Game 10 — Animal Pick ───
   The animal's name is CALLED OUT — spoken by the read-back voice
   and written big — and three real animal photos wait below (the
   vertical Animals-lesson portraits). Tap the animal you heard.
   Every round deals a fresh target and two fresh decoys from the
   full 30-animal pool, in shuffled seats — identification, never
   position memory. A wrong tap wiggles with the gentle companion
   ding; no fail state. */

import { useMemo, useState } from "react";
import { GlyphCheck, GlyphSpeaker } from "@/components/glyphs";
import { playCorrect, playGentle, speakWord } from "@/lib/audio";
import { sample, shuffle } from "@/lib/games-data";
import { getLocalImage } from "@/lib/local-images";
import { categories } from "@/lib/vocab";
import { GREEN, GREEN_DEEP } from "@/lib/theme";
import { ChoiceButton, GameCelebration, GameHeader, GameSheet, NextButton, PromptRow, useAutoAnnounce, useGameCompletion } from "./shared";

const ACCENT = "#34C759";
const TOTAL = 5;

type Animal = { word: string; slug: string; src: string };

/** The full Animals pool, restricted to animals that actually have
    a local portrait on disk (all 30 do after the vertical waves). */
function animalPool(): Animal[] {
  const cat = categories.find((c) => c.id === "animals");
  if (!cat) return [];
  const out: Animal[] = [];
  for (const item of cat.items) {
    const slug = item.id.replace(/^ani-/, "");
    const src = getLocalImage("animals", slug);
    if (src) out.push({ word: item.word, slug, src });
  }
  return out;
}

type AnimalRound = { target: Animal; choices: Animal[] };

function makeAnimalRounds(count = TOTAL): AnimalRound[] {
  const pool = animalPool();
  const targets = sample(pool, count);
  return targets.map((target) => ({
    target,
    choices: shuffle([target, ...sample(pool.filter((a) => a.slug !== target.slug), 2)]),
  }));
}

export function AnimalPick({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [found, setFound] = useState(false);
  const [wiggleSlug, setWiggleSlug] = useState<string | null>(null);
  const [session, setSession] = useState(0);
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-animal-pick");

  const rounds = useMemo(
    () => makeAnimalRounds(TOTAL),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session],
  );
  const { target, choices } = rounds[round];

  /* Call the animal out as each round lands — hearing the word is
     half the game. The shared hook speaks it exactly once per
     round and stays silent when the parent sound setting is off. */
  useAutoAnnounce(`Find the ${target.word.toLowerCase()}!`, `${session}-${round}`);

  const pick = (a: Animal) => {
    if (found) return;
    if (a.slug === target.slug) {
      playCorrect();
      setFound(true);
    } else {
      playGentle();
      setWiggleSlug(a.slug);
      window.setTimeout(() => setWiggleSlug((w) => (w === a.slug ? null : w)), 450);
    }
  };

  const next = () => {
    if (round + 1 >= TOTAL) {
      finish();
      return;
    }
    setRound((r) => r + 1);
    setFound(false);
    setWiggleSlug(null);
  };

  const replay = () => {
    resetCompletion();
    setSession((s) => s + 1);
    setRound(0);
    setFound(false);
    setWiggleSlug(null);
  };

  if (xpEarned !== null) {
    return (
      <GameCelebration
        title="You did it!"
        subtitle="Animal pick complete"
        xpEarned={xpEarned}
        accent={ACCENT}
        onReplay={replay}
      />
    );
  }

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      <GameHeader title="Animal pick" onBack={onBack} step={round} total={TOTAL} />
      <GameSheet>
        {/* The shared speaker button speaks the exact same string
            the round auto-speaks, tracking the freshly dealt animal. */}
        <PromptRow speakText={`Find the ${target.word.toLowerCase()}!`} accent={ACCENT} large>
          Find the {target.word.toLowerCase()}!
        </PromptRow>

        {/* Centre stage — before the pick it holds a big listening
            disc (tap it to hear the call-out again); on the find,
            the animal's own portrait pops up large centre-stage,
            the way the other games stage their found item. */}
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          {found ? (
            <>
              <div className="kt-pop-in relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={target.src}
                  alt={target.word}
                  className="h-[280px] w-[210px] rounded-[24px] object-cover"
                  draggable={false}
                />
                <span
                  className="absolute -right-2 -top-2 grid h-10 w-10 place-items-center rounded-full text-white"
                  style={{ background: GREEN }}
                >
                  <GlyphCheck size={21} />
                </span>
              </div>
              <p className="mt-4 h-6 text-[17px] font-black" style={{ color: GREEN_DEEP }}>
                {`That's the ${target.word.toLowerCase()}!`}
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                aria-label={`Hear it again: find the ${target.word.toLowerCase()}`}
                onClick={() => void speakWord(`Find the ${target.word.toLowerCase()}!`)}
                className="kt-pulse-soft grid h-28 w-28 place-items-center rounded-full text-white transition-transform active:scale-95"
                style={{ background: ACCENT }}
              >
                <GlyphSpeaker size={52} />
              </button>
              <p className="mt-4 h-6 text-[17px] font-black text-soft">Listen… who is it?</p>
            </>
          )}
        </div>

        <div className="flex min-h-[104px] flex-col justify-center">
          {found ? (
            <NextButton label={round + 1 >= TOTAL ? "Finish" : "Next"} accent={ACCENT} onClick={next} />
          ) : (
            <div className="flex gap-3">
              {choices.map((a) => (
                <ChoiceButton
                  key={a.slug}
                  label={a.word}
                  wiggling={wiggleSlug === a.slug}
                  onTap={() => pick(a)}
                >
                  {/* The card IS the photo — portrait tile, no crop games */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.src}
                    alt={a.word}
                    className="h-[118px] w-[88px] rounded-[16px] object-cover"
                    draggable={false}
                  />
                  <span className="text-[14px] font-bold text-soft">{a.word}</span>
                </ChoiceButton>
              ))}
            </div>
          )}
        </div>
      </GameSheet>
    </div>
  );
}
