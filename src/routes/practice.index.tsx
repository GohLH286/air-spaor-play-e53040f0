import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/practice/")({
  component: PracticeHub,
  head: () => ({
    meta: [
      { title: "Magnets e-Practice Worksheets | P3 Science Singapore" },
      {
        name: "description",
        content:
          "Three interactive Primary 3 magnets e-practice worksheets for lower, middle and higher ability pupils, with instant marking and hints.",
      },
      { property: "og:title", content: "Magnets e-Practice Worksheets (P3)" },
      {
        property: "og:description",
        content: "Differentiated interactive magnet practice for Primary 3 pupils: three levels, instant feedback.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const SHEETS = [
  {
    to: "/practice/low" as const,
    label: "Worksheet A",
    level: "Lower ability",
    color: "var(--situation)",
    desc: "Simple recall: magnetic materials, poles, attract and repel. Short questions with picture-friendly words.",
    count: 8,
  },
  {
    to: "/practice/medium" as const,
    label: "Worksheet B",
    level: "Middle ability",
    color: "var(--action)",
    desc: "Apply what you know: sorting, true or false, filling in key science words and simple explanations.",
    count: 9,
  },
  {
    to: "/practice/high" as const,
    label: "Worksheet C",
    level: "Higher ability",
    color: "var(--reflection)",
    desc: "Think like a scientist: fair tests, proving something is a magnet, tricky exam traps and reasoning.",
    count: 10,
  },
];

function PracticeHub() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <Link to="/magnets" className="text-sm font-semibold text-muted-foreground hover:underline">
        ← Back to revision notes
      </Link>

      <header className="mt-5 rounded-[2rem] border bg-card p-7 shadow-[var(--shadow-soft)] md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Primary 3 Science · Singapore
        </p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Magnets — e-Practice Worksheets</h1>
        <p className="mt-3 text-muted-foreground">
          Choose your worksheet. Every question is marked straight away, with a hint to help you learn.
        </p>
      </header>

      <div className="mt-6 grid gap-5">
        {SHEETS.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="block rounded-[2rem] border bg-card p-6 shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5 md:p-7"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="rounded-full px-3.5 py-1.5 text-xs font-bold text-[oklch(0.18_0.04_260)]"
                style={{ background: s.color }}
              >
                {s.level}
              </span>
              <h2 className="text-xl font-bold">{s.label}</h2>
              <span className="text-sm text-muted-foreground">{s.count} questions</span>
            </div>
            <p className="mt-3 leading-relaxed text-muted-foreground">{s.desc}</p>
            <p className="mt-3 font-semibold">Start →</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
