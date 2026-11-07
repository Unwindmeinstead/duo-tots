"use client";

/* ─── Game 4 — Fix It ───
   One broken scene at a time: find the part that belongs and it
   snaps into place. A wrong part wiggles with the gentle ding;
   nothing is ever "wrong" enough to block play. Scenes are
   hand-drawn in the Kidtopia palette; scene geometry (wheel spots,
   the door slot, the mast, the flower spot) matches the part
   drawings exactly.

   Scenes are dealt in random order every playthrough, and each
   scene's two decoy parts are drawn at random from the pool —
   no fixed order, no fixed decoy to memorize. */

import { useMemo, useState } from "react";
import { GlyphCheck } from "@/components/glyphs";
import { playCorrect, playGentle } from "@/lib/audio";
import { FIX_SCENES, PART_DEFS, fixChoices, shuffle, type PartId } from "@/lib/games-data";
import { GREEN, GREEN_DEEP } from "@/lib/theme";
import { ChoiceButton, GameCelebration, GameHeader, GameSheet, NextButton, PromptRow, useGameCompletion, useAutoAnnounce } from "./shared";

const ACCENT = "#2B7FFF";
const TOTAL = FIX_SCENES.length;
const GHOST_STROKE = "#8496B8";
const GROUND = "#34C759";

/* ─── Part drawings (choices + snapped-in parts share these) ─── */

function PartSvg({ part, size = 72 }: { part: PartId; size?: number }) {
  if (part === "wheel") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false">
        <circle cx="50" cy="50" r="38" fill="#3A3A48" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(20,20,30,.25)" strokeWidth="3" />
        <g stroke="#E8E8E8" strokeWidth="6" strokeLinecap="round">
          <line x1="50" y1="24" x2="50" y2="76" />
          <line x1="24" y1="50" x2="76" y2="50" />
          <line x1="32" y1="32" x2="68" y2="68" />
          <line x1="68" y1="32" x2="32" y2="68" />
        </g>
        <circle cx="50" cy="50" r="12" fill="#FFC531" stroke="rgba(20,20,30,.2)" strokeWidth="2.5" />
      </svg>
    );
  }
  if (part === "sail") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false">
        <line x1="50" y1="8" x2="50" y2="92" stroke="#A06A35" strokeWidth="6" strokeLinecap="round" />
        <polygon points="55,14 55,64 86,64" fill="#38BDF8" stroke="rgba(20,20,30,.15)" strokeWidth="2" />
        <polygon points="45,32 45,64 22,64" fill="#7CD4FC" stroke="rgba(20,20,30,.15)" strokeWidth="2" />
      </svg>
    );
  }
  if (part === "door") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false">
        <rect x="24" y="8" width="52" height="84" rx="9" fill="#A06A35" stroke="rgba(20,20,30,.2)" strokeWidth="2.5" />
        <rect x="33" y="17" width="34" height="26" rx="5" fill="#8A5527" />
        <circle cx="66" cy="56" r="5" fill="#FFC531" stroke="rgba(20,20,30,.2)" strokeWidth="2" />
      </svg>
    );
  }
  if (part === "wing") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false">
        <path d="M10 68 C26 40 56 22 90 18 C84 42 66 62 42 72 L16 78 Z" fill="#F24949" stroke="rgba(20,20,30,.15)" strokeWidth="2" />
        <path d="M22 62 C38 44 56 34 74 28" stroke="rgba(255,255,255,.55)" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (part === "clockhand") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false">
        <circle cx="50" cy="50" r="40" fill="#FFF6E0" stroke="#A06A35" strokeWidth="4" />
        <line x1="50" y1="54" x2="70" y2="26" stroke="#3A3A48" strokeWidth="8" strokeLinecap="round" />
        <circle cx="50" cy="50" r="8" fill="#F24949" />
      </svg>
    );
  }
  if (part === "ear") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false">
        <circle cx="50" cy="52" r="32" fill="#A06A35" stroke="rgba(20,20,30,.15)" strokeWidth="2" />
        <circle cx="50" cy="52" r="18" fill="#E8C39E" />
      </svg>
    );
  }
  if (part === "hat") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false">
        <rect x="30" y="16" width="40" height="50" rx="5" fill="#3A3A48" />
        <rect x="30" y="54" width="40" height="11" fill="#F24949" />
        <rect x="14" y="66" width="72" height="10" rx="5" fill="#3A3A48" />
      </svg>
    );
  }
  if (part === "apple") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false">
        <path d="M50 34 C40 22 20 28 20 48 C20 70 36 86 50 86 C64 86 80 70 80 48 C80 28 60 22 50 34 Z" fill="#F24949" stroke="rgba(20,20,30,.12)" strokeWidth="2" />
        <line x1="50" y1="30" x2="57" y2="15" stroke="#A06A35" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="67" cy="19" rx="10" ry="5" fill="#34C759" transform="rotate(-28 67 19)" />
        <circle cx="36" cy="46" r="6" fill="rgba(255,255,255,.45)" />
      </svg>
    );
  }
  if (part === "tail") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false">
        <path d="M50 4 C64 20 36 32 52 48 C66 62 40 74 50 96" stroke="#38BDF8" strokeWidth="5" fill="none" strokeLinecap="round" />
        <g fill="#F0519B">
          <polygon points="52,26 38,19 38,33" />
          <polygon points="52,26 66,19 66,33" />
        </g>
        <g fill="#FFC531">
          <polygon points="50,52 36,45 36,59" />
          <polygon points="50,52 64,45 64,59" />
        </g>
        <g fill="#F0519B">
          <polygon points="50,78 36,71 36,85" />
          <polygon points="50,78 64,71 64,85" />
        </g>
      </svg>
    );
  }
  if (part === "bulb") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false">
        <circle cx="50" cy="42" r="25" fill="#FFC531" stroke="rgba(20,20,30,.12)" strokeWidth="2" />
        <circle cx="41" cy="34" r="6" fill="rgba(255,255,255,.6)" />
        <rect x="39" y="66" width="22" height="15" rx="3" fill="#9AA3B2" />
        <line x1="41" y1="72" x2="59" y2="72" stroke="rgba(20,20,30,.25)" strokeWidth="2.5" />
        <line x1="41" y1="77" x2="59" y2="77" stroke="rgba(20,20,30,.25)" strokeWidth="2.5" />
      </svg>
    );
  }
  if (part === "fin") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false">
        <path d="M20 80 C20 42 42 20 80 14 C68 36 62 56 64 80 Z" fill="#FF7A59" stroke="rgba(20,20,30,.12)" strokeWidth="2" />
        <path d="M32 72 C36 50 48 34 64 26" stroke="rgba(255,255,255,.5)" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (part === "flag") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false">
        <line x1="30" y1="8" x2="30" y2="94" stroke="#3A3A48" strokeWidth="6" strokeLinecap="round" />
        <polygon points="30,10 80,23 30,38" fill="#F24949" stroke="rgba(20,20,30,.12)" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }
  if (part === "cherry") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false">
        <path d="M48 40 C52 22 66 12 82 9" stroke="#34C759" strokeWidth="5" fill="none" strokeLinecap="round" />
        <ellipse cx="76" cy="14" rx="10" ry="5" fill="#34C759" transform="rotate(-24 76 14)" />
        <circle cx="44" cy="62" r="25" fill="#E03131" stroke="rgba(20,20,30,.12)" strokeWidth="2" />
        <circle cx="35" cy="53" r="6" fill="rgba(255,255,255,.55)" />
      </svg>
    );
  }
  if (part === "blade") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false">
        <rect x="40" y="6" width="20" height="88" rx="9" fill="#FFDF8E" stroke="rgba(20,20,30,.18)" strokeWidth="2.5" />
        <rect x="47" y="15" width="6" height="70" rx="3" fill="rgba(20,20,30,.12)" />
      </svg>
    );
  }
  if (part === "ray") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false">
        <polygon points="50,6 74,86 26,86" fill="#FFC531" stroke="#FF9F2E" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden focusable="false">
      <path d="M50 58 C50 74 48 84 44 94" stroke="#34C759" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M48 78 C38 78 32 72 30 64 C40 64 46 70 48 78 Z" fill="#34C759" />
      <g fill="#F0519B">
        <circle cx="50" cy="22" r="12" />
        <circle cx="68" cy="33" r="12" />
        <circle cx="63" cy="52" r="12" />
        <circle cx="37" cy="52" r="12" />
        <circle cx="32" cy="33" r="12" />
      </g>
      <circle cx="50" cy="38" r="10" fill="#FFC531" />
    </svg>
  );
}

