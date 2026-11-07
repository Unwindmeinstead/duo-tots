"use client";

/* ─── Pip, the DuoTots mascot ───
   A 3D clay-render chick generated for this design (matte clay, big
   glossy eyes, butter-yellow body on the royal blue of the app).
   Four poses live in public/images/mascot/. If an image ever fails
   to load, a small hand-drawn SVG chick stands in so no surface is
   ever left with a broken frame. */

import { useState } from "react";

export type MascotPose = "hero" | "celebrate" | "point" | "read";

const POSE_SRC: Record<MascotPose, string> = {
  hero: "/images/mascot/hero.png",
  celebrate: "/images/mascot/celebrate.png",
  point: "/images/mascot/point.png",
  read: "/images/mascot/read.png",
};

function FallbackChick({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
      className="block"
    >
      <rect width="100" height="100" fill="#1D5CD6" />
      <ellipse cx="50" cy="88" rx="16" ry="3.4" fill="#1748AC" />
      <path d="M43 16c-2-4-6-6-9-5 2 1 3 3 3 5-3-1-6 0-8 2 4 1 7 3 9 6" fill="#FFC531" />
      <ellipse cx="50" cy="56" rx="27" ry="31" fill="#FFD94D" />
      <ellipse cx="50" cy="68" rx="15" ry="17" fill="#EAF3FF" />
      <circle cx="41" cy="48" r="5.2" fill="#182642" />
      <circle cx="59" cy="48" r="5.2" fill="#182642" />
      <circle cx="42.8" cy="46.2" r="1.9" fill="#fff" />
      <circle cx="60.8" cy="46.2" r="1.9" fill="#fff" />
      <path d="M50 54l-6 4.4c2.4 2.6 9.6 2.6 12 0L50 54Z" fill="#FF8A1E" />
      <ellipse cx="31" cy="57" rx="4.6" ry="2.8" fill="#FFB3C1" opacity="0.85" />
      <ellipse cx="69" cy="57" rx="4.6" ry="2.8" fill="#FFB3C1" opacity="0.85" />
      <path d="M40 90h7M53 90h7" stroke="#FF8A1E" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

export function Mascot({
  pose = "hero",
  size = 120,
  fill = false,
  ring = false,
  className = "",
}: {
  pose?: MascotPose;
  size?: number;
  /** Fill the parent box (parent controls shape/clip). */
  fill?: boolean;
  /** White ring + soft shadow, the medallion treatment. */
  ring?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (fill) {
    return failed ? (
      <span className={`block h-full w-full ${className}`}>
        <FallbackChick size={size} />
      </span>
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={POSE_SRC[pose]}
        alt="Pip the chick"
        onError={() => setFailed(true)}
        className={`block h-full w-full object-cover ${className}`}
        draggable={false}
      />
    );
  }
  return (
    <span
      className={`block overflow-hidden ${
        ring
          ? "rounded-[46%_54%_56%_44%/52%_46%_54%_48%] bg-royal shadow-[0_18px_44px_rgba(14,42,99,0.22)] ring-[6px] ring-white"
          : "rounded-full"
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {failed ? (
        <FallbackChick size={size} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={POSE_SRC[pose]}
          alt="Pip the chick"
          onError={() => setFailed(true)}
          className="block h-full w-full object-cover"
          draggable={false}
        />
      )}
    </span>
  );
}
