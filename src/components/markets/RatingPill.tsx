import type { Rating } from "@/lib/markets/types";
import { cn } from "@/lib/utils";

const STYLES: Record<Rating, string> = {
  "Strong Buy": "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  Buy: "bg-emerald-500/10 text-emerald-300/90 border-emerald-500/25",
  Hold: "bg-amber-500/10 text-amber-300 border-amber-500/25",
  Reduce: "bg-rose-500/10 text-rose-300 border-rose-500/25",
  Sell: "bg-rose-500/20 text-rose-300 border-rose-500/45",
};

export function RatingPill({ rating, className }: { rating: Rating; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]",
        STYLES[rating],
        className,
      )}
    >
      {rating}
    </span>
  );
}

export function ExchangeBadge({ exchange, className }: { exchange: string; className?: string }) {
  return (
    <span
      className={cn(
        "rounded border border-border/70 bg-secondary/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground",
        className,
      )}
    >
      {exchange}
    </span>
  );
}