/* ─── In-scene wheel / ghost wheel ─── */

function SceneWheel({ cx, cy, r, ghost, pop }: { cx: number; cy: number; r: number; ghost?: boolean; pop?: boolean }) {
  if (ghost) {
    return (
      <g className="kt-pulse-soft" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <circle cx={cx} cy={cy} r={r} fill="rgba(20,20,30,0.05)" stroke={GHOST_STROKE} strokeWidth="3.5" strokeDasharray="7 6" />
        <circle cx={cx} cy={cy} r={r * 0.32} fill="none" stroke={GHOST_STROKE} strokeWidth="3" strokeDasharray="5 5" />
      </g>
    );
  }
  return (
    <g className={pop ? "kt-pop-in" : undefined} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
      <circle cx={cx} cy={cy} r={r} fill="#3A3A48" />
      {/* Same drawing as the wheel choice card: 8 spokes, gold hub */}
      <g stroke="#E8E8E8" strokeWidth={r * 0.16} strokeLinecap="round">
        <line x1={cx} y1={cy - r * 0.68} x2={cx} y2={cy + r * 0.68} />
        <line x1={cx - r * 0.68} y1={cy} x2={cx + r * 0.68} y2={cy} />
        <line x1={cx - r * 0.48} y1={cy - r * 0.48} x2={cx + r * 0.48} y2={cy + r * 0.48} />
        <line x1={cx + r * 0.48} y1={cy - r * 0.48} x2={cx - r * 0.48} y2={cy + r * 0.48} />
      </g>
      <circle cx={cx} cy={cy} r={r * 0.32} fill="#FFC531" stroke="rgba(20,20,30,.2)" strokeWidth="2" />
    </g>
  );
}

/* ─── The twenty scenes. `fixed` snaps the missing part into place. ─── */

function CarScene({ fixed }: { fixed: boolean }) {
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A car with both wheels" : "A car missing a wheel"}>
      <rect x="8" y="183" width="304" height="10" rx="5" fill={GROUND} opacity="0.45" />
      {/* cabin */}
      <path d="M92 104 L124 60 L196 60 L228 104 Z" fill="#FFA26B" />
      <rect x="132" y="68" width="24" height="28" rx="5" fill="#BDE6FB" />
      <rect x="164" y="68" width="24" height="28" rx="5" fill="#BDE6FB" />
      {/* body */}
      <rect x="36" y="100" width="248" height="52" rx="18" fill="#FF7A59" />
      <rect x="36" y="126" width="248" height="10" fill="#E06543" opacity="0.55" />
      <circle cx="262" cy="114" r="7" fill="#FFC531" />
      {/* wheels: rear is always there, front is the missing one */}
      <SceneWheel cx={96} cy={156} r={27} />
      {fixed ? <SceneWheel cx={226} cy={156} r={27} pop /> : <SceneWheel cx={226} cy={156} r={27} ghost />}
    </svg>
  );
}

function BikeScene({ fixed }: { fixed: boolean }) {
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A bicycle with both wheels" : "A bicycle missing a wheel"}>
      <rect x="8" y="182" width="304" height="10" rx="5" fill={GROUND} opacity="0.45" />
      {/* frame */}
      <g stroke="#2B7FFF" strokeWidth="8" strokeLinecap="round" fill="none">
        <line x1="82" y1="150" x2="140" y2="92" />
        <line x1="140" y1="92" x2="196" y2="150" />
        <line x1="196" y1="150" x2="82" y2="150" />
        <line x1="140" y1="92" x2="228" y2="102" />
        <line x1="228" y1="102" x2="196" y2="150" />
        <line x1="228" y1="102" x2="238" y2="150" />
      </g>
      {/* seat + handlebar */}
      <line x1="124" y1="88" x2="156" y2="88" stroke="#3A3A48" strokeWidth="9" strokeLinecap="round" />
      <line x1="222" y1="90" x2="246" y2="96" stroke="#3A3A48" strokeWidth="8" strokeLinecap="round" />
      <circle cx="196" cy="150" r="10" fill="#FFC531" stroke="rgba(20,20,30,.2)" strokeWidth="2" />
      {/* wheels: rear present, front missing */}
      <SceneWheel cx={82} cy={150} r={32} />
      {fixed ? <SceneWheel cx={238} cy={150} r={32} pop /> : <SceneWheel cx={238} cy={150} r={32} ghost />}
    </svg>
  );
}

