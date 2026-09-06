# CoinWake — backend

> Set your target. We'll wake you up.

The server half of CoinWake. It owns everything the browser must not: third-party
API keys, the price poller, the alert engine and notification delivery.

**The alert engine runs here, on a timer, not in the browser.** Close the tab, put
the phone in a drawer — targets are still being watched, and a triggered alert
still produces a push notification.

```
React / PWA
    │  REST + WebSocket
    ▼
Express API ──► MongoDB (users, holdings, alerts, history)
    │        └► Redis    (price cache, rate limits)
    ├──► Crypto Price Service   ── one poll per server, fanned out to every client
    ├──► Alert Engine           ── evaluates every armed alert each tick
    └──► Notification Service   ── Web Push, WebSocket, email
```

---

## Quick start

```bash
cd server
npm install
npm run seed
npm run dev
```

That's it — no Docker, no API key, no database to install. With `MONGODB_URI`
unset the server boots an in-memory MongoDB, with `REDIS_URL` unset it uses an
in-process cache, and with `CRYPTO_PROVIDER=mock` (the default) it serves a
simulated market that actually moves, so alerts have something to cross.

The API comes up on <http://localhost:4000>, the WebSocket on `ws://localhost:4000/ws`.

Seeded demo login: **demo@coinwake.app** / **coinwake-demo**

Check it's alive:

```bash
curl http://localhost:4000/api/healthz
```

