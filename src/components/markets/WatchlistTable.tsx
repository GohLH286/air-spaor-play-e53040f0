import { useMemo, useState } from "react";
import { Search, Star, X } from "lucide-react";

import { formatPct, formatMoney, toneClass } from "@/lib/markets/format";
import type { Exchange, Quote } from "@/lib/markets/types";
import { UNIVERSE } from "@/lib/markets/universe";
import { cn } from "@/lib/utils";

import { ExchangeBadge, RatingPill } from "./RatingPill";
import { Sparkline } from "./Sparkline";

const FILTERS: { key: "ALL" | Exchange; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "SGX", label: "SGX" },
  { key: "US", label: "US" },
  { key: "HK", label: "HKEX" },
];

export function WatchlistTable({
  quotes,
  watchedSymbols,
  selectedSymbol,
  onSelect,
  onToggleWatch,
}: {
  quotes: Quote[];
  watchedSymbols: string[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  onToggleWatch: (symbol: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | Exchange>("ALL");

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return quotes
      .filter((quote) => watchedSymbols.includes(quote.instrument.symbol))
      .filter((quote) => (filter === "ALL" ? true : quote.instrument.exchange === filter))
      .filter((quote) =>
        term
          ? `${quote.instrument.code} ${quote.instrument.name} ${quote.instrument.sector}`
              .toLowerCase()
              .includes(term)
          : true,
      )
      .sort((a, b) => b.changePercent - a.changePercent);
  }, [quotes, watchedSymbols, filter, search]);

  const available = UNIVERSE.filter((instrument) => !watchedSymbols.includes(instrument.symbol));

  return (
    <section className="min-w-0 rounded-2xl border border-border/60 bg-card/60 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Star className="size-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight">Watchlist</h2>
          <span className="rounded-full bg-secondary/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {rows.length}
          </span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or code"
              aria-label="Search watchlist"
              className="w-44 rounded-full border border-border/70 bg-secondary/30 py-1.5 pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground/70 focus:border-primary/60"
            />
          </div>

          <div className="flex items-center gap-1 rounded-full border border-border/60 bg-secondary/30 p-1">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  filter === item.key
                    ? "bg-primary/90 text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <select
            value=""
            onChange={(event) => {
              if (event.target.value) onToggleWatch(event.target.value);
            }}
            aria-label="Add instrument to watchlist"
            className="rounded-full border border-border/70 bg-secondary/30 px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground outline-none focus:border-primary/60"
          >
            <option value="">+ Add instrument</option>
            {available.map((instrument) => (
              <option key={instrument.symbol} value={instrument.symbol}>
                {instrument.code} · {instrument.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <th className="px-4 py-2 font-semibold">Instrument</th>
              <th className="px-2 py-2 text-right font-semibold">Last</th>
              <th className="px-2 py-2 text-right font-semibold">Chg</th>
              <th className="px-2 py-2 text-center font-semibold">30d</th>
              <th className="px-2 py-2 text-right font-semibold">RSI</th>
              <th className="px-2 py-2 font-semibold">Model</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((quote) => {
              const isSelected = quote.instrument.symbol === selectedSymbol;
              return (
                <tr
                  key={quote.instrument.symbol}
                  onClick={() => onSelect(quote.instrument.symbol)}
                  className={cn(
                    "cursor-pointer border-t border-border/40 transition-colors hover:bg-secondary/30",
                    isSelected && "bg-primary/10 hover:bg-primary/10",
                  )}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{quote.instrument.code}</span>
                      <ExchangeBadge exchange={quote.instrument.exchange} />
                    </div>
                    <p className="mt-0.5 max-w-[190px] truncate text-[11px] text-muted-foreground">
                      {quote.instrument.name}
                    </p>
                  </td>
                  <td className="px-2 py-2.5 text-right font-medium tabular-nums">
                    {formatMoney(quote.price, quote.instrument.currency)}
                  </td>
                  <td
                    className={cn(
                      "px-2 py-2.5 text-right font-semibold tabular-nums",
                      toneClass(quote.changePercent),
                    )}
                  >
                    {formatPct(quote.changePercent)}
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="flex justify-center">
                      <Sparkline values={quote.spark} positive={quote.changePercent >= 0} />
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground">
                    {quote.indicators.rsi14?.toFixed(0) ?? "—"}
                  </td>
                  <td className="px-2 py-2.5">
                    <RatingPill rating={quote.signal.rating} />
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleWatch(quote.instrument.symbol);
                      }}
                      aria-label={`Remove ${quote.instrument.code} from watchlist`}
                      className="rounded-full p-1 text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">
                  No instruments match this search. Add one from the menu above.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