function HouseScene({ fixed }: { fixed: boolean }) {
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A house with its door" : "A house missing its door"}>
      <rect x="8" y="182" width="304" height="10" rx="5" fill={GROUND} opacity="0.45" />
      <rect x="216" y="26" width="22" height="40" rx="4" fill="#B8B8C4" />
      {/* roof */}
      <polygon points="52,86 160,28 268,86" fill="#FF7A59" strokeLinejoin="round" />
      {/* walls */}
      <rect x="76" y="84" width="168" height="98" rx="6" fill="#FFF6E0" stroke="rgba(20,20,30,.1)" strokeWidth="2" />
      {/* window */}
      <rect x="94" y="104" width="38" height="38" rx="7" fill="#38BDF8" />
      <line x1="113" y1="104" x2="113" y2="142" stroke="#fff" strokeWidth="4" />
      <line x1="94" y1="123" x2="132" y2="123" stroke="#fff" strokeWidth="4" />
      {/* door spot */}
      {fixed ? (
        <g className="kt-pop-in" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <rect x="182" y="106" width="46" height="76" rx="8" fill="#A06A35" stroke="rgba(20,20,30,.2)" strokeWidth="2.5" />
          <rect x="190" y="114" width="30" height="22" rx="4" fill="#8A5527" />
          <circle cx="219" cy="148" r="4.5" fill="#FFC531" />
        </g>
      ) : (
        <g className="kt-pulse-soft" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <rect x="182" y="106" width="46" height="76" rx="8" fill="rgba(20,20,30,0.05)" stroke={GHOST_STROKE} strokeWidth="3.5" strokeDasharray="7 6" />
        </g>
      )}
      {/* step */}
      <rect x="174" y="182" width="62" height="8" rx="4" fill="#B8B8C4" />
    </svg>
  );
}

function BoatScene({ fixed }: { fixed: boolean }) {
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A boat with its sail" : "A boat missing its sail"}>
      {/* water */}
      <path d="M8 186 Q 32 176 56 186 T 104 186 T 152 186 T 200 186 T 248 186 T 296 186 T 320 186" fill="none" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" opacity="0.65" />
      <path d="M20 200 Q 44 192 68 200 T 116 200 T 164 200 T 212 200 T 260 200 T 308 200" fill="none" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" opacity="0.4" />
      {/* mast */}
      <line x1="160" y1="34" x2="160" y2="146" stroke="#A06A35" strokeWidth="7" strokeLinecap="round" />
      {/* sail spot — the big triangle right of the mast */}
      {fixed ? (
        <g className="kt-pop-in" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <polygon points="168,42 168,140 244,140" fill="#38BDF8" stroke="rgba(20,20,30,.15)" strokeWidth="2.5" />
          <polygon points="152,66 152,140 96,140" fill="#7CD4FC" stroke="rgba(20,20,30,.15)" strokeWidth="2.5" />
        </g>
      ) : (
        <g className="kt-pulse-soft" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <polygon points="168,42 168,140 244,140" fill="rgba(20,20,30,0.05)" stroke={GHOST_STROKE} strokeWidth="3.5" strokeDasharray="7 6" strokeLinejoin="round" />
        </g>
      )}
      {/* hull */}
      <path d="M84 146 L236 146 L218 178 L102 178 Z" fill="#FF7A59" stroke="rgba(20,20,30,.15)" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="84" y="146" width="152" height="9" fill="#E06543" opacity="0.55" />
    </svg>
  );
}

function GardenScene({ fixed }: { fixed: boolean }) {
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A garden with two flowers" : "A garden missing a flower"}>
      <rect x="8" y="182" width="304" height="10" rx="5" fill={GROUND} opacity="0.45" />
      {/* sun */}
      <circle cx="276" cy="36" r="18" fill="#FFC531" />
      {/* the flower that is already there */}
      <g>
        <path d="M96 182 C96 156 94 138 92 122" stroke="#34C759" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M94 160 C84 160 78 154 76 146 C86 146 92 152 94 160 Z" fill="#34C759" />
        <g fill="#F0519B">
          <circle cx="92" cy="88" r="11" />
          <circle cx="109" cy="98" r="11" />
          <circle cx="104" cy="116" r="11" />
          <circle cx="80" cy="116" r="11" />
          <circle cx="75" cy="98" r="11" />
        </g>
        <circle cx="92" cy="102" r="9" fill="#FFC531" />
      </g>
      {/* the empty stem — its flower head is the missing part */}
      <path d="M212 182 C212 154 214 134 216 116" stroke="#34C759" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M214 158 C224 158 230 152 232 144 C222 144 216 150 214 158 Z" fill="#34C759" />
      {fixed ? (
        <g className="kt-pop-in" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <g fill="#8B5CF6">
            <circle cx="216" cy="82" r="11" />
            <circle cx="233" cy="92" r="11" />
            <circle cx="228" cy="110" r="11" />
            <circle cx="204" cy="110" r="11" />
            <circle cx="199" cy="92" r="11" />
          </g>
          <circle cx="216" cy="96" r="9" fill="#FFC531" />
        </g>
      ) : (
        <g className="kt-pulse-soft" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <circle cx="216" cy="96" r="24" fill="rgba(20,20,30,0.05)" stroke={GHOST_STROKE} strokeWidth="3.5" strokeDasharray="7 6" />
        </g>
      )}
      {/* grass tufts */}
      <g stroke="#34C759" strokeWidth="4" strokeLinecap="round" opacity="0.7">
        <line x1="140" y1="184" x2="136" y2="168" />
        <line x1="150" y1="184" x2="152" y2="166" />
        <line x1="262" y1="184" x2="258" y2="168" />
        <line x1="272" y1="184" x2="274" y2="166" />
      </g>
    </svg>
  );
}

