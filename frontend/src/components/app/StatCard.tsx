import type { ComponentType, ReactNode } from "react";

import { Delta } from "@/components/app/Delta";
import { cn } from "@/lib/utils";

/** Headline metric tile used across the dashboard and detail pages. */
export function StatCard({
  label,
  value,
  delta,
  sub,
  icon: Icon,
  tone = "neutral",
  className,
}: {
  label: string;
  value: ReactNode;
  delta?: number;
  sub?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  tone?: "neutral" | "profit" | "loss" | "warn" | "primary";
  className?: string;
}) {
  const toneRing = {
    neutral: "",
    profit: "border-profit/25",
    loss: "border-loss/25",
    warn: "border-warn/25",
    primary: "border-primary/30",
  }[tone];

  const toneText = {
    neutral: "text-foreground",
    profit: "text-profit",
    loss: "text-loss",
    warn: "text-warn",
    primary: "text-foreground",
  }[tone];

  const toneIcon = {
    neutral: "text-muted-foreground",
    profit: "text-profit",
    loss: "text-loss",
    warn: "text-warn",
    primary: "text-primary",
  }[tone];

  return (
    <div
      className={cn("glass relative overflow-hidden rounded-2xl p-4 md:p-5", toneRing, className)}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && <Icon className={cn("size-4 shrink-0", toneIcon)} />}
      </div>
      <div className={cn("num mt-2.5 text-xl font-semibold tracking-tight md:text-2xl", toneText)}>
        {value}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {delta !== undefined && <Delta value={delta} />}
        {sub && <span className="truncate text-xs text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}
