import { ArrowDown, ArrowUp, Bell, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CoinLogo } from "@/components/app/CoinLogo";
import { CoinSearchDialog } from "@/components/app/CoinSearchDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { alarmEngine, requestBrowserNotifications } from "@/lib/alarm";
import { priceFromMarketCap } from "@/lib/calc";
import type { AlertCondition, AlertInput, Coin } from "@/lib/api";
import { formatCompact, formatPercent, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Mirrors the three coin-scoped `AlertInput` kinds the server accepts. */
type TargetMode = "PRICE" | "MARKET_CAP" | "PERCENT";

const MODES: Array<{ value: TargetMode; label: string }> = [
  { value: "PRICE", label: "Price" },
  { value: "MARKET_CAP", label: "Market cap" },
  { value: "PERCENT", label: "% move" },
];

export function CreateAlertDialog({
  open,
  onOpenChange,
  coin: initialCoin,
  defaultTargetPrice,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coin?: Coin | undefined;
  defaultTargetPrice?: number | undefined;
}) {
  const { coins, addAlert, alarmSoundEnabled, setAlarmSoundEnabled } = useStore();
  const [coinId, setCoinId] = useState(initialCoin?.id ?? "solana");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mode, setMode] = useState<TargetMode>("PRICE");
  const [condition, setCondition] = useState<AlertCondition>("ABOVE");
  const [target, setTarget] = useState("");
  const [marketCapTarget, setMarketCapTarget] = useState("");
  const [percentTarget, setPercentTarget] = useState("");
  const [name, setName] = useState("");
  const [repeat, setRepeat] = useState<"ONCE" | "RECURRING">("ONCE");
  const [cooldown, setCooldown] = useState("5");
  const [notify, setNotify] = useState({ browser: true, alarm: true, push: false });
  const [sound, setSound] = useState<"default" | "gentle" | "urgent" | "retro" | "chill" | "loud">("default");
  const [saving, setSaving] = useState(false);

  const coin = useMemo(() => coins.find((c) => c.id === coinId), [coins, coinId]);

  // Re-seed the form each time the dialog opens so it never shows stale input.
  useEffect(() => {
    if (!open) return;
    const next = initialCoin?.id ?? coinId;
    setCoinId(next);
    const seed = coins.find((c) => c.id === next);
    const suggested = defaultTargetPrice ?? (seed ? seed.price * 1.25 : 0);
    setTarget(suggested ? String(Number(suggested.toPrecision(6))) : "");
    setMarketCapTarget("");
    setPercentTarget("");
    setMode("PRICE");
    setCondition("ABOVE");
    setName("");
    setRepeat("ONCE");
    setCooldown("5");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialCoin?.id, defaultTargetPrice]);

  const supply = coin?.circulatingSupply ?? 0;

  /**
   * The price each mode implies, for the "x% away" hint. The server does its own
   * conversion when it evaluates the alert (spec 30) — this is display only.
   */
  const impliedPrice = (() => {
    if (mode === "PRICE") return Number(target) || 0;
    if (mode === "MARKET_CAP") return priceFromMarketCap(Number(marketCapTarget) || 0, supply);
    const pct = Number(percentTarget) || 0;
    return coin ? coin.price * (1 + pct / 100) : 0;
  })();

  const distance = coin && coin.price ? ((impliedPrice - coin.price) / coin.price) * 100 : 0;
  const valid =
    Boolean(coin) &&
    (mode === "PERCENT" ? Number(percentTarget) !== 0 && !saving : impliedPrice > 0 && !saving);

  const submit = async () => {
    if (!coin || !valid) return;
    if (notify.alarm && !alarmSoundEnabled) {
      // Creating an alarm alert is a user gesture — the only moment we can
      // legally unlock audio, so take it.
      const unlocked = await alarmEngine.unlock();
      if (unlocked) setAlarmSoundEnabled(true);
    }
    if (notify.browser || notify.push) await requestBrowserNotifications();

    const shared = {
      coinId: coin.id,
      ...(name.trim() ? { name: name.trim() } : {}),
      condition,
      repeat,
      cooldownMinutes: Number(cooldown) || 5,
      notify,
    };
    const input: AlertInput =
      mode === "MARKET_CAP"
        ? { ...shared, kind: "MARKET_CAP", targetMarketCap: Number(marketCapTarget) }
        : mode === "PERCENT"
          ? { ...shared, kind: "PERCENT", targetPercent: Number(percentTarget) }
          : { ...shared, kind: "PRICE", targetPrice: Number(target) };

    // Include sound for alarm notifications
    if (notify.alarm) {
      (input as any).sound = sound;
    }

    setSaving(true);
    const saved = await addAlert(input);
    setSaving(false);
    // The store already surfaced the server's message on failure (spec 35), so
    // only a real save gets a confirmation — and the dialog stays open to fix.
    if (!saved) return;
    toast.success(`Alert created for ${coin.symbol}`, {
      description:
        mode === "PERCENT"
          ? `We'll wake you on a ${formatPercent(Number(percentTarget))} move.`
          : `We'll wake you at ${formatPrice(impliedPrice)}.`,
    });
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <Bell className="size-5 text-primary" /> Create alert
            </DialogTitle>
            <DialogDescription>
              Set your target. Go live your life. We'll wake you up when crypto gets there.
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

            <div className="space-y-1.5">
              <Label>Condition</Label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: "ABOVE", label: "Rises to", icon: ArrowUp },
                    { value: "BELOW", label: "Falls to", icon: ArrowDown },
                  ] as const
                ).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setCondition(value)}
                    className={cn(
                      "flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                      condition === value
                        ? value === "ABOVE"
                          ? "border-profit/50 bg-profit/12 text-profit"
                          : "border-loss/50 bg-loss/12 text-loss"
                        : "border-input text-muted-foreground hover:bg-surface",
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Target</Label>
                <div className="flex rounded-lg border border-input p-0.5">
                  {MODES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setMode(value)}
                      disabled={value === "MARKET_CAP" && !supply}
                      className={cn(
                        "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                        mode === value
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {mode === "PRICE" ? (
                <Input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="250"
                  className="num h-11 text-base"
                />
              ) : mode === "PERCENT" ? (
                <>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={percentTarget}
                    onChange={(e) => setPercentTarget(e.target.value)}
                    placeholder="10"
                    className="num h-11 text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    Measured from the price when you save this alert
                    {coin ? ` (${formatPrice(coin.price)} now)` : ""} —{" "}
                    <span className="text-foreground">{formatPrice(impliedPrice)}</span> at today's
                    price.
                  </p>
                </>
              ) : (
                <>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={marketCapTarget}
                    onChange={(e) => setMarketCapTarget(e.target.value)}
                    placeholder="10000000"
                    className="num h-11 text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCompact(Number(marketCapTarget) || 0)} ÷ {supply.toLocaleString("en-US")}{" "}
                    circulating ={" "}
                    <span className="text-foreground">{formatPrice(impliedPrice)}</span>
                  </p>
                </>
              )}
              {coin && valid && mode !== "PERCENT" && (
                <p className="text-xs text-muted-foreground">
                  {formatPrice(coin.price)} now ·{" "}
                  <span className={distance >= 0 ? "text-profit" : "text-loss"}>
                    {formatPercent(Math.abs(distance))} {distance >= 0 ? "away up" : "away down"}
                  </span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="alert-name">Alert name (optional)</Label>
              <Input
                id="alert-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First Take Profit"
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Repeat</Label>
                <Select value={repeat} onValueChange={(v) => setRepeat(v as "ONCE" | "RECURRING")}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONCE">One-time</SelectItem>
                    <SelectItem value="RECURRING">Recurring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Cooldown</Label>
                <Select value={cooldown} onValueChange={setCooldown}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["1", "5", "15", "60"].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m} min
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-border bg-surface/50 p-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Notify me with
              </Label>
              {(
                [
                  { key: "browser", label: "Browser notification" },
                  { key: "alarm", label: "Loud alarm" },
                  { key: "push", label: "Push notification" },
                ] as const
              ).map(({ key, label }) => (
                <label key={key} className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <Checkbox
                    checked={notify[key]}
                    onCheckedChange={(v) => setNotify((n) => ({ ...n, [key]: Boolean(v) }))}
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className="space-y-2 rounded-xl border border-border bg-surface/50 p-3">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Volume2 className="size-4" />
                Alarm sound
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(
                  [
                    { value: "default", label: "Default" },
                    { value: "gentle", label: "Gentle" },
                    { value: "urgent", label: "Urgent" },
                    { value: "retro", label: "Retro" },
                    { value: "chill", label: "Chill" },
                    { value: "loud", label: "Loud" },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setSound(value)}
                    className={cn(
                      "flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                      sound === value
                        ? "border-primary/50 bg-primary/12 text-primary"
                        : "border-input text-muted-foreground hover:bg-surface",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button className="h-11 w-full" disabled={!valid} onClick={() => void submit()}>
              {saving ? "Creating…" : "Create alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CoinSearchDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(c) => {
          setCoinId(c.id);
          setTarget(String(Number((c.price * 1.25).toPrecision(6))));
        }}
        title="Pick a coin"
      />
    </>
  );
}