Ask what the deployment can do (the frontend uses this to hide unconfigured
features rather than fail when they're used):

```bash
curl http://localhost:4000/api/config
```

### Going live

Set `CRYPTO_PROVIDER=coingecko` for real prices, `WALLET_PROVIDER=live` for real
on-chain balances, and generate a VAPID keypair for push:

```bash
npx web-push generate-vapid-keys
```

Production refuses to start with default JWT secrets, without `MONGODB_URI`, or
with `WALLET_PROVIDER=mock` — a mock signature verifier would let anyone claim
any wallet address.

---

## Scripts

| Command             | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Watch mode via `tsx`                                |
| `npm run build`     | Compile to `dist/`                                  |
| `npm start`         | Run the compiled build                              |
| `npm run typecheck` | `tsc --noEmit`                                      |
| `npm run seed`      | Demo user, portfolio, alerts and watchlist (spec 42) |

---

## Environment

Copy `.env.example` to `.env`. Everything has a working development default, so
an empty `.env` is a valid `.env`.

| Variable                                | Default                              | Notes                                                                    |
| --------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------ |
| `PORT`                                  | `4000`                               |                                                                          |
| `CORS_ORIGIN`                           | `http://localhost:8080,…:5173`       | Comma-separated allow-list                                               |
| `MONGODB_URI`                           | _(in-memory)_                        | Required in production                                                   |
| `REDIS_URL`                             | _(in-process cache)_                 | Required before running more than one instance                           |
| `JWT_ACCESS_SECRET` / `_REFRESH_SECRET` | dev values                           | Production refuses the defaults                                          |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL`    | `15m` / `30d`                        |                                                                          |
| `GOOGLE_CLIENT_ID`                      | —                                    | Enables `POST /api/auth/google`                                          |
| `CRYPTO_PROVIDER`                       | `mock`                               | `mock` \| `coingecko`                                                    |
| `COINGECKO_API_KEY`                     | —                                    | Demo or Pro key; the header is chosen from `COINGECKO_BASE_URL`           |
| `PRICE_POLL_INTERVAL_MS`                | `20000`                              | One poll per server, not per browser                                     |
| `CACHE_TTL_PRICE`                       | `20`                                 | Prices change constantly — short TTL                                     |
| `CACHE_TTL_MARKET`                      | `60`                                 |                                                                          |
| `CACHE_TTL_METADATA`                    | `86400`                              | Name, symbol, logo barely change — cache hard                            |
| `CACHE_TTL_CHART`                       | `900`                                | ×4 for ranges of 7D and longer                                           |
| `WALLET_PROVIDER`                       | `mock`                               | `mock` \| `live`; `mock` is rejected in production                       |
| `SOLANA_RPC_URL` / `EVM_RPC_URL`        | public endpoints                     | Use your own for anything real                                           |
| `VAPID_PUBLIC_KEY` / `_PRIVATE_KEY`     | —                                    | Both required before push is enabled                                     |
| `VAPID_SUBJECT`                         | `mailto:alerts@coinwake.app`         |                                                                          |

No third-party key is ever sent to the browser. The frontend talks to this API;
this API talks to CoinGecko and the RPC nodes.

---

## Layout

```
src/
  app.ts                  Express app (helmet, CORS, rate limit, routes, errors)
  index.ts                Bootstrap: Mongo → cache → HTTP → WebSocket → poller
  config/                 env (zod-validated) + logger
  core/                   ApiError, calc (pure math), http (retry/dedupe), types
  db/                     mongo + cache (Redis or in-process)
  models/                 Mongoose schemas
  middleware/             auth, validate, rateLimit, error
  routes/                 the REST surface
  services/
    crypto/               CryptoDataProvider: mock | coingecko | cached wrapper
    wallet/               WalletProvider: read-only, mock | live
    notification/         Web Push + browser + email, and dispatch
    realtime/hub.ts       WebSocket client registry and fan-out
    alertEngine.ts        Evaluates every armed alert each tick
    priceService.ts       The poller
    portfolio.ts          Valuation, cost basis, analytics
  scripts/seed.ts
```

### Provider abstractions

`CryptoDataProvider` and `WalletProvider` are interfaces. Nothing above them
knows which vendor is behind them, so switching CoinGecko for another API means
writing one class — no route, no model and no calculation changes.

`CachedCryptoProvider` wraps whichever one is configured and adds the whole of
the rate-limit story: per-key TTLs, in-flight request de-duplication, retry with
exponential backoff (never on a 429 — that would make it worse), and a
stale-while-error fallback that serves the last good value marked `stale: true`
instead of an error page.

---

## REST surface

Everything is under `/api`. Authenticated routes take
`Authorization: Bearer <accessToken>`. Every query is scoped by the
authenticated user id — a user id is never read from a body or a param.

### Auth

| Method | Path                       | Notes                                              |
| ------ | -------------------------- | -------------------------------------------------- |
| `POST` | `/auth/register`           | Email + password                                   |
| `POST` | `/auth/login`              | Same error either way — account existence isn't leaked |
| `POST` | `/auth/refresh`            | Rotates the access token                           |
| `POST` | `/auth/google`             | Verifies the Google ID token server-side           |
| `POST` | `/auth/wallet/nonce`       | Issues a single-use challenge to sign              |
| `POST` | `/auth/wallet/verify`      | Signature in, tokens out                           |
| `GET`  | `/auth/me`                 |                                                    |
| `POST` | `/auth/logout`             | Bumps `tokenVersion` — signs out every device      |

### Market data

| Method | Path                        | Notes                                      |
| ------ | --------------------------- | ------------------------------------------ |
| `GET`  | `/coins?limit=`             | Market list                                |
| `GET`  | `/coins/search?q=`          |                                            |
| `GET`  | `/coins/trending?limit=`    |                                            |
| `GET`  | `/coins/:id`                | Price, cap, FDV, supply, ATH, ATL, rank    |
| `GET`  | `/coins/:id/price`          |                                            |
| `GET`  | `/coins/:id/market`         |                                            |
| `GET`  | `/coins/:id/supply`         | Plus `circulatingSupplyAvailable`          |
| `GET`  | `/coins/:id/chart?range=`   | `1H 24H 7D 30D 3M 1Y ALL`                  |

### Alerts

| Method   | Path                               | Notes                                              |
| -------- | ---------------------------------- | -------------------------------------------------- |
| `GET`    | `/alerts`                          |                                                    |
| `POST`   | `/alerts`                          | `PRICE` \| `MARKET_CAP` \| `PERCENT` \| `PORTFOLIO` |
| `GET`    | `/alerts/progress`                 | "80.57% toward target, $48.58 remaining" (spec 24) |
| `GET`    | `/alerts/history?window=today\|7d\|30d\|all` | Spec 25                                  |
| `PATCH`  | `/alerts/:id`                      | Rename, retarget, enable/disable, re-arm           |
| `DELETE` | `/alerts/:id`                      |                                                    |

A price alert whose target is already met is rejected at creation rather than
firing instantly. Percentage alerts store the price they were armed at, so
"+10%" means +10% from *then*, and a recurring one re-baselines each time it
fires. Recurring alerts respect `cooldownMinutes`.

### Portfolio

| Method   | Path                     | Notes                                            |
| -------- | ------------------------ | ------------------------------------------------ |
| `GET`    | `/portfolio`             | Value, invested, profit, ROI, best/worst, rows   |
| `GET`    | `/portfolio/holdings`    |                                                  |
| `POST`   | `/portfolio/holdings`    | Avg buy price *or* total invested *or* neither   |
| `PATCH`  | `/portfolio/holdings/:id`| Wallet-sourced quantity is read-only             |
| `DELETE` | `/portfolio/holdings/:id`|                                                  |
| `GET`    | `/portfolio/allocation`  | Spec 20                                          |

### Wallets — read-only

| Method   | Path                       | Notes                                        |
| -------- | -------------------------- | -------------------------------------------- |
| `GET`    | `/wallets`                 |                                              |
| `POST`   | `/wallets/nonce`           |                                              |
| `POST`   | `/wallets`                 | Verifies the signed challenge, then links    |
| `PATCH`  | `/wallets/:id`             | Label, include-in-portfolio                  |
| `DELETE` | `/wallets/:id`             | Cascades its imported holdings               |
| `GET`    | `/wallets/:id/balances`    |                                              |
| `GET`    | `/wallets/:id/transactions`| Plus `costBasisAvailable`                    |
| `POST`   | `/wallets/:id/sync`        | Replaces imported rows; the chain is authoritative |

### Calculators

`POST /calculator/profit`, `/market-cap`, `/what-if`, `/scenarios`, `/goal-plan`.

### Everything else

`/watchlist`, `/goals`, `/notifications`, `/push`, `/settings`, `/config`,
`/healthz`.

---

## WebSocket

Connect to `/ws`, optionally with `?token=<accessToken>`. Prices are public;
a token upgrades the socket so it also receives that user's alert triggers. The
token is verified server-side — a socket never names its own user.

Client → server:

```json
{ "type": "subscribe", "coins": ["bitcoin", "solana"] }
{ "type": "auth", "token": "…" }
{ "type": "ping" }
```

An empty `coins` array means "everything"; a narrower list means a phone on
mobile data isn't sent 60 coins it isn't showing.

Server → client: `hello`, `prices`, `alert-triggered`, `notification`, `pong`.

Sockets that stop answering pings are dropped after 30s.

---

## Things this server deliberately will not do

**It never touches your keys.** The wallet interface has no method that can move
funds. It cannot accept a seed phrase or a private key, because there is no
parameter to put one in. Wallet linking is signature-based proof of ownership
only — the challenge text says so in as many words — and only a public address
is ever stored. Signature nonces are single-use: the row is deleted whether or
not verification succeeds, so a captured signature can't be replayed.

**It never invents a cost basis.** If transaction history can't support one, the
holding is stored as `costBasisSource: "UNAVAILABLE"`, contributes **zero** to
"invested", is excluded from best/worst-performer ranking, and the response says
`"Cost basis unavailable — add your average buy price to track profit."` An
estimate is never presented as exact, and `hasEstimatedCostBasis` propagates to
the summary so the UI can label the total.

**It never shows you a raw API error.** Every failure leaves the error handler as
a typed `{ code, message, hint }`. Upstream status codes, stack traces, Mongo
index names and vendor payloads stay in the logs.

**It never guesses a supply.** A market-cap calculation with no circulating
supply returns `"Estimated — circulating supply unavailable."` and asks for a
manual override rather than making one up.

**It gives no financial advice.** Calculator and portfolio responses carry:
_"CryptoWake calculations are estimates based on the data and assumptions
provided. They are not financial advice."_

**There is no AI in here.** By design, for now. The provider interfaces and the
notification dispatcher are the seams an assistant would plug into later.
