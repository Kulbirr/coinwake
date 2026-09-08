import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useChart } from "@/lib/api/queries";
import type { ChartRange, Coin } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export const CHART_RANGES: ChartRange[] = ["1H", "24H", "7D", "30D", "3M", "1Y"];

export function PriceChart({
  coin,
  range,
  alertLevels = [],
  height = 320,
}: {
  coin: Coin;
  range: ChartRange;
  alertLevels?: Array<{ price: number; label: string; tone: "up" | "down" }>;
  height?: number;
}) {
  const { data, isPending, isError } = useChart(coin.id, range);
  const points = data ?? [];

  // A chart with one point can't be drawn, and inventing the rest of the curve
  // would be presenting a guess as history.
  if (points.length < 2) {
    return (
      <div
        style={{ height }}
        className="flex w-full items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground"
      >
        {isPending
          ? "Loading price history…"
          : isError
            ? "Price history isn't available right now."
            : `No ${range} history for ${coin.symbol} yet.`}
      </div>
    );
  }

  const prices = points.map((d) => d.price);
  const levelPrices = alertLevels.map((a) => a.price);
  const min = Math.min(...prices, ...levelPrices);
  const max = Math.max(...prices, ...levelPrices);
  const pad = (max - min) * 0.12 || max * 0.05;
  const first = points[0];
  const last = points[points.length - 1];
  const up = first !== undefined && last !== undefined && last.price >= first.price;
  const stroke = up ? "var(--profit)" : "var(--loss)";

  const timeFmt = (t: number) => {
    const d = new Date(t);
    if (range === "1H" || range === "24H")
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${coin.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="t"
            tickFormatter={timeFmt}
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            minTickGap={40}
          />
          <YAxis
            domain={[min - pad, max + pad]}
            tickFormatter={(v: number) => formatPrice(v)}
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={78}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelFormatter={(v) => timeFmt(Number(v))}
            formatter={(v: number) => [formatPrice(v), coin.symbol]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#grad-${coin.id})`}
            isAnimationActive={false}
          />
          {alertLevels.map((level, i) => (
            <ReferenceLine
              key={`${level.price}-${i}`}
              y={level.price}
              stroke={level.tone === "up" ? "var(--warn)" : "var(--loss)"}
              strokeDasharray="6 5"
              label={{
                value: `${level.label} ${formatPrice(level.price)}`,
                position: "insideTopRight",
                fill: level.tone === "up" ? "var(--warn)" : "var(--loss)",
                fontSize: 11,
              }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
