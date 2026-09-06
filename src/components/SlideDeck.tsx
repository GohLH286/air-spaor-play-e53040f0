import { useState } from "react";





const slides = Array.from(
  { length: 25 },
  (_, i) => `/lc-slides/slide-${String(i + 1).padStart(2, "0")}.jpg`
);

export function SlideDeck() {
  const [i, setI] = useState(0);
  const total = slides.length;

  return (
    <div className="rounded-[2rem] border bg-card p-4 shadow-soft md:p-5">
      <div className="flex items-center justify-between px-1 pb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Teacher Briefing Deck
          </p>
          <p className="text-sm font-semibold">Introduction to Learning Circle (OPAL 2.0)</p>
        </div>
        <a
          href="/2026 Learning Circles PPT slides 5 Jan Goh (5) V1 3 May (6).pptx"
          download
          className="rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-muted"
       const slides = Array.from(
  { length: 25 },
  (_, i) => `/lc-slides/slide-${String(i + 1).padStart(2, "0")}.jpg`
);

      <div className="relative overflow-hidden rounded-[1.5rem] border bg-muted/50">
        <img
          src={slides[i]}
          alt={`Learning Circle slide ${i + 1} of ${total}`}
          className="block h-auto w-full"
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          onClick={() => setI((n) => Math.max(0, n - 1))}
          disabled={i === 0}
          className="rounded-xl border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-40"
        >
          ← Prev
        </button>
        <span className="text-xs font-semibold text-muted-foreground">
          Slide {i + 1} / {total}
        </span>
        <button
          onClick={() => setI((n) => Math.min(total - 1, n + 1))}
          disabled={i === total - 1}
          className="rounded-xl border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-40"
        >
          Next →
        </button>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {slides.map((url, idx) => (
          <button
            key={url}
            onClick={() => setI(idx)}
            className="shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300"
            style={{
              borderColor: idx === i ? "var(--situation)" : "transparent",
              opacity: idx === i ? 1 : 0.55,
            }}
          >
            <img src={url} alt="" className="h-12 w-20 object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