function TruckScene({ fixed }: { fixed: boolean }) {
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A truck with both wheels" : "A truck missing a wheel"}>
      <rect x="8" y="183" width="304" height="10" rx="5" fill={GROUND} opacity="0.45" />
      {/* cargo box */}
      <rect x="28" y="64" width="128" height="88" rx="10" fill="#38BDF8" />
      <rect x="28" y="96" width="128" height="10" fill="#FFFFFF" opacity="0.35" />
      {/* cab */}
      <path d="M168 96 L206 96 L232 124 L232 152 L168 152 Z" fill="#FFC531" />
      <path d="M178 104 L202 104 L218 122 L178 122 Z" fill="#BDE6FB" />
      {/* wheels: cab wheel present, box wheel missing */}
      <SceneWheel cx={196} cy={156} r={24} />
      {fixed ? <SceneWheel cx={72} cy={156} r={24} pop /> : <SceneWheel cx={72} cy={156} r={24} ghost />}
    </svg>
  );
}

function TrainScene({ fixed }: { fixed: boolean }) {
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A train with both wheels" : "A train missing a wheel"}>
      <rect x="8" y="183" width="304" height="10" rx="5" fill={GROUND} opacity="0.45" />
      {/* smoke */}
      <circle cx="74" cy="42" r="10" fill="#E8E8E8" opacity="0.85" />
      <circle cx="90" cy="28" r="13" fill="#E8E8E8" opacity="0.7" />
      {/* chimney */}
      <rect x="64" y="56" width="22" height="38" rx="4" fill="#3A3A48" />
      {/* boiler */}
      <rect x="52" y="92" width="130" height="52" rx="24" fill="#34C759" />
      {/* cab */}
      <rect x="182" y="64" width="62" height="80" rx="8" fill="#2B7FFF" />
      <rect x="176" y="54" width="74" height="12" rx="6" fill="#F24949" />
      <rect x="194" y="76" width="26" height="26" rx="5" fill="#BDE6FB" />
      {/* wheels: big cab wheel present, small front wheel missing */}
      <SceneWheel cx={202} cy={152} r={26} />
      {fixed ? <SceneWheel cx={94} cy={158} r={20} pop /> : <SceneWheel cx={94} cy={158} r={20} ghost />}
    </svg>
  );
}

function PlaneScene({ fixed }: { fixed: boolean }) {
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "An airplane with its wing" : "An airplane missing a wing"}>
      {/* clouds */}
      <g fill="#EDF2F7">
        <ellipse cx="58" cy="38" rx="30" ry="13" />
        <ellipse cx="82" cy="30" rx="20" ry="11" />
        <ellipse cx="262" cy="52" rx="28" ry="12" />
        <ellipse cx="284" cy="45" rx="18" ry="10" />
      </g>
      {/* tail fin + tail wing (present) */}
      <polygon points="44,92 64,56 90,56 84,92" fill="#F24949" />
      <polygon points="38,116 66,132 38,134" fill="#F24949" />
      {/* fuselage */}
      <rect x="36" y="90" width="216" height="42" rx="21" fill="#F2F4F8" stroke="rgba(20,20,30,.12)" strokeWidth="2" />
      <rect x="214" y="98" width="22" height="16" rx="6" fill="#38BDF8" />
      <g fill="#38BDF8">
        <circle cx="92" cy="108" r="6" />
        <circle cx="122" cy="108" r="6" />
        <circle cx="152" cy="108" r="6" />
        <circle cx="182" cy="108" r="6" />
      </g>
      {/* main wing spot — under the middle of the fuselage */}
      {fixed ? (
        <g className="kt-pop-in" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <polygon points="126,126 168,126 198,168 156,168" fill="#F24949" stroke="rgba(20,20,30,.12)" strokeWidth="2" strokeLinejoin="round" />
        </g>
      ) : (
        <g className="kt-pulse-soft" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <polygon points="126,126 168,126 198,168 156,168" fill="rgba(20,20,30,0.05)" stroke={GHOST_STROKE} strokeWidth="3.5" strokeDasharray="7 6" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
}

function ClockScene({ fixed }: { fixed: boolean }) {
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A clock with both hands" : "A clock missing a hand"}>
      <circle cx="160" cy="102" r="80" fill="#FF7A59" />
      <circle cx="160" cy="102" r="69" fill="#FFF6E0" />
      {/* hour dots */}
      <g fill="#3A3A48">
        <circle cx="160" cy="48" r="5.5" />
        <circle cx="187" cy="55" r="4" />
        <circle cx="207" cy="75" r="4" />
        <circle cx="214" cy="102" r="5.5" />
        <circle cx="207" cy="129" r="4" />
        <circle cx="187" cy="149" r="4" />
        <circle cx="160" cy="156" r="5.5" />
        <circle cx="133" cy="149" r="4" />
        <circle cx="113" cy="129" r="4" />
        <circle cx="106" cy="102" r="5.5" />
        <circle cx="113" cy="75" r="4" />
        <circle cx="133" cy="55" r="4" />
      </g>
      {/* the hand that is there — pointing up */}
      <line x1="160" y1="102" x2="160" y2="60" stroke="#3A3A48" strokeWidth="7" strokeLinecap="round" />
      {/* the missing hand — pointing down-right */}
      {fixed ? (
        <g className="kt-pop-in" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <line x1="160" y1="102" x2="196" y2="126" stroke="#3A3A48" strokeWidth="7" strokeLinecap="round" />
        </g>
      ) : (
        <line x1="160" y1="102" x2="196" y2="126" stroke={GHOST_STROKE} strokeWidth="6" strokeLinecap="round" strokeDasharray="7 6" />
      )}
      <circle cx="160" cy="102" r="7" fill="#F24949" />
    </svg>
  );
}

