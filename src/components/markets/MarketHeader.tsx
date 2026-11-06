import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, RefreshCw, Wifi, WifiOff } from "lucide-react";

import { formatPct, marketSession, toneClass } from "@/lib/markets/format";
import type { Exchange, MarketSnapshot } from "@/lib/markets/types";
import { cn } from "@/lib/utils";

export type DeskTab = "overview" | "portfolio" | "signals";

const TABS: { key: DeskTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "portfolio", label: "Portfolio" },
  { key: "signals", label: "Signals" },
];

function formatClock(iso: string | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Singapore",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date)} SGT`;
}

function SessionChip({ exchange, label }: { exchange: Exchange; label: string }) {
  const [session, setSession] = useState<{ open: boolean; label: string } | null>(null);

  useEffect(() => {
    const tick = () => setSession(marketSession(exchange));
    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, [exchange]);

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      <span
        className={cn(
          "size-1.5 rounded-full",
          session
            ? session.open
              ? "bg-emerald-400"
              : "bg-muted-foreground/50"
            : "bg-muted-foreground/40",
        )}
      />
      <span className="font-semibold text-foreground/80">{label}</span>
      <span>{session ? (session.open ? "Open" : "Closed") : "—"}</span>
    </span>
  );
}

export function MarketHeader({
  tab,
  onTabChange,
  snapshot,
  isLoading,
  refreshing,
  onRefresh,
}: {
  tab: DeskTab;
  onTabChange: (tab: DeskTab) => void;
  snapshot: MarketSnapshot | undefined;
  isLoading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-base font-black text-primary-foreground shadow-lg shadow-primary/20">
            M
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight">Meridian Markets</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              SGX · US · HKEX desk
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1 rounded-full border border-border/60 bg-secondary/30 p-1">
          {TABS.map((item) => (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                tab === item.key
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <SessionChip exchange="SGX" label="SGX" />
          <SessionChip exchange="US" label="NYSE" />
          <SessionChip exchange="HK" label="HKEX" />

          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
              snapshot?.live
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300",
            )}
          >
            {snapshot?.live ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
            {snapshot?.live ? "Live feed" : "Feed unavailable"}
          </span>

          <span className="text-[11px] text-muted-foreground tabular-nums">
            Updated {formatClock(snapshot?.fetchedAt)}
          </span>

          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-secondary/50 px-3 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
          >
            <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
            {refreshing ? "Syncing" : "Refresh"}
          </button>
        </div>
      </div>
      {isLoading ? <div className="h-px w-full animate-pulse bg-primary/40" /> : null}
    </header>
  );
}

export function IndexStrip({ snapshot }: { snapshot: MarketSnapshot | undefined }) {
  if (!snapshot?.indices.length) {
    return null;
  }
  return (
    <div className="border-b border-border/40 bg-card/30">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 md:px-8">
        {snapshot.indices.map((index) => (
          <div key={index.symbol} className="flex items-baseline gap-2">
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {index.name}
            </span>
            <span className="text-xs font-semibold tabular-nums">
              {index.price.toLocaleString("en-SG", { minimumFractionDigits: 2 })}
            </span>
            <span
              className={cn(
                "inline-flex items-center text-[11px] font-semibold tabular-nums",
                toneClass(index.changePercent),
              )}
            >
              {index.changePercent >= 0 ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {formatPct(index.changePercent)}
            </span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-4 text-[11px] text-muted-foreground">
          <span>
            USD/SGD{" "}
            <span className="font-semibold text-foreground/80 tabular-nums">
              {snapshot.fx.usdSgd.toFixed(4)}
            </span>
          </span>
          <span>
            HKD/SGD{" "}
            <span className="font-semibold text-foreground/80 tabular-nums">
              {snapshot.fx.hkdSgd.toFixed(4)}
            </span>
          </span>
          <span className="uppercase tracking-[0.14em]">
            FX {snapshot.fx.source === "live" ? "live" : "indicative"}
          </span>
        </div>
      </div>
    </div>
  );
}
