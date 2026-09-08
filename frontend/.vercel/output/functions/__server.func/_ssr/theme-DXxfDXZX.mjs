import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as require_jsx_runtime, u as Slot } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { i as keepPreviousData } from "../_libs/tanstack__query-core.mjs";
import { D as LoaderCircle, X as ArrowUpRight, _ as Search, et as ArrowDownRight, t as X } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as _e } from "../_libs/cmdk.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/theme-DXxfDXZX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
/**
* A coin's logo, with the coloured monogram as the fallback.
*
* `logo` is optional because some sources give identity without art — a search
* result carries only symbol and colour. Whenever the image is missing or fails
* to load (a dead CoinGecko URL, an offline tab) we fall back to the initials so
* a row never renders a broken-image icon.
*/
function CoinLogo({ coin, size = 36, className }) {
	const [failed, setFailed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setFailed(false), [coin.logo]);
	if (coin.logo && !failed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: coin.logo,
		alt: "",
		width: size,
		height: size,
		loading: "lazy",
		decoding: "async",
		onError: () => setFailed(true),
		className: cn("inline-block shrink-0 rounded-full object-cover", className),
		style: {
			width: size,
			height: size,
			background: `${coin.color}12`,
			border: `1px solid ${coin.color}33`
		},
		"aria-hidden": true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold uppercase", className),
		style: {
			width: size,
			height: size,
			fontSize: size * .34,
			background: `linear-gradient(140deg, ${coin.color}44, ${coin.color}12)`,
			border: `1px solid ${coin.color}55`,
			color: coin.color
		},
		"aria-hidden": true,
		children: coin.symbol.slice(0, 3)
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
function formatPrice(value) {
	if (value === void 0 || value === null || !isFinite(value)) return "—";
	const abs = Math.abs(value);
	if (abs === 0) return "$0.00";
	if (abs >= 1e3) return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
	if (abs >= 1) return `$${value.toFixed(2)}`;
	if (abs >= .01) return `$${value.toFixed(4)}`;
	if (abs >= 1e-4) return `$${value.toFixed(6)}`;
	return `$${value.toFixed(10).replace(/0+$/, "")}`;
}
function formatUsd(value, digits = 2) {
	if (value === void 0 || value === null || !isFinite(value)) return "—";
	return `${value < 0 ? "-" : ""}$${Math.abs(value).toLocaleString("en-US", {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	})}`;
}
function formatCompact(value, prefix = "$") {
	if (value === void 0 || value === null || !isFinite(value)) return "—";
	const abs = Math.abs(value);
	for (const [size, suffix] of [
		[0xe8d4a51000, "T"],
		[1e9, "B"],
		[1e6, "M"],
		[1e3, "K"]
	]) if (abs >= size) return `${value < 0 ? "-" : ""}${prefix}${(abs / size).toFixed(2)}${suffix}`;
	return `${prefix}${value.toFixed(2)}`;
}
function formatNumber(value, digits = 2) {
	if (value === void 0 || value === null || !isFinite(value)) return "—";
	return value.toLocaleString("en-US", { maximumFractionDigits: digits });
}
function formatSupply(value) {
	if (value === void 0 || value === null || !isFinite(value)) return "—";
	return formatCompact(value, "");
}
function formatPercent(value, digits = 2) {
	if (value === void 0 || value === null || !isFinite(value)) return "—";
	return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}
/**
* Whether a figure should read as a gain — the test behind a "+" prefix or a green
* tone. The API reports some figures as null (ROI with no cost basis, say), and an
* unknown value is not a loss, so it stays neutral instead of turning red.
*/
function isGain(value) {
	return value === void 0 || value === null || value >= 0;
}
function timeAgo(ts) {
	const diff = Date.now() - ts;
	const mins = Math.floor(diff / 6e4);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.floor(hours / 24)}d ago`;
}
var ALERT_KIND_LABEL = {
	PRICE: "Price Alert",
	MARKET_CAP: "Market Cap Alert",
	PERCENT: "Move Alert",
	PORTFOLIO: "Portfolio Alert"
};
/** The figure being watched, for labelling a row of numbers. */
var ALERT_METRIC_LABEL = {
	PRICE: "Price",
	MARKET_CAP: "Market cap",
	PERCENT: "Move",
	PORTFOLIO: "Portfolio"
};
/** ROI and drawdown are percentages; value and profit are dollars. */
function portfolioUnit(alert) {
	return alert.portfolioMetric === "ROI" || alert.portfolioMetric === "DRAWDOWN" ? "PERCENT" : "USD";
}
/** The unit the user set the alert in. */
function alertDefinitionUnit(alert) {
	switch (alert.kind) {
		case "MARKET_CAP": return "USD";
		case "PERCENT": return "PERCENT";
		case "PORTFOLIO": return portfolioUnit(alert);
		default: return "PRICE";
	}
}
/** The unit of the figures in an `AlertProgress` row from the server. */
function alertProgressUnit(alert) {
	switch (alert.kind) {
		case "MARKET_CAP": return "USD";
		case "PERCENT": return "PRICE";
		case "PORTFOLIO": return portfolioUnit(alert);
		default: return "PRICE";
	}
}
/** Formatters all render "—" for null, so an unknown figure stays unknown. */
function formatAlertValue(unit, value) {
	if (unit === "PERCENT") return formatPercent(value);
	if (unit === "USD") return formatCompact(value);
	return formatPrice(value);
}
/** The threshold as the user set it. Null when the field was never recorded. */
function alertThreshold(alert) {
	switch (alert.kind) {
		case "MARKET_CAP": return alert.targetMarketCap ?? null;
		case "PERCENT": return alert.targetPercent ?? null;
		case "PORTFOLIO": return alert.targetValue ?? null;
		default: return alert.targetPrice ?? null;
	}
}
/**
* The value the alert was armed at, in the definition unit.
*
* Null where there is nothing comparable to show: a percentage alert was armed at
* 0% by definition, and a drawdown is measured from a peak only the server keeps.
*/
function alertBaseline(alert, coin) {
	switch (alert.kind) {
		case "MARKET_CAP": {
			const supply = coin?.circulatingSupply;
			if (alert.baselinePrice === void 0 || !supply) return null;
			return alert.baselinePrice * supply;
		}
		case "PERCENT": return null;
		case "PORTFOLIO": return alert.baselineValue ?? null;
		default: return alert.baselinePrice ?? null;
	}
}
/**
* What the watched figure reads right now, in the definition unit, from data this
* client already holds.
*
* Null when the client can't know: a portfolio alert needs the summary, a coin
* outside the loaded feed has no price, and a percentage move needs the price the
* alert was armed at. Null is the honest answer — `GET /alerts/progress` is the
* authority on live figures.
*/
function alertCurrent(alert, coin, portfolio) {
	switch (alert.kind) {
		case "MARKET_CAP": return coin?.marketCap ?? null;
		case "PERCENT": {
			const baseline = alert.baselinePrice;
			if (!coin || baseline === void 0 || baseline === 0) return null;
			return (coin.price - baseline) / baseline * 100;
		}
		case "PORTFOLIO":
			if (!portfolio) return null;
			switch (alert.portfolioMetric) {
				case "PROFIT": return portfolio.profit;
				case "ROI": return portfolio.roi;
				case "DRAWDOWN": return null;
				default: return portfolio.value;
			}
		default: return coin?.price ?? null;
	}
}
/** Heading for an alert: a coin symbol, "Portfolio", or the coin id we have. */
function alertSubject(alert, coin) {
	if (coin) return coin.symbol;
	if (alert.kind === "PORTFOLIO") return "Portfolio";
	return alert.coinId ?? "Alert";
}
/** The threshold formatted in the user's own terms: "$250", "-10%". */
function alertThresholdLabel(alert) {
	return formatAlertValue(alertDefinitionUnit(alert), alertThreshold(alert));
}
/** The whole condition in the user's own terms: "≥ $250", "≤ -10%". */
function alertConditionLabel(alert) {
	return `${alert.condition === "ABOVE" ? "≥" : "≤"} ${alertThresholdLabel(alert)}`;
}
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
var STORAGE_KEY = "coinwake-session-v1";
var session = null;
var loaded = false;
var listeners = /* @__PURE__ */ new Set();
function read() {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed.accessToken || !parsed.refreshToken) return null;
		return {
			accessToken: parsed.accessToken,
			refreshToken: parsed.refreshToken
		};
	} catch {
		return null;
	}
}
/** Lazily hydrated: during SSR there is no storage, and reading it on import
*  would run on the server and poison the module for every request. */
function current() {
	if (!loaded && typeof window !== "undefined") {
		session = read();
		loaded = true;
	}
	return session;
}
function getAccessToken() {
	return current()?.accessToken ?? null;
}
function getRefreshToken() {
	return current()?.refreshToken ?? null;
}
function isSignedIn() {
	return current() !== null;
}
function setSession(tokens) {
	session = tokens ? {
		accessToken: tokens.accessToken,
		refreshToken: tokens.refreshToken
	} : null;
	loaded = true;
	if (typeof window !== "undefined") if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
	else window.localStorage.removeItem(STORAGE_KEY);
	for (const listener of listeners) listener(session);
}
function clearSession() {
	setSession(null);
}
/** Notifies on sign-in and sign-out so the socket can re-authenticate. */
function onSessionChange(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}
/**
* The one place the frontend talks HTTP.
*
* Everything a component sees is either data or an ApiClientError whose `message`
* is already safe to render: the server never sends a raw database or vendor
* error (spec 35), and the failures it can't describe — offline, DNS, timeout —
* get their own wording here rather than leaking `TypeError: Failed to fetch`.
*/
/** Set VITE_API_URL when the API isn't on localhost:4000 (see .env.example). */
var BASE_URL = ({
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/",
	"VITE_API_URL": "http://localhost:4000/api",
	"VITE_GOOGLE_CLIENT_ID": "828220796194-q8pik10ecofke22a0uu17g758e7e5tli.apps.googleusercontent.com"
}["VITE_API_URL"] ?? "http://localhost:4000/api").replace(/\/+$/, "");
/** ws(s):// origin for the realtime feed, derived so there's one URL to configure. */
function socketUrl() {
	return `${BASE_URL.replace(/\/api$/, "").replace(/^http/, "ws")}/ws`;
}
var ApiClientError = class extends Error {
	status;
	code;
	hint;
	details;
	retryAfter;
	constructor(status, body) {
		super(body.message);
		this.name = "ApiClientError";
		this.status = status;
		this.code = body.code;
		if (body.hint !== void 0) this.hint = body.hint;
		if (body.details !== void 0) this.details = body.details;
		if (body.retryAfter !== void 0) this.retryAfter = body.retryAfter;
	}
	/** Field-level messages for a form, keyed by field name. */
	fieldErrors() {
		const out = {};
		for (const issue of this.details ?? []) {
			const key = issue.path.split(".").pop();
			if (key) out[key] = issue.message;
		}
		return out;
	}
};
function networkError() {
	return new ApiClientError(0, {
		code: "NETWORK_UNAVAILABLE",
		message: "We couldn't reach CoinWake.",
		hint: "Check your connection and try again."
	});
}
function buildUrl(path, query) {
	const url = new URL(`${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);
	for (const [key, value] of Object.entries(query ?? {})) if (value !== void 0) url.searchParams.set(key, String(value));
	return url.toString();
}
/**
* Refreshes the access token, collapsing concurrent callers onto one request.
*
* Without the single flight, a screen that fires five queries at once would send
* five refreshes; the first rotates the token and the rest race against it.
*/
var refreshInFlight = null;
async function refreshAccessToken() {
	if (refreshInFlight) return refreshInFlight;
	const refreshToken = getRefreshToken();
	if (!refreshToken) return false;
	refreshInFlight = (async () => {
		try {
			const res = await fetch(buildUrl("/auth/refresh"), {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ refreshToken })
			});
			if (!res.ok) {
				clearSession();
				return false;
			}
			setSession((await res.json()).tokens);
			return true;
		} catch {
			return false;
		} finally {
			refreshInFlight = null;
		}
	})();
	return refreshInFlight;
}
async function send$1(path, options, token) {
	const headers = { accept: "application/json" };
	if (options.body !== void 0) headers["content-type"] = "application/json";
	if (token) headers["authorization"] = `Bearer ${token}`;
	return fetch(buildUrl(path, options.query), {
		method: options.method ?? "GET",
		headers,
		...options.body === void 0 ? {} : { body: JSON.stringify(options.body) },
		...options.signal ? { signal: options.signal } : {}
	});
}
async function toError(res) {
	let body = {
		code: "REQUEST_FAILED",
		message: "Something went wrong. Please try again."
	};
	try {
		const parsed = await res.json();
		if (parsed.error?.message) body = parsed.error;
	} catch {}
	return new ApiClientError(res.status, body);
}
/**
* Performs a request and returns the parsed body.
*
* On a 401 with a stored refresh token it refreshes once and replays the request,
* so an expired access token is invisible to callers.
*/
async function apiFetch(path, options = {}) {
	const useAuth = options.auth !== false;
	let res;
	try {
		res = await send$1(path, options, useAuth ? getAccessToken() : null);
	} catch (err) {
		if (err instanceof DOMException && err.name === "AbortError") throw err;
		throw networkError();
	}
	if (res.status === 401 && useAuth && getRefreshToken()) {
		if (await refreshAccessToken()) try {
			res = await send$1(path, options, getAccessToken());
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") throw err;
			throw networkError();
		}
	}
	if (!res.ok) throw await toError(res);
	if (res.status === 204 || res.headers.get("content-length") === "0") return;
	try {
		return await res.json();
	} catch {
		return;
	}
}
/** Anything renderable as a user-facing message, whatever was thrown. */
function errorMessage(err) {
	if (err instanceof ApiClientError) return err.message;
	if (err instanceof Error && err.name === "AbortError") return "That request was cancelled.";
	return "Something went wrong. Please try again.";
}
/** The extra sentence a toast can show under the message, when there is one. */
function errorHint(err) {
	return err instanceof ApiClientError ? err.hint : void 0;
}
/** Backoff schedule in ms; the last value repeats for as long as it takes. */
var BACKOFF = [
	1e3,
	2e3,
	5e3,
	1e4,
	3e4
];
var PING_INTERVAL_MS = 25e3;
var socket = null;
var status = "idle";
var attempt = 0;
var reconnectTimer = null;
var pingTimer = null;
/** Set once we intentionally stop, so a close event doesn't reconnect. */
var stopped = true;
var handlers = /* @__PURE__ */ new Set();
var statusHandlers = /* @__PURE__ */ new Set();
/** Coins the app wants; empty means "everything the server broadcasts". */
var subscribedCoins = [];
function setStatus(next) {
	if (status === next) return;
	status = next;
	for (const handler of statusHandlers) handler(next);
}
function send(message) {
	if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}
