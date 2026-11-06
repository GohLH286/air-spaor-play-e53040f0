import type { IndicatorSet, Rating, Signal } from "./types";
import { clamp } from "./indicators";

const round = (value: number, digits = 2) => Number(value.toFixed(digits));
const pct = (value: number, digits = 1) => `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;

/** Piecewise-linear interpolation over (x, score) anchors. */
function interpolate(points: [number, number][], x: number): number {
  if (x <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i += 1) {
    const [x1, y1] = points[i - 1];
    const [x2, y2] = points[i];
    if (x <= x2) {
      const ratio = (x - x1) / (x2 - x1 || 1);
      return y1 + ratio * (y2 - y1);
    }
  }
  return points[points.length - 1][1];
}

function rateScore(score: number): Rating {
  if (score >= 70) return "Strong Buy";
  if (score >= 59) return "Buy";
  if (score >= 45) return "Hold";
  if (score >= 34) return "Reduce";
  return "Sell";
}

export function buildSignal(price: number, ind: IndicatorSet): Signal {
  // --- Trend: moving-average structure (35% of the model) ---
  let trend = 50;
  if (ind.sma20 !== null && ind.sma50 !== null) trend += ind.sma20 > ind.sma50 ? 18 : -18;
  if (ind.sma50 !== null && ind.sma200 !== null) trend += ind.sma50 > ind.sma200 ? 22 : -22;
  if (ind.sma50 !== null) trend += price > ind.sma50 ? 10 : -10;
  trend = clamp(trend, 0, 100);

  // --- Momentum: 1m/3m return plus MACD state (25%) ---
  let momentum = 50;
  if (ind.momentum3m !== null) momentum += clamp(ind.momentum3m * 2.5, -35, 35);
  if (ind.momentum1m !== null) momentum += clamp(ind.momentum1m * 1.5, -10, 10);
  if (ind.macdHist !== null) momentum += ind.macdHist > 0 ? 5 : -5;
  momentum = clamp(momentum, 0, 100);

  // --- Timing: mean reversion on RSI (20%) ---
  const timing =
    ind.rsi14 === null
      ? 50
      : interpolate(
          [
            [20, 45],
            [30, 62],
            [40, 78],
            [50, 82],
            [60, 70],
            [70, 45],
            [80, 18],
            [100, 3],
          ],
          ind.rsi14,
        );

  // --- Valuation: position inside the 52-week range (10%) ---
  const valuation = ind.rangePosition === null ? 50 : clamp(100 - ind.rangePosition * 0.7, 0, 100);

  // --- Risk: lower realised volatility scores better (10%) ---
  const risk = ind.volatility1y === null ? 50 : clamp(100 - ind.volatility1y * 260, 0, 100);

  const score = round(
    trend * 0.35 + momentum * 0.25 + timing * 0.2 + valuation * 0.1 + risk * 0.1,
    1,
  );
  const rating = rateScore(score);

  // --- Confidence: how many independent measures agree with the verdict ---
  const bullish = [
    trend > 55,
    momentum > 55,
    timing > 55,
    (ind.macdHist ?? 0) > 0,
    ind.sma50 !== null && price > ind.sma50,
  ].filter(Boolean).length;
  const bearish = [
    trend < 45,
    momentum < 45,
    timing < 45,
    (ind.macdHist ?? 0) < 0,
    ind.sma50 !== null && price < ind.sma50,
  ].filter(Boolean).length;
  const directional = rating === "Buy" || rating === "Strong Buy";
  const opposing = rating === "Sell" || rating === "Reduce";
  const agreement = directional ? bullish : opposing ? bearish : 5 - Math.abs(bullish - bearish);
  const completeness = [
    ind.sma50,
    ind.sma200,
    ind.rsi14,
    ind.macdHist,
    ind.atrPct,
    ind.momentum3m,
    ind.volatility1y,
  ].filter((value) => value !== null).length;
  const confidence = round(clamp(48 + agreement * 5 + (completeness / 7) * 15, 40, 94), 0);

  // --- Trade levels from volatility, not from a fixed percentage ---
  const atrPct = ind.atrPct ?? 2;
  const stopDistance = Math.max(atrPct * 1.8, 3.5);
  const stop = price * (1 - stopDistance / 100);
  const target = price + (price - stop) * 1.9;
  const entryLow = price * (1 - (atrPct * 0.6) / 100);
  const entryHigh = price * (1 + (atrPct * 0.25) / 100);

  const reasons: string[] = [];
  const risks: string[] = [];

  if (ind.sma50 !== null) {
    const gap = ((price - ind.sma50) / ind.sma50) * 100;
    reasons.push(
      price >= ind.sma50
        ? `Price is ${gap.toFixed(1)}% above its 50-day average (${ind.sma50.toFixed(2)}), so the short-term trend is intact.`
        : `Price is ${Math.abs(gap).toFixed(1)}% below its 50-day average (${ind.sma50.toFixed(2)}), a short-term downtrend.`,
    );
  }
  if (ind.sma50 !== null && ind.sma200 !== null) {
    reasons.push(
      ind.sma50 >= ind.sma200
        ? `The 50-day average sits above the 200-day (golden-cross structure) — the medium-term trend is up.`
        : `The 50-day average sits below the 200-day (death-cross structure) — the medium-term trend is down.`,
    );
  }
  if (ind.momentum3m !== null) {
    reasons.push(
      `Three-month price change is ${pct(ind.momentum3m)} (one-month ${pct(ind.momentum1m ?? 0)}).`,
    );
  }
  if (ind.rsi14 !== null) {
    const reading =
      ind.rsi14 >= 70
        ? "overbought territory"
        : ind.rsi14 <= 30
          ? "oversold territory"
          : "a neutral band";
    reasons.push(`RSI(14) is ${ind.rsi14.toFixed(1)} — ${reading}.`);
  }
  if (ind.macdHist !== null) {
    reasons.push(
      ind.macdHist > 0
        ? "MACD histogram is positive, confirming upward momentum."
        : "MACD histogram is negative, confirming downward momentum.",
    );
  }
  if (ind.rangePosition !== null) {
    reasons.push(
      `Trading at ${ind.rangePosition.toFixed(0)}% of its 52-week range (${ind.low52?.toFixed(2)} – ${ind.high52?.toFixed(2)}).`,
    );
  }

  if (ind.rsi14 !== null && ind.rsi14 >= 70) {
    risks.push(
      "RSI above 70 means near-term pullback risk is elevated; stagger entries rather than buying in one block.",
    );
  }
  if (ind.rsi14 !== null && ind.rsi14 <= 30) {
    risks.push(
      "RSI below 30 can stay depressed in a downtrend — wait for a higher low before adding.",
    );
  }
  if (ind.volatility1y !== null && ind.volatility1y > 0.35) {
    risks.push(
      `Annualised volatility is high at ${(ind.volatility1y * 100).toFixed(0)}% — size the position smaller.`,
    );
  }
  if (ind.atrPct !== null) {
    risks.push(
      `Daily true range averages ${ind.atrPct.toFixed(1)}% of price, so the ${stopDistance.toFixed(1)}% stop is placed where noise alone will not trigger it.`,
    );
  }
  if (ind.sma200 !== null && price < ind.sma200) {
    risks.push(
      "Price is under the 200-day average — long-term holders should keep this below full weight.",
    );
  }
  if (risks.length === 0) {
    risks.push("No elevated risk flags from trend, momentum or volatility measures.");
  }

  return {
    rating,
    score,
    confidence,
    components: {
      trend: round(trend, 1),
      momentum: round(momentum, 1),
      timing: round(timing, 1),
      valuation: round(valuation, 1),
      risk: round(risk, 1),
    },
    entryLow: round(entryLow),
    entryHigh: round(entryHigh),
    target: round(target),
    stop: round(stop),
    riskReward: 1.9,
    reasons: reasons.slice(0, 4),
    risks: risks.slice(0, 3),
  };
}

export function ratingTone(rating: Rating): "positive" | "cautious" | "negative" {
  if (rating === "Strong Buy" || rating === "Buy") return "positive";
  if (rating === "Hold") return "cautious";
  return "negative";
}
