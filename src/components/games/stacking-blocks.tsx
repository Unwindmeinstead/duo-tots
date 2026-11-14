"use client";

/* ─── Game 2 — Stacking Blocks ───
   A ghost tower on the sheet shows where each block goes; the NEXT
   block's ghost gently pulses. Tap that block in the tray and it
   DROPS onto the tower like a real wooden block — gravity pulls
   it down, it lands with a soft thock, bounces a little (less
   every bounce, the way real things lose energy), and the whole
   tower wobbles for a moment on its springy base. The blocks
   themselves are wood now: real beech grain stained with each
   colour. Wrong blocks wiggle with the gentle ding — no harm,
   no fail. The last block finishes the game.

   The tower itself is dealt fresh every playthrough (makeTower):
   6 blocks drawn from 8 shapes × 10 colours, tray shuffled — the
   old single fixed tower is gone, so there's nothing to memorize. */

import { useEffect, useMemo, useRef, useState } from "react";
import { playCorrect, playGentle, playPop } from "@/lib/audio";
import { makeTower, shuffle, type StackBlock } from "@/lib/games-data";
import { ShapeSvg } from "./shapes";
import { GameCelebration, GameHeader, GameSheet, PromptRow, useAutoAnnounce, useGameCompletion } from "./shared";

const ACCENT = "#8B5CF6";
const TOTAL = 6;
const DROP_FROM = -118; // px above the slot the block falls from
const GRAVITY = 2500; // px/s²
const RESTITUTION = 0.34; // energy kept per bounce

