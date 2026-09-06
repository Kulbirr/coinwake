import type { WebSocket } from "ws";

import { createLogger } from "../../config/logger.js";
import type { Alert, Coin, Notification, PortfolioSummary } from "../../core/types.js";
import type { NotificationPayload } from "../notification/NotificationProvider.js";

const log = createLogger("realtime");

export type ServerMessage =
  | { type: "hello"; payload: { authenticated: boolean; serverTime: number } }
  | { type: "prices"; payload: { coins: Coin[] } }
  | { type: "notification"; payload: Notification }
  | { type: "browser-notification"; payload: NotificationPayload }
  | { type: "alert-triggered"; payload: { alert: Alert; coin: Coin | null; alarm: boolean } }
  | { type: "portfolio"; payload: PortfolioSummary }
  | { type: "pong"; payload: { t: number } };

interface Client {
  socket: WebSocket;
  userId: string | null;
  /** Coin ids this client cares about; empty means "all". */
  coins: Set<string>;
  alive: boolean;
}

/**
 * One server-side fan-out for every connected browser (spec 31). The price
 * service polls the market once and pushes here — clients never poll the vendor
 * themselves, and never each other's data.
 */
class RealtimeHub {
  private readonly clients = new Set<Client>();
  private readonly byUser = new Map<string, Set<Client>>();

  add(socket: WebSocket, userId: string | null): Client {
    const client: Client = { socket, userId, coins: new Set(), alive: true };
    this.clients.add(client);

    if (userId) {
      const existing = this.byUser.get(userId) ?? new Set<Client>();
      existing.add(client);
      this.byUser.set(userId, existing);
    }

    return client;
  }

  remove(client: Client): void {
    this.clients.delete(client);
    if (!client.userId) return;

    const set = this.byUser.get(client.userId);
    if (!set) return;
    set.delete(client);
    if (set.size === 0) this.byUser.delete(client.userId);
  }

  /**
   * Attaches an identity to a socket that connected anonymously, re-indexing the
   * same client object. It has to be the same object: the socket's close handler
   * closes over it, so swapping in a replacement would leak the new one and
   * leave `subscribe` writing to a client the hub no longer holds.
   */
  authenticate(client: Client, userId: string): void {
    if (client.userId === userId) return;

    if (client.userId) {
      const previous = this.byUser.get(client.userId);
      previous?.delete(client);
      if (previous?.size === 0) this.byUser.delete(client.userId);
    }

    client.userId = userId;
    const set = this.byUser.get(userId) ?? new Set<Client>();
    set.add(client);
    this.byUser.set(userId, set);
  }

  get connectionCount(): number {
    return this.clients.size;
  }

  /** User ids with at least one live socket — the price service uses this to
   *  decide whose portfolio needs recomputing on a tick. */
  connectedUserIds(): string[] {
    return [...this.byUser.keys()];
  }

  private write(client: Client, message: ServerMessage): void {
    // 1 === WebSocket.OPEN; comparing numerically avoids importing the runtime class.
    if (client.socket.readyState !== 1) return;
    try {
      client.socket.send(JSON.stringify(message));
    } catch (err) {
      log.warn(`Dropping a socket after a send failure: ${(err as Error).message}`);
      this.remove(client);
    }
  }

  send(client: Client, message: ServerMessage): void {
    this.write(client, message);
  }

  sendToUser(userId: string, message: ServerMessage): void {
    for (const client of this.byUser.get(userId) ?? []) this.write(client, message);
  }

  /** Price ticks go to everyone, filtered to each client's subscription. */
  broadcastPrices(coins: Coin[]): void {
    if (coins.length === 0) return;

    for (const client of this.clients) {
      const filtered = client.coins.size === 0 ? coins : coins.filter((c) => client.coins.has(c.id));
      if (filtered.length === 0) continue;
      this.write(client, { type: "prices", payload: { coins: filtered } });
    }
  }

  /** Used by the heartbeat to reach the liveness flag on each client. */
  eachClient(visit: (client: Client) => void): void {
    for (const client of [...this.clients]) visit(client);
  }
}

export const hub = new RealtimeHub();
export type { Client as RealtimeClient };
