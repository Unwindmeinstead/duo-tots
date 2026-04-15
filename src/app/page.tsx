import Link from "next/link";
import { AppShell, NavBar, PageHeader, Section, LinkBtn3D } from "@/components/ui";
import { IconFire, IconStar } from "@/components/icons";
import { categories } from "@/lib/vocab";

const COLORS = ["#58cc02", "#1cb0f6", "#ce82ff", "#ff9600", "#ff4b4b"] as const;

export default function Home() {
  const totalWords = categories.reduce((n, c) => n + c.items.length, 0);

  return (
    <AppShell>
      <NavBar title="DuoTots" />

      <PageHeader>
        <div className="flex items-center gap-3">
          <IconFire size={32} />
          <div>
            <h2 className="text-2xl font-black text-[var(--ink)]">Hey there!</h2>
            <p className="text-sm text-[var(--ink-light)]">{totalWords} words to explore</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5">
            <IconStar size={18} />
            <span className="text-sm font-extrabold text-[var(--ink)]">0</span>
          </span>
        </div>
      </PageHeader>

      <Section>
        <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-[var(--ink-light)]">
          Pick a topic
        </h3>
        <div className="grid gap-3">
          {categories.map((cat, i) => {
            const color = COLORS[i % COLORS.length];
            return (
              <Link
                key={cat.id}
                href={`/lesson/${cat.id}`}
                className="group flex items-center gap-4 rounded-2xl border-2 border-[var(--border)] border-b-4 border-b-[var(--border-dark)] bg-white p-4 transition-all active:border-b-2 active:mt-0.5"
              >
                <span
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
                  style={{ backgroundColor: `${color}22` }}
                >
                  {cat.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-extrabold text-[var(--ink)]">{cat.name}</p>
                  <p className="text-[13px] text-[var(--ink-light)]">{cat.items.length} words</p>
                </div>
                <span
                  className="rounded-xl px-3 py-1.5 text-xs font-extrabold text-white"
                  style={{ backgroundColor: color }}
                >
                  Start
                </span>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section className="pb-8">
        <LinkBtn3D href="/progress" color="blue" className="w-full text-center">
          View my progress
        </LinkBtn3D>
      </Section>
    </AppShell>
  );
}
