"use client";

/* ─── Drawing games — shared trace engine (Grey's order, 2026-11-08) ───
   One engine wears four decks (letters, numbers, animals, words).
   A big guide — a letter, a number, an animal shape, a short word —
   sits faint and dashed on the canvas; the child draws over it with
   a finger and a thick, cheerful stroke. Completion is FORGIVING by
   design: the guide is sampled into a coarse grid of zones, and
   when the child's strokes have covered half of the guide's zones
   the round celebrates (correct-ding family, star burst, the win
   spoken out loud). No precision is demanded, there is no fail
   state, and the Clear button just wipes the canvas with a pop —
   trying again is never framed as failure. Rounds are sampled from
   the full deck at play time (identification over memorization). */

import { useEffect, useMemo, useRef, useState } from "react";
import { PillButton } from "@/components/kit";
import { GlyphCheck, GlyphStar } from "@/components/glyphs";
import { isSoundEnabled, playCorrect, playPop, speakWord } from "@/lib/audio";
import { sample, type GameId } from "@/lib/games-data";
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

export type TraceGuide =
  | { kind: "text"; text: string }
  | { kind: "image"; src: string };

export type TraceItem = {
  key: string;
  /** The exact on-screen prompt — also the spoken prompt. */
  prompt: string;
  /** The win line, shown and spoken when the trace lands. */
  doneText: string;
  guide: TraceGuide;
};

const TOTAL = 5;

/** Cheerful stroke colours — one per round, cycling. */
const STROKE_COLORS = ["#F24949", "#FF9F2E", "#34C759", "#2B7FFF", "#8B5CF6", "#F0519B", "#17BEBB"];

const GUIDE_INK = "38, 52, 92";
const FONT_STACK = 'ui-rounded, "SF Pro Rounded", "Baloo 2", "Nunito", system-ui, sans-serif';

/* Coverage sampling grid, in canvas units. */
const CELL = 16;
/** Share of guide zones that must be painted to celebrate. */
const COVERAGE_GOAL = 0.5;

type Mask = {
  cols: number;
  rows: number;
  /** 0 = not guide, 1 = guide waiting, 2 = guide painted. */
  cells: Uint8Array;
  total: number;
  painted: number;
};

function fontFor(size: number): string {
  return `900 ${size}px ${FONT_STACK}`;
}