function TeddyScene({ fixed }: { fixed: boolean }) {
  const ear = (cx: number) => (
    <>
      <circle cx={cx} cy="52" r="20" fill="#A06A35" />
      <circle cx={cx} cy="52" r="10" fill="#E8C39E" />
    </>
  );
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A teddy bear with both ears" : "A teddy bear missing an ear"}>
      <rect x="8" y="196" width="304" height="9" rx="4.5" fill={GROUND} opacity="0.45" />
      {/* body + belly */}
      <ellipse cx="160" cy="164" rx="46" ry="34" fill="#B0793F" />
      <ellipse cx="160" cy="168" rx="26" ry="21" fill="#EFD3AC" />
      {/* arms */}
      <ellipse cx="110" cy="150" rx="12" ry="24" fill="#B0793F" transform="rotate(24 110 150)" />
      <ellipse cx="210" cy="150" rx="12" ry="24" fill="#B0793F" transform="rotate(-24 210 150)" />
      {/* feet */}
      <ellipse cx="122" cy="194" rx="18" ry="9" fill="#B0793F" />
      <ellipse cx="198" cy="194" rx="18" ry="9" fill="#B0793F" />
      {/* ears: left present, right is the missing one */}
      {ear(104)}
      {fixed ? (
        <g className="kt-pop-in" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          {ear(216)}
        </g>
      ) : (
        <g className="kt-pulse-soft" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <circle cx="216" cy="52" r="20" fill="rgba(20,20,30,0.05)" stroke={GHOST_STROKE} strokeWidth="3.5" strokeDasharray="7 6" />
        </g>
      )}
      {/* head */}
      <circle cx="160" cy="86" r="52" fill="#C08552" />
      <circle cx="140" cy="78" r="5.5" fill="#3A3A48" />
      <circle cx="180" cy="78" r="5.5" fill="#3A3A48" />
      <ellipse cx="160" cy="104" rx="20" ry="14" fill="#EFD3AC" />
      <ellipse cx="160" cy="98" rx="8" ry="6" fill="#3A3A48" />
      <path d="M160 104 L160 110 M160 110 Q150 118 142 112 M160 110 Q170 118 178 112" stroke="#3A3A48" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function SnowmanScene({ fixed }: { fixed: boolean }) {
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A snowman with its hat" : "A snowman missing its hat"}>
      <rect x="8" y="183" width="304" height="10" rx="5" fill="#BDE6FB" opacity="0.65" />
      {/* stick arms */}
      <g stroke="#A06A35" strokeWidth="5" strokeLinecap="round">
        <line x1="138" y1="102" x2="104" y2="84" />
        <line x1="182" y1="102" x2="216" y2="84" />
      </g>
      {/* body */}
      <circle cx="160" cy="150" r="36" fill="#FFFFFF" stroke="rgba(20,20,30,.1)" strokeWidth="2" />
      <circle cx="160" cy="94" r="27" fill="#FFFFFF" stroke="rgba(20,20,30,.1)" strokeWidth="2" />
      {/* face + buttons */}
      <circle cx="152" cy="88" r="3.5" fill="#3A3A48" />
      <circle cx="168" cy="88" r="3.5" fill="#3A3A48" />
      <polygon points="160,94 184,100 160,103" fill="#FF9F2E" strokeLinejoin="round" />
      <circle cx="160" cy="140" r="3.5" fill="#3A3A48" />
      <circle cx="160" cy="158" r="3.5" fill="#3A3A48" />
      {/* hat spot — on top of the head */}
      {fixed ? (
        <g className="kt-pop-in" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <rect x="142" y="30" width="36" height="30" rx="4" fill="#3A3A48" />
          <rect x="142" y="50" width="36" height="9" fill="#F24949" />
          <rect x="132" y="58" width="56" height="10" rx="4" fill="#3A3A48" />
        </g>
      ) : (
        <g className="kt-pulse-soft" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <rect x="142" y="30" width="36" height="30" rx="4" fill="rgba(20,20,30,0.05)" stroke={GHOST_STROKE} strokeWidth="3.5" strokeDasharray="7 6" />
          <rect x="132" y="58" width="56" height="10" rx="4" fill="rgba(20,20,30,0.05)" stroke={GHOST_STROKE} strokeWidth="3.5" strokeDasharray="7 6" />
        </g>
      )}
    </svg>
  );
}

function TreeScene({ fixed }: { fixed: boolean }) {
  const apple = (cx: number, cy: number) => (
    <>
      <circle cx={cx} cy={cy} r="9" fill="#F24949" />
      <line x1={cx} y1={cy - 8} x2={cx + 2} y2={cy - 14} stroke="#A06A35" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx={cx + 7} cy={cy - 12} rx="5" ry="2.5" fill="#2FBF71" transform={`rotate(-28 ${cx + 7} ${cy - 12})`} />
    </>
  );
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A tree with three apples" : "A tree missing an apple"}>
      <rect x="8" y="183" width="304" height="10" rx="5" fill={GROUND} opacity="0.45" />
      {/* trunk + branch */}
      <rect x="150" y="118" width="20" height="65" fill="#A06A35" />
      <line x1="158" y1="128" x2="128" y2="102" stroke="#A06A35" strokeWidth="8" strokeLinecap="round" />
      <line x1="162" y1="124" x2="192" y2="100" stroke="#A06A35" strokeWidth="8" strokeLinecap="round" />
      {/* canopy */}
      <g fill="#34C759">
        <circle cx="110" cy="84" r="34" />
        <circle cx="160" cy="62" r="40" />
        <circle cx="210" cy="84" r="34" />
        <circle cx="134" cy="104" r="30" />
        <circle cx="186" cy="104" r="30" />
      </g>
      {/* the apples that are there */}
      {apple(126, 90)}
      {apple(198, 72)}
      {/* the missing apple — low in the middle of the canopy */}
      {fixed ? (
        <g className="kt-pop-in" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          {apple(162, 112)}
        </g>
      ) : (
        <g className="kt-pulse-soft" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <circle cx="162" cy="112" r="12" fill="rgba(20,20,30,0.05)" stroke={GHOST_STROKE} strokeWidth="3.5" strokeDasharray="7 6" />
        </g>
      )}
    </svg>
  );
}

