import type { NotificationKind } from "../../core/types.js";

export interface PushTarget {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface NotificationPayload {
  kind: NotificationKind;
  title: string;
  body: string;
  coinId?: string;
  alertId?: string;
  /** Tells the service worker to open the full-screen alarm (spec 11). */
  alarm?: boolean;
  url?: string;
}

export interface PushResult {
  sent: number;
  /** Endpoints the push service rejected as gone — the caller should delete them. */
  expired: string[];
  failed: number;
}

/**
 * Delivery channels (spec 12). Kept behind an interface so swapping web-push for
 * FCM/APNs, or a transactional email vendor for SES, is a new implementation
 * rather than an edit to the alert engine.
 */
export interface NotificationProvider {
  readonly name: string;

  /** True when the channel is actually configured; callers skip it otherwise. */
  readonly pushConfigured: boolean;
  readonly emailConfigured: boolean;

  sendPush(targets: PushTarget[], payload: NotificationPayload): Promise<PushResult>;

  /**
   * In-app/browser notification. The server can't call the Notification API, so
   * this pushes the payload down the user's WebSocket and the client raises it.
   */
  sendBrowserNotification(userId: string, payload: NotificationPayload): Promise<void>;

  sendEmail(to: string, payload: NotificationPayload): Promise<void>;
}
