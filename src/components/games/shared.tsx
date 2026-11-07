"use client";

/* ─── Play Zone shared chrome (Kidtopia) ───
   Every game wears the same frame: a blue-zone header (big white
   back disc, white title, gold pips), the stage on the white sheet,
   chunky choice cards, and one pill to move on. Finishing any game
   runs the same beat — fanfare → completeActivity(2 stars) → save →
   celebration — and returns the XP actually earned. */

import { useCallback, useState, type ReactNode } from "react";
import { PillButton, Pips, RoundButton } from "@/components/kit";
import { GlyphChevronL, GlyphSpeaker } from "@/components/glyphs";
import { CelebrationScreen } from "@/components/celebration";
import { playCelebration, playPop, playStarChime, speakWord } from "@/lib/audio";
import { completeActivity, loadProgress, saveProgress } from "@/lib/progress";
import { deepen } from "@/lib/theme";
import type { GameId } from "@/lib/games-data";

/* ─── Blue-zone game header ─── */

export function GameHeader({
  title,
  onBack,
  step,
  total,
}: {
  title: string;
  onBack: () => void;
  step?: number;
  total?: number;
}) {
  return (
    <header className="blue-rings flex items-center gap-3 px-4 pb-3 pt-[max(0.8rem,env(safe-area-inset-top))] min-[402px]:px-5">
      <RoundButton
        label="Back to all games"
        onClick={() => {
          playPop();
          onBack();
        }}
      >
        <GlyphChevronL size={26} />
      </RoundButton>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[21px] font-black text-white">{title}</h1>
        {step !== undefined && total !== undefined ? (
          <div className="mt-1.5">
            <Pips step={step} total={total} />
          </div>
        ) : null}
      </div>
    </header>
  );
}

/* ─── Speakable prompt — ONE shared speaker button for every game ───
   Grey's speak-first rule (2026-11-07): the kids can't read yet, so
   every game's prompt sits in the top area beside this button, and
   tapping it speaks the prompt out loud through the app's read-back
   voice (speakWord — the clear American voice). Each game passes
   its CURRENT prompt string, so after a reshuffle or a new round
   the button always speaks the NEW prompt, never a stale one. The
   prompt words themselves are tappable too — same action. */

export function SpeakerButton({
  text,
  accent,
}: {
  text: string;
  accent: string;
}) {
  return (
    <button
      type="button"
      aria-label={`Hear it: ${text}`}
      onClick={() => {
        playPop();
        void speakWord(text);
      }}
      className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-white transition-transform active:scale-95"
      style={{ background: accent, boxShadow: `0 4px 0 ${deepen(accent)}` }}
    >
      <GlyphSpeaker size={26} />
    </button>
  );
}

/** The top-area prompt row every game renders directly under the
    header: the prompt words + the shared SpeakerButton. */
export function PromptRow({
  speakText,
  accent,
  large = false,
  children,
}: {
  /** The exact on-screen prompt — this string is what gets spoken. */
  speakText: string;
  accent: string;
  large?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-center gap-3 px-1 pt-4">
      <p
        className={`text-center font-black leading-snug text-ink ${
          large ? "text-[22px]" : "text-[20px]"
        }`}
        onClick={() => void speakWord(speakText)}
      >
        {children}
      </p>
      <SpeakerButton text={speakText} accent={accent} />
    </div>
  );
}

/* ─── Sheet wrapper: the white stage every game plays on ─── */

export function GameSheet({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex flex-1 flex-col rounded-t-[32px] bg-white px-4 min-[402px]:px-5"
      style={{ paddingBottom: "max(1.4rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))" }}
    >
      {children}
    </div>
  );
}

/* ─── Big "next" pill shown after a correct move — child-paced ─── */

export function NextButton({
  label,
  accent,
  onClick,
}: {
  label: string;
  accent: string;
  onClick: () => void;
}) {
  return (
    <div className="kt-pop-in">
      <PillButton
        color={accent}
        onClick={() => {
          playPop();
          onClick();
        }}
        className="min-h-[64px] w-full text-[20px]"
      >
        {label}
      </PillButton>
    </div>
  );
}

/* ─── A chunky tappable choice card ─── */

export function ChoiceButton({
  label,
  wiggling,
  onTap,
  children,
}: {
  label: string;
  wiggling?: boolean;
  onTap: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onTap}
      className={`kt-card flex min-h-[104px] min-w-[88px] flex-1 flex-col items-center justify-center gap-1 px-3 py-3 transition-transform active:scale-95 ${
        wiggling ? "kt-wiggle" : ""
      }`}
    >
      {children}
    </button>
  );
}

/* ─── Completion hook — the one finishing beat for every game ─── */

export function useGameCompletion(nodeId: GameId) {
  const [xpEarned, setXpEarned] = useState<number | null>(null);

  const finish = useCallback(() => {
    playCelebration();
    playStarChime();
    const before = loadProgress();
    const next = completeActivity(before, nodeId, 2);
    saveProgress(next);
    setXpEarned(next.xp - before.xp);
  }, [nodeId]);

  const resetCompletion = useCallback(() => setXpEarned(null), []);

  return { xpEarned, finish, resetCompletion };
}

/** The shared celebration, wired the same way for every game. */
export function GameCelebration({
  title,
  subtitle,
  xpEarned,
  onReplay,
  accent,
}: {
  title: string;
  subtitle?: string;
  xpEarned: number;
  onReplay: () => void;
  accent?: string;
}) {
  return (
    <CelebrationScreen
      title={title}
      subtitle={subtitle}
      stars={2}
      xpEarned={xpEarned}
      accent={accent}
      keepGoingLabel="Play again"
      onKeepGoing={onReplay}
      homeHref="/play"
      exitLabel="All games"
    />
  );
}