function KiteScene({ fixed }: { fixed: boolean }) {
  const bow = (cx: number, cy: number, fill: string) => (
    <>
      <polygon points={`${cx},${cy} ${cx - 13},${cy - 7} ${cx - 13},${cy + 7}`} fill={fill} />
      <polygon points={`${cx},${cy} ${cx + 13},${cy - 7} ${cx + 13},${cy + 7}`} fill={fill} />
    </>
  );
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A kite with its tail" : "A kite missing its tail"}>
      {/* clouds */}
      <g fill="#EDF2F7">
        <ellipse cx="52" cy="150" rx="28" ry="12" />
        <ellipse cx="272" cy="36" rx="30" ry="13" />
        <ellipse cx="294" cy="29" rx="19" ry="10" />
      </g>
      {/* string */}
      <path d="M160 130 C140 158 112 176 84 198" stroke="#8496B8" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* diamond */}
      <polygon points="160,34 124,82 160,130" fill="#F0519B" strokeLinejoin="round" />
      <polygon points="160,34 196,82 160,130" fill="#FFC531" strokeLinejoin="round" />
      <line x1="124" y1="82" x2="196" y2="82" stroke="rgba(20,20,30,.15)" strokeWidth="2.5" />
      <line x1="160" y1="34" x2="160" y2="130" stroke="rgba(20,20,30,.15)" strokeWidth="2.5" />
      {/* tail spot — hanging from the bottom point */}
      {fixed ? (
        <g className="kt-pop-in" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <path d="M160 132 C178 148 152 160 172 182" stroke="#38BDF8" strokeWidth="4" fill="none" strokeLinecap="round" />
          {bow(169, 152, "#F0519B")}
          {bow(166, 173, "#FFC531")}
        </g>
      ) : (
        <g className="kt-pulse-soft" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <path d="M160 132 C178 148 152 160 172 182" stroke={GHOST_STROKE} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeDasharray="7 6" />
          <circle cx="169" cy="152" r="9" fill="rgba(20,20,30,0.05)" stroke={GHOST_STROKE} strokeWidth="3" strokeDasharray="5 5" />
          <circle cx="166" cy="173" r="9" fill="rgba(20,20,30,0.05)" stroke={GHOST_STROKE} strokeWidth="3" strokeDasharray="5 5" />
        </g>
      )}
    </svg>
  );
}

function LampScene({ fixed }: { fixed: boolean }) {
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A lamp with its bulb" : "A lamp missing its bulb"}>
      {/* table */}
      <rect x="40" y="178" width="240" height="10" rx="5" fill="#A06A35" opacity="0.8" />
      {/* base + stem */}
      <ellipse cx="160" cy="174" rx="32" ry="7" fill="#3A3A48" />
      <rect x="156" y="106" width="8" height="66" fill="#3A3A48" />
      {/* bulb spot — glowing under the shade */}
      {fixed ? (
        <g className="kt-pop-in" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <circle cx="160" cy="104" r="21" fill="#FFC531" opacity="0.35" />
          <circle cx="160" cy="104" r="12" fill="#FFC531" stroke="rgba(20,20,30,.12)" strokeWidth="2" />
        </g>
      ) : (
        <g className="kt-pulse-soft" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <circle cx="160" cy="104" r="13" fill="rgba(20,20,30,0.05)" stroke={GHOST_STROKE} strokeWidth="3.5" strokeDasharray="7 6" />
        </g>
      )}
      {/* shade */}
      <polygon points="122,112 198,112 180,60 140,60" fill="#FF9F2E" stroke="rgba(20,20,30,.12)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function FishScene({ fixed }: { fixed: boolean }) {
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A fish with its fin" : "A fish missing a fin"}>
      {/* bubbles */}
      <g fill="none" stroke="#38BDF8" strokeWidth="3" opacity="0.6">
        <circle cx="262" cy="52" r="7" />
        <circle cx="278" cy="76" r="5" />
        <circle cx="252" cy="82" r="4" />
      </g>
      {/* tail */}
      <polygon points="204,104 246,76 246,132" fill="#F24949" strokeLinejoin="round" />
      {/* body */}
      <ellipse cx="150" cy="104" rx="62" ry="36" fill="#FF9F2E" />
      <ellipse cx="126" cy="104" rx="12" ry="29" fill="#FFC531" opacity="0.85" />
      {/* bottom fin (present) */}
      <polygon points="140,134 162,152 170,132" fill="#F24949" opacity="0.85" />
      {/* eye */}
      <circle cx="112" cy="96" r="5.5" fill="#3A3A48" />
      <circle cx="114" cy="94" r="2" fill="#FFFFFF" />
      {/* top fin spot */}
      {fixed ? (
        <g className="kt-pop-in" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <polygon points="136,74 168,44 178,76" fill="#F24949" stroke="rgba(20,20,30,.12)" strokeWidth="2" strokeLinejoin="round" />
        </g>
      ) : (
        <g className="kt-pulse-soft" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <polygon points="136,74 168,44 178,76" fill="rgba(20,20,30,0.05)" stroke={GHOST_STROKE} strokeWidth="3.5" strokeDasharray="7 6" strokeLinejoin="round" />
        </g>
      )}
      {/* water */}
      <path d="M8 190 Q 32 180 56 190 T 104 190 T 152 190 T 200 190 T 248 190 T 296 190 T 320 190" fill="none" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

function RocketScene({ fixed }: { fixed: boolean }) {
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A rocket with both fins" : "A rocket missing a fin"}>
      <rect x="8" y="183" width="304" height="10" rx="5" fill={GROUND} opacity="0.45" />
      {/* stars */}
      <g fill="#FFC531" opacity="0.85">
        <circle cx="52" cy="40" r="3.5" />
        <circle cx="272" cy="30" r="3" />
        <circle cx="292" cy="86" r="3.5" />
        <circle cx="36" cy="104" r="3" />
        <circle cx="248" cy="150" r="3" />
      </g>
      {/* flame */}
      <polygon points="146,142 174,142 160,168" fill="#FF9F2E" strokeLinejoin="round" />
      <polygon points="152,142 168,142 160,156" fill="#FFC531" strokeLinejoin="round" />
      {/* left fin (present) */}
      <polygon points="134,94 106,142 134,142" fill="#F24949" strokeLinejoin="round" />
      {/* right fin spot */}
      {fixed ? (
        <g className="kt-pop-in" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <polygon points="186,94 214,142 186,142" fill="#F24949" strokeLinejoin="round" />
        </g>
      ) : (
        <g className="kt-pulse-soft" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <polygon points="186,94 214,142 186,142" fill="rgba(20,20,30,0.05)" stroke={GHOST_STROKE} strokeWidth="3.5" strokeDasharray="7 6" strokeLinejoin="round" />
        </g>
      )}
      {/* body */}
      <path d="M160 22 C184 50 188 82 188 118 L132 118 C132 82 136 50 160 22 Z" fill="#F2F4F8" stroke="rgba(20,20,30,.12)" strokeWidth="2" />
      <rect x="132" y="104" width="56" height="10" fill="#F24949" />
      <rect x="132" y="118" width="56" height="24" fill="#E8E8E8" />
      <circle cx="160" cy="76" r="13" fill="#38BDF8" stroke="#8496B8" strokeWidth="3" />
    </svg>
  );
}

