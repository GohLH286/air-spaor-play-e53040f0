export type Exchange = "SGX" | "US" | "HK";

export type Instrument = {
  /** Yahoo Finance symbol, e.g. D05.SI */
  symbol: string;
  /** Short exchange code shown in tables */
  code: string;
  name: string;
  exchange: Exchange;
  currency: "SGD" | "USD" | "HKD";
  sector: string;
};

export type IndicatorSet = {
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  rsi14: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHist: number | null;
  atr14: number | null;
  /** ATR as a percentage of price */
  atrPct: number | null;
  momentum1m: number | null;
  momentum3m: number | null;
  /** Annualised standard deviation of daily returns */
  volatility1y: number | null;
  high52: number | null;
  low52: number | null;
  /** 0 = at 52w low, 100 = at 52w high */
  rangePosition: number | null;
};

export type Rating = "Strong Buy" | "Buy" | "Hold" | "Reduce" | "Sell";

export type Signal = {
  rating: Rating;
  /** Composite model score, 0-100 */
  score: number;
  confidence: number;
  components: {
    trend: number;
    momentum: number;
    timing: number;
    valuation: number;
    risk: number;
  };
  entryLow: number | null;
  entryHigh: number | null;
  target: number | null;
  stop: number | null;
  riskReward: number | null;
  reasons: string[];
  risks: string[];
};

export type Quote = {
  instrument: Instrument;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  asOf: string;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  /** Closing prices for the last ~30 sessions, for inline sparklines */
  spark: number[];
  /** Daily closes for the trailing year */
  series: { t: number; c: number }[];
  indicators: IndicatorSet;
  signal: Signal;
};

export type IndexQuote = {
  symbol: string;
  name: string;
  location: string;
  price: number;
  changePercent: number;
};

export type MarketSnapshot = {
  quotes: Quote[];
  indices: IndexQuote[];
  fx: {
    usdSgd: number;
    hkdSgd: number;
    source: "live" | "fallback";
  };
  fetchedAt: string;
  live: boolean;
  warnings: string[];
};
