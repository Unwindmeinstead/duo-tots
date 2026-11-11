"use client";

/* ─── Game 16 — Pedal Power (physics: rotation) ───
   A bicycle waits at the start of the path. Every tap on the
   big PEDAL button spins the pedals — the crank turns, the
   wheels turn, and the bike rides forward through the trees
   and houses toward the finish flag. Stop tapping and the
   bike gently slows; tap again and off it goes. No falling,
   no failing — just pedalling. Three rides per playthrough,
   each to a different place (park, beach, playground), with
   the bike repainted and the distance changed every time. */

import { useEffect, useMemo, useRef, useState } from "react";
import { PillButton } from "@/components/kit";
import { isSoundEnabled, playCorrect, playPop, speakWord } from "@/lib/audio";
import { shuffle } from "@/lib/games-data";
import { GREEN_DEEP, deepen } from "@/lib/theme";
import {
  GameCelebration,
  GameHeader,
  GameSheet,
  NextButton,
  PromptRow,
  useAutoAnnounce,
  useGameCompletion,
} from "./shared";

const ACCENT = "#12B5A5";
const TOTAL = 3;
const GROUND_Y = 188;
const GOALS = [650, 800, 950];
const DESTINATIONS = ["the park", "the beach", "the playground"];

/* Scenery pattern — repeats every 900 world units. */
const SCENERY = [
  { dx: 30, kind: "tree" },
  { dx: 190, kind: "house" },
  { dx: 350, kind: "tree" },
  { dx: 500, kind: "flower" },
  { dx: 640, kind: "tree" },
  { dx: 790, kind: "house" },
] as const;
const CLOUDS = [
  { dx: 80, y: 34, s: 1 },
  { dx: 330, y: 58, s: 0.7 },
  { dx: 560, y: 28, s: 0.85 },
  { dx: 800, y: 52, s: 0.6 },
] as const;

type Phase = "ride" | "done";

