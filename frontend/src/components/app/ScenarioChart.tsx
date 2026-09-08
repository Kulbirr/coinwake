import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCompact, formatUsd } from "@/lib/format";

export interface ScenarioPoint {
  marketCap: number;
  value: number;
}

/**
 * Section 12 of the spec: portfolio value plotted against market cap so users
 * can *see* what each valuation is worth to them.
 */
export function ScenarioChart({
  points,
  currentMarketCap,
  currentValue,
  height = 280,
}: {
  points: ScenarioPoint[];
  currentMarketCap?: number;
  currentValue?: number;
  height?: number;
}) {
  if (points.length < 2) {
    return (
      <div
        style={{ height }}
        className="grid place-items-center rounded-xl border border-dashed border-border text-sm text-muted-foreground"
      >
        Add at least two scenarios to plot the curve.
      </div>
    );
  }

  const showCurrent =
    currentMarketCap !== undefined &&
    currentValue !== undefined &&
    currentMarketCap > 0 &&
    currentMarketCap >= (points[0]?.marketCap ?? 0) &&
    currentMarketCap <= (points[points.length - 1]?.marketCap ?? 0);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 12, right: 16, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="scenario-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--profit)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--profit)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="marketCap"
            type="number"
            scale="linear"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v: number) => formatCompact(v)}
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
            label={{
              value: "Market Cap",
              position: "insideBottom",
              offset: -2,
              fill: "var(--muted-foreground)",
              fontSize: 11,
            }}
          />
          <YAxis
            tickFormatter={(v: number) => formatCompact(v)}
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={68}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelFormatter={(v) => `Market cap ${formatCompact(Number(v))}`}
            formatter={(v: number) => [formatUsd(v), "Portfolio value"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--profit)"
            strokeWidth={2}
            fill="url(#scenario-grad)"
            dot={{ r: 3, fill: "var(--profit)", strokeWidth: 0 }}
            isAnimationActive={false}
          />
          {showCurrent && (
            <ReferenceDot
              x={currentMarketCap}
              y={currentValue}
              r={5}
              fill="var(--warn)"
              stroke="var(--background)"
              strokeWidth={2}
              label={{
                value: "you are here",
                position: "top",
                fill: "var(--warn)",
                fontSize: 10,
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
