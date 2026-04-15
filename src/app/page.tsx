import Link from "next/link";
import { AppShell, TopBar, Card, StatChip, BottomBar, NavLink, Tag } from "@/components/ui";
import { categories } from "@/lib/vocab";

const ACCENT_CYCLE = ["pink", "yellow", "green", "teal", "coral"] as const;

export default function Home() {
  return (
    <AppShell>
      <TopBar
        label="DuoTots"
        title="Let's Learn Today"
        subtitle="Tap any topic below to start exploring words with real images and sounds."
      >
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <StatChip label="Topics" value={categories.length} color="pink" />
          <StatChip label="Mode" value="Tap" color="yellow" />
          <StatChip label="Level" value="All" color="green" />
        </div>
      </TopBar>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, i) => {
          const accent = ACCENT_CYCLE[i % ACCENT_CYCLE.length];
          return (
            <Card key={cat.id} accent={accent}>
              <Link href={`/lesson/${cat.id}`} className="block p-5 transition-transform active:scale-[0.98]">
                <div className="flex items-start justify-between">
                  <span className="text-3xl leading-none">{cat.icon}</span>
                  <Tag color={accent}>{cat.items.length} words</Tag>
                </div>
                <h2 className="mt-3 text-xl font-extrabold tracking-tight text-[var(--ink)]">{cat.name}</h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--ink-muted)]">{cat.description}</p>
              </Link>
            </Card>
          );
        })}
      </section>

      <BottomBar>
        <NavLink href="/progress" variant="dark">Dashboard</NavLink>
        <span className="flex-1" />
        <p className="text-xs font-medium text-[var(--ink-muted)]">
          {categories.reduce((n, c) => n + c.items.length, 0)} words across {categories.length} topics
        </p>
      </BottomBar>
    </AppShell>
  );
}
