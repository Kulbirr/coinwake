import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { D as LoaderCircle, G as Calculator, K as Bell, M as Eye, P as Droplets, Q as ArrowLeft, u as Star, y as Plus } from "../_libs/lucide-react.mjs";
import { A as formatNumber, C as cn, G as useCoin, M as formatPrice, N as formatSupply, P as formatUsd, X as useStore, i as CoinLogo, k as formatCompact, o as Delta, r as Button, z as queryError } from "./theme-DXxfDXZX.mjs";
import { r as useAppUi } from "./app-ui-S8GmjT34.mjs";
import { t as Badge } from "./badge-CgxlUbIx.mjs";
import { t as AlertCard } from "./AlertCard--NYFh12n.mjs";
import { t as AppShell } from "./AppShell-B6uWFBnx.mjs";
import { t as Route } from "./coin._coinId-BEdcO3Mf.mjs";
import { n as PriceChart, t as CHART_RANGES } from "./PriceChart-DtBr6ShJ.mjs";
import { t as PriceValue } from "./PriceValue-DwIw6OrC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/coin._coinId-iqEOSO7W.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StatBox({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-surface/50 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] uppercase tracking-wider text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "num mt-1 text-sm font-semibold md:text-base",
				children: value
			}),
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] text-muted-foreground",
				children: hint
			})
		]
	});
}
function CoinDetail() {
	const coinId = Route.useParams().coinId;
	const { getCoin, alerts, watchlist, toggleWatchlist, holdings } = useStore();
	const { openAlertDialog } = useAppUi();
	const [range, setRange] = (0, import_react.useState)("7D");
	const cached = getCoin(coinId);
	const remote = useCoin(cached ? void 0 : coinId);
	const coin = cached ?? remote.data;
	const coinAlerts = (0, import_react.useMemo)(() => alerts.filter((a) => a.coinId === coinId), [alerts, coinId]);
	const alertLevels = (0, import_react.useMemo)(() => coinAlerts.filter((a) => a.status === "ACTIVE").flatMap((a) => {
		const price = a.targetPrice;
		if (price === void 0) return [];
		return [{
			price,
			label: a.name ?? (a.condition === "ABOVE" ? "Target" : "Stop"),
			tone: a.condition === "ABOVE" ? "up" : "down"
		}];
	}), [coinAlerts]);
	const holding = holdings.find((h) => h.coinId === coinId);
	if (!coin) {
		if (remote.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass mx-auto flex max-w-md items-center justify-center gap-3 rounded-2xl p-8 text-sm text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }),
				" Loading ",
				coinId,
				"…"
			]
		}) });
		const failure = queryError(remote.error);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass mx-auto max-w-md rounded-2xl p-8 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-xl font-semibold",
					children: failure ? "Couldn't load that coin" : "Coin not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: failure?.message ?? `We don't have data for "${coinId}".`
				}),
				failure?.hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: failure.hint
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex justify-center gap-2",
					children: [failure && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => void remote.refetch(),
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/market",
							children: "Browse market"
						})
					})]
				})
			]
		}) });
	}
	const onWatchlist = watchlist.includes(coin.id);
	const supplyPct = coin.maxSupply ? (coin.circulatingSupply ?? 0) / coin.maxSupply * 100 : coin.totalSupply ? (coin.circulatingSupply ?? 0) / coin.totalSupply * 100 : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/market",
			className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Market"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass mt-4 rounded-2xl p-5 md:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
						coin,
						size: 56
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-2xl font-bold",
								children: coin.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								className: "text-xs",
								children: coin.symbol
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: "text-xs text-muted-foreground",
								children: ["Rank #", coin.rank]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1.5 flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceValue, {
							value: coin.price,
							className: "text-2xl font-bold md:text-3xl"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
							value: coin.change24h,
							size: "md"
						})]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => openAlertDialog({ coin }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), " Set Alert"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/calculator",
								search: { coin: coin.id },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "size-4" }), " Calculate Profit"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/portfolio",
								search: { add: coin.id },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add to Portfolio"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: onWatchlist ? "secondary" : "outline",
							onClick: () => toggleWatchlist(coin.id),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-4", onWatchlist && "fill-warn text-warn") }), onWatchlist ? "Watching" : "Watchlist"]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid grid-cols-2 gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBox, {
						label: "Market Cap",
						value: formatCompact(coin.marketCap)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBox, {
						label: "24h Volume",
						value: formatCompact(coin.volume24h)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBox, {
						label: "Liquidity",
						value: coin.liquidity ? formatCompact(coin.liquidity) : "—",
						...coin.liquidity ? {} : { hint: "not reported" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBox, {
						label: "24h Change",
						value: `${coin.change24h >= 0 ? "+" : ""}${coin.change24h.toFixed(2)}%`
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 grid gap-5 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "glass rounded-2xl p-5 lg:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "Price Chart"
					}), alertLevels.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							"Dashed lines mark your ",
							alertLevels.length,
							" active alert",
							alertLevels.length === 1 ? "" : "s",
							"."
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex rounded-lg border border-border p-0.5",
						children: CHART_RANGES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setRange(r),
							className: cn("cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors", range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"),
							children: r
						}, r))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceChart, {
						coin,
						range,
						alertLevels,
						height: 340
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass rounded-2xl p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Droplets, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-semibold",
							children: "Supply"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Circulating"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "num font-medium",
									children: formatSupply(coin.circulatingSupply)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Total"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "num font-medium",
									children: formatSupply(coin.totalSupply)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Max"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "num font-medium",
									children: coin.maxSupply ? formatSupply(coin.maxSupply) : "∞"
								})]
							}),
							supplyPct !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-1.5 w-full overflow-hidden rounded-full bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-full bg-gradient-to-r from-primary to-accent",
									style: { width: `${Math.min(supplyPct, 100)}%` }
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-[11px] text-muted-foreground",
								children: [
									supplyPct.toFixed(1),
									"% of ",
									coin.maxSupply ? "max" : "total",
									" in circulation"
								]
							})] })
						]
					})]
				}), holding && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass rounded-2xl p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "Your Position"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Holdings"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "num font-medium",
									children: [
										formatNumber(holding.quantity),
										" ",
										coin.symbol
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Value"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "num font-medium",
									children: formatUsd(holding.quantity * coin.price)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Avg buy"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "num font-medium",
									children: formatPrice(holding.averageBuyPrice)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "P/L"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("num font-medium", coin.price >= holding.averageBuyPrice ? "text-profit" : "text-loss"),
									children: formatUsd((coin.price - holding.averageBuyPrice) * holding.quantity)
								})]
							})
						]
					})]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-display text-lg font-semibold",
					children: [
						"Alerts for ",
						coin.symbol,
						coinAlerts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ml-2 text-sm text-muted-foreground",
							children: [
								"(",
								coinAlerts.length,
								")"
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => openAlertDialog({ coin }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add alert"]
				})]
			}), coinAlerts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass mt-3 rounded-2xl p-6 text-center text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "mx-auto size-6 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2",
					children: [
						"No alerts on ",
						coin.symbol,
						" yet. Set one and we'll watch it for you — even at 3am."
					]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-3 md:grid-cols-2",
				children: coinAlerts.map((alert) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertCard, {
					alert,
					coin
				}, alert.id))
			})]
		})
	] });
}
//#endregion
export { CoinDetail as component };
