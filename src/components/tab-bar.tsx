"use client";

/* ─── Floating tab bar ───
   The reference's signature chrome: a royal-blue pill floating above
   the bottom edge with side margins.
   MOTION (motion system, src/styles/motion.css): the five tabs are
   equal slots that NEVER change layout. The white active pill is a
   separate layer behind the active tab that GLIDES between slots on
   transform alone; glyph + label ride in a stack that cross-fades
   colour and squashes on press. The previous build animated the
   flex layout itself (transition-all on expanding/shrinking tabs) —
   200ms of dock-wide reflow on every switch, which is what made
   tab changes feel blocky and heavy. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlyphApps, GlyphChart, GlyphGear, GlyphHome, GlyphPlay } from "./glyphs";

const TABS = [
  { href: "/", label: "Learn", Glyph: GlyphHome },
  { href: "/explore", label: "Explore", Glyph: GlyphApps },
  { href: "/play", label: "Play", Glyph: GlyphPlay },
  { href: "/progress", label: "Progress", Glyph: GlyphChart },
  { href: "/settings", label: "Settings", Glyph: GlyphGear },
] as const;

export function TabBar() {
  const pathname = usePathname() ?? "";
  const activeIndex = TABS.findIndex((t) => t.href === pathname);
  return (
    <nav
      aria-label="Main"
      className="kt-tabbar fixed inset-x-0 bottom-0 z-50 flex justify-center px-5"
      style={{ paddingBottom: "max(0.85rem, var(--safe-bottom))" }}
    >
      <div className="relative flex w-full max-w-md items-center rounded-full bg-royal-deep p-2 shadow-[0_18px_44px_rgba(14,42,99,0.35)]">
        {/* Gliding active pill — one slot wide, transform only. On
            chrome routes that are not a tab (e.g. /world) it fades
            out in place. */}
        <span
          aria-hidden
          className="kt-tab-glide absolute bottom-2 left-2 top-2 rounded-full bg-white shadow"
          style={{
            width: "calc((100% - 16px) / 5)",
            transform:
              activeIndex >= 0
                ? `translateX(${activeIndex * 100}%)`
                : "translateX(0) scale(0.55)",
            opacity: activeIndex >= 0 ? 1 : 0,
          }}
        />
        {TABS.map(({ href, label, Glyph }, i) => {
          const active = i === activeIndex;
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`relative z-10 flex min-h-14 flex-1 items-center justify-center rounded-full transition-colors duration-300 ${
                active ? "text-ink" : "text-white/55"
              }`}
            >
              <span className="kt-tab-press flex flex-col items-center gap-[3px]">
                <Glyph size={22} />
                <span className="text-[10.5px] font-black leading-none tracking-wide">
                  {label}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
