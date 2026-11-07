/* ─── Play Zone data ───
   Pure data + helpers for the /play mini-games. No JSX, no images —
   every visual is drawn with SVG in the game components.
   Node ids are the opaque completeActivity keys (see GAMIFICATION.md
   "Plugging in a new lesson type"): game-shape-sorter,
   game-stacking-blocks, game-finish-pattern, game-fix-it. */

export type GameId =
  | "game-shape-sorter"
  | "game-stacking-blocks"
  | "game-finish-pattern"
  | "game-fix-it";

/** Fisher–Yates shuffle on a copy — never mutates the source array. */
export function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ─── Shapes (Shape Sorter + shared drawing vocabulary) ─── */

export type ShapeId = "circle" | "square" | "triangle" | "star" | "heart" | "block";

export const SHAPE_DEFS: Record<ShapeId, { label: string; color: string }> = {
  circle: { label: "Circle", color: "#FF7A59" },
  square: { label: "Square", color: "#2B7FFF" },
  triangle: { label: "Triangle", color: "#34C759" },
  star: { label: "Star", color: "#FFC531" },
  heart: { label: "Heart", color: "#8B5CF6" },
  block: { label: "Block", color: "#FF9F2E" },
};

/** Shape Sorter rounds, in play order — one shape per round. */
export const SORTER_ROUNDS: ShapeId[] = ["circle", "square", "triangle", "star", "heart"];

const SORTER_DISTRACTORS: Record<string, ShapeId[]> = {
  circle: ["square", "triangle"],
  square: ["circle", "star"],
  triangle: ["heart", "square"],
  star: ["triangle", "circle"],
  heart: ["star", "square"],
};

/** The 3 choices for a sorter round: the answer + 2 friendly distractors. */
export function sorterChoices(answer: ShapeId): ShapeId[] {
  return [answer, ...(SORTER_DISTRACTORS[answer] ?? ["circle", "square"])];
}

/* ─── Stacking Blocks ───
   The tower builds bottom → top in array order. Each block is a
   different colour + shape so a 2-year-old can match it to its ghost. */

export type StackBlock = {
  id: string;
  label: string;
  shape: ShapeId;
  color: string;
  /** Rendered width in px — the tower narrows as it grows. */
  width: number;
};

export const STACK_BLOCKS: StackBlock[] = [
  { id: "stack-block", label: "Purple block", shape: "block", color: "#8B5CF6", width: 176 },
  { id: "stack-square", label: "Blue square", shape: "square", color: "#2B7FFF", width: 100 },
  { id: "stack-circle", label: "Coral circle", shape: "circle", color: "#FF7A59", width: 90 },
  { id: "stack-triangle", label: "Green triangle", shape: "triangle", color: "#34C759", width: 100 },
  { id: "stack-star", label: "Yellow star", shape: "star", color: "#FFC531", width: 82 },
];

/* ─── Finish the Pattern ───
   Each pattern shows 4 tiles; the 5th (the answer) is the missing one.
   Patterns are ABAB / AAB / AABB — simple enough to hear as a rhythm. */

export type PatternTile = { shape: ShapeId; color: string };

export type PatternDef = {
  id: string;
  /** The 4 tiles shown in the row. */
  shown: PatternTile[];
  answer: PatternTile;
  /** Exactly 3 choices, including the answer. */
  choices: PatternTile[];
};

const T = (shape: ShapeId, color: string): PatternTile => ({ shape, color });

export const PATTERNS: PatternDef[] = [
  {
    id: "pattern-abab-shapes",
    shown: [T("circle", "#FF7A59"), T("square", "#2B7FFF"), T("circle", "#FF7A59"), T("square", "#2B7FFF")],
    answer: T("circle", "#FF7A59"),
    choices: [T("circle", "#FF7A59"), T("square", "#2B7FFF"), T("star", "#FFC531")],
  },
  {
    id: "pattern-aab-hearts",
    shown: [T("heart", "#F0519B"), T("heart", "#F0519B"), T("star", "#FFC531"), T("heart", "#F0519B")],
    answer: T("heart", "#F0519B"),
    choices: [T("star", "#FFC531"), T("heart", "#F0519B"), T("triangle", "#34C759")],
  },
  {
    id: "pattern-aabb-colors",
    shown: [T("square", "#34C759"), T("square", "#34C759"), T("square", "#8B5CF6"), T("square", "#8B5CF6")],
    answer: T("square", "#34C759"),
    choices: [T("square", "#8B5CF6"), T("square", "#FF7A59"), T("square", "#34C759")],
  },
  {
    id: "pattern-abab-triangles",
    shown: [T("triangle", "#34C759"), T("circle", "#FFC531"), T("triangle", "#34C759"), T("circle", "#FFC531")],
    answer: T("triangle", "#34C759"),
    choices: [T("circle", "#FFC531"), T("triangle", "#34C759"), T("heart", "#F0519B")],
  },
];

/** Stable key for a pattern tile (shape + colour identify it). */
export const tileKey = (t: PatternTile) => `${t.shape}-${t.color}`;

/* ─── Fix it (part matching) ─── */

export type PartId = "wheel" | "door" | "flower";

export const PART_DEFS: Record<PartId, { label: string; color: string }> = {
  wheel: { label: "Wheel", color: "#4a4a58" },
  door: { label: "Door", color: "#FF7A59" },
  flower: { label: "Flower", color: "#F0519B" },
};

export type FixScene = {
  id: string;
  title: string;
  prompt: string;
  correctPart: PartId;
};

export const FIX_SCENES: FixScene[] = [
  { id: "fix-car", title: "The Car", prompt: "The car is missing a wheel.", correctPart: "wheel" },
  { id: "fix-bike", title: "The Bicycle", prompt: "The bicycle is missing a wheel.", correctPart: "wheel" },
  { id: "fix-house", title: "The House", prompt: "The house is missing its door.", correctPart: "door" },
];

export const FIX_CHOICES: PartId[] = ["wheel", "door", "flower"];
