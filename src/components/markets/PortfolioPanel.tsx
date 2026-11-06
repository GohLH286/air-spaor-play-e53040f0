import { useMemo, useState } from "react";
import { Plus, Trash2, Wallet } from "lucide-react";

import type { Holding } from "@/hooks/usePortfolio";
import {
  formatMoney,
  formatPct,
  formatSgd,
  formatSigned,
  toSgd,
  toneClass,
} from "@/lib/markets/format";
import type { MarketSnapshot } from "@/lib/markets/types";
import { UNIVERSE } from "@/lib/markets/universe";
import { cn } from "@/lib/utils";

import { ExchangeBadge } from "./RatingPill";

export function PortfolioPanel({
  holdings,
  snapshot,
  onAdd,
  onRemove,
}: {
  holdings: Holding[];
  snapshot: MarketSnapshot;
  onAdd: (holding: Omit<Holding, "id">) => void;
  onRemove: (id: string) => void;
}) {
  const [symbol, setSymbol] = useState("D05.SI");
  const [quantity, setQuantity] = useState("100");
  const [avgCost, setAvgCost] = useState("");
  const { fx } = snapshot;
  const quotesBySymbol = new Map(snapshot.quotes.map((quote) => [quote.instrument.symbol, quote]));

  const positions = useMemo(
    () =>
      holdings.map((holding) => {
        const quote = quotesBySymbol.get(holding.symbol);
        const currency = quote?.instrument.currency ?? "SGD";
        const price = quote?.price ?? holding.avgCost;
        const valueSgd = toSgd(price * holding.quantity, currency, fx);
        const costSgd = toSgd(holding.avgCost * holding.quantity, currency, fx);
        const daySgd = toSgd((quote?.change ?? 0) * holding.quantity, currency, fx);
        return {
          holding,
          quote,
          currency,
          price,
          valueSgd,
          costSgd,
          daySgd,
          pnlSgd: valueSgd - costSgd,
          pnlPct: costSgd > 0 ? ((valueSgd - costSgd) / costSgd) * 100 : 0,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [holdings, snapshot],
  );

  const totalValue = positions.reduce((sum, position) => sum + position.valueSgd, 0);
  const totalCost = positions.reduce((sum, position) => sum + position.costSgd, 0);
  const totalPnl = totalValue - totalCost;
  const dayChange = positions.reduce((sum, position) => sum + position.daySgd, 0);

  const byExchange = (["SGX", "US", "HK"] as const).map((exchange) => {
    const value = positions
      .filter((position) => position.quote?.instrument.exchange === exchange)
      .reduce((sum, position) => sum + position.valueSgd, 0);
    return { exchange, value, weight: totalValue > 0 ? (value / totalValue) * 100 : 0 };
  });

  const submit = () => {
    const qty = Number(quantity);
    const cost = Number(avgCost);
    if (!symbol || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(cost) || cost <= 0) return;
    onAdd({ symbol, quantity: qty, avgCost: cost });
    setAvgCost("");
    setQuantity("100");
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Market value (SGD)",
            value: formatSgd(totalValue),
            tone: null as number | null,
          },
          { label: "Cost basis (SGD)", value: formatSgd(totalCost), tone: null as number | null },
          { label: "Unrealised P&L", value: formatSigned(totalPnl, "SGD"), tone: totalPnl },
          { label: "Today", value: formatSigned(dayChange, "SGD"), tone: dayChange },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-border/60 bg-card/60 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {card.label}
            </p>
            <p
              className={cn(
                "mt-1.5 text-xl font-bold tabular-nums",
                card.tone === null ? "" : toneClass(card.tone),
              )}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="min-w-0 rounded-2xl border border-border/60 bg-card/60 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center gap-3 border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-primary" />
            <h2 className="text-sm font-semibold tracking-tight">Holdings</h2>
            <span className="rounded-full bg-secondary/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {positions.length}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Sample positions are pre-filled — edit the list to match your own book.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-4 py-2 font-semibold">Instrument</th>
                <th className="px-2 py-2 text-right font-semibold">Qty</th>
                <th className="px-2 py-2 text-right font-semibold">Avg cost</th>
                <th className="px-2 py-2 text-right font-semibold">Last</th>
                <th className="px-2 py-2 text-right font-semibold">Value (SGD)</th>
                <th className="px-2 py-2 text-right font-semibold">P&L</th>
                <th className="px-2 py-2 text-right font-semibold">Weight</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr key={position.holding.id} className="border-t border-border/40">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {position.quote?.instrument.code ?? position.holding.symbol}
                      </span>
                      {position.quote ? (
                        <ExchangeBadge exchange={position.quote.instrument.exchange} />
                      ) : null}
                    </div>
                    <p className="mt-0.5 max-w-[190px] truncate text-[11px] text-muted-foreground">
                      {position.quote?.instrument.name ?? position.holding.symbol}
                    </p>
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums">
                    {position.holding.quantity.toLocaleString("en-SG")}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground">
                    {formatMoney(position.holding.avgCost, position.currency)}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums">
                    {formatMoney(position.price, position.currency)}
                  </td>
                  <td className="px-2 py-2.5 text-right font-medium tabular-nums">
                    {formatSgd(position.valueSgd)}
                  </td>
                  <td
                    className={cn(
                      "px-2 py-2.5 text-right font-semibold tabular-nums",
                      toneClass(position.pnlSgd),
                    )}
                  >
                    {formatSigned(position.pnlSgd, "SGD")}
                    <span className="ml-1 text-[10px] font-medium opacity-80">
                      {formatPct(position.pnlPct, 1)}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground">
                    {totalValue > 0
                      ? `${((position.valueSgd / totalValue) * 100).toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    <button
                      onClick={() => onRemove(position.holding.id)}
                      aria-label={`Remove ${position.holding.symbol}`}
                      className="rounded-full p-1 text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-xs text-muted-foreground">
                    No holdings yet — add your first position below.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-end gap-2 border-t border-border/50 px-4 py-3">
          <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Instrument
            <select
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              className="mt-1 block w-52 rounded-lg border border-border/70 bg-secondary/30 px-2 py-1.5 text-xs font-medium text-foreground outline-none focus:border-primary/60"
            >
              {UNIVERSE.map((instrument) => (
                <option key={instrument.symbol} value={instrument.symbol}>
                  {instrument.code} · {instrument.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Quantity
            <input
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              inputMode="decimal"
              className="mt-1 block w-24 rounded-lg border border-border/70 bg-secondary/30 px-2 py-1.5 text-xs tabular-nums outline-none focus:border-primary/60"
            />
          </label>
          <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Avg cost
            <input
              value={avgCost}
              onChange={(event) => setAvgCost(event.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              className="mt-1 block w-24 rounded-lg border border-border/70 bg-secondary/30 px-2 py-1.5 text-xs tabular-nums outline-none placeholder:text-muted-foreground/60 focus:border-primary/60"
            />
          </label>
          <button
            onClick={submit}
            disabled={!avgCost || !quantity}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
          >
            <Plus className="size-3.5" /> Add position
          </button>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Allocation by market
          </p>
          <div className="mt-3 space-y-2.5">
            {byExchange.map((row) => (
              <div key={row.exchange}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold">
                    {row.exchange === "HK" ? "HKEX" : row.exchange}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatSgd(row.value)} · {row.weight.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${row.weight}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Position notes
          </p>
          <div className="mt-3 space-y-2 text-[11px] leading-relaxed text-muted-foreground">
            <p>
              Values are converted to SGD with the{" "}
              {snapshot.fx.source === "live" ? "live" : "indicative"} USD/SGD{" "}
              {snapshot.fx.usdSgd.toFixed(4)} and HKD/SGD {snapshot.fx.hkdSgd.toFixed(4)} rates.
            </p>
            <p>
              Average cost is stored in the stock's own trading currency, so a USD-quoted SGX line
              such as H78 is handled the same way as a US listing.
            </p>
            <p>Positions are saved in this browser only — nothing leaves your device.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
