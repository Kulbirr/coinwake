/** Web Audio based loud repeating alarm (no asset needed, autoplay-safe once unlocked). */
class AlarmEngine {
  private ctx: AudioContext | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private unlocked = false;

  isUnlocked() {
    return this.unlocked;
  }

  private ensureCtx() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    return this.ctx;
  }

  /** Must be called from a user gesture to satisfy autoplay policies. */
  async unlock() {
    const ctx = this.ensureCtx();
    if (!ctx) return false;
    await ctx.resume();
    this.unlocked = ctx.state === "running";
    return this.unlocked;
  }

  private beep(volume: number) {
    const ctx = this.ensureCtx();
    if (!ctx || ctx.state !== "running") return;
    const now = ctx.currentTime;
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now + i * 0.22);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + i * 0.22 + 0.2);
      gain.gain.setValueAtTime(0.0001, now + i * 0.22);
      gain.gain.exponentialRampToValueAtTime(volume, now + i * 0.22 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.22 + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.22);
      osc.stop(now + i * 0.22 + 0.24);
    });
  }

  async test(volume = 0.25) {
    await this.unlock();
    this.beep(volume);
  }

  async start(volume = 0.4) {
    await this.unlock();
    if (this.timer) return;
    this.beep(volume);
    this.timer = setInterval(() => this.beep(volume), 900);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([400, 200, 400]);
    }
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(0);
  }
}

export const alarmEngine = new AlarmEngine();

export async function requestBrowserNotifications(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  return Notification.requestPermission();
}

export function sendBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/favicon.ico" });
  } catch {
    /* ignore */
  }
}
