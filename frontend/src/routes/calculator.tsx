import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Calculator,
  ChevronsUpDown,
  Info,
  Loader2,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { CoinLogo } from "@/components/app/CoinLogo";
import { CoinSearchDialog } from "@/components/app/CoinSearchDialog";
import { HowCalculated } from "@/components/app/HowCalculated";
import { ScenarioChart } from "@/components/app/ScenarioChart";
import { StatCard } from "@/components/app/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppUi } from "@/lib/app-ui";
import type { Coin } from "@/lib/api";
import {
  formatCompact,
  formatNumber,
  formatPercent,
  formatPrice,
  formatSupply,
  formatUsd,
  isGain,
} from "@/lib/format";
import { useStore } from "@/lib/store";
import { useCalculator, type CalcMode } from "@/lib/use-calculator";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calculator")({
  validateSearch: (search: Record<string, unknown>): { coin?: string } => ({
    ...(typeof search["coin"] === "string" ? { coin: search["coin"] } : {}),
  }),
  component: CalculatorPage,
});

/** Section 11: one-tap market-cap scenarios. */
const QUICK_CAPS: Array<{ label: string; amount: number }> = [
  { label: "+1M", amount: 1e6 },
  { label: "+5M", amount: 5e6 },
  { label: "+10M", amount: 1e7 },
  { label: "+50M", amount: 5e7 },
  { label: "+100M", amount: 1e8 },
];

