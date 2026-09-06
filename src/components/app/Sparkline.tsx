import { useMemo } from "react";

import { useChart } from "@/lib/api/queries";
import type { CandlePoint } from "@/lib/api";
import { useStore } from "@/lib/store";

/**
 * Lightweight inline trend line for table rows and cards.
 *
 * Presentational on purpose: it takes points rather than fetching them, so the
 * screen decides how many charts to pull. A 50-row table asking for its own data
 * would be 50 cold chart requests, and the server would have to make 50 upstream
 * calls to fill them (spec 31) — so this component can't be the one to decide.
 */
export function Sparkline({
  points,
  loading = false,
  width = 96,
  height = 32,
  /** Distinguishes gradient ids when several sparklines share a page. */
  id,
}: {
  points: CandlePoint[] | undefined;
  loading?: boolean;
  width?: number;
  height?: number;
  id: string;
}) {
  const shape = useMemo(() => {
    const prices = (points ?? []).map((p) => p.price).filter((p) => Number.isFinite(p));
    if (prices.length < 2) return null;

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const span = max - min || max || 1;
    const coords = prices.map((price, i) => {
      const x = (i / (prices.length - 1)) * width;
      const y = height - ((price - min) / span) * (height - 2) - 1;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    const first = prices[0] ?? 0;
    const last = prices[prices.length - 1] ?? 0;
    return {
      path: `M${coords.join("L")}`,
      area: `M0,${height} L${coords.join("L")} L${width},${height} Z`,
      up: last >= first,
    };
  }, [points, width, height]);

  // No invented wiggle: an unknown series shows a flat rule, not a fake trend.
  if (!shape) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
        <line
          x1={0}
          x2={width}
          y1={height / 2}
          y2={height / 2}
          stroke="var(--border)"
          strokeWidth={1.5}
          strokeDasharray={loading ? "3 3" : undefined}
          className={loading ? "animate-pulse" : undefined}
        />
      </svg>
    );
  }

  const stroke = shape.up ? "var(--profit)" : "var(--loss)";
  const gradientId = `spark-${id}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={shape.area} fill={`url(#${gradientId})`} />
      <path d={shape.path} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The self-fetching variant, for a coin that isn't in the loaded market list.
 *
 * Prefers the 7-day series that already rides along on the market feed, and only
 * falls back to a chart request when the store has never seen the coin — a row of
 * five of these used to mean five cold upstream `market_chart` calls, which the
 * provider rate limits (spec 31). Screens rendering coins straight from the store
 * therefore cost nothing extra; pass `points` to `Sparkline` directly if you
 * already have them.
 */
export function CoinSparkline({
  coinId,
  width,
  height,
}: {
  coinId: string;
  width?: number;
  height?: number;
}) {
  const cached = useStore().getCoin(coinId)?.sparkline7d;
  const { data, isPending } = useChart(cached ? undefined : coinId, "7D");

  // The feed's series carries no timestamps, and Sparkline only reads `price`.
  const points = useMemo(
    () => (cached ? cached.map((price) => ({ t: 0, price })) : data),
    [cached, data],
  );

  return (
    <Sparkline
      points={points}
      loading={!cached && isPending}
      id={coinId}
      {...(width === undefined ? {} : { width })}
      {...(height === undefined ? {} : { height })}
    />
  );
}
