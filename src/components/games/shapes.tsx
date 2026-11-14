import { deepen, tint } from "@/lib/theme";
import type { ShapeId } from "@/lib/games-data";

/* ─── Chunky game shapes ───
   One 100×100 viewBox vocabulary shared by every Play Zone game.
   mode="solid" → a filled shape with a deep edge line
   mode="ghost" → the pale dashed "hole" a shape belongs in
   mode="real"  → a wooden toy block: the colour stained into
                  real beech grain (photo texture), a soft top
                  light, and a drop shadow. Opt-in — only games
                  that ask for it (Stacking Blocks) change.
   Pure rendering (no hooks), safe in any component. */

type ShapeProps = {
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  strokeLinejoin: "round";
  strokeLinecap: "round";
};

export function ShapeSvg({
  shape,
  color,
  size = 88,
  mode = "solid",
}: {
  shape: ShapeId;
  color: string;
  size?: number;
  mode?: "solid" | "ghost" | "real";
}) {
  const ghost = mode === "ghost";
  const real = mode === "real";
  const solid = mode === "solid";
  /* Solid shapes are LIT, not flat (Grey's game-feel order,
     2026-11-14): a top-light gradient — tint at the top, the
     true colour mid-way, a deepened foot — plus a gloss
     highlight clipped to the shape. Same id per colour is
     fine: every instance paints identical stops. */
  const gradId = `kt-shape-grad-${color.replace("#", "")}`;
  const clipId = `kt-shape-clip-${color.replace("#", "")}-${shape}`;
  const common: ShapeProps = {
    fill: ghost ? tint(color, 0.84) : solid ? `url(#${gradId})` : color,
    stroke: ghost ? color : deepen(color),
    strokeWidth: ghost ? 4 : 3,
    strokeDasharray: ghost ? "8 6" : undefined,
    strokeLinejoin: "round",
    strokeLinecap: "round",
  };
  const solidDefs = solid ? (
    <defs>
      <linearGradient id={gradId} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0%" stopColor={tint(color, 0.38)} />
        <stop offset="55%" stopColor={color} />
        <stop offset="100%" stopColor={deepen(color)} />
      </linearGradient>
      <clipPath id={clipId}>
        {shape === "circle" && <circle cx="50" cy="50" r="37" />}
        {shape === "square" && <rect x="14" y="14" width="72" height="72" rx="16" />}
        {shape === "triangle" && <polygon points="50,11 91,87 9,87" />}
        {shape === "star" && <polygon points="50,7 61.5,37.5 93.5,38 67.8,57.2 77.2,89.5 50,69.8 22.8,89.5 32.2,57.2 6.5,38 38.5,37.5" />}
        {shape === "heart" && <path d="M50 86 C22 65 11 47 11 31 C11 17 21 8 33.5 8 C41.5 8 47.5 12.5 50 20 C52.5 12.5 58.5 8 66.5 8 C79 8 89 17 89 31 C89 47 78 65 50 86 Z" />}
        {shape === "diamond" && <polygon points="50,6 90,50 50,94 10,50" />}
        {shape === "oval" && <ellipse cx="50" cy="50" rx="31" ry="41" />}
        {shape === "rectangle" && <rect x="8" y="26" width="84" height="48" rx="14" />}
        {shape === "crescent" && <path d="M50 6 A44 44 0 1 0 50 94 A35 35 0 1 1 50 6 Z" />}
        {shape === "pentagon" && <polygon points="50,7 93,38 76,90 24,90 7,38" />}
        {shape === "hexagon" && <polygon points="50,8 86,29 86,71 50,92 14,71 14,29" />}
        {shape === "octagon" && <polygon points="35,8 65,8 92,35 92,65 65,92 35,92 8,65 8,35" />}
        {shape === "cross" && <path d="M38 10 H62 V38 H90 V62 H62 V90 H38 V62 H10 V38 H38 Z" />}
        {shape === "arrow" && <polygon points="50,8 88,50 62,50 62,92 38,92 38,50 12,50" />}
        {shape === "sphere" && <circle cx="50" cy="50" r="37" />}
        {shape === "cylinder" && <path d="M22 26 V74 A28 10 0 0 0 78 74 V26 Z" />}
        {shape === "cone" && <polygon points="50,10 76,76 24,76" />}
        {shape === "pyramid" && <polygon points="50,10 92,88 8,88" />}
      </clipPath>
    </defs>
  ) : null;
  const gloss =
    solid && shape !== "spiral" ? (
      <g clipPath={`url(#${clipId})`}>
        <ellipse cx="36" cy="26" rx="26" ry="13" fill="#FFFFFF" opacity="0.30" transform="rotate(-18 36 26)" />
      </g>
    ) : null;

  /* One geometry, several paints: the base colour, then (for
     "real") the same geometry painted with the wood-grain
     texture and again with the top-light gradient. */
  const geom = (p: ShapeProps, overlay: boolean) => (
    <>
      {shape === "circle" && <circle cx="50" cy="50" r="37" {...p} />}
      {shape === "square" && <rect x="14" y="14" width="72" height="72" rx="16" {...p} />}
      {shape === "triangle" && <polygon points="50,11 91,87 9,87" {...p} />}
      {shape === "star" && (
        <polygon points="50,7 61.5,37.5 93.5,38 67.8,57.2 77.2,89.5 50,69.8 22.8,89.5 32.2,57.2 6.5,38 38.5,37.5" {...p} />
      )}
      {shape === "heart" && (
        <path
          d="M50 86 C22 65 11 47 11 31 C11 17 21 8 33.5 8 C41.5 8 47.5 12.5 50 20 C52.5 12.5 58.5 8 66.5 8 C79 8 89 17 89 31 C89 47 78 65 50 86 Z"
          {...p}
        />
      )}
      {shape === "diamond" && <polygon points="50,6 90,50 50,94 10,50" {...p} />}
      {shape === "oval" && <ellipse cx="50" cy="50" rx="31" ry="41" {...p} />}
      {shape === "rectangle" && <rect x="8" y="26" width="84" height="48" rx="14" {...p} />}
      {shape === "crescent" && <path d="M50 6 A44 44 0 1 0 50 94 A35 35 0 1 1 50 6 Z" {...p} />}
      {shape === "pentagon" && <polygon points="50,7 93,38 76,90 24,90 7,38" {...p} />}
      {shape === "hexagon" && <polygon points="50,8 86,29 86,71 50,92 14,71 14,29" {...p} />}
      {shape === "octagon" && <polygon points="35,8 65,8 92,35 92,65 65,92 35,92 8,65 8,35" {...p} />}
      {shape === "cross" && <path d="M38 10 H62 V38 H90 V62 H62 V90 H38 V62 H10 V38 H38 Z" {...p} />}
      {shape === "arrow" && <polygon points="50,8 88,50 62,50 62,92 38,92 38,50 12,50" {...p} />}
      {shape === "sphere" && (
        <>
          <circle cx="50" cy="50" r="37" {...p} />
          {!overlay ? (
            <ellipse cx="36" cy="34" rx="13" ry="8" fill="#FFFFFF" opacity={ghost ? 0 : 0.45} transform="rotate(-24 36 34)" />
          ) : null}
        </>
      )}
      {shape === "cylinder" && (
        <>
          <path d="M22 26 V74 A28 10 0 0 0 78 74 V26" {...p} />
          <ellipse cx="50" cy="26" rx="28" ry="10" {...p} />
        </>
      )}
      {shape === "cone" && (
        <>
          <polygon points="50,10 76,76 24,76" {...p} />
          <ellipse cx="50" cy="76" rx="26" ry="8" {...p} />
        </>
      )}
      {shape === "pyramid" && (
        <>
          <polygon
            points="50,10 92,88 50,88"
            fill={overlay ? p.fill : ghost ? tint(color, 0.84) : deepen(color)}
            stroke={overlay ? p.stroke : ghost ? color : deepen(color)}
            strokeWidth={p.strokeWidth}
            strokeDasharray={p.strokeDasharray}
            strokeLinejoin="round"
          />
          <polygon points="50,10 50,88 8,88" {...p} />
        </>
      )}
      {shape === "spiral" && !overlay && (
        <path
          d="M50 50 m0 -4 a4 4 0 0 1 4 4 a8 8 0 0 1 -8 8 a12 12 0 0 1 -12 -12 a16 16 0 0 1 16 -16 a20 20 0 0 1 20 20 a24 24 0 0 1 -24 24 a28 28 0 0 1 -28 -28 a32 32 0 0 1 32 -32 a36 36 0 0 1 36 36"
          fill="none"
          stroke={color}
          strokeWidth={ghost ? 5 : 6}
          strokeDasharray={ghost ? "8 6" : undefined}
          strokeLinecap="round"
        />
      )}
    </>
  );

  const texProps: ShapeProps = {
    fill: "url(#kt-wood-tex)",
    stroke: "none",
    strokeWidth: 0,
    strokeLinejoin: "round",
    strokeLinecap: "round",
  };
  const shadeProps: ShapeProps = {
    fill: "url(#kt-wood-shade)",
    stroke: "none",
    strokeWidth: 0,
    strokeLinejoin: "round",
    strokeLinecap: "round",
  };
  const realDefs = real ? (
    <defs>
      <pattern id="kt-wood-tex" width="60" height="60" patternUnits="userSpaceOnUse">
        <image href="/images/play/tex-wood.webp" width="60" height="60" preserveAspectRatio="none" />
      </pattern>
      <linearGradient id="kt-wood-shade" x1="0" y1="0" x2="0.25" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
        <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="100%" stopColor="#3A2200" stopOpacity="0.16" />
      </linearGradient>
    </defs>
  ) : null;
  const realStyle = real ? { filter: "drop-shadow(0 3px 3px rgba(62, 36, 8, 0.35))" } : undefined;
  const overlays = real ? (
    <>
      <g opacity="0.42">{geom(texProps, true)}</g>
      <g opacity="0.55">{geom(shadeProps, true)}</g>
    </>
  ) : null;

  /* The plank block is wide and short — its own viewBox, so `size`
     means its width and it never balloons vertically. */
  if (shape === "block") {
    return (
      <svg width={size} height={Math.round(size * 0.42)} viewBox="0 0 200 84" aria-hidden focusable="false" style={realStyle}>
        {realDefs}
        {solidDefs}
        <rect x="6" y="6" width="188" height="72" rx="16" {...common} />
        {real ? (
          <>
            <rect x="6" y="6" width="188" height="72" rx="16" {...texProps} />
            <rect x="6" y="6" width="188" height="72" rx="16" {...shadeProps} />
          </>
        ) : null}
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false" style={realStyle}>
      {realDefs}
      {solidDefs}
      {geom(common, false)}
      {gloss}
      {overlays}
    </svg>
  );
}
