"use client";

/* ─── Game 18 — Rocket Launch (science: up & gravity) ───
   Three big number discs — 3, 2, 1 — wait under the rocket.
   The child taps them in countdown order (the next one
   pulses; a different disc just wiggles and says its number,
   no harm done). At 1: "Blast off!" — the rocket climbs past
   the clouds into a starry sky, floats a moment among the
   stars, then drifts gently back down and lands on its pad,
   ready to fly again. Three launches per playthrough, the
   rocket repainted every time. */

import { useEffect, useMemo, useRef, useState } from "react";
import { isSoundEnabled, playCorrect, playGentle, playPop, playStarChime, speakWord } from "@/lib/audio";
import { NUMBER_WORDS, shuffle } from "@/lib/games-data";
import { GREEN, GREEN_DEEP, deepen, tint } from "@/lib/theme";
import {
  GameCelebration,
  GameHeader,
  GameSheet,
  NextButton,
  PromptRow,
  useAutoAnnounce,
  useGameCompletion,
} from "./shared";

const ACCENT = "#2B7FFF";
const TOTAL = 3;

const STARS = [
  { x: 40, y: 36, r: 2.6 }, { x: 92, y: 70, r: 1.9 }, { x: 150, y: 30, r: 2.2 },
  { x: 210, y: 58, r: 1.7 }, { x: 262, y: 26, r: 2.4 }, { x: 322, y: 84, r: 1.9 },
  { x: 60, y: 120, r: 1.7 }, { x: 120, y: 96, r: 2.4 }, { x: 238, y: 108, r: 2 },
  { x: 306, y: 140, r: 1.6 }, { x: 30, y: 176, r: 2 }, { x: 330, y: 190, r: 2.2 },
  { x: 176, y: 84, r: 1.6 }, { x: 84, y: 200, r: 1.8 },
];
const CLOUDS = [
  { x: 62, y: 66, s: 1 },
  { x: 292, y: 48, s: 0.75 },
  { x: 118, y: 128, s: 0.85 },
  { x: 308, y: 158, s: 0.95 },
  { x: 44, y: 188, s: 0.7 },
];

type Phase = "count" | "launch" | "float" | "return" | "landed";

const STATUS: Record<Exclude<Phase, "count">, string> = {
  launch: "Blast off!",
  float: "The rocket is in space!",
  return: "Here it comes…",
  landed: "The rocket came back down!",
};

