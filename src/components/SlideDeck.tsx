import { useState } from "react";

import s01 from "@/assets/lc-slides/slide-01.jpg.asset.json";
import s02 from "@/assets/lc-slides/slide-02.jpg.asset.json";
import s03 from "@/assets/lc-slides/slide-03.jpg.asset.json";
import s04 from "@/assets/lc-slides/slide-04.jpg.asset.json";
import s05 from "@/assets/lc-slides/slide-05.jpg.asset.json";
import s06 from "@/assets/lc-slides/slide-06.jpg.asset.json";
import s07 from "@/assets/lc-slides/slide-07.jpg.asset.json";
import s08 from "@/assets/lc-slides/slide-08.jpg.asset.json";
import s09 from "@/assets/lc-slides/slide-09.jpg.asset.json";
import s10 from "@/assets/lc-slides/slide-10.jpg.asset.json";
import s11 from "@/assets/lc-slides/slide-11.jpg.asset.json";
import s12 from "@/assets/lc-slides/slide-12.jpg.asset.json";
import s13 from "@/assets/lc-slides/slide-13.jpg.asset.json";
import s14 from "@/assets/lc-slides/slide-14.jpg.asset.json";
import s15 from "@/assets/lc-slides/slide-15.jpg.asset.json";
import s16 from "@/assets/lc-slides/slide-16.jpg.asset.json";
import s17 from "@/assets/lc-slides/slide-17.jpg.asset.json";
import s18 from "@/assets/lc-slides/slide-18.jpg.asset.json";
import s19 from "@/assets/lc-slides/slide-19.jpg.asset.json";
import s20 from "@/assets/lc-slides/slide-20.jpg.asset.json";
import s21 from "@/assets/lc-slides/slide-21.jpg.asset.json";
import s22 from "@/assets/lc-slides/slide-22.jpg.asset.json";
import s23 from "@/assets/lc-slides/slide-23.jpg.asset.json";
import s24 from "@/assets/lc-slides/slide-24.jpg.asset.json";
import s25 from "@/assets/lc-slides/slide-25.jpg.asset.json";
import deck from "@/assets/learning-circles-deck.pptx.asset.json";

const slides = [
  s01, s02, s03, s04, s05, s06, s07, s08, s09, s10,
  s11, s12, s13, s14, s15, s16, s17, s18, s19, s20,
  s21, s22, s23, s24, s25,
].map((a) => a.url);

export function SlideDeck() {
  const [i, setI] = useState(0);
  const total = slides.length;

  return (
    <div className="rounded-2xl border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between px-1 pb-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Teacher Briefing Deck
          </p>
          <p className="text-sm font-semibold">Introduction to Learning Circle (OPAL 2.0)</p>
        </div>
        <a
          href={deck.url}
          download
          className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
        >
          ⬇ Download .pptx
        </a>
      </div>

      <div className="relative overflow-hidden rounded-xl border bg-black/5">
        <img
          src={slides[i]}
          alt={`Learning Circle slide ${i + 1} of ${total}`}
          className="block h-auto w-full"
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          onClick={() => setI((n) => Math.max(0, n - 1))}
          disabled={i === 0}
          className="rounded-lg border px-3 py-1.5 text-sm font-semibold hover:bg-muted disabled:opacity-40"
        >
          ← Prev
        </button>
        <span className="text-xs font-semibold text-muted-foreground">
          Slide {i + 1} / {total}
        </span>
        <button
          onClick={() => setI((n) => Math.min(total - 1, n + 1))}
          disabled={i === total - 1}
          className="rounded-lg border px-3 py-1.5 text-sm font-semibold hover:bg-muted disabled:opacity-40"
        >
          Next →
        </button>
      </div>

      <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
        {slides.map((url, idx) => (
          <button
            key={url}
            onClick={() => setI(idx)}
            className="shrink-0 overflow-hidden rounded-md border-2 transition-all"
            style={{
              borderColor: idx === i ? "var(--situation)" : "transparent",
              opacity: idx === i ? 1 : 0.6,
            }}
          >
            <img src={url} alt="" className="h-12 w-20 object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
