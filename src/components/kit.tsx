"use client";

/* ─── Kidtopia kit ───
   The shared building blocks of the redesign: the blue-zone header,
   the wavy white sheet, ledge pill buttons, star rows, sparkles,
   confetti and the reference's big topic card. Every surface builds
   from these so the whole app speaks one toy language. */

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import type { VocabCategory } from "@/lib/vocab";
import { getLocalImage } from "@/lib/local-images";
import { deepen, GOLD, GOLD_DEEP, INK, PARTY_COLORS } from "@/lib/theme";
import {
  CATEGORY_GLYPHS,
  GlyphCheck,
  GlyphChevronL,
  GlyphFlame,
  GlyphStar,
} from "./glyphs";
import { Mascot } from "./mascot";

/* ─── Mascot medallion (header avatar) ─── */

export function AvatarPill() {
  return (
    <Link
      href="/"
      aria-label="DuoTots home"
      className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-4 shadow-[0_8px_20px_rgba(14,42,99,0.18)]"
    >
      <span className="block h-10 w-10 overflow-hidden rounded-full bg-royal">
        <Mascot pose="hero" fill />
      </span>
      <span className="text-[17px] font-black tracking-tight text-ink">
        DuoTots
      </span>
    </Link>
  );
}

/* ─── Count pills (streak / stars) — display only, never currency ─── */

export function CountPill({
  tone,
  children,
  label,
}: {
  tone: "streak" | "stars";
  children: ReactNode;
  label: string;
}) {
  return (
    <span
      aria-label={label}
      className={`flex h-11 items-center gap-1.5 rounded-full px-3.5 text-[17px] font-black ${
        tone === "stars"
          ? "bg-white text-ink shadow-[0_8px_20px_rgba(14,42,99,0.18)]"
          : "bg-white/15 text-white"
      }`}
    >
      {tone === "stars" ? (
        <span className="grid h-6 w-6 place-items-center rounded-full bg-gold text-white">
          <GlyphStar size={15} />
        </span>
      ) : (
        <span className="text-gold">
          <GlyphFlame size={19} />
        </span>
      )}
      {children}
    </span>
  );
}

/* ─── Blue-zone header: avatar left, streak + stars right ─── */

export function BlueHeader({
  streak,
  xp,
}: {
  streak: number;
  xp: number;
}) {
  return (
    <header className="blue-rings flex items-center justify-between gap-2 px-4 pb-2 pt-[max(0.9rem,env(safe-area-inset-top))]">
      <AvatarPill />
      <div className="flex items-center gap-2">
        <CountPill tone="streak" label={`${streak} day streak`}>
          {streak}
        </CountPill>
        <CountPill tone="stars" label={`${xp} stars earned`}>
          {xp}
        </CountPill>
      </div>
    </header>
  );
}

/* ─── The white sheet (flat top edge, flush under the header) ─── */

export function WaveSheet({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className={`flex-1 bg-white ${className}`}>{children}</div>
    </div>
  );
}

/* ─── Ledge pill button ─── */

export function PillButton({
  color = "#1D5CD6",
  ink,
  href,
  onClick,
  disabled,
  children,
  className = "",
  small = false,
  label,
}: {
  color?: string;
  ink?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  small?: boolean;
  /** Accessible name for icon-only pills (no visible text). */
  label?: string;
}) {
  const style = {
    "--btn": color,
    "--btn-deep": color === GOLD ? GOLD_DEEP : deepen(color),
    "--btn-ink": ink ?? (color === GOLD ? INK : "#FFFFFF"),
  } as CSSProperties;
  const cls = `btn-led inline-flex items-center justify-center gap-2 rounded-full font-black ${
    small ? "min-h-12 px-5 text-[16px]" : "min-h-[60px] px-8 text-[19px]"
  } ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls} style={style} aria-label={label}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cls}
      style={style}
      aria-label={label}
    >
      {children}
    </button>
  );
}

/* ─── Round icon button (back / close) ─── */

export function RoundButton({
  href,
  onClick,
  label,
  children,
  className = "",
}: {
  href?: string;
  onClick?: () => void;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const cls = `grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-royal shadow-[0_8px_20px_rgba(14,42,99,0.18)] ${className}`;
  if (href) {
    return (
      <Link href={href} aria-label={label} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cls}>
      {children}
    </button>
  );
}

export function BackButton({ href }: { href: string }) {
  return (
    <RoundButton href={href} label="Back">
      <GlyphChevronL size={26} />
    </RoundButton>
  );
}

/* ─── Star row (0–3 earned stars) ─── */

export function StarRow({
  value,
  size = 17,
}: {
  value: number;
  size?: number;
}) {
  return (
    <span className="flex items-center gap-1" aria-label={`${value} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < value ? "text-gold" : "text-mist"}>
          <GlyphStar size={size} />
        </span>
      ))}
    </span>
  );
}

