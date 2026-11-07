/* ─── Play Zone data ───
   Pure data + helpers for the /play mini-games. No JSX, no images —
   every visual is drawn with SVG in the game components.
   Node ids are the opaque completeActivity keys (see GAMIFICATION.md
   "Plugging in a new lesson type"): game-shape-sorter,
   game-stacking-blocks, game-finish-pattern, game-fix-it,
   game-color-finder, game-odd-one-out, game-counting-fun,
   game-shadow-match, game-big-small, game-animal-pick.

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
  | "game-shadow-match"
  | "game-big-small"
  | "game-animal-pick";

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
   The colour vocabulary the games draw from (the first 13 mirror
   the Colors lesson; 8 more shades follow so Color Finder can
   deal 20+ distinct target colours — Grey's 20-puzzle bar,
   2026-11-07). SHAPE_COLORS is the saturated subset used to paint
   shapes — white/black/grey shapes would wash out on the white
   sheet, so shape games skip them; Color Finder plays all 21. */

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
  { name: "Lime", hex: "#8FD14F" },
  { name: "Magenta", hex: "#D6339F" },
  { name: "Navy", hex: "#1E4FA3" },
  { name: "Lavender", hex: "#B79CED" },
  { name: "Peach", hex: "#FFB38A" },
  { name: "Mint", hex: "#63D6A4" },
  { name: "Coral", hex: "#FF6F61" },
  { name: "Gold", hex: "#DFA320" },
];

export const SHAPE_COLORS: GameColor[] = GAME_COLORS.slice(0, 10);

/* ─── Shapes (shared drawing vocabulary) ───
   Twenty shapes — the FULL Shapes-lesson pool (the plank "block"
   stands in for Cube). The sorter, patterns, stacking,
   odd-one-out, counting, shadow and big/small games all draw
   from this one pool. */

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
  | "arrow"
  | "sphere"
  | "cylinder"
  | "cone"
  | "pyramid"
  | "spiral";

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
  sphere: { label: "Sphere", color: "#FF7A59" },
  cylinder: { label: "Cylinder", color: "#17BEBB" },
  cone: { label: "Cone", color: "#FF9F2E" },
  pyramid: { label: "Pyramid", color: "#C98A5E" },
  spiral: { label: "Spiral", color: "#8B5CF6" },
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
   Patterns are GENERATED from STRUCTURES, not listed: a structure
   is a letter unit (AB, AAB, ABBC, ABCD…) sung out to `shown`
   tiles + the missing next one, in one of five attribute modes —
   "both" (each letter is its own shape+colour tile), "shape"
   (letters differ by shape only, one colour throughout), "color"
   (letters differ by colour only, one shape throughout), "dual"
   (the SHAPE cycle and the COLOUR cycle run different units at
   the same time), and "grow" (runs grow or shrink: 1-2-3, 3-2-1).
   25 structures — Grey's 20-puzzle bar (2026-11-07); the old game
   had 5 families. Rounds within a game never repeat a structure,
   so no pattern sings twice in one playthrough. */

export type PatternRound = {
  id: string;
  /** Which structure dealt this round (e.g. "abbc", "dual-1"). */
  structure: string;
  /** The tiles shown in the row (4 or 5). */
  shown: PatternTile[];
  answer: PatternTile;
  /** Exactly 3 choices, including the answer, shuffled. */
  choices: PatternTile[];
};

export type PatternStructure = {
  id: string;
  mode: "both" | "shape" | "color" | "dual" | "grow";
  /** Letter unit repeated to build the row (both/shape/color). */
  unit?: string;
  /** Dual mode: the shape cycle and colour cycle run these units. */
  shapeUnit?: string;
  colorUnit?: string;
  /** Grow mode: run length per letter (A×1, B×2, C×3…). */
  runs?: number[];
  shown: number;
};

