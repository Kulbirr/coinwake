import { createFileRoute } from "@tanstack/react-router";
import { Bell, BellOff, BellRing, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AlertCard } from "@/components/app/AlertCard";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppUi } from "@/lib/app-ui";
import { useAlertProgress } from "@/lib/api";
import type { AlertProgress, AlertStatus, Alert } from "@/lib/api";
import { useStore } from "@/lib/store";

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

function Alerts() {
  const { alerts, getCoin, updateAlert, removeAlert, loading } = useStore();
  const { data: progressRows } = useAlertProgress();
  const { openAlertDialog } = useAppUi();
  const [tab, setTab] = useState<AlertStatus>("ACTIVE");

  /** Server-computed progress, by alert id (spec 30 — the browser doesn't judge). */
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

  /** Null for portfolio alerts, and for coins the market feed hasn't loaded. */
  const coinFor = (alert: Alert) => (alert.coinId ? (getCoin(alert.coinId) ?? null) : null);

  const handleToggle = async (alert: Alert) => {
    const nextStatus: AlertStatus = alert.status === "DISABLED" ? "ACTIVE" : "DISABLED";
    // The server re-baselines on re-arm, so "+10%" means +10% from now — nothing
    // to send but the status.
    const ok = await updateAlert(alert.id, { status: nextStatus });
    if (ok) toast.success(nextStatus === "ACTIVE" ? "Alert re-armed" : "Alert disabled");
  };

  const handleDelete = async (alert: Alert) => {
    if (await removeAlert(alert.id)) toast.success("Alert deleted");
  };

  return (
    <AppShell
      title="Price Alerts"
      subtitle="Set the target once. We keep watching — loudly."
      actions={
        <Button onClick={() => openAlertDialog()}>
          <Plus className="size-4" /> New alert
        </Button>
      }
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as AlertStatus)}>
        <TabsList className="w-full sm:w-auto">
          {TABS.map(({ status, label }) => (
            <TabsTrigger key={status} value={status} className="flex-1 gap-1.5 sm:flex-none">
              {label}
              <span className="num rounded-full bg-muted px-1.5 text-[10px] font-semibold">
                {grouped[status].length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map(({ status, label, icon: Icon, empty }) => (
          <TabsContent key={status} value={status} className="mt-5">
            {grouped[status].length === 0 ? (
              <div className="glass rounded-2xl px-6 py-12 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-surface">
                  <Icon className="size-5 text-muted-foreground" />
                </div>
                <h2 className="mt-4 font-display text-lg font-semibold">
                  {loading.alerts ? "Loading alerts…" : `No ${label} alerts`}
                </h2>
                {!loading.alerts && (
                  <>
                    <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{empty}</p>
                    <Button className="mt-5" onClick={() => openAlertDialog()}>
                      <Plus className="size-4" /> Create alert
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {grouped[status].map((alert) => {
                  const coin = coinFor(alert);
                  const targetPrice = alert.targetPrice;
                  return (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      coin={coin}
                      progress={progressById.get(alert.id)}
                      onEdit={
                        // The dialog only creates coin-scoped alerts, so there's
                        // nothing to prefill for a portfolio target.
                        coin
                          ? () =>
                              openAlertDialog({
                                coin,
                                ...(targetPrice === undefined
                                  ? {}
                                  : { defaultTargetPrice: targetPrice }),
                              })
                          : undefined
                      }
                      onToggle={() => void handleToggle(alert)}
                      onDelete={() => void handleDelete(alert)}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </AppShell>
  );
}