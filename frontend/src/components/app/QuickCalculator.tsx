import { Link } from "@tanstack/react-router";
import { ArrowRight, Bell, Info, Sparkles } from "lucide-react";
import { useState } from "react";

import { CoinLogo } from "@/components/app/CoinLogo";
import { CoinSearchDialog } from "@/components/app/CoinSearchDialog";
import { HowCalculated } from "@/components/app/HowCalculated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Coin } from "@/lib/api";
import { useAppUi } from "@/lib/app-ui";
import {
  formatCompact,
  formatNumber,
  formatPercent,
  formatPrice,
  formatUsd,
  isGain,
} from "@/lib/format";
import { useStore } from "@/lib/store";
import { useCalculator } from "@/lib/use-calculator";
import { cn } from "@/lib/utils";

/**
 * Dashboard calculator widget — answers "what would my bag be worth?" without
 * leaving the page. Same server-side calculator as the full screen, so the two
 * can never disagree; this one just shows fewer of the answers.
 */
export function QuickCalculator() {
  const calc = useCalculator();
  const { holdings } = useStore();
  const { openAlertDialog } = useAppUi();
  const [pickerOpen, setPickerOpen] = useState(false);

  const {
    coin,
    fields,
    set,
    selectCoin,
    result,
    targetPrice,
    targetMarketCap,
    supplyEstimated,
    supplyNote,
    costBasisNote,
    error,
  } = calc;
  const hasResult = (result?.investment ?? 0) > 0 && (targetPrice ?? 0) > 0;

  /** Spec 28 — if this coin is already a position, don't make them retype it. */
  const prefill = (next: Coin) => {
    selectCoin(next);
    const holding = holdings.find((h) => h.coinId === next.id);
    if (holding) {
      set("quantity", String(holding.quantity));
      set("purchasePrice", String(holding.averageBuyPrice));
    }
  };

  return (
    <section className="glass relative overflow-hidden rounded-2xl p-5">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(500px 240px at 85% 0%, oklch(0.62 0.19 268 / 0.16), transparent 70%)",
        }}
      />
      <div className="relative flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Sparkles className="size-4 text-primary" /> Quick Profit Calculator
        </h2>
        <Link to="/calculator" className="text-xs text-primary hover:underline">
          Full calculator
        </Link>
      </div>

      <div className="relative mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Coin</Label>
          <button
            onClick={() => setPickerOpen(true)}
            className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-input bg-surface/50 px-2.5 transition-colors hover:bg-surface"
          >
            {coin ? (
              <>
                <CoinLogo coin={coin} size={22} />
                <span className="text-sm font-medium">{coin.symbol}</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Search…</span>
            )}
          </button>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground" htmlFor="qc-qty">
            Coins held
          </Label>
          <Input
            id="qc-qty"
            type="number"
            inputMode="decimal"
            step="any"
            className="num h-10"
            value={fields.quantity}
            onChange={(e) => set("quantity", e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground" htmlFor="qc-buy">
            Buy price
          </Label>
          <Input
            id="qc-buy"
            type="number"
            inputMode="decimal"
            step="any"
            className="num h-10"
            value={fields.purchasePrice}
            onChange={(e) => set("purchasePrice", e.target.value)}
            placeholder="optional"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground" htmlFor="qc-target">
              {fields.mode === "PRICE" ? "Target price" : "Target mcap"}
            </Label>
            <button
              onClick={() => set("mode", fields.mode === "PRICE" ? "MARKET_CAP" : "PRICE")}
              className="cursor-pointer text-[10px] font-medium text-primary hover:underline"
            >
              use {fields.mode === "PRICE" ? "mcap" : "price"}
            </button>
          </div>
          <Input
            id="qc-target"
            type="number"
            inputMode="decimal"
            step="any"
            className="num h-10"
            value={fields.mode === "PRICE" ? fields.targetPrice : fields.targetMarketCap}
            onChange={(e) =>
              set(fields.mode === "PRICE" ? "targetPrice" : "targetMarketCap", e.target.value)
            }
            placeholder={fields.mode === "PRICE" ? "0.001" : "10,000,000"}
          />
        </div>
      </div>

      <div className="relative mt-4 rounded-2xl border border-primary/25 bg-primary/[0.06] p-4">
        <p className="text-sm text-muted-foreground">
          Your{" "}
          <span className="num font-semibold text-foreground">{formatUsd(result?.investment)}</span>{" "}
          investment would become{" "}
          <span className="num font-semibold text-profit">{formatUsd(result?.targetValue)}</span>
          {coin && fields.mode === "MARKET_CAP" && targetMarketCap !== undefined && (
            <>
              {" "}
              at a {formatCompact(targetMarketCap)} market cap ({formatPrice(targetPrice)} per{" "}
              {coin.symbol})
            </>
          )}
        </p>

        <div className="mt-3.5 grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            { label: "Investment", value: formatUsd(result?.investment) },
            { label: "Current value", value: formatUsd(result?.currentValue) },
            { label: "Target value", value: formatUsd(result?.targetValue) },
            {
              label: "Profit",
              value: `${isGain(result?.profit) ? "+" : ""}${formatUsd(result?.profit)}`,
              tone: isGain(result?.profit) ? "text-profit" : "text-loss",
            },
            {
              label: "ROI",
              value: formatPercent(result?.roi),
              tone: isGain(result?.roi) ? "text-profit" : "text-loss",
            },
          ].map((cell) => (
            <div key={cell.label}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {cell.label}
              </div>
              <div className={cn("num mt-0.5 text-sm font-semibold", cell.tone)}>{cell.value}</div>
            </div>
          ))}
        </div>

        {hasResult && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {result?.multiple != null && (
              <span className="num rounded-full bg-warn/12 px-2.5 py-1 text-xs font-semibold text-warn">
                {formatNumber(result.multiple, 2)}x multiple
              </span>
            )}
            {coin && targetPrice !== undefined && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openAlertDialog({ coin, defaultTargetPrice: targetPrice })}
              >
                <Bell className="size-3.5" /> Alert me at {formatPrice(targetPrice)}
              </Button>
            )}
            <Button asChild size="sm" variant="ghost" className="ml-auto">
              <Link to="/calculator">
                Scenarios <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        )}

        {/* The server's words for an estimate or a missing cost basis (spec 7). */}
        {(supplyNote ?? costBasisNote) && (
          <p
            className={cn(
              "mt-3 flex gap-1.5 text-xs",
              supplyEstimated ? "text-warn" : "text-muted-foreground",
            )}
          >
            <Info className="mt-px size-3.5 shrink-0" />
            {supplyNote ?? costBasisNote}
          </p>
        )}

        {error && (
          <p className="mt-3 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn">
            {error}{" "}
            <Link to="/calculator" className="underline">
              Open the full calculator
            </Link>{" "}
            to enter a circulating supply.
          </p>
        )}
      </div>

      <HowCalculated
        className="relative mt-3"
        rows={[
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
        ]}
      />

      <CoinSearchDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={prefill}
        title="Pick a coin"
      />
    </section>
  );
}