function CastleScene({ fixed }: { fixed: boolean }) {
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A castle with its flag" : "A castle missing its flag"}>
      <rect x="8" y="183" width="304" height="10" rx="5" fill={GROUND} opacity="0.45" />
      {/* side towers + roofs */}
      <rect x="64" y="76" width="36" height="106" rx="4" fill="#B8B8C4" />
      <rect x="220" y="76" width="36" height="106" rx="4" fill="#B8B8C4" />
      <polygon points="56,78 82,46 108,78" fill="#8B5CF6" strokeLinejoin="round" />
      <polygon points="212,78 238,46 264,78" fill="#8B5CF6" strokeLinejoin="round" />
      <rect x="76" y="98" width="12" height="18" rx="5" fill="#38BDF8" />
      <rect x="232" y="98" width="12" height="18" rx="5" fill="#38BDF8" />
      {/* wall */}
      <rect x="84" y="110" width="152" height="72" fill="#C9CEDA" />
      <g fill="#C9CEDA">
        <rect x="92" y="100" width="16" height="12" />
        <rect x="124" y="100" width="16" height="12" />
        <rect x="180" y="100" width="16" height="12" />
        <rect x="212" y="100" width="16" height="12" />
      </g>
      {/* centre tower + roof */}
      <rect x="140" y="66" width="40" height="116" fill="#B8B8C4" />
      <polygon points="132,68 160,38 188,68" fill="#8B5CF6" strokeLinejoin="round" />
      {/* gate */}
      <path d="M146 182 L146 152 A14 12 0 0 1 174 152 L174 182 Z" fill="#A06A35" />
      {/* flag pole */}
      <line x1="160" y1="38" x2="160" y2="14" stroke="#3A3A48" strokeWidth="4" strokeLinecap="round" />
      {/* flag spot */}
      {fixed ? (
        <g className="kt-pop-in" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <polygon points="160,14 190,21 160,29" fill="#F24949" strokeLinejoin="round" />
        </g>
      ) : (
        <g className="kt-pulse-soft" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <polygon points="160,14 190,21 160,29" fill="rgba(20,20,30,0.05)" stroke={GHOST_STROKE} strokeWidth="3.5" strokeDasharray="7 6" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
}

function CupcakeScene({ fixed }: { fixed: boolean }) {
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A cupcake with its cherry" : "A cupcake missing its cherry"}>
      {/* plate */}
      <rect x="56" y="182" width="208" height="9" rx="4.5" fill="#B8B8C4" />
      {/* wrapper */}
      <polygon points="116,126 204,126 191,180 129,180" fill="#F0519B" strokeLinejoin="round" />
      <g stroke="rgba(255,255,255,.5)" strokeWidth="4" strokeLinecap="round">
        <line x1="138" y1="130" x2="142" y2="176" />
        <line x1="160" y1="130" x2="160" y2="176" />
        <line x1="182" y1="130" x2="178" y2="176" />
      </g>
      {/* frosting */}
      <g fill="#FFF6E0" stroke="rgba(20,20,30,.07)" strokeWidth="2">
        <circle cx="130" cy="114" r="19" />
        <circle cx="160" cy="102" r="25" />
        <circle cx="190" cy="114" r="19" />
        <circle cx="160" cy="84" r="13" />
      </g>
      {/* cherry spot — right on top */}
      {fixed ? (
        <g className="kt-pop-in" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <path d="M163 62 C166 48 176 40 188 36" stroke="#34C759" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="160" cy="70" r="11" fill="#E03131" />
          <circle cx="156" cy="66" r="3.5" fill="rgba(255,255,255,.55)" />
        </g>
      ) : (
        <g className="kt-pulse-soft" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <circle cx="160" cy="70" r="12" fill="rgba(20,20,30,0.05)" stroke={GHOST_STROKE} strokeWidth="3.5" strokeDasharray="7 6" />
        </g>
      )}
    </svg>
  );
}

function WindmillScene({ fixed }: { fixed: boolean }) {
  const blade = (deg: number, ghostBlade?: boolean) =>
    ghostBlade ? (
      <g transform={`rotate(${deg} 160 62)`} className="kt-pulse-soft" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <rect x="155" y="12" width="10" height="50" rx="5" fill="rgba(20,20,30,0.05)" stroke={GHOST_STROKE} strokeWidth="3.5" strokeDasharray="7 6" />
      </g>
    ) : (
      <g transform={`rotate(${deg} 160 62)`}>
        <rect x="155" y="12" width="10" height="50" rx="5" fill="#FFDF8E" stroke="rgba(20,20,30,.18)" strokeWidth="2" />
      </g>
    );
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A windmill with all its blades" : "A windmill missing a blade"}>
      <rect x="8" y="183" width="304" height="10" rx="5" fill={GROUND} opacity="0.45" />
      {/* tower */}
      <polygon points="130,182 145,68 175,68 190,182" fill="#FFF6E0" stroke="rgba(20,20,30,.1)" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="138,70 160,44 182,70" fill="#FF7A59" strokeLinejoin="round" />
      <rect x="152" y="146" width="16" height="36" rx="7" fill="#A06A35" />
      <circle cx="160" cy="106" r="7" fill="#38BDF8" />
      {/* blades: three present, the down-right one is missing */}
      {blade(45)}
      {blade(135)}
      {blade(225)}
      {fixed ? (
        <g className="kt-pop-in" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          {blade(315)}
        </g>
      ) : (
        blade(315, true)
      )}
      <circle cx="160" cy="62" r="8" fill="#3A3A48" />
    </svg>
  );
}

