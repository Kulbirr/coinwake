import { socketUrl } from "./client";
import { getAccessToken, onSessionChange } from "./session";
import type { ServerMessage } from "./types";

/**
 * The single WebSocket the app opens to the API.
 *
 * Spec 30/31: prices are computed and alerts are evaluated on the server, and one
 * socket per tab fans out to every screen — no component polls, and nothing here
 * decides when an alert fires. This module only transports frames and keeps the
 * connection alive across sleep, network changes and sign-in.
 */

type Handler = (message: ServerMessage) => void;
type StatusHandler = (status: SocketStatus) => void;

export type SocketStatus = "idle" | "connecting" | "open" | "reconnecting" | "closed";

/** Backoff schedule in ms; the last value repeats for as long as it takes. */
const BACKOFF = [1_000, 2_000, 5_000, 10_000, 30_000];
const PING_INTERVAL_MS = 25_000;

let socket: WebSocket | null = null;
let status: SocketStatus = "idle";
let attempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let pingTimer: ReturnType<typeof setInterval> | null = null;
/** Set once we intentionally stop, so a close event doesn't reconnect. */
let stopped = true;

const handlers = new Set<Handler>();
const statusHandlers = new Set<StatusHandler>();

/** Coins the app wants; empty means "everything the server broadcasts". */
let subscribedCoins: string[] = [];

function setStatus(next: SocketStatus): void {
  if (status === next) return;
  status = next;
  for (const handler of statusHandlers) handler(next);
}

function send(message: Record<string, unknown>): void {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function clearTimers(): void {
  if (reconnectTimer !== null) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (pingTimer !== null) {
    clearInterval(pingTimer);
    pingTimer = null;
  }
}

function scheduleReconnect(): void {
  if (stopped || reconnectTimer !== null) return;
  const delay = BACKOFF[Math.min(attempt, BACKOFF.length - 1)] ?? 30_000;
  attempt += 1;
  setStatus("reconnecting");
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    open();
  }, delay);
}

function open(): void {
  if (typeof window === "undefined") return;
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  // The browser WebSocket API can't set an Authorization header, so the token
  // rides in the query string. An invalid one connects anonymously rather than
  // failing, which is what keeps public price data flowing when signed out.
  const token = getAccessToken();
  const url = token ? `${socketUrl()}?token=${encodeURIComponent(token)}` : socketUrl();

  setStatus(attempt === 0 ? "connecting" : "reconnecting");

  let next: WebSocket;
  try {
    next = new WebSocket(url);
  } catch {
    scheduleReconnect();
    return;
  }
  socket = next;

  next.addEventListener("open", () => {
    if (socket !== next) return;
    attempt = 0;
    setStatus("open");
    send({ type: "subscribe", coins: subscribedCoins });

    // The server terminates sockets that miss its heartbeat; this keeps the
    // connection alive through proxies that drop idle streams too.
    pingTimer = setInterval(() => send({ type: "ping" }), PING_INTERVAL_MS);
  });

  next.addEventListener("message", (event) => {
    if (socket !== next) return;
    let parsed: ServerMessage;
    try {
      parsed = JSON.parse(String(event.data)) as ServerMessage;
    } catch {
      return;
    }
    if (!parsed || typeof parsed !== "object" || typeof parsed.type !== "string") return;
    if (parsed.type === "pong") return;
    for (const handler of handlers) handler(parsed);
  });

  next.addEventListener("close", () => {
    if (socket !== next) return;
    socket = null;
    clearTimers();
    if (stopped) {
      setStatus("closed");
      return;
    }
    scheduleReconnect();
  });

  next.addEventListener("error", () => {
    // "error" is always followed by "close", which owns the reconnect.
    if (socket === next) next.close();
  });
}

function reconnectNow(): void {
  clearTimers();
  attempt = 0;
  const previous = socket;
  socket = null;
  previous?.close();
  if (!stopped) open();
}

let listenersBound = false;

/** Reconnects on wake and on regaining network, where a socket dies silently. */
function bindWindowListeners(): void {
  if (listenersBound || typeof window === "undefined") return;
  listenersBound = true;

  window.addEventListener("online", () => {
    if (!stopped && status !== "open") reconnectNow();
  });

  document.addEventListener("visibilitychange", () => {
    // A phone that was asleep often reports an OPEN socket that no longer
    // delivers; on returning to the tab, prove it by pinging.
    if (document.visibilityState !== "visible" || stopped) return;
    if (socket?.readyState === WebSocket.OPEN) send({ type: "ping" });
    else reconnectNow();
  });

  // Sign-in and sign-out both change who the socket is, so re-handshake.
  onSessionChange(() => {
    if (!stopped) reconnectNow();
  });
}

export const realtime = {
  /** Idempotent; safe to call from every mount. */
  connect(): void {
    if (typeof window === "undefined") return;
    stopped = false;
    bindWindowListeners();
    open();
  },

  disconnect(): void {
    stopped = true;
    clearTimers();
    const previous = socket;
    socket = null;
    previous?.close();
    setStatus("closed");
  },

  /** Empty list = all broadcast coins. Sent immediately when already open. */
  subscribe(coins: string[]): void {
    subscribedCoins = coins;
    send({ type: "subscribe", coins });
  },

  onMessage(handler: Handler): () => void {
    handlers.add(handler);
    return () => handlers.delete(handler);
  },

  onStatus(handler: StatusHandler): () => void {
    statusHandlers.add(handler);
    handler(status);
    return () => statusHandlers.delete(handler);
  },

  status(): SocketStatus {
    return status;
  },
};
