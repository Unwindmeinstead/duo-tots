"use client";

/* ─── Progress ───
   Pip in the blue zone with the level story; the white sheet holds
   the daily goal, three stat cards, the badge collection, topic
   rows, word panels, and the grown-ups panel (voice mode, the
   sounds switch, cache clear, reset — all functionally intact).
   Every figure derives from the same store fields as before. */

import { useState, type ReactNode } from "react";
import { VOICE_MODE_KEY, playPop, setSoundEnabled, type VoiceMode } from "@/lib/audio";
import {
  ArtTile,
  BlueHeader,
  GoalRing,
  SectionHead,
  StarRow,
  WaveSheet,
} from "@/components/kit";
import { Mascot } from "@/components/mascot";
import {
  GlyphApps,
  GlyphCheck,
  GlyphFlame,
  GlyphPlay,
  GlyphStar,
  GlyphTrophy,
} from "@/components/glyphs";
import { GREEN } from "@/lib/theme";
import {
  initialProgress,
  loadProgress,
  saveProgress,
  getLevelInfo,
  getCategoryStars,
  totalCategoryStars,
  getDailyGoalState,
  BADGE_DEFS,
  computeBadges,
  type ProgressState,
} from "@/lib/progress";
import { categories, categoriesById } from "@/lib/vocab";

const BADGE_GLYPHS = {
  star: GlyphStar,
  fire: GlyphFlame,
  trophy: GlyphTrophy,
  check: GlyphCheck,
  play: GlyphPlay,
  grid: GlyphApps,
} as const;

const BADGE_COLORS: Record<string, string> = {
  star: "#FFC531",
  fire: "#FF9F2E",
  trophy: "#FFA826",
  check: "#34C759",
  play: "#2B7FFF",
  grid: "#8B5CF6",
};

function StatCard({
  glyph,
  color,
  value,
  label,
}: {
  glyph: ReactNode;
  color: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className="kt-card flex flex-col items-center p-4 text-center">
      <span
        className="grid h-11 w-11 place-items-center rounded-full text-white"
        style={{ background: color }}
        aria-hidden
      >
        {glyph}
      </span>
      <p className="mt-2 text-[26px] font-black tabular-nums leading-none text-ink">{value}</p>
      <p className="mt-1.5 text-[12.5px] font-black uppercase tracking-wide text-soft">{label}</p>
    </div>
  );
}

