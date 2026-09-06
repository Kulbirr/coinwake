import { Link, createFileRoute } from "@tanstack/react-router";
import { Bell, Calculator, Coins, Plus, Trash2, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AddHoldingDialog } from "@/components/app/AddHoldingDialog";
import { AppShell } from "@/components/app/AppShell";
import { CoinLogo } from "@/components/app/CoinLogo";
import { Delta, Signed } from "@/components/app/Delta";
import { PriceValue } from "@/components/app/PriceValue";
import { CoinSparkline } from "@/components/app/Sparkline";
import { StatCard } from "@/components/app/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppUi } from "@/lib/app-ui";
import { formatNumber, formatPercent, formatPrice, formatUsd } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portfolio")({
  validateSearch: (search: Record<string, unknown>): { add?: string } => ({
    ...(typeof search["add"] === "string" ? { add: search["add"] } : {}),
  }),
  component: Portfolio,
});

function Portfolio() {
  const { add } = Route.useSearch();
  const { portfolio, removeHolding } = useStore();
  const { openAlertDialog } = useAppUi();
  const [addOpen, setAddOpen] = useState(false);
  const [addCoinId, setAddCoinId] = useState<string | undefined>(undefined);

  /** Arriving from "Add to Portfolio" on a coin page opens the form pre-filled. */
  useEffect(() => {
    if (!add) return;
    setAddCoinId(add);
    setAddOpen(true);
  }, [add]);

  const rows = useMemo(
    () => portfolio.rows.slice().sort((a, b) => b.value - a.value),
    [portfolio.rows],
  );

  const best = rows.reduce<(typeof rows)[number] | undefined>(
    (top, row) => (!top || row.roi > top.roi ? row : top),
    undefined,
  );

  return (
    <AppShell
      title="My Portfolio"
      subtitle="Live value, profit and ROI across every position you hold."
      actions={
        <Button
          onClick={() => {
            setAddCoinId(undefined);
            setAddOpen(true);
          }}
        >
          <Plus className="size-4" /> Add holding
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Portfolio Value"
          value={formatUsd(portfolio.value)}
          delta={portfolio.roi}
          icon={Wallet}
          tone="primary"
          sub={`${rows.length} ${rows.length === 1 ? "position" : "positions"}`}
        />
        <StatCard
          label="Total Invested"
          value={formatUsd(portfolio.invested)}
          icon={Coins}
          sub="cost basis"
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
          sub={best?.coin ? `best: ${best.coin.symbol} ${formatPercent(best.roi)}` : "since entry"}
        />
      </div>

      {rows.length === 0 ? (
        <div className="glass mt-5 rounded-2xl px-6 py-14 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-surface">
            <Wallet className="size-5 text-muted-foreground" />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold">No holdings yet</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            Add your first position and we'll track its value, profit and ROI against the live
            market — then wake you when it hits your target.
          </p>
          <Button
            className="mt-5"
            onClick={() => {
              setAddCoinId(undefined);
              setAddOpen(true);
            }}
          >
            <Plus className="size-4" /> Add holding
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <section className="glass mt-5 hidden rounded-2xl p-5 lg:block">
            <h2 className="font-display text-lg font-semibold">Positions</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Coin</th>
                    <th className="py-2 pr-3 font-medium">Holdings</th>
                    <th className="py-2 pr-3 font-medium">Avg buy</th>
                    <th className="py-2 pr-3 font-medium">Price</th>
                    <th className="py-2 pr-3 font-medium">24h</th>
                    <th className="py-2 pr-3 text-right font-medium">Invested</th>
                    <th className="py-2 pr-3 text-right font-medium">Value</th>
                    <th className="py-2 pr-3 text-right font-medium">Profit</th>
                    <th className="py-2 pr-3 text-right font-medium">ROI</th>
                    <th className="w-28 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ holding, coin, value, invested, profit, roi }) => (
                    <tr
                      key={holding.id}
                      className="border-b border-border/60 transition-colors hover:bg-surface/50"
                    >
                      <td className="py-3 pr-3">
                        {coin ? (
                          <Link
                            to="/coin/$coinId"
                            params={{ coinId: coin.id }}
                            className="flex items-center gap-2.5 hover:text-primary"
                          >
                            <CoinLogo coin={coin} size={30} />
                            <span>
                              <span className="block font-medium">{coin.symbol}</span>
                              <span className="block text-xs text-muted-foreground">
                                {coin.name}
                              </span>
                            </span>
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">{holding.coinId}</span>
                        )}
                      </td>
                      <td className="num py-3 pr-3">{formatNumber(holding.quantity, 6)}</td>
                      <td className="num py-3 pr-3 text-muted-foreground">
                        {formatPrice(holding.averageBuyPrice)}
                      </td>
                      <td className="py-3 pr-3">
                        {coin ? <PriceValue value={coin.price} className="text-sm" /> : "—"}
                      </td>
                      <td className="py-3 pr-3">
                        {coin && <Delta value={coin.change24h} arrow={false} />}
                      </td>
                      <td className="num py-3 pr-3 text-right text-muted-foreground">
                        {formatUsd(invested)}
                      </td>
                      <td className="num py-3 pr-3 text-right font-semibold">{formatUsd(value)}</td>
                      <td
                        className={cn(
                          "num py-3 pr-3 text-right font-medium",
                          profit >= 0 ? "text-profit" : "text-loss",
                        )}
                      >
                        {profit >= 0 ? "+" : ""}
                        {formatUsd(profit)}
                      </td>
                      <td
                        className={cn(
                          "num py-3 pr-3 text-right",
                          roi >= 0 ? "text-profit" : "text-loss",
                        )}
                      >
                        {formatPercent(roi)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1">
                          {coin && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                aria-label={`Set alert for ${coin.symbol}`}
                                onClick={() => openAlertDialog({ coin })}
                              >
                                <Bell className="size-4" />
                              </Button>
                              <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                aria-label={`Calculate target for ${coin.symbol}`}
                              >
                                <Link to="/calculator" search={{ coin: coin.id }}>
                                  <Calculator className="size-4" />
                                </Link>
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-loss"
                            aria-label="Remove holding"
                            onClick={() => {
                              removeHolding(holding.id);
                              toast.success("Holding removed");
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Mobile cards */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:hidden">
            {rows.map(({ holding, coin, value, invested, profit, roi }) => (
              <div key={holding.id} className="glass rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  {coin ? (
                    <Link to="/coin/$coinId" params={{ coinId: coin.id }}>
                      <CoinLogo coin={coin} size={40} />
                    </Link>
                  ) : (
                    <div className="size-10 rounded-full bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{coin?.symbol ?? holding.coinId}</span>
                      {coin && <Delta value={coin.change24h} arrow={false} />}
                    </div>
                    <div className="num text-xs text-muted-foreground">
                      {formatNumber(holding.quantity, 6)} @ {formatPrice(holding.averageBuyPrice)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="num font-semibold">{formatUsd(value)}</div>
                    <div className={cn("num text-xs", profit >= 0 ? "text-profit" : "text-loss")}>
                      {profit >= 0 ? "+" : ""}
                      {formatUsd(profit)} · {formatPercent(roi)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  {coin && <CoinSparkline coinId={coin.id} width={96} height={28} />}
                  <div className="num ml-auto text-right text-xs text-muted-foreground">
                    invested {formatUsd(invested)}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {holding.exchange && <Badge variant="secondary">{holding.exchange}</Badge>}
                  {holding.wallet && <Badge variant="secondary">{holding.wallet}</Badge>}
                  <span className="num">bought {holding.purchaseDate}</span>
                </div>
                {holding.notes && (
                  <p className="mt-2 text-xs italic text-muted-foreground">{holding.notes}</p>
                )}

                <div className="mt-3 flex gap-2">
                  {coin && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => openAlertDialog({ coin })}
                      >
                        <Bell className="size-3.5" /> Set Alert
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link to="/calculator" search={{ coin: coin.id }}>
                          <Calculator className="size-3.5" /> Calculate Target
                        </Link>
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0 text-muted-foreground hover:text-loss"
                    aria-label="Remove holding"
                    onClick={() => {
                      removeHolding(holding.id);
                      toast.success("Holding removed");
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AddHoldingDialog open={addOpen} onOpenChange={setAddOpen} coinId={addCoinId} />
    </AppShell>
  );
}
