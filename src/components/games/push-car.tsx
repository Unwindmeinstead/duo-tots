"use client";

/* ─── Game 15 — Push the Car (physics: force & motion) ───
   A real car (photoreal sprite) waits at the start of a real
   dirt road (photo textures) and a gold flag waits at the end.
   HOLD the big PUSH button and the power meter fills; let go
   and the car launches — it accelerates up to push speed,
   coasts with rolling friction, slows climbing the hill and
   speeds back down it, body pitching with the slope and the
   shove. If the car stops short of the flag it simply waits
   there: push again, from right where it is. There is no way
   to lose — only rolling, stopping, and rolling some more.
   Three roads are dealt fresh every playthrough (car colour
   via hue shift + hill shuffled). */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { isSoundEnabled, playCorrect, playPop, speakWord } from "@/lib/audio";
import { shuffle } from "@/lib/games-data";
import {
  GameCelebration,
  GameHeader,
  GameSheet,
  NextButton,
  PromptRow,
  useAutoAnnounce,
  useGameCompletion,
} from "./shared";

const ACCENT = "#FF5A3C";
const TOTAL = 3;

/* Stage geometry, in SVG units. */
const BASE_Y = 178;
const START_X = 56;
const FLAG_X = 314;
const HILL_CX = 224;
const HILL_HALF = 68;
const HILL_H = 36;

/* The photo car is 1770×692 — drawn 96 wide, wheels on the
   ground line. HUE rotates the red paint to each round's
   colour (same four colours the flat car used to deal). */
const CAR_W = 96;
const CAR_H = CAR_W * (692 / 1770);
const CAR_HUES = [0, 215, 32, 272];

function groundY(x: number, hill: boolean): number {
  if (!hill) return BASE_Y;
  const d = (x - HILL_CX) / HILL_HALF;
  if (Math.abs(d) >= 1) return BASE_Y;
  return BASE_Y - HILL_H * ((Math.cos(d * Math.PI) + 1) / 2);
}

function groundSlope(x: number, hill: boolean): number {
  return (groundY(x + 3, hill) - groundY(x - 3, hill)) / 6;
}

type Phase = "ready" | "rolling" | "done";

