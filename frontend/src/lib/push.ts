import { ApiClientError } from "./api/client";
import { push } from "./api/endpoints";
import { isSignedIn } from "./api/session";
import type { NotificationPayload } from "./api/types";

/**
 * Service worker registration and Web Push subscription (spec 12).
 *
 * The worker is what lets a target reach the user when the tab is closed, which
 * is the whole promise of the product — the server decides when to send (spec 30),
 * this only arranges for delivery and relays what arrives to the running app.
 */

const SW_URL = "/sw.js";

export type PushSupport = { supported: true } | { supported: false; reason: string; hint?: string };

/**
 * Why push can't work here, in words worth showing.
 *
 * iOS is the case that surprises people: Safari 16.4+ has Web Push, but only for
 * a site installed to the Home Screen, so `PushManager` is simply absent in the
 * browser tab.
 */
export function pushSupport(): PushSupport {
  if (typeof window === "undefined") return { supported: false, reason: "Not available here." };

  if (!("serviceWorker" in navigator)) {
    return {
      supported: false,
      reason: "This browser can't receive push notifications.",
      hint: "Try Chrome, Edge, Firefox or Safari 16.4+.",
    };
  }

  // Tested via a boolean rather than inline: `"Notification" in window` narrows
  // `window` to `never` inside the branch, because the DOM types insist every
  // Window has these APIs — which is exactly the runtime case being checked (an
  // iOS browser tab really has no PushManager).
  const canReceivePush = "Notification" in window && "PushManager" in window;

  if (!canReceivePush) {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const installed =
      window.matchMedia?.("(display-mode: standalone)").matches === true ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (iOS && !installed) {
      return {
        supported: false,
        reason: "iPhone and iPad need CoinWake added to your Home Screen first.",
        hint: "Tap Share, then Add to Home Screen, then open it from there.",
      };
    }
    return { supported: false, reason: "This browser can't receive push notifications." };
  }

  return { supported: true };
}

let registration: ServiceWorkerRegistration | null = null;
let registering: Promise<ServiceWorkerRegistration | null> | null = null;

/** Registers the worker once per tab; returns null where workers don't exist. */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  if (registration) return registration;
  if (registering) return registering;

  registering = navigator.serviceWorker
    .register(SW_URL, { scope: "/" })
    .then((reg) => {
      registration = reg;
      return reg;
    })
    .catch(() => null)
    .finally(() => {
      registering = null;
    });

  return registering;
}

/** VAPID keys arrive base64url; PushManager wants raw bytes. */
function decodeVapidKey(base64Url: string): Uint8Array {
  const padded = base64Url.padEnd(base64Url.length + ((4 - (base64Url.length % 4)) % 4), "=");
  const raw = window.atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function toJson(subscription: PushSubscription): {
  endpoint: string;
  keys: { p256dh: string; auth: string };
} | null {
  const json = subscription.toJSON();
  const p256dh = json.keys?.["p256dh"];
  const auth = json.keys?.["auth"];
  if (!json.endpoint || !p256dh || !auth) return null;
  return { endpoint: json.endpoint, keys: { p256dh, auth } };
}

export type EnablePushResult =
  | { ok: true; endpoint: string }
  | { ok: false; reason: string; hint?: string; permissionDenied?: boolean };

/**
 * Asks for permission, subscribes, and registers the subscription with the API.
 *
 * Call it from a click. Browsers ignore — or permanently block — a permission
 * prompt that wasn't triggered by a user gesture.
 */
export async function enablePush(): Promise<EnablePushResult> {
  const support = pushSupport();
  if (!support.supported) {
    return { ok: false, reason: support.reason, ...(support.hint ? { hint: support.hint } : {}) };
  }

  if (!isSignedIn()) {
    return {
      ok: false,
      reason: "Sign in first so we know where to send your alerts.",
    };
  }

  if (Notification.permission === "denied") {
    return {
      ok: false,
      reason: "Notifications are blocked for this site.",
      hint: "Allow notifications in your browser's site settings, then try again.",
      permissionDenied: true,
    };
  }

  let publicKey: string;
  try {
    publicKey = (await push.publicKey()).publicKey;
  } catch (err) {
    if (err instanceof ApiClientError) {
      return { ok: false, reason: err.message, ...(err.hint ? { hint: err.hint } : {}) };
    }
    return { ok: false, reason: "We couldn't set up notifications just now." };
  }

  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        ok: false,
        reason: "Notifications stay off until you allow them.",
        permissionDenied: permission === "denied",
      };
    }
  }

  const reg = await registerServiceWorker();
  if (!reg) return { ok: false, reason: "We couldn't start the background service." };

  // A worker that hasn't activated yet can't own a subscription.
  await navigator.serviceWorker.ready;

  let subscription: PushSubscription | null;
  try {
    subscription = await reg.pushManager.getSubscription();

    // A subscription made against a different VAPID key is dead to this server,
    // and the browser refuses to re-subscribe over it — drop it and start again.
    if (subscription) {
      const existing = subscription.options.applicationServerKey;
      const wanted = decodeVapidKey(publicKey);
      if (!existing || !sameKey(existing, wanted)) {
        await subscription.unsubscribe().catch(() => false);
        subscription = null;
      }
    }

    subscription ??= await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeVapidKey(publicKey) as BufferSource,
    });
  } catch {
    return {
      ok: false,
      reason: "Your browser wouldn't create a notification subscription.",
      hint: "This can happen in private windows. Try a normal window.",
    };
  }

  const body = toJson(subscription);
  if (!body) return { ok: false, reason: "Your browser returned an unusable subscription." };

  try {
    await push.subscribe(body);
  } catch (err) {
    if (err instanceof ApiClientError) {
      return { ok: false, reason: err.message, ...(err.hint ? { hint: err.hint } : {}) };
    }
    return { ok: false, reason: "We couldn't save your notification settings." };
  }

  return { ok: true, endpoint: body.endpoint };
}

