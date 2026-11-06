import { ArrowRight, ArrowUpRight, ShieldAlert, Sparkles } from "lucide-react";

import { formatMoney, formatPct, toneClass } from "@/lib/markets/format";
import type { Quote } from "@/lib/markets/types";
import { cn } from "@/lib/utils";

import { ExchangeBadge, RatingPill } from "./RatingPill";

function SignalRow({
  quote,
  rank,
  onOpen,
  watched,
}: {
  quote: Quote;
  rank: number;
  onOpen: (symbol: string) => void;
  watched: boolean;
}) {
  const upside = quote.signal.target
    ? ((quote.signal.target - quote.price) / quote.price) * 100
    : null;

  return (
    <div className="flex items-start gap-3 border-t border-border/40 px-4 py-3 first:border-t-0">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-secondary/60 text-[11px] font-bold tabular-nums text-muted-foreground">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold">{quote.instrument.code}</span>
          <ExchangeBadge exchange={quote.instrument.exchange} />
          <span className="truncate text-[11px] text-muted-foreground">
            {quote.instrument.name}
          </span>
          <RatingPill rating={quote.signal.rating} className="ml-auto" />
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1 w-24 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full",
                quote.signal.score >= 59
                  ? "bg-emerald-400"
                  : quote.signal.score >= 45
                    ? "bg-amber-400"
                    : "bg-rose-400",
              )}
              style={{ width: `${Math.min(100, Math.max(4, quote.signal.score))}%` }}
            />
          </div>
          <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
            score {quote.signal.score.toFixed(0)} · {quote.signal.confidence}% conf.
          </span>
          {upside !== null ? (
            <span className={cn("text-[10px] font-semibold tabular-nums", toneClass(upside))}>
              target {formatPct(upside, 1)}
            </span>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-foreground/75">
          {quote.signal.reasons[0] ?? "—"}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-xs font-semibold tabular-nums">
          {formatMoney(quote.price, quote.instrument.currency)}
        </span>
        <button
          onClick={() => onOpen(quote.instrument.symbol)}
          className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {watched ? "Open" : "Review"} <ArrowRight className="size-3" />
        </button>
      </div>
    </div>
  );
}

function Column({
  title,
  subtitle,
  icon,
  quotes,
  watchedSymbols,
  onOpen,
  tone,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  quotes: Quote[];
  watchedSymbols: string[];
  onOpen: (symbol: string) => void;
  tone: "positive" | "negative";
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
        <span className={tone === "positive" ? "text-emerald-400" : "text-rose-400"}>{icon}</span>
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {quotes.length === 0 ? (
        <p className="px-4 py-8 text-center text-xs text-muted-foreground">
          No names currently meet this screen.
        </p>
      ) : (
        quotes.map((quote, index) => (
          <SignalRow
            key={quote.instrument.symbol}
            quote={quote}
            rank={index + 1}
            onOpen={onOpen}
            watched={watchedSymbols.includes(quote.instrument.symbol)}
          />
        ))
      )}
    </section>
  );
}

export function SignalsPanel({
  quotes,
  watchedSymbols,
  onOpen,
}: {
  quotes: Quote[];
  watchedSymbols: string[];
  onOpen: (symbol: string) => void;
}) {
  const buys = quotes
    .filter((quote) => quote.signal.rating === "Buy" || quote.signal.rating === "Strong Buy")
    .sort((a, b) => b.signal.score - a.signal.score)
    .slice(0, 6);

  const trims = quotes
    .filter((quote) => quote.signal.rating === "Reduce" || quote.signal.rating === "Sell")
    .sort((a, b) => a.signal.score - b.signal.score)
    .slice(0, 6);

  const holdCount = quotes.length - buys.length - trims.length;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Sparkles className="size-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight">
            Screening across {quotes.length} names
          </h2>
          <span className="text-[11px] text-muted-foreground">
            {buys.length} buy · {holdCount} hold · {trims.length} reduce — ranked by composite score
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <ArrowUpRight className="size-3" /> Refreshed every 90s
          </span>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Column
          title="Model buys"
          subtitle="Trend and momentum aligned, timing not stretched"
          icon={<Sparkles className="size-4" />}
          quotes={buys}
          watchedSymbols={watchedSymbols}
          onOpen={onOpen}
          tone="positive"
        />
        <Column
          title="Trim or exit candidates"
          subtitle="Trend damage or overbought extensions"
          icon={<ShieldAlert className="size-4" />}
          quotes={trims}
          watchedSymbols={watchedSymbols}
          onOpen={onOpen}
          tone="negative"
        />
      </div>
    </div>
  );
}
