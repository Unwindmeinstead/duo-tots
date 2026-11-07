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
import { ChoiceButton, GameCelebration, GameHeader, GameSheet, NextButton, PromptRow, useGameCompletion } from "./shared";

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

/* ─── The three scenes. `fixed` snaps the missing part into place. ─── */

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
