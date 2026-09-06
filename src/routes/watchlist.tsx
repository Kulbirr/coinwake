import { Link, createFileRoute } from "@tanstack/react-router";
import { Bell, Eye, Plus, Star, Target } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app/AppShell";
import { CoinLogo } from "@/components/app/CoinLogo";
import { CoinSearchDialog } from "@/components/app/CoinSearchDialog";
import { Delta } from "@/components/app/Delta";
import { PriceValue } from "@/components/app/PriceValue";
import { CoinSparkline } from "@/components/app/Sparkline";
import { Button } from "@/components/ui/button";
import { useAppUi } from "@/lib/app-ui";
import { formatCompact, formatPercent, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";
import { buildWatchlistRows } from "@/lib/watchlist";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/watchlist")({
  component: WatchlistPage,
});

function WatchlistPage() {
  const { watchlist, getCoin, alerts, toggleWatchlist } = useStore();
  const { openAlertDialog } = useAppUi();
  const [pickerOpen, setPickerOpen] = useState(false);

  const rows = useMemo(
    () => buildWatchlistRows(watchlist, getCoin, alerts),
    [watchlist, getCoin, alerts],
  );

  return (
    <AppShell
      title="Watchlist"
      subtitle="The coins you care about — live price, target and distance to go."
      actions={
        <Button onClick={() => setPickerOpen(true)}>
          <Plus className="size-4" /> Add coin
        </Button>
      }
    >
      {rows.length === 0 ? (
        <div className="glass rounded-2xl px-6 py-14 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-surface">
            <Eye className="size-5 text-muted-foreground" />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold">Your watchlist is empty</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            Add coins to keep an eye on their price, market cap and distance to your targets — all
            in one place.
          </p>
          <Button className="mt-5" onClick={() => setPickerOpen(true)}>
            <Plus className="size-4" /> Add coin
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <section className="glass hidden rounded-2xl p-5 lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Coin</th>
                    <th className="py-2 pr-3 font-medium">Price</th>
                    <th className="py-2 pr-3 font-medium">24h</th>
                    <th className="py-2 pr-3 font-medium">Market cap</th>
                    <th className="py-2 pr-3 font-medium">Volume</th>
                    <th className="py-2 pr-3 font-medium">Your target</th>
                    <th className="py-2 pr-3 font-medium">Distance</th>
                    <th className="py-2 pr-3 font-medium">7d</th>
                    <th className="w-24 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ coin, target, distance }) => (
                    <tr
                      key={coin.id}
                      className="border-b border-border/60 transition-colors hover:bg-surface/50"
                    >
                      <td className="py-3 pr-3">
                        <Link
                          to="/coin/$coinId"
                          params={{ coinId: coin.id }}
                          className="flex items-center gap-2.5 hover:text-primary"
                        >
                          <CoinLogo coin={coin} size={30} />
                          <span>
                            <span className="block font-medium">{coin.symbol}</span>
                            <span className="block text-xs text-muted-foreground">{coin.name}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 pr-3">
                        <PriceValue value={coin.price} className="text-sm font-medium" />
                      </td>
                      <td className="py-3 pr-3">
                        <Delta value={coin.change24h} arrow={false} />
                      </td>
                      <td className="num py-3 pr-3 text-muted-foreground">
                        {formatCompact(coin.marketCap)}
                      </td>
                      <td className="num py-3 pr-3 text-muted-foreground">
                        {formatCompact(coin.volume24h)}
                      </td>
                      <td className="num py-3 pr-3">
                        {target ? (
                          formatPrice(target.targetPrice)
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="num py-3 pr-3">
                        {distance === undefined ? (
                          <span className="text-muted-foreground">no target</span>
                        ) : (
                          <span className={distance >= 0 ? "text-profit" : "text-loss"}>
                            {formatPercent(distance)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <CoinSparkline coinId={coin.id} width={80} height={26} />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1">
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
                            variant="ghost"
                            size="icon"
                            className="size-8 text-warn"
                            aria-label={`Remove ${coin.symbol} from watchlist`}
                            onClick={() => toggleWatchlist(coin.id)}
                          >
                            <Star className="size-4 fill-warn" />
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
          <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {rows.map(({ coin, target, distance }) => (
              <div key={coin.id} className="glass rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Link to="/coin/$coinId" params={{ coinId: coin.id }}>
                    <CoinLogo coin={coin} size={38} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{coin.symbol}</div>
                    <div className="num text-xs text-muted-foreground">
                      {formatCompact(coin.marketCap)}
                    </div>
                  </div>
                  <div className="text-right">
                    <PriceValue value={coin.price} className="text-sm font-semibold" />
                    <div className="mt-0.5">
                      <Delta value={coin.change24h} arrow={false} />
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <CoinSparkline coinId={coin.id} width={100} height={30} />
                  <div className="ml-auto text-right text-xs">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <Target className="size-3" /> target
                    </div>
                    <div className="num font-medium">
                      {target ? formatPrice(target.targetPrice) : "—"}
                      {distance !== undefined && (
                        <span className={cn("ml-1.5", distance >= 0 ? "text-profit" : "text-loss")}>
                          {formatPercent(distance)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openAlertDialog({ coin })}
                  >
                    <Bell className="size-3.5" /> Set Alert
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-warn"
                    aria-label={`Remove ${coin.symbol} from watchlist`}
                    onClick={() => toggleWatchlist(coin.id)}
                  >
                    <Star className="size-4 fill-warn" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <CoinSearchDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(c) => toggleWatchlist(c.id)}
        title="Add to watchlist"
      />
    </AppShell>
  );
}
