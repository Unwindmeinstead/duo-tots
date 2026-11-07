"use client";

/* ─── Floating tab bar ───
   The reference's signature chrome: a royal-blue pill floating above
   the bottom edge with side margins. The active tab sits in a white
   circle with an ink icon; the rest ride in soft white. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlyphApps, GlyphChart, GlyphHome, GlyphPlay } from "./glyphs";

const TABS = [
  { href: "/", label: "Learn", Glyph: GlyphHome },
  { href: "/explore", label: "Explore", Glyph: GlyphApps },
  { href: "/play", label: "Play", Glyph: GlyphPlay },
  { href: "/progress", label: "Progress", Glyph: GlyphChart },
] as const;

export function TabBar() {
  const pathname = usePathname() ?? "";
  return (
    <nav
      aria-label="Main"
      className="kt-tabbar fixed inset-x-0 bottom-0 z-50 flex justify-center px-5"
      style={{ paddingBottom: "max(0.85rem, var(--safe-bottom))" }}
    >
      <div className="flex w-full max-w-md items-center justify-between rounded-full bg-royal-deep p-2 shadow-[0_18px_44px_rgba(14,42,99,0.35)]">
        {TABS.map(({ href, label, Glyph }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 items-center justify-center gap-1.5 overflow-hidden rounded-full text-[13.5px] font-black transition-all duration-200 ${
                active ? "flex-1 bg-white px-2 text-ink shadow" : "w-14 flex-none text-white/55"
              }`}
            >
              <Glyph size={23} />
              {active && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
