"use client";

/* ─── Game 19 — Airplane Fly (science: flight) ───
   A real little airplane (photoreal sprite) cruises across
   a real sky; the child holds and drags up or down and the
   plane answers like a plane — it has lift and momentum, so
   it eases toward the finger on a spring of air, banking
   into climbs and dives, propeller already a blur. Golden
   rings drift by — steer through one and it chimes, bursts
   a star, and the count climbs. Miss one and it simply
   floats away: there is no crashing and no failing in this
   sky. Five rings complete the flight. Ring heights are
   dealt fresh all flight long, so the path is never the
   same twice. */

import { useEffect, useRef, useState } from "react";
import { GlyphStar } from "@/components/glyphs";
import { isSoundEnabled, playCorrect, speakWord } from "@/lib/audio";
import { NUMBER_WORDS } from "@/lib/games-data";
import { GOLD } from "@/lib/theme";
import { GameCelebration, GameHeader, GameSheet, PromptRow, useAutoAnnounce, useGameCompletion } from "./shared";

const ACCENT = "#38BDF8";
const TOTAL = 5;
const PLANE_X = 20; // percent of stage width
const RING_SPEED = 13; // percent per second

type Ring = { id: number; x: number; y: number };

const CLOUD_BASES = [8, 42, 74, 108];
const TREE_BASES = [4, 28, 52, 76, 100];

