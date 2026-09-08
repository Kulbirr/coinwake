import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { G as Calculator, K as Bell, M as Eye, U as ChartLine, Z as ArrowRight, c as Target, f as Smartphone, o as TrendingUp, p as Siren } from "../_libs/lucide-react.mjs";
import { X as useStore, i as CoinLogo, k as formatCompact, o as Delta, r as Button } from "./theme-DXxfDXZX.mjs";
import { n as BrandMark } from "./AppShell-B6uWFBnx.mjs";
import { n as PriceChart } from "./PriceChart-DtBr6ShJ.mjs";
import { t as PriceValue } from "./PriceValue-DwIw6OrC.mjs";
import { t as CoinSparkline } from "./Sparkline-DQ-7B6aF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-qq2DX4nM.js
var import_jsx_runtime = require_jsx_runtime();
var PREVIEW_IDS = [
	"bitcoin",
	"ethereum",
	"solana",
	"bonk"
];
var WATCH_IDS = [
	"solana",
	"bonk",
	"pepe",
	"sui"
];
var isCoin = (c) => c !== void 0;
var FEATURES = [
	{
		icon: Bell,
		emoji: "🔔",
		title: "Smart Price Alerts",
		body: "Set as many price and market-cap targets per coin as you like. Above, below, one-time or recurring."
	},
	{
		icon: Siren,
		emoji: "🚨",
		title: "Loud CoinWake",
		body: "A full-screen, repeating alarm that won't stop until you tap it. Impossible to sleep through a moonshot."
	},
	{
		icon: Calculator,
		emoji: "💰",
		title: "Profit Calculator",
		body: "Know exactly what your bag is worth at any price — or any market cap — before you ape in."
	},
	{
		icon: Target,
		emoji: "📈",
		title: "Market Cap Targets",
		body: "Think in market caps, not prices. We convert with real circulating supply, never total supply."
	},
	{
		icon: Eye,
		emoji: "👀",
		title: "Watchlists",
		body: "Track the coins you care about with live prices, distance-to-target and instant alerting."
	},
	{
		icon: Smartphone,
		emoji: "📱",
		title: "Push Notifications",
		body: "Browser and push notifications wherever you are. Set your target, then go live your life."
	}
];
function DashboardPreview() {
	const { coins } = useStore();
	const preview = PREVIEW_IDS.map((id) => coins.find((c) => c.id === id)).filter(isCoin);
	const lead = preview[0];
	const sol = coins.find((c) => c.id === "solana");
	if (!lead || !sol) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "glass rounded-3xl p-3 shadow-glow md:p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border bg-background/60 p-4 md:p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs uppercase tracking-wider text-muted-foreground",
						children: "Portfolio Value"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "num mt-1 text-2xl font-semibold md:text-3xl",
						children: "$12,450"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
						value: 24.5,
						size: "md"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 overflow-hidden rounded-xl border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceChart, {
						coin: lead,
						range: "7D",
						height: 150
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid grid-cols-2 gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-surface/60 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-3.5 text-primary" }), " Active alert"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1.5 flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
									coin: sol,
									size: 24
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-semibold",
									children: "SOL → $250"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 h-1.5 overflow-hidden rounded-full bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-[72%] rounded-full bg-gradient-to-r from-primary to-accent" })
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-surface/60 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: "Total Profit"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "num mt-1 text-lg font-semibold text-profit",
								children: "+$7,450"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-xs text-profit",
								children: "ROI +149%"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 space-y-1.5",
					children: preview.map((coin) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 rounded-lg px-1 py-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
								coin,
								size: 26
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium",
								children: coin.symbol
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinSparkline, {
								coinId: coin.id,
								width: 64,
								height: 22
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceValue, {
								value: coin.price,
								className: "ml-auto text-sm"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
								value: coin.change24h,
								arrow: false,
								className: "w-16 justify-center"
							})
						]
					}, coin.id))
				})
			]
		})
	});
}
function LiveWatchRows() {
	const { coins } = useStore();
	const rows = WATCH_IDS.map((id) => coins.find((c) => c.id === id)).filter(isCoin);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: rows.map((coin) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 rounded-xl border border-border bg-surface/50 px-4 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
				coin,
				size: 30
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-medium",
				children: coin.symbol
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted-foreground",
				children: formatCompact(coin.marketCap)
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinSparkline, {
				coinId: coin.id,
				width: 72,
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
	}, coin.id)) });
}
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/dashboard",
								children: ["Open dashboard ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
							})
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl px-4 md:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid items-center gap-10 py-14 md:py-20 lg:grid-cols-2 lg:gap-12",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "relative flex size-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inline-flex size-full animate-ping rounded-full bg-profit opacity-70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "relative inline-flex size-2 rounded-full bg-profit" })]
								}), "Live market watch · 12 coins tracked"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl",
								children: ["Never Miss Your ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-gradient",
									children: "Crypto Target."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-5 max-w-xl text-base text-muted-foreground md:text-lg",
								children: "Set price and market-cap alerts, calculate your potential profits, and let CoinWake watch the market for you."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-7 flex flex-col gap-3 sm:flex-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "lg",
									className: "h-12 px-6 text-base",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/dashboard",
										children: ["Start Tracking ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "lg",
									variant: "outline",
									className: "h-12 px-6 text-base",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/calculator",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "size-4" }), " Try Profit Calculator"]
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-6 text-sm italic text-muted-foreground",
								children: "\"Set your target. Go live your life. We'll wake you up when crypto gets there.\""
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardPreview, {})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "py-12 md:py-16",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto max-w-2xl text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl font-semibold md:text-4xl",
								children: "Everything you need to catch the top"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-muted-foreground",
								children: "CoinMarketCap + portfolio tracker + profit calculator + alarm clock — in one premium dashboard."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
							children: FEATURES.map(({ icon: Icon, emoji, title, body }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "glass group rounded-2xl p-5 transition-transform hover:-translate-y-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-accent/20 text-xl",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"aria-hidden": true,
											children: emoji
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "mt-4 flex items-center gap-2 font-display text-lg font-semibold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-primary" }), title]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm leading-relaxed text-muted-foreground",
										children: body
									})
								]
							}, title))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid gap-6 py-12 md:py-16 lg:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass rounded-3xl p-6 md:p-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-sm font-medium text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-4" }), " Market-cap math, done right"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-3 font-display text-2xl font-semibold",
									children: "What happens if MoonPup hits $10M?"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 text-sm text-muted-foreground",
									children: [
										"Enter a target market cap and we convert it to a price using",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-foreground",
											children: "circulating supply"
										}),
										" — never total supply — so your projected profit is honest."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-5 space-y-2.5",
									children: [
										{
											cap: "$1M",
											value: "$175",
											roi: "+157%"
										},
										{
											cap: "$10M",
											value: "$1,750",
											roi: "+2,157%"
										},
										{
											cap: "$100M",
											value: "$17,500",
											roi: "+22,157%"
										}
									].map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between rounded-xl border border-border bg-surface/50 px-4 py-2.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "num text-sm text-muted-foreground",
												children: [row.cap, " cap"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "num text-sm font-semibold",
												children: row.value
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "num text-sm font-semibold text-profit",
												children: row.roi
											})
										]
									}, row.cap))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									className: "mt-6 w-full",
									variant: "outline",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/calculator",
										children: ["Open the calculator ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
									})
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass flex flex-col justify-between rounded-3xl p-6 md:p-8",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-sm font-medium text-warn",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLine, { className: "size-4" }), " Live watchlist"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-3 font-display text-2xl font-semibold",
								children: "Prices that move while you watch"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-5 space-y-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveWatchRows, {})
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "py-16",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass relative overflow-hidden rounded-3xl px-6 py-14 text-center shadow-glow md:px-10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "pointer-events-none absolute inset-0",
									style: { background: "radial-gradient(600px 300px at 50% 0%, oklch(0.62 0.19 268 / 0.25), transparent 70%)" }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "relative font-display text-3xl font-bold md:text-5xl",
									children: ["Set your target. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gradient",
										children: "We'll wake you up."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "relative mx-auto mt-4 max-w-xl text-muted-foreground",
									children: "Start tracking your portfolio and never sleep through another target again."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative mt-8 flex flex-col justify-center gap-3 sm:flex-row",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										size: "lg",
										className: "h-12 px-8 text-base",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/dashboard",
											children: ["Start Tracking ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										size: "lg",
										variant: "outline",
										className: "h-12 px-8 text-base",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/calculator",
											children: "Try Profit Calculator"
										})
									})]
								})
							]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-border/60 py-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground md:flex-row md:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Demo build with realistic mock market data. Not financial advice." })]
				})
			})
		]
	});
}
//#endregion
export { Landing as component };