/* ─── Pips (step dots for lessons / games) ─── */

export function Pips({
  step,
  total,
  color = "#FFFFFF",
}: {
  step: number;
  total: number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2" aria-label={`Step ${step + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="h-3 rounded-full transition-all duration-300"
          style={{
            width: i === step ? 26 : 12,
            background: color,
            opacity: i <= step ? 1 : 0.35,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Sparkle burst — ten deterministic particles, re-keyed per burst ─── */

export function Sparkles({ burstKey }: { burstKey: number }) {
  if (!burstKey) return null;
  return (
    <span key={burstKey} className="pointer-events-none absolute inset-0 z-20">
      {Array.from({ length: 10 }, (_, i) => {
        const angle = (i * 137.5 * Math.PI) / 180;
        const radius = 48 + ((i * 37) % 40);
        const dx = Math.cos(angle) * radius;
        const dy = Math.sin(angle) * radius;
        return (
          <span
            key={i}
            className="kt-sparkle"
            style={
              {
                "--dx": `${dx.toFixed(0)}px`,
                "--dy": `${dy.toFixed(0)}px`,
                background: PARTY_COLORS[i % PARTY_COLORS.length],
                clipPath:
                  i % 3 === 0
                    ? "polygon(50% 0%, 63% 37%, 100% 50%, 63% 63%, 50% 100%, 37% 63%, 0% 50%, 37% 37%)"
                    : undefined,
                animationDelay: `${i * 14}ms`,
              } as CSSProperties
            }
          />
        );
      })}
    </span>
  );
}

/* ─── Confetti — deterministic falling pieces for celebrations ─── */

export function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {Array.from({ length: 42 }, (_, i) => {
        const left = (i * 23.7) % 100;
        const delay = (i % 14) * 0.22;
        const duration = 2.8 + (i % 5) * 0.45;
        const size = 8 + (i % 4) * 3;
        return (
          <span
            key={i}
            className="absolute top-[-4vh]"
            style={{
              left: `${left}%`,
              width: size,
              height: i % 3 === 0 ? size : size * 0.55,
              borderRadius: i % 3 === 0 ? "50%" : 3,
              background: PARTY_COLORS[i % PARTY_COLORS.length],
              animation: `kt-confetti-fall ${duration}s linear ${delay}s forwards`,
              transform: `rotate(${(i * 47) % 360}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Section heading inside the sheet ─── */

export function SectionHead({
  title,
  sub,
}: {
  title: string;
  sub?: string;
}) {
  return (
    <div className="px-1">
      <h2 className="text-[21px] font-black leading-tight text-ink">{title}</h2>
      {sub ? <p className="mt-0.5 text-[14px] font-bold text-soft">{sub}</p> : null}
    </div>
  );
}

/* ─── First-word artwork for a topic (local photo, else glyph tile) ─── */

export function firstArtwork(category: VocabCategory): string | null {
  const item = category.items[0];
  if (!item) return null;
  const slug = (item.assetKey ?? item.word.toLowerCase()).replace(/\s+/g, "-");
  return getLocalImage(category.id, slug) ?? null;
}

export function ArtTile({
  category,
  size = 84,
  radius = 24,
}: {
  category: VocabCategory;
  size?: number;
  radius?: number;
}) {
  const [failed, setFailed] = useState(false);
  const src = firstArtwork(category);
  const Glyph = CATEGORY_GLYPHS[category.id] ?? CATEGORY_GLYPHS.kid_general;
  /* Portrait 2:3 tile — the same shape as the lesson cards, so the
     category's vertical artwork fills it edge to edge. */
  const tileH = Math.round(size * 1.5);
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        decoding="async"
        onError={() => setFailed(true)}
        className="shrink-0 object-cover"
        style={{ width: size, height: tileH, borderRadius: radius }}
        draggable={false}
      />
    );
  }
  return (
    <span
      className="grid shrink-0 place-items-center text-white"
      style={{
        width: size,
        height: tileH,
        borderRadius: radius,
        background: category.color,
        boxShadow: `inset 0 -6px 0 ${deepen(category.color)}`,
      }}
    >
      <Glyph size={Math.round(size * 0.52)} />
    </span>
  );
}

/* ─── The reference topic card ───
   Big white card: saturated/photo art tile, bold ink title, star row
   or mastery bar, small description, action pill bottom-right. */

export function TopicCard({
  category,
  stars,
  mastery,
  current = false,
  done = false,
}: {
  category: VocabCategory;
  stars: number;
  mastery: number;
  current?: boolean;
  done?: boolean;
}) {
  const started = stars > 0 || mastery > 0;
  return (
    <div className="relative">
      {current && (
        <span className="kt-bob absolute -top-4 left-24 z-10 rounded-full bg-gold px-3.5 py-1 text-[13px] font-black text-ink shadow-[0_8px_20px_rgba(14,42,99,0.18)]">
          START
        </span>
      )}
      <Link
        href={`/lesson/${category.id}`}
        className="kt-card kt-card-press flex items-center gap-3.5 p-3.5"
        aria-label={`${category.name} — ${category.items.length} words`}
      >
        <span className="relative shrink-0">
          <ArtTile category={category} />
          {done && (
            <span className="absolute -bottom-1.5 -right-1.5 grid h-8 w-8 place-items-center rounded-full bg-gold text-ink shadow">
              <GlyphCheck size={17} />
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[19px] font-black leading-tight text-ink">
            {category.name}
          </span>
          <span className="mt-0.5 block text-[13.5px] font-bold leading-snug text-soft">
            {category.description}
          </span>
          <span className="mt-1.5 block">
            {stars > 0 ? (
              <StarRow value={stars} />
            ) : mastery > 0 ? (
              <span className="block h-2.5 w-24 overflow-hidden rounded-full bg-mist">
                <span
                  className="kt-bar block h-full rounded-full"
                  style={{ width: `${mastery}%`, background: category.color }}
                />
              </span>
            ) : (
              <span
                className="text-[13px] font-black uppercase tracking-wide"
                style={{ color: category.color }}
              >
                {category.items.length} words
              </span>
            )}
          </span>
        </span>
        <PillButton
          small
          color={category.color}
          className="pointer-events-none shrink-0 self-end"
        >
          {started ? "Play" : "Start"}
        </PillButton>
      </Link>
    </div>
  );
}

/* ─── Daily-goal ring ─── */

export function GoalRing({
  done,
  goal,
  size = 76,
}: {
  done: number;
  goal: number;
  size?: number;
}) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const pct = goal > 0 ? Math.min(1, done / goal) : 0;
  const complete = done >= goal && goal > 0;
  return (
    <span
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Daily goal: ${done} of ${goal} words`}
    >
      <svg width={size} height={size} viewBox="0 0 76 76" className="-rotate-90">
        <circle cx="38" cy="38" r={r} fill="none" stroke="#E8EEFB" strokeWidth="8" />
        {pct > 0 && (
          <circle
            cx="38"
            cy="38"
            r={r}
            fill="none"
            stroke="#FFC531"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(pct * c).toFixed(1)} ${c.toFixed(1)}`}
          />
        )}
      </svg>
      <span className={`absolute ${complete ? "text-gold-deep" : "text-soft"}`}>
        {complete ? <GlyphCheck size={26} /> : <GlyphFlame size={24} />}
      </span>
    </span>
  );
}
