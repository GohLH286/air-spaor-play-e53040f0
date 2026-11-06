import type { IndicatorSet } from "./types";

export type Bar = { t: number; c: number; h: number; l: number; v: number | null };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const round = (value: number | null, digits = 2) =>
  value === null || !Number.isFinite(value) ? null : Number(value.toFixed(digits));

export function sma(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((sum, value) => sum + value, 0) / period;
}

function emaSeries(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const k = 2 / (period + 1);
  const out = [values[0]];
  for (let i = 1; i < values.length; i += 1) {
    out.push(values[i] * k + out[i - 1] * (1 - k));
  }
  return out;
}

/** Wilder's RSI, the 14-period version quoted on most terminals. */
export function rsi(values: number[], period = 14): number | null {
  if (values.length <= period) return null;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i += 1) {
    const delta = values[i] - values[i - 1];
    if (delta >= 0) gain += delta;
    else loss -= delta;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;

  for (let i = period + 1; i < values.length; i += 1) {
    const delta = values[i] - values[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(delta, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-delta, 0)) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function macd(values: number[]): { macd: number; signal: number; hist: number } | null {
  if (values.length < 35) return null;
  const fast = emaSeries(values, 12);
  const slow = emaSeries(values, 26);
  const line = values.map((_, index) => fast[index] - slow[index]);
  const signalLine = emaSeries(line.slice(25), 9);
  const macdValue = line[line.length - 1];
  const signalValue = signalLine[signalLine.length - 1];
  return { macd: macdValue, signal: signalValue, hist: macdValue - signalValue };
}

export function atr(bars: Bar[], period = 14): number | null {
  if (bars.length <= period) return null;
  const trueRanges: number[] = [];
  for (let i = 1; i < bars.length; i += 1) {
    const current = bars[i];
    const previous = bars[i - 1];
    trueRanges.push(
      Math.max(
        current.h - current.l,
        Math.abs(current.h - previous.c),
        Math.abs(current.l - previous.c),
      ),
    );
  }
  const recent = trueRanges.slice(-period);
  return recent.reduce((sum, value) => sum + value, 0) / period;
}

export function annualisedVolatility(closes: number[]): number | null {
  if (closes.length < 30) return null;
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i += 1) {
    if (closes[i - 1] > 0) returns.push(closes[i] / closes[i - 1] - 1);
  }
  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance =
    returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(returns.length - 1, 1);
  return Math.sqrt(variance) * Math.sqrt(252);
}

function pctChange(values: number[], sessions: number): number | null {
  if (values.length <= sessions) return null;
  const past = values[values.length - 1 - sessions];
  if (!past) return null;
  return (values[values.length - 1] / past - 1) * 100;
}

export function computeIndicators(bars: Bar[], price: number): IndicatorSet {
  const closes = bars.map((bar) => bar.c);
  const yearCloses = closes.slice(-252);
  const high52 = yearCloses.length ? Math.max(...yearCloses) : null;
  const low52 = yearCloses.length ? Math.min(...yearCloses) : null;
  const macdResult = macd(closes);
  const atr14 = atr(bars);
  const atrPct = atr14 !== null && price > 0 ? (atr14 / price) * 100 : null;
  const rangePosition =
    high52 !== null && low52 !== null && high52 > low52
      ? clamp(((price - low52) / (high52 - low52)) * 100, 0, 100)
      : null;

  return {
    sma20: round(sma(closes, 20)),
    sma50: round(sma(closes, 50)),
    sma200: round(sma(closes, 200)),
    rsi14: round(rsi(closes, 14), 1),
    macd: round(macdResult?.macd ?? null, 3),
    macdSignal: round(macdResult?.signal ?? null, 3),
    macdHist: round(macdResult?.hist ?? null, 3),
    atr14: round(atr14),
    atrPct: round(atrPct, 2),
    momentum1m: round(pctChange(closes, 21), 2),
    momentum3m: round(pctChange(closes, 63), 2),
    volatility1y: round(annualisedVolatility(yearCloses), 3),
    high52: round(high52),
    low52: round(low52),
    rangePosition: round(rangePosition, 1),
  };
}

export { clamp };
