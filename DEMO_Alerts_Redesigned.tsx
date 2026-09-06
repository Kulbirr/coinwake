/**
 * DEMO: Alerts Page Redesign with Taste Skill Principles
 * 
 * Applying redesign-skill + minimalist-ui + high-end-visual-design
 * to the existing Alerts.tsx
 */

import { createFileRoute } from "@tanstack/react-router";
import { Bell, BellOff, BellRing, Plus, Trash2, Edit2, ToggleLeft, ToggleRight, Loader2, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { AlertCard } from "@/components/app/AlertCard";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppUi } from "@/lib/app-ui";
import { useAlertProgress } from "@/lib/api";
import type { AlertProgress, AlertStatus, Alert } from "@/lib/api";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alerts")({
  component: Alerts,
});

const TABS: Array<{ status: AlertStatus; label: string; icon: typeof Bell; empty: string }> = [
  {
    status: "ACTIVE",
    label: "Active",
    icon: BellRing,
    empty: "No active alerts. Create one and we'll watch the market while you live your life.",
  },
  {
    status: "TRIGGERED",
    label: "Triggered",
    icon: Bell,
    empty: "Nothing has hit its target yet. We'll move alerts here the moment they fire.",
  },
  {
    status: "DISABLED",
    label: "Disabled",
    icon: BellOff,
    empty: "No disabled alerts. Pause an alert instead of deleting it to keep the target around.",
  },
];

// Status colors using warm accent palette
const STATUS_STYLES: Record<AlertStatus, { 
  bg: string; 
  text: string; 
  border: string; 
  icon: typeof Bell;
  label: string;
}> = {
  ACTIVE: { 
    bg: "bg-profit/10", 
    text: "text-profit", 
    border: "border-profit/20",
    icon: BellRing,
    label: "Active"
  },
  TRIGGERED: { 
    bg: "bg-warn/10", 
    text: "text-warn", 
    border: "border-warn/20",
    icon: AlertTriangle,
    label: "Triggered"
  },
  DISABLED: { 
    bg: "bg-muted/50", 
    text: "text-muted-foreground", 
    border: "border-border",
    icon: BellOff,
    label: "Disabled"
  },
};

