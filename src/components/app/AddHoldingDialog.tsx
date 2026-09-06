import { Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CoinLogo } from "@/components/app/CoinLogo";
import { CoinSearchDialog } from "@/components/app/CoinSearchDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice, formatUsd } from "@/lib/format";
import { useStore } from "@/lib/store";

const today = () => new Date().toISOString().slice(0, 10);

export function AddHoldingDialog({
  open,
  onOpenChange,
  coinId: initialCoinId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coinId?: string | undefined;
}) {
  const { coins, addHolding } = useStore();
  const [coinId, setCoinId] = useState(initialCoinId ?? "bitcoin");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(today);
  const [exchange, setExchange] = useState("");
  const [wallet, setWallet] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const coin = useMemo(() => coins.find((c) => c.id === coinId), [coins, coinId]);

  // Re-seed on open so a re-used dialog never shows a previous entry.
  useEffect(() => {
    if (!open) return;
    const next = initialCoinId ?? coinId;
    setCoinId(next);
    const seed = coins.find((c) => c.id === next);
    setQuantity("");
    setBuyPrice(seed ? String(Number(seed.price.toPrecision(6))) : "");
    setPurchaseDate(today());
    setExchange("");
    setWallet("");
    setNotes("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialCoinId]);

  const qty = Number(quantity) || 0;
  const price = Number(buyPrice) || 0;
  const invested = qty * price;
  const valid = Boolean(coin) && qty > 0 && price > 0 && Boolean(purchaseDate);

  const submit = async () => {
    if (!coin || !valid) return;
    setSaving(true);
    const saved = await addHolding({
      coinId: coin.id,
      quantity: qty,
      averageBuyPrice: price,
      purchaseDate,
      ...(exchange.trim() ? { exchange: exchange.trim() } : {}),
      ...(wallet.trim() ? { wallet: wallet.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });
    setSaving(false);
    // The store already showed why it failed (spec 35) — keep the dialog open on
    // the entry the user typed rather than confirming a save that didn't happen.
    if (!saved) return;
    toast.success(`Added ${qty} ${coin.symbol}`, {
      description: `${formatUsd(invested)} invested at ${formatPrice(price)}.`,
    });
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <Wallet className="size-5 text-primary" /> Add holding
            </DialogTitle>
            <DialogDescription>
              We'll track its value, profit and ROI against the live feed from here.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Coin</Label>
              <button
                onClick={() => setPickerOpen(true)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-input bg-surface/50 px-3 py-2.5 text-left transition-colors hover:bg-surface"
              >
                {coin ? (
                  <>
                    <CoinLogo coin={coin} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{coin.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {coin.symbol} · {formatPrice(coin.price)}
                      </div>
                    </div>
                    <span className="text-xs text-primary">Change</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Search coin…</span>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="hold-qty">Quantity</Label>
                <Input
                  id="hold-qty"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  className="num h-11"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.5"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hold-price">Avg buy price</Label>
                <Input
                  id="hold-price"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  className="num h-11"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder="61200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hold-date">Purchase date</Label>
              <Input
                id="hold-date"
                type="date"
                className="num h-11"
                value={purchaseDate}
                max={today()}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="hold-exchange">Exchange (optional)</Label>
                <Input
                  id="hold-exchange"
                  className="h-11"
                  value={exchange}
                  onChange={(e) => setExchange(e.target.value)}
                  placeholder="Coinbase"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hold-wallet">Wallet (optional)</Label>
                <Input
                  id="hold-wallet"
                  className="h-11"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  placeholder="Phantom"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hold-notes">Notes (optional)</Label>
              <Textarea
                id="hold-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Low cap moonshot"
              />
            </div>

            {invested > 0 && (
              <div className="rounded-xl border border-primary/25 bg-primary/[0.06] px-3.5 py-2.5 text-sm">
                <span className="text-muted-foreground">Total invested</span>
                <span className="num ml-2 font-semibold">{formatUsd(invested)}</span>
                {coin && (
                  <span className="num ml-2 text-xs text-muted-foreground">
                    · worth {formatUsd(qty * coin.price)} today
                  </span>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              className="h-11 w-full"
              disabled={!valid || saving}
              onClick={() => void submit()}
            >
              {saving ? "Adding…" : "Add to portfolio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CoinSearchDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(c) => {
          setCoinId(c.id);
          setBuyPrice(String(Number(c.price.toPrecision(6))));
        }}
        title="Pick a coin"
      />
    </>
  );
}
