"use client";

/* Route chrome: the floating tab bar rides on the five browsing
   routes (/, /explore, /progress, /play, /world) and steps aside on
   every activity route — lessons, practice, world lessons and the
   offline page get the full stage. Each browsing page renders its
   own blue-zone header (it owns the live progress values).
   MOTION: browsing routes arrive through one shared page-enter
   (motion system, src/styles/motion.css) — keyed by pathname, so
   each tab switch replays the same fade-and-rise instead of a hard
   cut. Activity routes keep their own entrances and are rendered
   bare, untouched by the wrapper. */

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TabBar } from "./tab-bar";

const CHROME_ROUTES: readonly string[] = [
  "/",
  "/explore",
  "/progress",
  "/play",
  "/world",
];

/* Kid-proof touch layer (JS half — the CSS half is in globals.css):
   a long-press on a lesson card must never open the context menu,
   and no element may start a native drag. One document-level guard
   covers every route because this shell wraps the whole app from
   the root layout. Real form fields are exempt so a future
   parent/settings surface keeps working normally. */
function useKidProofTouch() {
  useEffect(() => {
    const guard = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, [contenteditable]")) return;
      e.preventDefault();
    };
    document.addEventListener("contextmenu", guard);
    document.addEventListener("dragstart", guard);
    return () => {
      document.removeEventListener("contextmenu", guard);
      document.removeEventListener("dragstart", guard);
    };
  }, []);
}

export function ClientShell({ children }: { children: ReactNode }) {
  useKidProofTouch();
  const pathname = usePathname() ?? "";
  const showTabs = CHROME_ROUTES.includes(pathname);
  return (
    <>
      {showTabs ? (
        <div key={pathname} className="kt-page-enter">
          {children}
        </div>
      ) : (
        children
      )}
      {showTabs && <TabBar />}
    </>
  );
}
