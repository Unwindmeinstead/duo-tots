"use client";

/* ─── Game 16 — Pedal Power (physics: rotation & momentum) ───
   A real bicycle (photoreal sprite) waits at the start of the
   path. Every tap on the big PEDAL button gives the bike a
   real shove of momentum — it surges, then rolling drag
   gently bleeds the speed away; tap again and off it goes.
   Photo trees and houses roll past (nearer = faster), clouds
   drift slower still — true parallax. No falling, no failing
   — just pedalling. Three rides per playthrough, each to a
   different place (park, beach, playground), with the bike
   repainted (hue shift) and the distance changed every time. */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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

/* The photo bike is 1649×1167 — drawn 124 wide, wheels down. */
const BIKE_W = 124;
const BIKE_H = BIKE_W * (1167 / 1649);
const BIKE_X = 30;
const BIKE_HUES = [0, 215, 32, 272];

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
  { dx: 80, y: 30, s: 1 },
  { dx: 330, y: 54, s: 0.7 },
  { dx: 560, y: 24, s: 0.85 },
  { dx: 800, y: 48, s: 0.6 },
] as const;

type Phase = "ride" | "done";

/* Dust puffs kicked up at the rear wheel while the bike rolls. */
type Dust = { id: number; x: number; y: number; vx: number; vy: number; r: number; life: number };

