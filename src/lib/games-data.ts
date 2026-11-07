/* ─── Play Zone data ───
   Pure data + helpers for the /play mini-games. No JSX, no images —
   every visual is drawn with SVG in the game components.
   Node ids are the opaque completeActivity keys (see GAMIFICATION.md
   "Plugging in a new lesson type"): game-shape-sorter,
   game-stacking-blocks, game-finish-pattern, game-fix-it,
   game-color-finder, game-odd-one-out, game-counting-fun,
   game-shadow-match.

   REGENERATION LAW (Grey's order, 2026-11-07): the Play Zone trains
   IDENTIFICATION, not memorization — so nothing here is a fixed
   layout. Every round of every game is GENERATED at play time:
   items are drawn at random from the full pools, positions are
   shuffled, and the correct answer's spot varies. Generators also
   refuse an immediate repeat of the previous round's key attribute
   (target shape, count, colour…), so two rounds in a row never
   look the same. */

export type GameId =
  | "game-shape-sorter"
  | "game-stacking-blocks"
  | "game-finish-pattern"
  | "game-fix-it"
  | "game-color-finder"
  | "game-odd-one-out"
  | "game-counting-fun"
  | "game-shadow-match";

/** Fisher–Yates shuffle on a copy — never mutates the source array. */
export function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** One random element. */
export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Up to `n` distinct random elements (fewer if the pool runs out). */
export function sample<T>(items: readonly T[], n: number): T[] {
  return shuffle(items).slice(0, Math.max(0, Math.min(n, items.length)));
}

/** Random integer in [min, max], inclusive. */
export function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/* ─── Colours ───
   The colour vocabulary the games draw from (mirrors the Colors
   lesson). SHAPE_COLORS is the saturated subset used to paint
   shapes — white/black/grey shapes would wash out on the white
   sheet, so shape games skip them; Color Finder plays all 13. */

export type GameColor = { name: string; hex: string };