export function PushCar({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [session, setSession] = useState(0);
  const [frame, setFrame] = useState({ x: START_X, pitch: 0, bob: 0 });
  const [power, setPower] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [stoppedShort, setStoppedShort] = useState(false);
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-push-car");

  const configs = useMemo(() => {
    const hues = shuffle(CAR_HUES).slice(0, TOTAL);
    const hills = shuffle([false, true, true]);
    return hues.map((hue, i) => ({ hue, hill: hills[i] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);
  const config = configs[round];

  /* Physics lives in refs; React state mirrors it for the render. */
  const xRef = useRef(START_X);
  const vRef = useRef(0);
  const thrustRef = useRef(0); // remaining launch shove (units/s of target speed)
  const pitchRef = useRef(0);
  const powerRef = useRef(0);
  const chargingRef = useRef(false);
  const phaseRef = useRef<Phase>("ready");
  const hillRef = useRef(config.hill);
  useEffect(() => {
    hillRef.current = config.hill;
  }, [config.hill]);

  useAutoAnnounce("Push the car to the flag!", `${session}-${round}`);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (chargingRef.current) {
        powerRef.current = Math.min(100, powerRef.current + dt * 95);
        setPower(powerRef.current);
      }
      if (phaseRef.current === "rolling") {
        let v = vRef.current;
        const prevV = v;
        /* Launch: the shove feeds in as real acceleration
           (up to ~0.4s) instead of teleporting to full speed. */
        if (thrustRef.current > 0) {
          const target = thrustRef.current;
          v = Math.min(target, v + 620 * dt);
          if (v >= target) thrustRef.current = 0;
        }
        /* Gravity along the ground: the hill slows the climb
           and feeds the roll back down. Plus rolling friction
           (steady drag + a little speed-squared air drag). */
        v += groundSlope(xRef.current, hillRef.current) * 340 * dt;
        v -= 108 * dt + v * v * 0.00035 * dt * 60;
        if (v < 0) v = 0;
        xRef.current += v * dt;
        vRef.current = v;
        /* Body pitch: lean back under the shove, nose down as
           it brakes — smoothed so it reads as suspension. */
        const accel = dt > 0 ? (v - prevV) / dt : 0;
        const targetPitch = Math.max(-7, Math.min(6, -accel * 0.011));
        pitchRef.current += (targetPitch - pitchRef.current) * Math.min(1, dt * 7);
        const bob = v > 24 ? Math.sin(now / 68) * Math.min(1.6, v / 190) : 0;
        if (xRef.current + 44 >= FLAG_X) {
          xRef.current = FLAG_X - 44;
          phaseRef.current = "done";
          setPhase("done");
          playCorrect();
          if (isSoundEnabled()) void speakWord("Hooray! The car rolled to the flag!");
        } else if (v <= 0 && thrustRef.current <= 0) {
          phaseRef.current = "ready";
          setPhase("ready");
          setStoppedShort(xRef.current > START_X + 30);
          if (isSoundEnabled()) void speakWord("So close! Push again!");
        }
        setFrame({ x: xRef.current, pitch: pitchRef.current, bob });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const startCharge = () => {
    if (phaseRef.current === "rolling") {
      /* A tap mid-roll is a helping push. */
      vRef.current = Math.min(460, vRef.current + 85);
      playPop();
      return;
    }
    if (phaseRef.current !== "ready") return;
    chargingRef.current = true;
    powerRef.current = 0;
    setPower(0);
  };

  const releaseCharge = () => {
    if (!chargingRef.current) return;
    chargingRef.current = false;
    const p = powerRef.current;
    powerRef.current = 0;
    setPower(0);
    thrustRef.current = 110 + p * 3.4;
    phaseRef.current = "rolling";
    setPhase("rolling");
    setStoppedShort(false);
    playPop();
    if (isSoundEnabled()) {
      void speakWord(p > 55 ? "The car rolls fast!" : "The car rolls!");
    }
  };

  const next = () => {
    if (round + 1 >= TOTAL) {
      finish();
      return;
    }
    xRef.current = START_X;
    vRef.current = 0;
    thrustRef.current = 0;
    phaseRef.current = "ready";
    setFrame({ x: START_X, pitch: 0, bob: 0 });
    setPhase("ready");
    setStoppedShort(false);
    setRound((r) => r + 1);
  };

  const replay = () => {
    resetCompletion();
    xRef.current = START_X;
    vRef.current = 0;
    thrustRef.current = 0;
    phaseRef.current = "ready";
    setFrame({ x: START_X, pitch: 0, bob: 0 });
    setPhase("ready");
    setStoppedShort(false);
    setSession((s) => s + 1);
    setRound(0);
  };

  if (xpEarned !== null) {
    return (
      <GameCelebration
        title="You did it!"
        subtitle="Push the car complete"
        xpEarned={xpEarned}
        accent={ACCENT}
        onReplay={replay}
      />
    );
  }

  const carX = frame.x;
  const slope = groundSlope(carX, config.hill);
  const carTilt = Math.atan(slope) * (180 / Math.PI) * 0.8 + frame.pitch;
  const groundPath = Array.from({ length: 37 }, (_, i) => {
    const x = i * 10;
    return `${i === 0 ? "M" : "L"}${x},${groundY(x, config.hill)}`;
  }).join(" ");
  /* The dirt road as a filled ribbon hugging the ground curve. */
  const roadPath = `${groundPath} ${Array.from({ length: 37 }, (_, i) => {
    const x = 360 - i * 10;
    return `L${x},${groundY(x, config.hill) + 15}`;
  }).join(" ")} Z`;
  const trees = [66, 148, 292];

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      <GameHeader title="Push the car" onBack={onBack} step={round} total={TOTAL} />
      <GameSheet>
        <PromptRow speakText="Push the car to the flag!" accent={ACCENT}>
          Push the car to the flag!
        </PromptRow>

        {/* The road */}
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <div className="w-full max-w-md overflow-hidden" style={{ borderRadius: 28 }}>
            <svg viewBox="0 0 360 220" className="block h-auto w-full" role="img" aria-label="A car on a road with a flag at the end">
              <defs>
                <pattern id="pc-grass" width="72" height="72" patternUnits="userSpaceOnUse">
                  <image href="/images/play/tex-grass.webp" width="72" height="72" preserveAspectRatio="none" />
                </pattern>
                <pattern id="pc-dirt" width="64" height="64" patternUnits="userSpaceOnUse">
                  <image href="/images/play/tex-dirt.webp" width="64" height="64" preserveAspectRatio="none" />
                </pattern>
                <linearGradient id="pc-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6FC4FF" />
                  <stop offset="70%" stopColor="#BDE6FF" />
                  <stop offset="100%" stopColor="#DFF6FF" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="360" height="220" fill="url(#pc-sky)" />
              {/* Photoreal clouds */}
              <image href="/images/play/sprite-cloud.webp" x="18" y="6" width="86" height="58" opacity="0.95" />
              <image href="/images/play/sprite-cloud.webp" x="238" y="0" width="64" height="43" opacity="0.85" />
              <circle cx="330" cy="26" r="15" fill="#FFD94D" opacity="0.9" />
              {/* Ground covered in real grass */}
              <path d={`${groundPath} L360,220 L0,220 Z`} fill="url(#pc-grass)" />
              <path d={`${groundPath} L360,220 L0,220 Z`} fill="#3E9B4F" opacity="0.28" />
              {/* The dirt road ribbon */}
              <path d={roadPath} fill="url(#pc-dirt)" stroke="#A9805A" strokeWidth="1.5" />
              {/* Photoreal trees rooted on the ground line */}
              {trees.map((tx) => (
                <image
                  key={tx}
                  href="/images/play/sprite-tree.webp"
                  x={tx - 19}
                  y={groundY(tx, config.hill) - 56}
                  width="38"
                  height="57"
                />
              ))}
              {/* The flag */}
              <g transform={`translate(${FLAG_X} ${groundY(FLAG_X, config.hill)})`}>
                <line x1="0" y1="0" x2="0" y2="-46" stroke="#5A6B8C" strokeWidth="4" strokeLinecap="round" />
                <polygon points="0,-46 24,-38 0,-30" fill="#FFC531" stroke="#EDA900" strokeWidth="2" strokeLinejoin="round" />
              </g>
              {/* Soft shadow, then the photo car pitched with the road */}
              <ellipse cx={carX} cy={groundY(carX, config.hill) + 3} rx="46" ry="5" fill="#1d4d24" opacity="0.35" />
              <g transform={`translate(${carX} ${groundY(carX, config.hill) - frame.bob}) rotate(${carTilt})`}>
                <image
                  href="/images/play/sprite-car.webp"
                  x={-CAR_W / 2}
                  y={-CAR_H + 2}
                  width={CAR_W}
                  height={CAR_H}
                  style={config.hue ? { filter: `hue-rotate(${config.hue}deg)` } : undefined}
                />
              </g>
            </svg>
          </div>
          <p className="mt-3 h-6 text-[17px] font-black" style={{ color: phase === "done" || stoppedShort ? "#28A745" : "transparent" }}>
            {phase === "done" ? "Hooray! The car made it!" : stoppedShort ? "So close! Push again!" : " "}
          </p>
        </div>

        {/* Push zone / next — fixed-height slot */}
        <div className="flex min-h-[118px] flex-col items-center justify-center gap-2.5">
          {phase === "done" ? (
            <div className="w-full">
              <NextButton label={round + 1 >= TOTAL ? "Finish" : "Next road"} accent={ACCENT} onClick={next} />
            </div>
          ) : (
            <>
              {/* Power meter — fills while PUSH is held */}
              <div className="h-4 w-full max-w-md overflow-hidden rounded-full bg-[#E8EEFB]" aria-hidden>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${power}%`, background: power > 55 ? "#FFC531" : ACCENT, transition: "width 60ms linear" }}
                />
              </div>
              <button
                type="button"
                aria-label="Hold to charge, let go to push the car"
                onPointerDown={startCharge}
                onPointerUp={releaseCharge}
                onPointerLeave={releaseCharge}
                onPointerCancel={releaseCharge}
                onContextMenu={(e) => e.preventDefault()}
                className="btn-led inline-flex min-h-[64px] w-full max-w-md touch-none select-none items-center justify-center rounded-full text-[22px] font-black transition-transform active:scale-[0.97]"
                style={
                  {
                    "--btn": ACCENT,
                    "--btn-deep": "#D63A1F",
                    "--btn-ink": "#FFFFFF",
                  } as CSSProperties
                }
              >
                PUSH!
              </button>
              <p className="text-[14px] font-bold text-soft">
                {phase === "rolling" ? "Tap PUSH to push more!" : "Hold PUSH… then let go!"}
              </p>
            </>
          )}
        </div>
      </GameSheet>
    </div>
  );
}
