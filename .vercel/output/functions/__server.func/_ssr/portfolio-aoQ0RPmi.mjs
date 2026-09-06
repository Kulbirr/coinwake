import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { F as Coins, G as Calculator, K as Bell, n as Wallet, o as TrendingUp, s as Trash2, y as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as formatNumber, C as cn, M as formatPrice, P as formatUsd, X as useStore, a as CoinSearchDialog, c as DialogContent, d as DialogHeader, f as DialogTitle, i as CoinLogo, j as formatPercent, l as DialogDescription, o as Delta, p as Signed, r as Button, s as Dialog, u as DialogFooter } from "./theme-DXxfDXZX.mjs";
import { n as Label, t as Input } from "./label-SOE_QdsM.mjs";
import { r as useAppUi } from "./app-ui-S8GmjT34.mjs";
import { t as Badge } from "./badge-CgxlUbIx.mjs";
import { t as AppShell } from "./AppShell-B6uWFBnx.mjs";
import { t as StatCard } from "./StatCard-C9FCMGPh.mjs";
import { t as PriceValue } from "./PriceValue-DwIw6OrC.mjs";
import { t as CoinSparkline } from "./Sparkline-DQ-7B6aF.mjs";
import { t as Route } from "./portfolio-DYZmOnb-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portfolio-aoQ0RPmi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
var today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
function AddHoldingDialog({ open, onOpenChange, coinId: initialCoinId }) {
	const { coins, addHolding } = useStore();
	const [coinId, setCoinId] = (0, import_react.useState)(initialCoinId ?? "bitcoin");
	const [pickerOpen, setPickerOpen] = (0, import_react.useState)(false);
	const [quantity, setQuantity] = (0, import_react.useState)("");
	const [buyPrice, setBuyPrice] = (0, import_react.useState)("");
	const [purchaseDate, setPurchaseDate] = (0, import_react.useState)(today);
	const [exchange, setExchange] = (0, import_react.useState)("");
	const [wallet, setWallet] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const coin = (0, import_react.useMemo)(() => coins.find((c) => c.id === coinId), [coins, coinId]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const next = initialCoinId ?? coinId;
		setCoinId(next);
		const seed = coins.find((c) => c.id === next);
		setQuantity("");
		setBuyPrice(seed ? String(Number(seed.price.toPrecision(6))) : "");
		setPurchaseDate(today());
		setExchange("");
		setWallet("");
		setNotes("");
	}, [open, initialCoinId]);
	const qty = Number(quantity) || 0;
	const price = Number(buyPrice) || 0;
	const invested = qty * price;
	const valid = Boolean(coin) && qty > 0 && price > 0 && Boolean(purchaseDate);
	const submit = async () => {
		if (!coin || !valid) return;
		setSaving(true);
		const saved = await addHolding({
			coinId: coin.id,
			quantity: qty,
			averageBuyPrice: price,
			purchaseDate,
			...exchange.trim() ? { exchange: exchange.trim() } : {},
			...wallet.trim() ? { wallet: wallet.trim() } : {},
			...notes.trim() ? { notes: notes.trim() } : {}
		});
		setSaving(false);
		if (!saved) return;
		toast.success(`Added ${qty} ${coin.symbol}`, { description: `${formatUsd(invested)} invested at ${formatPrice(price)}.` });
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[92vh] max-w-md overflow-y-auto rounded-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2 font-display text-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-5 text-primary" }), " Add holding"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "We'll track its value, profit and ROI against the live feed from here." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Coin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setPickerOpen(true),
								className: "flex w-full cursor-pointer items-center gap-3 rounded-xl border border-input bg-surface/50 px-3 py-2.5 text-left transition-colors hover:bg-surface",
								children: coin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
										coin,
										size: 32
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "truncate text-sm font-semibold",
											children: coin.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs text-muted-foreground",
											children: [
												coin.symbol,
												" · ",
												formatPrice(coin.price)
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-primary",
										children: "Change"
									})
								] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted-foreground",
									children: "Search coin…"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "hold-qty",
									children: "Quantity"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "hold-qty",
									type: "number",
									inputMode: "decimal",
									step: "any",
									className: "num h-11",
									value: quantity,
									onChange: (e) => setQuantity(e.target.value),
									placeholder: "0.5"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "hold-price",
									children: "Avg buy price"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "hold-price",
									type: "number",
									inputMode: "decimal",
									step: "any",
									className: "num h-11",
									value: buyPrice,
									onChange: (e) => setBuyPrice(e.target.value),
									placeholder: "61200"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "hold-date",
								children: "Purchase date"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "hold-date",
								type: "date",
								className: "num h-11",
								value: purchaseDate,
								max: today(),
								onChange: (e) => setPurchaseDate(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "hold-exchange",
									children: "Exchange (optional)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "hold-exchange",
									className: "h-11",
									value: exchange,
									onChange: (e) => setExchange(e.target.value),
									placeholder: "Coinbase"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "hold-wallet",
									children: "Wallet (optional)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "hold-wallet",
									className: "h-11",
									value: wallet,
									onChange: (e) => setWallet(e.target.value),
									placeholder: "Phantom"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "hold-notes",
								children: "Notes (optional)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "hold-notes",
								rows: 2,
								value: notes,
								onChange: (e) => setNotes(e.target.value),
								placeholder: "Low cap moonshot"
							})]
						}),
						invested > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-primary/25 bg-primary/[0.06] px-3.5 py-2.5 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Total invested"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "num ml-2 font-semibold",
									children: formatUsd(invested)
								}),
								coin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "num ml-2 text-xs text-muted-foreground",
									children: [
										"· worth ",
										formatUsd(qty * coin.price),
										" today"
									]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "h-11 w-full",
					disabled: !valid || saving,
					onClick: () => void submit(),
					children: saving ? "Adding…" : "Add to portfolio"
				}) })
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinSearchDialog, {
		open: pickerOpen,
		onOpenChange: setPickerOpen,
		onSelect: (c) => {
			setCoinId(c.id);
			setBuyPrice(String(Number(c.price.toPrecision(6))));
		},
		title: "Pick a coin"
	})] });
}
function Portfolio() {
	const { add } = Route.useSearch();
	const { portfolio, removeHolding } = useStore();
	const { openAlertDialog } = useAppUi();
	const [addOpen, setAddOpen] = (0, import_react.useState)(false);
	const [addCoinId, setAddCoinId] = (0, import_react.useState)(void 0);
	/** Arriving from "Add to Portfolio" on a coin page opens the form pre-filled. */
	(0, import_react.useEffect)(() => {
		if (!add) return;
		setAddCoinId(add);
		setAddOpen(true);
	}, [add]);
	const rows = (0, import_react.useMemo)(() => portfolio.rows.slice().sort((a, b) => b.value - a.value), [portfolio.rows]);
	const best = rows.reduce((top, row) => !top || row.roi > top.roi ? row : top, void 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "My Portfolio",
		subtitle: "Live value, profit and ROI across every position you hold.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			onClick: () => {
				setAddCoinId(void 0);
				setAddOpen(true);
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add holding"]
		}),
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
						sub: `${rows.length} ${rows.length === 1 ? "position" : "positions"}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Invested",
						value: formatUsd(portfolio.invested),
						icon: Coins,
						sub: "cost basis"
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
						sub: best?.coin ? `best: ${best.coin.symbol} ${formatPercent(best.roi)}` : "since entry"
					})
				]
			}),
			rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass mt-5 rounded-2xl px-6 py-14 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto grid size-12 place-items-center rounded-2xl bg-surface",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-5 text-muted-foreground" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-4 font-display text-lg font-semibold",
						children: "No holdings yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground",
						children: "Add your first position and we'll track its value, profit and ROI against the live market — then wake you when it hits your target."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-5",
						onClick: () => {
							setAddCoinId(void 0);
							setAddOpen(true);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add holding"]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "glass mt-5 hidden rounded-2xl p-5 lg:block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Positions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[900px] text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 pr-3 font-medium",
									children: "Coin"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 pr-3 font-medium",
									children: "Holdings"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 pr-3 font-medium",
									children: "Avg buy"
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
									className: "py-2 pr-3 text-right font-medium",
									children: "Invested"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 pr-3 text-right font-medium",
									children: "Value"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 pr-3 text-right font-medium",
									children: "Profit"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 pr-3 text-right font-medium",
									children: "ROI"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-28 py-2" })
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map(({ holding, coin, value, invested, profit, roi }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/60 transition-colors hover:bg-surface/50",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 pr-3",
									children: coin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
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
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: holding.coinId
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "num py-3 pr-3",
									children: formatNumber(holding.quantity, 6)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "num py-3 pr-3 text-muted-foreground",
									children: formatPrice(holding.averageBuyPrice)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 pr-3",
									children: coin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceValue, {
										value: coin.price,
										className: "text-sm"
									}) : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 pr-3",
									children: coin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
										value: coin.change24h,
										arrow: false
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "num py-3 pr-3 text-right text-muted-foreground",
									children: formatUsd(invested)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "num py-3 pr-3 text-right font-semibold",
									children: formatUsd(value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: cn("num py-3 pr-3 text-right font-medium", profit >= 0 ? "text-profit" : "text-loss"),
									children: [profit >= 0 ? "+" : "", formatUsd(profit)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: cn("num py-3 pr-3 text-right", roi >= 0 ? "text-profit" : "text-loss"),
									children: formatPercent(roi)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-end gap-1",
										children: [coin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon",
											className: "size-8",
											"aria-label": `Set alert for ${coin.symbol}`,
											onClick: () => openAlertDialog({ coin }),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											asChild: true,
											variant: "ghost",
											size: "icon",
											className: "size-8",
											"aria-label": `Calculate target for ${coin.symbol}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/calculator",
												search: { coin: coin.id },
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "size-4" })
											})
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon",
											className: "size-8 text-muted-foreground hover:text-loss",
											"aria-label": "Remove holding",
											onClick: () => {
												removeHolding(holding.id);
												toast.success("Holding removed");
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
										})]
									})
								})
							]
						}, holding.id)) })]
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid gap-3 sm:grid-cols-2 lg:hidden",
				children: rows.map(({ holding, coin, value, invested, profit, roi }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass rounded-2xl p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [
								coin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/coin/$coinId",
									params: { coinId: coin.id },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLogo, {
										coin,
										size: 40
									})
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-10 rounded-full bg-muted" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold",
											children: coin?.symbol ?? holding.coinId
										}), coin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
											value: coin.change24h,
											arrow: false
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "num text-xs text-muted-foreground",
										children: [
											formatNumber(holding.quantity, 6),
											" @ ",
											formatPrice(holding.averageBuyPrice)
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "num font-semibold",
										children: formatUsd(value)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: cn("num text-xs", profit >= 0 ? "text-profit" : "text-loss"),
										children: [
											profit >= 0 ? "+" : "",
											formatUsd(profit),
											" · ",
											formatPercent(roi)
										]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex items-center gap-3",
							children: [coin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinSparkline, {
								coinId: coin.id,
								width: 96,
								height: 28
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "num ml-auto text-right text-xs text-muted-foreground",
								children: ["invested ", formatUsd(invested)]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
							children: [
								holding.exchange && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									children: holding.exchange
								}),
								holding.wallet && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									children: holding.wallet
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "num",
									children: ["bought ", holding.purchaseDate]
								})
							]
						}),
						holding.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs italic text-muted-foreground",
							children: holding.notes
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex gap-2",
							children: [coin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								className: "flex-1",
								onClick: () => openAlertDialog({ coin }),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-3.5" }), " Set Alert"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								variant: "outline",
								className: "flex-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/calculator",
									search: { coin: coin.id },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "size-3.5" }), " Calculate Target"]
								})
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "size-9 shrink-0 text-muted-foreground hover:text-loss",
								"aria-label": "Remove holding",
								onClick: () => {
									removeHolding(holding.id);
									toast.success("Holding removed");
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})]
						})
					]
				}, holding.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddHoldingDialog, {
				open: addOpen,
				onOpenChange: setAddOpen,
				coinId: addCoinId
			})
		]
	});
}
//#endregion
export { Portfolio as component };