function sameKey(a: ArrayBuffer, b: Uint8Array): boolean {
  const left = new Uint8Array(a);
  if (left.length !== b.length) return false;
  return left.every((byte, i) => byte === b[i]);
}

/** Unsubscribes this device, server-side first so it stops being sent to. */
export async function disablePush(): Promise<void> {
  const reg = await registerServiceWorker();
  const subscription = await reg?.pushManager.getSubscription();
  if (!subscription) return;

  try {
    await push.unsubscribe(subscription.endpoint);
  } catch {
    // Even if the server call fails, unsubscribing locally is the user's intent.
  }
  await subscription.unsubscribe().catch(() => false);
}

export async function isPushEnabled(): Promise<boolean> {
  if (!pushSupport().supported || Notification.permission !== "granted") return false;
  const reg = await registerServiceWorker();
  return Boolean(await reg?.pushManager.getSubscription());
}

/**
 * Re-registers the current subscription with the API.
 *
 * Push endpoints rotate on their own — the browser fires `pushsubscriptionchange`
 * and the old endpoint stops working. Cheap enough to call on every sign-in.
 */
export async function syncPushSubscription(): Promise<void> {
  if (!isSignedIn() || !pushSupport().supported) return;
  if (Notification.permission !== "granted") return;

  const reg = await registerServiceWorker();
  const subscription = await reg?.pushManager.getSubscription();
  if (!subscription) return;

  const body = toJson(subscription);
  if (!body) return;

  try {
    await push.subscribe(body);
  } catch {
    // Nothing a user can do about this; the next sign-in tries again.
  }
}

/** Messages sw.js posts to the page. */
export type ServiceWorkerEvent =
  | { type: "coinwake:alarm"; payload: NotificationPayload }
  | { type: "coinwake:open"; payload: NotificationPayload }
  | { type: "coinwake:resubscribe" };

/**
 * Subscribes to those messages.
 *
 * The alarm one matters: a push notification cannot play audio by itself, so the
 * worker waking the page is the only way a closed tab turns into a loud alarm
 * (spec 11). `coinwake:resubscribe` is handled here rather than in the caller
 * because the response is always the same.
 */
export function onServiceWorkerMessage(handler: (event: ServiceWorkerEvent) => void): () => void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return () => {};

  const listener = (event: MessageEvent) => {
    const data = event.data as ServiceWorkerEvent | undefined;
    if (!data || typeof data.type !== "string" || !data.type.startsWith("coinwake:")) return;

    if (data.type === "coinwake:resubscribe") {
      void syncPushSubscription();
    }
    handler(data);
  };

  navigator.serviceWorker.addEventListener("message", listener);
  return () => navigator.serviceWorker.removeEventListener("message", listener);
}
