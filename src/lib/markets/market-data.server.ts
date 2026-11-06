import { computeIndicators, type Bar } from "./indicators";
import { buildSignal } from "./signal";
import type { IndexQuote, Instrument, MarketSnapshot, Quote } from "./types";
import { INDEX_UNIVERSE, UNIVERSE } from "./universe";

/**
 * A single batched spark request covers the whole desk. The per-symbol chart
 * endpoint is rate limited (HTTP 429) on shared egress IPs, so it is not used.
 */
const SPARK_ENDPOINTS = [
  "https://query2.finance.yahoo.com/v8/finance/spark",
  "https://query1.finance.yahoo.com/v8/finance/spark",
];
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** Quotes are cached briefly so a page refresh does not hammer the upstream feed. */
const CACHE_TTL_MS = 180_000;
const FX_FALLBACK = { usdSgd: 1.29, hkdSgd: 0.1285 * 1.29 };
const FX_SYMBOLS = { usdSgd: "SGD=X", hkdUsd: "HKDUSD=X" };
/** The spark endpoint rejects more than 20 symbols per request. */
const SPARK_MAX_SYMBOLS = 20;

type SparkSeries = {
  symbol: string;
  bars: Bar[];
  price: number;
  previousClose: number;
};

type SparkResponse = Record<
  string,
  {
    timestamp?: number[];
    close?: (number | null)[];
    fulldayPrice?: number | null;
    previousClose?: number | null;
    chartPreviousClose?: number | null;
  }
>;

let snapshotCache: { at: number; data: MarketSnapshot } | null = null;

function toSeries(symbol: string, entry: SparkResponse[string]): SparkSeries | null {
  const closes = entry.close ?? [];
  const stamps = entry.timestamp ?? [];
  const bars: Bar[] = [];

  closes.forEach((close, index) => {
    if (typeof close !== "number" || !Number.isFinite(close)) return;
    bars.push({ t: (stamps[index] ?? 0) * 1000, c: close, h: close, l: close, v: null });
  });

  if (bars.length < 20) return null;

  const lastClose = bars[bars.length - 1].c;
  const price = typeof entry.fulldayPrice === "number" ? entry.fulldayPrice : lastClose;
  const previousClose =
    bars.length > 1 ? bars[bars.length - 2].c : (entry.chartPreviousClose ?? lastClose);

  return { symbol, bars, price, previousClose };
}

type BatchResult = { series: Map<string, SparkSeries> | null; rateLimited: boolean };