function WordPanel({
  rows,
  chipColor,
  emptyText,
}: {
  rows: Array<{ word: string; chip: string }>;
  chipColor: string;
  emptyText: string;
}) {
  return (
    <div className="kt-card mt-3.5 overflow-hidden">
      {rows.length === 0 ? (
        <p className="px-4 py-3.5 text-[15px] font-bold text-soft">{emptyText}</p>
      ) : (
        rows.map((w, i) => (
          <div
            key={w.word}
            className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t-2 border-mist" : ""}`}
          >
            <span className="text-[16px] font-black text-ink">{w.word}</span>
            <span
              className="rounded-full px-2.5 py-1 text-[13px] font-black tabular-nums text-white"
              style={{ background: chipColor }}
            >
              {w.chip}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

export function ProgressClient() {
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

  /* Every level figure derives from getLevelInfo(progress.xp): the
     hero number is TOTAL xp; the bar and caption are in-level. */
  const info = getLevelInfo(progress.xp);
  const daily = getDailyGoalState(progress);
  const earnedBadges = new Set<string>([...progress.badges, ...computeBadges(progress)]);
  const totalStars = totalCategoryStars(progress);

  const isTopRank = info.nextXp == null || !Number.isFinite(info.nextXp) || info.span <= 0;
  const nextRankName = isTopRank ? null : getLevelInfo(info.nextXp as number).name;
  const levelProgressPct = Math.max(0, Math.min(100, info.progress <= 1 ? info.progress * 100 : info.progress));

  const areaPerformance = categories
    .map((cat) => {
      const stats = progress.categoryStats[cat.id] ?? { attempts: 0, correct: 0, wrong: 0 };
      const stars = getCategoryStars(progress, cat.id);
      return {
        id: cat.id,
        ...stats,
        stars,
        completed: progress.completedCategories.includes(cat.id),
        accuracy: stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0,
      };
    })
    .filter((area) => area.attempts > 0 || area.stars > 0 || area.completed)
    .sort((a, b) => b.stars - a.stars || b.accuracy - a.accuracy);

  const topWords = Object.entries(progress.wordStats)
    .map(([word, s]) => ({ word, ...s, score: s.correct - s.wrong }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const struggles = Object.entries(progress.wordStats)
    .map(([word, s]) => ({ word, ...s }))
    .sort((a, b) => b.wrong - a.wrong || a.correct - b.correct)
    .filter((e) => e.wrong > 0)
    .slice(0, 8);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col bg-royal">
      <BlueHeader streak={progress.streak} xp={progress.xp} />

      {/* ── Level hero in the blue zone ── */}
      <div className="blue-rings px-5 pb-2 pt-1">
        <div className="flex items-center gap-4">
          <div aria-hidden>
            <Mascot pose="read" size={92} ring />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-black uppercase tracking-wider text-white/60">
              {info.name}
            </p>
            <p className="mt-0.5 text-[30px] font-black leading-none text-white">
              Level {info.level}
            </p>
            <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[14px] font-black text-white">
              <span className="text-gold">
                <GlyphStar size={14} />
              </span>
              {progress.xp} XP total
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-3.5 overflow-hidden rounded-full bg-white/25">
            <div
              className="kt-bar h-full rounded-full bg-gold"
              style={{ width: `${levelProgressPct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[13px] font-bold tabular-nums text-white/70">
            {isTopRank ? "Top rank" : `${info.intoLevel} of ${info.span} XP to ${nextRankName}`}
          </p>
        </div>
      </div>

      <WaveSheet className="px-4 pb-[var(--tab-float-space)] pt-5 min-[402px]:px-5">
        <div className="mx-auto flex w-full max-w-md flex-col gap-8">
          {/* ── Daily goal ── */}
          <div className="kt-card flex items-center gap-4 p-4">
            <GoalRing done={daily.done} goal={daily.goal} />
            <div className="min-w-0 flex-1">
              <p className="text-[19px] font-black text-ink">
                {daily.met ? "Daily goal done" : "Daily goal"}
              </p>
              <p className="mt-0.5 text-[14.5px] font-bold text-soft">
                {daily.done} of {daily.goal} words today
              </p>
            </div>
            {daily.met && (
              <span className="rounded-full bg-cream px-3 py-1.5 text-[13px] font-black text-gold-deep">
                Great job!
              </span>
            )}
          </div>

          {/* ── Stat cards: exactly three ── */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard glyph={<GlyphFlame size={22} />} color="#FF9F2E" value={progress.streak} label="Day streak" />
            <StatCard glyph={<GlyphStar size={22} />} color="#FFC531" value={totalStars} label="Stars" />
            <StatCard glyph={<GlyphTrophy size={22} />} color="#2B7FFF" value={progress.seenWords.length} label="Words" />
          </div>

          {/* ── Badges ── */}
          <section aria-label="Badges">
            <SectionHead title="Badges" sub="Your collection" />
            <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {BADGE_DEFS.map((badge) => {
                const earned = earnedBadges.has(badge.id);
                const BadgeGlyph = BADGE_GLYPHS[badge.icon];
                const color = BADGE_COLORS[badge.icon] ?? GREEN;
                return (
                  <div
                    key={badge.id}
                    className="kt-card p-4"
                    style={earned ? undefined : { opacity: 0.55 }}
                  >
                    <span
                      className="grid h-12 w-12 place-items-center rounded-full text-white"
                      style={{ background: earned ? color : "#E8EEFB", color: earned ? "#FFFFFF" : "#7587AB" }}
                      aria-hidden
                    >
                      <BadgeGlyph size={24} />
                    </span>
                    <p className="mt-2.5 min-h-[44px] text-[16px] font-black leading-snug text-ink">
                      {badge.name}
                    </p>
                    <p className="mt-0.5 text-[13px] font-bold leading-snug text-soft">{badge.blurb}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Your topics ── */}
          {areaPerformance.length > 0 && (
            <section aria-label="Your topics">
              <SectionHead title="Your topics" />
              <div className="mt-3.5 flex flex-col gap-3">
                {areaPerformance.map((area) => {
                  const cat = categoriesById[area.id];
                  if (!cat) return null;
                  return (
                    <div key={area.id} className="kt-card flex items-center gap-3 p-3.5">
                      <ArtTile category={cat} size={56} radius={18} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[17px] font-black text-ink">{cat.name}</p>
                        <p className="mt-0.5 text-[13px] font-bold tabular-nums text-soft">
                          {area.attempts > 0 ? `${area.accuracy}% practice accuracy` : "Lesson done"}
                        </p>
                      </div>
                      <StarRow value={area.stars} size={15} />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Word panels ── */}
          <section aria-label="Top words">
            <SectionHead title="Top words" />
            <WordPanel
              rows={topWords.map((w) => ({ word: w.word, chip: `${w.correct}/${w.attempts}` }))}
              chipColor={GREEN}
              emptyText="No words yet"
            />
          </section>

          <section aria-label="Still learning">
            <SectionHead title="Still learning" />
            <WordPanel
              rows={struggles.map((w) => ({ word: w.word, chip: `${w.wrong}x` }))}
              chipColor="#FF9F2E"
              emptyText="Nothing here yet"
            />
          </section>

          {/* ── For grown-ups ── */}
          <section aria-label="For grown-ups">
            <SectionHead title="For grown-ups" />
            <div className="kt-card mt-3.5 p-5">
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
          </section>
        </div>
      </WaveSheet>
    </main>
  );
}
