import type { Server } from "node:http";

import { WebSocketServer, type WebSocket } from "ws";

import { createLogger } from "../config/logger.js";
import { verifyAccessToken } from "./tokens.js";
import { hub, type RealtimeClient } from "./realtime/hub.js";

const log = createLogger("ws");

const HEARTBEAT_MS = 30_000;

interface ClientMessage {
  type?: string;
  coins?: unknown;
  token?: unknown;
}

/**
 * WebSocket fan-out for live prices and alert triggers (spec 31).
 *
 * Auth is optional: an anonymous socket gets market data, and a token upgrades it
 * to receive that user's notifications. The token is verified here — a socket
 * never gets to name its own user id.
 */
export function attachWebSocketServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (socket: WebSocket, request) => {
    // The browser WebSocket API can't set headers, so the token rides in the
    // query string. It's an access token: short-lived and replaceable.
    const url = new URL(request.url ?? "/ws", "http://localhost");
    const token = url.searchParams.get("token");

    let userId: string | null = null;
    if (token) {
      try {
        userId = verifyAccessToken(token).sub;
      } catch {
        // Fall through as anonymous rather than dropping the socket — prices are
        // public, and the client can re-authenticate with an `auth` message.
        log.debug("Rejected an invalid socket token; continuing anonymously.");
      }
    }

    const client = hub.add(socket, userId);
    hub.send(client, {
      type: "hello",
      payload: { authenticated: Boolean(userId), serverTime: Date.now() },
    });

    socket.on("message", (raw) => handleMessage(client, raw.toString()));
    socket.on("pong", () => {
      client.alive = true;
    });

    socket.on("close", () => hub.remove(client));
    socket.on("error", (err: Error) => {
      log.debug(`Socket error: ${err.message}`);
      hub.remove(client);
    });
  });

  // Drop sockets that stop answering pings; otherwise dead mobile connections
  // accumulate and we keep serialising updates for nobody. A socket that missed
  // the previous round is gone: `alive` is set back to true by its pong handler.
  const heartbeat = setInterval(() => {
    hub.eachClient((client) => {
      if (client.socket.readyState !== 1) return;
      if (!client.alive) {
        client.socket.terminate();
        hub.remove(client);
        return;
      }
      client.alive = false;
      client.socket.ping();
    });
  }, HEARTBEAT_MS);
  heartbeat.unref();

  wss.on("close", () => clearInterval(heartbeat));

  log.info("WebSocket server listening on /ws");
  return wss;
}

function handleMessage(client: RealtimeClient, raw: string): void {
  let message: ClientMessage;
  try {
    message = JSON.parse(raw) as ClientMessage;
  } catch {
    return;
  }

  switch (message.type) {
    case "subscribe": {
      // An empty list means "everything"; a list narrows the price stream so a
      // phone on mobile data isn't sent 60 coins it isn't showing.
      const coins = Array.isArray(message.coins) ? message.coins : [];
      client.coins.clear();
      for (const coin of coins) {
        if (typeof coin === "string" && coin.length > 0 && coin.length < 64) {
          client.coins.add(coin);
        }
      }
      break;
    }

    case "auth": {
      if (typeof message.token !== "string") break;
      try {
        const { sub } = verifyAccessToken(message.token);
        hub.authenticate(client, sub);
      } catch {
        log.debug("Ignored an invalid auth message.");
      }
      break;
    }

    case "ping":
      hub.send(client, { type: "pong", payload: { t: Date.now() } });
      break;

    default:
      break;
  }
}
