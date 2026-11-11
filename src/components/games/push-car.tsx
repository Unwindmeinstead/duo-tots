"use client";

/* ─── Game 15 — Push the Car (physics: force & motion) ───
   A car waits at the start of the road and a gold flag waits at
   the end. HOLD the big PUSH button and the power meter fills;
   let go and the car rolls — a strong push rolls it fast and
   far, a small push rolls it a little, and a gentle hill slows
   it on the way up and speeds it on the way down. If the car
   stops short of the flag it simply waits there: push again,
   from right where it is. There is no way to lose — only
   rolling, stopping, and rolling some more. Three roads are
   dealt fresh every playthrough (car colour + hill shuffled). */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { isSoundEnabled, playCorrect, playPop, speakWord } from "@/lib/audio";
import { shuffle } from "@/lib/games-data";
import { deepen, tint } from "@/lib/theme";
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
const START_X = 34;
const FLAG_X = 314;
const HILL_CX = 224;
const HILL_HALF = 68;
const HILL_H = 36;

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
  const [carX, setCarX] = useState(START_X);
  const [power, setPower] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [stoppedShort, setStoppedShort] = useState(false);
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-push-car");

  const configs = useMemo(() => {
    const colors = shuffle(["#F24949", "#2B7FFF", "#FF9F2E", "#8B5CF6"]).slice(0, TOTAL);
    const hills = shuffle([false, true, true]);
    return colors.map((color, i) => ({ color, hill: hills[i] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);
  const config = configs[round];

  /* Physics lives in refs; React state mirrors it for the render. */
  const xRef = useRef(START_X);
  const vRef = useRef(0);
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
        /* Gravity along the ground: the hill slows the climb
           and feeds the roll back down. Plus plain friction. */
        v += groundSlope(xRef.current, hillRef.current) * 340 * dt;
        v -= 120 * dt;
        if (v < 0) v = 0;
        xRef.current += v * dt;
        vRef.current = v;
        if (xRef.current + 30 >= FLAG_X) {
          xRef.current = FLAG_X - 30;
          phaseRef.current = "done";
          setPhase("done");
          playCorrect();
          if (isSoundEnabled()) void speakWord("Hooray! The car rolled to the flag!");
        } else if (v <= 0) {
          phaseRef.current = "ready";
          setPhase("ready");
          setStoppedShort(xRef.current > START_X + 30);
          if (isSoundEnabled()) void speakWord("So close! Push again!");
        }
        setCarX(xRef.current);
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
    vRef.current = 110 + p * 3.4;
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
    phaseRef.current = "ready";
    setCarX(START_X);
    setPhase("ready");
    setStoppedShort(false);
    setRound((r) => r + 1);
  };

  const replay = () => {
    resetCompletion();
    xRef.current = START_X;
    vRef.current = 0;
    phaseRef.current = "ready";
    setCarX(START_X);
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

  const slope = groundSlope(carX, config.hill);
  const carTilt = Math.atan(slope) * (180 / Math.PI) * 0.8;
  const wheelRot = (carX / 9) * (180 / Math.PI);
  const groundPath = Array.from({ length: 37 }, (_, i) => {
    const x = i * 10;
    return `${i === 0 ? "M" : "L"}${x},${groundY(x, config.hill)}`;
  }).join(" ");
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
              <rect x="0" y="0" width="360" height="220" fill="#BDE6FF" />
              <circle cx="322" cy="34" r="17" fill="#FFC531" />
              {/* Ground + road following the same curve */}
              <path d={`${groundPath} L360,220 L0,220 Z`} fill="#58C172" />
              <path d={groundPath} fill="none" stroke="#C98A5A" strokeWidth="13" strokeLinejoin="round" strokeLinecap="round" />
              <path d={groundPath} fill="none" stroke="#FFF3D6" strokeWidth="3" strokeDasharray="14 12" strokeLinecap="round" />
              {/* Trees rooted on the ground line */}
              {trees.map((tx) => (
                <g key={tx} transform={`translate(${tx} ${groundY(tx, config.hill)})`}>
                  <rect x="-2.5" y="-8" width="5" height="9" rx="2" fill="#8A5A33" />
                  <circle cx="0" cy="-16" r="10" fill="#34C759" />
                  <circle cx="-8" cy="-10" r="7" fill="#34C759" />
                  <circle cx="8" cy="-10" r="7" fill="#34C759" />
                </g>
              ))}
              {/* The flag */}
              <g transform={`translate(${FLAG_X} ${groundY(FLAG_X, config.hill)})`}>
                <line x1="0" y1="0" x2="0" y2="-46" stroke="#5A6B8C" strokeWidth="4" strokeLinecap="round" />
                <polygon points="0,-46 24,-38 0,-30" fill="#FFC531" stroke="#EDA900" strokeWidth="2" strokeLinejoin="round" />
              </g>
              {/* The car */}
              <g transform={`translate(${carX} ${groundY(carX, config.hill)}) rotate(${carTilt})`}>
                <path
                  d="M-17,-22 L-11,-35 Q-9,-39 -3,-39 L9,-39 Q15,-39 17,-22 Z"
                  fill={config.color}
                  stroke={deepen(config.color)}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <rect x="-12" y="-36" width="9" height="11" rx="3" fill={tint(config.color, 0.45)} />
                <rect x="2" y="-36" width="9" height="11" rx="3" fill={tint(config.color, 0.45)} />
                <rect x="-33" y="-23" width="66" height="17" rx="8" fill={config.color} stroke={deepen(config.color)} strokeWidth="2.5" />
                <circle cx="26" cy="-14" r="3.4" fill="#FFC531" />
                {[-19, 19].map((wx) => (
                  <g key={wx} transform={`translate(${wx} 0) rotate(${wheelRot})`}>
                    <circle r="9.5" fill="#2B3550" />
                    <line x1="-6.5" y1="0" x2="6.5" y2="0" stroke="#E8EEFB" strokeWidth="2.6" strokeLinecap="round" />
                    <line x1="0" y1="-6.5" x2="0" y2="6.5" stroke="#E8EEFB" strokeWidth="2.6" strokeLinecap="round" />
                    <circle r="2.6" fill="#E8EEFB" />
                  </g>
                ))}
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
                className="btn-led inline-flex min-h-[64px] w-full max-w-md touch-none select-none items-center justify-center rounded-full text-[22px] font-black"
                style={
                  {
                    "--btn": ACCENT,
                    "--btn-deep": deepen(ACCENT),
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
