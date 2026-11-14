"use client";

/* ─── Game 18 — Rocket Launch (science: thrust & gravity) ───
   Three big number discs — 3, 2, 1 — wait under the rocket.
   The child taps them in countdown order (the next one
   pulses; a different disc just wiggles and says its number,
   no harm done). At 1: "Blast off!" — and the photoreal
   rocket flies on REAL physics: thrust fights gravity, so
   it lifts off slowly, accelerates as it climbs, coasts at
   the top among the stars, then gravity pulls it back —
   faster and faster until the little retro flame flares
   near the ground and sets it down soft, with one small
   bounce. Three launches per playthrough, the rocket's
   nose and fins repainted (hue shift) every time. */

import { useEffect, useMemo, useRef, useState } from "react";
import { isSoundEnabled, playCorrect, playGentle, playPop, playStarChime, speakWord } from "@/lib/audio";
import { NUMBER_WORDS, shuffle } from "@/lib/games-data";
import { GREEN, GREEN_DEEP } from "@/lib/theme";
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

/* The photo rocket is 543×1628 — drawn 104 tall. */
const ROCKET_H = 104;
const ROCKET_W = ROCKET_H * (543 / 1628);
const ROCKET_HUES = [0, 205, 120, 42];

/* Flight physics, in altitude-fraction units (p: 0 pad → 1 space). */
const GRAV = 0.145; // gravity pull, p/s²
const THRUST = 0.44; // engine thrust while the fuel burns, p/s²
const TERMINAL = 0.36; // fastest fall, p/s

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
  const [flight, setFlight] = useState({ p: 0, bob: 0, flame: 0, smoke: 0, wobble: 0 });
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-rocket-launch");

  const hues = useMemo(
    () => shuffle(ROCKET_HUES).slice(0, TOTAL),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session],
  );
  const rocketHue = hues[round];

  const phaseRef = useRef<Phase>("count");
  const altRef = useRef(0);
  const velRef = useRef(0);
  const phaseAtRef = useRef(0); // timestamp the current phase began
  const bouncedRef = useRef(false);

  useAutoAnnounce(phase === "count" ? "Tap 3, 2, 1 — blast off!" : "", `${session}-${round}`);

  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p;
    phaseAtRef.current = performance.now();
    setPhase(p);
  };

  /* One physics loop: thrust vs gravity on the way up, a
     weightless float at the top, gravity + a retro flare on
     the way back down. Velocity is integrated, never eased. */
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const ph = phaseRef.current;
      if (ph === "launch" || ph === "float" || ph === "return") {
        let flame = 0;
        let smoke = 0;
        if (ph === "launch") {
          /* Fuel burns until the rocket is most of the way up;
             after that it coasts on momentum against gravity. */
          const burning = altRef.current < 0.72;
          const a = (burning ? THRUST : 0) - GRAV;
          velRef.current += a * dt;
          altRef.current += velRef.current * dt;
          flame = burning ? 1 + Math.sin(now / 43) * 0.24 : Math.max(0, 0.5 - altRef.current * 0.4);
          smoke = Math.max(0, 1 - altRef.current * 2.6);
          if (altRef.current >= 1) {
            altRef.current = 1;
            velRef.current = 0;
            playStarChime();
            if (isSoundEnabled()) void speakWord("The rocket is in space!");
            setPhaseBoth("float");
          }
        } else if (ph === "float") {
          if (now - phaseAtRef.current >= 2100) setPhaseBoth("return");
        } else {
          /* Return: gravity accelerates the fall to terminal
             speed; low down, the retro flame flares and kills
             the speed so touchdown is a kiss, not a crash. */
          velRef.current = Math.max(-TERMINAL, velRef.current - GRAV * dt);
          const retro = altRef.current < 0.3 && velRef.current < -0.1;
          if (retro) {
            velRef.current += 0.5 * dt;
            flame = 0.55 + Math.sin(now / 50) * 0.15;
          }
          altRef.current += velRef.current * dt;
          if (altRef.current <= 0) {
            altRef.current = 0;
            if (!bouncedRef.current && velRef.current < -0.055) {
              /* One small honest bounce, most energy gone. */
              velRef.current = -velRef.current * 0.22;
              bouncedRef.current = true;
              playPop();
            } else {
              velRef.current = 0;
              playPop();
              if (isSoundEnabled()) void speakWord("The rocket came back down!");
              setPhaseBoth("landed");
            }
          }
        }
        setFlight({
          p: altRef.current,
          bob: ph === "float" ? Math.sin(now / 300) * 4.5 : 0,
          flame,
          smoke,
          wobble: ph === "launch" ? Math.sin(now / 90) * Math.min(2.4, velRef.current * 5) : 0,
        });
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
        altRef.current = 0;
        velRef.current = 0;
        bouncedRef.current = false;
        setFlight({ p: 0, bob: 0, flame: 1, smoke: 1, wobble: 0 });
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
    altRef.current = 0;
    velRef.current = 0;
    setFlight({ p: 0, bob: 0, flame: 0, smoke: 0, wobble: 0 });
    setPhaseBoth("count");
    setRound((r) => r + 1);
  };

  const replay = () => {
    resetCompletion();
    setTapped([]);
    altRef.current = 0;
    velRef.current = 0;
    setFlight({ p: 0, bob: 0, flame: 0, smoke: 0, wobble: 0 });
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
              {/* Photoreal clouds stream past the climbing rocket */}
              <g transform={`translate(0 ${p * 400})`} opacity={1 - p * 0.5}>
                {CLOUDS.map((c) => (
                  <image
                    key={c.x}
                    href="/images/play/sprite-cloud.webp"
                    x={c.x - 46 * c.s}
                    y={c.y - 31 * c.s}
                    width={92 * c.s}
                    height={62 * c.s}
                    opacity="0.95"
                  />
                ))}
              </g>
              {/* Ground + pad */}
              <rect x="0" y="228" width="360" height="32" fill="#58C172" />
              <rect x="146" y="220" width="68" height="10" rx="4" fill="#5A6B8C" />
              {/* Launch smoke — billows while the rocket is low */}
              {flight.smoke > 0.02 ? (
                <g fill="#FFFFFF" opacity={flight.smoke * 0.85}>
                  <ellipse cx={180 - 34 * (1 - flight.smoke) - 12} cy="226" rx={16 + (1 - flight.smoke) * 22} ry={7 + (1 - flight.smoke) * 6} />
                  <ellipse cx={180 + 34 * (1 - flight.smoke) + 12} cy="228" rx={14 + (1 - flight.smoke) * 20} ry={6 + (1 - flight.smoke) * 5} />
                  <ellipse cx="180" cy="230" rx={20 + (1 - flight.smoke) * 16} ry={6} />
                </g>
              ) : null}
              {/* The rocket — flame first (it burns beneath), then
                  the photo ship, wobbling a touch under power */}
              <g transform={`translate(180 ${rocketY}) rotate(${flight.wobble})`}>
                {flight.flame > 0.03 ? (
                  <g transform={`translate(0 ${ROCKET_H / 2 - 2}) scale(1 ${flight.flame})`}>
                    <path d="M-8,0 Q0,34 8,0 Q0,10 -8,0 Z" fill="#FF9F2E" />
                    <path d="M-4.5,0 Q0,22 4.5,0 Q0,7 -4.5,0 Z" fill="#FFC531" />
                  </g>
                ) : null}
                <image
                  href="/images/play/sprite-rocket.webp"
                  x={-ROCKET_W / 2}
                  y={-ROCKET_H / 2}
                  width={ROCKET_W}
                  height={ROCKET_H}
                  style={rocketHue ? { filter: `hue-rotate(${rocketHue}deg)` } : undefined}
                />
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
