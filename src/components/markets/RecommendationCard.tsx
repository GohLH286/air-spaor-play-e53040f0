import { AlertTriangle, CheckCircle2, Gauge } from "lucide-react";

import { formatMoney, formatPct } from "@/lib/markets/format";
import type { Quote } from "@/lib/markets/types";
import { cn } from "@/lib/utils";

import { RatingPill } from "./RatingPill";

function ComponentBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <span>{label}</span>
        <span className="font-semibold tabular-nums text-foreground/70">{value.toFixed(0)}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full",
            value >= 60 ? "bg-emerald-400" : value >= 45 ? "bg-amber-400" : "bg-rose-400",
          )}
          style={{ width: `${Math.min(100, Math.max(3, value))}%` }}
        />
      </div>
    </div>
  );
}

export function RecommendationCard({ quote }: { quote: Quote }) {
  const { signal, instrument, price, indicators } = quote;
  const positive = signal.rating === "Buy" || signal.rating === "Strong Buy";

  return (
    <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="size-4 text-primary" />
            <h3 className="text-sm font-semibold tracking-tight">Desk view</h3>
            <RatingPill rating={signal.rating} />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Composite score {signal.score.toFixed(0)}/100 · {signal.confidence}% confidence ·
            trend-led, volatility-adjusted
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Model target
          </p>
          <p className="text-sm font-bold tabular-nums">
            {formatMoney(signal.target, instrument.currency)}
            <span
              className={cn(
                "ml-1.5 text-[11px] font-semibold",
                positive ? "text-emerald-400" : "text-rose-400",
              )}
            >
              {signal.target ? formatPct(((signal.target - price) / price) * 100, 1) : "—"}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        <ComponentBar label="Trend" value={signal.components.trend} />
        <ComponentBar label="Momentum" value={signal.components.momentum} />
        <ComponentBar label="Timing" value={signal.components.timing} />
        <ComponentBar label="Valuation" value={signal.components.valuation} />
        <ComponentBar label="Risk" value={signal.components.risk} />
        <div className="rounded-lg border border-border/60 bg-background/40 px-2 py-1">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Risk/Reward
          </p>
          <p className="text-xs font-semibold tabular-nums">
            {signal.riskReward?.toFixed(1) ?? "—"} : 1
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <div className="rounded-lg border border-border/60 bg-background/40 px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Entry zone
          </p>
          <p className="font-semibold tabular-nums">
            {formatMoney(signal.entryLow, instrument.currency)} –{" "}
            {formatMoney(signal.entryHigh, instrument.currency)}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/40 px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Stop</p>
          <p className="font-semibold tabular-nums text-rose-300">
            {formatMoney(signal.stop, instrument.currency)}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/40 px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Avg move (14d)
          </p>
          <p className="font-semibold tabular-nums">
            {indicators.atrPct !== null ? `${indicators.atrPct.toFixed(1)}%` : "—"}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {signal.reasons.map((reason) => (
          <p key={reason} className="flex gap-2 text-[11px] leading-relaxed text-foreground/80">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
            <span>{reason}</span>
          </p>
        ))}
        {signal.risks.map((risk) => (
          <p key={risk} className="flex gap-2 text-[11px] leading-relaxed text-muted-foreground">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
            <span>{risk}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
