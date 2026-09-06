import { Link } from "@tanstack/react-router";
import { AlarmClock, BellOff, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

import { CoinLogo } from "@/components/app/CoinLogo";
import { Button } from "@/components/ui/button";
import { ALERT_KIND_LABEL, formatAlertValue } from "@/lib/alert-display";
import { useStore } from "@/lib/store";

/**
 * Full-screen takeover shown when an alert fires. Mobile-first: the three
 * actions are thumb-sized and stack above the fold on small screens.
 *
 * Renders every alert kind, not just price — a market-cap or portfolio alert has
 * no coin and no target price, so the figures come pre-resolved from the store.
 */
export function AlarmOverlay() {
  const { activeAlarm, stopAlarm, snoozeAlarm, alarmSoundEnabled } = useStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeAlarm) {
      setElapsed(0);
      return undefined;
    }
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [activeAlarm]);

  // Escape stops the alarm — a trapped user with no mouse still gets out.
  useEffect(() => {
    if (!activeAlarm) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stopAlarm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeAlarm, stopAlarm]);

  if (!activeAlarm) return null;

  const { alert, coin, subject, previous, target, current } = activeAlarm;
  const fmt = (value: number | null) => formatAlertValue(activeAlarm.unit, value);
  const reached = alert.condition === "ABOVE" ? "REACHED" : "FELL TO";
  // A target we don't have can't be quoted — say what happened, not a made-up number.
  const headline =
    target === null ? `${subject} ALERT TRIGGERED` : `${subject} ${reached} ${fmt(target)}`;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={`Alert: ${headline}`}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-background/95 p-4 backdrop-blur-xl"
    >
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background:
            "radial-gradient(900px 600px at 50% 0%, oklch(0.66 0.21 22 / 0.28), transparent 65%)",
        }}
      />

      <div className="alarm-pulse relative w-full max-w-lg rounded-3xl border border-loss/40 bg-card/90 p-6 text-center shadow-2xl md:p-8">
        <div className="text-3xl tracking-[0.3em] md:text-4xl">🚨🚨🚨</div>
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.35em] text-loss">
          {ALERT_KIND_LABEL[alert.kind]}
        </p>

        <div className="mt-5 flex items-center justify-center gap-3">
          {coin && <CoinLogo coin={coin} size={44} />}
          <h2 className="font-display text-2xl font-bold md:text-3xl">{headline}</h2>
        </div>

        {alert.name && (
          <p className="mt-2 inline-block rounded-full border border-warn/30 bg-warn/10 px-3 py-1 text-sm font-medium text-warn">
            {alert.name}
          </p>
        )}

        <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-surface/70 p-4">
          {[
            // "When set" rather than "Previous": it's the snapshot from when the
            // alert was armed, and the server doesn't keep a last-tick value.
            { label: "When set", value: previous, tone: "text-muted-foreground" },
            { label: "Target", value: target, tone: "text-warn" },
            { label: "Now", value: current, tone: "text-profit" },
          ].map((cell) => (
            <div key={cell.label}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {cell.label}
              </div>
              <div className={`num mt-1 text-sm font-semibold md:text-base ${cell.tone}`}>
                {fmt(cell.value)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            size="lg"
            onClick={stopAlarm}
            className="h-14 bg-loss text-base font-bold tracking-wide text-primary-foreground hover:bg-loss/90"
          >
            <BellOff className="size-5" /> STOP ALARM
          </Button>
          <div className="grid grid-cols-2 gap-2.5">
            <Button size="lg" variant="secondary" className="h-12" onClick={snoozeAlarm}>
              <AlarmClock className="size-4" /> Pause alert
            </Button>
            {coin ? (
              <Button asChild size="lg" variant="outline" className="h-12">
                <Link to="/coin/$coinId" params={{ coinId: coin.id }} onClick={stopAlarm}>
                  <ExternalLink className="size-4" /> View coin
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" variant="outline" className="h-12">
                <Link to="/portfolio" onClick={stopAlarm}>
                  <ExternalLink className="size-4" /> View portfolio
                </Link>
              </Button>
            )}
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          {alarmSoundEnabled
            ? `Ringing for ${elapsed}s — press Escape or STOP to silence.`
            : "Sound is muted. Enable the alarm in Settings so we can wake you next time."}
        </p>
      </div>
    </div>
  );
}
