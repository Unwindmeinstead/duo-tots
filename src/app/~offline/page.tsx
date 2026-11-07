/* ─── Offline ───
   The PWA fallback page, in the Kidtopia system: royal blue,
   Pip waiting patiently, one gold way home. Offline semantics —
   calm, never an error state. */

import { Mascot } from "@/components/mascot";
import { PillButton } from "@/components/kit";
import { GOLD } from "@/lib/theme";

function WifiOffGlyph({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h.01" />
      <path d="M8.5 16.4a5 5 0 0 1 7 0" />
      <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
      <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
      <path d="M16.85 11.25a10 10 0 0 1 2.22 1.68" />
      <path d="M5 13a10 10 0 0 1 5.24-2.76" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

export default function OfflinePage() {
  return (
    <div className="blue-rings flex min-h-dvh flex-col items-center justify-center bg-royal p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <div aria-hidden>
          <Mascot pose="point" size={150} ring />
        </div>
        <span className="kt-pulse-soft grid h-16 w-16 place-items-center rounded-full bg-white/15 text-white">
          <WifiOffGlyph />
        </span>
        <div>
          <h1 className="text-[28px] font-black leading-tight text-white">
            You&apos;re offline
          </h1>
          <p className="mt-2 text-[16px] font-bold text-white/70">
            Reconnect to keep playing.
          </p>
        </div>
        <PillButton href="/" color={GOLD} ink="#182642" className="w-full">
          Home
        </PillButton>
      </div>
    </div>
  );
}
