import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import {
  alerts as alertsApi,
  auth as authApi,
  coins as coinsApi,
  errorHint,
  errorMessage,
  isSignedIn,
  notifications as notificationsApi,
  onSessionChange,
  portfolio as portfolioApi,
  realtime,
  settings as settingsApi,
  watchlist as watchlistApi,
  type Alert,
  type AlertInput,
  type AlertPatch,
  type AppNotification,
  type Coin,
  type Holding,
  type HoldingInput,
  type PortfolioSummary,
  type PublicUser,
  type ServerMessage,
  type SocketStatus,
  type UserSettings,
} from "./api";
import { queryKeys } from "./api/queries";
import {
  alertBaseline,
  alertCurrent,
  alertDefinitionUnit,
  alertSubject,
  alertThreshold,
  type AlertUnit,
} from "./alert-display";
import { alarmEngine, sendBrowserNotification } from "./alarm";
import { onServiceWorkerMessage } from "./push";

/**
 * Shared application state, backed by the API.
 *
 * Two rules shape this file. Spec 30: the server owns price monitoring and alert
 * evaluation, so nothing here decides that a target was hit — an alarm appears
 * because a socket frame said so. Spec 2: screens read this context and never the
 * network, so the same components can sit on a React Native client later.
 *
 * Reads are React Query caches; the socket patches those caches in place rather
 * than holding a second copy, so there is one source of truth per collection.
 */

/** What the alarm overlay needs to describe any alert kind, not just a price. */
export interface AlarmPayload {
  alert: Alert;
  /** Null for portfolio alerts, which aren't about a single coin. */
  coin: Coin | null;
  /** Heading label: a coin symbol, or "Portfolio". */
  subject: string;
  /** The value when the alert was armed. Null when the server never had one. */
  previous: number | null;
  /** Null when the alert has no threshold of this kind recorded. */
  target: number | null;
  /** Null when this client can't know the live figure (see `alertCurrent`). */
  current: number | null;
  /** How the three figures should be formatted. */
  unit: AlertUnit;
}

/** A partial update of any settings group; the server merges rather than replaces. */
export interface SettingsPatch {
  notifications?: Partial<UserSettings["notifications"]>;
  alarm?: Partial<UserSettings["alarm"]>;
  appearance?: Partial<UserSettings["appearance"]>;
}

export interface StoreLoading {
  coins: boolean;
  alerts: boolean;
  holdings: boolean;
  watchlist: boolean;
  notifications: boolean;
  portfolio: boolean;
}

interface StoreValue {
  // ── Market data (public) ──
  coins: Coin[];
  getCoin: (id: string) => Coin | undefined;
  socketStatus: SocketStatus;

  // ── Session ──
  user: PublicUser | null;
  signedIn: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  /** Takes a Google ID token; only Google's own SDK can mint one. */
  signInWithGoogle: (idToken: string) => Promise<boolean>;
  signOut: () => Promise<void>;

  // ── User data (spec 36: all of it is per-user, server-side) ──
  holdings: Holding[];
  alerts: Alert[];
  /** Coin ids, in the order the user added them. */
  watchlist: string[];
  notifications: AppNotification[];
  unreadCount: number;
  portfolio: PortfolioSummary;
  settings: UserSettings | null;

  // ── Writes. Each resolves false on failure, having already told the user. ──
  addHolding: (input: HoldingInput) => Promise<boolean>;
  removeHolding: (id: string) => Promise<boolean>;
  addAlert: (input: AlertInput) => Promise<boolean>;
  updateAlert: (id: string, patch: AlertPatch) => Promise<boolean>;
  removeAlert: (id: string) => Promise<boolean>;
  toggleWatchlist: (coinId: string) => Promise<boolean>;
  markNotificationRead: (id: string) => Promise<boolean>;
  markAllNotificationsRead: () => Promise<boolean>;
  updateSettings: (patch: SettingsPatch) => Promise<boolean>;
  updateProfile: (patch: { name: string }) => Promise<boolean>;
  changePassword: (input: { currentPassword?: string; newPassword: string }) => Promise<boolean>;

