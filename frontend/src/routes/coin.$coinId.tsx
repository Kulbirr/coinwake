import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Bell, Calculator, Droplets, Eye, Loader2, Plus, Star } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app/AppShell";
import { AlertCard } from "@/components/app/AlertCard";
import { CoinLogo } from "@/components/app/CoinLogo";
import { Delta } from "@/components/app/Delta";
import { CHART_RANGES, PriceChart } from "@/components/app/PriceChart";
import { PriceValue } from "@/components/app/PriceValue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppUi } from "@/lib/app-ui";
import type { ChartRange } from "@/lib/api";
import { queryError, useCoin } from "@/lib/api";
import { formatCompact, formatNumber, formatPrice, formatSupply, formatUsd } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/coin/$coinId")({
  component: CoinDetail,
});

function StatBox({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/50 p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="num mt-1 text-sm font-semibold md:text-base">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function CoinDetail() {
  const coinId = Route.useParams().coinId;
  const { getCoin, alerts, watchlist, toggleWatchlist, holdings } = useStore();
  const { openAlertDialog } = useAppUi();
  const [range, setRange] = useState<ChartRange>("7D");

  // Search reaches the whole provider index, not just the loaded market list, so
  // most coins you can navigate to were never in the store. Prefer the store's
  // copy when it has one — that one is kept live by the price socket — and ask
  // the server for anything else instead of calling it missing (spec 35).
  const cached = getCoin(coinId);
  const remote = useCoin(cached ? undefined : coinId);
  const coin = cached ?? remote.data;

  const coinAlerts = useMemo(() => alerts.filter((a) => a.coinId === coinId), [alerts, coinId]);

  const alertLevels = useMemo(
    () =>
      coinAlerts
        .filter((a) => a.status === "ACTIVE")
        // Only a price target maps to a horizontal line — a market-cap or
        // percentage alert has no price of its own to draw at.
        .flatMap((a) => {
          const price = a.targetPrice;
          if (price === undefined) return [];
          return [
            {
              price,
              label: a.name ?? (a.condition === "ABOVE" ? "Target" : "Stop"),
              tone: a.condition === "ABOVE" ? ("up" as const) : ("down" as const),
            },
          ];
        }),
    [coinAlerts],
  );

  const holding = holdings.find((h) => h.coinId === coinId);

  if (!coin) {
    if (remote.isLoading) {
      return (
        <AppShell>
          <div className="glass mx-auto flex max-w-md items-center justify-center gap-3 rounded-2xl p-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading {coinId}…
          </div>
        </AppShell>
      );
    }
    // The server's wording when it gave us one — it knows whether the id is
    // unknown or the market feed is simply down (spec 35).
    const failure = queryError(remote.error);
    return (
      <AppShell>
        <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center">
          <h1 className="font-display text-xl font-semibold">
            {failure ? "Couldn't load that coin" : "Coin not found"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {failure?.message ?? `We don't have data for "${coinId}".`}
          </p>
          {failure?.hint && <p className="mt-1 text-xs text-muted-foreground">{failure.hint}</p>}
          <div className="mt-5 flex justify-center gap-2">
            {failure && (
              <Button variant="outline" onClick={() => void remote.refetch()}>
                Try again
              </Button>
            )}
            <Button asChild>
              <Link to="/market">Browse market</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const onWatchlist = watchlist.includes(coin.id);
  const supplyPct = coin.maxSupply
    ? ((coin.circulatingSupply ?? 0) / coin.maxSupply) * 100
    : coin.totalSupply
      ? ((coin.circulatingSupply ?? 0) / coin.totalSupply) * 100
      : null;

  return (
    <AppShell>
      <Link
        to="/market"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Market
      </Link>

      {/* Header */}
      <div className="glass mt-4 rounded-2xl p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <CoinLogo coin={coin} size={56} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold">{coin.name}</h1>
                <Badge variant="secondary" className="text-xs">
                  {coin.symbol}
                </Badge>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Rank #{coin.rank}
                </Badge>
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <PriceValue value={coin.price} className="text-2xl font-bold md:text-3xl" />
                <Delta value={coin.change24h} size="md" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => openAlertDialog({ coin })}>
              <Bell className="size-4" /> Set Alert
            </Button>
            <Button asChild variant="outline">
              <Link to="/calculator" search={{ coin: coin.id }}>
                <Calculator className="size-4" /> Calculate Profit
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/portfolio" search={{ add: coin.id }}>
                <Plus className="size-4" /> Add to Portfolio
              </Link>
            </Button>
            <Button
              variant={onWatchlist ? "secondary" : "outline"}
              onClick={() => toggleWatchlist(coin.id)}
            >
              <Star className={cn("size-4", onWatchlist && "fill-warn text-warn")} />
              {onWatchlist ? "Watching" : "Watchlist"}
            </Button>
          </div>
        </div>

        {/* Market stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatBox label="Market Cap" value={formatCompact(coin.marketCap)} />
          <StatBox label="24h Volume" value={formatCompact(coin.volume24h)} />
          <StatBox
            label="Liquidity"
            value={coin.liquidity ? formatCompact(coin.liquidity) : "—"}
            {...(coin.liquidity ? {} : { hint: "not reported" })}
          />
          <StatBox
            label="24h Change"
            value={`${coin.change24h >= 0 ? "+" : ""}${coin.change24h.toFixed(2)}%`}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* Chart */}
        <section className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">Price Chart</h2>
              {alertLevels.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Dashed lines mark your {alertLevels.length} active alert
                  {alertLevels.length === 1 ? "" : "s"}.
                </p>
              )}
            </div>
            <div className="flex rounded-lg border border-border p-0.5">
              {CHART_RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    range === r
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <PriceChart coin={coin} range={range} alertLevels={alertLevels} height={340} />
          </div>
        </section>

        {/* Supply + your position */}
        <div className="space-y-5">
          <section className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <Droplets className="size-4 text-primary" />
              <h2 className="font-display text-lg font-semibold">Supply</h2>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Circulating</span>
                <span className="num font-medium">{formatSupply(coin.circulatingSupply)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="num font-medium">{formatSupply(coin.totalSupply)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Max</span>
                <span className="num font-medium">
                  {coin.maxSupply ? formatSupply(coin.maxSupply) : "∞"}
                </span>
              </div>
              {supplyPct !== null && (
                <div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${Math.min(supplyPct, 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {supplyPct.toFixed(1)}% of {coin.maxSupply ? "max" : "total"} in circulation
                  </div>
                </div>
              )}
            </div>
          </section>

          {holding && (
            <section className="glass rounded-2xl p-5">
              <h2 className="font-display text-lg font-semibold">Your Position</h2>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Holdings</span>
                  <span className="num font-medium">
                    {formatNumber(holding.quantity)} {coin.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Value</span>
                  <span className="num font-medium">
                    {formatUsd(holding.quantity * coin.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg buy</span>
                  <span className="num font-medium">{formatPrice(holding.averageBuyPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P/L</span>
                  <span
                    className={cn(
                      "num font-medium",
                      coin.price >= holding.averageBuyPrice ? "text-profit" : "text-loss",
                    )}
                  >
                    {formatUsd((coin.price - holding.averageBuyPrice) * holding.quantity)}
                  </span>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Alerts for this coin */}
      <section className="mt-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            Alerts for {coin.symbol}
            {coinAlerts.length > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">({coinAlerts.length})</span>
            )}
          </h2>
          <Button size="sm" variant="outline" onClick={() => openAlertDialog({ coin })}>
            <Plus className="size-4" /> Add alert
          </Button>
        </div>
        {coinAlerts.length === 0 ? (
          <div className="glass mt-3 rounded-2xl p-6 text-center text-sm text-muted-foreground">
            <Eye className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-2">
              No alerts on {coin.symbol} yet. Set one and we'll watch it for you — even at 3am.
            </p>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {coinAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} coin={coin} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
