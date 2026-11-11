"use client";

/* ─── Game 19 — Airplane Fly (science: flight) ───
   The plane cruises across the sky on its own; the child
   holds and drags up or down and the plane gently climbs
   or dives to follow their finger. Golden rings drift by —
   steer through one and it chimes, bursts a star, and the
   count climbs. Miss one and it simply floats away: there
   is no crashing and no failing in this sky. Five rings
   complete the flight. Ring heights are dealt fresh all
   flight long, so the path is never the same twice. */

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
  const [frame, setFrame] = useState<{ planeY: number; tilt: number; rings: Ring[]; t: number }>({
    planeY: 50,
    tilt: 0,
    rings: [],
    t: 0,
  });
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-airplane-fly");

  const planeYRef = useRef(50);
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

      /* The plane eases toward the finger — soft, never jerky. */
      const prevY = planeYRef.current;
      planeYRef.current += (targetYRef.current - planeYRef.current) * Math.min(1, dt * 5.5);
      const vel = dt > 0 ? (planeYRef.current - prevY) / dt : 0;
      const tilt = Math.max(-18, Math.min(18, vel * 0.55));

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

      setFrame({ planeY: planeYRef.current, tilt, rings: kept, t });
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

  const propRot = (frame.t * 720) % 360;

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
            style={{ borderRadius: 28, background: "linear-gradient(180deg, #7ED0FF 0%, #CDEFFF 78%, #E8FBFF 100%)" }}
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
            {/* Drifting clouds */}
            {CLOUD_BASES.map((base, i) => {
              const cx = ((((base - frame.t * 1.7) % 130) + 130) % 130) - 15;
              return (
                <svg
                  key={i}
                  width="86"
                  height="40"
                  viewBox="0 0 86 40"
                  className="absolute"
                  style={{ left: `${cx}%`, top: `${8 + (i % 3) * 16}%`, opacity: 0.9 }}
                  aria-hidden
                >
                  <g fill="#FFFFFF">
                    <ellipse cx="43" cy="24" rx="26" ry="12" />
                    <ellipse cx="26" cy="28" rx="17" ry="9" />
                    <ellipse cx="60" cy="28" rx="18" ry="9" />
                  </g>
                </svg>
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

            {/* The plane */}
            <div
              className="absolute"
              style={{
                left: `${PLANE_X}%`,
                top: `${frame.planeY}%`,
                transform: `translate(-50%, -50%) rotate(${frame.tilt}deg)`,
              }}
              aria-hidden
            >
              <svg width="98" height="64" viewBox="0 0 98 64">
                <path d="M12,26 L3,13 Q1,8 7,10 L18,15 Q22,19 20,27 Z" fill="#2B7FFF" />
                <path
                  d="M8,34 Q10,24 27,22 L58,20 Q84,20 90,29 Q93,34 88,38 Q79,45 57,45 L28,45 Q12,45 8,34 Z"
                  fill="#F24949"
                  stroke="#C93333"
                  strokeWidth="2.5"
                />
                <path d="M40,22 L57,22 L50,11 Q47,7 43,12 Z" fill="#2B7FFF" />
                <path d="M39,43 L58,43 L50,56 Q47,60 42,55 Z" fill="#2B7FFF" />
                <circle cx="61" cy="29" r="3.6" fill="#BDE6FF" />
                <circle cx="72" cy="29" r="3.6" fill="#BDE6FF" />
                <g transform={`rotate(${propRot} 93 32)`}>
                  <line x1="93" y1="19" x2="93" y2="45" stroke="#5A6B8C" strokeWidth="4" strokeLinecap="round" />
                </g>
                <circle cx="93" cy="32" r="3.4" fill="#2B3550" />
              </svg>
            </div>

            {/* Rolling ground far below */}
            <div className="absolute inset-x-0 bottom-0 h-9 bg-[#58C172]">
              {TREE_BASES.map((base, i) => {
                const tx = ((((base - frame.t * 6) % 120) + 120) % 120) - 10;
                return (
                  <span
                    key={i}
                    className="absolute bottom-1 block rounded-full bg-[#34C759]"
                    style={{ left: `${tx}%`, width: 22, height: 14 }}
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