export const GAME_COLORS: GameColor[] = [
  { name: "Red", hex: "#F24949" },
  { name: "Orange", hex: "#FF9F2E" },
  { name: "Yellow", hex: "#FFC531" },
  { name: "Green", hex: "#34C759" },
  { name: "Teal", hex: "#17BEBB" },
  { name: "Sky", hex: "#38BDF8" },
  { name: "Blue", hex: "#2B7FFF" },
  { name: "Purple", hex: "#8B5CF6" },
  { name: "Pink", hex: "#F0519B" },
  { name: "Brown", hex: "#A06A35" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gray", hex: "#9AA3B2" },
  { name: "Black", hex: "#3A3A48" },
];

export const SHAPE_COLORS: GameColor[] = GAME_COLORS.slice(0, 10);

/* ─── Shapes (shared drawing vocabulary) ───
   Fifteen shapes — the sorter, patterns, stacking, odd-one-out,
   counting and shadow games all draw from this one pool. */

export type ShapeId =
  | "circle"
  | "square"
  | "triangle"
  | "star"
  | "heart"
  | "block"
  | "diamond"
  | "oval"
  | "rectangle"
  | "crescent"
  | "pentagon"
  | "hexagon"
  | "octagon"
  | "cross"
  | "arrow";

export const SHAPE_DEFS: Record<ShapeId, { label: string; color: string }> = {
  circle: { label: "Circle", color: "#FF7A59" },
  square: { label: "Square", color: "#2B7FFF" },
  triangle: { label: "Triangle", color: "#34C759" },
  star: { label: "Star", color: "#FFC531" },
  heart: { label: "Heart", color: "#F0519B" },
  block: { label: "Block", color: "#FF9F2E" },
  diamond: { label: "Diamond", color: "#38BDF8" },
  oval: { label: "Oval", color: "#FF6FA5" },
  rectangle: { label: "Rectangle", color: "#17BEBB" },
  crescent: { label: "Crescent", color: "#FFC531" },
  pentagon: { label: "Pentagon", color: "#2FBF71" },
  hexagon: { label: "Hexagon", color: "#FF8FA3" },
  octagon: { label: "Octagon", color: "#5B6BE0" },
  cross: { label: "Cross", color: "#F24949" },
  arrow: { label: "Arrow", color: "#6C8CFF" },
};

export const SHAPE_IDS = Object.keys(SHAPE_DEFS) as ShapeId[];

/** A shape painted a colour — the tile every shape game trades in. */
export type ShapeTile = { shape: ShapeId; color: string; colorName: string };

export type PatternTile = ShapeTile;

/** Stable key for a tile (shape + colour identify it). */
export const tileKey = (t: ShapeTile) => `${t.shape}-${t.color}`;

function randomTile(shape?: ShapeId): ShapeTile {
  const s = shape ?? pick(SHAPE_IDS);
  const c = pick(SHAPE_COLORS);
  return { shape: s, color: c.hex, colorName: c.name };
}

/** A random tile whose shape is not one of `exclude`. */
function randomTileExcluding(exclude: readonly ShapeId[]): ShapeTile {
  const pool = SHAPE_IDS.filter((s) => !exclude.includes(s));
  return randomTile(pick(pool));
}

/* ─── Shape Sorter ───
   Five rounds per game. Each round's target is a fresh shape in a
   fresh colour, with two distractor shapes drawn at random — the
   old fixed round order and fixed distractor pairs are gone. */

export type SorterRound = {
  target: ShapeTile;
  /** Exactly 3 choices (target + 2 distractors), shuffled. */
  choices: ShapeTile[];
};

export function makeSorterRounds(count = 5): SorterRound[] {
  const targets = sample(SHAPE_IDS, count);
  return targets.map((shape) => {
    const target = randomTile(shape);
    const distractors = sample(
      SHAPE_IDS.filter((s) => s !== shape),
      2,
    ).map((s) => randomTile(s));
    return { target, choices: shuffle([target, ...distractors]) };
  });
}

/* ─── Stacking Blocks ───
   A tower is dealt fresh every playthrough: 6 blocks drawn from
   8 shapes × 10 colours (distinct shape AND distinct colour), the
   tray shuffled, widths narrowing as the tower grows. Each block
   is a different colour + shape so a 2-year-old can match it to
   its ghost. */

export type StackBlock = {
  id: string;
  label: string;
  shape: ShapeId;
  color: string;
  /** Rendered width in px — the tower narrows as it grows. */
  width: number;
};

const STACK_SHAPES: ShapeId[] = [
  "block",
  "square",
  "circle",
  "triangle",
  "star",
  "heart",
  "diamond",
  "hexagon",
];

const STACK_WIDTHS = [176, 156, 138, 120, 104, 88];

export function makeTower(count = 6): StackBlock[] {
  const shapes = sample(STACK_SHAPES, count);
  const colors = sample(SHAPE_COLORS, count);
  return shapes.map((shape, i) => ({
    id: `stack-${shape}-${colors[i].name.toLowerCase()}`,
    label: `${colors[i].name} ${SHAPE_DEFS[shape].label.toLowerCase()}`,
    shape,
    color: colors[i].hex,
    width: STACK_WIDTHS[Math.min(i, STACK_WIDTHS.length - 1)],
  }));
}

/* ─── Finish the Pattern ───
   Patterns are GENERATED, not listed: a family (ABAB / AABB / AAB /
   ABB / ABC) is dealt two or three random tiles and sung out to
   4 shown + the missing 5th. Distractors are fresh random tiles.
   No family repeats back-to-back within a game. */

export type PatternRound = {
  id: string;
  /** The 4 tiles shown in the row. */
  shown: PatternTile[];
  answer: PatternTile;
  /** Exactly 3 choices, including the answer, shuffled. */
  choices: PatternTile[];
};

type PatternFamily = "ABAB" | "AABB" | "AAB" | "ABB" | "ABC";

const PATTERN_FAMILIES: PatternFamily[] = ["ABAB", "AABB", "AAB", "ABB", "ABC"];

function patternSequence(family: PatternFamily, a: PatternTile, b: PatternTile, c: PatternTile) {
  switch (family) {
    case "ABAB":
      return { shown: [a, b, a, b], answer: a };
    case "AABB":
      return { shown: [a, a, b, b], answer: a };
    case "AAB":
      return { shown: [a, a, b, a], answer: a };
    case "ABB":
      return { shown: [a, b, b, a], answer: b };
    case "ABC":
      return { shown: [a, b, c, a], answer: b };
  }
}

export function makePatternRound(family?: PatternFamily): PatternRound {
  const fam = family ?? pick(PATTERN_FAMILIES);
  const shapes = sample(SHAPE_IDS, 3);
  const a = randomTile(shapes[0]);
  const b = randomTile(shapes[1]);
  const c = randomTile(shapes[2]);
  const { shown, answer } = patternSequence(fam, a, b, c);
  const distractors: PatternTile[] = [];
  while (distractors.length < 2) {
    const t = randomTile();
    if (tileKey(t) !== tileKey(answer) && !distractors.some((d) => tileKey(d) === tileKey(t))) {
      distractors.push(t);
    }
  }
  return {
    id: `pattern-${fam}-${tileKey(answer)}`,
    shown,
    answer,
    choices: shuffle([answer, ...distractors]),
  };
}

export function makePatternRounds(count = 5): PatternRound[] {
  const rounds: PatternRound[] = [];
  let lastFamily: PatternFamily | null = null;
  for (let i = 0; i < count; i++) {
    let fam = pick(PATTERN_FAMILIES);
    if (fam === lastFamily) fam = pick(PATTERN_FAMILIES.filter((f) => f !== lastFamily));
    lastFamily = fam;
    rounds.push(makePatternRound(fam));
  }
  return rounds;
}

/* ─── Fix it (part matching) ───
   Five scenes, dealt in random order every playthrough; the part
   choices are the scene's part + two decoys drawn from the pool —
   no scene has a fixed decoy any more. */

export type PartId = "wheel" | "door" | "flower" | "sail";

export const PART_DEFS: Record<PartId, { label: string; color: string }> = {
  wheel: { label: "Wheel", color: "#4a4a58" },
  door: { label: "Door", color: "#FF7A59" },
  flower: { label: "Flower", color: "#F0519B" },
  sail: { label: "Sail", color: "#38BDF8" },
};

export const FIX_PARTS = Object.keys(PART_DEFS) as PartId[];

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
  { id: "fix-boat", title: "The Boat", prompt: "The boat is missing its sail.", correctPart: "sail" },
  { id: "fix-garden", title: "The Garden", prompt: "The garden is missing a flower.", correctPart: "flower" },
];

