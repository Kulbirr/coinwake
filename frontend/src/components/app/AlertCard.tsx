import { Link } from "@tanstack/react-router";
import { Bell, Pencil, Power, Trash2 } from "lucide-react";

import { CoinLogo } from "@/components/app/CoinLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ALERT_KIND_LABEL,
  ALERT_METRIC_LABEL,
  alertConditionLabel,
  alertProgressUnit,
  alertSubject,
  alertThresholdLabel,
  formatAlertValue,
} from "@/lib/alert-display";
import type { Alert, AlertProgress, Coin } from "@/lib/api";
import { formatPercent, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<Alert["status"], string> = {
  ACTIVE: "border-profit/40 bg-profit/10 text-profit",
  TRIGGERED: "border-warn/40 bg-warn/10 text-warn",
  DISABLED: "border-border bg-muted text-muted-foreground",
};

/**
 * Progress from the value an alert was armed at toward its target.
 *
 * The figures come from `GET /alerts/progress`, not from arithmetic here: the
 * server is the only place that knows the peak a drawdown is measured against,
 * and one implementation means the bar can't disagree with the engine that will
 * actually fire (spec 30).
 */
export function AlertProgressBar({
  alert,
  progress,
}: {
  alert: Alert;
  progress: AlertProgress | undefined;
}) {
  const unit = alertProgressUnit(alert);
  const fmt = (value: number | null | undefined) => formatAlertValue(unit, value);

  if (!progress) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface/40 px-3 py-2 text-xs text-muted-foreground">
        <Bell className="size-3.5" />
        Watching for {alertConditionLabel(alert)} — waiting for the next check.
      </div>
    );
  }

  const percent = Math.max(0, Math.min(100, progress.percent));
  // Percentage of the way there, not percentage of the target: a $250 target
  // reached from $180 is 100%, and the remaining gap is quoted separately.
  const gap = progress.current === 0 ? null : (progress.remaining / progress.current) * 100;

  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {ALERT_METRIC_LABEL[alert.kind]}{" "}
          <span className="num text-foreground">{fmt(progress.current)}</span>
        </span>
        <span className="num font-semibold">{percent.toFixed(1)}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700 ease-out",
            alert.condition === "ABOVE"
              ? "bg-gradient-to-r from-primary to-profit"
              : "bg-gradient-to-r from-primary to-loss",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Target <span className="num text-foreground">{fmt(progress.target)}</span>
        </span>
        <span className="num">
          {fmt(Math.abs(progress.remaining))} away
          {gap === null ? "" : ` · ${formatPercent(gap)}`}
        </span>
      </div>
    </div>
  );
}

/**
 * One alert, any kind. `coin` is null for portfolio alerts and for coins outside
 * the loaded market feed, so nothing here may assume there is one.
 */
export function AlertCard({
  alert,
  coin,
  progress,
  onEdit,
  onToggle,
  onDelete,
}: {
  alert: Alert;
  coin: Coin | null;
  progress?: AlertProgress | undefined;
  onEdit?: (() => void) | undefined;
  onToggle?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
}) {
  const subject = alertSubject(alert, coin);

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-start gap-3">
        {coin ? (
          <Link to="/coin/$coinId" params={{ coinId: coin.id }}>
            <CoinLogo coin={coin} size={40} />
          </Link>
        ) : (
          <div className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted-foreground">
            <Bell className="size-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {coin ? (
              <Link
                to="/coin/$coinId"
                params={{ coinId: coin.id }}
                className="truncate font-semibold hover:text-primary"
              >
                {subject}
              </Link>
            ) : (
              <span className="truncate font-semibold">{subject}</span>
            )}
            <Badge
              variant="outline"
              className={cn("gap-1 text-[10px]", STATUS_STYLE[alert.status])}
            >
              {alert.status}
            </Badge>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            {/* Naming the kind matters once targets aren't all prices — "≥ $1.20"
                could be a price or a market cap without it. */}
            {alert.kind !== "PRICE" && (
              <>
                <span>{ALERT_KIND_LABEL[alert.kind]}</span>
                <span aria-hidden>·</span>
              </>
            )}
            <span>
              {ALERT_METRIC_LABEL[alert.kind]}{" "}
              <span className="num text-foreground">{alertConditionLabel(alert)}</span>
            </span>
            <span aria-hidden>·</span>
            <span>{alert.repeat === "ONCE" ? "One-time" : "Recurring"}</span>
            <span aria-hidden>·</span>
            <span>{timeAgo(alert.createdAt)}</span>
          </div>
          {alert.name && (
            <div className="mt-1 inline-block rounded-md bg-surface px-2 py-0.5 text-xs text-foreground">
              {alert.name}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={onEdit}
              aria-label="Edit"
            >
              <Pencil className="size-4" />
            </Button>
          )}
          {onToggle && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={onToggle}
              aria-label={alert.status === "DISABLED" ? "Enable" : "Disable"}
            >
              <Power className={cn("size-4", alert.status === "ACTIVE" && "text-profit")} />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-loss"
              onClick={onDelete}
              aria-label="Delete"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-3.5">
        {alert.status === "ACTIVE" ? (
          <AlertProgressBar alert={alert} progress={progress} />
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface/40 px-3 py-2 text-xs text-muted-foreground">
            <Bell className="size-3.5" />
            {alert.status === "TRIGGERED"
              ? `Triggered ${alert.triggeredAt ? timeAgo(alert.triggeredAt) : ""} at ${alertThresholdLabel(alert)}`
              : "Disabled — not watching this target."}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span>Notify:</span>
        {alert.notify.browser && (
          <Badge variant="secondary" className="text-[10px]">
            Browser
          </Badge>
        )}
        {alert.notify.alarm && (
          <Badge variant="secondary" className="text-[10px]">
            Alarm
          </Badge>
        )}
        {alert.notify.push && (
          <Badge variant="secondary" className="text-[10px]">
            Push
          </Badge>
        )}
        {alert.notify.email && (
          <Badge variant="secondary" className="text-[10px]">
            Email
          </Badge>
        )}
      </div>
    </div>
  );
}