export function StackingBlocks({ onBack }: { onBack: () => void }) {
  const [placed, setPlaced] = useState(0);
  const [wiggleId, setWiggleId] = useState<string | null>(null);
  const [dropY, setDropY] = useState<number | null>(null);
  const [wobble, setWobble] = useState(0);
  const [session, setSession] = useState(0);
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-stacking-blocks");

  /* The tower is dealt once per playthrough; the tray is the same
     deal shuffled. Placed blocks leave the tray. */
  const tower = useMemo(
    () => makeTower(TOTAL),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session],
  );
  const tray = useMemo(
    () => shuffle(tower),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, tower],
  );
  const needed: StackBlock | undefined = tower[placed];
  useAutoAnnounce(needed ? `Tap the ${needed.label}!` : "", `${session}-${placed}`);
  const remaining = tray.filter((b) => !tower.slice(0, placed).some((p) => p.id === b.id));

  /* Drop + wobble physics (refs integrate, state mirrors). */
  const dropRef = useRef<{ y: number; v: number } | null>(null);
  const wobbleRef = useRef({ a: 0, va: 0 });
  const placedRef = useRef(0);
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const drop = dropRef.current;
      if (drop) {
        drop.v += GRAVITY * dt;
        drop.y += drop.v * dt;
        if (drop.y >= 0) {
          drop.y = 0;
          if (Math.abs(drop.v) > 130) {
            /* A real bounce: most of the energy is gone, and
               the tower takes a wobble from the landing. */
            drop.v = -drop.v * RESTITUTION;
            wobbleRef.current.va += Math.min(3.2, Math.abs(drop.v) * 0.006);
            playPop();
          } else {
            dropRef.current = null;
            setDropY(null);
            playPop();
            if (placedRef.current >= TOTAL) {
              window.setTimeout(() => finishRef.current(), 350);
            }
          }
        }
        if (dropRef.current) setDropY(drop.y);
      }
      const w = wobbleRef.current;
      if (Math.abs(w.a) > 0.001 || Math.abs(w.va) > 0.001) {
        /* Damped spring — the tower sways and settles. */
        w.va += (-w.a * 110 - w.va * 5.2) * dt;
        w.a += w.va * dt;
        setWobble(w.a);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const tapBlock = (block: StackBlock) => {
    if (!needed) return;
    if (block.id === needed.id) {
      playCorrect();
      const nextPlaced = placed + 1;
      placedRef.current = nextPlaced;
      setPlaced(nextPlaced);
      dropRef.current = { y: DROP_FROM, v: 0 };
      setDropY(DROP_FROM);
    } else {
      playGentle();
      setWiggleId(block.id);
      window.setTimeout(() => setWiggleId((w) => (w === block.id ? null : w)), 450);
    }
  };

  const replay = () => {
    resetCompletion();
    dropRef.current = null;
    wobbleRef.current = { a: 0, va: 0 };
    placedRef.current = 0;
    setDropY(null);
    setWobble(0);
    setSession((s) => s + 1);
    setPlaced(0);
    setWiggleId(null);
  };

  if (xpEarned !== null) {
    return (
      <GameCelebration
        title="You did it!"
        subtitle="Stacking blocks complete"
        xpEarned={xpEarned}
        accent={ACCENT}
        onReplay={replay}
      />
    );
  }

  return (
    /* h-dvh, not min-h-dvh (audit failure #4): the play area below
       scrolls internally, and an internal overflow region only
       engages when every ancestor has a DEFINITE height. With a
       min-height root the column simply grew past the screen, the
       scroll region grew with it, and the tray's bottom row hung
       off-screen under the locked page — unreachable. A fixed
       viewport height makes the flex chain constrain: header and
       prompt stay pinned, tower + tray scroll inside when a short
       screen can't hold them, and nothing scrolls when it fits. */
    <div className="kt-fade-in flex h-dvh flex-col bg-royal">
      <GameHeader title="Stacking blocks" onBack={onBack} step={placed} total={TOTAL} />
      <GameSheet>
        {needed ? (
          /* The instruction line names the NEXT block to stack; the
             speaker button speaks exactly this line, and it changes
             with every block placed. */
          <PromptRow speakText={`Tap the ${needed.label}!`} accent={ACCENT}>
            Tap the <span style={{ color: needed.color }}>{needed.label}</span>!
          </PromptRow>
        ) : (
          <p className="pt-4 text-center text-[20px] font-black text-ink">You did it!</p>
        )}

        {/* Play area (Grey's scroll rule, 2026-11-07): the page
            itself stays locked — the tower is dealt at a fit scale
            so tower + tray share one phone screen, and this region
            scrolls INTERNALLY only if a short screen still can't
            hold them; when everything fits, nothing scrolls. The
            header + spoken prompt above stay fixed either way. */}
        <div className="kt-noscroll flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="flex min-h-full flex-col">
            {/* Tower — ghosts below, placed blocks drop in over them */}
            <div className="flex flex-1 flex-col items-center justify-end pb-2 pt-4">
              <div
                className="flex flex-col-reverse items-center"
                role="img"
                aria-label={`Tower, ${placed} of ${TOTAL} blocks stacked`}
                style={{
                  transform: `rotate(${wobble}deg)`,
                  transformOrigin: "50% 100%",
                }}
              >
                {tower.map((block, i) => {
                  const isPlaced = i < placed;
                  const isNext = i === placed;
                  const isDropping = isPlaced && i === placed - 1 && dropY !== null;
                  /* Six dealt blocks render at a fit scale — the dealt
                     `width` carries the narrowing rhythm, the scale
                     keeps the whole tower on one phone screen. The
                     tappable tray blocks below keep their full
                     chunky size; only the tower display shrinks. */
                  const display = Math.round(block.width * 0.46);
                  const slotHeight = block.shape === "block" ? Math.round(display * 0.42) + 4 : display + 2;
                  return (
                    <div key={block.id} className="flex items-center justify-center" style={{ height: slotHeight }}>
                      {isPlaced ? (
                        <span
                          className="inline-flex"
                          style={isDropping ? { transform: `translateY(${dropY}px)` } : undefined}
                        >
                          <ShapeSvg shape={block.shape} color={block.color} size={display} mode="real" />
                        </span>
                      ) : (
                        <span className={isNext ? "kt-pulse-soft inline-flex" : "inline-flex opacity-60"}>
                          <ShapeSvg shape={block.shape} color={block.color} size={display} mode="ghost" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Ground */}
              <div className="mt-1 h-3 w-64 max-w-full rounded-full bg-[#34C759] opacity-50" />
            </div>

            {/* Tray of blocks still to stack */}
            <div className="flex flex-wrap justify-center gap-3 pb-1 pt-2">
              {remaining.map((block) => (
                <button
                  key={block.id}
                  type="button"
                  aria-label={block.label}
                  onClick={() => tapBlock(block)}
                  className={`kt-card flex min-h-[104px] min-w-[96px] flex-col items-center justify-center gap-1 px-3 py-2 transition-transform active:scale-95 ${
                    wiggleId === block.id ? "kt-wiggle" : ""
                  }`}
                >
                  <ShapeSvg shape={block.shape} color={block.color} size={block.shape === "block" ? 84 : 58} mode="real" />
                  <span className="text-[12px] font-bold capitalize text-soft">{block.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </GameSheet>
    </div>
  );
}
