"use client";

/* ─── Game 17 — Bowling Roll (physics: rolling + counting) ───
   Six pins stand at the end of the lane. Tap ROLL (or swipe
   up the lane) and the ball rolls down and knocks some pins
   over — then the counting starts: every fallen pin wears a
   gold halo, the child taps them one by one, and each tap
   pops a big number badge onto the pin and speaks the number
   out loud. Every roll knocks pins down and every roll is
   celebrated; the pins always stand back up for the next
   roll. Three rolls per playthrough. */

import { useEffect, useMemo, useRef, useState } from "react";
import { PillButton } from "@/components/kit";
import { isSoundEnabled, playCorrect, playPop, speakWord } from "@/lib/audio";
import { NUMBER_WORDS, randomInt, sample, shuffle } from "@/lib/games-data";
import { GOLD, INK, deepen } from "@/lib/theme";
import {
  GameCelebration,
  GameHeader,
  GameSheet,
  NextButton,
  PromptRow,
  useAutoAnnounce,
  useGameCompletion,
} from "./shared";

const ACCENT = "#8B5CF6";
const TOTAL = 3;

/* Pin bases (x, y) and display scale, back row first so the
   painter's order overlaps correctly. */
const PINS = [
  { x: 180, y: 66, s: 0.78 },
  { x: 161, y: 90, s: 0.9 },
  { x: 199, y: 90, s: 0.9 },
  { x: 142, y: 114, s: 1 },
  { x: 180, y: 114, s: 1 },
  { x: 218, y: 114, s: 1 },
];

type Phase = "aim" | "rolling" | "fall" | "count" | "counted";

function PinShape() {
  return (
    <>
      <path
        d="M-8.5,0 C-10.5,-8 -7.5,-13.5 -5.5,-18.5 C-7.5,-24.5 -6.5,-34 0,-34 C6.5,-34 7.5,-24.5 5.5,-18.5 C7.5,-13.5 10.5,-8 8.5,0 Z"
        fill="#FFFFFF"
        stroke="#D8DEE9"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="-5.9" y="-22.5" width="11.8" height="3.6" rx="1.8" fill="#F24949" />
    </>
  );
}