function clearTimers() {
	if (reconnectTimer !== null) {
		clearTimeout(reconnectTimer);
		reconnectTimer = null;
	}
	if (pingTimer !== null) {
		clearInterval(pingTimer);
		pingTimer = null;
	}
}
function scheduleReconnect() {
	if (stopped || reconnectTimer !== null) return;
	const delay = BACKOFF[Math.min(attempt, BACKOFF.length - 1)] ?? 3e4;
	attempt += 1;
	setStatus("reconnecting");
	reconnectTimer = setTimeout(() => {
		reconnectTimer = null;
		open();
	}, delay);
}
function open() {
	if (typeof window === "undefined") return;
	if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;
	const token = getAccessToken();
	const url = token ? `${socketUrl()}?token=${encodeURIComponent(token)}` : socketUrl();
	setStatus(attempt === 0 ? "connecting" : "reconnecting");
	let next;
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
		send({
			type: "subscribe",
			coins: subscribedCoins
		});
		pingTimer = setInterval(() => send({ type: "ping" }), PING_INTERVAL_MS);
	});
	next.addEventListener("message", (event) => {
		if (socket !== next) return;
		let parsed;
		try {
			parsed = JSON.parse(String(event.data));
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
		if (socket === next) next.close();
	});
}
function reconnectNow() {
	clearTimers();
	attempt = 0;
	const previous = socket;
	socket = null;
	previous?.close();
	if (!stopped) open();
}
var listenersBound = false;
/** Reconnects on wake and on regaining network, where a socket dies silently. */
function bindWindowListeners() {
	if (listenersBound || typeof window === "undefined") return;
	listenersBound = true;
	window.addEventListener("online", () => {
		if (!stopped && status !== "open") reconnectNow();
	});
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState !== "visible" || stopped) return;
		if (socket?.readyState === WebSocket.OPEN) send({ type: "ping" });
		else reconnectNow();
	});
	onSessionChange(() => {
		if (!stopped) reconnectNow();
	});
}
var realtime = {
	/** Idempotent; safe to call from every mount. */
	connect() {
		if (typeof window === "undefined") return;
		stopped = false;
		bindWindowListeners();
		open();
	},
	disconnect() {
		stopped = true;
		clearTimers();
		const previous = socket;
		socket = null;
		previous?.close();
		setStatus("closed");
	},
	/** Empty list = all broadcast coins. Sent immediately when already open. */
	subscribe(coins) {
		subscribedCoins = coins;
		send({
			type: "subscribe",
			coins
		});
	},
	onMessage(handler) {
		handlers.add(handler);
		return () => handlers.delete(handler);
	},
	onStatus(handler) {
		statusHandlers.add(handler);
		handler(status);
		return () => statusHandlers.delete(handler);
	},
	status() {
		return status;
	}
};
var auth = {
	async register(input) {
		const data = await apiFetch("/auth/register", {
			method: "POST",
			body: input,
			auth: false
		});
		setSession(data.tokens);
		return data.user;
	},
	async login(input) {
		const data = await apiFetch("/auth/login", {
			method: "POST",
			body: input,
			auth: false
		});
		setSession(data.tokens);
		return data.user;
	},
	/** Requires GOOGLE_CLIENT_ID on the server; check config().googleAuthEnabled. */
	async google(idToken) {
		const data = await apiFetch("/auth/google", {
			method: "POST",
			body: { idToken },
			auth: false
		});
		setSession(data.tokens);
		return data.user;
	},
	/**
	* Step 1 of wallet sign-in. Spec 27: this proves ownership of an address and
	* nothing more — no seed phrase, no private key, no spending permission.
	*/
	walletNonce(input) {
		return apiFetch("/auth/wallet/nonce", {
			method: "POST",
			body: input,
			auth: false
		});
	},
	async walletVerify(input) {
		const data = await apiFetch("/auth/wallet/verify", {
			method: "POST",
			body: input,
			auth: false
		});
		setSession(data.tokens);
		return {
			user: data.user,
			wallet: data.wallet
		};
	},
	me() {
		return apiFetch("/auth/me");
	},
	/** Ends every session for this user, then forgets the local one either way. */
	async logout() {
		try {
			await apiFetch("/auth/logout", { method: "POST" });
		} finally {
			clearSession();
		}
	}
};
var coins = {
	list(limit = 50) {
		return apiFetch("/coins", {
			query: { limit },
			auth: false
		});
	},
	/** Identity only — results carry no price (spec: never imply a stale quote). */
	search(q, limit = 12) {
		return apiFetch("/coins/search", {
			query: {
				q,
				limit
			},
			auth: false
		});
	},
	/** DexScreener Solana DEX tokens — separate from main search by design. */
	dexSearch(q, limit = 12) {
		return apiFetch("/dex/search", {
			query: {
				q,
				limit
			},
			auth: false
		});
	},
	trending(limit = 6) {
		return apiFetch("/coins/trending", {
			query: { limit },
			auth: false
		});
	},
	get(coinId) {
		return apiFetch(`/coins/${encodeURIComponent(coinId)}`, { auth: false });
	},
	price(coinId) {
		return apiFetch(`/coins/${encodeURIComponent(coinId)}/price`, { auth: false });
	},
	market(coinId) {
		return apiFetch(`/coins/${encodeURIComponent(coinId)}/market`, { auth: false });
	},
	supply(coinId) {
		return apiFetch(`/coins/${encodeURIComponent(coinId)}/supply`, { auth: false });
	},
	chart(coinId, range) {
		return apiFetch(`/coins/${encodeURIComponent(coinId)}/chart`, {
			query: { range },
			auth: false
		});
	}
};
var portfolio = {
	summary() {
		return apiFetch("/portfolio");
	},
	holdings() {
		return apiFetch("/portfolio/holdings");
	},
	addHolding(input) {
		return apiFetch("/portfolio/holdings", {
			method: "POST",
			body: input
		});
	},
	updateHolding(id, patch) {
		return apiFetch(`/portfolio/holdings/${encodeURIComponent(id)}`, {
			method: "PATCH",
			body: patch
		});
	},
	removeHolding(id) {
		return apiFetch(`/portfolio/holdings/${encodeURIComponent(id)}`, { method: "DELETE" });
	},
	allocation() {
		return apiFetch("/portfolio/allocation");
	}
};
var alerts = {
	list() {
		return apiFetch("/alerts");
	},
	/**
	* The server rejects a target that would fire immediately (INVALID_TARGET), so
	* callers should show the returned message rather than pre-guessing the rule.
	*/
	create(input) {
		return apiFetch("/alerts", {
			method: "POST",
			body: input
		});
	},
	progress() {
		return apiFetch("/alerts/progress");
	},
	history(window = "all", limit = 100) {
		return apiFetch("/alerts/history", { query: {
			window,
			limit
		} });
	},
	update(id, patch) {
		return apiFetch(`/alerts/${encodeURIComponent(id)}`, {
			method: "PATCH",
			body: patch
		});
	},
	remove(id) {
		return apiFetch(`/alerts/${encodeURIComponent(id)}`, { method: "DELETE" });
	}
};
var watchlist = {
	/** Returns resolved coins alongside their ids, so a list renders in one request. */
	list() {
		return apiFetch("/watchlist");
	},
	/** Returns the resolved coin, so the caller can render it without a refetch. */
	add(coinId) {
		return apiFetch("/watchlist", {
			method: "POST",
			body: { coinId }
		});
	},
	remove(coinId) {
		return apiFetch(`/watchlist/${encodeURIComponent(coinId)}`, { method: "DELETE" });
	}
};
var notifications = {
	list(options = {}) {
		return apiFetch("/notifications", { query: {
			unreadOnly: options.unreadOnly ? "true" : "false",
			...options.limit === void 0 ? {} : { limit: options.limit }
		} });
	},
	markAllRead() {
		return apiFetch("/notifications/read-all", { method: "POST" });
	},
	markRead(id) {
		return apiFetch(`/notifications/${encodeURIComponent(id)}/read`, { method: "POST" });
	},
	remove(id) {
		return apiFetch(`/notifications/${encodeURIComponent(id)}`, { method: "DELETE" });
	}
};
var calculator = {
	/** Spec 14. Pass currentPrice to skip the lookup, or coinId to have one fetched. */
	profit(input) {
		return apiFetch("/calculator/profit", {
			method: "POST",
			body: input
		});
	},
	/** Spec 15 — Price = Market Cap / Circulating Supply. */
	marketCap(input) {
		return apiFetch("/calculator/market-cap", {
			method: "POST",
			body: input
		});
	},
	/** A generated market-cap ladder; from/to/steps default to 1M → 1B in 8 steps. */
	whatIf(input) {
		return apiFetch("/calculator/what-if", {
			method: "POST",
			body: input
		});
	},
	/** Spec 18 — the same table for market caps the caller chose. */
	scenarios(input) {
		return apiFetch("/calculator/scenarios", {
			method: "POST",
			body: input
		});
	},
	/** Spec 17 — "I want my holdings to be worth $X". */
	goalPlan(input) {
		return apiFetch("/calculator/goal-plan", {
			method: "POST",
			body: input
		});
	}
};
var push = {
	/** The only push route that doesn't need a session. */
	publicKey() {
		return apiFetch("/push/public-key", { auth: false });
	},
	subscribe(subscription) {
		return apiFetch("/push/subscribe", {
			method: "POST",
			body: subscription
		});
	},
	unsubscribe(endpoint) {
		return apiFetch("/push/unsubscribe", {
			method: "POST",
			body: { endpoint }
		});
	},
	/** Proves push works end-to-end; 400s with a hint if this device isn't subscribed. */
	test() {
		return apiFetch("/push/test", { method: "POST" });
	}
};
var settings = {
	get() {
		return apiFetch("/settings");
	},
	update(patch) {
		return apiFetch("/settings", {
			method: "PATCH",
			body: patch
		});
	},
	updateProfile(patch) {
		return apiFetch("/settings/profile", {
			method: "PATCH",
			body: patch
		});
	},
	/** Rotates tokens, because changing a password ends other sessions. */
	async changePassword(input) {
		const data = await apiFetch("/settings/password", {
			method: "POST",
			body: input
		});
		setSession(data.tokens);
		return data.user;
	}
};
function serverConfig() {
	return apiFetch("/config", { auth: false });
}
/**
* Query keys and the read hooks built on them.
*
* Every cache key in the app is named here so an invalidation can't miss a screen
* (and so two components asking for the same thing share one request — spec 31).
* The shared entities the whole app reads — coins, alerts, holdings, watchlist,
* notifications — are consumed through `useStore`; these hooks cover the rest.
*/
var queryKeys = {
	config: ["config"],
	coins: ["coins"],
	coin: (coinId) => ["coin", coinId],
	coinSearch: (query) => ["coin-search", query],
	chart: (coinId, range) => [
		"chart",
		coinId,
		range
	],
	trending: (limit) => ["trending", limit],
	supply: (coinId) => ["supply", coinId],
	alerts: ["alerts"],
	alertProgress: ["alert-progress"],
	alertHistory: (window) => ["alert-history", window],
	holdings: ["holdings"],
	portfolio: ["portfolio"],
	allocation: ["allocation"],
	watchlist: ["watchlist"],
	notifications: ["notifications"],
	settings: ["settings"],
	calcProfit: (input) => ["calc-profit", input],
	calcMarketCap: (input) => ["calc-market-cap", input],
	calcScenarios: (input) => ["calc-scenarios", input],
	calcWhatIf: (input) => ["calc-what-if", input],
	calcGoalPlan: (input) => ["calc-goal-plan", input]
};
/**
* Charts move much slower than prices and the server caches them, so a long
* stale window keeps a table of sparklines from re-requesting on every render.
*/
var CHART_STALE_MS = 3e5;
/** What this deployment supports, so the UI can hide what isn't configured. */
function useServerConfig() {
	return useQuery({
		queryKey: queryKeys.config,
		queryFn: () => serverConfig(),
		staleTime: Infinity,
		retry: 1
	});
}
function useChart(coinId, range) {
	return useQuery({
		queryKey: queryKeys.chart(coinId ?? "", range),
		queryFn: () => coins.chart(coinId, range).then((r) => r.points),
		enabled: Boolean(coinId),
		staleTime: CHART_STALE_MS,
		gcTime: 18e5,
		retry: 1
	});
}
/**
* Server-side coin search, for coins outside the loaded market list.
*
* Results carry no price — the server returns identity only — so a caller must
* fetch the coin before showing a quote.
*/
function useCoinSearch(query) {
	const trimmed = query.trim();
	return useQuery({
		queryKey: queryKeys.coinSearch(trimmed.toLowerCase()),
		queryFn: () => coins.search(trimmed).then((r) => r.results),
		enabled: trimmed.length >= 2,
		staleTime: 6e4
	});
}
/**
* DexScreener Solana DEX search — separate from main search by design.
* For pump.fun and other Solana DEX tokens not on CoinGecko.
*/
function useDexSearch(query) {
	const trimmed = query.trim();
	return useQuery({
		queryKey: ["dex-search", trimmed.toLowerCase()],
		queryFn: () => coins.dexSearch(trimmed).then((r) => r.results),
		enabled: trimmed.length >= 2,
		staleTime: 6e4
	});
}
function useCoin(coinId) {
	return useQuery({
		queryKey: queryKeys.coin(coinId ?? ""),
		queryFn: () => coins.get(coinId).then((r) => r.coin),
		enabled: Boolean(coinId),
		staleTime: 3e4
	});
}
/** How far each active alert has travelled from its baseline (spec 24). */
function useAlertProgress() {
	return useQuery({
		queryKey: queryKeys.alertProgress,
		queryFn: () => alerts.progress().then((r) => r.progress),
		enabled: isSignedIn(),
		staleTime: 15e3
	});
}
/** Everything a screen needs to explain a failure without leaking internals. */
function queryError(error) {
	if (!error) return null;
	const hint = errorHint(error);
	return {
		message: error instanceof ApiClientError ? error.message : "We couldn't load that just now.",
		...hint ? { hint } : {}
	};
}
/**
* The calculators run server-side so the numbers, the estimate flags and the
* disclaimer all come from one implementation (spec 7/43).
*
* They are queries despite the POST: a result is a pure function of the request
* body, so it caches and dedupes exactly like a GET — the body is a body only
* because it is too big for a query string. Pass `undefined` while the form is
* still incomplete and the request stays parked; keep the last answer on screen
* while the next one is in flight, so typing doesn't strobe the numbers.
*
* `retry: false` because every failure here is a 4xx the user has to act on — a
* missing supply, an out-of-range target — and repeating the call cannot fix it.
*/
var calcOptions = {
	placeholderData: keepPreviousData,
	staleTime: 6e4,
	retry: false
};
function useProfitCalculator(input) {
	return useQuery({
		queryKey: queryKeys.calcProfit(input),
		queryFn: () => calculator.profit(input),
		enabled: input !== void 0,
		...calcOptions
	});
}
function useMarketCapCalculator(input) {
	return useQuery({
		queryKey: queryKeys.calcMarketCap(input),
		queryFn: () => calculator.marketCap(input),
		enabled: input !== void 0,
		...calcOptions
	});
}
function useScenarioCalculator(input) {
	return useQuery({
		queryKey: queryKeys.calcScenarios(input),
		queryFn: () => calculator.scenarios(input),
		enabled: input !== void 0,
		...calcOptions
	});
}
/** Web Audio based loud repeating alarm (no asset needed, autoplay-safe once unlocked). */
var AlarmEngine = class {
	ctx = null;
	timer = null;
	unlocked = false;
	isUnlocked() {
		return this.unlocked;
	}
	ensureCtx() {
		if (typeof window === "undefined") return null;
		if (!this.ctx) {
			const Ctor = window.AudioContext || window.webkitAudioContext;
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
	beep(volume) {
		const ctx = this.ensureCtx();
		if (!ctx || ctx.state !== "running") return;
		const now = ctx.currentTime;
		[880, 1320].forEach((freq, i) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = "square";
			osc.frequency.setValueAtTime(freq, now + i * .22);
			osc.frequency.exponentialRampToValueAtTime(freq * .6, now + i * .22 + .2);
			gain.gain.setValueAtTime(1e-4, now + i * .22);
			gain.gain.exponentialRampToValueAtTime(volume, now + i * .22 + .02);
			gain.gain.exponentialRampToValueAtTime(1e-4, now + i * .22 + .2);
			osc.connect(gain).connect(ctx.destination);
			osc.start(now + i * .22);
			osc.stop(now + i * .22 + .24);
		});
	}
	async test(volume = .25) {
		await this.unlock();
		this.beep(volume);
	}
	async start(volume = .4) {
		await this.unlock();
		if (this.timer) return;
		this.beep(volume);
		this.timer = setInterval(() => this.beep(volume), 900);
		if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.([
			400,
			200,
			400
		]);
	}
	stop() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
		if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(0);
	}
};
var alarmEngine = new AlarmEngine();
async function requestBrowserNotifications() {
	if (typeof window === "undefined" || !("Notification" in window)) return "denied";
	if (Notification.permission === "granted") return "granted";
	return Notification.requestPermission();
}
function sendBrowserNotification(title, body) {
	if (typeof window === "undefined" || !("Notification" in window)) return;
	if (Notification.permission !== "granted") return;
	try {
		new Notification(title, {
			body,
			icon: "/favicon.ico"
		});
	} catch {}
}
/**
* Service worker registration and Web Push subscription (spec 12).
*
* The worker is what lets a target reach the user when the tab is closed, which
* is the whole promise of the product — the server decides when to send (spec 30),
* this only arranges for delivery and relays what arrives to the running app.
*/
var SW_URL = "/sw.js";
/**
* Why push can't work here, in words worth showing.
*
* iOS is the case that surprises people: Safari 16.4+ has Web Push, but only for
* a site installed to the Home Screen, so `PushManager` is simply absent in the
* browser tab.
*/
function pushSupport() {
	if (typeof window === "undefined") return {
		supported: false,
		reason: "Not available here."
	};
	if (!("serviceWorker" in navigator)) return {
		supported: false,
		reason: "This browser can't receive push notifications.",
		hint: "Try Chrome, Edge, Firefox or Safari 16.4+."
	};
	if (!("Notification" in window && "PushManager" in window)) {
		const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
		const installed = window.matchMedia?.("(display-mode: standalone)").matches === true || navigator.standalone === true;
		if (iOS && !installed) return {
			supported: false,
			reason: "iPhone and iPad need CoinWake added to your Home Screen first.",
			hint: "Tap Share, then Add to Home Screen, then open it from there."
		};
		return {
			supported: false,
			reason: "This browser can't receive push notifications."
		};
	}
	return { supported: true };
}
var registration = null;
var registering = null;
/** Registers the worker once per tab; returns null where workers don't exist. */
async function registerServiceWorker() {
	if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
	if (registration) return registration;
	if (registering) return registering;
	registering = navigator.serviceWorker.register(SW_URL, { scope: "/" }).then((reg) => {
		registration = reg;
		return reg;
	}).catch(() => null).finally(() => {
		registering = null;
	});
	return registering;
}
/** VAPID keys arrive base64url; PushManager wants raw bytes. */
function decodeVapidKey(base64Url) {
	const padded = base64Url.padEnd(base64Url.length + (4 - base64Url.length % 4) % 4, "=");
	const raw = window.atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
	const bytes = new Uint8Array(raw.length);
	for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
	return bytes;
}
function toJson(subscription) {
	const json = subscription.toJSON();
	const p256dh = json.keys?.["p256dh"];
	const auth = json.keys?.["auth"];
	if (!json.endpoint || !p256dh || !auth) return null;
	return {
		endpoint: json.endpoint,
		keys: {
			p256dh,
			auth
		}
	};
}
/**
* Asks for permission, subscribes, and registers the subscription with the API.
*
* Call it from a click. Browsers ignore — or permanently block — a permission
* prompt that wasn't triggered by a user gesture.
*/
async function enablePush() {
	const support = pushSupport();
	if (!support.supported) return {
		ok: false,
		reason: support.reason,
		...support.hint ? { hint: support.hint } : {}
	};
	if (!isSignedIn()) return {
		ok: false,
		reason: "Sign in first so we know where to send your alerts."
	};
	if (Notification.permission === "denied") return {
		ok: false,
		reason: "Notifications are blocked for this site.",
		hint: "Allow notifications in your browser's site settings, then try again.",
		permissionDenied: true
	};
	let publicKey;
	try {
		publicKey = (await push.publicKey()).publicKey;
	} catch (err) {
		if (err instanceof ApiClientError) return {
			ok: false,
			reason: err.message,
			...err.hint ? { hint: err.hint } : {}
		};
		return {
			ok: false,
			reason: "We couldn't set up notifications just now."
		};
	}
	if (Notification.permission !== "granted") {
		const permission = await Notification.requestPermission();
		if (permission !== "granted") return {
			ok: false,
			reason: "Notifications stay off until you allow them.",
			permissionDenied: permission === "denied"
		};
	}
	const reg = await registerServiceWorker();
	if (!reg) return {
		ok: false,
		reason: "We couldn't start the background service."
	};
	await navigator.serviceWorker.ready;
	let subscription;
	try {
		subscription = await reg.pushManager.getSubscription();
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
			applicationServerKey: decodeVapidKey(publicKey)
		});
	} catch {
		return {
			ok: false,
			reason: "Your browser wouldn't create a notification subscription.",
			hint: "This can happen in private windows. Try a normal window."
		};
	}
	const body = toJson(subscription);
	if (!body) return {
		ok: false,
		reason: "Your browser returned an unusable subscription."
	};
	try {
		await push.subscribe(body);
	} catch (err) {
		if (err instanceof ApiClientError) return {
			ok: false,
			reason: err.message,
			...err.hint ? { hint: err.hint } : {}
		};
		return {
			ok: false,
			reason: "We couldn't save your notification settings."
		};
	}
	return {
		ok: true,
		endpoint: body.endpoint
	};
}
function sameKey(a, b) {
	const left = new Uint8Array(a);
	if (left.length !== b.length) return false;
	return left.every((byte, i) => byte === b[i]);
}
/** Unsubscribes this device, server-side first so it stops being sent to. */
async function disablePush() {
	const subscription = await (await registerServiceWorker())?.pushManager.getSubscription();
	if (!subscription) return;
	try {
		await push.unsubscribe(subscription.endpoint);
	} catch {}
	await subscription.unsubscribe().catch(() => false);
}
async function isPushEnabled() {
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
async function syncPushSubscription() {
	if (!isSignedIn() || !pushSupport().supported) return;
	if (Notification.permission !== "granted") return;
	const subscription = await (await registerServiceWorker())?.pushManager.getSubscription();
	if (!subscription) return;
	const body = toJson(subscription);
	if (!body) return;
	try {
		await push.subscribe(body);
	} catch {}
}
/**
* Subscribes to those messages.
*
* The alarm one matters: a push notification cannot play audio by itself, so the
* worker waking the page is the only way a closed tab turns into a loud alarm
* (spec 11). `coinwake:resubscribe` is handled here rather than in the caller
* because the response is always the same.
*/
function onServiceWorkerMessage(handler) {
	if (typeof window === "undefined" || !("serviceWorker" in navigator)) return () => {};
	const listener = (event) => {
		const data = event.data;
		if (!data || typeof data.type !== "string" || !data.type.startsWith("coinwake:")) return;
		if (data.type === "coinwake:resubscribe") syncPushSubscription();
		handler(data);
	};
	navigator.serviceWorker.addEventListener("message", listener);
	return () => navigator.serviceWorker.removeEventListener("message", listener);
}
/**
* Whether this device rings out loud.
*
* Device-local because it depends on this browser's audio permission, but mirrored
* to the server once signed in: the server reads `settings.alarm.sound` when it
* decides whether a push should ring a closed tab (spec 12), so for a signed-in
* user the server's value is the one that matters and it wins on load.
*/
var ALARM_SOUND_KEY = "coinwake-alarm-sound";
var EMPTY_PORTFOLIO = {
	value: 0,
	invested: 0,
	profit: 0,
	roi: 0,
	bestPerformer: null,
	worstPerformer: null,
	hasEstimatedCostBasis: false,
	rows: []
};
var StoreContext = (0, import_react.createContext)(null);
/** Spec 35: show the server's user-facing message, never a status code or stack. */
function report(error) {
	const hint = errorHint(error);
	toast.error(errorMessage(error), hint ? { description: hint } : void 0);
}
function readAlarmSound() {
	if (typeof window === "undefined") return false;
	return window.localStorage.getItem(ALARM_SOUND_KEY) === "true";
}
/** Turns a triggered-alert frame into something renderable for every alert kind. */
function toAlarmPayload(alert, coin, portfolio) {
	return {
		alert,
		coin,
		subject: alertSubject(alert, coin),
		unit: alertDefinitionUnit(alert),
		target: alertThreshold(alert),
		current: alertCurrent(alert, coin, portfolio),
		previous: alertBaseline(alert, coin)
	};
}
function StoreProvider({ children }) {
	const client = useQueryClient();
	const [signedIn, setSignedIn] = (0, import_react.useState)(false);
	const [socketStatus, setSocketStatus] = (0, import_react.useState)("idle");
	const [activeAlarm, setActiveAlarm] = (0, import_react.useState)(null);
	const [alarmSoundEnabled, setAlarmSound] = (0, import_react.useState)(false);
	/** Coins the socket has priced that aren't in the top-50 list. */
	const [livePrices, setLivePrices] = (0, import_react.useState)({});
	/** An alert id from ?alarm= or the service worker, held until it resolves. */
	const [pendingAlarmId, setPendingAlarmId] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setSignedIn(isSignedIn());
		setAlarmSound(readAlarmSound());
		return onSessionChange((session) => setSignedIn(session !== null));
	}, []);
	const coinsQuery = useQuery({
		queryKey: queryKeys.coins,
		queryFn: () => coins.list(50).then((r) => r.coins),
		staleTime: 6e4,
		refetchOnWindowFocus: false
	});
	const meQuery = useQuery({
		queryKey: ["me"],
		queryFn: () => auth.me(),
		enabled: signedIn,
		staleTime: 3e5
	});
	const alertsQuery = useQuery({
		queryKey: queryKeys.alerts,
		queryFn: () => alerts.list().then((r) => r.alerts),
		enabled: signedIn
	});
	const holdingsQuery = useQuery({
		queryKey: queryKeys.holdings,
		queryFn: () => portfolio.holdings().then((r) => r.holdings),
		enabled: signedIn
	});
	const watchlistQuery = useQuery({
		queryKey: queryKeys.watchlist,
		queryFn: () => watchlist.list().then((r) => r.watchlist),
		enabled: signedIn
	});
	const notificationsQuery = useQuery({
		queryKey: queryKeys.notifications,
		queryFn: () => notifications.list({ limit: 50 }),
		enabled: signedIn
	});
	const portfolioQuery = useQuery({
		queryKey: queryKeys.portfolio,
		queryFn: () => portfolio.summary(),
		enabled: signedIn
	});
	/**
	* The portfolio the cache already holds. Read on demand rather than taken as a
	* dependency: a portfolio alarm needs these figures, but the socket effect
	* must not resubscribe every time the portfolio value ticks.
	*/
	const cachedPortfolio = (0, import_react.useCallback)(() => client.getQueryData(queryKeys.portfolio)?.portfolio ?? null, [client]);
	const serverAlarmSound = meQuery.data?.settings.alarm.sound;
	(0, import_react.useEffect)(() => {
		if (serverAlarmSound === void 0) return;
		setAlarmSound(serverAlarmSound);
		if (typeof window !== "undefined") window.localStorage.setItem(ALARM_SOUND_KEY, String(serverAlarmSound));
	}, [serverAlarmSound]);
	/**
	* One lookup table for every coin the UI can mention: the market list, live
	* socket prices, watched coins outside the top 50, and coins held in the
	* portfolio. Without the last three, a coin ranked #300 would render blank.
	*/
	const coinIndex = (0, import_react.useMemo)(() => {
		const index = /* @__PURE__ */ new Map();
		for (const coin of coinsQuery.data ?? []) index.set(coin.id, coin);
		for (const entry of watchlistQuery.data ?? []) if (entry.coin) index.set(entry.coin.id, entry.coin);
		for (const row of portfolioQuery.data?.portfolio.rows ?? []) if (row.coin) index.set(row.coin.id, row.coin);
		for (const coin of Object.values(livePrices)) index.set(coin.id, coin);
		return index;
	}, [
		coinsQuery.data,
		watchlistQuery.data,
		portfolioQuery.data,
		livePrices
	]);
	/** Market-list order, with live prices applied. */
	const coins$2 = (0, import_react.useMemo)(() => (coinsQuery.data ?? []).map((coin) => coinIndex.get(coin.id) ?? coin), [coinsQuery.data, coinIndex]);
	const getCoin = (0, import_react.useCallback)((id) => coinIndex.get(id), [coinIndex]);
	(0, import_react.useEffect)(() => {
		realtime.connect();
		return realtime.onStatus(setSocketStatus);
	}, []);
	const alarmSoundRef = (0, import_react.useRef)(alarmSoundEnabled);
	alarmSoundRef.current = alarmSoundEnabled;
	(0, import_react.useEffect)(() => {
		return realtime.onMessage((message) => {
			switch (message.type) {
				case "prices": {
					const next = {};
					for (const coin of message.payload.coins) next[coin.id] = coin;
					setLivePrices((current) => ({
						...current,
						...next
					}));
					return;
				}
				case "notification":
					client.setQueryData(queryKeys.notifications, (current) => current ? {
						notifications: [message.payload, ...current.notifications].slice(0, 50),
						unreadCount: current.unreadCount + (message.payload.read ? 0 : 1)
					} : {
						notifications: [message.payload],
						unreadCount: 1
					});
					return;
				case "browser-notification":
					sendBrowserNotification(message.payload.title, message.payload.body);
					return;
				case "alert-triggered": {
					const { alert, coin, alarm } = message.payload;
					setActiveAlarm(toAlarmPayload(alert, coin, cachedPortfolio()));
					if (alarm && alert.notify.alarm && alarmSoundRef.current) alarmEngine.start();
					client.invalidateQueries({ queryKey: queryKeys.alerts });
					client.invalidateQueries({ queryKey: queryKeys.alertProgress });
					return;
				}
				case "portfolio":
					client.setQueryData(queryKeys.portfolio, (current) => current ? {
						...current,
						portfolio: message.payload
					} : current);
					return;
				default: return;
			}
		});
	}, [client, cachedPortfolio]);
	/**
	* Subscribe to exactly what this user cares about, so the server doesn't
	* broadcast the whole market to a tab showing four coins.
	*/
	(0, import_react.useEffect)(() => {
		const wanted = /* @__PURE__ */ new Set();
		for (const alert of alertsQuery.data ?? []) if (alert.coinId) wanted.add(alert.coinId);
		for (const holding of holdingsQuery.data ?? []) wanted.add(holding.coinId);
		for (const entry of watchlistQuery.data ?? []) wanted.add(entry.coinId);
		for (const coin of coinsQuery.data ?? []) wanted.add(coin.id);
		realtime.subscribe([...wanted]);
	}, [
		alertsQuery.data,
		holdingsQuery.data,
		watchlistQuery.data,
		coinsQuery.data
	]);
	/**
	* A push notification can't play audio, so a tap on it opens the app with
	* `?alarm=<id>` and the service worker messages any tab that's already open.
	* Both routes end up here.
	*/
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return void 0;
		const url = new URL(window.location.href);
		const fromUrl = url.searchParams.get("alarm");
		if (fromUrl) {
			setPendingAlarmId(fromUrl);
			url.searchParams.delete("alarm");
			window.history.replaceState({}, "", url.pathname + url.search + url.hash);
		}
		return onServiceWorkerMessage((event) => {
			if (event.type === "coinwake:alarm" && event.payload.alertId) setPendingAlarmId(event.payload.alertId);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		if (!pendingAlarmId) return;
		const alert = (alertsQuery.data ?? []).find((a) => a.id === pendingAlarmId);
		if (!alert) return;
		setPendingAlarmId(null);
		setActiveAlarm(toAlarmPayload(alert, alert.coinId ? coinIndex.get(alert.coinId) ?? null : null, cachedPortfolio()));
		if (alert.notify.alarm && alarmSoundRef.current) alarmEngine.start();
	}, [
		pendingAlarmId,
		alertsQuery.data,
		coinIndex,
		cachedPortfolio
	]);
	const invalidate = (0, import_react.useCallback)((keys) => {
		for (const key of keys) client.invalidateQueries({ queryKey: key });
	}, [client]);
	/**
	* Every write funnels through here so there is exactly one place that decides
	* what a failure looks like (spec 35) and one place that guards on a session.
	*/
	const run = (0, import_react.useCallback)(async (action, needsAuth = true) => {
		if (needsAuth && !isSignedIn()) {
			toast.error("Sign in to save that.", { description: "Your alerts and portfolio are tied to your account." });
			return false;
		}
		try {
			await action();
			return true;
		} catch (error) {
			report(error);
			return false;
		}
	}, []);
	const addHolding = (0, import_react.useCallback)((input) => run(async () => {
		await portfolio.addHolding(input);
		invalidate([
			queryKeys.holdings,
			queryKeys.portfolio,
			queryKeys.allocation
		]);
	}), [run, invalidate]);
	const removeHolding = (0, import_react.useCallback)((id) => run(async () => {
		await portfolio.removeHolding(id);
		invalidate([
			queryKeys.holdings,
			queryKeys.portfolio,
			queryKeys.allocation
		]);
	}), [run, invalidate]);
	const addAlert = (0, import_react.useCallback)((input) => run(async () => {
		await alerts.create(input);
		invalidate([queryKeys.alerts, queryKeys.alertProgress]);
	}), [run, invalidate]);
	const updateAlert = (0, import_react.useCallback)((id, patch) => run(async () => {
		await alerts.update(id, patch);
		invalidate([queryKeys.alerts, queryKeys.alertProgress]);
	}), [run, invalidate]);
	const removeAlert = (0, import_react.useCallback)((id) => run(async () => {
		await alerts.remove(id);
		invalidate([queryKeys.alerts, queryKeys.alertProgress]);
	}), [run, invalidate]);
	const watchedIds = (0, import_react.useMemo)(() => (watchlistQuery.data ?? []).map((entry) => entry.coinId), [watchlistQuery.data]);
	const toggleWatchlist = (0, import_react.useCallback)((coinId) => run(async () => {
		if (watchedIds.includes(coinId)) await watchlist.remove(coinId);
		else await watchlist.add(coinId);
		invalidate([queryKeys.watchlist]);
	}), [
		run,
		invalidate,
		watchedIds
	]);
	const markNotificationRead = (0, import_react.useCallback)((id) => run(async () => {
		await notifications.markRead(id);
		invalidate([queryKeys.notifications]);
	}), [run, invalidate]);
	const markAllNotificationsRead = (0, import_react.useCallback)(() => run(async () => {
		await notifications.markAllRead();
		invalidate([queryKeys.notifications]);
	}), [run, invalidate]);
	/**
	* `["me"]` is invalidated alongside `settings` because `/settings` and
	* `/auth/me` both return the settings object, and a stale copy in the other
	* cache would fight the one just saved.
	*/
	const updateSettings = (0, import_react.useCallback)((patch) => run(async () => {
		await settings.update(patch);
		invalidate([queryKeys.settings, ["me"]]);
	}), [run, invalidate]);
	const updateProfile = (0, import_react.useCallback)((patch) => run(async () => {
		await settings.updateProfile(patch);
		invalidate([queryKeys.settings, ["me"]]);
	}), [run, invalidate]);
	/** The endpoint rotates this device's tokens, so the session survives. */
	const changePassword = (0, import_react.useCallback)((input) => run(async () => {
		await settings.changePassword(input);
		invalidate([queryKeys.settings, ["me"]]);
	}), [run, invalidate]);
	/** Spec 36: the cache still holds the previous user's rows — drop all of it. */
	const clearUserCache = (0, import_react.useCallback)(() => {
		for (const key of [
			["me"],
			queryKeys.alerts,
			queryKeys.alertProgress,
			queryKeys.holdings,
			queryKeys.portfolio,
			queryKeys.allocation,
			queryKeys.watchlist,
			queryKeys.notifications,
			queryKeys.settings,
			["alert-history"]
		]) client.removeQueries({ queryKey: key });
	}, [client]);
	const signIn = (0, import_react.useCallback)(async (email, password) => {
		clearUserCache();
		const ok = await run(() => auth.login({
			email,
			password
		}), false);
		if (ok) setSignedIn(true);
		return ok;
	}, [run, clearUserCache]);
	const register = (0, import_react.useCallback)(async (email, password, name) => {
		clearUserCache();
		const ok = await run(() => auth.register({
			email,
			password,
			...name ? { name } : {}
		}), false);
		if (ok) setSignedIn(true);
		return ok;
	}, [run, clearUserCache]);
	/**
	* Exchange a Google ID token for a session. The token must come from Google's
	* own SDK, so the button that calls this only renders when the server has
	* Google auth configured and the app has a web client id.
	*/
	const signInWithGoogle = (0, import_react.useCallback)(async (idToken) => {
		clearUserCache();
		const ok = await run(() => auth.google(idToken), false);
		if (ok) setSignedIn(true);
		return ok;
	}, [run, clearUserCache]);
	const signOut = (0, import_react.useCallback)(async () => {
		await auth.logout().catch(() => void 0);
		setSignedIn(false);
		setLivePrices({});
		clearUserCache();
	}, [clearUserCache]);
	const setAlarmSoundEnabled = (0, import_react.useCallback)((on) => {
		setAlarmSound(on);
		if (typeof window !== "undefined") window.localStorage.setItem(ALARM_SOUND_KEY, String(on));
		if (!isSignedIn()) return;
		settings.update({ alarm: { sound: on } }).catch(() => void 0);
	}, []);
	const stopAlarm = (0, import_react.useCallback)(() => {
		alarmEngine.stop();
		setActiveAlarm(null);
	}, []);
	/**
	* Snoozing is a server-side concern — the engine has to know not to re-fire —
	* so this disables the alert and lets the cooldown/repeat rules resume it.
	*/
	const snoozeAlarm = (0, import_react.useCallback)(() => {
		alarmEngine.stop();
		setActiveAlarm((current) => {
			if (current) alerts.update(current.alert.id, { status: "DISABLED" }).then(() => invalidate([queryKeys.alerts])).catch(() => void 0);
			return null;
		});
		toast("Alert paused", { description: "Re-enable it from the Alerts screen when you're ready." });
	}, [invalidate]);
	const refresh = (0, import_react.useCallback)(() => {
		client.invalidateQueries();
	}, [client]);
	const loading = {
		coins: coinsQuery.isPending,
		alerts: signedIn && alertsQuery.isPending,
		holdings: signedIn && holdingsQuery.isPending,
		watchlist: signedIn && watchlistQuery.isPending,
		notifications: signedIn && notificationsQuery.isPending,
		portfolio: signedIn && portfolioQuery.isPending
	};
	const connectionError = coinsQuery.isError ? errorMessage(coinsQuery.error) : null;
	const value = (0, import_react.useMemo)(() => ({
		coins: coins$2,
		getCoin,
		socketStatus,
		user: meQuery.data?.user ?? null,
		signedIn,
		signIn,
		register,
		signInWithGoogle,
		signOut,
		holdings: holdingsQuery.data ?? [],
		alerts: alertsQuery.data ?? [],
		watchlist: watchedIds,
		notifications: notificationsQuery.data?.notifications ?? [],
		unreadCount: notificationsQuery.data?.unreadCount ?? 0,
		portfolio: portfolioQuery.data?.portfolio ?? EMPTY_PORTFOLIO,
		settings: meQuery.data?.settings ?? null,
		addHolding,
		removeHolding,
		addAlert,
		updateAlert,
		removeAlert,
		toggleWatchlist,
		markNotificationRead,
		markAllNotificationsRead,
		updateSettings,
		updateProfile,
		changePassword,
		activeAlarm,
		alarmSoundEnabled,
		setAlarmSoundEnabled,
		stopAlarm,
		snoozeAlarm,
		loading,
		connectionError,
		refresh
	}), [
		coins$2,
		getCoin,
		socketStatus,
		meQuery.data,
		signedIn,
		signIn,
		register,
		signInWithGoogle,
		signOut,
		holdingsQuery.data,
		alertsQuery.data,
		watchedIds,
		notificationsQuery.data,
		portfolioQuery.data,
		addHolding,
		removeHolding,
		addAlert,
		updateAlert,
		removeAlert,
		toggleWatchlist,
		markNotificationRead,
		markAllNotificationsRead,
		updateSettings,
		updateProfile,
		changePassword,
		activeAlarm,
		alarmSoundEnabled,
		setAlarmSoundEnabled,
		stopAlarm,
		snoozeAlarm,
		connectionError,
		refresh,
		loading.coins,
		loading.alerts,
		loading.holdings,
		loading.watchlist,
		loading.notifications,
		loading.portfolio
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreContext.Provider, {
		value,
		children
	});
}
function useStore() {
	const ctx = (0, import_react.useContext)(StoreContext);
	if (!ctx) throw new Error("useStore must be used inside StoreProvider");
	return ctx;
}
/** Signed percentage pill — green for gains, red for losses. */
function Delta({ value, className, size = "sm", arrow = true }) {
	const up = value >= 0;
	const Icon = up ? ArrowUpRight : ArrowDownRight;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("num inline-flex items-center gap-0.5 rounded-md font-semibold tabular-nums", up ? "bg-profit/12 text-profit" : "bg-loss/12 text-loss", size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm", className),
		children: [arrow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: size === "sm" ? "size-3" : "size-3.5" }), formatPercent(value)]
	});
}
/** Plain profit/loss coloured text. */
function Signed({ value, format, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("num", value >= 0 ? "text-profit" : "text-loss", className),
		children: [value > 0 ? "+" : "", format(value)]
	});
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var Command$1 = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e, {
	ref,
	className: cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className),
	...props
}));
Command$1.displayName = _e.displayName;
var CommandDialog = ({ children, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			className: "overflow-hidden p-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Command$1, {
				className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5",
				children
			})
		})
	});
};
var CommandInput = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "flex items-center border-b px-3",
	"cmdk-input-wrapper": "",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Input, {
		ref,
		className: cn("flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	})]
}));
CommandInput.displayName = _e.Input.displayName;
var CommandList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.List, {
	ref,
	className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
	...props
}));
CommandList.displayName = _e.List.displayName;
var CommandEmpty = import_react.forwardRef((props, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Empty, {
	ref,
	className: "py-6 text-center text-sm",
	...props
}));
CommandEmpty.displayName = _e.Empty.displayName;
var CommandGroup = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
	ref,
	className: cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className),
	...props
}));
CommandGroup.displayName = _e.Group.displayName;
var CommandSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Separator, {
	ref,
	className: cn("-mx-1 h-px bg-border", className),
	...props
}));
CommandSeparator.displayName = _e.Separator.displayName;
var CommandItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Item, {
	ref,
	className: cn("relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", className),
	...props
}));
CommandItem.displayName = _e.Item.displayName;
var CommandShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest text-muted-foreground", className),
		...props
	});
};
CommandShortcut.displayName = "CommandShortcut";
/**
* Ranked coin matching over a list already in memory.
*
* Kept in the data layer (not the search UI) so a future React Native client can
* reuse the exact same behaviour. Generic over anything with an identity, so it
* ranks both full coins and the price-less results the server's search returns.
*/
function rankCoinMatches(coins, query, limit = 12) {
	const q = query.trim().toLowerCase();
	if (!q) return coins.slice().sort((a, b) => a.rank - b.rank).slice(0, limit);
	const scored = [];
	for (const coin of coins) {
		const symbol = coin.symbol.toLowerCase();
		const name = coin.name.toLowerCase();
		let score = -1;
		if (symbol === q) score = 0;
		else if (name === q) score = 1;
		else if (symbol.startsWith(q)) score = 2;
		else if (name.startsWith(q)) score = 3;
		else if (symbol.includes(q)) score = 4;
		else if (name.includes(q)) score = 5;
		if (score >= 0) scored.push({
			coin,
			score
		});
	}
	return scored.sort((a, b) => a.score - b.score || a.coin.rank - b.coin.rank).slice(0, limit).map((s) => s.coin);
}
/**
* Global coin search. When `onSelect` is provided it acts as a picker, otherwise
* it navigates to the coin detail page.
*
* Two tiers, because the live feed only carries the top coins: the loaded market
* list is matched instantly and in full, and anything else comes from
* `/coins/search`, which reaches the whole provider catalogue. A search result has
* no price — the endpoint returns identity only — so picking one fetches the coin
* before handing it to `onSelect`.
*/
function CoinSearchDialog({ open, onOpenChange, onSelect, title = "Search crypto" }) {
	const { coins: coins$1 } = useStore();
	const navigate = useNavigate();
	const [query, setQuery] = (0, import_react.useState)("");
	const [deferred, setDeferred] = (0, import_react.useState)("");
	const [fetching, setFetching] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!open) setQuery("");
	}, [open]);
	(0, import_react.useEffect)(() => {
		const timer = setTimeout(() => setDeferred(query), 250);
		return () => clearTimeout(timer);
	}, [query]);
	const local = (0, import_react.useMemo)(() => rankCoinMatches(coins$1, query), [coins$1, query]);
	const { data: remote, isFetching } = useCoinSearch(deferred);
	const { data: dexRemote, isFetching: isDexFetching } = useDexSearch(deferred);
	/** Only what the loaded feed doesn't already show, so nothing appears twice. */
	const extra = (0, import_react.useMemo)(() => {
		if (!remote) return [];
		const known = new Set(local.map((c) => c.id));
		return remote.filter((r) => !known.has(r.id));
	}, [remote, local]);
	/** DexScreener results not already in local or CoinGecko remote. */
	const dexExtra = (0, import_react.useMemo)(() => {
		if (!dexRemote) return [];
		const known = /* @__PURE__ */ new Set([...local.map((c) => c.id), ...extra.map((c) => c.id)]);
		return dexRemote.filter((r) => !known.has(r.id));
	}, [
		dexRemote,
		local,
		extra
	]);
	const choose = (coin) => {
		onOpenChange(false);
		if (onSelect) onSelect(coin);
		else navigate({
			to: "/coin/$coinId",
			params: { coinId: coin.id }
		});
	};
	/**
	* A search hit only carries an id, so navigation can go straight there and let
	* the detail page load it — but a picker needs the priced coin in hand.
	*/
	const chooseRemote = async (result) => {
		if (!onSelect) {
			onOpenChange(false);
			navigate({
				to: "/coin/$coinId",
				params: { coinId: result.id }
			});
			return;
		}
		setFetching(result.id);
		try {
			const { coin } = await coins.get(result.id);
			onOpenChange(false);
			onSelect(coin);
		} catch (error) {
			toast.error(errorMessage(error));
		} finally {
			setFetching(null);
		}
	};
	const searching = (isFetching || isDexFetching) && deferred.trim().length >= 2;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandDialog, {
		open,
		onOpenChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, {
			placeholder: `${title} — try "SOL", "BONK", "Bitcoin"…`,
			value: query,
			onValueChange: setQuery
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, {
			className: "max-h-[60vh]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: searching ? "Searching every listed coin…" : `No coins match "${query}".` }),
				local.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
					heading: query ? "Results" : "Top coins",
					children: local.map((coin) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						value: `${coin.symbol} ${coin.name} ${query}`,
						onSelect: () => choose(coin),
						className: "cursor-pointer gap-3 py-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
								coin,
								size: 32
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate font-medium",
									children: coin.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: [
										coin.symbol,
										" · MCap ",
										formatCompact(coin.marketCap)
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-end gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "num text-sm font-semibold",
									children: formatPrice(coin.price)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
									value: coin.change24h,
									arrow: false
								})]
							})
						]
					}, coin.id))
				}),
				extra.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
					heading: "More coins",
					children: extra.map((result) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						value: `${result.symbol} ${result.name} ${query}`,
						onSelect: () => void chooseRemote(result),
						className: "cursor-pointer gap-3 py-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
								coin: {
									symbol: result.symbol,
									color: result.color,
									logo: result.logo
								},
								size: 32
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate font-medium",
									children: result.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: [result.symbol, result.rank > 0 ? ` · Rank #${result.rank}` : ""]
								})]
							}),
							fetching === result.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-muted-foreground" })
						]
					}, result.id))
				}),
				dexExtra.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
					heading: "DEX (Solana)",
					children: dexExtra.map((result) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						value: `${result.symbol} ${result.name} ${query}`,
						onSelect: () => void chooseRemote(result),
						className: "cursor-pointer gap-3 py-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
								coin: {
									symbol: result.symbol,
									color: result.color,
									logo: result.logo
								},
								size: 32
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate font-medium",
									children: result.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: [result.symbol, " · DEX"]
								})]
							}),
							fetching === result.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-muted-foreground" })
						]
					}, result.id))
				}),
				searching && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }), " Searching every listed coin…"]
				})
			]
		})]
	});
}
var ThemeContext = (0, import_react.createContext)(void 0);
function ThemeProvider({ children }) {
	const [theme, setTheme] = (0, import_react.useState)("dark");
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setMounted(true);
		const stored = localStorage.getItem("theme");
		if (stored) setTheme(stored);
		else if (window.matchMedia("(prefers-color-scheme: light)").matches) setTheme("light");
	}, []);
	(0, import_react.useEffect)(() => {
		if (!mounted) return;
		const root = document.documentElement;
		if (theme === "light") {
			root.classList.add("light");
			root.classList.remove("dark");
		} else {
			root.classList.add("dark");
			root.classList.remove("light");
		}
		localStorage.setItem("theme", theme);
	}, [theme, mounted]);
	const toggleTheme = () => setTheme((t) => t === "light" ? "dark" : "light");
	const setThemeDirect = (t) => setTheme(t);
	const contextValue = {
		theme,
		toggleTheme,
		setTheme: setThemeDirect
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, {
		value: contextValue,
		children
	});
}
function useTheme() {
	const context = (0, import_react.useContext)(ThemeContext);
	if (!context) throw new Error("useTheme must be used within a ThemeProvider");
	return context;
}
//#endregion
export { formatNumber as A, rankCoinMatches as B, cn as C, errorMessage as D, errorHint as E, isGain as F, useCoin as G, timeAgo as H, isPushEnabled as I, useScenarioCalculator as J, useMarketCapCalculator as K, push as L, formatPrice as M, formatSupply as N, formatAlertValue as O, formatUsd as P, pushSupport as R, alertThresholdLabel as S, enablePush as T, useAlertProgress as U, requestBrowserNotifications as V, useChart as W, useStore as X, useServerConfig as Y, useTheme as Z, alertConditionLabel as _, CoinSearchDialog as a, alertSubject as b, DialogContent as c, DialogHeader as d, DialogTitle as f, alarmEngine as g, ThemeProvider as h, CoinLogo as i, formatPercent as j, formatCompact as k, DialogDescription as l, StoreProvider as m, ALERT_METRIC_LABEL as n, Delta as o, Signed as p, useProfitCalculator as q, Button as r, Dialog as s, ALERT_KIND_LABEL as t, DialogFooter as u, alertDefinitionUnit as v, disablePush as w, alertThreshold as x, alertProgressUnit as y, queryError as z };
