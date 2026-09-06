import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { A as Info, D as LoaderCircle, G as Calculator, K as Bell, L as ChevronsUpDown, o as TrendingUp, s as Trash2, y as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as formatNumber, C as cn, F as isGain, M as formatPrice, N as formatSupply, P as formatUsd, X as useStore, a as CoinSearchDialog, i as CoinLogo, j as formatPercent, k as formatCompact, r as Button } from "./theme-DXxfDXZX.mjs";
import { n as Label, t as Input } from "./label-SOE_QdsM.mjs";
import { r as useAppUi } from "./app-ui-S8GmjT34.mjs";
import { t as Badge } from "./badge-CgxlUbIx.mjs";
import { t as AppShell } from "./AppShell-B6uWFBnx.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-COUlkzTL.mjs";
import { t as Route } from "./calculator-9sBZRtRC.mjs";
import { n as useCalculator, t as HowCalculated } from "./use-calculator-_i1OKHuX.mjs";
import { t as StatCard } from "./StatCard-C9FCMGPh.mjs";
import { a as CartesianGrid, c as ResponsiveContainer, i as Area, l as Tooltip, n as YAxis, o as ReferenceDot, r as XAxis, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calculator-Bj5HnAuF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Section 12 of the spec: portfolio value plotted against market cap so users
* can *see* what each valuation is worth to them.
*/
function ScenarioChart({ points, currentMarketCap, currentValue, height = 280 }) {
	if (points.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: { height },
		className: "grid place-items-center rounded-xl border border-dashed border-border text-sm text-muted-foreground",
		children: "Add at least two scenarios to plot the curve."
	});
	const showCurrent = currentMarketCap !== void 0 && currentValue !== void 0 && currentMarketCap > 0 && currentMarketCap >= (points[0]?.marketCap ?? 0) && currentMarketCap <= (points[points.length - 1]?.marketCap ?? 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: { height },
		className: "w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
				data: points,
				margin: {
					top: 12,
					right: 16,
					left: 4,
					bottom: 4
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
						id: "scenario-grad",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "var(--profit)",
							stopOpacity: .35
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "var(--profit)",
							stopOpacity: 0
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						stroke: "var(--border)",
						vertical: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "marketCap",
						type: "number",
						scale: "linear",
						domain: ["dataMin", "dataMax"],
						tickFormatter: (v) => formatCompact(v),
						stroke: "var(--muted-foreground)",
						fontSize: 11,
						tickLine: false,
						axisLine: false,
						minTickGap: 30,
						label: {
							value: "Market Cap",
							position: "insideBottom",
							offset: -2,
							fill: "var(--muted-foreground)",
							fontSize: 11
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						tickFormatter: (v) => formatCompact(v),
						stroke: "var(--muted-foreground)",
						fontSize: 11,
						tickLine: false,
						axisLine: false,
						width: 68
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						contentStyle: {
							background: "var(--popover)",
							border: "1px solid var(--border)",
							borderRadius: 12,
							fontSize: 12
						},
						labelFormatter: (v) => `Market cap ${formatCompact(Number(v))}`,
						formatter: (v) => [formatUsd(v), "Portfolio value"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						type: "monotone",
						dataKey: "value",
						stroke: "var(--profit)",
						strokeWidth: 2,
						fill: "url(#scenario-grad)",
						dot: {
							r: 3,
							fill: "var(--profit)",
							strokeWidth: 0
						},
						isAnimationActive: false
					}),
					showCurrent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceDot, {
						x: currentMarketCap,
						y: currentValue,
						r: 5,
						fill: "var(--warn)",
						stroke: "var(--background)",
						strokeWidth: 2,
						label: {
							value: "you are here",
							position: "top",
							fill: "var(--warn)",
							fontSize: 10
						}
					})
				]
			})
		})
	});
}
/** Section 11: one-tap market-cap scenarios. */
var QUICK_CAPS = [
	{
		label: "+1M",
		amount: 1e6
	},
	{
		label: "+5M",
		amount: 5e6
	},
	{
		label: "+10M",
		amount: 1e7
	},
	{
		label: "+50M",
		amount: 5e7
	},
	{
		label: "+100M",
		amount: 1e8
	}
];
function CalculatorPage() {
	const { coin: coinParam } = Route.useSearch();
	const { holdings } = useStore();
	const { openAlertDialog } = useAppUi();
	const [pickerOpen, setPickerOpen] = (0, import_react.useState)(false);
	const [customCap, setCustomCap] = (0, import_react.useState)("");
	const { fields, set, coin, selectCoin, scenarios, addScenario, removeScenario, scenarioFull, currentPrice, targetPrice, supply, supplyEstimated, supplyNote, costBasisNote, disclaimer, currentMarketCap, targetMarketCap, result, pending, error, hint } = useCalculator(coinParam ? {
		coinId: coinParam,
		mode: "MARKET_CAP"
	} : {});
	/**
	* Prefill from an existing position so nobody re-types numbers we already
	* know (spec 28). Guarded by a ref so we only seed once per coin.
	*/
	const seeded = (0, import_react.useRef)(null);
	const prefill = (next) => {
		seeded.current = next.id;
		selectCoin(next);
		const holding = holdings.find((h) => h.coinId === next.id);
		if (holding) {
			set("quantity", String(holding.quantity));
			set("purchasePrice", String(holding.averageBuyPrice));
		}
	};
	(0, import_react.useEffect)(() => {
		if (!coinParam || seeded.current === coinParam) return;
		if (coin && coin.id === coinParam) prefill(coin);
	}, [coinParam, coin]);
	const hasResult = (result?.investment ?? 0) > 0 && (targetPrice ?? 0) > 0;
	const addQuickCap = (amount) => {
		addScenario(Math.round((targetMarketCap ?? currentMarketCap ?? 0) + amount));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Profit Calculator",
		subtitle: "Work out what your bag is worth at any price — or any market cap — before you need it.",
		actions: coin && targetPrice !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			onClick: () => openAlertDialog({
				coin,
				defaultTargetPrice: targetPrice
			}),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }),
				" Alert me at ",
				formatPrice(targetPrice)
			]
		}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass rounded-2xl p-5 lg:col-span-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "flex items-center gap-2 font-display text-lg font-semibold",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "size-4 text-primary" }),
								" Your position",
								pending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin text-muted-foreground" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs text-muted-foreground",
										children: "Coin"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setPickerOpen(true),
										className: "flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg border border-input bg-surface/50 px-3 transition-colors hover:bg-surface",
										children: [coin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
												coin,
												size: 26
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium",
												children: coin.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "secondary",
												className: "text-[10px]",
												children: coin.symbol
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "num ml-auto text-sm text-muted-foreground",
												children: formatPrice(coin.price)
											})
										] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm text-muted-foreground",
											children: fields.coinId ? fields.coinId : "Search for a coin…"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: "size-4 shrink-0 text-muted-foreground" })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs text-muted-foreground",
											htmlFor: "calc-qty",
											children: "Coins held"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "calc-qty",
											type: "number",
											inputMode: "decimal",
											step: "any",
											className: "num h-11",
											value: fields.quantity,
											onChange: (e) => set("quantity", e.target.value),
											placeholder: "0"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs text-muted-foreground",
											htmlFor: "calc-buy",
											children: "Avg buy price"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "calc-buy",
											type: "number",
											inputMode: "decimal",
											step: "any",
											className: "num h-11",
											value: fields.purchasePrice,
											onChange: (e) => set("purchasePrice", e.target.value),
											placeholder: "optional"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs text-muted-foreground",
											htmlFor: "calc-current",
											children: "Current price"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] text-muted-foreground",
											children: fields.currentPrice ? "manual" : "live feed"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "calc-current",
										type: "number",
										inputMode: "decimal",
										step: "any",
										className: "num h-11",
										value: fields.currentPrice,
										onChange: (e) => set("currentPrice", e.target.value),
										placeholder: coin ? String(coin.price) : "auto"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-border bg-surface/40 p-3.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
										value: fields.mode,
										onValueChange: (v) => set("mode", v),
										className: "w-full",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
											className: "w-full",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
												value: "PRICE",
												className: "flex-1",
												children: "Target price"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
												value: "MARKET_CAP",
												className: "flex-1",
												children: "Target market cap"
											})]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3.5",
										children: fields.mode === "PRICE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs text-muted-foreground",
													htmlFor: "calc-target-price",
													children: "Target price"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "calc-target-price",
													type: "number",
													inputMode: "decimal",
													step: "any",
													className: "num h-11",
													value: fields.targetPrice,
													onChange: (e) => set("targetPrice", e.target.value),
													placeholder: "0.001"
												}),
												targetMarketCap !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "num text-[11px] text-muted-foreground",
													children: [
														"= ",
														formatCompact(targetMarketCap),
														" market cap"
													]
												})
											]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs text-muted-foreground",
													htmlFor: "calc-target-cap",
													children: "Target market cap"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "calc-target-cap",
													type: "number",
													inputMode: "decimal",
													step: "any",
													className: "num h-11",
													value: fields.targetMarketCap,
													onChange: (e) => set("targetMarketCap", e.target.value),
													placeholder: "10,000,000"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "num text-[11px] text-muted-foreground",
													children: [
														"Implied price ",
														formatPrice(targetPrice),
														" ",
														coin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["per ", coin.symbol] })
													]
												})
											]
										})
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 rounded-xl border border-border bg-surface/40 p-3.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-semibold",
									children: "Supply"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
									className: "mt-2.5 grid grid-cols-3 gap-2 text-center",
									children: [
										{
											label: "Circulating",
											value: formatSupply(coin?.circulatingSupply)
										},
										{
											label: "Total",
											value: formatSupply(coin?.totalSupply)
										},
										{
											label: "Max",
											value: coin?.maxSupply ? formatSupply(coin.maxSupply) : "∞"
										}
									].map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-border bg-background/40 p-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-[10px] uppercase tracking-wider text-muted-foreground",
											children: row.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "num mt-0.5 text-sm font-semibold",
											children: row.value
										})]
									}, row.label))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: cn("mt-2.5 flex gap-1.5 text-[11px]", supplyEstimated ? "text-warn" : "text-muted-foreground"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "mt-px size-3.5 shrink-0" }), supplyNote ?? (supply !== void 0 ? `Using a circulating supply of ${formatSupply(supply)} — the correct denominator for market cap.` : "No circulating supply reported for this coin. Enter one below to work in market caps.")]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2.5 space-y-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "text-xs text-muted-foreground",
											htmlFor: "calc-supply",
											children: ["Circulating supply ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground/70",
												children: "(optional)"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "calc-supply",
											type: "number",
											inputMode: "decimal",
											step: "any",
											className: "num h-10",
											value: fields.supplyOverride,
											onChange: (e) => set("supplyOverride", e.target.value),
											placeholder: coin?.circulatingSupply ? String(coin.circulatingSupply) : "e.g. 1000000000"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-muted-foreground",
											children: "Leave blank to use the reported supply. A number here overrides it and marks the result an estimate."
										})
									]
								})
							]
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2.5 text-sm text-warn",
							children: [error, hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block text-warn/80",
								children: hint
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 lg:col-span-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "glass relative overflow-hidden rounded-2xl p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute inset-0",
							style: { background: "radial-gradient(560px 260px at 80% 0%, oklch(0.62 0.19 268 / 0.16), transparent 70%)" }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground md:text-base",
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
											className: "num text-lg font-bold text-profit md:text-xl",
											children: formatUsd(result?.targetValue)
										}),
										coin && fields.mode === "MARKET_CAP" && targetMarketCap !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											" ",
											"at a",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "num text-foreground",
												children: formatCompact(targetMarketCap)
											}),
											" ",
											"market cap (",
											formatPrice(targetPrice),
											" per ",
											coin.symbol,
											")"
										] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 grid grid-cols-2 gap-3 md:grid-cols-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
											label: "Initial Investment",
											value: formatUsd(result?.investment)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
											label: "Current Holdings Value",
											value: formatUsd(result?.currentValue),
											sub: `@ ${formatPrice(currentPrice)}`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
											label: "Target Holdings Value",
											value: formatUsd(result?.targetValue),
											tone: "primary",
											sub: `@ ${formatPrice(targetPrice)}`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
											label: "Profit",
											value: `${isGain(result?.profit) ? "+" : ""}${formatUsd(result?.profit)}`,
											tone: isGain(result?.profit) ? "profit" : "loss",
											sub: "target − investment"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
											label: "ROI",
											value: formatPercent(result?.roi),
											tone: isGain(result?.roi) ? "profit" : "loss",
											sub: "profit ÷ investment"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
											label: "Multiple",
											value: result?.multiple == null ? "—" : `${formatNumber(result.multiple, 2)}x`,
											tone: "warn",
											sub: "target ÷ investment"
										})
									]
								}),
								costBasisNote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 flex gap-1.5 text-[11px] text-warn",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "mt-px size-3.5 shrink-0" }), costBasisNote]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "num rounded-full border border-border bg-surface/60 px-2.5 py-1",
											children: [
												"Unrealised now:",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: isGain(result?.unrealizedProfit) ? "text-profit" : "text-loss",
													children: formatUsd(result?.unrealizedProfit)
												})
											]
										}),
										currentMarketCap !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "num rounded-full border border-border bg-surface/60 px-2.5 py-1",
											children: ["Current cap ", formatCompact(currentMarketCap)]
										}),
										hasResult && coin && targetPrice !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											className: "ml-auto",
											onClick: () => openAlertDialog({
												coin,
												defaultTargetPrice: targetPrice
											}),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-3.5" }),
												" Wake me at ",
												formatPrice(targetPrice)
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HowCalculated, {
									className: "mt-4",
									rows: [
										...fields.mode === "MARKET_CAP" ? [{
											label: "Target Price (from market cap)",
											formula: "Target Market Cap ÷ Circulating Supply",
											result: `${formatCompact(targetMarketCap)} ÷ ${formatSupply(supply)} = ${formatPrice(targetPrice)}`
										}] : [],
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
										},
										{
											label: "Multiple",
											formula: "Target Holdings Value ÷ Initial Investment",
											result: result?.multiple == null ? "—" : `${formatNumber(result.multiple, 2)}x`
										}
									]
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "glass rounded-2xl p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "flex items-center gap-2 font-display text-lg font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-4 text-profit" }), " Portfolio value vs market cap"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: [
									"X axis: market cap · Y axis: what your ",
									coin?.symbol ?? "position",
									" is worth."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScenarioChart, {
									points: scenarios.map((s) => ({
										marketCap: s.marketCap,
										value: s.value
									})),
									...currentMarketCap === void 0 ? {} : { currentMarketCap },
									...result?.currentValue === void 0 ? {} : { currentValue: result.currentValue }
								})
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "glass mt-5 rounded-2xl p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-semibold",
							children: "Market-cap scenarios"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"What each valuation is worth to you, at a supply of ",
								formatSupply(supply),
								supplyEstimated && " (estimated)",
								"."
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap items-center gap-1.5",
							children: QUICK_CAPS.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								className: "num",
								disabled: scenarioFull,
								onClick: () => addQuickCap(q.amount),
								children: q.label
							}, q.label))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3.5 flex gap-2",
						onSubmit: (e) => {
							e.preventDefault();
							const parsed = Number(customCap.replace(/,/g, ""));
							if (!Number.isFinite(parsed) || parsed <= 0) {
								toast.error("Enter a market cap greater than zero");
								return;
							}
							if (scenarioFull) {
								toast.error("That's as many scenarios as the table holds", { description: "Remove one to add another." });
								return;
							}
							addScenario(parsed);
							setCustomCap("");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							inputMode: "decimal",
							step: "any",
							className: "num h-10 max-w-56",
							value: customCap,
							onChange: (e) => setCustomCap(e.target.value),
							placeholder: "Custom market cap…",
							"aria-label": "Custom market cap"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							variant: "outline",
							className: "h-10",
							disabled: scenarioFull,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add scenario"]
						})]
					}),
					scenarios.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 rounded-lg border border-border bg-surface/40 px-3 py-2.5 text-sm text-muted-foreground",
						children: coin || fields.coinId ? "No scenarios to show yet. Add a market cap above, or enter a circulating supply if this coin doesn't report one." : "Pick a coin to see what each market cap is worth to you."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 -mx-5 overflow-x-auto px-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[640px] text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 font-medium",
										children: "Market cap"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 font-medium",
										children: "Price"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 text-right font-medium",
										children: "Your value"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 text-right font-medium",
										children: "Profit"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 text-right font-medium",
										children: "ROI"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 text-right font-medium",
										children: "Multiple"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-10 py-2" })
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: scenarios.map((s) => {
								const reached = (currentMarketCap ?? 0) >= s.marketCap;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: cn("border-b border-border/60 transition-colors hover:bg-surface/50", reached && "bg-profit/[0.06]"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "num py-2.5 pr-3 font-semibold",
											children: [formatCompact(s.marketCap), reached && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "ml-2 border-profit/40 bg-profit/10 text-[10px] text-profit",
												children: "passed"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "num py-2.5 pr-3 text-muted-foreground",
											children: formatPrice(s.targetPrice)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "num py-2.5 pr-3 text-right font-semibold",
											children: formatUsd(s.value)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: cn("num py-2.5 pr-3 text-right font-medium", isGain(s.profit) ? "text-profit" : "text-loss"),
											children: [isGain(s.profit) ? "+" : "", formatUsd(s.profit)]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: cn("num py-2.5 pr-3 text-right", isGain(s.roi) ? "text-profit" : "text-loss"),
											children: formatPercent(s.roi)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "num py-2.5 pr-3 text-right text-warn",
											children: s.multiple == null ? "—" : `${formatNumber(s.multiple, 2)}x`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2.5 text-right",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												size: "icon",
												className: "size-8 text-muted-foreground hover:text-loss",
												onClick: () => removeScenario(s.marketCap),
												"aria-label": `Remove ${formatCompact(s.marketCap)} scenario`,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
											})
										})
									]
								}, s.marketCap);
							}) })]
						})
					}),
					disclaimer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground",
						children: disclaimer
					})
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
//#endregion
export { CalculatorPage as component };