export function PedalPower({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [session, setSession] = useState(0);
  const [frame, setFrame] = useState({ dist: 0, speed: 0 });
  const [phase, setPhase] = useState<Phase>("ride");
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-pedal-power");

  const configs = useMemo(() => {
    const colors = shuffle(["#F24949", "#2B7FFF", "#FF9F2E", "#8B5CF6"]).slice(0, TOTAL);
    const dests = shuffle(DESTINATIONS);
    return colors.map((color, i) => ({ color, goal: GOALS[i], destination: dests[i] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);
  const config = configs[round];

  const distRef = useRef(0);
  const speedRef = useRef(0);
  const phaseRef = useRef<Phase>("ride");
  const goalRef = useRef(config.goal);
  const destRef = useRef(config.destination);
  useEffect(() => {
    goalRef.current = config.goal;
    destRef.current = config.destination;
  }, [config]);

  useAutoAnnounce("Tap the pedals! Ride to the flag!", `${session}-${round}`);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (phaseRef.current === "ride") {
        speedRef.current = Math.max(0, speedRef.current - 135 * dt);
        distRef.current += speedRef.current * dt;
        if (distRef.current >= goalRef.current) {
          distRef.current = goalRef.current;
          phaseRef.current = "done";
          setPhase("done");
          playCorrect();
          if (isSoundEnabled()) void speakWord(`You rode to ${destRef.current}!`);
        }
        setFrame({ dist: distRef.current, speed: speedRef.current });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pedal = () => {
    if (phaseRef.current !== "ride") return;
    speedRef.current = Math.min(330, speedRef.current + 62);
    playPop();
  };

  const next = () => {
    if (round + 1 >= TOTAL) {
      finish();
      return;
    }
    distRef.current = 0;
    speedRef.current = 0;
    phaseRef.current = "ride";
    setFrame({ dist: 0, speed: 0 });
    setPhase("ride");
    setRound((r) => r + 1);
  };

  const replay = () => {
    resetCompletion();
    distRef.current = 0;
    speedRef.current = 0;
    phaseRef.current = "ride";
    setFrame({ dist: 0, speed: 0 });
    setPhase("ride");
    setSession((s) => s + 1);
    setRound(0);
  };

  if (xpEarned !== null) {
    return (
      <GameCelebration
        title="You did it!"
        subtitle="Pedal power complete"
        xpEarned={xpEarned}
        accent={ACCENT}
        onReplay={replay}
      />
    );
  }

  const { dist, speed } = frame;
  const wheelRot = dist * 2.73;
  const crankRot = dist * 3.4;
  const crankRad = (crankRot * Math.PI) / 180;
  const pedalAx = 27 + 11 * Math.cos(crankRad);
  const pedalAy = 156 + 11 * Math.sin(crankRad);
  const pedalBx = 27 - 11 * Math.cos(crankRad);
  const pedalBy = 156 - 11 * Math.sin(crankRad);
  const flagX = config.goal - dist + 96;
  const progress = Math.min(100, (dist / config.goal) * 100);

  const sceneryNodes: React.ReactNode[] = [];
  for (const item of SCENERY) {
    for (let k = 0; k < 3; k++) {
      const sx = item.dx + k * 900 - dist + 40;
      if (sx < -80 || sx > 440) continue;
      sceneryNodes.push(
        <g key={`${item.dx}-${k}`} transform={`translate(${sx} ${GROUND_Y})`}>
          {item.kind === "tree" ? (
            <>
              <rect x="-3" y="-12" width="6" height="13" rx="2.5" fill="#8A5A33" />
              <circle cx="0" cy="-24" r="14" fill="#34C759" />
              <circle cx="-11" cy="-15" r="9" fill="#34C759" />
              <circle cx="11" cy="-15" r="9" fill="#34C759" />
            </>
          ) : item.kind === "house" ? (
            <>
              <rect x="-17" y="-26" width="34" height="26" rx="3" fill="#FFF3D6" stroke="#E3C98F" strokeWidth="2" />
              <polygon points="-21,-26 21,-26 0,-42" fill="#F24949" />
              <rect x="-5" y="-14" width="10" height="14" rx="2" fill="#8A5A33" />
            </>
          ) : (
            <>
              <line x1="0" y1="0" x2="0" y2="-10" stroke="#28A745" strokeWidth="3" strokeLinecap="round" />
              <circle cx="0" cy="-14" r="5.5" fill="#F0519B" />
              <circle cx="0" cy="-14" r="2" fill="#FFC531" />
            </>
          )}
        </g>,
      );
    }
  }
  const cloudNodes = CLOUDS.map((c) => {
    const cx = ((((c.dx - dist * 0.35) % 900) + 900) % 900) - 50;
    return (
      <g key={c.dx} transform={`translate(${cx} ${c.y}) scale(${c.s})`} fill="#FFFFFF" opacity="0.95">
        <ellipse cx="0" cy="0" rx="24" ry="12" />
        <ellipse cx="-14" cy="4" rx="15" ry="9" />
        <ellipse cx="15" cy="4" rx="16" ry="9" />
      </g>
    );
  });

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      <GameHeader title="Pedal power" onBack={onBack} step={round} total={TOTAL} />
      <GameSheet>
        <PromptRow speakText="Tap the pedals! Ride to the flag!" accent={ACCENT}>
          Tap the pedals! Ride to the flag!
        </PromptRow>

        {/* The ride */}
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <div className="w-full max-w-md overflow-hidden" style={{ borderRadius: 28 }}>
            <svg viewBox="0 0 360 220" className="block h-auto w-full" role="img" aria-label="A bicycle riding along a path to a flag">
              <rect x="0" y="0" width="360" height="220" fill="#BDE6FF" />
              <circle cx="36" cy="32" r="16" fill="#FFC531" />
              {cloudNodes}
              <rect x="0" y={GROUND_Y} width="360" height={220 - GROUND_Y} fill="#58C172" />
              <rect x="0" y={GROUND_Y} width="360" height="7" fill="#C98A5A" />
              {sceneryNodes}
              {/* Finish flag */}
              {flagX > -40 && flagX < 420 ? (
                <g transform={`translate(${flagX} ${GROUND_Y})`}>
                  <line x1="0" y1="0" x2="0" y2="-52" stroke="#5A6B8C" strokeWidth="4" strokeLinecap="round" />
                  <polygon points="0,-52 26,-43 0,-34" fill="#FFC531" stroke="#EDA900" strokeWidth="2" strokeLinejoin="round" />
                </g>
              ) : null}
              {/* Speed lines while riding fast */}
              {speed > 190 ? (
                <g stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity={Math.min(0.9, (speed - 190) / 140)}>
                  <line x1="18" y1="138" x2="46" y2="138" />
                  <line x1="8" y1="156" x2="42" y2="156" />
                  <line x1="20" y1="174" x2="48" y2="174" />
                </g>
              ) : null}
              {/* The bicycle — wheels + crank spin with the ride */}
              <g transform="translate(66 0)">
                {[0, 58].map((wx) => (
                  <g key={wx} transform={`translate(${wx} 168) rotate(${wheelRot})`}>
                    <circle r="21" fill="none" stroke="#2B3550" strokeWidth="4.5" />
                    <line x1="-21" y1="0" x2="21" y2="0" stroke="#5A6B8C" strokeWidth="2.4" />
                    <line x1="0" y1="-21" x2="0" y2="21" stroke="#5A6B8C" strokeWidth="2.4" />
                    <line x1="-15" y1="-15" x2="15" y2="15" stroke="#5A6B8C" strokeWidth="2.4" />
                    <line x1="-15" y1="15" x2="15" y2="-15" stroke="#5A6B8C" strokeWidth="2.4" />
                    <circle r="3.4" fill="#2B3550" />
                  </g>
                ))}
                <g stroke={config.color} strokeWidth="5.5" strokeLinecap="round" fill="none">
                  <line x1="0" y1="168" x2="10" y2="130" />
                  <line x1="10" y1="130" x2="27" y2="156" />
                  <line x1="27" y1="156" x2="0" y2="168" />
                  <line x1="27" y1="156" x2="52" y2="128" />
                  <line x1="52" y1="128" x2="58" y2="168" />
                </g>
                <rect x="0" y="124" width="17" height="6" rx="3" fill="#2B3550" />
                <path d="M46,128 Q52,120 60,124" fill="none" stroke="#2B3550" strokeWidth="4.5" strokeLinecap="round" />
                {/* Crank + pedals */}
                <line x1={pedalBx} y1={pedalBy} x2={pedalAx} y2={pedalAy} stroke="#2B3550" strokeWidth="4" strokeLinecap="round" />
                <circle cx="27" cy="156" r="4.5" fill="#2B3550" />
                <rect x={pedalAx - 6} y={pedalAy - 2.5} width="12" height="5" rx="2.5" fill={deepen(config.color)} />
                <rect x={pedalBx - 6} y={pedalBy - 2.5} width="12" height="5" rx="2.5" fill={deepen(config.color)} />
              </g>
            </svg>
          </div>
          {/* Ride progress */}
          <div className="mt-3 h-4 w-full max-w-md overflow-hidden rounded-full bg-[#E8EEFB]" aria-hidden>
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: ACCENT, transition: "width 120ms linear" }} />
          </div>
          <p className="mt-2 h-6 text-[17px] font-black" style={{ color: phase === "done" ? GREEN_DEEP : "transparent" }}>
            {phase === "done" ? `You rode to ${config.destination}!` : " "}
          </p>
        </div>

        {/* Pedal zone / next — fixed-height slot */}
        <div className="flex min-h-[96px] flex-col justify-center">
          {phase === "done" ? (
            <NextButton label={round + 1 >= TOTAL ? "Finish" : "Next ride"} accent={ACCENT} onClick={next} />
          ) : (
            <PillButton color={ACCENT} onClick={pedal} className="min-h-[68px] w-full text-[22px]">
              PEDAL!
            </PillButton>
          )}
        </div>
      </GameSheet>
    </div>
  );
}