export function PedalPower({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [session, setSession] = useState(0);
  const [frame, setFrame] = useState({ dist: 0, speed: 0, lunge: 0, dust: [] as Dust[] });
  const [phase, setPhase] = useState<Phase>("ride");
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-pedal-power");

  const configs = useMemo(() => {
    const hues = shuffle(BIKE_HUES).slice(0, TOTAL);
    const dests = shuffle(DESTINATIONS);
    return hues.map((hue, i) => ({ hue, goal: GOALS[i], destination: dests[i] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);
  const config = configs[round];

  const distRef = useRef(0);
  const speedRef = useRef(0);
  /* The lunge: every PEDAL tap kicks the bike forward on a
     spring, so the shove is SEEN the instant the finger lands —
     surge, overshoot a hair, settle. */
  const lungeRef = useRef(0);
  const lungeVRef = useRef(0);
  const dustRef = useRef<Dust[]>([]);
  const dustIdRef = useRef(0);
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
        /* Rolling drag: a steady bite plus a whisper of air
           drag, so a shove coasts out smoothly, never jerky. */
        speedRef.current = Math.max(0, speedRef.current - (96 + speedRef.current * 0.24) * dt);
        distRef.current += speedRef.current * dt;
        /* Lunge spring — kicked by every pedal tap. */
        const la = -lungeRef.current * 190 - lungeVRef.current * 13;
        lungeVRef.current += la * dt;
        lungeRef.current += lungeVRef.current * dt;
        /* Dust at the rear wheel, thicker the faster it rolls. */
        if (speedRef.current > 45 && Math.random() < Math.min(0.8, speedRef.current / 380)) {
          dustRef.current.push({
            id: dustIdRef.current++,
            x: BIKE_X + 16 + Math.random() * 6,
            y: GROUND_Y - 2,
            vx: -22 - Math.random() * 30,
            vy: -6 - Math.random() * 12,
            r: 2.5 + Math.random() * 3.5,
            life: 1,
          });
        }
        if (dustRef.current.length) {
          for (const d of dustRef.current) {
            d.x += d.vx * dt;
            d.y += d.vy * dt;
            d.vy -= 9 * dt;
            d.r += 8 * dt;
            d.life -= dt * 1.6;
          }
          dustRef.current = dustRef.current.filter((d) => d.life > 0);
        }
        if (distRef.current >= goalRef.current) {
          distRef.current = goalRef.current;
          phaseRef.current = "done";
          setPhase("done");
          playCorrect();
          if (isSoundEnabled()) void speakWord(`You rode to ${destRef.current}!`);
        }
        setFrame({ dist: distRef.current, speed: speedRef.current, lunge: lungeRef.current, dust: dustRef.current });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pedal = () => {
    if (phaseRef.current !== "ride") return;
    speedRef.current = Math.min(330, speedRef.current + 66);
    lungeVRef.current += 300; // the visible surge — the tap made that happen
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
    setFrame({ dist: 0, speed: 0, lunge: 0, dust: [] });
    setPhase("ride");
    setRound((r) => r + 1);
  };

  const replay = () => {
    resetCompletion();
    distRef.current = 0;
    speedRef.current = 0;
    phaseRef.current = "ride";
    setFrame({ dist: 0, speed: 0, lunge: 0, dust: [] });
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
        onExit={onBack}
      />
    );
  }

  const { dist, speed } = frame;
  const flagX = config.goal - dist + 96;
  const progress = Math.min(100, (dist / config.goal) * 100);
  /* Riding bob: the faster it rolls, the livelier the bounce. */
  const bob = speed > 18 ? Math.sin(dist * 0.11) * Math.min(2.2, speed / 130) : 0;

  const sceneryNodes: React.ReactNode[] = [];
  for (const item of SCENERY) {
    for (let k = 0; k < 3; k++) {
      const sx = item.dx + k * 900 - dist + 40;
      if (sx < -90 || sx > 450) continue;
      sceneryNodes.push(
        <g key={`${item.dx}-${k}`}>
          {item.kind === "tree" ? (
            <image href="/images/play/sprite-tree.webp" x={sx - 26} y={GROUND_Y - 78} width="52" height="78" />
          ) : item.kind === "house" ? (
            <image href="/images/play/sprite-house.webp" x={sx - 34} y={GROUND_Y - 54} width="68" height="54" />
          ) : (
            <g transform={`translate(${sx} ${GROUND_Y})`}>
              <line x1="0" y1="0" x2="0" y2="-10" stroke="#28A745" strokeWidth="3" strokeLinecap="round" />
              <circle cx="0" cy="-14" r="5.5" fill="#F0519B" />
              <circle cx="0" cy="-14" r="2" fill="#FFC531" />
            </g>
          )}
        </g>,
      );
    }
  }
  const cloudNodes = CLOUDS.map((c) => {
    const cx = ((((c.dx - dist * 0.35) % 900) + 900) % 900) - 60;
    return (
      <image
        key={c.dx}
        href="/images/play/sprite-cloud.webp"
        x={cx}
        y={c.y - 20}
        width={92 * c.s}
        height={62 * c.s}
        opacity="0.95"
      />
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
              <defs>
                <pattern id="pp-grass" width="72" height="72" patternUnits="userSpaceOnUse">
                  <image href="/images/play/tex-grass.webp" width="72" height="72" preserveAspectRatio="none" />
                </pattern>
                <pattern id="pp-dirt" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform={`translate(${-dist % 64} 0)`}>
                  <image href="/images/play/tex-dirt.webp" width="64" height="64" preserveAspectRatio="none" />
                </pattern>
                <linearGradient id="pp-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6FC4FF" />
                  <stop offset="70%" stopColor="#BDE6FF" />
                  <stop offset="100%" stopColor="#DFF6FF" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="360" height="220" fill="url(#pp-sky)" />
              <circle cx="36" cy="30" r="15" fill="#FFD94D" opacity="0.9" />
              {cloudNodes}
              {/* Real grass below, a real dirt path on top of it —
                  the path texture scrolls with the ride. */}
              <rect x="0" y={GROUND_Y} width="360" height={220 - GROUND_Y} fill="url(#pp-grass)" />
              <rect x="0" y={GROUND_Y} width="360" height={220 - GROUND_Y} fill="#3E9B4F" opacity="0.25" />
              <rect x="0" y={GROUND_Y - 2} width="360" height="13" fill="url(#pp-dirt)" />
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
                  <line x1="6" y1="128" x2="30" y2="128" />
                  <line x1="2" y1="148" x2="28" y2="148" />
                  <line x1="8" y1="168" x2="32" y2="168" />
                </g>
              ) : null}
              {/* Dust puffs at the rear wheel */}
              {frame.dust.map((d) => (
                <circle key={d.id} cx={d.x} cy={d.y} r={d.r} fill="#C9A877" opacity={d.life * 0.45} />
              ))}
              {/* Shadow, then the photo bicycle with its riding bob
                  and the pedal lunge — every tap visibly surges it */}
              <ellipse cx={BIKE_X + BIKE_W / 2 + frame.lunge} cy={GROUND_Y + 4} rx="56" ry="5" fill="#1d4d24" opacity="0.32" />
              <image
                href="/images/play/sprite-bike.webp"
                x={BIKE_X + frame.lunge}
                y={GROUND_Y - BIKE_H + 3 - bob}
                width={BIKE_W}
                height={BIKE_H}
                style={config.hue ? { filter: `hue-rotate(${config.hue}deg)` } : undefined}
              />
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

        {/* Pedal zone / next — fixed-height slot. PEDAL fires on
            pointer-DOWN so the shove lands the instant the finger
            does — no click delay for little hands. */}
        <div className="flex min-h-[96px] flex-col justify-center">
          {phase === "done" ? (
            <NextButton label={round + 1 >= TOTAL ? "Finish" : "Next ride"} accent={ACCENT} onClick={next} />
          ) : (
            <button
              type="button"
              aria-label="Pedal the bicycle"
              onPointerDown={pedal}
              onContextMenu={(e) => e.preventDefault()}
              className="btn-led inline-flex min-h-[68px] w-full touch-none select-none items-center justify-center rounded-full text-[22px] font-black transition-transform active:scale-[0.97]"
              style={
                {
                  "--btn": ACCENT,
                  "--btn-deep": deepen(ACCENT),
                  "--btn-ink": "#FFFFFF",
                } as CSSProperties
              }
            >
              PEDAL!
            </button>
          )}
        </div>
      </GameSheet>
    </div>
  );
}
