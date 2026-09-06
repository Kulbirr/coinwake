import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  BellRing,
  KeyRound,
  LogOut,
  Mail,
  Monitor,
  Send,
  Siren,
  Smartphone,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { alarmEngine, requestBrowserNotifications } from "@/lib/alarm";
import { push as pushApi, useServerConfig } from "@/lib/api";
import { disablePush, enablePush, isPushEnabled, pushSupport } from "@/lib/push";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Bell;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/25 to-accent/20">
          <Icon className="size-4.5 text-primary" />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** One labelled switch over a server-side settings flag. */
function ToggleRow({
  icon: Icon,
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  icon: typeof Bell;
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface/50 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <Icon className="size-4 shrink-0 text-primary" />
        <div className="min-w-0">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">{hint}</div>
        </div>
      </div>
      <Switch
        checked={checked}
        disabled={disabled ?? false}
        onCheckedChange={onChange}
        aria-label={label}
      />
    </div>
  );
}

function SettingsPage() {
  const {
    user,
    settings,
    signOut,
    alarmSoundEnabled,
    setAlarmSoundEnabled,
    alerts,
    updateSettings,
    updateProfile,
    changePassword,
  } = useStore();
  const { data: config } = useServerConfig();

  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [name, setName] = useState(user?.name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const support = pushSupport();

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
    // Whether *this device* has a live subscription — a server-side flag can't
    // answer it, because the user may have several browsers.
    void isPushEnabled().then(setPushOn);
  }, []);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user]);

  const activeCount = alerts.filter((a) => a.status === "ACTIVE").length;

  const toggleAlarm = async (on: boolean) => {
    if (!on) {
      alarmEngine.stop();
      setAlarmSoundEnabled(false);
      return;
    }
    // Toggling is a user gesture — the moment we're allowed to unlock audio.
    const unlocked = await alarmEngine.unlock();
    if (!unlocked) {
      toast.error("Your browser blocked audio", {
        description: "Interact with the page once more, then try again.",
      });
      return;
    }
    alarmEngine.test(0.22);
    setAlarmSoundEnabled(true);
    toast.success("Alarm armed", { description: `Watching ${activeCount} active alerts.` });
  };

  const askNotifications = async () => {
    const next = await requestBrowserNotifications();
    setPermission(next);
    if (next === "granted") {
      toast.success("Browser notifications enabled");
      void updateSettings({ notifications: { browser: true } });
    } else if (next === "denied") {
      toast.error("Notifications blocked", {
        description: "Re-enable them in your browser's site settings.",
      });
    }
  };

  const togglePush = async (on: boolean) => {
    setPushBusy(true);
    if (!on) {
      await disablePush();
      setPushOn(false);
      setPushBusy(false);
      await updateSettings({ notifications: { push: false } });
      return;
    }

    const result = await enablePush();
    setPushBusy(false);
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
    if (!result.ok) {
      toast.error(result.reason, result.hint ? { description: result.hint } : undefined);
      return;
    }
    setPushOn(true);
    await updateSettings({ notifications: { push: true } });
    toast.success("Push notifications on", {
      description: "We can now wake you with this tab closed.",
    });
  };

  const sendTestPush = async () => {
    setPushBusy(true);
    try {
      const { devices } = await pushApi.test();
      toast.success(
        devices > 0
          ? `Test sent to ${devices} ${devices === 1 ? "device" : "devices"}`
          : "No devices subscribed yet",
      );
    } catch {
      // Spec 35: no status codes, no stack.
      toast.error("We couldn't send the test notification.");
    } finally {
      setPushBusy(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === user?.name) return;
    setSavingProfile(true);
    const ok = await updateProfile({ name: trimmed });
    setSavingProfile(false);
    if (ok) toast.success("Profile updated");
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return;
    setSavingPassword(true);
    const ok = await changePassword({
      // Omitted entirely for a Google or wallet account that has no password yet
      // — sending an empty string would fail the server's check for no reason.
      ...(user?.hasPassword ? { currentPassword } : {}),
      newPassword,
    });
    setSavingPassword(false);
    if (!ok) return;
    setCurrentPassword("");
    setNewPassword("");
    toast.success(user?.hasPassword ? "Password changed" : "Password set", {
      description: "Other devices have been signed out.",
    });
  };

  const notifications = settings?.notifications;

  return (
    <AppShell title="Settings" subtitle="Alarm, notifications and your account.">
      <div className="grid gap-5 lg:grid-cols-2">
        <Section
          icon={Siren}
          title="Loud crypto alarm"
          description="A repeating alarm that won't stop until you tap it — impossible to sleep through."
        >
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface/50 px-4 py-3">
            <div className="flex items-center gap-2.5">
              {alarmSoundEnabled ? (
                <Volume2 className="size-4 text-profit" />
              ) : (
                <VolumeX className="size-4 text-warn" />
              )}
              <div>
                <div className="text-sm font-medium">
                  {alarmSoundEnabled ? "Alarm armed" : "Alarm muted"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {alarmSoundEnabled
                    ? `Watching ${activeCount} active ${activeCount === 1 ? "alert" : "alerts"}.`
                    : "Browsers block audio until you allow it."}
                </div>
              </div>
            </div>
            <Switch
              checked={alarmSoundEnabled}
              onCheckedChange={(v) => void toggleAlarm(v)}
              aria-label="Enable alarm sound"
            />
          </div>

          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={() => void alarmEngine.test(0.25)}
          >
            <Volume2 className="size-4" /> Test alarm sound
          </Button>
          <p className="mt-2.5 text-xs text-muted-foreground">
            Test it once now so you know exactly what 3am sounds like.
          </p>
        </Section>

        <Section
          icon={Bell}
          title="Notifications"
          description="How we reach you when a target is hit — the server sends these, so they arrive with the app closed."
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface/50 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Monitor className="size-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">Browser notifications</div>
                  <div className="text-xs text-muted-foreground">
                    {permission === "unsupported"
                      ? "This browser doesn't support notifications."
                      : permission === "granted"
                        ? "Allowed — we can reach you outside the tab."
                        : permission === "denied"
                          ? "Blocked in your browser settings."
                          : "Not requested yet."}
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 text-[10px] uppercase",
                  permission === "granted"
                    ? "border-profit/40 bg-profit/10 text-profit"
                    : permission === "denied"
                      ? "border-loss/40 bg-loss/10 text-loss"
                      : "border-warn/40 bg-warn/10 text-warn",
                )}
              >
                {permission}
              </Badge>
            </div>
            {permission !== "granted" && (
              <Button
                variant="outline"
                className="w-full"
                disabled={permission === "unsupported"}
                onClick={() => void askNotifications()}
              >
                <Bell className="size-4" /> Enable browser notifications
              </Button>
            )}

            {support.supported ? (
              <ToggleRow
                icon={Smartphone}
                label="Push notifications"
                hint={
                  pushOn
                    ? "This device is subscribed."
                    : config?.pushEnabled === false
                      ? "The server has no push keys configured."
                      : "Reach this device with the app closed."
                }
                checked={pushOn}
                disabled={pushBusy || config?.pushEnabled === false}
                onChange={(v) => void togglePush(v)}
              />
            ) : (
              <div className="rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-xs">
                <p className="font-medium text-warn">Push isn't available here</p>
                <p className="mt-0.5 text-muted-foreground">{support.reason}</p>
                {support.hint && <p className="mt-0.5 text-muted-foreground">{support.hint}</p>}
              </div>
            )}
            {pushOn && (
              <Button
                variant="outline"
                className="w-full"
                disabled={pushBusy}
                onClick={() => void sendTestPush()}
              >
                <Send className="size-4" /> Send a test notification
              </Button>
            )}

            {notifications && (
              <>
                <ToggleRow
                  icon={Mail}
                  label="Email"
                  hint="A message to your inbox for every trigger."
                  checked={notifications.email}
                  onChange={(v) => void updateSettings({ notifications: { email: v } })}
                />
                <ToggleRow
                  icon={BellRing}
                  label="Price alerts"
                  hint="Coin targets: price, market cap and % moves."
                  checked={notifications.priceAlerts}
                  onChange={(v) => void updateSettings({ notifications: { priceAlerts: v } })}
                />
                <ToggleRow
                  icon={BellRing}
                  label="Portfolio alerts"
                  hint="Total value, profit, ROI and drawdown targets."
                  checked={notifications.portfolioAlerts}
                  onChange={(v) => void updateSettings({ notifications: { portfolioAlerts: v } })}
                />
              </>
            )}
          </div>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link to="/notifications">Open notification centre</Link>
          </Button>
        </Section>

        <Section
          icon={User}
          title="Profile"
          description="Your account on the CoinWake server, shared by every device you sign in on."
        >
          {user ? (
            <form className="space-y-3" onSubmit={(e) => void saveProfile(e)}>
              <div className="space-y-1.5">
                <Label htmlFor="profile-name">Display name</Label>
                <Input
                  id="profile-name"
                  className="h-11"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Satoshi"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  className="h-11"
                  value={user.email ?? "—"}
                  readOnly
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  {user.email
                    ? "Changing the email on an account isn't supported yet."
                    : "This account signed in with a wallet, so it has no email."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={savingProfile || !name.trim() || name.trim() === user.name}
                >
                  {savingProfile ? "Saving…" : "Save profile"}
                </Button>
                <Button type="button" variant="outline" onClick={() => void signOut()}>
                  <LogOut className="size-4" /> Sign out
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Signed in with {user.authProviders.join(", ")}.
              </p>
            </form>
          ) : (
            <div className="rounded-xl border border-border bg-surface/50 px-4 py-5 text-center">
              <p className="text-sm text-muted-foreground">
                You're browsing as a guest. Sign in to sync alerts and your portfolio.
              </p>
              <Button asChild className="mt-3.5">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          )}
        </Section>

        {user && (
          <Section
            icon={KeyRound}
            title={user.hasPassword ? "Change password" : "Set a password"}
            description={
              user.hasPassword
                ? "Changing it signs out your other devices."
                : "Add one so you can sign in without Google or your wallet."
            }
          >
            <form className="space-y-3" onSubmit={(e) => void savePassword(e)}>
              {user.hasPassword && (
                <div className="space-y-1.5">
                  <Label htmlFor="current-password">Current password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    className="h-11"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  className="h-11"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                <p className="text-xs text-muted-foreground">At least 6 characters.</p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  savingPassword ||
                  newPassword.length < 6 ||
                  (user.hasPassword && currentPassword.length < 6)
                }
              >
                {savingPassword ? "Saving…" : user.hasPassword ? "Change password" : "Set password"}
              </Button>
            </form>
          </Section>
        )}

        <Section
          icon={Monitor}
          title="Appearance"
          description="CoinWake is built dark-first for late-night market watching."
        >
          <div className="rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Theme</span>
              <Badge variant="secondary">Dark</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Green means profit, red means loss, amber means an alert is close. The server stores a
              theme preference for a future light mode; this build renders dark either way.
            </p>
          </div>
        </Section>
      </div>

      {config?.disclaimer && (
        <p className="mt-5 text-center text-xs text-muted-foreground">{config.disclaimer}</p>
      )}
    </AppShell>
  );
}
