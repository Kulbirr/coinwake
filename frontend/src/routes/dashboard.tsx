import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Bell, Coins, Plus, TrendingUp, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app/AppShell";
import { CoinLogo } from "@/components/app/CoinLogo";
import { Delta, Signed } from "@/components/app/Delta";
import { PriceValue } from "@/components/app/PriceValue";
import { QuickCalculator } from "@/components/app/QuickCalculator";
import { CoinSparkline } from "@/components/app/Sparkline";
import { StatCard } from "@/components/app/StatCard";
import { AlertProgressBar } from "@/components/app/AlertCard";
import { Button } from "@/components/ui/button";
import { useAppUi } from "@/lib/app-ui";
import { useAlertProgress } from "@/lib/api";
import type { AlertProgress } from "@/lib/api";
import { alertConditionLabel, alertSubject } from "@/lib/alert-display";
import { formatCompact, formatPercent, formatUsd } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { portfolio, alerts, coins, watchlist, getCoin } = useStore();
  const { data: progressRows } = useAlertProgress();
  const { openAlertDialog } = useAppUi();

  /** Server-computed progress, by alert id (spec 30). */
  const progressById = useMemo(() => {
    const map = new Map<string, AlertProgress>();
    for (const row of progressRows ?? []) map.set(row.alertId, row);
    return map;
  }, [progressRows]);

  const activeAlerts = useMemo(
    () => alerts.filter((a) => a.status === "ACTIVE").slice(0, 4),
    [alerts],
  );

  const topHoldings = useMemo(
    () =>
      portfolio.rows
        .slice()
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [portfolio.rows],
  );

  const movers = useMemo(
    () =>
      coins
        .slice()
        .sort((a, b) => b.change24h - a.change24h)
        .slice(0, 5),
    [coins],
  );

  return (
    <AppShell
      title="Dashboard"
      subtitle="Set your target. Go live your life. We'll wake you up when crypto gets there."
      actions={
        <>
          <Button variant="outline" asChild>
            <Link to="/portfolio">
              <Wallet className="size-4" /> Portfolio
            </Link>
          </Button>
          <Button onClick={() => openAlertDialog()}>
            <Plus className="size-4" /> New alert
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Portfolio Value"
          value={formatUsd(portfolio.value)}
          delta={portfolio.roi}
          icon={Wallet}
          tone="primary"
          sub="all holdings"
        />
        <StatCard
          label="Total Invested"
          value={formatUsd(portfolio.invested)}
          icon={Coins}
          sub={`${portfolio.rows.length} positions`}
        />
        <StatCard
          label="Total Profit"
          value={<Signed value={portfolio.profit} format={(v) => formatUsd(v)} />}
          icon={TrendingUp}
          tone={portfolio.profit >= 0 ? "profit" : "loss"}
          sub="unrealised"
        />
        <StatCard
          label="ROI"
          value={
            <span className={portfolio.roi >= 0 ? "text-profit" : "text-loss"}>
              {formatPercent(portfolio.roi)}
            </span>
          }
          icon={TrendingUp}
          tone={portfolio.roi >= 0 ? "profit" : "loss"}
          sub="since entry"
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <QuickCalculator />
        </div>

        {/* Active alerts */}
        <section className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Bell className="size-4 text-primary" />
              Active Alerts
            </h2>
            <span className="rounded-full bg-profit/12 px-2.5 py-0.5 text-xs font-semibold text-profit">
              🔔 {alerts.filter((a) => a.status === "ACTIVE").length} Active
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {activeAlerts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No active alerts yet. Create one and we'll watch the market for you.
              </p>
            )}
            {activeAlerts.map((alert) => {
              const coin = alert.coinId ? (getCoin(alert.coinId) ?? null) : null;
              return (
                <div key={alert.id}>
                  <div className="flex items-center gap-2">
                    {coin ? <CoinLogo coin={coin} size={24} /> : <Bell className="size-5" />}
                    <span className="text-sm font-medium">
                      {alertSubject(alert, coin)} {alertConditionLabel(alert)}
                    </span>
                    {alert.name && (
                      <span className="ml-auto truncate text-xs text-muted-foreground">
                        {alert.name}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <AlertProgressBar alert={alert} progress={progressById.get(alert.id)} />
                  </div>
                </div>
              );
            })}
          </div>

          <Button asChild variant="outline" size="sm" className="mt-4 w-full">
            <Link to="/alerts">
              Manage alerts <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Top holdings */}
        <section className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Top Holdings</h2>
            <Link to="/portfolio" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-1">
            {topHoldings.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No holdings yet — add your first position from the portfolio page.
              </p>
            )}
            {topHoldings.map(({ holding, coin, value }) => {
              if (!coin) return null;
              const share = portfolio.value ? (value / portfolio.value) * 100 : 0;
              return (
                <Link
                  key={holding.id}
                  to="/coin/$coinId"
                  params={{ coinId: coin.id }}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface/60"
                >
                  <CoinLogo coin={coin} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{coin.symbol}</div>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="num text-sm font-semibold">{formatUsd(value)}</div>
                    <div className="num text-xs text-muted-foreground">{share.toFixed(1)}%</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Movers */}
        <section className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Top Movers</h2>
            <Link to="/market" className="text-xs text-primary hover:underline">
              Market
            </Link>
          </div>
          <div className="mt-4 space-y-1">
            {movers.map((coin) => (
              <Link
                key={coin.id}
                to="/coin/$coinId"
                params={{ coinId: coin.id }}
                className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface/60"
              >
                <CoinLogo coin={coin} size={32} />
                <div className="min-w-0">
                  <div className="text-sm font-medium">{coin.symbol}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCompact(coin.marketCap)}
                  </div>
                </div>
                <CoinSparkline coinId={coin.id} width={70} height={26} />
                <div className="ml-auto text-right">
                  <PriceValue value={coin.price} className="text-sm font-semibold" />
                  <div className="mt-0.5">
                    <Delta value={coin.change24h} arrow={false} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {watchlist.length > 0 && (
        <section className="glass mt-5 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Watchlist</h2>
            <Link to="/watchlist" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {watchlist.slice(0, 4).map((id) => {
              const coin = getCoin(id);
              if (!coin) return null;
              return (
                <Link
                  key={id}
                  to="/coin/$coinId"
                  params={{ coinId: id }}
                  className="rounded-xl border border-border bg-surface/50 p-3 transition-colors hover:bg-surface"
                >
                  <div className="flex items-center gap-2">
                    <CoinLogo coin={coin} size={28} />
                    <span className="text-sm font-medium">{coin.symbol}</span>
                    <Delta value={coin.change24h} arrow={false} className="ml-auto" />
                  </div>
                  <PriceValue value={coin.price} className="mt-2 block text-base font-semibold" />
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </AppShell>
  );
}