  // ── Alarm ──
  activeAlarm: AlarmPayload | null;
  alarmSoundEnabled: boolean;
  setAlarmSoundEnabled: (on: boolean) => void;
  stopAlarm: () => void;
  snoozeAlarm: () => void;

  loading: StoreLoading;
  /** One message for "the API isn't answering", so screens show a banner. */
  connectionError: string | null;
  refresh: () => void;
}

/**
 * Whether this device rings out loud.
 *
 * Device-local because it depends on this browser's audio permission, but mirrored
 * to the server once signed in: the server reads `settings.alarm.sound` when it
 * decides whether a push should ring a closed tab (spec 12), so for a signed-in
 * user the server's value is the one that matters and it wins on load.
 */
const ALARM_SOUND_KEY = "coinwake-alarm-sound";

const EMPTY_PORTFOLIO: PortfolioSummary = {
  value: 0,
  invested: 0,
  profit: 0,
  roi: 0,
  bestPerformer: null,
  worstPerformer: null,
  hasEstimatedCostBasis: false,
  rows: [],
};

const StoreContext = createContext<StoreValue | null>(null);

/** Spec 35: show the server's user-facing message, never a status code or stack. */
function report(error: unknown): void {
  const hint = errorHint(error);
  toast.error(errorMessage(error), hint ? { description: hint } : undefined);
}

function readAlarmSound(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ALARM_SOUND_KEY) === "true";
}

