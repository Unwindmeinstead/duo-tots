"use client";

/* ─── Celebration screen ───
   The reward moment, Kidtopia style: full royal-blue sky, falling
   confetti, Pip in a white-ringed medallion, three big gold stars
   popping in one by one, an XP chip, and one gold way forward.
   Rewards are retrospective — this screen only ever looks back at
   what was just earned. */

import Link from "next/link";
import { Confetti, PillButton } from "@/components/kit";
import { Mascot } from "@/components/mascot";
import { GlyphStar } from "@/components/glyphs";
import { GOLD } from "@/lib/theme";

export function CelebrationScreen({
  title,
  subtitle,
  stars,
  xpEarned,
  keepGoingLabel = "Keep going",
  onKeepGoing,
  onFinish,
  homeHref,
  onHome,
  exitLabel = "Home",
  accent,
}: {
  title: string;
  subtitle?: string;
  stars: number;
  xpEarned: number;
  keepGoingLabel?: string;
  onKeepGoing?: () => void;
  /* Optional session-ending path: a quiet "Wrap up" pill beside the
     primary action (the lesson flow uses it for the goodbye ritual). */
  onFinish?: () => void;
  homeHref?: string;
  /* When the celebration is already ON the home page (the level-up
     overlay), the exit must run an action — acknowledge/dismiss —
     instead of linking to the page it is already on. */
  onHome?: () => void;
  /* Label for the exit link — names its destination: "Home" only for
     `/`; world passes "All lessons", games pass "All games". */
  exitLabel?: string;
  /* Accent for the primary button; omitted = gold. */
  accent?: string;
}) {
  const earned = Math.max(0, Math.min(3, stars));

  return (
    <div className="blue-rings kt-fade-in fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-y-auto bg-royal px-6 py-8 text-center">
      <Confetti />

      <div className="relative z-10 flex w-full flex-col items-center">
        <div className="kt-pop-in" aria-hidden>
          <Mascot pose="celebrate" size={168} ring />
        </div>

        <div
          className="mt-5 flex items-center justify-center gap-2.5"
          role="img"
          aria-label={`${earned} of 3 stars`}
        >
          {[0, 1, 2].map((i) => {
            const isEarned = i < earned;
            return (
              <span
                key={i}
                className={isEarned ? "kt-pop-in" : ""}
                style={{
                  color: isEarned ? GOLD : "rgba(255,255,255,0.28)",
                  animationDelay: `${0.25 + i * 0.18}s`,
                  animationFillMode: "backwards",
                  filter: isEarned ? "drop-shadow(0 6px 14px rgba(0,0,0,0.25))" : undefined,
                }}
              >
                <GlyphStar size={56} />
              </span>
            );
          })}
        </div>

        <h1 className="mt-5 text-[30px] font-black leading-tight tracking-tight text-white">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1.5 max-w-[320px] text-[16px] font-bold text-white/75">
            {subtitle}
          </p>
        ) : null}

        {xpEarned > 0 ? (
          <div className="kt-pop-in mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-ink shadow-[0_10px_22px_rgba(14,42,99,0.18)]" style={{ animationDelay: "0.8s", animationFillMode: "backwards" }}>
            <GlyphStar size={17} />
            <span className="text-[16px] font-black">+{xpEarned} XP</span>
          </div>
        ) : null}

        <div className="mt-9 flex w-full max-w-xs flex-col gap-3">
          {onKeepGoing ? (
            <PillButton color={accent ?? GOLD} ink={accent ? "#FFFFFF" : "#182642"} onClick={onKeepGoing} className="w-full">
              {keepGoingLabel}
            </PillButton>
          ) : null}
          {onFinish ? (
            <PillButton color="#FFFFFF" ink="#182642" onClick={onFinish} className="w-full">
              Wrap up
            </PillButton>
          ) : null}
          {onHome ? (
            <button
              type="button"
              onClick={onHome}
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-white/15 px-6 text-[16px] font-black text-white"
            >
              {exitLabel}
            </button>
          ) : (
            <Link
              href={homeHref ?? "/"}
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-white/15 px-6 text-[16px] font-black text-white"
            >
              {exitLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
