import type { Exchange } from "./types";

const SYMBOLS: Record<string, string> = { SGD: "S$", USD: "US$", HKD: "HK$" };

export function currencySymbol(currency: string): string {
  return SYMBOLS[currency] ?? currency + " ";
}

export function formatMoney(value: number | null, currency: string, digits = 2): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${currencySymbol(currency)}${value.toLocaleString("en-SG", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function formatNumber(value: number | null, digits = 0): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toLocaleString("en-SG", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatPct(value: number | null, digits = 2): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function formatSigned(value: number | null, currency: string, digits = 2): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value >= 0 ? "+" : "−"}${currencySymbol(currency)}${Math.abs(value).toLocaleString(
    "en-SG",
    { minimumFractionDigits: digits, maximumFractionDigits: digits },
  )}`;
}

/** Converts a local-currency amount into SGD. */
export function toSgd(
  value: number,
  currency: string,
  fx: { usdSgd: number; hkdSgd: number },
): number {
  if (currency === "SGD") return value;
  if (currency === "USD") return value * fx.usdSgd;
  if (currency === "HKD") return value * fx.hkdSgd;
  return value;
}

export function formatSgd(value: number | null, digits = 2): string {
  return formatMoney(value, "SGD", digits);
}

export const toneClass = (value: number | null | undefined) =>
  value === null || value === undefined || !Number.isFinite(value)
    ? "text-muted-foreground"
    : value > 0
      ? "text-emerald-400"
      : value < 0
        ? "text-rose-400"
        : "text-muted-foreground";

const SESSIONS: Record<
  Exchange,
  { tz: string; open: number; close: number; lunch?: [number, number] }
> = {
  SGX: { tz: "Asia/Singapore", open: 9 * 60, close: 17 * 60 },
  US: { tz: "America/New_York", open: 9 * 60 + 30, close: 16 * 60 },
  HK: { tz: "Asia/Hong_Kong", open: 9 * 60 + 30, close: 16 * 60, lunch: [12 * 60, 13 * 60] },
};

function zonedClock(exchange: Exchange): { minutes: number; weekday: number; time: string } {
  const { tz } = SESSIONS[exchange];
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
    weekday: weekdayMap[get("weekday")] ?? 1,
    time: `${get("hour")}:${get("minute")}`,
  };
}

export function marketSession(exchange: Exchange): { open: boolean; label: string } {
  const { minutes, weekday, time } = zonedClock(exchange);
  const session = SESSIONS[exchange];
  const isWeekday = weekday >= 1 && weekday <= 5;
  const inLunch =
    session.lunch !== undefined && minutes >= session.lunch[0] && minutes < session.lunch[1];
  const open = isWeekday && minutes >= session.open && minutes < session.close && !inLunch;
  return { open, label: `${open ? "Open" : "Closed"} · ${time} local` };
}