function SunScene({ fixed }: { fixed: boolean }) {
  return (
    <svg viewBox="0 0 320 210" className="w-full max-w-md" role="img" aria-label={fixed ? "A sun with all its rays" : "A sun missing a ray"}>
      {/* cloud */}
      <g fill="#EDF2F7">
        <ellipse cx="252" cy="156" rx="32" ry="13" />
        <ellipse cx="276" cy="148" rx="21" ry="11" />
      </g>
      {/* rays — seven present */}
      <g fill="#FFC531" stroke="#FF9F2E" strokeWidth="2" strokeLinejoin="round">
        <polygon points="140,48 160,48 150,26" />
        <polygon points="202,90 202,110 224,100" />
        <polygon points="181,143 193,131 201,151" />
        <polygon points="140,152 160,152 150,174" />
        <polygon points="107,131 119,143 99,151" />
        <polygon points="98,90 98,110 76,100" />
        <polygon points="107,69 119,57 99,49" />
      </g>
      {/* the missing ray — top-right */}
      {fixed ? (
        <g className="kt-pop-in" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <polygon points="181,57 193,69 201,49" fill="#FFC531" stroke="#FF9F2E" strokeWidth="2" strokeLinejoin="round" />
        </g>
      ) : (
        <g className="kt-pulse-soft" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <polygon points="181,57 193,69 201,49" fill="rgba(20,20,30,0.05)" stroke={GHOST_STROKE} strokeWidth="3.5" strokeDasharray="7 6" strokeLinejoin="round" />
        </g>
      )}
      {/* sun face */}
      <circle cx="150" cy="100" r="44" fill="#FFC531" stroke="#FF9F2E" strokeWidth="3" />
      <circle cx="136" cy="96" r="4.5" fill="#3A3A48" />
      <circle cx="164" cy="96" r="4.5" fill="#3A3A48" />
      <path d="M136 110 Q150 122 164 110" stroke="#3A3A48" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function FixIt({ onBack }: { onBack: () => void }) {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [fixed, setFixed] = useState(false);
  const [wigglePart, setWigglePart] = useState<PartId | null>(null);
  const [session, setSession] = useState(0);
  const { xpEarned, finish, resetCompletion } = useGameCompletion("game-fix-it");

  /* Scenes dealt in random order per playthrough; each scene's
     choices are its part + two freshly drawn decoys. */
  const scenes = useMemo(
    () => shuffle(FIX_SCENES),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session],
  );
  const scene = scenes[sceneIdx];
  useAutoAnnounce(scene.prompt, `${session}-${sceneIdx}`);
  const choices = useMemo(
    () => fixChoices(scene.correctPart),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sceneIdx, session],
  );

  const pick = (part: PartId) => {
    if (fixed) return;
    if (part === scene.correctPart) {
      playCorrect();
      setFixed(true);
    } else {
      playGentle();
      setWigglePart(part);
      window.setTimeout(() => setWigglePart((w) => (w === part ? null : w)), 450);
    }
  };

  const next = () => {
    if (sceneIdx + 1 >= TOTAL) {
      finish();
      return;
    }
    setSceneIdx((i) => i + 1);
    setFixed(false);
    setWigglePart(null);
  };

  const replay = () => {
    resetCompletion();
    setSession((s) => s + 1);
    setSceneIdx(0);
    setFixed(false);
    setWigglePart(null);
  };

  if (xpEarned !== null) {
    return (
      <GameCelebration
        title="You did it!"
        subtitle="Fix it complete"
        xpEarned={xpEarned}
        accent={ACCENT}
        onReplay={replay}
      />
    );
  }

  return (
    <div className="kt-fade-in flex min-h-dvh flex-col bg-royal">
      <GameHeader title="Fix it" onBack={onBack} step={sceneIdx} total={TOTAL} />
      <GameSheet>
        {/* The scene's own line ("The boat is missing its sail.") is
            the instruction — the speaker button speaks exactly it,
            changing with every dealt scene. */}
        <PromptRow speakText={scene.prompt} accent={ACCENT}>
          {scene.prompt}
        </PromptRow>

        {/* Scene */}
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <div className="kt-card relative flex w-full max-w-md items-center justify-center px-4 py-5">
            {scene.id === "fix-car" && <CarScene fixed={fixed} />}
            {scene.id === "fix-bike" && <BikeScene fixed={fixed} />}
            {scene.id === "fix-house" && <HouseScene fixed={fixed} />}
            {scene.id === "fix-boat" && <BoatScene fixed={fixed} />}
            {scene.id === "fix-garden" && <GardenScene fixed={fixed} />}
            {scene.id === "fix-truck" && <TruckScene fixed={fixed} />}
            {scene.id === "fix-train" && <TrainScene fixed={fixed} />}
            {scene.id === "fix-plane" && <PlaneScene fixed={fixed} />}
            {scene.id === "fix-clock" && <ClockScene fixed={fixed} />}
            {scene.id === "fix-teddy" && <TeddyScene fixed={fixed} />}
            {scene.id === "fix-snowman" && <SnowmanScene fixed={fixed} />}
            {scene.id === "fix-tree" && <TreeScene fixed={fixed} />}
            {scene.id === "fix-kite" && <KiteScene fixed={fixed} />}
            {scene.id === "fix-lamp" && <LampScene fixed={fixed} />}
            {scene.id === "fix-fish" && <FishScene fixed={fixed} />}
            {scene.id === "fix-rocket" && <RocketScene fixed={fixed} />}
            {scene.id === "fix-castle" && <CastleScene fixed={fixed} />}
            {scene.id === "fix-cupcake" && <CupcakeScene fixed={fixed} />}
            {scene.id === "fix-windmill" && <WindmillScene fixed={fixed} />}
            {scene.id === "fix-sun" && <SunScene fixed={fixed} />}
            {fixed && (
              <span
                className="kt-pop-in absolute -right-2 -top-2 grid h-10 w-10 place-items-center rounded-full text-white"
                style={{ background: GREEN }}
              >
                <GlyphCheck size={21} />
              </span>
            )}
          </div>
          <p className="mt-4 h-6 text-[17px] font-black" style={{ color: fixed ? GREEN_DEEP : "transparent" }}>
            {fixed ? "You fixed it!" : " "}
          </p>
        </div>

        {/* Part choices / next — fixed-height slot */}
        <div className="flex min-h-[104px] flex-col justify-center">
          {fixed ? (
            <NextButton label={sceneIdx + 1 >= TOTAL ? "Finish" : "Next"} accent={ACCENT} onClick={next} />
          ) : (
            <div className="flex gap-3">
              {choices.map((part) => (
                <ChoiceButton
                  key={part}
                  label={PART_DEFS[part].label}
                  wiggling={wigglePart === part}
                  onTap={() => pick(part)}
                >
                  <PartSvg part={part} size={72} />
                  <span className="text-[14px] font-bold text-soft">{PART_DEFS[part].label}</span>
                </ChoiceButton>
              ))}
            </div>
          )}
        </div>
      </GameSheet>
    </div>
  );
}