/** Draw the guide's solid shape (used for the coverage mask). */
function paintGuideShape(
  ctx: CanvasRenderingContext2D,
  guide: TraceGuide,
  img: HTMLImageElement | null,
  w: number,
  h: number,
) {
  ctx.clearRect(0, 0, w, h);
  if (guide.kind === "text") {
    let size = h * 0.78;
    ctx.font = fontFor(size);
    while (ctx.measureText(guide.text).width > w * 0.88 && size > 12) {
      size -= 8;
      ctx.font = fontFor(size);
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(guide.text, w / 2, h / 2 + size * 0.05);
    return size;
  }
  if (img) {
    const scale = Math.min((w * 0.9) / img.naturalWidth, (h * 0.9) / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }
  return 0;
}

/** Sample a painted guide canvas into the coverage zone grid. */
function buildMask(maskCanvas: HTMLCanvasElement, w: number, h: number): Mask {
  const cols = Math.ceil(w / CELL);
  const rows = Math.ceil(h / CELL);
  const cells = new Uint8Array(cols * rows);
  const mctx = maskCanvas.getContext("2d");
  let total = 0;
  if (mctx) {
    const data = mctx.getImageData(0, 0, w, h).data;
    for (let cy = 0; cy < rows; cy++) {
      for (let cx = 0; cx < cols; cx++) {
        let hits = 0;
        let seen = 0;
        for (let y = cy * CELL; y < Math.min(h, (cy + 1) * CELL); y += 4) {
          for (let x = cx * CELL; x < Math.min(w, (cx + 1) * CELL); x += 4) {
            seen++;
            if (data[(y * w + x) * 4 + 3] > 40) hits++;
          }
        }
        if (seen > 0 && hits / seen > 0.08) {
          cells[cy * cols + cx] = 1;
          total++;
        }
      }
    }
  }
  return { cols, rows, cells, total, painted: 0 };
}

/* ─── One tracing stage (one round) ─── */

function TraceStage({
  item,
  accent,
  aspect,
  colorSeed,
  isLast,
  onNext,
}: {
  item: TraceItem;
  accent: string;
  aspect: "square" | "wide";
  colorSeed: number;
  isLast: boolean;
  onNext: () => void;
}) {
  const W = aspect === "wide" ? 960 : 640;
  const H = aspect === "wide" ? 440 : 640;
  const BRUSH = aspect === "wide" ? 30 : 34;
  const strokeColor = STROKE_COLORS[colorSeed % STROKE_COLORS.length];

  const guideRef = useRef<HTMLCanvasElement | null>(null);
  const drawRef = useRef<HTMLCanvasElement | null>(null);
  const maskRef = useRef<Mask | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const doneRef = useRef(false);
  const [done, setDone] = useState(false);
  const [hasInk, setHasInk] = useState(false);

  /* Paint the visible guide + build the coverage mask, per round. */
  useEffect(() => {
    let cancelled = false;
    const guideCanvas = guideRef.current;
    if (!guideCanvas) return;
    const gtx = guideCanvas.getContext("2d");
    if (!gtx) return;

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = W;
    maskCanvas.height = H;
    const mtx = maskCanvas.getContext("2d");
    if (!mtx) return;

    const render = (img: HTMLImageElement | null) => {
      if (cancelled) return;
      /* Mask first — solid black shape. */
      mtx.save();
      mtx.fillStyle = "#000";
      const size = paintGuideShape(mtx, item.guide, img, W, H);
      mtx.restore();
      maskRef.current = buildMask(maskCanvas, W, H);

      /* Visible guide — faint fill + dashed outline for text; a
         flat silhouette + faint artwork for animal shapes. */
      gtx.clearRect(0, 0, W, H);
      if (item.guide.kind === "text") {
        gtx.font = fontFor(size);
        gtx.textAlign = "center";
        gtx.textBaseline = "middle";
        gtx.fillStyle = `rgba(${GUIDE_INK}, 0.08)`;
        gtx.fillText(item.guide.text, W / 2, H / 2 + size * 0.05);
        gtx.strokeStyle = `rgba(${GUIDE_INK}, 0.5)`;
        gtx.lineWidth = Math.max(3, size * 0.035);
        gtx.setLineDash([size * 0.1, size * 0.075]);
        gtx.strokeText(item.guide.text, W / 2, H / 2 + size * 0.05);
        gtx.setLineDash([]);
      } else if (img) {
        const scale = Math.min((W * 0.9) / img.naturalWidth, (H * 0.9) / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        const dx = (W - dw) / 2;
        const dy = (H - dh) / 2;
        /* Flat light silhouette of the animal's own shape. */
        const flat = document.createElement("canvas");
        flat.width = W;
        flat.height = H;
        const ftx = flat.getContext("2d");
        if (ftx) {
          ftx.drawImage(img, dx, dy, dw, dh);
          ftx.globalCompositeOperation = "source-in";
          ftx.fillStyle = `rgba(${GUIDE_INK}, 0.16)`;
          ftx.fillRect(0, 0, W, H);
          gtx.drawImage(flat, 0, 0);
        }
        gtx.save();
        gtx.globalAlpha = 0.22;
        gtx.drawImage(img, dx, dy, dw, dh);
        gtx.restore();
      }
    };

    if (item.guide.kind === "image") {
      const img = new Image();
      img.onload = () => render(img);
      img.src = item.guide.src;
    } else {
      render(null);
      /* Redraw once webfonts land so the guide wears the app's
         rounded face, not a first-paint fallback. */
      if (typeof document !== "undefined" && document.fonts?.ready) {
        void document.fonts.ready.then(() => render(null));
      }
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.key]);

  const celebrate = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    drawingRef.current = false;
    playCorrect();
    if (isSoundEnabled()) void speakWord(item.doneText);
    setDone(true);
  };

  /** Mark every guide zone the stroke disc touches as painted. */
  const markAt = (x: number, y: number) => {
    const mask = maskRef.current;
    if (!mask || mask.total === 0) return;
    const radius = BRUSH / 2 + CELL * 0.75;
    const minCx = Math.max(0, Math.floor((x - radius) / CELL));
    const maxCx = Math.min(mask.cols - 1, Math.floor((x + radius) / CELL));
    const minCy = Math.max(0, Math.floor((y - radius) / CELL));
    const maxCy = Math.min(mask.rows - 1, Math.floor((y + radius) / CELL));
    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const dx = cx * CELL + CELL / 2 - x;
        const dy = cy * CELL + CELL / 2 - y;
        if (dx * dx + dy * dy > radius * radius) continue;
        const idx = cy * mask.cols + cx;
        if (mask.cells[idx] === 1) {
          mask.cells[idx] = 2;
          mask.painted++;
        }
      }
    }
    if (mask.painted / mask.total >= COVERAGE_GOAL) celebrate();
  };

  const pos = (e: React.PointerEvent) => {
    const canvas = drawRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
    };
  };

  const strokeTo = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = drawRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = BRUSH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    /* Walk the segment so fast swipes still paint every zone. */
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.floor(dist / 6));
    for (let i = 0; i <= steps; i++) {
      markAt(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (doneRef.current) return;
    e.preventDefault();
    drawRef.current?.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const p = pos(e);
    lastRef.current = p;
    setHasInk(true);
    strokeTo(p, p);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawingRef.current || doneRef.current) return;
    const p = pos(e);
    const last = lastRef.current ?? p;
    strokeTo(last, p);
    lastRef.current = p;
  };

  const endStroke = () => {
    drawingRef.current = false;
    lastRef.current = null;
  };

  const clear = () => {
    playPop();
    const canvas = drawRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, W, H);
    const mask = maskRef.current;
    if (mask) {
      for (let i = 0; i < mask.cells.length; i++) {
        if (mask.cells[i] === 2) mask.cells[i] = 1;
      }
      mask.painted = 0;
    }
    setHasInk(false);
  };

  return (
    <>
      {/* The drawing board: guide canvas below, ink canvas above. */}
      <div className="flex flex-1 flex-col items-center justify-center py-3">
        <div
          className="relative w-full overflow-hidden"
          style={{
            maxWidth: aspect === "wide" ? 560 : 430,
            aspectRatio: `${W} / ${H}`,
            borderRadius: 28,
            border: `3px dashed ${accent}59`,
            background: `${accent}0D`,
          }}
        >
          <canvas ref={guideRef} width={W} height={H} className="absolute inset-0 h-full w-full" aria-hidden />
          <canvas
            ref={drawRef}
            width={W}
            height={H}
            className="absolute inset-0 h-full w-full select-none"
            style={{ touchAction: "none", pointerEvents: done ? "none" : "auto" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endStroke}
            onPointerCancel={endStroke}
            aria-label={item.prompt}
          />
          {done ? (
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              {[
                { left: "8%", top: "10%", size: 30, delay: 0 },
                { left: "84%", top: "8%", size: 36, delay: 0.08 },
                { left: "16%", top: "78%", size: 26, delay: 0.16 },
                { left: "78%", top: "80%", size: 30, delay: 0.05 },
                { left: "50%", top: "4%", size: 26, delay: 0.12 },
                { left: "90%", top: "46%", size: 24, delay: 0.2 },
                { left: "4%", top: "44%", size: 24, delay: 0.1 },
                { left: "64%", top: "88%", size: 26, delay: 0.18 },
                { left: "34%", top: "88%", size: 22, delay: 0.03 },
                { left: "28%", top: "6%", size: 22, delay: 0.22 },
              ].map((s, i) => (
                <span
                  key={i}
                  className="kt-pop-in absolute"
                  style={{
                    left: s.left,
                    top: s.top,
                    color: STROKE_COLORS[i % STROKE_COLORS.length],
                    animationDelay: `${s.delay}s`,
                    animationFillMode: "backwards",
                  }}
                >
                  <GlyphStar size={s.size} />
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Bottom zone: Clear while drawing; the win + Next when done. */}
      <div className="flex min-h-[118px] flex-col items-center justify-center gap-2.5">
        {done ? (
          <>
            <p className="kt-pop-in flex items-center gap-2 text-center text-[19px] font-black" style={{ color: GREEN_DEEP }}>
              <span className="grid h-8 w-8 place-items-center rounded-full text-white" style={{ background: GREEN }}>
                <GlyphCheck size={17} />
              </span>
              {item.doneText}
            </p>
            <div className="w-full">
              <NextButton label={isLast ? "Finish" : "Next"} accent={accent} onClick={onNext} />
            </div>
          </>
        ) : (
          <PillButton
            color="#EEF1F6"
            ink="#5A6B8C"
            onClick={clear}
            disabled={!hasInk}
            className="min-h-[56px] px-10 text-[18px]"
          >
            Clear
          </PillButton>
        )}
      </div>
    </>
  );
}

/* ─── The game shell every drawing deck wears ─── */

export function TraceGame({
  gameId,
  title,
  celebrationSubtitle,
  accent,
  aspect,
  pool,
  onBack,
}: {
  gameId: GameId;
  title: string;
  celebrationSubtitle: string;
  accent: string;
  aspect: "square" | "wide";
  pool: TraceItem[];
  onBack: () => void;
}) {
  const [round, setRound] = useState(0);
  const [session, setSession] = useState(0);
  const { xpEarned, finish, resetCompletion } = useGameCompletion(gameId);

  const rounds = useMemo(
    () => sample(pool, TOTAL),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, pool],
  );
  const item = rounds[round];

  useAutoAnnounce(item.prompt, `${session}-${round}`);

  const next = () => {
    if (round + 1 >= TOTAL) {
      finish();
      return;
    }
    setRound((r) => r + 1);
  };

  const replay = () => {
    resetCompletion();
    setSession((s) => s + 1);
    setRound(0);
  };

  if (xpEarned !== null) {
    return (
      <GameCelebration
        title="You did it!"
        subtitle={celebrationSubtitle}
        xpEarned={xpEarned}
        accent={accent}
        onReplay={replay}
      />
    );
  }

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      <GameHeader title={title} onBack={onBack} step={round} total={TOTAL} />
      <GameSheet>
        <PromptRow speakText={item.prompt} accent={accent} large>
          {item.prompt}
        </PromptRow>
        <TraceStage
          key={`${session}-${round}`}
          item={item}
          accent={accent}
          aspect={aspect}
          colorSeed={round}
          isLast={round + 1 >= TOTAL}
          onNext={next}
        />
      </GameSheet>
    </div>
  );
}
