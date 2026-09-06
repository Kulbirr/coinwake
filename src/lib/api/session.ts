import type { TokenPair } from "./types";

/**
 * Where the signed-in session lives on the client.
 *
 * Tokens are kept in localStorage so a refresh doesn't sign the user out. The
 * server hands them back in the response body rather than as httpOnly cookies —
 * the API is a separate origin from the app, and the same tokens have to work for
 * a future React Native client, which has no cookie jar. The trade-off is that
 * these are readable by any script on the page, so the access token is
 * deliberately short-lived (15m) and "sign out everywhere" bumps a server-side
 * tokenVersion that invalidates every refresh token at once.
 */

const STORAGE_KEY = "coinwake-session-v1";

interface StoredSession {
  accessToken: string;
  refreshToken: string;
}

let session: StoredSession | null = null;
let loaded = false;

type Listener = (session: StoredSession | null) => void;
const listeners = new Set<Listener>();

function read(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if (!parsed.accessToken || !parsed.refreshToken) return null;
    return { accessToken: parsed.accessToken, refreshToken: parsed.refreshToken };
  } catch {
    return null;
  }
}

/** Lazily hydrated: during SSR there is no storage, and reading it on import
 *  would run on the server and poison the module for every request. */
function current(): StoredSession | null {
  if (!loaded && typeof window !== "undefined") {
    session = read();
    loaded = true;
  }
  return session;
}

export function getAccessToken(): string | null {
  return current()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return current()?.refreshToken ?? null;
}

export function isSignedIn(): boolean {
  return current() !== null;
}

export function setSession(tokens: TokenPair | null): void {
  session = tokens ? { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken } : null;
  loaded = true;

  if (typeof window !== "undefined") {
    if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(STORAGE_KEY);
  }

  for (const listener of listeners) listener(session);
}

export function clearSession(): void {
  setSession(null);
}

/** Notifies on sign-in and sign-out so the socket can re-authenticate. */
export function onSessionChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
