import { deepen, tint } from "@/lib/theme";
import type { ShapeId } from "@/lib/games-data";

/* ─── Chunky game shapes ───
   One 100×100 viewBox vocabulary shared by every Play Zone game.
   mode="solid" → a filled shape with a deep edge line
   mode="ghost" → the pale dashed "hole" a shape belongs in
   Pure rendering (no hooks), safe in any component. */

export function ShapeSvg({
  shape,
  color,
  size = 88,
  mode = "solid",
}: {
  shape: ShapeId;
  color: string;
  size?: number;
  mode?: "solid" | "ghost";
}) {
  const ghost = mode === "ghost";
  const common = {
    fill: ghost ? tint(color, 0.84) : color,
    stroke: ghost ? color : deepen(color),
    strokeWidth: ghost ? 4 : 3,
    strokeDasharray: ghost ? "8 6" : undefined,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };

  /* The plank block is wide and short — its own viewBox, so `size`
     means its width and it never balloons vertically. */
  if (shape === "block") {
    return (
      <svg width={size} height={Math.round(size * 0.42)} viewBox="0 0 200 84" aria-hidden focusable="false">
        <rect x="6" y="6" width="188" height="72" rx="16" {...common} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false">
      {shape === "circle" && <circle cx="50" cy="50" r="37" {...common} />}
      {shape === "square" && <rect x="14" y="14" width="72" height="72" rx="16" {...common} />}
      {shape === "triangle" && <polygon points="50,11 91,87 9,87" {...common} />}
      {shape === "star" && (
        <polygon points="50,7 61.5,37.5 93.5,38 67.8,57.2 77.2,89.5 50,69.8 22.8,89.5 32.2,57.2 6.5,38 38.5,37.5" {...common} />
      )}
      {shape === "heart" && (
        <path
          d="M50 86 C22 65 11 47 11 31 C11 17 21 8 33.5 8 C41.5 8 47.5 12.5 50 20 C52.5 12.5 58.5 8 66.5 8 C79 8 89 17 89 31 C89 47 78 65 50 86 Z"
          {...common}
        />
      )}
      {shape === "diamond" && <polygon points="50,6 90,50 50,94 10,50" {...common} />}
      {shape === "oval" && <ellipse cx="50" cy="50" rx="31" ry="41" {...common} />}
      {shape === "rectangle" && <rect x="8" y="26" width="84" height="48" rx="14" {...common} />}
      {shape === "crescent" && (
        <path d="M50 6 A44 44 0 1 0 50 94 A35 35 0 1 1 50 6 Z" {...common} />
      )}
      {shape === "pentagon" && <polygon points="50,7 93,38 76,90 24,90 7,38" {...common} />}
      {shape === "hexagon" && <polygon points="50,8 86,29 86,71 50,92 14,71 14,29" {...common} />}
      {shape === "octagon" && (
        <polygon points="35,8 65,8 92,35 92,65 65,92 35,92 8,65 8,35" {...common} />
      )}
      {shape === "cross" && (
        <path d="M38 10 H62 V38 H90 V62 H62 V90 H38 V62 H10 V38 H38 Z" {...common} />
      )}
      {shape === "arrow" && (
        <polygon points="50,8 88,50 62,50 62,92 38,92 38,50 12,50" {...common} />
      )}
    </svg>
  );
}
