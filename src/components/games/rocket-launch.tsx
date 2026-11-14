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
   nose and fins repainted (hue shift) every time.

   THE LONG FLIGHT (Grey's order, 2026-11-14 — "much longer
   and much taller"): altitude runs 0 → 3 screen-heights.
   The climb takes ~7 seconds through stacked sky layers —
   pad, first clouds, higher thinner clouds, then the dark
   and the stars — with the world scrolling down past the
   ship; it floats among the stars for a long beat, then
   drifts back down for ~8 seconds, retro flare and all.
   Milestones are spoken as it passes each layer. */

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

/* Flight physics, in altitude units (p: 0 pad → 3 space —
   three screen-heights of sky, the long flight). */
const GRAV = 0.11; // gravity pull, p/s²
const THRUST = 0.26; // engine thrust while the fuel burns, p/s²
const BURN_UNTIL = 1.9; // fuel runs out here; momentum + drag coast the rest
const FALL_GRAV = 0.22; // gravity on the way back down, p/s²
const TERMINAL = 0.45; // fastest fall, p/s
const FLOAT_MS = 4000; // the long weightless beat among the stars

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
  const [flight, setFlight] = useState({ p: 0, v: 0, bob: 0, flame: 0, smoke: 0, wobble: 0 });
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
  const saidRef = useRef({ clouds: false, almost: false }); // spoken altitude milestones, once per launch

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
          /* Fuel burns for the first two-thirds of the sky;
             after that the ship coasts on momentum against
             gravity and thin-air drag — a long, grand climb
             (~7s) instead of the old quick hop (~2.7s). */
          const burning = altRef.current < BURN_UNTIL;
          let a = (burning ? THRUST : 0) - GRAV;
          if (!burning) a -= velRef.current * 0.35; // coast drag — arrival at the top is gentle
          velRef.current += a * dt;
          altRef.current += velRef.current * dt;
          flame = burning ? 1 + Math.sin(now / 43) * 0.24 : 0;
          smoke = Math.max(0, 1 - altRef.current * 2.6);
          /* Spoken milestones as the ship crosses each layer. */
          if (!saidRef.current.clouds && altRef.current >= 1) {
            saidRef.current.clouds = true;
            if (isSoundEnabled()) void speakWord("Up through the clouds!");
          }
          if (!saidRef.current.almost && altRef.current >= 2) {
            saidRef.current.almost = true;
            if (isSoundEnabled()) void speakWord("Almost to space!");
          }
          if (altRef.current >= 3) {
            altRef.current = 3;
            velRef.current = 0;
            playStarChime();
            if (isSoundEnabled()) void speakWord("The rocket is in space!");
            setPhaseBoth("float");
          }
        } else if (ph === "float") {
          if (now - phaseAtRef.current >= FLOAT_MS) setPhaseBoth("return");
        } else {
          /* Return: gravity accelerates the fall to terminal
             speed over the long way down (~8s); low down, the
             retro flame flares and kills the speed so the
             touchdown is a kiss, not a crash. */
          velRef.current = Math.max(-TERMINAL, velRef.current - FALL_GRAV * dt);
          const retro = altRef.current < 0.4 && velRef.current < -0.12;
          if (retro) {
            velRef.current += 0.62 * dt;
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
          v: velRef.current,
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
        saidRef.current = { clouds: false, almost: false };
        setFlight({ p: 0, v: 0, bob: 0, flame: 1, smoke: 1, wobble: 0 });
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
    setFlight({ p: 0, v: 0, bob: 0, flame: 0, smoke: 0, wobble: 0 });
    setPhaseBoth("count");
    setRound((r) => r + 1);
  };

  const replay = () => {
    resetCompletion();
    setTapped([]);
    altRef.current = 0;
    velRef.current = 0;
    setFlight({ p: 0, v: 0, bob: 0, flame: 0, smoke: 0, wobble: 0 });
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
        onExit={onBack}
      />
    );
  }

  const p = flight.p;
  const cl = (x: number) => Math.max(0, Math.min(1, x));
  /* The long flight's camera: the ship rises off the pad to
     mid-frame, rides there while three screen-heights of world
     scroll down past it, and eases up toward the stars at the
     top. The ground slides away below; the sky deepens layer
     by layer — blue, deep blue, then space. */
  const rocketY = (p <= 0.6 ? 196 - 68 * (p / 0.6) : p < 2.4 ? 128 : 128 - 34 * ((p - 2.4) / 0.6)) + flight.bob;
  const skyMid = cl((p - 0.7) / 1.1) * 0.85;
  const skySpace = cl((p - 1.7) / 1.1) * 0.97;
  const starsO = cl((p - 1.5) / 1.0);
  const groundShift = cl(p / 0.85) * 215;
  const groundO = 1 - cl((p - 0.6) / 0.4);
  const cloudShift = p * 235;
  const cloudO = 1 - cl((p - 1.9) / 0.9) * 0.7;
  const streakO = phase === "launch" ? cl((flight.v - 0.45) * 1.6) * 0.65 : 0;

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
              {/* Sky, layer over layer: day blue → deep blue → space */}
              <rect x="0" y="0" width="360" height="260" fill="#8ED8FF" />
              <rect x="0" y="0" width="360" height="260" fill="#2B5EA7" opacity={skyMid} />
              <rect x="0" y="0" width="360" height="260" fill="#0B1035" opacity={skySpace} />
              {/* Stars + moon fade in up high */}
              <g opacity={starsO}>
                {STARS.map((s, i) => (
                  <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" />
                ))}
                <circle cx="302" cy="42" r="14" fill="#FFF3D6" />
                <circle cx="296" cy="38" r="12" fill="#0B1035" opacity={starsO * 0.25} />
              </g>
              {/* Photoreal clouds stream past the climbing rocket —
                  three bands stacked up the sky, so the ship passes
                  cloud layer after cloud layer on the long way up */}
              <g transform={`translate(0 ${cloudShift})`} opacity={cloudO}>
                {CLOUDS.map((c) => (
                  <image
                    key={`a-${c.x}`}
                    href="/images/play/sprite-cloud.webp"
                    x={c.x - 46 * c.s}
                    y={c.y - 31 * c.s}
                    width={92 * c.s}
                    height={62 * c.s}
                    opacity="0.95"
                  />
                ))}
                {CLOUDS.map((c) => (
                  <image
                    key={`b-${c.x}`}
                    href="/images/play/sprite-cloud.webp"
                    x={c.x - 46 * c.s}
                    y={c.y - 321 * c.s}
                    width={92 * c.s}
                    height={62 * c.s}
                    opacity="0.9"
                  />
                ))}
                {CLOUDS.map((c) => (
                  <image
                    key={`c-${c.x}`}
                    href="/images/play/sprite-cloud.webp"
                    x={c.x - 26 * c.s}
                    y={c.y - 560 * c.s}
                    width={52 * c.s}
                    height={35 * c.s}
                    opacity="0.65"
                  />
                ))}
              </g>
              {/* Ground + pad — left behind as the ship climbs */}
              <g transform={`translate(0 ${groundShift})`} opacity={groundO}>
                <rect x="0" y="228" width="360" height="32" fill="#58C172" />
                <rect x="146" y="220" width="68" height="10" rx="4" fill="#5A6B8C" />
              </g>
              {/* Speed streaks while the climb is fast */}
              {streakO > 0.02 ? (
                <g stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" opacity={streakO}>
                  <line x1="118" y1={rocketY - 64} x2="118" y2={rocketY + 58} />
                  <line x1="242" y1={rocketY - 50} x2="242" y2={rocketY + 72} />
                  <line x1="146" y1={rocketY - 84} x2="146" y2={rocketY - 18} />
                  <line x1="214" y1={rocketY + 22} x2="214" y2={rocketY + 88} />
                </g>
              ) : null}
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
