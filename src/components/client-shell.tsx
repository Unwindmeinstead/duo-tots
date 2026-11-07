"use client";

/* Route chrome: the floating tab bar rides on the five browsing
   routes (/, /explore, /progress, /play, /world) and steps aside on
   every activity route — lessons, practice, world lessons and the
   offline page get the full stage. Each browsing page renders its
   own blue-zone header (it owns the live progress values). */

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TabBar } from "./tab-bar";

const CHROME_ROUTES: readonly string[] = [
  "/",
  "/explore",
  "/progress",
  "/play",
  "/world",
];

export function ClientShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const showTabs = CHROME_ROUTES.includes(pathname);
  return (
    <>
      {children}
      {showTabs && <TabBar />}
    </>
  );
}
