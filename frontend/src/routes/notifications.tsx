import { Link, createFileRoute } from "@tanstack/react-router";
import { Bell, BellRing, CheckCheck, Inbox, TrendingUp, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app/AppShell";
import { CoinLogo } from "@/components/app/CoinLogo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AppNotification } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  component: Notifications,
});

const KIND_STYLE: Record<
  AppNotification["kind"],
  { icon: typeof Bell; ring: string; text: string; label: string }
> = {
  PRICE_TARGET: {
    icon: BellRing,
    ring: "border-warn/40 bg-warn/12",
    text: "text-warn",
    label: "Price target",
  },
  MARKET_CAP_TARGET: {
    icon: TrendingUp,
    ring: "border-accent/40 bg-accent/12",
    text: "text-accent",
    label: "Market cap",
  },
  PORTFOLIO_TARGET: {
    icon: Wallet,
    ring: "border-primary/40 bg-primary/12",
    text: "text-primary",
    label: "Portfolio",
  },
  PERCENT_MOVE: {
    icon: TrendingUp,
    ring: "border-profit/40 bg-profit/12",
    text: "text-profit",
    label: "Move",
  },
  ALERT_TRIGGERED: {
    icon: BellRing,
    ring: "border-loss/40 bg-loss/12",
    text: "text-loss",
    label: "Triggered",
  },
  SYSTEM: {
    icon: Bell,
    ring: "border-border bg-surface",
    text: "text-muted-foreground",
    label: "System",
  },
};

function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, getCoin } = useStore();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unread = notifications.filter((n) => !n.read).length;
  const shown = useMemo(
    () => (filter === "unread" ? notifications.filter((n) => !n.read) : notifications),
    [notifications, filter],
  );

  return (
    <AppShell
      title="Notifications"
      subtitle={
        unread > 0 ? `${unread} unread` : "You're all caught up — nothing needs your attention."
      }
      actions={
        <Button variant="outline" disabled={unread === 0} onClick={markAllNotificationsRead}>
          <CheckCheck className="size-4" /> Mark all read
        </Button>
      }
    >
      <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
        <TabsList>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unread})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-5 space-y-2.5">
        {shown.length === 0 && (
          <div className="glass rounded-2xl px-6 py-14 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-surface">
              <Inbox className="size-5 text-muted-foreground" />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold">
              {filter === "unread" ? "No unread notifications" : "Nothing here yet"}
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
              Alerts, portfolio milestones and market moves land here the moment they happen.
            </p>
          </div>
        )}

        {shown.map((n) => {
          // Fall back rather than crash if the server grows a new kind.
          const style = KIND_STYLE[n.kind] ?? KIND_STYLE.SYSTEM;
          const Icon = style.icon;
          const coin = n.coinId ? getCoin(n.coinId) : undefined;
          return (
            <article
              key={n.id}
              className={cn(
                "glass flex items-start gap-3.5 rounded-2xl p-4 transition-colors",
                !n.read && "border-primary/25 bg-primary/[0.04]",
              )}
            >
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl border",
                  style.ring,
                )}
              >
                <Icon className={cn("size-4.5", style.text)} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-medium">{n.title}</h2>
                  {!n.read && (
                    <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                  )}
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      style.ring,
                      style.text,
                    )}
                  >
                    {style.label}
                  </span>
                  {coin && (
                    <Link
                      to="/coin/$coinId"
                      params={{ coinId: coin.id }}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-2 py-0.5 text-xs transition-colors hover:bg-surface"
                    >
                      <CoinLogo coin={coin} size={16} />
                      {coin.symbol}
                    </Link>
                  )}
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-7 text-xs"
                      onClick={() => markNotificationRead(n.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
