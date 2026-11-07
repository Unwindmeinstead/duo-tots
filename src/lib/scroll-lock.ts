"use client";

/* ─── Scroll lock for activity views ───
   Lessons, practice, world lessons and Play Zone games are
   one-screen stages: their content is designed to fit the
   viewport exactly, so the document itself must never scroll.
   Left unlocked, iOS rubber-bands the whole page on any vertical
   drag (overscroll-behavior alone doesn't stop the main-frame
   bounce) — the page slides around under the card's tap
   animation and buttons drift out from under little fingers.

   The lock is the standard fixed-body technique: <body> goes
   position:fixed at the current scroll offset with overflow
   hidden on <html> too, and every inline style is restored
   verbatim on release. A module refcount lets overlapping
   owners (e.g. hub + game) compose without unlocking early.
   Browsing pages (home, explore, progress, indexes) never call
   this — they keep normal scrolling. */

import { useEffect } from "react";

type SavedStyles = {
  scrollY: number;
  htmlOverflow: string;
  htmlOverscrollBehavior: string;
  bodyOverflow: string;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
};

let lockCount = 0;
let saved: SavedStyles | null = null;

function engageLock() {
  const html = document.documentElement;
  const body = document.body;
  saved = {
    scrollY: window.scrollY,
    htmlOverflow: html.style.overflow,
    htmlOverscrollBehavior: html.style.overscrollBehavior,
    bodyOverflow: body.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
    bodyRight: body.style.right,
    bodyWidth: body.style.width,
  };
  html.style.overflow = "hidden";
  html.style.overscrollBehavior = "none";
  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${saved.scrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
}

function releaseLock() {
  if (!saved) return;
  const html = document.documentElement;
  const body = document.body;
  const { scrollY } = saved;
  html.style.overflow = saved.htmlOverflow;
  html.style.overscrollBehavior = saved.htmlOverscrollBehavior;
  body.style.overflow = saved.bodyOverflow;
  body.style.position = saved.bodyPosition;
  body.style.top = saved.bodyTop;
  body.style.left = saved.bodyLeft;
  body.style.right = saved.bodyRight;
  body.style.width = saved.bodyWidth;
  saved = null;
  window.scrollTo(0, scrollY);
}

/** Lock document scrolling while `active` (default: while mounted). */
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    if (lockCount === 0) engageLock();
    lockCount += 1;
    return () => {
      lockCount -= 1;
      if (lockCount === 0) releaseLock();
    };
  }, [active]);
}