export const PATTERN_STRUCTURES: PatternStructure[] = [
  /* both — the classic shape+colour songs */
  { id: "abab", mode: "both", unit: "AB", shown: 4 },
  { id: "abab-long", mode: "both", unit: "AB", shown: 5 },
  { id: "aabb", mode: "both", unit: "AABB", shown: 4 },
  { id: "aabb-long", mode: "both", unit: "AABB", shown: 5 },
  { id: "aab", mode: "both", unit: "AAB", shown: 4 },
  { id: "abb", mode: "both", unit: "ABB", shown: 4 },
  { id: "abc", mode: "both", unit: "ABC", shown: 4 },
  { id: "abc-long", mode: "both", unit: "ABC", shown: 5 },
  { id: "abba", mode: "both", unit: "ABBA", shown: 4 },
  { id: "aaab", mode: "both", unit: "AAAB", shown: 4 },
  { id: "abbb", mode: "both", unit: "ABBB", shown: 4 },
  { id: "aabc", mode: "both", unit: "AABC", shown: 4 },
  { id: "abbc", mode: "both", unit: "ABBC", shown: 4 },
  { id: "abcc", mode: "both", unit: "ABCC", shown: 4 },
  { id: "abcd", mode: "both", unit: "ABCD", shown: 4 },
  /* shape — one colour, the shapes carry the song */
  { id: "shape-ab", mode: "shape", unit: "AB", shown: 4 },
  { id: "shape-aab", mode: "shape", unit: "AAB", shown: 4 },
  { id: "shape-abc", mode: "shape", unit: "ABC", shown: 4 },
  /* color — one shape, the colours carry the song */
  { id: "color-ab", mode: "color", unit: "AB", shown: 4 },
  { id: "color-abb", mode: "color", unit: "ABB", shown: 4 },
  { id: "color-abc", mode: "color", unit: "ABC", shown: 4 },
  /* dual — shape cycle and colour cycle sing different units */
  { id: "dual-1", mode: "dual", shapeUnit: "AB", colorUnit: "AAB", shown: 4 },
  { id: "dual-2", mode: "dual", shapeUnit: "ABC", colorUnit: "AB", shown: 4 },
  /* grow — the runs themselves grow or shrink */
  { id: "grow-up", mode: "grow", runs: [1, 2, 3], shown: 5 },
  { id: "grow-down", mode: "grow", runs: [3, 2, 1], shown: 5 },
];

/** Deal `shown + 1` tiles for a structure — the last one is the answer. */
function patternSlots(s: PatternStructure): PatternTile[] {
  const len = s.shown + 1;
  if (s.mode === "grow") {
    const growShapes = sample(SHAPE_IDS, 3);
    const letters = (s.runs ?? [1, 2, 3]).map((_, i) => randomTile(growShapes[i % growShapes.length]));
    const full: PatternTile[] = [];
    (s.runs ?? [1, 2, 3]).forEach((run, i) => {
      for (let k = 0; k < run; k++) full.push(letters[i]);
    });
    return full.slice(0, len);
  }
  if (s.mode === "dual") {
    const shapeUnit = s.shapeUnit ?? "AB";
    const colorUnit = s.colorUnit ?? "AAB";
    const shapeLetters = [...new Set(shapeUnit)];
    const colorLetters = [...new Set(colorUnit)];
    const shapes = sample(SHAPE_IDS, shapeLetters.length);
    const colors = sample(SHAPE_COLORS, colorLetters.length);
    const shapeOf: Record<string, ShapeId> = {};
    shapeLetters.forEach((l, i) => (shapeOf[l] = shapes[i]));
    const colorOf: Record<string, GameColor> = {};
    colorLetters.forEach((l, i) => (colorOf[l] = colors[i]));
    return Array.from({ length: len }, (_, i) => {
      const c = colorOf[colorUnit[i % colorUnit.length]];
      return { shape: shapeOf[shapeUnit[i % shapeUnit.length]], color: c.hex, colorName: c.name };
    });
  }
  const unit = s.unit ?? "AB";
  const letters = [...new Set(unit)];
  const tileOf: Record<string, PatternTile> = {};
  if (s.mode === "shape") {
    const c = pick(SHAPE_COLORS);
    const shapes = sample(SHAPE_IDS, letters.length);
    letters.forEach((l, i) => (tileOf[l] = { shape: shapes[i], color: c.hex, colorName: c.name }));
  } else if (s.mode === "color") {
    const shape = pick(SHAPE_IDS);
    const colors = sample(SHAPE_COLORS, letters.length);
    letters.forEach((l, i) => (tileOf[l] = { shape, color: colors[i].hex, colorName: colors[i].name }));
  } else {
    const shapes = sample(SHAPE_IDS, letters.length);
    letters.forEach((l, i) => (tileOf[l] = randomTile(shapes[i])));
  }
  return Array.from({ length: len }, (_, i) => tileOf[unit[i % unit.length]]);
}

export function makePatternRound(structure?: PatternStructure): PatternRound {
  const s = structure ?? pick(PATTERN_STRUCTURES);
  const slots = patternSlots(s);
  const shown = slots.slice(0, s.shown);
  const answer = slots[s.shown];
  const distractors: PatternTile[] = [];
  while (distractors.length < 2) {
    const t = randomTile();
    if (tileKey(t) !== tileKey(answer) && !distractors.some((d) => tileKey(d) === tileKey(t))) {
      distractors.push(t);
    }
  }
  return {
    id: `pattern-${s.id}-${tileKey(answer)}`,
    structure: s.id,
    shown,
    answer,
    choices: shuffle([answer, ...distractors]),
  };
}

