"use client";

/* ─── Game 17 — Bowling Roll (physics: rolling + collisions) ───
   Six photoreal pins stand at the end of a real bowling lane
   (photo plate). Tap ROLL (or swipe up the lane) and the ball
   truly rolls: it accelerates away, lane friction bleeds its
   speed, it shrinks with perspective — and when it reaches
   the pins, physics takes over. The ball's impact topples the
   pins it strikes; falling pins slide with friction, spin,
   bounce once on the deck, and knock their neighbours down
   in chain reactions. Then the counting starts: every fallen
   pin wears a gold halo, the child taps them one by one, and
   each tap pops a big number badge onto the pin and speaks
   the number out loud. The pins always stand back up for the
   next roll. Three rolls per playthrough. */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { isSoundEnabled, playCorrect, playPop, speakWord } from "@/lib/audio";
import { NUMBER_WORDS, randomInt, shuffle } from "@/lib/games-data";
import { GOLD, INK } from "@/lib/theme";
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
const PIN_SPOTS = [
  { x: 180, y: 74, s: 0.78 },
  { x: 158, y: 100, s: 0.9 },
  { x: 202, y: 100, s: 0.9 },
  { x: 136, y: 126, s: 1 },
  { x: 180, y: 126, s: 1 },
  { x: 224, y: 126, s: 1 },
];
const PIN_H = 47; // sprite height at scale 1 (sprite is 639×2023)

type PinSim = {
  x: number;
  vx: number;
  angle: number;
  va: number;
  hit: boolean;
  settled: boolean;
};
type BallSim = { x: number; y: number; r: number; spin: number; v: number; vx: number };

type Phase = "aim" | "rolling" | "count" | "counted";

const freshPins = (): PinSim[] =>
  PIN_SPOTS.map((p) => ({ x: p.x, vx: 0, angle: 0, va: 0, hit: false, settled: false }));