/** Turns a triggered-alert frame into something renderable for every alert kind. */
function toAlarmPayload(
  alert: Alert,
  coin: Coin | null,
  portfolio: PortfolioSummary | null,
): AlarmPayload {
  return {
    alert,
    coin,
    subject: alertSubject(alert, coin),
    // The overlay speaks the user's language: the unit they set the alert in.
    unit: alertDefinitionUnit(alert),
    target: alertThreshold(alert),
    current: alertCurrent(alert, coin, portfolio),
    previous: alertBaseline(alert, coin),
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const [signedIn, setSignedIn] = useState(false);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("idle");
  const [activeAlarm, setActiveAlarm] = useState<AlarmPayload | null>(null);
  const [alarmSoundEnabled, setAlarmSound] = useState(false);
  /** Coins the socket has priced that aren't in the top-50 list. */
  const [livePrices, setLivePrices] = useState<Record<string, Coin>>({});
  /** An alert id from ?alarm= or the service worker, held until it resolves. */
  const [pendingAlarmId, setPendingAlarmId] = useState<string | null>(null);

  // localStorage and the session both only exist in the browser, so the first
  // render has to match the server's HTML and adopt them immediately after.
  useEffect(() => {
    setSignedIn(isSignedIn());
    setAlarmSound(readAlarmSound());
    return onSessionChange((session) => setSignedIn(session !== null));
  }, []);

  // ── Reads ──────────────────────────────────────────────────────────────────

  const coinsQuery = useQuery({
    queryKey: queryKeys.coins,
    queryFn: () => coinsApi.list(50).then((r) => r.coins),
    // The socket pushes every update; this is only the initial snapshot and a
    // fallback for a tab whose socket never opened (spec 31: no polling).
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => authApi.me(),
    enabled: signedIn,
    staleTime: 5 * 60_000,
  });

  const alertsQuery = useQuery({
    queryKey: queryKeys.alerts,
    queryFn: () => alertsApi.list().then((r) => r.alerts),
    enabled: signedIn,
  });

  const holdingsQuery = useQuery({
    queryKey: queryKeys.holdings,
    queryFn: () => portfolioApi.holdings().then((r) => r.holdings),
    enabled: signedIn,
  });

  const watchlistQuery = useQuery({
    queryKey: queryKeys.watchlist,
    queryFn: () => watchlistApi.list().then((r) => r.watchlist),
    enabled: signedIn,
  });

  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => notificationsApi.list({ limit: 50 }),
    enabled: signedIn,
  });

  const portfolioQuery = useQuery({
    queryKey: queryKeys.portfolio,
    queryFn: () => portfolioApi.summary(),
    enabled: signedIn,
  });

  /**
   * The portfolio the cache already holds. Read on demand rather than taken as a
   * dependency: a portfolio alarm needs these figures, but the socket effect
   * must not resubscribe every time the portfolio value ticks.
   */
  const cachedPortfolio = useCallback(
    () =>
      client.getQueryData<{ portfolio: PortfolioSummary }>(queryKeys.portfolio)?.portfolio ?? null,
    [client],
  );

  // The server owns this flag once there's a session (see ALARM_SOUND_KEY).
  const serverAlarmSound = meQuery.data?.settings.alarm.sound;
  useEffect(() => {
    if (serverAlarmSound === undefined) return;
    setAlarmSound(serverAlarmSound);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ALARM_SOUND_KEY, String(serverAlarmSound));
    }
  }, [serverAlarmSound]);

  // ── The coin index ─────────────────────────────────────────────────────────

  /**
   * One lookup table for every coin the UI can mention: the market list, live
   * socket prices, watched coins outside the top 50, and coins held in the
   * portfolio. Without the last three, a coin ranked #300 would render blank.
   */
  const coinIndex = useMemo(() => {
    const index = new Map<string, Coin>();
    for (const coin of coinsQuery.data ?? []) index.set(coin.id, coin);
    for (const entry of watchlistQuery.data ?? []) {
      if (entry.coin) index.set(entry.coin.id, entry.coin);
    }
    for (const row of portfolioQuery.data?.portfolio.rows ?? []) {
      if (row.coin) index.set(row.coin.id, row.coin);
    }
    // Live frames are the freshest thing we have, so they land last.
    for (const coin of Object.values(livePrices)) index.set(coin.id, coin);
    return index;
  }, [coinsQuery.data, watchlistQuery.data, portfolioQuery.data, livePrices]);

  /** Market-list order, with live prices applied. */
  const coins = useMemo(
    () => (coinsQuery.data ?? []).map((coin) => coinIndex.get(coin.id) ?? coin),
    [coinsQuery.data, coinIndex],
  );

  const getCoin = useCallback((id: string) => coinIndex.get(id), [coinIndex]);

  // ── Realtime ───────────────────────────────────────────────────────────────

  useEffect(() => {
    realtime.connect();
    return realtime.onStatus(setSocketStatus);
  }, []);

  const alarmSoundRef = useRef(alarmSoundEnabled);
  alarmSoundRef.current = alarmSoundEnabled;

  useEffect(() => {
    const off = realtime.onMessage((message: ServerMessage) => {
      switch (message.type) {
        case "prices": {
          const next: Record<string, Coin> = {};
          for (const coin of message.payload.coins) next[coin.id] = coin;
          setLivePrices((current) => ({ ...current, ...next }));
          return;
        }

        case "notification": {
          // Prepend rather than refetch: the frame is the whole row (spec 31).
          client.setQueryData<{ notifications: AppNotification[]; unreadCount: number }>(
            queryKeys.notifications,
            (current) =>
              current
                ? {
                    notifications: [message.payload, ...current.notifications].slice(0, 50),
                    unreadCount: current.unreadCount + (message.payload.read ? 0 : 1),
                  }
                : { notifications: [message.payload], unreadCount: 1 },
          );
          return;
        }

        case "browser-notification": {
          sendBrowserNotification(message.payload.title, message.payload.body);
          return;
        }

        case "alert-triggered": {
          const { alert, coin, alarm } = message.payload;
          setActiveAlarm(toAlarmPayload(alert, coin, cachedPortfolio()));
          // Spec 11: only ring if the user armed sound on this device — audio
          // that was never unlocked by a gesture is silently dropped anyway.
          if (alarm && alert.notify.alarm && alarmSoundRef.current) void alarmEngine.start();
          void client.invalidateQueries({ queryKey: queryKeys.alerts });
          void client.invalidateQueries({ queryKey: queryKeys.alertProgress });
          return;
        }

        case "portfolio": {
          client.setQueryData<{
            portfolio: PortfolioSummary;
            peakValue: number;
            disclaimer: string;
          }>(queryKeys.portfolio, (current) =>
            current ? { ...current, portfolio: message.payload } : current,
          );
          return;
        }

        default:
          return;
      }
    });
    return off;
  }, [client, cachedPortfolio]);

  /**
   * Subscribe to exactly what this user cares about, so the server doesn't
   * broadcast the whole market to a tab showing four coins.
   */
  useEffect(() => {
    const wanted = new Set<string>();
    for (const alert of alertsQuery.data ?? []) if (alert.coinId) wanted.add(alert.coinId);
    for (const holding of holdingsQuery.data ?? []) wanted.add(holding.coinId);
    for (const entry of watchlistQuery.data ?? []) wanted.add(entry.coinId);
    for (const coin of coinsQuery.data ?? []) wanted.add(coin.id);
    realtime.subscribe([...wanted]);
  }, [alertsQuery.data, holdingsQuery.data, watchlistQuery.data, coinsQuery.data]);

  // ── The closed-tab alarm path (spec 11/12) ─────────────────────────────────

  /**
   * A push notification can't play audio, so a tap on it opens the app with
   * `?alarm=<id>` and the service worker messages any tab that's already open.
   * Both routes end up here.
   */
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get("alarm");
    if (fromUrl) {
      setPendingAlarmId(fromUrl);
      // Drop the parameter so a refresh doesn't re-ring an alarm they dismissed.
      url.searchParams.delete("alarm");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }

    return onServiceWorkerMessage((event) => {
      if (event.type === "coinwake:alarm" && event.payload.alertId) {
        setPendingAlarmId(event.payload.alertId);
      }
    });
  }, []);

  useEffect(() => {
    if (!pendingAlarmId) return;
    const alert = (alertsQuery.data ?? []).find((a) => a.id === pendingAlarmId);
    if (!alert) return;
    setPendingAlarmId(null);
    setActiveAlarm(
      toAlarmPayload(
        alert,
        alert.coinId ? (coinIndex.get(alert.coinId) ?? null) : null,
        cachedPortfolio(),
      ),
    );
    if (alert.notify.alarm && alarmSoundRef.current) void alarmEngine.start();
  }, [pendingAlarmId, alertsQuery.data, coinIndex, cachedPortfolio]);

  // ── Writes ─────────────────────────────────────────────────────────────────

  const invalidate = useCallback(
    (keys: ReadonlyArray<readonly unknown[]>) => {
      for (const key of keys) void client.invalidateQueries({ queryKey: key });
    },
    [client],
  );

  /**
   * Every write funnels through here so there is exactly one place that decides
   * what a failure looks like (spec 35) and one place that guards on a session.
   */
  const run = useCallback(
    async (action: () => Promise<unknown>, needsAuth = true): Promise<boolean> => {
      if (needsAuth && !isSignedIn()) {
        toast.error("Sign in to save that.", {
          description: "Your alerts and portfolio are tied to your account.",
        });
        return false;
      }
      try {
        await action();
        return true;
      } catch (error) {
        report(error);
        return false;
      }
    },
    [],
  );

  const addHolding = useCallback(
    (input: HoldingInput) =>
      run(async () => {
        await portfolioApi.addHolding(input);
        invalidate([queryKeys.holdings, queryKeys.portfolio, queryKeys.allocation]);
      }),
    [run, invalidate],
  );

  const removeHolding = useCallback(
    (id: string) =>
      run(async () => {
        await portfolioApi.removeHolding(id);
        invalidate([queryKeys.holdings, queryKeys.portfolio, queryKeys.allocation]);
      }),
    [run, invalidate],
  );

  const addAlert = useCallback(
    (input: AlertInput) =>
      run(async () => {
        await alertsApi.create(input);
        invalidate([queryKeys.alerts, queryKeys.alertProgress]);
      }),
    [run, invalidate],
  );

  const updateAlert = useCallback(
    (id: string, patch: AlertPatch) =>
      run(async () => {
        await alertsApi.update(id, patch);
        invalidate([queryKeys.alerts, queryKeys.alertProgress]);
      }),
    [run, invalidate],
  );

  const removeAlert = useCallback(
    (id: string) =>
      run(async () => {
        await alertsApi.remove(id);
        invalidate([queryKeys.alerts, queryKeys.alertProgress]);
      }),
    [run, invalidate],
  );

  const watchedIds = useMemo(
    () => (watchlistQuery.data ?? []).map((entry) => entry.coinId),
    [watchlistQuery.data],
  );

  const toggleWatchlist = useCallback(
    (coinId: string) =>
      run(async () => {
        if (watchedIds.includes(coinId)) await watchlistApi.remove(coinId);
        else await watchlistApi.add(coinId);
        invalidate([queryKeys.watchlist]);
      }),
    [run, invalidate, watchedIds],
  );

  const markNotificationRead = useCallback(
    (id: string) =>
      run(async () => {
        await notificationsApi.markRead(id);
        invalidate([queryKeys.notifications]);
      }),
    [run, invalidate],
  );

  const markAllNotificationsRead = useCallback(
    () =>
      run(async () => {
        await notificationsApi.markAllRead();
        invalidate([queryKeys.notifications]);
      }),
    [run, invalidate],
  );

  // ── Settings ───────────────────────────────────────────────────────────────

  /**
   * `["me"]` is invalidated alongside `settings` because `/settings` and
   * `/auth/me` both return the settings object, and a stale copy in the other
   * cache would fight the one just saved.
   */
  const updateSettings = useCallback(
    (patch: SettingsPatch) =>
      run(async () => {
        await settingsApi.update(patch);
        invalidate([queryKeys.settings, ["me"]]);
      }),
    [run, invalidate],
  );

  const updateProfile = useCallback(
    (patch: { name: string }) =>
      run(async () => {
        await settingsApi.updateProfile(patch);
        invalidate([queryKeys.settings, ["me"]]);
      }),
    [run, invalidate],
  );

  /** The endpoint rotates this device's tokens, so the session survives. */
  const changePassword = useCallback(
    (input: { currentPassword?: string; newPassword: string }) =>
      run(async () => {
        await settingsApi.changePassword(input);
        invalidate([queryKeys.settings, ["me"]]);
      }),
    [run, invalidate],
  );

  // ── Session ────────────────────────────────────────────────────────────────

  /** Spec 36: the cache still holds the previous user's rows — drop all of it. */
  const clearUserCache = useCallback(() => {
    for (const key of [
      ["me"],
      queryKeys.alerts,
      queryKeys.alertProgress,
      queryKeys.holdings,
      queryKeys.portfolio,
      queryKeys.allocation,
      queryKeys.watchlist,
      queryKeys.notifications,
      queryKeys.settings,
      ["alert-history"],
    ]) {
      client.removeQueries({ queryKey: key });
    }
  }, [client]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      clearUserCache();
      const ok = await run(() => authApi.login({ email, password }), false);
      if (ok) setSignedIn(true);
      return ok;
    },
    [run, clearUserCache],
  );

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      clearUserCache();
      const ok = await run(
        () => authApi.register({ email, password, ...(name ? { name } : {}) }),
        false,
      );
      if (ok) setSignedIn(true);
      return ok;
    },
    [run, clearUserCache],
  );

  /**
   * Exchange a Google ID token for a session. The token must come from Google's
   * own SDK, so the button that calls this only renders when the server has
   * Google auth configured and the app has a web client id.
   */
  const signInWithGoogle = useCallback(
    async (idToken: string) => {
      clearUserCache();
      const ok = await run(() => authApi.google(idToken), false);
      if (ok) setSignedIn(true);
      return ok;
    },
    [run, clearUserCache],
  );

  const signOut = useCallback(async () => {
    // `logout` clears the local session even if the request fails, so the user
    // is always signed out locally — never stuck in a half-signed-in state.
    await authApi.logout().catch(() => undefined);
    setSignedIn(false);
    setLivePrices({});
    clearUserCache();
  }, [clearUserCache]);

  // ── Alarm controls ─────────────────────────────────────────────────────────

  const setAlarmSoundEnabled = useCallback((on: boolean) => {
    setAlarmSound(on);
    if (typeof window !== "undefined") window.localStorage.setItem(ALARM_SOUND_KEY, String(on));
    if (!isSignedIn()) return;
    // Fire and forget: the toggle already took effect on this device, and the
    // server copy only affects whether a *push* rings later.
    void settingsApi.update({ alarm: { sound: on } }).catch(() => undefined);
  }, []);

  const stopAlarm = useCallback(() => {
    alarmEngine.stop();
    setActiveAlarm(null);
  }, []);

  /**
   * Snoozing is a server-side concern — the engine has to know not to re-fire —
   * so this disables the alert and lets the cooldown/repeat rules resume it.
   */
  const snoozeAlarm = useCallback(() => {
    alarmEngine.stop();
    setActiveAlarm((current) => {
      if (current) {
        void alertsApi
          .update(current.alert.id, { status: "DISABLED" })
          .then(() => invalidate([queryKeys.alerts]))
          .catch(() => undefined);
      }
      return null;
    });
    toast("Alert paused", {
      description: "Re-enable it from the Alerts screen when you're ready.",
    });
  }, [invalidate]);

  const refresh = useCallback(() => {
    void client.invalidateQueries();
  }, [client]);

  // ── Assembly ───────────────────────────────────────────────────────────────

  const loading: StoreLoading = {
    coins: coinsQuery.isPending,
    alerts: signedIn && alertsQuery.isPending,
    holdings: signedIn && holdingsQuery.isPending,
    watchlist: signedIn && watchlistQuery.isPending,
    notifications: signedIn && notificationsQuery.isPending,
    portfolio: signedIn && portfolioQuery.isPending,
  };

  // Only the public feed failing means "the API is down"; a 401 on user data is
  // a session problem the auth screens already explain.
  const connectionError = coinsQuery.isError ? errorMessage(coinsQuery.error) : null;

  const value: StoreValue = useMemo(
    () => ({
      coins,
      getCoin,
      socketStatus,
      user: meQuery.data?.user ?? null,
      signedIn,
      signIn,
      register,
      signInWithGoogle,
      signOut,
      holdings: holdingsQuery.data ?? [],
      alerts: alertsQuery.data ?? [],
      watchlist: watchedIds,
      notifications: notificationsQuery.data?.notifications ?? [],
      unreadCount: notificationsQuery.data?.unreadCount ?? 0,
      portfolio: portfolioQuery.data?.portfolio ?? EMPTY_PORTFOLIO,
      settings: meQuery.data?.settings ?? null,
      addHolding,
      removeHolding,
      addAlert,
      updateAlert,
      removeAlert,
      toggleWatchlist,
      markNotificationRead,
      markAllNotificationsRead,
      updateSettings,
      updateProfile,
      changePassword,
      activeAlarm,
      alarmSoundEnabled,
      setAlarmSoundEnabled,
      stopAlarm,
      snoozeAlarm,
      loading,
      connectionError,
      refresh,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      coins,
      getCoin,
      socketStatus,
      meQuery.data,
      signedIn,
      signIn,
      register,
      signInWithGoogle,
      signOut,
      holdingsQuery.data,
      alertsQuery.data,
      watchedIds,
      notificationsQuery.data,
      portfolioQuery.data,
      addHolding,
      removeHolding,
      addAlert,
      updateAlert,
      removeAlert,
      toggleWatchlist,
      markNotificationRead,
      markAllNotificationsRead,
      updateSettings,
      updateProfile,
      changePassword,
      activeAlarm,
      alarmSoundEnabled,
      setAlarmSoundEnabled,
      stopAlarm,
      snoozeAlarm,
      connectionError,
      refresh,
      loading.coins,
      loading.alerts,
      loading.holdings,
      loading.watchlist,
      loading.notifications,
      loading.portfolio,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