export function AirplaneFly({ onBack }: { onBack: () => void }) {
  const [session, setSession] = useState(0);
  const [collected, setCollected] = useState(0);
  const [burst, setBurst] = useState<number>(0);
  const [frame, setFrame] = useState<{ planeY: number; tilt: number; bob: number; rings: Ring[]; t: number }>({
    planeY: 50,
    tilt: 0,
    bob: 0,
    rings: [],
    t: 0,
  });
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-airplane-fly");

  const planeYRef = useRef(50);
  const planeVRef = useRef(0);
  const targetYRef = useRef(50);
  const ringsRef = useRef<Ring[]>([]);
  const collectedRef = useRef(0);
  const finishedRef = useRef(false);
  const idRef = useRef(0);
  const nextRingAtRef = useRef(0);
  const downRef = useRef(false);
  const burstTimeoutRef = useRef(0);

  useAutoAnnounce("Fly the plane through the rings!", `${session}`);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const start = last;
    nextRingAtRef.current = start + 700;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - start) / 1000;

      /* Flight model: a spring of lift pulls the plane toward
         the finger while air damping bleeds the speed — it
         overshoots a whisper, settles smooth, and banks with
         its true vertical velocity. Never jerky, never late. */
      const accel = (targetYRef.current - planeYRef.current) * 26 - planeVRef.current * 7.2;
      planeVRef.current += accel * dt;
      planeYRef.current += planeVRef.current * dt;
      planeYRef.current = Math.max(6, Math.min(90, planeYRef.current));
      const tilt = Math.max(-20, Math.min(20, planeVRef.current * 0.62));
      const bob = Math.sin(t * 2.1) * 0.7;

      /* Spawn rings at fresh heights while the flight lasts. */
      if (!finishedRef.current && now >= nextRingAtRef.current && ringsRef.current.length < 3) {
        nextRingAtRef.current = now + 2300 + Math.random() * 700;
        ringsRef.current = [
          ...ringsRef.current,
          { id: ++idRef.current, x: 106, y: 16 + Math.random() * 62 },
        ];
      }

      /* Drift rings left; a ring crossing the plane's line is
         either flown through (chime + count) or floats past. */
      const kept: Ring[] = [];
      for (const ring of ringsRef.current) {
        const prevX = ring.x;
        const x = ring.x - RING_SPEED * dt;
        if (!finishedRef.current && prevX > PLANE_X && x <= PLANE_X) {
          if (Math.abs(ring.y - planeYRef.current) <= 13) {
            collectedRef.current += 1;
            const n = collectedRef.current;
            setCollected(n);
            playCorrect();
            if (isSoundEnabled()) void speakWord(`${NUMBER_WORDS[n - 1]}!`);
            setBurst(now);
            window.clearTimeout(burstTimeoutRef.current);
            burstTimeoutRef.current = window.setTimeout(() => setBurst(0), 650);
            if (n >= TOTAL) {
              finishedRef.current = true;
              finish();
            }
            continue; // the ring is collected — it leaves the sky
          }
        }
        if (x > -12) kept.push({ ...ring, x });
      }
      ringsRef.current = kept;

      setFrame({ planeY: planeYRef.current, tilt, bob, rings: kept, t });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(burstTimeoutRef.current);
    };
    /* `finish` is a stable useCallback keyed by the game id, so
       this loop still mounts exactly once. */
  }, [finish]);

  const steer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    targetYRef.current = Math.max(10, Math.min(86, y));
  };

  const replay = () => {
    resetCompletion();
    planeYRef.current = 50;
    planeVRef.current = 0;
    targetYRef.current = 50;
    ringsRef.current = [];
    collectedRef.current = 0;
    finishedRef.current = false;
    setCollected(0);
    setSession((s) => s + 1);
  };

  if (xpEarned !== null) {
    return (
      <GameCelebration
        title="You did it!"
        subtitle="Airplane fly complete"
        xpEarned={xpEarned}
        accent={ACCENT}
        onReplay={replay}
      />
    );
  }

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      <GameHeader title="Airplane fly" onBack={onBack} step={collected} total={TOTAL} />
      <GameSheet>
        <PromptRow speakText="Fly the plane through the rings!" accent={ACCENT}>
          Fly the plane through the rings!
        </PromptRow>

        {/* The sky — hold and drag to steer */}
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <div
            className="relative h-[290px] w-full max-w-md touch-none select-none overflow-hidden"
            style={{ borderRadius: 28, background: "linear-gradient(180deg, #6FC4FF 0%, #AEE6FF 55%, #DFF6FF 100%)" }}
            role="img"
            aria-label="An airplane flying through golden rings in the sky"
            onPointerDown={(e) => {
              downRef.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              steer(e);
            }}
            onPointerMove={(e) => {
              if (downRef.current) steer(e);
            }}
            onPointerUp={() => {
              downRef.current = false;
            }}
            onPointerCancel={() => {
              downRef.current = false;
            }}
          >
            {/* Drifting photoreal clouds */}
            {CLOUD_BASES.map((base, i) => {
              const cx = ((((base - frame.t * 1.7) % 130) + 130) % 130) - 15;
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src="/images/play/sprite-cloud.webp"
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute"
                  style={{ left: `${cx}%`, top: `${6 + (i % 3) * 15}%`, width: 96, opacity: 0.95 }}
                  aria-hidden
                />
              );
            })}

            {/* Rings */}
            {frame.rings.map((ring) => (
              <svg
                key={ring.id}
                width="68"
                height="68"
                viewBox="0 0 68 68"
                className="absolute"
                style={{ left: `${ring.x}%`, top: `${ring.y}%`, transform: "translate(-50%, -50%)" }}
                aria-hidden
              >
                <circle cx="34" cy="34" r="24" fill="rgba(255,197,49,0.16)" stroke="#EDA900" strokeWidth="8" />
                <circle cx="34" cy="34" r="24" fill="none" stroke="#FFC531" strokeWidth="3" strokeDasharray="6 7" />
              </svg>
            ))}

            {/* Star burst on a collected ring */}
            {burst ? (
              <span
                key={burst}
                className="kt-pop-in absolute"
                style={{ left: `${PLANE_X + 6}%`, top: `${frame.planeY - 14}%`, color: GOLD }}
                aria-hidden
              >
                <GlyphStar size={38} />
              </span>
            ) : null}

            {/* The plane — photoreal sprite, flipped to face the
                rings, banked by its real vertical velocity */}
            <div
              className="pointer-events-none absolute"
              style={{
                left: `${PLANE_X}%`,
                top: `${frame.planeY + frame.bob}%`,
                transform: `translate(-50%, -50%) rotate(${frame.tilt}deg)`,
                filter: "drop-shadow(0 10px 10px rgba(23, 68, 120, 0.35))",
              }}
              aria-hidden
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/play/sprite-plane.webp"
                alt=""
                draggable={false}
                style={{ width: 122, transform: "scaleX(-1)" }}
              />
            </div>

            {/* Green fields far below, photo trees rolling past */}
            <div className="absolute inset-x-0 bottom-0 h-9 overflow-hidden bg-[#58C172]">
              {TREE_BASES.map((base, i) => {
                const tx = ((((base - frame.t * 6) % 120) + 120) % 120) - 10;
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src="/images/play/sprite-tree.webp"
                    alt=""
                    draggable={false}
                    className="pointer-events-none absolute"
                    style={{ left: `${tx}%`, bottom: -6, width: 24 }}
                    aria-hidden
                  />
                );
              })}
            </div>
          </div>
          <p className="mt-3 text-center text-[15px] font-bold text-soft">Hold and drag up and down to fly!</p>
        </div>
      </GameSheet>
    </div>
  );
}
