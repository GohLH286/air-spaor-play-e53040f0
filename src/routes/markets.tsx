import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Info } from "lucide-react";

import { InstrumentDetail } from "@/components/markets/InstrumentDetail";
import { IndexStrip, MarketHeader, type DeskTab } from "@/components/markets/MarketHeader";
import { KpiStrip } from "@/components/markets/KpiStrip";
import { PortfolioPanel } from "@/components/markets/PortfolioPanel";
import { SignalsPanel } from "@/components/markets/SignalsPanel";
import { WatchlistTable } from "@/components/markets/WatchlistTable";
import { useMarketSnapshot } from "@/hooks/useMarketSnapshot";
import { getMarketSnapshot } from "@/lib/markets/api";
import { usePortfolio, useWatchlist } from "@/hooks/usePortfolio";
import type { Quote } from "@/lib/markets/types";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "Meridian Markets — Singapore & global equities desk" },
      {
        name: "description",
        content:
          "Monitor SGX, US and Hong Kong equities in one desk: live quotes, technical signals and a systematic buy/hold/reduce view.",
      },
      { property: "og:title", content: "Meridian Markets — Singapore & global equities desk" },
      {
        property: "og:description",
        content:
          "Live watchlist, portfolio P&L in SGD and a transparent technical signal model across SGX, US and HKEX.",
      },
    ],
  }),
  loader: () => getMarketSnapshot({ data: { force: false } }),
  component: MarketsDashboard,
});

function PanelSkeleton({ lines = 6 }: { lines?: number }) {
  return (
    <div className="space-y-2 rounded-2xl border border-border/60 bg-card/60 p-4">
      <div className="h-3 w-28 animate-pulse rounded bg-secondary" />
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-8 animate-pulse rounded bg-secondary/60"
          style={{ animationDelay: `${index * 60}ms` }}
        />
      ))}
    </div>
  );
}

function MarketsDashboard() {
  const [tab, setTab] = useState<DeskTab>("overview");
  const [selectedSymbol, setSelectedSymbol] = useState("D05.SI");
  const initialSnapshot = Route.useLoaderData();
  const { query, refresh } = useMarketSnapshot(initialSnapshot);
  const { holdings, addHolding, removeHolding } = usePortfolio();
  const watchlist = useWatchlist();

  const snapshot = query.data;
  const quotes = useMemo(() => snapshot?.quotes ?? [], [snapshot]);
  const quotesBySymbol = useMemo(
    () => new Map(quotes.map((quote) => [quote.instrument.symbol, quote])),
    [quotes],
  );

  const watchedQuotes = useMemo(
    () =>
      watchlist.symbols
        .map((symbol) => quotesBySymbol.get(symbol))
        .filter((quote): quote is Quote => Boolean(quote)),
    [watchlist.symbols, quotesBySymbol],
  );

  const selectedQuote = quotesBySymbol.get(selectedSymbol) ?? watchedQuotes[0] ?? quotes[0];

  useEffect(() => {
    if (quotes.length > 0 && !quotesBySymbol.has(selectedSymbol)) {
      setSelectedSymbol(watchedQuotes[0]?.instrument.symbol ?? quotes[0].instrument.symbol);
    }
  }, [quotes, quotesBySymbol, selectedSymbol, watchedQuotes]);

  const openInstrument = (symbol: string) => {
    setSelectedSymbol(symbol);
    setTab("overview");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketHeader
        tab={tab}
        onTabChange={setTab}
        snapshot={snapshot}
        isLoading={query.isLoading || refresh.isPending}
        refreshing={refresh.isPending}
        onRefresh={() => refresh.mutate()}
      />
      <IndexStrip snapshot={snapshot} />

      <main className="mx-auto max-w-[1500px] space-y-3 px-4 py-4 md:px-8">
        {query.isLoading ? (
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <PanelSkeleton lines={8} />
            <PanelSkeleton lines={5} />
          </div>
        ) : null}

        {!query.isLoading && !snapshot ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm">
            <p className="flex items-center gap-2 font-semibold text-amber-200">
              <AlertTriangle className="size-4" /> Market data could not be loaded
            </p>
            <p className="mt-1 text-xs text-amber-100/80">
              The quote feed did not respond. Check the connection and try again.
            </p>
            <button
              onClick={() => refresh.mutate()}
              className="mt-3 rounded-lg bg-amber-400/90 px-3 py-1.5 text-xs font-semibold text-amber-950"
            >
              Retry
            </button>
          </div>
        ) : null}

        {snapshot ? (
          <>
            {snapshot.warnings.length > 0 ? (
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
                {snapshot.warnings.join(" ")}
              </p>
            ) : null}

            {tab === "overview" ? (
              <>
                <KpiStrip snapshot={snapshot} holdings={holdings} watchedQuotes={watchedQuotes} />
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
                  <WatchlistTable
                    quotes={quotes}
                    watchedSymbols={watchlist.symbols}
                    selectedSymbol={selectedQuote?.instrument.symbol ?? ""}
                    onSelect={setSelectedSymbol}
                    onToggleWatch={watchlist.toggle}
                  />
                  {selectedQuote ? (
                    <InstrumentDetail
                      quote={selectedQuote}
                      isWatched={watchlist.symbols.includes(selectedQuote.instrument.symbol)}
                      onToggleWatch={watchlist.toggle}
                    />
                  ) : null}
                </div>
              </>
            ) : null}

            {tab === "portfolio" ? (
              <PortfolioPanel
                holdings={holdings}
                snapshot={snapshot}
                onAdd={addHolding}
                onRemove={removeHolding}
              />
            ) : null}

            {tab === "signals" ? (
              <SignalsPanel
                quotes={quotes}
                watchedSymbols={watchlist.symbols}
                onOpen={openInstrument}
              />
            ) : null}
          </>
        ) : null}

        <footer className="flex flex-wrap items-start gap-2 rounded-xl border border-border/50 bg-card/40 px-3 py-2.5 text-[10px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <p>
            Quotes are sourced from public market data (Yahoo Finance) and may be delayed. Signals
            are systematic technical analytics generated for monitoring — not personalised
            investment advice, and not a recommendation to trade. Verify prices with your broker
            before dealing. Watchlist and holdings stay in this browser.
          </p>
        </footer>
      </main>
    </div>
  );
}
