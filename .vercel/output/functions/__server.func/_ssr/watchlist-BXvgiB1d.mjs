import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { K as Bell, M as Eye, c as Target, u as Star, y as Plus } from "../_libs/lucide-react.mjs";
import { C as cn, M as formatPrice, X as useStore, a as CoinSearchDialog, i as CoinLogo, j as formatPercent, k as formatCompact, o as Delta, r as Button, v as alertDefinitionUnit, x as alertThreshold } from "./theme-DXxfDXZX.mjs";
import { r as useAppUi } from "./app-ui-S8GmjT34.mjs";
import { t as AppShell } from "./AppShell-B6uWFBnx.mjs";
import { t as PriceValue } from "./PriceValue-DwIw6OrC.mjs";
import { t as CoinSparkline } from "./Sparkline-DQ-7B6aF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/watchlist-BXvgiB1d.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Watchlist derivation (spec 15). Pure so both web and React Native clients can
* render the same rows from the same feed.
*
* Coins are resolved through `getCoin`, not a market-list array: a watched coin
* is often ranked below the loaded top list, so looking it up in that list alone
* would silently drop it from the table. `getCoin` reads the store's full index —
* market list, watched coins and live socket prices — so every starred coin
* renders (spec 35).
*
* "Your target" only considers price alerts: a market-cap or percentage target
* isn't a price the current price can be a percentage away from, so mixing them
* into the same comparison would rank rows by numbers that mean different things.
*/
function buildWatchlistRows(watchlist, getCoin, alerts) {
	return watchlist.map((id) => getCoin(id)).filter((coin) => coin !== void 0).map((coin) => {
		const active = alerts.filter((a) => a.coinId === coin.id && a.status === "ACTIVE");
		const target = active.filter((a) => alertDefinitionUnit(a) === "PRICE" && alertThreshold(a) !== null).reduce((closest, alert) => {
			if (!closest) return alert;
			return Math.abs(gapPercent(coin.price, alert)) < Math.abs(gapPercent(coin.price, closest)) ? alert : closest;
		}, void 0);
		return {
			coin,
			target,
			distance: target ? gapPercent(coin.price, target) : void 0,
			activeAlerts: active.length
		};
	});
}
/** How far the current price is from an alert's target, as a percentage. */
function gapPercent(current, alert) {
	const target = alertThreshold(alert);
	if (target === null || !current) return 0;
	return (target - current) / current * 100;
}
function WatchlistPage() {
	const { watchlist, getCoin, alerts, toggleWatchlist } = useStore();
	const { openAlertDialog } = useAppUi();
	const [pickerOpen, setPickerOpen] = (0, import_react.useState)(false);
	const rows = (0, import_react.useMemo)(() => buildWatchlistRows(watchlist, getCoin, alerts), [
		watchlist,
		getCoin,
		alerts
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Watchlist",
		subtitle: "The coins you care about — live price, target and distance to go.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			onClick: () => setPickerOpen(true),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add coin"]
		}),
		children: [rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass rounded-2xl px-6 py-14 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto grid size-12 place-items-center rounded-2xl bg-surface",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-5 text-muted-foreground" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 font-display text-lg font-semibold",
					children: "Your watchlist is empty"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground",
					children: "Add coins to keep an eye on their price, market cap and distance to your targets — all in one place."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "mt-5",
					onClick: () => setPickerOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add coin"]
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "glass hidden rounded-2xl p-5 lg:block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[880px] text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Coin"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Price"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "24h"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Market cap"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Volume"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Your target"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Distance"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "7d"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-24 py-2" })
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map(({ coin, target, distance }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/60 transition-colors hover:bg-surface/50",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3 pr-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/coin/$coinId",
									params: { coinId: coin.id },
									className: "flex items-center gap-2.5 hover:text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
										coin,
										size: 30
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block font-medium",
										children: coin.symbol
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-muted-foreground",
										children: coin.name
									})] })]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3 pr-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceValue, {
									value: coin.price,
									className: "text-sm font-medium"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3 pr-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
									value: coin.change24h,
									arrow: false
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "num py-3 pr-3 text-muted-foreground",
								children: formatCompact(coin.marketCap)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "num py-3 pr-3 text-muted-foreground",
								children: formatCompact(coin.volume24h)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "num py-3 pr-3",
								children: target ? formatPrice(target.targetPrice) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "—"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "num py-3 pr-3",
								children: distance === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "no target"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: distance >= 0 ? "text-profit" : "text-loss",
									children: formatPercent(distance)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3 pr-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinSparkline, {
									coinId: coin.id,
									width: 80,
									height: 26
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-end gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										className: "size-8",
										"aria-label": `Set alert for ${coin.symbol}`,
										onClick: () => openAlertDialog({ coin }),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										className: "size-8 text-warn",
										"aria-label": `Remove ${coin.symbol} from watchlist`,
										onClick: () => toggleWatchlist(coin.id),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 fill-warn" })
									})]
								})
							})
						]
					}, coin.id)) })]
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:hidden",
			children: rows.map(({ coin, target, distance }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass rounded-2xl p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/coin/$coinId",
								params: { coinId: coin.id },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
									coin,
									size: 38
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium",
									children: coin.symbol
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "num text-xs text-muted-foreground",
									children: formatCompact(coin.marketCap)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceValue, {
									value: coin.price,
									className: "text-sm font-semibold"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-0.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
										value: coin.change24h,
										arrow: false
									})
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinSparkline, {
							coinId: coin.id,
							width: 100,
							height: 30
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto text-right text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-end gap-1 text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "size-3" }), " target"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "num font-medium",
								children: [target ? formatPrice(target.targetPrice) : "—", distance !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("ml-1.5", distance >= 0 ? "text-profit" : "text-loss"),
									children: formatPercent(distance)
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							className: "flex-1",
							onClick: () => openAlertDialog({ coin }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-3.5" }), " Set Alert"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							className: "text-warn",
							"aria-label": `Remove ${coin.symbol} from watchlist`,
							onClick: () => toggleWatchlist(coin.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 fill-warn" })
						})]
					})
				]
			}, coin.id))
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinSearchDialog, {
			open: pickerOpen,
			onOpenChange: setPickerOpen,
			onSelect: (c) => toggleWatchlist(c.id),
			title: "Add to watchlist"
		})]
	});
}
//#endregion
export { WatchlistPage as component };