function CalculatorPage() {
  const { coin: coinParam } = Route.useSearch();
  const { holdings } = useStore();
  const { openAlertDialog } = useAppUi();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customCap, setCustomCap] = useState("");

  const calc = useCalculator(coinParam ? { coinId: coinParam, mode: "MARKET_CAP" } : {});

  const {
    fields,
    set,
    coin,
    selectCoin,
    scenarios,
    addScenario,
    removeScenario,
    scenarioFull,
    currentPrice,
    targetPrice,
    supply,
    supplyEstimated,
    supplyNote,
    costBasisNote,
    disclaimer,
    currentMarketCap,
    targetMarketCap,
    result,
    pending,
    error,
    hint,
  } = calc;

  /**
   * Prefill from an existing position so nobody re-types numbers we already
   * know (spec 28). Guarded by a ref so we only seed once per coin.
   */
  const seeded = useRef<string | null>(null);
  const prefill = (next: Coin) => {
    seeded.current = next.id;
    selectCoin(next);
    const holding = holdings.find((h) => h.coinId === next.id);
    if (holding) {
      set("quantity", String(holding.quantity));
      set("purchasePrice", String(holding.averageBuyPrice));
    }
  };

  useEffect(() => {
    if (!coinParam || seeded.current === coinParam) return;
    // `coin` resolves from the store when it's in the loaded market list, or from
    // a fetch when it isn't — either way, seed the targets once it arrives.
    if (coin && coin.id === coinParam) prefill(coin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinParam, coin]);

  const hasResult = (result?.investment ?? 0) > 0 && (targetPrice ?? 0) > 0;

  const addQuickCap = (amount: number) => {
    const base = targetMarketCap ?? currentMarketCap ?? 0;
    addScenario(Math.round(base + amount));
  };

  return (
    <AppShell
      title="Profit Calculator"
      subtitle="Work out what your bag is worth at any price — or any market cap — before you need it."
      actions={
        coin &&
        targetPrice !== undefined && (
          <Button
            variant="outline"
            onClick={() => openAlertDialog({ coin, defaultTargetPrice: targetPrice })}
          >
            <Bell className="size-4" /> Alert me at {formatPrice(targetPrice)}
          </Button>
        )
      }
    >
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Inputs */}
        <section className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Calculator className="size-4 text-primary" /> Your position
            {pending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
          </h2>

          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Coin</Label>
              <button
                onClick={() => setPickerOpen(true)}
                className="flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg border border-input bg-surface/50 px-3 transition-colors hover:bg-surface"
              >
                {coin ? (
                  <>
                    <CoinLogo coin={coin} size={26} />
                    <span className="font-medium">{coin.name}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {coin.symbol}
                    </Badge>
                    <span className="num ml-auto text-sm text-muted-foreground">
                      {formatPrice(coin.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {fields.coinId ? fields.coinId : "Search for a coin…"}
                  </span>
                )}
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground" htmlFor="calc-qty">
                  Coins held
                </Label>
                <Input
                  id="calc-qty"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  className="num h-11"
                  value={fields.quantity}
                  onChange={(e) => set("quantity", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground" htmlFor="calc-buy">
                  Avg buy price
                </Label>
                <Input
                  id="calc-buy"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  className="num h-11"
                  value={fields.purchasePrice}
                  onChange={(e) => set("purchasePrice", e.target.value)}
                  placeholder="optional"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground" htmlFor="calc-current">
                  Current price
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {fields.currentPrice ? "manual" : "live feed"}
                </span>
              </div>
              <Input
                id="calc-current"
                type="number"
                inputMode="decimal"
                step="any"
                className="num h-11"
                value={fields.currentPrice}
                onChange={(e) => set("currentPrice", e.target.value)}
                placeholder={coin ? String(coin.price) : "auto"}
              />
            </div>

            {/* Target: price or market cap */}
            <div className="rounded-xl border border-border bg-surface/40 p-3.5">
              <Tabs
                value={fields.mode}
                onValueChange={(v) => set("mode", v as CalcMode)}
                className="w-full"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="PRICE" className="flex-1">
                    Target price
                  </TabsTrigger>
                  <TabsTrigger value="MARKET_CAP" className="flex-1">
                    Target market cap
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="mt-3.5">
                {fields.mode === "PRICE" ? (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground" htmlFor="calc-target-price">
                      Target price
                    </Label>
                    <Input
                      id="calc-target-price"
                      type="number"
                      inputMode="decimal"
                      step="any"
                      className="num h-11"
                      value={fields.targetPrice}
                      onChange={(e) => set("targetPrice", e.target.value)}
                      placeholder="0.001"
                    />
                    {targetMarketCap !== undefined && (
                      <p className="num text-[11px] text-muted-foreground">
                        = {formatCompact(targetMarketCap)} market cap
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground" htmlFor="calc-target-cap">
                      Target market cap
                    </Label>
                    <Input
                      id="calc-target-cap"
                      type="number"
                      inputMode="decimal"
                      step="any"
                      className="num h-11"
                      value={fields.targetMarketCap}
                      onChange={(e) => set("targetMarketCap", e.target.value)}
                      placeholder="10,000,000"
                    />
                    <p className="num text-[11px] text-muted-foreground">
                      Implied price {formatPrice(targetPrice)} {coin && <>per {coin.symbol}</>}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Supply panel — spec 15. The override is optional everywhere: a target
              price never needs it, and a target market cap only needs it when the
              provider reports none. */}
          <div className="mt-4 rounded-xl border border-border bg-surface/40 p-3.5">
            <h3 className="text-sm font-semibold">Supply</h3>
            <dl className="mt-2.5 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Circulating", value: formatSupply(coin?.circulatingSupply) },
                { label: "Total", value: formatSupply(coin?.totalSupply) },
                { label: "Max", value: coin?.maxSupply ? formatSupply(coin.maxSupply) : "∞" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="rounded-lg border border-border bg-background/40 p-2"
                >
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="num mt-0.5 text-sm font-semibold">{row.value}</dd>
                </div>
              ))}
            </dl>

            {/* The server's own wording when it labelled the answer an estimate
                (spec 7) — never paraphrased into something softer. */}
            <p
              className={cn(
                "mt-2.5 flex gap-1.5 text-[11px]",
                supplyEstimated ? "text-warn" : "text-muted-foreground",
              )}
            >
              <Info className="mt-px size-3.5 shrink-0" />
              {supplyNote ??
                (supply !== undefined
                  ? `Using a circulating supply of ${formatSupply(supply)} — the correct denominator for market cap.`
                  : "No circulating supply reported for this coin. Enter one below to work in market caps.")}
            </p>

            <div className="mt-2.5 space-y-1.5">
              <Label className="text-xs text-muted-foreground" htmlFor="calc-supply">
                Circulating supply <span className="text-muted-foreground/70">(optional)</span>
              </Label>
              <Input
                id="calc-supply"
                type="number"
                inputMode="decimal"
                step="any"
                className="num h-10"
                value={fields.supplyOverride}
                onChange={(e) => set("supplyOverride", e.target.value)}
                placeholder={
                  coin?.circulatingSupply ? String(coin.circulatingSupply) : "e.g. 1000000000"
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Leave blank to use the reported supply. A number here overrides it and marks the
                result an estimate.
              </p>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2.5 text-sm text-warn">
              {error}
              {hint && <span className="mt-1 block text-warn/80">{hint}</span>}
            </p>
          )}
        </section>

        {/* Results */}
        <div className="space-y-5 lg:col-span-3">
          <section className="glass relative overflow-hidden rounded-2xl p-5">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(560px 260px at 80% 0%, oklch(0.62 0.19 268 / 0.16), transparent 70%)",
              }}
            />
            <div className="relative">
              <p className="text-sm text-muted-foreground md:text-base">
                Your{" "}
                <span className="num font-semibold text-foreground">
                  {formatUsd(result?.investment)}
                </span>{" "}
                investment would become{" "}
                <span className="num text-lg font-bold text-profit md:text-xl">
                  {formatUsd(result?.targetValue)}
                </span>
                {coin && fields.mode === "MARKET_CAP" && targetMarketCap !== undefined && (
                  <>
                    {" "}
                    at a{" "}
                    <span className="num text-foreground">
                      {formatCompact(targetMarketCap)}
                    </span>{" "}
                    market cap ({formatPrice(targetPrice)} per {coin.symbol})
                  </>
                )}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                <StatCard label="Initial Investment" value={formatUsd(result?.investment)} />
                <StatCard
                  label="Current Holdings Value"
                  value={formatUsd(result?.currentValue)}
                  sub={`@ ${formatPrice(currentPrice)}`}
                />
                <StatCard
                  label="Target Holdings Value"
                  value={formatUsd(result?.targetValue)}
                  tone="primary"
                  sub={`@ ${formatPrice(targetPrice)}`}
                />
                <StatCard
                  label="Profit"
                  value={`${isGain(result?.profit) ? "+" : ""}${formatUsd(result?.profit)}`}
                  tone={isGain(result?.profit) ? "profit" : "loss"}
                  sub="target − investment"
                />
                <StatCard
                  label="ROI"
                  value={formatPercent(result?.roi)}
                  tone={isGain(result?.roi) ? "profit" : "loss"}
                  sub="profit ÷ investment"
                />
                <StatCard
                  label="Multiple"
                  value={result?.multiple == null ? "—" : `${formatNumber(result.multiple, 2)}x`}
                  tone="warn"
                  sub="target ÷ investment"
                />
              </div>

              {/* Spec 7 — the server says why ROI is blank, so say exactly that. */}
              {costBasisNote && (
                <p className="mt-3 flex gap-1.5 text-[11px] text-warn">
                  <Info className="mt-px size-3.5 shrink-0" />
                  {costBasisNote}
                </p>
              )}

              <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="num rounded-full border border-border bg-surface/60 px-2.5 py-1">
                  Unrealised now:{" "}
                  <span className={isGain(result?.unrealizedProfit) ? "text-profit" : "text-loss"}>
                    {formatUsd(result?.unrealizedProfit)}
                  </span>
                </span>
                {currentMarketCap !== undefined && (
                  <span className="num rounded-full border border-border bg-surface/60 px-2.5 py-1">
                    Current cap {formatCompact(currentMarketCap)}
                  </span>
                )}
                {hasResult && coin && targetPrice !== undefined && (
                  <Button
                    size="sm"
                    className="ml-auto"
                    onClick={() => openAlertDialog({ coin, defaultTargetPrice: targetPrice })}
                  >
                    <Bell className="size-3.5" /> Wake me at {formatPrice(targetPrice)}
                  </Button>
                )}
              </div>

              <HowCalculated
                className="mt-4"
                rows={[
                  ...(fields.mode === "MARKET_CAP"
                    ? [
                        {
                          label: "Target Price (from market cap)",
                          formula: "Target Market Cap ÷ Circulating Supply",
                          result: `${formatCompact(targetMarketCap)} ÷ ${formatSupply(supply)} = ${formatPrice(targetPrice)}`,
                        },
                      ]
                    : []),
                  {
                    label: "Initial Investment",
                    formula: "Coins Held × Purchase Price",
                    result: formatUsd(result?.investment),
                  },
                  {
                    label: "Current Holdings Value",
                    formula: "Coins Held × Current Price",
                    result: formatUsd(result?.currentValue),
                  },
                  {
                    label: "Target Holdings Value",
                    formula: "Coins Held × Target Price",
                    result: formatUsd(result?.targetValue),
                  },
                  {
                    label: "Profit",
                    formula: "Target Holdings Value − Initial Investment",
                    result: formatUsd(result?.profit),
                  },
                  {
                    label: "ROI",
                    formula: "Profit ÷ Initial Investment × 100",
                    result: formatPercent(result?.roi),
                  },
                  {
                    label: "Multiple",
                    formula: "Target Holdings Value ÷ Initial Investment",
                    result: result?.multiple == null ? "—" : `${formatNumber(result.multiple, 2)}x`,
                  },
                ]}
              />
            </div>
          </section>

          {/* Scenario chart — spec 12 */}
          <section className="glass rounded-2xl p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <TrendingUp className="size-4 text-profit" /> Portfolio value vs market cap
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              X axis: market cap · Y axis: what your {coin?.symbol ?? "position"} is worth.
            </p>
            <div className="mt-4">
              <ScenarioChart
                points={scenarios.map((s) => ({ marketCap: s.marketCap, value: s.value }))}
                {...(currentMarketCap === undefined ? {} : { currentMarketCap })}
                {...(result?.currentValue === undefined
                  ? {}
                  : { currentValue: result.currentValue })}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Scenario table — spec 11 */}
      <section className="glass mt-5 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Market-cap scenarios</h2>
            <p className="text-xs text-muted-foreground">
              What each valuation is worth to you, at a supply of {formatSupply(supply)}
              {supplyEstimated && " (estimated)"}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {QUICK_CAPS.map((q) => (
              <Button
                key={q.label}
                size="sm"
                variant="outline"
                className="num"
                disabled={scenarioFull}
                onClick={() => addQuickCap(q.amount)}
              >
                {q.label}
              </Button>
            ))}
          </div>
        </div>

        <form
          className="mt-3.5 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const parsed = Number(customCap.replace(/,/g, ""));
            if (!Number.isFinite(parsed) || parsed <= 0) {
              toast.error("Enter a market cap greater than zero");
              return;
            }
            if (scenarioFull) {
              toast.error("That's as many scenarios as the table holds", {
                description: "Remove one to add another.",
              });
              return;
            }
            addScenario(parsed);
            setCustomCap("");
          }}
        >
          <Input
            type="number"
            inputMode="decimal"
            step="any"
            className="num h-10 max-w-56"
            value={customCap}
            onChange={(e) => setCustomCap(e.target.value)}
            placeholder="Custom market cap…"
            aria-label="Custom market cap"
          />
          <Button type="submit" variant="outline" className="h-10" disabled={scenarioFull}>
            <Plus className="size-4" /> Add scenario
          </Button>
        </form>

        {scenarios.length === 0 ? (
          <p className="mt-4 rounded-lg border border-border bg-surface/40 px-3 py-2.5 text-sm text-muted-foreground">
            {coin || fields.coinId
              ? "No scenarios to show yet. Add a market cap above, or enter a circulating supply if this coin doesn't report one."
              : "Pick a coin to see what each market cap is worth to you."}
          </p>
        ) : (
          <div className="mt-4 -mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Market cap</th>
                  <th className="py-2 pr-3 font-medium">Price</th>
                  <th className="py-2 pr-3 text-right font-medium">Your value</th>
                  <th className="py-2 pr-3 text-right font-medium">Profit</th>
                  <th className="py-2 pr-3 text-right font-medium">ROI</th>
                  <th className="py-2 pr-3 text-right font-medium">Multiple</th>
                  <th className="w-10 py-2" />
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s) => {
                  const reached = (currentMarketCap ?? 0) >= s.marketCap;
                  return (
                    <tr
                      key={s.marketCap}
                      className={cn(
                        "border-b border-border/60 transition-colors hover:bg-surface/50",
                        reached && "bg-profit/[0.06]",
                      )}
                    >
                      <td className="num py-2.5 pr-3 font-semibold">
                        {formatCompact(s.marketCap)}
                        {reached && (
                          <Badge
                            variant="outline"
                            className="ml-2 border-profit/40 bg-profit/10 text-[10px] text-profit"
                          >
                            passed
                          </Badge>
                        )}
                      </td>
                      <td className="num py-2.5 pr-3 text-muted-foreground">
                        {formatPrice(s.targetPrice)}
                      </td>
                      <td className="num py-2.5 pr-3 text-right font-semibold">
                        {formatUsd(s.value)}
                      </td>
                      <td
                        className={cn(
                          "num py-2.5 pr-3 text-right font-medium",
                          isGain(s.profit) ? "text-profit" : "text-loss",
                        )}
                      >
                        {isGain(s.profit) ? "+" : ""}
                        {formatUsd(s.profit)}
                      </td>
                      <td
                        className={cn(
                          "num py-2.5 pr-3 text-right",
                          isGain(s.roi) ? "text-profit" : "text-loss",
                        )}
                      >
                        {formatPercent(s.roi)}
                      </td>
                      <td className="num py-2.5 pr-3 text-right text-warn">
                        {s.multiple == null ? "—" : `${formatNumber(s.multiple, 2)}x`}
                      </td>
                      <td className="py-2.5 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-loss"
                          onClick={() => removeScenario(s.marketCap)}
                          aria-label={`Remove ${formatCompact(s.marketCap)} scenario`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Spec 43 — the server's disclaimer, verbatim. */}
        {disclaimer && (
          <p className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
            {disclaimer}
          </p>
        )}
      </section>

      <CoinSearchDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={prefill}
        title="Pick a coin"
      />
    </AppShell>
  );
}
