import { useState } from "react";

const quadrants = [
  {
    id: "keep",
    title: "Keep",
    hint: "What worked well and should continue",
    color: "var(--action)",
    tint: "oklch(0.96 0.03 155)",
    suggestions: [
      "SPAOR structure for the lesson",
      "Sponge-ball particle demonstration",
      "Tiered worksheets (HA / MA / LA)",
    ],
  },
  {
    id: "improve",
    title: "Improve",
    hint: "What needs refining next round",
    color: "var(--situation)",
    tint: "oklch(0.97 0.03 70)",
    suggestions: [
      "Clarity of pre-test questions",
      "Time given for pupil discussion",
      "SLS chatbot prompts for LA pupils",
    ],
  },
  {
    id: "stay",
    title: "Stay",
    hint: "What to hold steady / keep watching",
    color: "var(--observation)",
    tint: "oklch(0.96 0.03 220)",
    suggestions: [
      "Same PLT observation protocol",
      "Learning-gap tracking sheet",
      "Group sizes for hands-on work",
    ],
  },
  {
    id: "stop",
    title: "Stop",
    hint: "What to drop from the next cycle",
    color: "var(--problem)",
    tint: "oklch(0.97 0.03 35)",
    suggestions: [
      "Teacher-led explanation before inquiry",
      "Single worksheet for all abilities",
      "Marking post-test without analysis",
    ],
  },
];

export function KissBoard() {
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [custom, setCustom] = useState<Record<string, string[]>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const toggle = (key: string) => setPicked((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-5">
      <div>
        <p className="font-semibold">KISS review · Keep · Improve · Stay · Stop</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the items for each quadrant, or add your own from the PLT discussion.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {quadrants.map((q) => (
          <div
            key={q.id}
            className="rounded-[1.75rem] border p-5 shadow-soft"
            style={{ background: q.tint, borderColor: "transparent" }}
          >
            <div className="flex items-center justify-between">
              <p className="text-base font-bold" style={{ color: q.color }}>
                {q.title}
              </p>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {q.hint}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {[...q.suggestions, ...(custom[q.id] ?? [])].map((s) => {
                const key = `${q.id}:${s}`;
                const on = picked[key];
                return (
                  <button
                    key={key}
                    onClick={() => toggle(key)}
                    className="flex w-full items-start gap-3 rounded-2xl border-2 bg-card px-4 py-3 text-left text-sm transition-all duration-200 hover:-translate-y-0.5"
                    style={{ borderColor: on ? q.color : "transparent" }}
                  >
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                      style={{ background: on ? q.color : "var(--border)" }}
                    >
                      {on ? "✓" : ""}
                    </span>
                    <span className="leading-relaxed">{s}</span>
                  </button>
                );
              })}
            </div>

            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const v = (drafts[q.id] ?? "").trim();
                if (!v) return;
                setCustom((c) => ({ ...c, [q.id]: [...(c[q.id] ?? []), v] }));
                setDrafts((d) => ({ ...d, [q.id]: "" }));
              }}
            >
              <input
                value={drafts[q.id] ?? ""}
                onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                placeholder={`Add to ${q.title}...`}
                className="flex-1 rounded-2xl border-2 bg-card px-4 py-2.5 text-xs outline-none transition-colors focus:border-[color:var(--ring)]"
              />
              <button
                type="submit"
                aria-label={`Add item to ${q.title}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white shadow-soft transition-transform hover:scale-105"
                style={{ background: q.color }}
              >
                +
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
