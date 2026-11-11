"use client";

/* ─── Game 20 — Add It Up (math: first adding) ───
   Picture maths: two groups of shapes and a big equation —
   "2 + 1 = ?" — with the question asked out loud in words.
   Rounds alternate between two ways to answer: TAP one of
   three big numbers, or TRACE the answer digit on the
   drawing board (the shared trace engine from the drawing
   games, forgiving as ever). Sums start within 5 and grow
   to 10; every round is generated fresh — new numbers, new
   shapes, new answer spots — so the child adds, not
   remembers. A wrong tap only wiggles, softly. */

import { useMemo, useState } from "react";
import { playCorrect, playGentle, speakWord } from "@/lib/audio";
import { NUMBER_WORDS, randomInt, sample, shuffle, type ShapeId } from "@/lib/games-data";
import { GREEN_DEEP } from "@/lib/theme";
import { ShapeSvg } from "./shapes";
import { TraceStage, type TraceItem } from "./draw-shared";
import {
  ChoiceButton,
  GameCelebration,
  GameHeader,
  GameSheet,
  NextButton,
  PromptRow,
  useAutoAnnounce,
  useGameCompletion,
} from "./shared";

const ACCENT = "#F0519B";
const TOTAL = 5;

type AddRound = {
  a: number;
  b: number;
  mode: "tap" | "trace";
  shape: ShapeId;
  color: string;
  name: string;
  choices: number[];
};

const OBJECTS: { shape: ShapeId; color: string; name: string }[] = [
  { shape: "star", color: "#FFC531", name: "stars" },
  { shape: "heart", color: "#F24949", name: "hearts" },
  { shape: "circle", color: "#2B7FFF", name: "circles" },
  { shape: "triangle", color: "#34C759", name: "triangles" },
  { shape: "diamond", color: "#8B5CF6", name: "diamonds" },
];

