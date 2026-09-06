import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { A as Info, F as Coins, K as Bell, Z as ArrowRight, d as Sparkles, n as Wallet, o as TrendingUp, y as Plus } from "../_libs/lucide-react.mjs";
import { A as formatNumber, C as cn, F as isGain, M as formatPrice, P as formatUsd, U as useAlertProgress, X as useStore, _ as alertConditionLabel, a as CoinSearchDialog, b as alertSubject, i as CoinLogo, j as formatPercent, k as formatCompact, o as Delta, p as Signed, r as Button } from "./theme-DXxfDXZX.mjs";
import { n as Label, t as Input } from "./label-SOE_QdsM.mjs";
import { r as useAppUi } from "./app-ui-S8GmjT34.mjs";
import { n as AlertProgressBar } from "./AlertCard--NYFh12n.mjs";
import { t as AppShell } from "./AppShell-B6uWFBnx.mjs";
import { n as useCalculator, t as HowCalculated } from "./use-calculator-_i1OKHuX.mjs";
import { t as StatCard } from "./StatCard-C9FCMGPh.mjs";
import { t as PriceValue } from "./PriceValue-DwIw6OrC.mjs";
import { t as CoinSparkline } from "./Sparkline-DQ-7B6aF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-DGVRanyB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Dashboard calculator widget — answers "what would my bag be worth?" without
* leaving the page. Same server-side calculator as the full screen, so the two
* can never disagree; this one just shows fewer of the answers.
*/
function QuickCalculator() {
	const calc = useCalculator();
	const { holdings } = useStore();
	const { openAlertDialog } = useAppUi();
	const [pickerOpen, setPickerOpen] = (0, import_react.useState)(false);
	const { coin, fields, set, selectCoin, result, targetPrice, targetMarketCap, supplyEstimated, supplyNote, costBasisNote, error } = calc;
	const hasResult = (result?.investment ?? 0) > 0 && (targetPrice ?? 0) > 0;
	/** Spec 28 — if this coin is already a position, don't make them retype it. */
	const prefill = (next) => {
		selectCoin(next);
		const holding = holdings.find((h) => h.coinId === next.id);
		if (holding) {
			set("quantity", String(holding.quantity));
			set("purchasePrice", String(holding.averageBuyPrice));
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass relative overflow-hidden rounded-2xl p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0",
				style: { background: "radial-gradient(500px 240px at 85% 0%, oklch(0.62 0.19 268 / 0.16), transparent 70%)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "flex items-center gap-2 font-display text-lg font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-primary" }), " Quick Profit Calculator"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/calculator",
					className: "text-xs text-primary hover:underline",
					children: "Full calculator"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs text-muted-foreground",
							children: "Coin"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setPickerOpen(true),
							className: "flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-input bg-surface/50 px-2.5 transition-colors hover:bg-surface",
							children: coin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
								coin,
								size: 22
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium",
								children: coin.symbol
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm text-muted-foreground",
								children: "Search…"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs text-muted-foreground",
							htmlFor: "qc-qty",
							children: "Coins held"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "qc-qty",
							type: "number",
							inputMode: "decimal",
							step: "any",
							className: "num h-10",
							value: fields.quantity,
							onChange: (e) => set("quantity", e.target.value),
							placeholder: "0"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs text-muted-foreground",
							htmlFor: "qc-buy",
							children: "Buy price"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "qc-buy",
							type: "number",
							inputMode: "decimal",
							step: "any",
							className: "num h-10",
							value: fields.purchasePrice,
							onChange: (e) => set("purchasePrice", e.target.value),
							placeholder: "optional"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs text-muted-foreground",
								htmlFor: "qc-target",
								children: fields.mode === "PRICE" ? "Target price" : "Target mcap"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => set("mode", fields.mode === "PRICE" ? "MARKET_CAP" : "PRICE"),
								className: "cursor-pointer text-[10px] font-medium text-primary hover:underline",
								children: ["use ", fields.mode === "PRICE" ? "mcap" : "price"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "qc-target",
							type: "number",
							inputMode: "decimal",
							step: "any",
							className: "num h-10",
							value: fields.mode === "PRICE" ? fields.targetPrice : fields.targetMarketCap,
							onChange: (e) => set(fields.mode === "PRICE" ? "targetPrice" : "targetMarketCap", e.target.value),
							placeholder: fields.mode === "PRICE" ? "0.001" : "10,000,000"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mt-4 rounded-2xl border border-primary/25 bg-primary/[0.06] p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"Your",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "num font-semibold text-foreground",
								children: formatUsd(result?.investment)
							}),
							" ",
							"investment would become",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "num font-semibold text-profit",
								children: formatUsd(result?.targetValue)
							}),
							coin && fields.mode === "MARKET_CAP" && targetMarketCap !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								" ",
								"at a ",
								formatCompact(targetMarketCap),
								" market cap (",
								formatPrice(targetPrice),
								" per",
								" ",
								coin.symbol,
								")"
							] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3.5 grid grid-cols-2 gap-3 md:grid-cols-5",
						children: [
							{
								label: "Investment",
								value: formatUsd(result?.investment)
							},
							{
								label: "Current value",
								value: formatUsd(result?.currentValue)
							},
							{
								label: "Target value",
								value: formatUsd(result?.targetValue)
							},
							{
								label: "Profit",
								value: `${isGain(result?.profit) ? "+" : ""}${formatUsd(result?.profit)}`,
								tone: isGain(result?.profit) ? "text-profit" : "text-loss"
							},
							{
								label: "ROI",
								value: formatPercent(result?.roi),
								tone: isGain(result?.roi) ? "text-profit" : "text-loss"
							}
						].map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase tracking-wider text-muted-foreground",
							children: cell.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("num mt-0.5 text-sm font-semibold", cell.tone),
							children: cell.value
						})] }, cell.label))
					}),
					hasResult && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap items-center gap-2",
						children: [
							result?.multiple != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "num rounded-full bg-warn/12 px-2.5 py-1 text-xs font-semibold text-warn",
								children: [formatNumber(result.multiple, 2), "x multiple"]
							}),
							coin && targetPrice !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => openAlertDialog({
									coin,
									defaultTargetPrice: targetPrice
								}),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-3.5" }),
									" Alert me at ",
									formatPrice(targetPrice)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								variant: "ghost",
								className: "ml-auto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/calculator",
									children: ["Scenarios ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" })]
								})
							})
						]
					}),
					(supplyNote ?? costBasisNote) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: cn("mt-3 flex gap-1.5 text-xs", supplyEstimated ? "text-warn" : "text-muted-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "mt-px size-3.5 shrink-0" }), supplyNote ?? costBasisNote]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn",
						children: [
							error,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/calculator",
								className: "underline",
								children: "Open the full calculator"
							}),
							" ",
							"to enter a circulating supply."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HowCalculated, {
				className: "relative mt-3",
				rows: [
					{
						label: "Initial Investment",
						formula: "Coins Held × Purchase Price",
						result: formatUsd(result?.investment)
					},
					{
						label: "Current Holdings Value",
						formula: "Coins Held × Current Price",
						result: formatUsd(result?.currentValue)
					},
					{
						label: "Target Holdings Value",
						formula: "Coins Held × Target Price",
						result: formatUsd(result?.targetValue)
					},
					{
						label: "Profit",
						formula: "Target Holdings Value − Initial Investment",
						result: formatUsd(result?.profit)
					},
					{
						label: "ROI",
						formula: "Profit ÷ Initial Investment × 100",
						result: formatPercent(result?.roi)
					}
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinSearchDialog, {
				open: pickerOpen,
				onOpenChange: setPickerOpen,
				onSelect: prefill,
				title: "Pick a coin"
			})
		]
	});
}
function Dashboard() {
	const { portfolio, alerts, coins, watchlist, getCoin } = useStore();
	const { data: progressRows } = useAlertProgress();
	const { openAlertDialog } = useAppUi();
	/** Server-computed progress, by alert id (spec 30). */
	const progressById = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const row of progressRows ?? []) map.set(row.alertId, row);
		return map;
	}, [progressRows]);
	const activeAlerts = (0, import_react.useMemo)(() => alerts.filter((a) => a.status === "ACTIVE").slice(0, 4), [alerts]);
	const topHoldings = (0, import_react.useMemo)(() => portfolio.rows.slice().sort((a, b) => b.value - a.value).slice(0, 5), [portfolio.rows]);
	const movers = (0, import_react.useMemo)(() => coins.slice().sort((a, b) => b.change24h - a.change24h).slice(0, 5), [coins]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Dashboard",
		subtitle: "Set your target. Go live your life. We'll wake you up when crypto gets there.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/portfolio",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4" }), " Portfolio"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			onClick: () => openAlertDialog(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " New alert"]
		})] }),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Portfolio Value",
						value: formatUsd(portfolio.value),
						delta: portfolio.roi,
						icon: Wallet,
						tone: "primary",
						sub: "all holdings"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Invested",
						value: formatUsd(portfolio.invested),
						icon: Coins,
						sub: `${portfolio.rows.length} positions`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Profit",
						value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Signed, {
							value: portfolio.profit,
							format: (v) => formatUsd(v)
						}),
						icon: TrendingUp,
						tone: portfolio.profit >= 0 ? "profit" : "loss",
						sub: "unrealised"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "ROI",
						value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: portfolio.roi >= 0 ? "text-profit" : "text-loss",
							children: formatPercent(portfolio.roi)
						}),
						icon: TrendingUp,
						tone: portfolio.roi >= 0 ? "profit" : "loss",
						sub: "since entry"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-5 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickCalculator, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass rounded-2xl p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "flex items-center gap-2 font-display text-lg font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4 text-primary" }), "Active Alerts"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-full bg-profit/12 px-2.5 py-0.5 text-xs font-semibold text-profit",
								children: [
									"🔔 ",
									alerts.filter((a) => a.status === "ACTIVE").length,
									" Active"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-4",
							children: [activeAlerts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "No active alerts yet. Create one and we'll watch the market for you."
							}), activeAlerts.map((alert) => {
								const coin = alert.coinId ? getCoin(alert.coinId) ?? null : null;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [
										coin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
											coin,
											size: 24
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-sm font-medium",
											children: [
												alertSubject(alert, coin),
												" ",
												alertConditionLabel(alert)
											]
										}),
										alert.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-auto truncate text-xs text-muted-foreground",
											children: alert.name
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertProgressBar, {
										alert,
										progress: progressById.get(alert.id)
									})
								})] }, alert.id);
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							size: "sm",
							className: "mt-4 w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/alerts",
								children: ["Manage alerts ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-5 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass rounded-2xl p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-semibold",
							children: "Top Holdings"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/portfolio",
							className: "text-xs text-primary hover:underline",
							children: "View all"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-1",
						children: [topHoldings.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No holdings yet — add your first position from the portfolio page."
						}), topHoldings.map(({ holding, coin, value }) => {
							if (!coin) return null;
							const share = portfolio.value ? value / portfolio.value * 100 : 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/coin/$coinId",
								params: { coinId: coin.id },
								className: "flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface/60",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
										coin,
										size: 34
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-sm font-medium",
											children: coin.symbol
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1 h-1 w-full overflow-hidden rounded-full bg-muted",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-full rounded-full bg-gradient-to-r from-primary to-accent",
												style: { width: `${share}%` }
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-right",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "num text-sm font-semibold",
											children: formatUsd(value)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "num text-xs text-muted-foreground",
											children: [share.toFixed(1), "%"]
										})]
									})
								]
							}, holding.id);
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass rounded-2xl p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-semibold",
							children: "Top Movers"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/market",
							className: "text-xs text-primary hover:underline",
							children: "Market"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-1",
						children: movers.map((coin) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/coin/$coinId",
							params: { coinId: coin.id },
							className: "flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
									coin,
									size: 32
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-medium",
										children: coin.symbol
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: formatCompact(coin.marketCap)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinSparkline, {
									coinId: coin.id,
									width: 70,
									height: 26
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "ml-auto text-right",
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
						}, coin.id))
					})]
				})]
			}),
			watchlist.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "glass mt-5 rounded-2xl p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "Watchlist"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/watchlist",
						className: "text-xs text-primary hover:underline",
						children: "View all"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
					children: watchlist.slice(0, 4).map((id) => {
						const coin = getCoin(id);
						if (!coin) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/coin/$coinId",
							params: { coinId: id },
							className: "rounded-xl border border-border bg-surface/50 p-3 transition-colors hover:bg-surface",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
										coin,
										size: 28
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-medium",
										children: coin.symbol
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
										value: coin.change24h,
										arrow: false,
										className: "ml-auto"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceValue, {
								value: coin.price,
								className: "mt-2 block text-base font-semibold"
							})]
						}, id);
					})
				})]
			})
		]
	});
}
//#endregion
export { Dashboard as component };