function Alerts() {
  const { alerts, getCoin, updateAlert, removeAlert, loading } = useStore();
  const { data: progressRows } = useAlertProgress();
  const { openAlertDialog } = useAppUi();
  const [tab, setTab] = useState<AlertStatus>("ACTIVE");
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const progressById = useMemo(() => {
    const map = new Map<string, AlertProgress>();
    for (const row of progressRows ?? []) map.set(row.alertId, row);
    return map;
  }, [progressRows]);

  const grouped = useMemo(() => {
    const buckets: Record<AlertStatus, Alert[]> = {
      ACTIVE: [],
      TRIGGERED: [],
      DISABLED: [],
    };
    for (const alert of alerts) buckets[alert.status].push(alert);
    return buckets;
  }, [alerts]);

  const coinFor = (alert: Alert) => (alert.coinId ? (getCoin(alert.coinId) ?? null) : null);

  const handleToggle = async (alert: Alert) => {
    const nextStatus: AlertStatus = alert.status === "DISABLED" ? "ACTIVE" : "DISABLED";
    const ok = await updateAlert(alert.id, { status: nextStatus });
    if (ok) toast.success(nextStatus === "ACTIVE" ? "Alert re-armed" : "Alert disabled");
  };

  const handleDelete = async (alert: Alert) => {
    if (await removeAlert(alert.id)) toast.success("Alert deleted");
  };

  const handleEdit = (alert: Alert) => {
    const coin = coinFor(alert);
    if (coin) {
      openAlertDialog({
        coin,
        ...(alert.targetPrice === undefined ? {} : { defaultTargetPrice: alert.targetPrice }),
      });
    }
  };

  return (
    <AppShell
      title="Price Alerts"
      subtitle="Set the target once. We keep watching — loudly."
      actions={
        <motion.button
          onClick={() => setIsCreating(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-medium text-sm transition-all duration-300 ease-spring hover:shadow-glow-accent"
        >
          <Plus className="size-4" />
          <span>New Alert</span>
          <motion.div
            className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </motion.button>
      }
    >
      {/* ===== TAB NAVIGATION ===== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6"
      >
        <Tabs value={tab} onValueChange={v => setTab(v as AlertStatus)} className="w-full">
          <TabsList className="grid grid-cols-3 gap-1 bg-surface/60 rounded-xl p-1 border border-border/40 w-full max-w-md mx-auto">
            {TABS.map(({ status, label, icon: Icon }) => {
              const count = grouped[status].length;
              const isActive = tab === status;
              const style = STATUS_STYLES[status];
              
              return (
                <motion.button
                  key={status}
                  value={status}
                  onClick={() => setTab(status)}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg transition-all duration-300 ease-spring",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                    isActive
                      ? `${style.bg} ${style.text} ${style.border} shadow-sm`
                      : "text-muted-foreground/60 hover:text-foreground hover:bg-surface/80"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{ x: isActive ? 0 : tab === "ACTIVE" && status === "TRIGGERED" ? 20 : -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className={cn("size-4", isActive && "text-current")} />
                    <span className="font-medium text-sm">{label}</span>
                  </div>
                  <motion.span
                    className={cn(
                      "num rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      isActive ? "bg-current/20 text-current" : "bg-muted text-muted-foreground/50"
                    )}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ delay: 0.1 }}
                  >
                    {count}
                  </motion.span>
                </motion.button>
              );
            })}
          </TabsList>
        </Tabs>
      </motion.div>

      {/* ===== ALERT GRID ===== */}
      <AnimatePresence mode="wait">
        {TABS.map(({ status, label, icon: Icon, empty }) => (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: tab === status ? 1 : 0, y: tab === status ? 0 : 20 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {tab === status && (
              <TabsContent value={status} className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300 ease-spring">
                {grouped[status].length === 0 ? (
                  // Empty State
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative rounded-3xl p-10 lg:p-16 text-center bg-surface/40 border border-border/40"
                  >
                    <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-surface border border-border/50">
                      <Icon className="size-8 text-muted-foreground/50" />
                    </div>
                    <h2 className="font-display text-xl font-semibold mb-2">{loading.alerts ? "Loading alerts…" : `No ${label} alerts`}</h2>
                    {!loading.alerts && (
                      <>
                        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">{empty}</p>
                        <motion.button
                          onClick={() => setIsCreating(true)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover:shadow-glow-accent transition-all duration-300 ease-spring"
                        >
                          <Plus className="size-4" />
                          Create your first alert
                        </motion.button>
                      </>
                    )}
                  </motion.div>
                ) : (
                  // Alert Grid
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={{
                      visible: { transition: { staggerChildren: 0.06 } }
                    }}
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
                  >
                    {grouped[status].map((alert, index) => {
                      const coin = coinFor(alert);
                      const progress = progressById.get(alert.id);
                      const style = STATUS_STYLES[status];
                      
                      return (
                        <motion.div
                          key={alert.id}
                          variants={{
                            visible: { opacity: 1, y: 0 },
                            hidden: { opacity: 0, y: 20 },
                            exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
                          }}
                          custom={index}
                        >
                          <EnhancedAlertCard
                            alert={alert}
                            coin={coin}
                            progress={progress}
                            statusStyle={style}
                            onEdit={() => handleEdit(alert)}
                            onToggle={() => handleToggle(alert)}
                            onDelete={() => handleDelete(alert)}
                            onExpand={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                            isExpanded={expandedAlert === alert.id}
                          />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </TabsContent>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ===== CREATE ALERT DIALOG ===== */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCreating(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-alert-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md rounded-2xl bg-surface border border-border/50 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
                <h2 id="create-alert-title" className="font-display text-lg font-semibold">Create Alert</h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-1.5 rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-surface transition-colors"
                  aria-label="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Coin Selection */}
                <div>
                  <Label className="block text-sm font-medium mb-2">Market</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                    <Input
                      placeholder="Search markets (BTC, ETH, SOL, BONK...)"
                      className="h-11 pl-10 pr-4 bg-surface/60 border-border/50 focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>

                {/* Alert Type */}
                <div>
                  <Label className="block text-sm font-medium mb-2">Alert Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "price", label: "Price", desc: "Above / below a price" },
                      { id: "percent", label: "% Move", desc: "Percentage change" },
                      { id: "marketcap", label: "Market Cap", desc: "Above / below MC" },
                      { id: "portfolio", label: "Portfolio", desc: "Total value / ROI" },
                    ].map(({ id, label, desc }) => (
                      <motion.button
                        key={id}
                        type="button"
                        className={cn(
                          "relative p-4 rounded-xl border-2 text-left transition-all duration-300 ease-spring",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                        )}
                        whileHover={{ scale: 1.02, borderColor: "var(--color-accent)" }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="font-medium">{label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{desc}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Target Price */}
                <div>
                  <Label className="block text-sm font-medium mb-2">Target Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">$</span>
                    <Input
                      type="number"
                      placeholder="0.00001"
                      step="any"
                      min="0"
                      className="h-11 pl-8 pr-4 bg-surface/60 border-border/50 focus:border-accent focus:ring-2 focus:ring-accent/20 font-mono tabular-nums"
                    />
                  </div>
                </div>

                {/* Condition */}
                <div className="grid grid-cols-2 gap-3">
                  {["ABOVE", "BELOW"].map(cond => (
                    <motion.button
                      key={cond}
                      type="button"
                      className={cn(
                        "p-3 rounded-xl border-2 font-medium transition-all duration-300 ease-spring",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {cond}
                    </motion.button>
                  ))}
                </div>

                {/* Options */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notify me</p>
                      <p className="text-xs text-muted-foreground">Push + in-app + alarm sound</p>
                    </div>
                    <Switch checked={true} onCheckedChange={() => {}} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Repeat alert</p>
                      <p className="text-xs text-muted-foreground">Fire every time target is hit</p>
                    </div>
                    <Switch checked={false} onCheckedChange={() => {}} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-3 rounded-xl border border-border/50 text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover:shadow-glow-accent transition-all duration-300 ease-spring"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Create Alert
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

// ============================================================
// ENHANCED ALERT CARD
// ============================================================

interface EnhancedAlertCardProps {
  alert: Alert;
  coin: any;
  progress: AlertProgress | undefined;
  statusStyle: typeof STATUS_STYLES.ACTIVE;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onExpand: () => void;
  isExpanded: boolean;
}

function EnhancedAlertCard({ 
  alert, 
  coin, 
  progress, 
  statusStyle,
  onEdit,
  onToggle,
  onDelete,
  onExpand,
  isExpanded
}: EnhancedAlertCardProps) {
  const { targetPrice, targetPercent, targetMarketCap, targetValue, condition, kind, repeat, cooldownMinutes } = alert;
  const progressPercent = progress?.percent ?? 0;
  const isProgressing = progress && !progress.reached;
  const isTriggered = progress?.reached ?? false;

  const getTargetDisplay = () => {
    if (kind === "PRICE" && targetPrice) return `$${formatPrice(targetPrice)}`;
    if (kind === "PERCENT" && targetPercent) return `${targetPercent > 0 ? "+" : ""}${targetPercent}%`;
    if (kind === "MARKET_CAP" && targetMarketCap) return `$${formatCompact(targetMarketCap)}`;
    if (kind === "PORTFOLIO" && targetValue) return `$${formatCompact(targetValue)}`;
    return "—";
  };

  const getCurrentDisplay = () => {
    if (!coin) return "—";
    if (kind === "PRICE" || kind === "PERCENT") return `$${formatPrice(coin.price)}`;
    if (kind === "MARKET_CAP") return `$${formatCompact(coin.marketCap)}`;
    return "—";
  };

  return (
    <motion.div
      className={cn(
        "relative group rounded-2xl border p-5 bg-surface/60 backdrop-blur-xl transition-all duration-300 ease-spring",
        "hover:border-border-strong hover:shadow-card-hover",
        isExpanded && "ring-2 ring-accent/30 shadow-glow-accent z-10",
        statusStyle.border
      )}
      whileHover={{ y: -2, boxShadow: "0 16px 40px -12px oklch(0 0 0 / 0.4)" }}
      layout
    >
      {/* Status indicator bar */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: `var(--color-${statusStyle.text.replace("text-", "")})` }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      />

      {/* Expand trigger */}
      <button
        onClick={onExpand}
        className="absolute right-4 top-4 p-1.5 rounded-xl text-muted-foreground/50 hover:text-foreground hover:bg-surface transition-colors opacity-0 group-hover:opacity-100"
        aria-label={isExpanded ? "Collapse" : "Expand"}
      >
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
        >
          <ChevronDown className="size-4" />
        </motion.span>
      </button>

      {/* Status badge */}
      <div className="mb-4 flex items-center gap-2">
        <motion.span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider",
            statusStyle.bg, statusStyle.text, statusStyle.border
          )}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <statusStyle.icon className="size-3" />
          {statusStyle.label}
        </motion.span>
        
        {repeat === "RECURRING" && (
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 border-border/50 bg-surface/60">
            Recurring
          </Badge>
        )}
        
        {isTriggered && (
          <motion.span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-loss/10 text-loss border border-loss/20"
            animate={{ boxShadow: "0 0 0 0 oklch(0.66 0.21 22 / 0.55)" }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <AlertTriangle className="size-3" />
            Triggered
          </motion.span>
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Coin + Target */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {coin ? (
              <Link
                to="/coin/$coinId"
                params={{ coinId: coin.id }}
                className="flex items-center gap-3 group"
              >
                <CoinLogo coin={coin} size={44} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold truncate">{coin.symbol}</span>
                    <span className="text-xs text-muted-foreground truncate">{coin.name}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="font-mono tabular-nums font-medium text-foreground">
                      <PriceValue value={coin.price} className="inline" />
                    </span>
                    <Delta value={coin.change24h} arrow={true} className="font-mono tabular-nums" />
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-surface border border-border/50 flex items-center justify-center">
                  <AlertTriangle className="size-5 text-warn" />
                </div>
                <div>
                  <p className="font-medium">Portfolio Alert</p>
                  <p className="text-xs text-muted-foreground">Tracks total portfolio value</p>
                </div>
              </div>
            )}
          </div>

          {/* Target vs Current */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Target</p>
              <p className="font-display font-semibold font-mono tabular-nums text-foreground">{getTargetDisplay()}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Current</p>
              <p className="font-display font-mono tabular-nums text-muted-foreground">{getCurrentDisplay()}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {(isProgressing || isTriggered) && (
          <div className="relative h-2 rounded-full bg-surface border border-border/50 overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-spring",
                isTriggered ? "bg-loss" : "bg-accent"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercent, 100)}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
            {isTriggered && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-loss/30 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>
        )}

        {/* Progress Text */}
        {progress && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {isTriggered ? "Target reached!" : `${Math.round(progressPercent)}% to target`}
            </span>
            <span className="font-mono tabular-nums font-medium text-accent">
              {progress.remaining > 0 ? `${formatPrice(progress.remaining)} away` : "Reached"}
            </span>
          </div>
        )}

        {/* Metadata Row */}
        <div className="flex items-center justify-between pt-3 border-t border-border/30 text-xs text-muted-foreground font-mono tabular-nums">
          <span>Cooldown: {cooldownMinutes}m</span>
          <span>{kind}</span>
          {condition && <span>{condition}</span>}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 pt-4 border-t border-border/30 space-y-3"
          >
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-surface/50 border border-border/50">
                <p className="text-muted-foreground text-[11px] uppercase tracking-wider mb-1">Condition</p>
                <p className="font-mono tabular-nums font-medium capitalize">{condition?.toLowerCase()}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface/50 border border-border/50">
                <p className="text-muted-foreground text-[11px] uppercase tracking-wider mb-1">Repeat</p>
                <p className="font-medium capitalize">{repeat.toLowerCase()}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface/50 border border-border/50">
                <p className="text-muted-foreground text-[11px] uppercase tracking-wider mb-1">Cooldown</p>
                <p className="font-mono tabular-nums font-medium">{cooldownMinutes} min</p>
              </div>
              <div className="p-3 rounded-xl bg-surface/50 border border-border/50">
                <p className="text-muted-foreground text-[11px] uppercase tracking-wider mb-1">Kind</p>
                <p className="font-medium capitalize">{kind.toLowerCase()}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <motion.button
                onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border/50 bg-surface/60 text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground hover:border-accent/30 transition-all duration-300 ease-spring"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Edit2 className="size-4" />
                Edit
              </motion.button>

              <motion.button
                onClick={onToggle}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ease-spring",
                  alert.status === "DISABLED"
                    ? "bg-profit/10 text-profit border border-profit/20 hover:bg-profit/20"
                    : "bg-muted/50 text-muted-foreground border border-border/50 hover:bg-muted"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {alert.status === "DISABLED" ? (
                  <>
                    <CheckCircle className="size-4" />
                    Enable
                  </>
                ) : (
                  <>
                    <ToggleLeft className="size-4" />
                    Disable
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={onDelete}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-loss/20 bg-loss/10 text-loss font-medium text-sm hover:bg-loss/20 hover:border-loss/30 transition-all duration-300 ease-spring"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 className="size-4" />
                Delete
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Stub Link component for demo
const Link = ({ to, params, children, className }: any) => (
  <a href={to} className={className}>{children}</a>
);

export default Alerts;