import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { H as CheckCheck, K as Bell, j as Inbox, n as Wallet, o as TrendingUp, q as BellRing } from "../_libs/lucide-react.mjs";
import { C as cn, H as timeAgo, X as useStore, i as CoinLogo, r as Button } from "./theme-DXxfDXZX.mjs";
import { t as AppShell } from "./AppShell-B6uWFBnx.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-COUlkzTL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-D2__tcYh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KIND_STYLE = {
	PRICE_TARGET: {
		icon: BellRing,
		ring: "border-warn/40 bg-warn/12",
		text: "text-warn",
		label: "Price target"
	},
	MARKET_CAP_TARGET: {
		icon: TrendingUp,
		ring: "border-accent/40 bg-accent/12",
		text: "text-accent",
		label: "Market cap"
	},
	PORTFOLIO_TARGET: {
		icon: Wallet,
		ring: "border-primary/40 bg-primary/12",
		text: "text-primary",
		label: "Portfolio"
	},
	PERCENT_MOVE: {
		icon: TrendingUp,
		ring: "border-profit/40 bg-profit/12",
		text: "text-profit",
		label: "Move"
	},
	ALERT_TRIGGERED: {
		icon: BellRing,
		ring: "border-loss/40 bg-loss/12",
		text: "text-loss",
		label: "Triggered"
	},
	SYSTEM: {
		icon: Bell,
		ring: "border-border bg-surface",
		text: "text-muted-foreground",
		label: "System"
	}
};
function Notifications() {
	const { notifications, markNotificationRead, markAllNotificationsRead, getCoin } = useStore();
	const [filter, setFilter] = (0, import_react.useState)("all");
	const unread = notifications.filter((n) => !n.read).length;
	const shown = (0, import_react.useMemo)(() => filter === "unread" ? notifications.filter((n) => !n.read) : notifications, [notifications, filter]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Notifications",
		subtitle: unread > 0 ? `${unread} unread` : "You're all caught up — nothing needs your attention.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			disabled: unread === 0,
			onClick: markAllNotificationsRead,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "size-4" }), " Mark all read"]
		}),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
			value: filter,
			onValueChange: (v) => setFilter(v),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
				value: "all",
				children: [
					"All (",
					notifications.length,
					")"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
				value: "unread",
				children: [
					"Unread (",
					unread,
					")"
				]
			})] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 space-y-2.5",
			children: [shown.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass rounded-2xl px-6 py-14 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto grid size-12 place-items-center rounded-2xl bg-surface",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "size-5 text-muted-foreground" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-4 font-display text-lg font-semibold",
						children: filter === "unread" ? "No unread notifications" : "Nothing here yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground",
						children: "Alerts, portfolio milestones and market moves land here the moment they happen."
					})
				]
			}), shown.map((n) => {
				const style = KIND_STYLE[n.kind] ?? KIND_STYLE.SYSTEM;
				const Icon = style.icon;
				const coin = n.coinId ? getCoin(n.coinId) : void 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: cn("glass flex items-start gap-3.5 rounded-2xl p-4 transition-colors", !n.read && "border-primary/25 bg-primary/[0.04]"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("grid size-10 shrink-0 place-items-center rounded-xl border", style.ring),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-4.5", style.text) })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-medium",
										children: n.title
									}),
									!n.read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "size-2 shrink-0 rounded-full bg-primary",
										"aria-label": "Unread"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-auto shrink-0 text-xs text-muted-foreground",
										children: timeAgo(n.createdAt)
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: n.body
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2.5 flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", style.ring, style.text),
										children: style.label
									}),
									coin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/coin/$coinId",
										params: { coinId: coin.id },
										className: "flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-2 py-0.5 text-xs transition-colors hover:bg-surface",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
											coin,
											size: 16
										}), coin.symbol]
									}),
									!n.read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										className: "ml-auto h-7 text-xs",
										onClick: () => markNotificationRead(n.id),
										children: "Mark as read"
									})
								]
							})
						]
					})]
				}, n.id);
			})]
		})]
	});
}
//#endregion
export { Notifications as component };
