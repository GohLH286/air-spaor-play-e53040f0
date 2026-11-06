import { useId, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Plus, Star } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatMoney, formatNumber, formatPct, toneClass } from "@/lib/markets/format";
import type { Quote } from "@/lib/markets/types";
import { cn } from "@/lib/utils";

import { ExchangeBadge } from "./RatingPill";
import { RecommendationCard } from "./RecommendationCard";

const RANGES = [
  { key: "1M", sessions: 22 },
  { key: "3M", sessions: 66 },
  { key: "1Y", sessions: 252 },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

function IndicatorRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-t border-border/40 py-1.5 text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export function InstrumentDetail({
  quote,
  isWatched,
  onToggleWatch,
}: {
  quote: Quote;
  isWatched: boolean;
  onToggleWatch: (symbol: string) => void;
}) {
  const [range, setRange] = useState<RangeKey>("3M");
  const gradientId = `fill-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const { instrument, indicators, signal } = quote;
  const positive = quote.changePercent >= 0;

  const data = useMemo(() => {
    const sessions = RANGES.find((item) => item.key === range)?.sessions ?? 66;
    return quote.series.slice(-sessions).map((point) => ({
      ...point,
      label: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(
        new Date(point.t),
      ),
    }));
  }, [quote.series, range]);

  const positionLabel =
    indicators.rangePosition === null
      ? "—"
      : `${indicators.rangePosition.toFixed(0)}% of 52w range`;

  return (
    <section className="min-w-0 rounded-2xl border border-border/60 bg-card/60 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-start gap-3 border-b border-border/50 px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight">{instrument.code}</h2>
            <ExchangeBadge exchange={instrument.exchange} />
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {instrument.sector}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">{instrument.name}</p>
        </div>

        <div className="ml-auto flex items-end gap-4">
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums">
              {formatMoney(quote.price, instrument.currency)}
            </p>
            <p
              className={cn(
                "inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums",
                toneClass(quote.changePercent),
              )}
            >
              {positive ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {formatMoney(Math.abs(quote.change), instrument.currency)} (
              {formatPct(quote.changePercent)})
            </p>
          </div>
          <button
            onClick={() => onToggleWatch(instrument.symbol)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors",
              isWatched
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/70 bg-secondary/40 text-foreground hover:bg-secondary",
            )}
          >
            {isWatched ? <Star className="size-3.5 fill-current" /> : <Plus className="size-3.5" />}
            {isWatched ? "On watchlist" : "Add to watchlist"}
          </button>
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Price action
          </p>
          <div className="flex items-center gap-1 rounded-full border border-border/60 bg-secondary/30 p-0.5">
            {RANGES.map((item) => (
              <button
                key={item.key}
                onClick={() => setRange(item.key)}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors",
                  range === item.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item.key}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 h-[190px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={positive ? "oklch(0.78 0.15 155)" : "oklch(0.7 0.17 25)"}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor={positive ? "oklch(0.78 0.15 155)" : "oklch(0.7 0.17 25)"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="oklch(0.34 0.06 255 / 40%)"
                strokeDasharray="3 4"
                vertical={false}
              />
              <XAxis dataKey="label" hide />
              <YAxis domain={["dataMin", "dataMax"]} hide />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.22 0.05 260)",
                  border: "1px solid oklch(0.34 0.06 255)",
                  borderRadius: 10,
                  fontSize: 11,
                }}
                labelFormatter={(label) => String(label)}
                formatter={(value) => [
                  formatMoney(Number(value), instrument.currency),
                  instrument.code,
                ]}
              />
              <Area
                type="monotone"
                dataKey="c"
                stroke={positive ? "oklch(0.8 0.16 155)" : "oklch(0.72 0.18 25)"}
                strokeWidth={1.8}
                fill={`url(#${gradientId})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Indicators
          </p>
          <div className="mt-1">
            <IndicatorRow
              label="RSI (14)"
              value={indicators.rsi14 !== null ? indicators.rsi14.toFixed(1) : "—"}
            />
            <IndicatorRow
              label="SMA 20 / 50 / 200"
              value={[
                formatNumber(indicators.sma20, 2),
                formatNumber(indicators.sma50, 2),
                formatNumber(indicators.sma200, 2),
              ].join(" / ")}
            />
            <IndicatorRow
              label="MACD histogram"
              value={indicators.macdHist !== null ? indicators.macdHist.toFixed(3) : "—"}
            />
            <IndicatorRow
              label="1M / 3M return"
              value={`${formatPct(indicators.momentum1m, 1)} / ${formatPct(indicators.momentum3m, 1)}`}
            />
            <IndicatorRow
              label="Volatility (1y, ann.)"
              value={
                indicators.volatility1y !== null
                  ? `${(indicators.volatility1y * 100).toFixed(1)}%`
                  : "—"
              }
            />
            <IndicatorRow
              label="52-week low / high"
              value={`${formatNumber(indicators.low52, 2)} / ${formatNumber(indicators.high52, 2)}`}
            />
            <IndicatorRow
              label="Previous close"
              value={formatMoney(quote.previousClose, instrument.currency)}
            />
            <IndicatorRow label="Position" value={positionLabel} />
          </div>

          <div className="mt-3">
            <div className="relative h-1.5 rounded-full bg-secondary">
              <div className="absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r from-rose-500/40 via-amber-400/40 to-emerald-500/50" />
              {indicators.rangePosition !== null ? (
                <div
                  className="absolute -top-1 size-3.5 -translate-x-1/2 rounded-full border-2 border-background bg-foreground"
                  style={{ left: `${indicators.rangePosition}%` }}
                />
              ) : null}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>52w low</span>
              <span>52w high</span>
            </div>
          </div>
        </div>

        <RecommendationCard quote={quote} />
      </div>

      <p className="border-t border-border/40 px-4 py-2 text-[10px] text-muted-foreground">
        Signal score {signal.score.toFixed(1)} · last trade{" "}
        {new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Singapore",
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date(quote.asOf))}{" "}
        SGT
      </p>
    </section>
  );
}
