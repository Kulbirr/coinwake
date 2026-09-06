import { useEffect, useRef, useState } from "react";

import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Live price that briefly flashes green/red whenever the feed moves it. */
export function PriceValue({
  value,
  className,
  format = formatPrice,
}: {
  value: number;
  className?: string;
  format?: (v: number) => string;
}) {
  const previous = useRef(value);
  const [direction, setDirection] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (value === previous.current) return undefined;
    setDirection(value > previous.current ? "up" : "down");
    previous.current = value;
    const timer = setTimeout(() => setDirection(null), 700);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <span
      className={cn(
        "num rounded-sm px-1 -mx-1 transition-colors",
        direction === "up" && "flash-up text-profit",
        direction === "down" && "flash-down text-loss",
        className,
      )}
    >
      {format(value)}
    </span>
  );
}
