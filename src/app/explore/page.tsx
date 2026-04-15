import Link from "next/link";
import { AppShell, NavBar, PageHeader, Section } from "@/components/ui";
import { categories } from "@/lib/vocab";

const COLORS = ["#58cc02", "#1cb0f6", "#ce82ff", "#ff9600", "#ff4b4b"] as const;

export default function ExplorePage() {
  return (
    <AppShell>
      <NavBar title="Explore" />

      <PageHeader>
        <p className="text-sm text-[var(--ink-light)]">All {categories.length} topics</p>
      </PageHeader>

      <Section className="pb-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.map((cat, i) => {
            const color = COLORS[i % COLORS.length];
            return (
              <Link
                key={cat.id}
                href={`/lesson/${cat.id}`}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-[var(--border)] border-b-4 border-b-[var(--border-dark)] bg-white p-5 text-center transition-all active:border-b-2 active:mt-0.5"
              >
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full text-3xl"
                  style={{ backgroundColor: `${color}22` }}
                >
                  {cat.icon}
                </span>
                <p className="text-sm font-extrabold text-[var(--ink)]">{cat.name}</p>
                <p className="text-[11px] font-bold text-[var(--ink-light)]">{cat.items.length} words</p>
              </Link>
            );
          })}
        </div>
      </Section>
    </AppShell>
  );
}
