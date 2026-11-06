import type { IndexQuote, Instrument } from "./types";

/**
 * Curated watch universe: Singapore-listed names plus the overseas markets
 * a Singapore-based investor most often holds (US and Hong Kong).
 */
export const UNIVERSE: Instrument[] = [
  // ---- Singapore (SGX) ----
  {
    symbol: "D05.SI",
    code: "D05",
    name: "DBS Group Holdings",
    exchange: "SGX",
    currency: "SGD",
    sector: "Banks",
  },
  {
    symbol: "O39.SI",
    code: "O39",
    name: "OCBC Bank",
    exchange: "SGX",
    currency: "SGD",
    sector: "Banks",
  },
  {
    symbol: "U11.SI",
    code: "U11",
    name: "United Overseas Bank",
    exchange: "SGX",
    currency: "SGD",
    sector: "Banks",
  },
  {
    symbol: "Z74.SI",
    code: "Z74",
    name: "Singtel",
    exchange: "SGX",
    currency: "SGD",
    sector: "Telecom",
  },
  {
    symbol: "C6L.SI",
    code: "C6L",
    name: "Singapore Airlines",
    exchange: "SGX",
    currency: "SGD",
    sector: "Aviation",
  },
  {
    symbol: "A17U.SI",
    code: "A17U",
    name: "CapitaLand Ascendas REIT",
    exchange: "SGX",
    currency: "SGD",
    sector: "REITs",
  },
  {
    symbol: "S63.SI",
    code: "S63",
    name: "ST Engineering",
    exchange: "SGX",
    currency: "SGD",
    sector: "Industrials",
  },
  {
    symbol: "BS6.SI",
    code: "BS6",
    name: "Yangzijiang Shipbuilding",
    exchange: "SGX",
    currency: "SGD",
    sector: "Industrials",
  },
  {
    symbol: "G13.SI",
    code: "G13",
    name: "Genting Singapore",
    exchange: "SGX",
    currency: "SGD",
    sector: "Gaming",
  },
  {
    symbol: "C09.SI",
    code: "C09",
    name: "City Developments",
    exchange: "SGX",
    currency: "SGD",
    sector: "Property",
  },
  {
    symbol: "U96.SI",
    code: "U96",
    name: "Sembcorp Industries",
    exchange: "SGX",
    currency: "SGD",
    sector: "Utilities",
  },
  {
    symbol: "H78.SI",
    code: "H78",
    name: "Hongkong Land Holdings",
    exchange: "SGX",
    currency: "USD",
    sector: "Property",
  },

  // ---- United States ----
  {
    symbol: "AAPL",
    code: "AAPL",
    name: "Apple",
    exchange: "US",
    currency: "USD",
    sector: "Technology",
  },
  {
    symbol: "MSFT",
    code: "MSFT",
    name: "Microsoft",
    exchange: "US",
    currency: "USD",
    sector: "Technology",
  },
  {
    symbol: "NVDA",
    code: "NVDA",
    name: "NVIDIA",
    exchange: "US",
    currency: "USD",
    sector: "Semiconductors",
  },
  {
    symbol: "GOOGL",
    code: "GOOGL",
    name: "Alphabet",
    exchange: "US",
    currency: "USD",
    sector: "Technology",
  },
  {
    symbol: "AMZN",
    code: "AMZN",
    name: "Amazon",
    exchange: "US",
    currency: "USD",
    sector: "Consumer",
  },
  {
    symbol: "META",
    code: "META",
    name: "Meta Platforms",
    exchange: "US",
    currency: "USD",
    sector: "Technology",
  },
  {
    symbol: "TSLA",
    code: "TSLA",
    name: "Tesla",
    exchange: "US",
    currency: "USD",
    sector: "Automotive",
  },
  {
    symbol: "JPM",
    code: "JPM",
    name: "JPMorgan Chase",
    exchange: "US",
    currency: "USD",
    sector: "Banks",
  },
  {
    symbol: "UNH",
    code: "UNH",
    name: "UnitedHealth Group",
    exchange: "US",
    currency: "USD",
    sector: "Healthcare",
  },

  // ---- Hong Kong ----
  {
    symbol: "0700.HK",
    code: "0700",
    name: "Tencent Holdings",
    exchange: "HK",
    currency: "HKD",
    sector: "Technology",
  },
  {
    symbol: "9988.HK",
    code: "9988",
    name: "Alibaba Group",
    exchange: "HK",
    currency: "HKD",
    sector: "Consumer",
  },
  {
    symbol: "1299.HK",
    code: "1299",
    name: "AIA Group",
    exchange: "HK",
    currency: "HKD",
    sector: "Insurance",
  },
  {
    symbol: "0005.HK",
    code: "0005",
    name: "HSBC Holdings",
    exchange: "HK",
    currency: "HKD",
    sector: "Banks",
  },
];

export const INDEX_UNIVERSE: { symbol: string; name: string; location: string }[] = [
  { symbol: "^STI", name: "Straits Times", location: "SGX" },
  { symbol: "^GSPC", name: "S&P 500", location: "NYSE" },
  { symbol: "^IXIC", name: "Nasdaq Composite", location: "NASDAQ" },
  { symbol: "^HSI", name: "Hang Seng", location: "HKEX" },
];

export function findInstrument(symbol: string): Instrument | undefined {
  return UNIVERSE.find((item) => item.symbol === symbol);
}

export function instrumentsByExchange(exchange: "SGX" | "US" | "HK"): Instrument[] {
  return UNIVERSE.filter((item) => item.exchange === exchange);
}

export const DEFAULT_WATCHLIST = [
  "D05.SI",
  "O39.SI",
  "Z74.SI",
  "C6L.SI",
  "A17U.SI",
  "NVDA",
  "MSFT",
  "AAPL",
  "0700.HK",
  "9988.HK",
];

export type { IndexQuote };
