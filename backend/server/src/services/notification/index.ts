import webpush from "web-push";

import { env, pushEnabled } from "../../config/env.js";
import { createLogger } from "../../config/logger.js";
import { hub } from "../realtime/hub.js";
import type {
  NotificationPayload,
  NotificationProvider,
  PushResult,
  PushTarget,
} from "./NotificationProvider.js";

const log = createLogger("push");

let vapidReady = false;

function ensureVapid(): boolean {
  if (vapidReady) return true;
  if (!pushEnabled) return false;

  try {
    webpush.setVapidDetails(
      env.VAPID_SUBJECT,
      env.VAPID_PUBLIC_KEY as string,
      env.VAPID_PRIVATE_KEY as string,
    );
    vapidReady = true;
    return true;
  } catch (err) {
    log.error(`Invalid VAPID configuration: ${(err as Error).message}`);
    return false;
  }
}

/**
 * Web Push over VAPID (spec 12). This is the channel that makes the product
 * work: the alert engine runs server-side, so a target can be hit and the user
 * woken with every tab closed (spec 30).
 *
 * Email is intentionally a no-op stub — the interface reserves the channel so the
 * alert engine already calls it, and dropping in SES/Resend later touches only
 * this file. It logs instead of silently pretending to send.
 */
export class WebPushProvider implements NotificationProvider {
  readonly name = "web-push";

  get pushConfigured(): boolean {
    return ensureVapid();
  }

  readonly emailConfigured = false;

  async sendPush(targets: PushTarget[], payload: NotificationPayload): Promise<PushResult> {
    const result: PushResult = { sent: 0, expired: [], failed: 0 };
    if (targets.length === 0 || !ensureVapid()) return result;

    const body = JSON.stringify(payload);

    await Promise.all(
      targets.map(async (target) => {
        try {
          await webpush.sendNotification(
            { endpoint: target.endpoint, keys: target.keys },
            body,
            // Alarms are useless late, so they get a short TTL and high urgency.
            { TTL: payload.alarm ? 120 : 1800, urgency: payload.alarm ? "high" : "normal" },
          );
          result.sent += 1;
        } catch (err) {
          const status = (err as { statusCode?: number }).statusCode;
          // 404/410 mean the subscription is dead — the caller prunes it.
          if (status === 404 || status === 410) result.expired.push(target.endpoint);
          else {
            result.failed += 1;
            log.warn(`Push to ${target.endpoint.slice(0, 40)}… failed (${status ?? "no status"}).`);
          }
        }
      }),
    );

    return result;
  }

  async sendBrowserNotification(userId: string, payload: NotificationPayload): Promise<void> {
    // The server can't touch the Notification API; the open tab raises it.
    hub.sendToUser(userId, { type: "browser-notification", payload });
  }

  async sendEmail(to: string, payload: NotificationPayload): Promise<void> {
    log.info(`Email channel not configured — would have emailed ${to}: ${payload.title}`);
  }
}

let provider: NotificationProvider | null = null;

export function getNotificationProvider(): NotificationProvider {
  if (!provider) {
    provider = new WebPushProvider();
    if (!provider.pushConfigured) {
      log.warn(
        "VAPID keys are not set — push is disabled. Run `npx web-push generate-vapid-keys` and set VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY.",
      );
    }
  }
  return provider;
}