export function makePatternRounds(count = 5): PatternRound[] {
  /* Structures are sampled WITHOUT replacement (cycling through a
     fresh shuffle when count outruns the pool), so a playthrough
     never sings the same structure twice. */
  const rounds: PatternRound[] = [];
  let deck = shuffle(PATTERN_STRUCTURES);
  for (let i = 0; i < count; i++) {
    if (deck.length === 0) deck = shuffle(PATTERN_STRUCTURES);
    rounds.push(makePatternRound(deck.pop()));
  }
  return rounds;
}

/* ─── Fix it (part matching) ───
   Twenty scenes, dealt in random order every playthrough; the
   part choices are the scene's part + two decoys drawn from the
   16-part pool — no scene has a fixed decoy any more. (Was five
   scenes until Grey's 20-puzzle bar, 2026-11-07.) */

export type PartId =
  | "wheel"
  | "door"
  | "flower"
  | "sail"
  | "wing"
  | "clockhand"
  | "ear"
  | "hat"
  | "apple"
  | "tail"
  | "bulb"
  | "fin"
  | "flag"
  | "cherry"
  | "blade"
  | "ray";

export const PART_DEFS: Record<PartId, { label: string; color: string }> = {
  wheel: { label: "Wheel", color: "#4a4a58" },
  door: { label: "Door", color: "#FF7A59" },
  flower: { label: "Flower", color: "#F0519B" },
  sail: { label: "Sail", color: "#38BDF8" },
  wing: { label: "Wing", color: "#F24949" },
  clockhand: { label: "Hand", color: "#3A3A48" },
  ear: { label: "Ear", color: "#A06A35" },
  hat: { label: "Hat", color: "#3A3A48" },
  apple: { label: "Apple", color: "#F24949" },
  tail: { label: "Tail", color: "#38BDF8" },
  bulb: { label: "Bulb", color: "#FFC531" },
  fin: { label: "Fin", color: "#FF7A59" },
  flag: { label: "Flag", color: "#F24949" },
  cherry: { label: "Cherry", color: "#E03131" },
  blade: { label: "Blade", color: "#FFDF8E" },
  ray: { label: "Ray", color: "#FFC531" },
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
  { id: "fix-truck", title: "The Truck", prompt: "The truck is missing a wheel.", correctPart: "wheel" },
  { id: "fix-train", title: "The Train", prompt: "The train is missing a wheel.", correctPart: "wheel" },
  { id: "fix-plane", title: "The Airplane", prompt: "The airplane is missing a wing.", correctPart: "wing" },
  { id: "fix-clock", title: "The Clock", prompt: "The clock is missing a hand.", correctPart: "clockhand" },
  { id: "fix-teddy", title: "The Teddy Bear", prompt: "The teddy bear is missing an ear.", correctPart: "ear" },
  { id: "fix-snowman", title: "The Snowman", prompt: "The snowman is missing its hat.", correctPart: "hat" },
  { id: "fix-tree", title: "The Tree", prompt: "The tree is missing an apple.", correctPart: "apple" },
  { id: "fix-kite", title: "The Kite", prompt: "The kite is missing its tail.", correctPart: "tail" },
  { id: "fix-lamp", title: "The Lamp", prompt: "The lamp is missing its bulb.", correctPart: "bulb" },
  { id: "fix-fish", title: "The Fish", prompt: "The fish is missing a fin.", correctPart: "fin" },
  { id: "fix-rocket", title: "The Rocket", prompt: "The rocket is missing a fin.", correctPart: "fin" },
  { id: "fix-castle", title: "The Castle", prompt: "The castle is missing its flag.", correctPart: "flag" },
  { id: "fix-cupcake", title: "The Cupcake", prompt: "The cupcake is missing its cherry.", correctPart: "cherry" },
  { id: "fix-windmill", title: "The Windmill", prompt: "The windmill is missing a blade.", correctPart: "blade" },
  { id: "fix-sun", title: "The Sun", prompt: "The sun is missing a ray.", correctPart: "ray" },
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

/* ─── Big and Small ───
   Two copies of one shape, one big and one small; the ask flips
   between BIG and SMALL and the big one's seat (left/right) is
   re-dealt every round, so neither the word nor the side can be
   memorized. Target shapes never repeat within a game. */

export type BigSmallRound = {
  tile: ShapeTile;
  /** true → "Tap the BIG one!"; false → "Tap the SMALL one!" */
  askBig: boolean;
  /** true → the big copy sits in the first (left) seat. */
  bigFirst: boolean;
};

export function makeBigSmallRounds(count = 5): BigSmallRound[] {
  return sample(SHAPE_IDS, count).map((shape) => ({
    tile: randomTile(shape),
    askBig: Math.random() < 0.5,
    bigFirst: Math.random() < 0.5,
  }));
}
