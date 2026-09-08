/*
 * CoinWake service worker.
 *
 * Its only job is Web Push. The alert engine runs server-side (spec 30), so a
 * target can be hit with every tab closed — this file is what turns that into
 * something the user actually sees.
 *
 * Deliberately no asset caching. A cache-first shell would serve a stale build
 * after every deploy, and offline support buys nothing for an app whose entire
 * value is live prices. Registering a SW does not by itself change how the app
 * is served.
 */

/** Raise the alarm before the browser suspends us again. */
const ALARM_VIBRATION = [400, 200, 400, 200, 400, 200, 400];

self.addEventListener("install", () => {
  // Take over immediately so a newly deployed worker handles the next push
  // rather than waiting for every tab to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/**
 * The server sends a JSON NotificationPayload. Anything else is a probe from the
 * push service or a malformed send — show the generic form rather than throwing,
 * because a push event that rejects can cost us the subscription.
 */
function readPayload(event) {
  const fallback = { kind: "SYSTEM", title: "CoinWake", body: "Open CoinWake to see what changed." };
  if (!event.data) return fallback;
  try {
    const parsed = event.data.json();
    if (!parsed || typeof parsed !== "object") return fallback;
    return {
      ...parsed,
      title: typeof parsed.title === "string" && parsed.title ? parsed.title : fallback.title,
      body: typeof parsed.body === "string" && parsed.body ? parsed.body : fallback.body,
    };
  } catch {
    return { ...fallback, body: event.data.text() || fallback.body };
  }
}

/** Where a click should land, carrying enough context to reopen the alarm cold. */
function targetUrl(payload) {
  const base = typeof payload.url === "string" && payload.url.startsWith("/")
    ? payload.url
    : payload.coinId
      ? `/coin/${encodeURIComponent(payload.coinId)}`
      : "/dashboard";
  if (!payload.alarm || !payload.alertId) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}alarm=${encodeURIComponent(payload.alertId)}`;
}

self.addEventListener("push", (event) => {
  const payload = readPayload(event);
  const isAlarm = payload.alarm === true;

  const options = {
    body: payload.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    // One notification per alert: a re-trigger replaces the old one instead of
    // stacking, but still alerts the user again.
    tag: payload.alertId || payload.kind || "coinwake",
    renotify: true,
    timestamp: Date.now(),
    data: { ...payload, url: targetUrl(payload) },
  };

  if (isAlarm) {
    // requireInteraction keeps it on screen until dismissed (desktop); vibrate is
    // Android-only. Both are ignored elsewhere rather than erroring.
    options.requireInteraction = true;
    options.vibrate = ALARM_VIBRATION;
    options.actions = [
      { action: "open", title: "Open alarm" },
      { action: "dismiss", title: "Dismiss" },
    ];
  }

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(payload.title, options);

      // A tab may exist but be backgrounded, which is exactly when the phone is
      // in a pocket. Tell it to sound the siren — a notification alone cannot
      // play audio, so this is the only path to a loud alarm (spec 11).
      if (!isAlarm) return;
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clients) {
        client.postMessage({ type: "coinwake:alarm", payload });
      }
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  const payload = event.notification.data || {};
  event.notification.close();

  if (event.action === "dismiss") return;

  event.waitUntil(
    (async () => {
      const url = new URL(payload.url || "/dashboard", self.location.origin);
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });

      // Reuse an open window when there is one — opening a second copy of the
      // app loses whatever the user was doing.
      const existing = clients.find((c) => new URL(c.url).origin === url.origin);
      if (existing) {
        await existing.focus();
        if ("navigate" in existing && new URL(existing.url).pathname !== url.pathname) {
          await existing.navigate(url.href).catch(() => {});
        }
        existing.postMessage({ type: "coinwake:open", payload });
        return;
      }

      await self.clients.openWindow(url.href);
    })(),
  );
});

/**
 * Fires when the push service rotates or revokes the subscription. We cannot
 * reach the API without the user's token from here, so the page re-subscribes on
 * its next load; clearing nothing is safer than deleting a subscription the
 * server still has.
 */
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clients) {
        client.postMessage({ type: "coinwake:resubscribe" });
      }
    })(),
  );
});
