import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";

import type { Holding } from "@/hooks/usePortfolio";
import { formatPct, formatSgd, formatSigned, toSgd, toneClass } from "@/lib/markets/format";
import type { MarketSnapshot, Quote } from "@/lib/markets/types";
import { cn } from "@/lib/utils";

function Card({
  label,
  value,
  tone,
  children,
}: {
  label: string;
  value: string;
  tone?: number | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-[var(--shadow-soft)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-xl font-bold tabular-nums",
          tone === undefined ? "" : toneClass(tone),
        )}
      >
        {value}
      </p>
      {children ? <div className="mt-1 text-[11px] text-muted-foreground">{children}</div> : null}
    </div>
  );
}

export function KpiStrip({
  snapshot,
  holdings,
  watchedQuotes,
}: {
  snapshot: MarketSnapshot;
  holdings: Holding[];
  watchedQuotes: Quote[];
}) {
  const { fx } = snapshot;
  const quotesBySymbol = new Map(snapshot.quotes.map((quote) => [quote.instrument.symbol, quote]));

  const positions = holdings.map((holding) => {
    const quote = quotesBySymbol.get(holding.symbol);
    const currency = quote?.instrument.currency ?? "SGD";
    const price = quote?.price ?? holding.avgCost;
    const value = toSgd(price * holding.quantity, currency, fx);
    const cost = toSgd(holding.avgCost * holding.quantity, currency, fx);
    const dayMove = toSgd((quote?.change ?? 0) * holding.quantity, currency, fx);
    return { value, cost, dayMove };
  });

  const portfolioValue = positions.reduce((sum, position) => sum + position.value, 0);
  const portfolioCost = positions.reduce((sum, position) => sum + position.cost, 0);
  const dayChange = positions.reduce((sum, position) => sum + position.dayMove, 0);
  const totalPnl = portfolioValue - portfolioCost;
  const totalPnlPct = portfolioCost > 0 ? (totalPnl / portfolioCost) * 100 : 0;

  const sorted = [...watchedQuotes].sort((a, b) => b.changePercent - a.changePercent);
  const topMover = sorted[0];
  const laggard = sorted[sorted.length - 1];
  const buys = watchedQuotes.filter(
    (quote) => quote.signal.rating === "Strong Buy" || quote.signal.rating === "Buy",
  );
  const topConviction = [...watchedQuotes].sort((a, b) => b.signal.score - a.signal.score)[0];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card label="Portfolio value" value={formatSgd(portfolioValue)} tone={null}>
        <span
          className={cn(
            "inline-flex items-center gap-1 font-semibold tabular-nums",
            toneClass(dayChange),
          )}
        >
          {dayChange >= 0 ? (
            <ArrowUpRight className="size-3" />
          ) : (
            <ArrowDownRight className="size-3" />
          )}
          {formatSigned(dayChange, "SGD")} today
        </span>
      </Card>

      <Card label="Unrealised P&L" value={formatSigned(totalPnl, "SGD")} tone={totalPnl}>
        <span className={cn("font-semibold tabular-nums", toneClass(totalPnl))}>
          {formatPct(totalPnlPct)} on {formatSgd(portfolioCost)} cost
        </span>
      </Card>

      <Card
        label="Watchlist breadth"
        value={`${buys.length} of ${watchedQuotes.length} on buy`}
        tone={buys.length ? 1 : -1}
      >
        {topMover && laggard ? (
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <TrendingUp className="size-3" /> {topMover.instrument.code}{" "}
              {formatPct(topMover.changePercent)}
            </span>
            <span className="inline-flex items-center gap-1 text-rose-400">
              <TrendingDown className="size-3" /> {laggard.instrument.code}{" "}
              {formatPct(laggard.changePercent)}
            </span>
          </span>
        ) : (
          "No movers yet"
        )}
      </Card>

      <Card
        label="Highest conviction"
        value={
          topConviction
            ? `${topConviction.instrument.code} · ${topConviction.signal.score.toFixed(0)}`
            : "—"
        }
        tone={topConviction ? (topConviction.signal.score >= 55 ? 1 : -1) : null}
      >
        {topConviction ? (
          <span>
            {topConviction.signal.rating} · {topConviction.signal.confidence}% confidence ·{" "}
            {topConviction.instrument.name}
          </span>
        ) : (
          "Waiting for signals"
        )}
      </Card>
    </div>
  );
}