/** The 3 choices for a scene: its part + 2 random decoys, shuffled. */
export function fixChoices(correct: PartId): PartId[] {
  const decoys = sample(
    FIX_PARTS.filter((p) => p !== correct),
    2,
  );
  return shuffle([correct, ...decoys]);
}

/* ─── Color Finder ───
   Five rounds; the target colour is called out (spoken + shown)
   and dealt 3 random decoy colours. Targets never repeat within
   a game. */

export type ColorRound = {
  target: GameColor;
  /** Exactly 4 choices, including the target, shuffled. */
  choices: GameColor[];
};

export function makeColorRounds(count = 5): ColorRound[] {
  return sample(GAME_COLORS, count).map((target) => ({
    target,
    choices: shuffle([
      target,
      ...sample(
        GAME_COLORS.filter((c) => c.name !== target.name),
        3,
      ),
    ]),
  }));
}

/* ─── Odd One Out ───
   A grid of 6 tiles: five alike, one different — by shape, by
   colour, or by both. The odd tile and its seat in the grid are
   re-drawn every round; the odd seat never repeats back-to-back. */

export type OddRound = {
  tiles: ShapeTile[];
  oddIndex: number;
};

export function makeOddRound(prevOddIndex?: number): OddRound {
  const base = randomTile();
  const mode = pick(["shape", "color", "both"] as const);
  let odd: ShapeTile;
  if (mode === "shape") {
    odd = { ...randomTileExcluding([base.shape]), color: base.color, colorName: base.colorName };
  } else if (mode === "color") {
    const c = pick(SHAPE_COLORS.filter((col) => col.hex !== base.color));
    odd = { shape: base.shape, color: c.hex, colorName: c.name };
  } else {
    odd = randomTileExcluding([base.shape]);
    if (odd.color === base.color) odd = { ...odd, color: pick(SHAPE_COLORS.filter((col) => col.hex !== base.color)).hex };
  }
  let oddIndex = randomInt(0, 5);
  if (prevOddIndex !== undefined && oddIndex === prevOddIndex) {
    oddIndex = (oddIndex + randomInt(1, 5)) % 6;
  }
  const tiles = Array.from({ length: 6 }, (_, i) => (i === oddIndex ? odd : base));
  return { tiles, oddIndex };
}

export function makeOddRounds(count = 5): OddRound[] {
  const rounds: OddRound[] = [];
  for (let i = 0; i < count; i++) {
    rounds.push(makeOddRound(rounds[i - 1]?.oddIndex));
  }
  return rounds;
}

/* ─── Counting Fun ───
   A random count (1–10) of a random shape appears; the answer
   tiles are the count + two near neighbours. No count repeats
   back-to-back. Object tilts are dealt with the round so the
   scatter is part of the deal, not a re-render accident. */

export const NUMBER_WORDS = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];

export type CountRound = {
  count: number;
  tile: ShapeTile;
  /** One playful tilt per object, degrees. */
  tilts: number[];
  /** Exactly 3 numeral choices, including the count, shuffled. */
  choices: number[];
};

export function makeCountRounds(count = 5): CountRound[] {
  const rounds: CountRound[] = [];
  let lastCount = -1;
  for (let i = 0; i < count; i++) {
    let n = randomInt(1, 10);
    if (n === lastCount) n = (n % 10) + 1;
    lastCount = n;
    const near = [n - 2, n - 1, n + 1, n + 2, n - 3, n + 3].filter((v) => v >= 1 && v <= 10);
    rounds.push({
      count: n,
      tile: randomTile(),
      tilts: Array.from({ length: n }, () => randomInt(-14, 14)),
      choices: shuffle([n, ...sample(near, 2)]),
    });
  }
  return rounds;
}

/* ─── Shadow Match ───
   A silhouette is dealt from the shape pool; the choices are the
   matching shape in colour + two other shapes. Targets never
   repeat within a game. */

export type ShadowRound = {
  target: ShapeTile;
  /** Exactly 3 choices (target + 2 distractors), shuffled. */
  choices: ShapeTile[];
};

export function makeShadowRounds(count = 5): ShadowRound[] {
  return sample(SHAPE_IDS, count).map((shape) => {
    const target = randomTile(shape);
    const distractors = sample(
      SHAPE_IDS.filter((s) => s !== shape),
      2,
    ).map((s) => randomTile(s));
    return { target, choices: shuffle([target, ...distractors]) };
  });
}