export function BowlingRoll({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0);
  const [session, setSession] = useState(0);
  const [phase, setPhase] = useState<Phase>("aim");
  const [ball, setBall] = useState<BallSim | null>(null);
  const [pins, setPins] = useState<PinSim[]>(freshPins);
  const [badges, setBadges] = useState<Map<number, number>>(new Map());
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-bowling-roll");

  /* The photo ball is purple marble; hue shifts deal the
     other colours round by round. */
  const ballHues = useMemo(() => shuffle([0, 95, -45, 55]).slice(0, TOTAL), [session]);
  const ballHue = ballHues[round];

  const phaseRef = useRef<Phase>("aim");
  const rafRef = useRef(0);
  const timeoutRef = useRef(0);
  const swipeRef = useRef<{ y: number } | null>(null);
  const simRef = useRef<{ ball: BallSim; pins: PinSim[]; t: number } | null>(null);

  const fallenCount = pins.filter((p) => Math.abs(p.angle) > 45).length;
  const counted = badges.size;

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
    setPhaseBoth("rolling");
    playPop();
    simRef.current = {
      ball: { x: 180, y: 252, r: 19, spin: 0, v: 356, vx: randomInt(-13, 13) },
      pins: freshPins(),
      t: 0,
    };
    setPins(simRef.current.pins);
    let last = performance.now();
    let crashSpoken = false;
    const step = (now: number) => {
      const sim = simRef.current;
      if (!sim) return;
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      sim.t += dt;
      const b = sim.ball;

      /* ── Ball: rolls away, friction bleeds speed, perspective
         shrinks it, spin tied to distance travelled. ── */
      if (b.y > 44) {
        b.v = Math.max(96, b.v - 62 * dt);
        const dy = b.v * dt;
        b.y -= dy;
        b.x += b.vx * dt;
        b.r = 10 + (b.y - 44) / (252 - 44) * 9;
        b.spin += (dy / Math.max(6, b.r)) * (180 / Math.PI);
      }

      /* ── Ball → pin impacts: a struck pin takes the ball's
         momentum sideways and starts to topple. ── */
      sim.pins.forEach((pin, i) => {
        if (pin.hit) return;
        const spot = PIN_SPOTS[i];
        const dx = pin.x - b.x;
        const dy = spot.y - b.y;
        if (Math.hypot(dx, dy) < b.r + 13 * spot.s && b.y < spot.y + 16) {
          pin.hit = true;
          pin.vx = dx * 2.6 + b.vx * 0.7 + (dx >= 0 ? 26 : -26);
          pin.va = (dx >= 0 ? 1 : -1) * (150 + Math.abs(dx) * 4 + b.v * 0.22);
          if (!crashSpoken) {
            crashSpoken = true;
            playCorrect();
            if (isSoundEnabled()) void speakWord("Down they go!");
          }
        }
      });
      /* The ball dies into the pit behind the deck. */
      if (b.y <= 46) b.v = 0;

      /* ── Pins: toppling accelerates like a real fall (the
         further over, the faster), one bounce on the deck,
         sliding friction, and chain reactions — a pin well
         past upright sweeps its standing neighbours. ── */
      sim.pins.forEach((pin, i) => {
        if (!pin.hit || pin.settled) return;
        if (Math.abs(pin.angle) > 4) pin.va += Math.sin((pin.angle * Math.PI) / 180) * 620 * dt * Math.sign(pin.va || 1);
        pin.angle += pin.va * dt;
        if (Math.abs(pin.angle) >= 94) {
          pin.angle = Math.sign(pin.angle) * 94;
          pin.va = Math.abs(pin.va) > 130 ? -pin.va * 0.22 : 0; // one dead bounce
          if (pin.va === 0 && Math.abs(pin.vx) < 8) pin.settled = true;
        }
        pin.va *= Math.max(0, 1 - 1.4 * dt);
        pin.x += pin.vx * dt;
        pin.vx *= Math.max(0, 1 - 3.2 * dt);
        if (Math.abs(pin.angle) > 38) {
          sim.pins.forEach((other, j) => {
            if (j === i || other.hit) return;
            if (Math.abs(PIN_SPOTS[j].x - pin.x) < 34 && Math.abs(PIN_SPOTS[j].y - PIN_SPOTS[i].y) < 30) {
              other.hit = true;
              const dir = PIN_SPOTS[j].x >= pin.x ? 1 : -1;
              other.vx = dir * (30 + Math.abs(pin.vx) * 0.5);
              other.va = dir * (170 + Math.abs(pin.va) * 0.35);
            }
          });
        }
      });

      setBall(b.y > 44 ? { ...b } : null);
      setPins([...sim.pins]);

      const allSettled = sim.pins.every((p) => !p.hit || p.settled || Math.abs(p.va) < 4);
      if ((sim.t > 1.1 && allSettled && b.y <= 120) || sim.t > 3.4) {
        /* Toddler assist: a real crash rattles the deck — if the
           physics left fewer than 3 down, the nearest standing
           neighbour of a fallen pin wobbles over too, so the
           counting game always has pins to count. */
        const down = sim.pins.filter((p) => Math.abs(p.angle) > 45).length;
        if (down < 3 && down > 0) {
          sim.pins.forEach((pin, i) => {
            const downNow = sim.pins.filter((p) => Math.abs(p.angle) > 45).length;
            if (downNow >= 3 || pin.hit) return;
            const near = sim.pins.some(
              (p, j) => j !== i && Math.abs(p.angle) > 45 && Math.abs(PIN_SPOTS[j].x - PIN_SPOTS[i].x) < 52,
            );
            if (near) {
              pin.hit = true;
              pin.angle = PIN_SPOTS[i].x >= 180 ? 88 : -88;
              pin.settled = true;
            }
          });
          setPins([...sim.pins]);
        }
        /* Settle every pin one way or the other — nothing is
           left frozen mid-lean when the counting starts. */
        sim.pins.forEach((pin) => {
          if (Math.abs(pin.angle) >= 22) {
            pin.angle = Math.sign(pin.angle) * 90;
          } else {
            pin.angle = 0;
            pin.va = 0;
          }
          pin.settled = true;
        });
        setPins([...sim.pins]);
        simRef.current = null;
        setPhaseBoth("count");
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const tapPin = (i: number) => {
    if (phaseRef.current !== "count") return;
    if (Math.abs(pins[i].angle) <= 45 || badges.has(i)) return;
    const n = badges.size + 1;
    const nextBadges = new Map(badges);
    nextBadges.set(i, n);
    setBadges(nextBadges);
    playCorrect();
    if (isSoundEnabled()) void speakWord(`${NUMBER_WORDS[n - 1]}!`);
    if (n >= fallenCount) {
      timeoutRef.current = window.setTimeout(() => setPhaseBoth("counted"), 500);
    }
  };

  const next = () => {
    if (round + 1 >= TOTAL) {
      finish();
      return;
    }
    setPins(freshPins());
    setBadges(new Map());
    setBall(null);
    setPhaseBoth("aim");
    setRound((r) => r + 1);
  };

  const replay = () => {
    resetCompletion();
    setPins(freshPins());
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
              {/* Photoreal lane */}
              <image href="/images/play/bowling-lane.webp" x="0" y="-38" width="360" height="360" preserveAspectRatio="xMidYMid slice" />
              {/* Pins */}
              {PIN_SPOTS.map((spot, i) => {
                const pin = pins[i];
                const isFallen = Math.abs(pin.angle) > 45;
                const badge = badges.get(i);
                const dimmed = phase === "count" || phase === "counted" ? !isFallen : false;
                const h = PIN_H * spot.s;
                const w = h * (639 / 2023);
                return (
                  <g
                    key={i}
                    opacity={dimmed ? 0.45 : 1}
                    onClick={() => tapPin(i)}
                    style={{ cursor: phase === "count" && isFallen && !badge ? "pointer" : "default" }}
                    role={phase === "count" && isFallen && !badge ? "button" : undefined}
                    aria-label={isFallen ? `Fallen pin ${i + 1}` : `Pin ${i + 1}`}
                  >
                    {phase === "count" && isFallen && !badge ? (
                      <circle cx={pin.x} cy={spot.y - 16 * spot.s} r={26 * spot.s} fill={GOLD} opacity="0.45" />
                    ) : null}
                    <ellipse cx={pin.x} cy={spot.y + 2} rx={11 * spot.s} ry={3} fill="#3a2410" opacity="0.3" />
                    <g transform={`translate(${pin.x} ${spot.y}) rotate(${pin.angle})`}>
                      <image href="/images/play/sprite-bowling-pin.webp" x={-w / 2} y={-h} width={w} height={h} />
                    </g>
                    {badge ? (
                      <g transform={`translate(${pin.x + 16 * spot.s} ${spot.y - 40 * spot.s})`}>
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
                <g>
                  <ellipse cx="180" cy="256" rx="19" ry="4.5" fill="#3a2410" opacity="0.35" />
                  <image
                    href="/images/play/sprite-bowling-ball.webp"
                    x={180 - 19}
                    y={252 - 19}
                    width="38"
                    height="38"
                    style={ballHue ? { filter: `hue-rotate(${ballHue}deg)` } : undefined}
                  />
                </g>
              ) : null}
              {ball ? (
                <g transform={`translate(${ball.x} ${ball.y})`}>
                  <ellipse cx="0" cy={ball.r * 0.92} rx={ball.r * 0.95} ry={ball.r * 0.24} fill="#3a2410" opacity="0.32" />
                  <g transform={`rotate(${ball.spin})`}>
                    <image
                      href="/images/play/sprite-bowling-ball.webp"
                      x={-ball.r}
                      y={-ball.r}
                      width={ball.r * 2}
                      height={ball.r * 2}
                      style={ballHue ? { filter: `hue-rotate(${ballHue}deg)` } : undefined}
                    />
                  </g>
                </g>
              ) : null}
            </svg>
          </div>
          <p className="mt-3 h-6 text-[17px] font-black capitalize" style={{ color: counted > 0 ? "#28A745" : "transparent" }}>
            {counted > 0 ? `${NUMBER_WORDS[counted - 1]}!` : " "}
          </p>
        </div>

        {/* Roll / next — fixed-height slot. ROLL fires on
            pointer-down so the throw starts with the touch. */}
        <div className="flex min-h-[96px] flex-col justify-center">
          {phase === "counted" ? (
            <NextButton label={round + 1 >= TOTAL ? "Finish" : "Roll again"} accent={ACCENT} onClick={next} />
          ) : phase === "aim" ? (
            <button
              type="button"
              aria-label="Roll the ball"
              onPointerDown={roll}
              onContextMenu={(e) => e.preventDefault()}
              className="btn-led inline-flex min-h-[68px] w-full touch-none select-none items-center justify-center rounded-full text-[22px] font-black transition-transform active:scale-[0.97]"
              style={
                {
                  "--btn": ACCENT,
                  "--btn-deep": "#6D28D9",
                  "--btn-ink": "#FFFFFF",
                } as CSSProperties
              }
            >
              ROLL THE BALL!
            </button>
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
