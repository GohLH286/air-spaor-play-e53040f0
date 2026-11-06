import { useCallback, useEffect, useState } from "react";

import { DEFAULT_WATCHLIST } from "@/lib/markets/universe";

export type Holding = {
  id: string;
  symbol: string;
  quantity: number;
  /** Average cost per share in the stock's own trading currency */
  avgCost: number;
};

const PORTFOLIO_KEY = "meridian.portfolio.v2";
const WATCHLIST_KEY = "meridian.watchlist.v2";

const SAMPLE_HOLDINGS: Holding[] = [
  { id: "sample-d05", symbol: "D05.SI", quantity: 400, avgCost: 42.8 },
  { id: "sample-a17u", symbol: "A17U.SI", quantity: 2000, avgCost: 2.62 },
  { id: "sample-nvda", symbol: "NVDA", quantity: 25, avgCost: 118.4 },
  { id: "sample-0700", symbol: "0700.HK", quantity: 100, avgCost: 372.5 },
];

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function useStoredState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(readStored(key, fallback));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(next));
      }
    },
    [key],
  );

  return { value, update, hydrated };
}

export function usePortfolio() {
  const {
    value: holdings,
    update,
    hydrated,
  } = useStoredState<Holding[]>(PORTFOLIO_KEY, SAMPLE_HOLDINGS);

  const addHolding = useCallback(
    (holding: Omit<Holding, "id">) => {
      update([...holdings, { ...holding, id: `${holding.symbol}-${Date.now().toString(36)}` }]);
    },
    [holdings, update],
  );

  const removeHolding = useCallback(
    (id: string) => {
      update(holdings.filter((holding) => holding.id !== id));
    },
    [holdings, update],
  );

  return { holdings, addHolding, removeHolding, hydrated };
}

export function useWatchlist() {
  const { value: symbols, update } = useStoredState<string[]>(WATCHLIST_KEY, DEFAULT_WATCHLIST);

  const toggle = useCallback(
    (symbol: string) => {
      update(
        symbols.includes(symbol) ? symbols.filter((item) => item !== symbol) : [...symbols, symbol],
      );
    },
    [symbols, update],
  );

  const add = useCallback(
    (symbol: string) => {
      if (!symbols.includes(symbol)) update([...symbols, symbol]);
    },
    [symbols, update],
  );

  const remove = useCallback(
    (symbol: string) => {
      update(symbols.filter((item) => item !== symbol));
    },
    [symbols, update],
  );

  return { symbols, toggle, add, remove };
}