function makeRounds(): AddRound[] {
  /* Deal the modes mixed — never two traces back to back. */
  let modes = shuffle(["tap", "trace", "tap", "trace", "tap"] as const);
  for (let i = 1; i < modes.length; i++) {
    if (modes[i] === "trace" && modes[i - 1] === "trace") {
      const swapAt = modes.findIndex((m, j) => j > i && m === "tap");
      if (swapAt > i) {
        [modes[i], modes[swapAt]] = [modes[swapAt], modes[i]];
      }
    }
  }
  modes = [...modes];
  const objects = shuffle(OBJECTS);
  const rounds: AddRound[] = [];
  let prevKey = "";
  for (let i = 0; i < TOTAL; i++) {
    const maxSum = i < 2 ? 5 : 10;
    let a = 1;
    let b = 1;
    for (let tries = 0; tries < 24; tries++) {
      a = randomInt(1, maxSum - 1);
      b = randomInt(1, maxSum - a);
      if (`${a}+${b}` !== prevKey) break;
    }
    prevKey = `${a}+${b}`;
    const sum = a + b;
    const distractors = sample(
      [sum + 1, sum - 1, sum + 2, sum - 2].filter((n) => n >= 1 && n !== sum),
      2,
    );
    const obj = objects[i % objects.length];
    rounds.push({
      a,
      b,
      mode: modes[i],
      shape: obj.shape,
      color: obj.color,
      name: obj.name,
      choices: shuffle([sum, ...distractors]),
    });
  }
  return rounds;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function AddItUp({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [session, setSession] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wiggleNum, setWiggleNum] = useState<number | null>(null);
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-add-it-up");

  const rounds = useMemo(
    () => makeRounds(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session],
  );
  const current = rounds[round];
  const sum = current.a + current.b;
  const aWord = NUMBER_WORDS[current.a - 1];
  const bWord = NUMBER_WORDS[current.b - 1];
  const sumWord = NUMBER_WORDS[sum - 1];

  const prompt =
    current.mode === "trace"
      ? `Trace the answer! What is ${aWord} plus ${bWord}?`
      : `What is ${aWord} plus ${bWord}?`;
  useAutoAnnounce(prompt, `${session}-${round}`);

  const pick = (n: number) => {
    if (solved) return;
    if (n === sum) {
      playCorrect();
      void speakWord(`Yes! ${cap(aWord)} plus ${bWord} equals ${sumWord}!`);
      setSolved(true);
    } else {
      playGentle();
      setWiggleNum(n);
      window.setTimeout(() => setWiggleNum((w) => (w === n ? null : w)), 450);
    }
  };

  const next = () => {
    if (round + 1 >= TOTAL) {
      finish();
      return;
    }
    setRound((r) => r + 1);
    setSolved(false);
    setWiggleNum(null);
  };

  const replay = () => {
    resetCompletion();
    setSession((s) => s + 1);
    setRound(0);
    setSolved(false);
    setWiggleNum(null);
  };

  if (xpEarned !== null) {
    return (
      <GameCelebration
        title="You did it!"
        subtitle="Add it up complete"
        xpEarned={xpEarned}
        accent={ACCENT}
        onReplay={replay}
      />
    );
  }

  const traceItem: TraceItem = {
    key: `add-${session}-${round}`,
    prompt,
    doneText: `Yes! ${cap(aWord)} plus ${bWord} equals ${sumWord}!`,
    guide: { kind: "text", text: String(sum) },
  };

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      <GameHeader title="Add it up" onBack={onBack} step={round} total={TOTAL} />
      <GameSheet>
        <PromptRow speakText={prompt} accent={ACCENT}>
          {prompt}
        </PromptRow>

        {/* The picture problem — two groups of shapes, the
            equation underneath in big digits. */}
        <div className="pt-3">
          <div className="kt-card mx-auto flex w-full max-w-md flex-col items-center gap-2 px-4 py-4">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <span className="flex max-w-[128px] flex-wrap items-center justify-center gap-1.5">
                {Array.from({ length: current.a }, (_, i) => (
                  <ShapeSvg key={`a-${i}`} shape={current.shape} color={current.color} size={38} />
                ))}
              </span>
              <span className="text-[34px] font-black leading-none text-ink">+</span>
              <span className="flex max-w-[128px] flex-wrap items-center justify-center gap-1.5">
                {Array.from({ length: current.b }, (_, i) => (
                  <ShapeSvg key={`b-${i}`} shape={current.shape} color={current.color} size={38} />
                ))}
              </span>
            </div>
            <p className="text-[40px] font-black leading-none tracking-wide text-ink" aria-label={`${current.a} plus ${current.b} equals`}>
              {current.a} + {current.b} ={" "}
              <span style={{ color: solved || current.mode === "trace" ? "inherit" : ACCENT }}>
                {current.mode === "tap" && solved ? sum : "?"}
              </span>
            </p>
            <p className="text-[13px] font-bold capitalize text-soft">
              {current.a} {current.name} and {current.b} more — how many altogether?
            </p>
          </div>
        </div>

        {current.mode === "trace" ? (
          <TraceStage
            key={traceItem.key}
            item={traceItem}
            accent={ACCENT}
            aspect="square"
            colorSeed={round}
            isLast={round + 1 >= TOTAL}
            onNext={next}
          />
        ) : (
          <>
            <div className="flex flex-1 flex-col items-center justify-center py-2">
              <p className="h-6 text-[17px] font-black" style={{ color: solved ? GREEN_DEEP : "transparent" }}>
                {solved ? `Yes — ${aWord} plus ${bWord} is ${sumWord}!` : " "}
              </p>
            </div>
            {/* Answer numbers / next — fixed-height slot */}
            <div className="flex min-h-[104px] flex-col justify-center">
              {solved ? (
                <NextButton label={round + 1 >= TOTAL ? "Finish" : "Next"} accent={ACCENT} onClick={next} />
              ) : (
                <div className="flex gap-3">
                  {current.choices.map((n) => (
                    <ChoiceButton key={n} label={`Number ${n}`} wiggling={wiggleNum === n} onTap={() => pick(n)}>
                      <span className="text-[46px] font-black leading-none text-ink">{n}</span>
                      <span className="text-[13px] font-bold capitalize text-soft">{NUMBER_WORDS[n - 1]}</span>
                    </ChoiceButton>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </GameSheet>
    </div>
  );
}
