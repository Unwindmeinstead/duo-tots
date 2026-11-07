/* ─── Kidtopia theme tokens (TS side) ───
   The CSS custom properties in globals.css carry the same values
   for stylesheet consumers; this module is for components that need
   a colour as a value (inline styles, SVG fills, canvas-free math).

   Every saturated accent in the app is a single hue; its "deep"
   partner (pressed state / bottom ledge / shadow side) is DERIVED
   from the hue by `deepen` — one rule, applied everywhere, so a
   colour can never appear without its matching shade. */

export const ROYAL = "#1D5CD6";
export const ROYAL_DEEP = "#1748AC";
export const ROYAL_INK = "#0E2A63";
export const INK = "#182642";
export const SOFT = "#7587AB";
export const MIST = "#E8EEFB";
export const GOLD = "#FFC531";
export const GOLD_DEEP = "#EDA900";
export const GREEN = "#34C759";
export const GREEN_DEEP = "#28A745";
export const CREAM = "#FFF3D6";

/** Deep partner for any #RRGGBB hue: same hue, ~72% brightness.
    Non-hex input is returned unchanged. */
export function deepen(hex: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const scale = (v: number) => Math.round(v * 0.72);
  const r = scale((n >> 16) & 0xff);
  const g = scale((n >> 8) & 0xff);
  const b = scale(n & 0xff);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0").toUpperCase()}`;
}

/** Pale tint of a hue for card washes (hue mixed toward white). */
export function tint(hex: string, amount = 0.88): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const mix = (v: number) => Math.round(v + (255 - v) * amount);
  const r = mix((n >> 16) & 0xff);
  const g = mix((n >> 8) & 0xff);
  const b = mix(n & 0xff);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0").toUpperCase()}`;
}

/** Confetti + sparkle hues — the toy palette the celebrations speak. */
export const PARTY_COLORS = [
  "#2B7FFF",
  "#FFC531",
  "#FF7A59",
  "#34C759",
  "#F0519B",
  "#8B5CF6",
  "#38BDF8",
] as const;