async function fetchSparkBatch(symbols: string[], endpoint: string): Promise<BatchResult> {
  const query = `symbols=${symbols.map((symbol) => encodeURIComponent(symbol)).join(",")}&range=1y&interval=1d`;
  try {
    const response = await fetch(`${endpoint}?${query}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(6_000),
    });
    if (!response.ok) {
      console.warn(`[markets] quote feed ${new URL(endpoint).host} responded ${response.status}`);
      return { series: null, rateLimited: response.status === 429 || response.status === 401 };
    }

    const payload = (await response.json()) as SparkResponse;
    const series = new Map<string, SparkSeries>();
    for (const [symbol, entry] of Object.entries(payload)) {
      const parsed = toSeries(symbol, entry);
      if (parsed) series.set(symbol, parsed);
    }
    return { series: series.size > 0 ? series : null, rateLimited: false };
  } catch (error) {
    console.warn(`[markets] quote feed failed: ${(error as Error)?.message ?? error}`);
    return { series: null, rateLimited: false };
  }
}

async function fetchSpark(symbols: string[]): Promise<Map<string, SparkSeries>> {
  const merged = new Map<string, SparkSeries>();

  for (let index = 0; index < symbols.length; index += SPARK_MAX_SYMBOLS) {
    const chunk = symbols.slice(index, index + SPARK_MAX_SYMBOLS);
    let batch: BatchResult = { series: null, rateLimited: false };
    for (const endpoint of SPARK_ENDPOINTS) {
      batch = await fetchSparkBatch(chunk, endpoint);
      if (batch.series || batch.rateLimited) break;
    }
    // The upstream feed is throttled: stop before burning the rest of the quota.
    if (batch.rateLimited) break;
    batch.series?.forEach((value, key) => merged.set(key, value));
  }

  return merged;
}

function buildQuote(instrument: Instrument, series: SparkSeries): Quote {
  const { bars, price, previousClose } = series;
  const change = price - previousClose;
  const changePercent = previousClose ? (change / previousClose) * 100 : 0;
  const closes = bars.map((bar) => bar.c);
  const indicators = computeIndicators(bars, price);
  const asOf = new Date(bars[bars.length - 1].t || Date.now()).toISOString();

  return {
    instrument,
    price: Number(price.toFixed(3)),
    previousClose: Number(previousClose.toFixed(3)),
    change: Number(change.toFixed(3)),
    changePercent: Number(changePercent.toFixed(2)),
    asOf,
    dayHigh: null,
    dayLow: null,
    volume: null,
    spark: closes.slice(-30).map((value) => Number(value.toFixed(3))),
    series: bars.map((bar) => ({ t: bar.t, c: Number(bar.c.toFixed(3)) })),
    indicators,
    signal: buildSignal(price, indicators),
  };
}

function buildIndices(series: Map<string, SparkSeries>): IndexQuote[] {
  const rows: IndexQuote[] = [];
  for (const index of INDEX_UNIVERSE) {
    const data = series.get(index.symbol);
    if (!data) continue;
    rows.push({
      symbol: index.symbol,
      name: index.name,
      location: index.location,
      price: Number(data.price.toFixed(2)),
      changePercent: Number(
        (((data.price - data.previousClose) / data.previousClose) * 100).toFixed(2),
      ),
    });
  }
  return rows;
}

function buildFx(series: Map<string, SparkSeries>): MarketSnapshot["fx"] {
  const usd = series.get(FX_SYMBOLS.usdSgd)?.price ?? null;
  const hkd = series.get(FX_SYMBOLS.hkdUsd)?.price ?? null;
  if (usd === null || hkd === null) {
    return { ...FX_FALLBACK, source: "fallback" };
  }
  return {
    usdSgd: Number(usd.toFixed(4)),
    hkdSgd: Number((hkd * usd).toFixed(4)),
    source: "live",
  };
}

export async function buildMarketSnapshot(force = false): Promise<MarketSnapshot> {
  if (!force && snapshotCache && Date.now() - snapshotCache.at < CACHE_TTL_MS) {
    return snapshotCache.data;
  }

  const symbols = [
    ...UNIVERSE.map((instrument) => instrument.symbol),
    ...INDEX_UNIVERSE.map((index) => index.symbol),
    FX_SYMBOLS.usdSgd,
    FX_SYMBOLS.hkdUsd,
  ];

  const series = await fetchSpark(symbols);
  const quotes = UNIVERSE.map((instrument) => {
    const data = series.get(instrument.symbol);
    return data ? buildQuote(instrument, data) : null;
  }).filter((quote): quote is Quote => quote !== null && !Number.isNaN(quote.price));

  if (quotes.length === 0 && snapshotCache) {
    return {
      ...snapshotCache.data,
      warnings: [
        "Live quotes are briefly unavailable — showing the last successful refresh. Try Refresh again shortly.",
      ],
    };
  }

  const missing = UNIVERSE.filter(
    (instrument) => !quotes.some((quote) => quote.instrument.symbol === instrument.symbol),
  );

  const snapshot: MarketSnapshot = {
    quotes,
    indices: buildIndices(series),
    fx: buildFx(series),
    fetchedAt: new Date().toISOString(),
    live: quotes.length > 0,
    warnings: missing.length
      ? [
          `No feed data for ${missing.map((item) => item.code).join(", ")} — showing the last update only.`,
        ]
      : [],
  };

  if (quotes.length > 0) snapshotCache = { at: Date.now(), data: snapshot };
  return snapshot;
}