export function BowlingRoll({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [session, setSession] = useState(0);
  const [phase, setPhase] = useState<Phase>("aim");
  const [ball, setBall] = useState<{ x: number; y: number; r: number; spin: number } | null>(null);
  const [fallen, setFallen] = useState<Set<number>>(new Set());
  const [badges, setBadges] = useState<Map<number, number>>(new Map());
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-bowling-roll");

  const ballColors = useMemo(
    () => shuffle(["#8B5CF6", "#F24949", "#2B7FFF", "#F0519B"]).slice(0, TOTAL),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session],
  );
  const ballColor = ballColors[round];

  const phaseRef = useRef<Phase>("aim");
  const rafRef = useRef(0);
  const timeoutRef = useRef(0);
  const swipeRef = useRef<{ y: number } | null>(null);

  const counted = badges.size;
  const fallenCount = fallen.size;

  const prompt =
    phase === "count"
      ? "Tap each pin that fell. Count with me!"
      : phase === "counted"
        ? `You knocked down ${fallenCount} pins!`
        : "Roll the ball! Knock the pins down!";
  useAutoAnnounce(prompt, `${session}-${round}-${phase}`);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const roll = () => {
    if (phaseRef.current !== "aim") return;
    /* Deal the fall now so the ball and the pins agree: 3–6
       pins, the front pin always among them. */
    const k = sample([3, 4, 4, 5, 5, 6], 1)[0];
    const others = shuffle([0, 1, 2, 3, 5]).slice(0, k - 1);
    const fallenSet = new Set<number>([4, ...others]);
    const drift = randomInt(-16, 16);
    setPhaseBoth("rolling");
    playPop();
    const start = performance.now();
    const DURATION = 950;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const ease = 1 - (1 - t) * (1 - t);
      setBall({
        x: 180 + drift * ease,
        y: 246 - 140 * ease,
        r: 18 - 8 * ease,
        spin: ease * 320,
      });
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      setFallen(fallenSet);
      playCorrect();
      if (isSoundEnabled()) void speakWord("Down they go!");
      setPhaseBoth("fall");
      timeoutRef.current = window.setTimeout(() => {
        setBall(null);
        setPhaseBoth("count");
      }, 650);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const tapPin = (i: number) => {
    if (phaseRef.current !== "count") return;
    if (!fallen.has(i) || badges.has(i)) return;
    const n = badges.size + 1;
    const nextBadges = new Map(badges);
    nextBadges.set(i, n);
    setBadges(nextBadges);
    playCorrect();
    if (isSoundEnabled()) void speakWord(`${NUMBER_WORDS[n - 1]}!`);
    if (n >= fallen.size) {
      timeoutRef.current = window.setTimeout(() => setPhaseBoth("counted"), 500);
    }
  };

  const next = () => {
    if (round + 1 >= TOTAL) {
      finish();
      return;
    }
    setFallen(new Set());
    setBadges(new Map());
    setBall(null);
    setPhaseBoth("aim");
    setRound((r) => r + 1);
  };

  const replay = () => {
    resetCompletion();
    setFallen(new Set());
    setBadges(new Map());
    setBall(null);
    setPhaseBoth("aim");
    setSession((s) => s + 1);
    setRound(0);
  };

  if (xpEarned !== null) {
    return (
      <GameCelebration
        title="You did it!"
        subtitle="Bowling roll complete"
        xpEarned={xpEarned}
        accent={ACCENT}
        onReplay={replay}
      />
    );
  }

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      <GameHeader title="Bowling roll" onBack={onBack} step={round} total={TOTAL} />
      <GameSheet>
        <PromptRow speakText={prompt} accent={ACCENT}>
          {prompt}
        </PromptRow>

        {/* The lane */}
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <div className="w-full max-w-md overflow-hidden" style={{ borderRadius: 28 }}>
            <svg
              viewBox="0 0 360 280"
              className="block h-auto w-full touch-none select-none"
              role="img"
              aria-label="A bowling lane with six pins"
              onPointerDown={(e) => {
                swipeRef.current = { y: e.clientY };
              }}
              onPointerUp={(e) => {
                const startY = swipeRef.current?.y;
                swipeRef.current = null;
                if (startY !== undefined && startY - e.clientY > 36) roll();
              }}
            >
              <rect x="0" y="0" width="360" height="280" fill="#E8EEFB" />
              {/* Lane + gutters */}
              <polygon points="104,30 256,30 344,280 16,280" fill="#D98E4A" />
              <polygon points="128,30 232,30 322,280 38,280" fill="#F0BE7E" />
              <polygon points="168,30 192,30 218,280 142,280" fill="#F7D29A" opacity="0.7" />
              {/* Pins */}
              {PINS.map((pin, i) => {
                const isFallen = fallen.has(i);
                const badge = badges.get(i);
                const dimmed = phase === "count" || phase === "counted" ? !isFallen : false;
                const dir = i % 2 === 0 ? 1 : -1;
                return (
                  <g
                    key={i}
                    opacity={dimmed ? 0.4 : 1}
                    onClick={() => tapPin(i)}
                    style={{ cursor: phase === "count" && isFallen && !badge ? "pointer" : "default" }}
                    role={phase === "count" && isFallen && !badge ? "button" : undefined}
                    aria-label={isFallen ? `Fallen pin ${i + 1}` : `Pin ${i + 1}`}
                  >
                    {phase === "count" && isFallen && !badge ? (
                      <circle cx={pin.x} cy={pin.y - 16 * pin.s} r={24 * pin.s} fill={GOLD} opacity="0.4" />
                    ) : null}
                    <g
                      transform={`translate(${pin.x} ${pin.y}) scale(${pin.s}) ${
                        isFallen ? `rotate(${dir * 72}) translate(${dir * 7} -3)` : ""
                      }`}
                      style={{ transition: "transform 320ms ease-out" }}
                    >
                      <PinShape />
                    </g>
                    {badge ? (
                      <g transform={`translate(${pin.x + 16 * pin.s} ${pin.y - 38 * pin.s})`}>
                        <circle r="11.5" fill={GOLD} stroke="#FFFFFF" strokeWidth="2.5" />
                        <text textAnchor="middle" dy="0.36em" fontSize="14" fontWeight="900" fill={INK}>
                          {badge}
                        </text>
                      </g>
                    ) : null}
                  </g>
                );
              })}
              {/* The ball — waiting at the foul line, then rolling */}
              {phase === "aim" ? (
                <g transform="translate(180 246)">
                  <circle r="18" fill={ballColor} stroke={deepen(ballColor)} strokeWidth="3" />
                  <circle cx="-6" cy="-6" r="3" fill={deepen(ballColor)} />
                  <circle cx="5" cy="-9" r="3" fill={deepen(ballColor)} />
                  <circle cx="7" cy="3" r="3" fill={deepen(ballColor)} />
                </g>
              ) : null}
              {ball ? (
                <g transform={`translate(${ball.x} ${ball.y}) rotate(${ball.spin})`}>
                  <circle r={ball.r} fill={ballColor} stroke={deepen(ballColor)} strokeWidth="3" />
                  <circle cx={-ball.r * 0.33} cy={-ball.r * 0.33} r={ball.r * 0.17} fill={deepen(ballColor)} />
                  <circle cx={ball.r * 0.28} cy={-ball.r * 0.5} r={ball.r * 0.17} fill={deepen(ballColor)} />
                  <circle cx={ball.r * 0.39} cy={ball.r * 0.17} r={ball.r * 0.17} fill={deepen(ballColor)} />
                </g>
              ) : null}
            </svg>
          </div>
          <p className="mt-3 h-6 text-[17px] font-black capitalize" style={{ color: counted > 0 ? "#28A745" : "transparent" }}>
            {counted > 0 ? `${NUMBER_WORDS[counted - 1]}!` : " "}
          </p>
        </div>

        {/* Roll / next — fixed-height slot */}
        <div className="flex min-h-[96px] flex-col justify-center">
          {phase === "counted" ? (
            <NextButton label={round + 1 >= TOTAL ? "Finish" : "Roll again"} accent={ACCENT} onClick={next} />
          ) : phase === "aim" ? (
            <PillButton color={ACCENT} onClick={roll} className="min-h-[68px] w-full text-[22px]">
              ROLL THE BALL!
            </PillButton>
          ) : (
            <p className="text-center text-[15px] font-bold text-soft">
              {phase === "count" ? "Tap the pins with the gold glow!" : "Here it goes…"}
            </p>
          )}
        </div>
      </GameSheet>
    </div>
  );
}
