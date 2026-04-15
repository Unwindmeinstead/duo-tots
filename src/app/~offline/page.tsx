import Link from "next/link";
import { IconX } from "@/components/icons";

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--bg)] p-6">
      <div className="surface-elevated flex max-w-sm flex-col items-center gap-6 p-8 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-[var(--radius-2xl)] text-white" style={{ background: "linear-gradient(145deg, #e76f51, #c45a3c)", boxShadow: "var(--shadow-md)" }}>
          <IconX size={36} />
        </span>
        <div>
          <p className="text-overline">Connection</p>
          <h1 className="text-headline mt-1">You&apos;re offline</h1>
          <p className="text-subtitle mt-2">
            DuoTots saved this page for you. Reconnect to keep learning.
          </p>
        </div>
        <Link href="/"
          className="btn-primary rounded-[var(--radius-xl)] px-8 py-3.5 text-[15px] font-semibold tracking-tight text-white"
          style={{ background: "#1b4332", boxShadow: "var(--shadow-sm)" }}
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
