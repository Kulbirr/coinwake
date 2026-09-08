import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Signed percentage pill — green for gains, red for losses. */
export function Delta({
  value,
  className,
  size = "sm",
  arrow = true,
}: {
  value: number;
  className?: string;
  size?: "sm" | "md";
  arrow?: boolean;
}) {
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "num inline-flex items-center gap-0.5 rounded-md font-semibold tabular-nums",
        up ? "bg-profit/12 text-profit" : "bg-loss/12 text-loss",
        size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm",
        className,
      )}
    >
      {arrow && <Icon className={size === "sm" ? "size-3" : "size-3.5"} />}
      {formatPercent(value)}
    </span>
  );
}

/** Plain profit/loss coloured text. */
export function Signed({
  value,
  format,
  className,
}: {
  value: number;
  format: (v: number) => string;
  className?: string;
}) {
  return (
    <span className={cn("num", value >= 0 ? "text-profit" : "text-loss", className)}>
      {value > 0 ? "+" : ""}
      {format(value)}
    </span>
  );
}