export function RocketLaunch({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [session, setSession] = useState(0);
  const [phase, setPhase] = useState<Phase>("count");
  const [tapped, setTapped] = useState<number[]>([]);
  const [wiggleNum, setWiggleNum] = useState<number | null>(null);
  const [flight, setFlight] = useState({ p: 0, bob: 0, flame: 1 });
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-rocket-launch");

  const colors = useMemo(
    () => shuffle(["#F24949", "#FF9F2E", "#8B5CF6", "#17BEBB"]).slice(0, TOTAL),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session],
  );
  const bodyColor = colors[round];

  const phaseRef = useRef<Phase>("count");
  const startRef = useRef(0);

  useAutoAnnounce(phase === "count" ? "Tap 3, 2, 1 — blast off!" : "", `${session}-${round}`);

  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p;
    startRef.current = performance.now();
    setPhase(p);
  };

  /* One flight loop drives launch → float → return → landed
     off the phase clock; progress p goes 0→1 up, 1→0 down. */
  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      const ph = phaseRef.current;
      if (ph === "launch" || ph === "float" || ph === "return") {
        const elapsed = now - startRef.current;
        if (ph === "launch") {
          const t = Math.min(1, elapsed / 2400);
          setFlight({ p: t * t, bob: 0, flame: 1 + Math.sin(now / 45) * 0.22 });
          if (t >= 1) {
            playStarChime();
            if (isSoundEnabled()) void speakWord("The rocket is in space!");
            setPhaseBoth("float");
          }
        } else if (ph === "float") {
          setFlight({ p: 1, bob: Math.sin(now / 300) * 4.5, flame: 0 });
          if (elapsed >= 2000) setPhaseBoth("return");
        } else {
          const t = Math.min(1, elapsed / 2300);
          const eased = 1 - (1 - t) * (1 - t);
          setFlight({ p: 1 - eased, bob: 0, flame: 0 });
          if (t >= 1) {
            playPop();
            if (isSoundEnabled()) void speakWord("The rocket came back down!");
            setPhaseBoth("landed");
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const expected = 3 - tapped.length;

  const tapNumber = (n: number) => {
    if (phaseRef.current !== "count" || tapped.includes(n)) return;
    if (n !== expected) {
      playGentle();
      if (isSoundEnabled()) void speakWord(`${NUMBER_WORDS[n - 1]}!`);
      setWiggleNum(n);
      window.setTimeout(() => setWiggleNum((w) => (w === n ? null : w)), 450);
      return;
    }
    playPop();
    if (isSoundEnabled()) void speakWord(`${NUMBER_WORDS[n - 1]}!`);
    const nextTapped = [...tapped, n];
    setTapped(nextTapped);
    if (n === 1) {
      window.setTimeout(() => {
        playCorrect();
        if (isSoundEnabled()) void speakWord("Blast off!");
        setFlight({ p: 0, bob: 0, flame: 1 });
        setPhaseBoth("launch");
      }, 550);
    }
  };

  const next = () => {
    if (round + 1 >= TOTAL) {
      finish();
      return;
    }
    setTapped([]);
    setFlight({ p: 0, bob: 0, flame: 1 });
    setPhaseBoth("count");
    setRound((r) => r + 1);
  };

  const replay = () => {
    resetCompletion();
    setTapped([]);
    setFlight({ p: 0, bob: 0, flame: 1 });
    setPhaseBoth("count");
    setSession((s) => s + 1);
    setRound(0);
  };

  if (xpEarned !== null) {
    return (
      <GameCelebration
        title="You did it!"
        subtitle="Rocket launch complete"
        xpEarned={xpEarned}
        accent={ACCENT}
        onReplay={replay}
      />
    );
  }

  const p = flight.p;
  const rocketY = 196 - 158 * p + flight.bob;
  const finColor = deepen(bodyColor);

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      <GameHeader title="Rocket launch" onBack={onBack} step={round} total={TOTAL} />
      <GameSheet>
        {phase === "count" ? (
          <PromptRow speakText="Tap 3, 2, 1 — blast off!" accent={ACCENT}>
            Tap 3, 2, 1 — blast off!
          </PromptRow>
        ) : (
          <p className="pt-4 text-center text-[20px] font-black" style={{ color: phase === "landed" ? GREEN_DEEP : "#182642" }}>
            {STATUS[phase]}
          </p>
        )}

        {/* The sky */}
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <div className="w-full max-w-md overflow-hidden" style={{ borderRadius: 28 }}>
            <svg viewBox="0 0 360 260" className="block h-auto w-full" role="img" aria-label="A rocket on a launch pad under the sky">
              <rect x="0" y="0" width="360" height="260" fill="#8ED8FF" />
              <rect x="0" y="0" width="360" height="260" fill="#16265C" opacity={p * 0.92} />
              {/* Stars + moon fade in as the rocket climbs */}
              <g opacity={p}>
                {STARS.map((s, i) => (
                  <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" />
                ))}
                <circle cx="302" cy="42" r="14" fill="#FFF3D6" />
                <circle cx="296" cy="38" r="12" fill="#16265C" opacity={p * 0.25} />
              </g>
              {/* Clouds stream downward past the climbing rocket */}
              <g transform={`translate(0 ${p * 400})`} opacity={1 - p * 0.5}>
                {CLOUDS.map((c) => (
                  <g key={c.x} transform={`translate(${c.x} ${c.y}) scale(${c.s})`} fill="#FFFFFF">
                    <ellipse cx="0" cy="0" rx="25" ry="12" />
                    <ellipse cx="-15" cy="4" rx="16" ry="9" />
                    <ellipse cx="16" cy="4" rx="17" ry="9" />
                  </g>
                ))}
              </g>
              {/* Ground + pad */}
              <rect x="0" y="228" width="360" height="32" fill="#58C172" />
              <rect x="146" y="220" width="68" height="10" rx="4" fill="#5A6B8C" />
              {/* The rocket */}
              <g transform={`translate(180 ${rocketY})`}>
                {phase === "launch" ? (
                  <g transform={`translate(0 30) scale(1 ${flight.flame}) translate(0 -30)`}>
                    <path d="M-9,28 Q0,58 9,28 Q0,40 -9,28 Z" fill="#FF9F2E" />
                    <path d="M-5,28 Q0,46 5,28 Q0,35 -5,28 Z" fill="#FFC531" />
                  </g>
                ) : null}
                <path d="M-16,8 L-29,30 L-16,30 Z" fill={finColor} strokeLinejoin="round" />
                <path d="M16,8 L29,30 L16,30 Z" fill={finColor} strokeLinejoin="round" />
                <path
                  d="M0,-54 C14,-40 16,-18 16,4 L16,30 L-16,30 L-16,4 C-16,-18 -14,-40 0,-54 Z"
                  fill={bodyColor}
                  stroke={finColor}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <circle cx="0" cy="-14" r="7.5" fill={tint(bodyColor, 0.55)} stroke={finColor} strokeWidth="2.5" />
                <rect x="-16" y="18" width="32" height="6" fill={finColor} opacity="0.55" />
              </g>
            </svg>
          </div>
        </div>

        {/* Countdown discs / next — fixed-height slot */}
        <div className="flex min-h-[118px] flex-col items-center justify-center">
          {phase === "count" ? (
            <div className="flex items-center justify-center gap-4">
              {[3, 2, 1].map((n) => {
                const isTapped = tapped.includes(n);
                const isNext = n === expected;
                return (
                  <button
                    key={n}
                    type="button"
                    aria-label={`Number ${n}`}
                    onClick={() => tapNumber(n)}
                    className={`grid h-[76px] w-[76px] place-items-center rounded-full text-[34px] font-black text-white transition-transform active:scale-95 ${
                      isNext && !isTapped ? "kt-pulse-soft" : ""
                    } ${wiggleNum === n ? "kt-wiggle" : ""}`}
                    style={{ background: isTapped ? GREEN : ACCENT, opacity: isTapped ? 0.85 : 1 }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          ) : phase === "landed" ? (
            <div className="w-full">
              <NextButton label={round + 1 >= TOTAL ? "Finish" : "Next launch"} accent={ACCENT} onClick={next} />
            </div>
          ) : (
            <p className="text-center text-[15px] font-bold text-soft">Up, up, up it goes…</p>
          )}
        </div>
      </GameSheet>
    </div>
  );
}
