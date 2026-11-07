"use client";

/* ─── Settings ───
   The grown-ups controls that used to hide at the bottom of the
   Progress page, on their own page now (Grey, Nov 7): voice mode,
   the sounds switch, cache clear and reset — same storage keys,
   same handlers, moved not copied. Progress keeps progress only. */

import { useState } from "react";
import { VOICE_MODE_KEY, playPop, setSoundEnabled, type VoiceMode } from "@/lib/audio";
import { BlueHeader, WaveSheet } from "@/components/kit";
import { GREEN } from "@/lib/theme";
import {
  initialProgress,
  loadProgress,
  saveProgress,
  type ProgressState,
} from "@/lib/progress";

export function SettingsClient() {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [voiceMode, setVoiceMode] = useState<VoiceMode>(() => {
    if (typeof window === "undefined") return "auto";
    return (window.localStorage.getItem(VOICE_MODE_KEY) as VoiceMode | null) ?? "auto";
  });

  const reset = () => {
    if (typeof window !== "undefined" && !window.confirm("Reset all progress? This clears XP, stars, badges, streaks, and practice history for every topic. This cannot be undone.")) return;
    saveProgress(initialProgress);
    setProgress(initialProgress);
  };
  const setMode = (mode: VoiceMode) => {
    if (typeof window !== "undefined") window.localStorage.setItem(VOICE_MODE_KEY, mode);
    setVoiceMode(mode);
  };
  const clearMediaCache = () => {
    if (typeof window === "undefined") return;
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith("duotots-img") || k.startsWith("duotots-audio:"))
      .forEach((k) => window.localStorage.removeItem(k));
  };

  /* Sounds (earcons) — parent mute. Older saves without the field
     read as enabled (`!== false`). Persist first via setSoundEnabled
     so a gated playPop can sound when turning ON; turning OFF must
     be silent (no playPop call). */
  const soundOn = progress.soundEnabled !== false;
  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setProgress((prev) => ({ ...prev, soundEnabled: next }));
    if (next) playPop();
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col bg-royal">
      <BlueHeader streak={progress.streak} xp={progress.xp} />

      {/* ── Title hero in the blue zone ── */}
      <div className="blue-rings px-5 pb-1 pt-1">
        <h1 className="text-[32px] font-black leading-tight tracking-tight text-white">
          Settings
        </h1>
        <p className="mt-1 text-[15px] font-bold text-white/70">
          For grown-ups — voice, sounds, and data
        </p>
      </div>

      <WaveSheet className="px-4 pb-[var(--tab-float-space)] pt-5 min-[402px]:px-5">
        <div className="mx-auto flex w-full max-w-md flex-col gap-8">
          <div className="kt-card p-5">
            <div>
              <p className="text-[17px] font-black text-ink">Voice mode</p>
              <p className="mt-1 text-[14px] font-bold text-soft">
                How words sound in lessons and practice.
              </p>
              <div className="mt-3 flex gap-2">
                {(["auto", "gentle", "clear"] as VoiceMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      playPop();
                      setMode(mode);
                    }}
                    aria-pressed={voiceMode === mode}
                    className={`h-12 flex-1 rounded-full text-[15px] font-black capitalize ${
                      voiceMode === mode ? "bg-royal text-white" : "bg-mist text-ink"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-4 border-t-2 border-mist pt-5">
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-black text-ink">Sounds</p>
                <p className="mt-1 text-[14px] font-bold text-soft">
                  Dings, pops, and celebration sounds
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={soundOn}
                aria-label={`Sounds ${soundOn ? "on" : "off"}`}
                onClick={toggleSound}
                className="relative h-[52px] w-[88px] shrink-0 rounded-full transition-colors"
                style={{ background: soundOn ? GREEN : "#C9D6F2" }}
              >
                <span
                  className="absolute top-[4px] h-[44px] w-[44px] rounded-full bg-white transition-all"
                  style={{ left: soundOn ? "calc(100% - 48px)" : 4, boxShadow: "0 2px 6px rgba(0,0,0,.18)" }}
                  aria-hidden
                />
              </button>
            </div>

            <div className="mt-5 flex gap-2 border-t-2 border-mist pt-5">
              <button
                type="button"
                onClick={() => {
                  playPop();
                  clearMediaCache();
                }}
                className="h-12 flex-1 rounded-full bg-mist text-[15px] font-black text-ink"
              >
                Clear cache
              </button>
              <button
                type="button"
                onClick={() => {
                  playPop();
                  reset();
                }}
                className="btn-led h-12 flex-1 rounded-full text-[15px] font-black text-white"
                style={{ "--btn": "#182642", "--btn-deep": "#0E2A63" } as React.CSSProperties}
              >
                Reset all progress
              </button>
            </div>
          </div>
        </div>
      </WaveSheet>
    </main>
  );
}
